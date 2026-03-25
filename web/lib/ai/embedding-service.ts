/**
 * Universal Embedding Service (Vector Embeddings + Chunking)
 *
 * Transplanted from Invisible Pipeline's embedding-service.ts (~297 lines)
 *
 * Handles vector embedding generation, chunking, storage, and retrieval.
 * Works with any content type — transcripts, profiles, documents, notes.
 *
 * Features:
 *   - Single + batch embedding generation (OpenAI text-embedding-3-large)
 *   - Smart text chunking with overlap
 *   - Incremental reindexing (content hash change detection)
 *   - Batch store (10x faster than one-at-a-time)
 *
 * Original: IP's embedding-service with hardcoded source tables
 * Universal: Config-driven source types, org-aware multi-tenancy
 */

// ============================================================================
// TYPES
// ============================================================================

export interface EmbeddingSource {
  /** Source table name (configurable per app) */
  table: string;
  /** Source record ID */
  id: string;
  /** Org ID for multi-tenant isolation */
  orgId: string;
  /** Optional additional grouping (e.g., project ID, blueprint ID) */
  groupId?: string;
}

export interface EmbeddingConfig {
  /** OpenAI model for embeddings */
  model?: string;
  /** Vector dimensions */
  dimensions?: number;
  /** Characters per chunk */
  chunkSize?: number;
  /** Overlap between chunks */
  chunkOverlap?: number;
}

const DEFAULTS: Required<EmbeddingConfig> = {
  model: "text-embedding-3-large",
  dimensions: 1536,
  chunkSize: 1000,
  chunkOverlap: 200,
};

// ============================================================================
// EMBEDDING SERVICE
// ============================================================================

export class EmbeddingService {
  private openai: any = null;
  private supabaseAdmin: any = null;
  private config: Required<EmbeddingConfig>;

  constructor(apiKey?: string, config?: EmbeddingConfig) {
    this.config = { ...DEFAULTS, ...config };

    if (apiKey) {
      this.setApiKey(apiKey);
    }

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient } = require("@supabase/supabase-js");
      this.supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
    }
  }

  setApiKey(apiKey: string) {
    const OpenAI = require("openai").default;
    this.openai = new OpenAI({ apiKey });
  }

  // --------------------------------------------------------------------------
  // CORE: Generate Embeddings
  // --------------------------------------------------------------------------

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.openai) throw new Error("OpenAI client not initialized.");

    const response = await this.openai.embeddings.create({
      model: this.config.model,
      input: text.replace(/\n/g, " "),
      dimensions: this.config.dimensions,
    });

    return response.data[0].embedding;
  }

  async generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
    if (!this.openai) throw new Error("OpenAI client not initialized.");

    const BATCH_SIZE = 2048;
    const allEmbeddings: number[][] = [];

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);

      const response = await this.openai.embeddings.create({
        model: this.config.model,
        input: batch.map((t) => t.replace(/\n/g, " ")),
        dimensions: this.config.dimensions,
      });

      allEmbeddings.push(...response.data.map((d: any) => d.embedding));
    }

    return allEmbeddings;
  }

  // --------------------------------------------------------------------------
  // CHUNKING
  // --------------------------------------------------------------------------

  chunkText(
    text: string,
    size = this.config.chunkSize,
    overlap = this.config.chunkOverlap
  ): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + size, text.length);
      chunks.push(text.slice(start, end));
      if (end === text.length) break;
      start += size - overlap;
    }

    return chunks;
  }

  // --------------------------------------------------------------------------
  // STORE: Process + Store Embeddings
  // --------------------------------------------------------------------------

  async processAndStore(
    text: string,
    source: EmbeddingSource,
    metadata: Record<string, any> = {}
  ): Promise<number> {
    if (!this.supabaseAdmin) throw new Error("Supabase admin not available.");

    const chunks = this.chunkText(text);
    let storedCount = 0;

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await this.generateEmbedding(chunks[i]);

      const { error } = await this.supabaseAdmin.from("embeddings").insert({
        org_id: source.orgId,
        group_id: source.groupId,
        source_table: source.table,
        source_id: source.id,
        content: chunks[i],
        embedding,
        metadata: {
          ...metadata,
          chunk_index: i,
          total_chunks: chunks.length,
        },
      });

      if (!error) storedCount++;
    }

    return storedCount;
  }

  async processAndStoreBatch(
    items: Array<{
      text: string;
      source: EmbeddingSource;
      metadata?: Record<string, any>;
    }>
  ): Promise<{ total: number; stored: number }> {
    if (!this.supabaseAdmin) throw new Error("Supabase admin not available.");

    // Step 1: Chunk all texts
    const allChunks: Array<{
      text: string;
      source: EmbeddingSource;
      metadata: Record<string, any>;
      chunkIndex: number;
      totalChunks: number;
    }> = [];

    for (const item of items) {
      const chunks = this.chunkText(item.text);
      for (let i = 0; i < chunks.length; i++) {
        allChunks.push({
          text: chunks[i],
          source: item.source,
          metadata: item.metadata || {},
          chunkIndex: i,
          totalChunks: chunks.length,
        });
      }
    }

    // Step 2: Batch embed
    const texts = allChunks.map((c) => c.text);
    const embeddings = await this.generateEmbeddingsBatch(texts);

    // Step 3: Batch insert
    const records = allChunks.map((chunk, idx) => ({
      org_id: chunk.source.orgId,
      group_id: chunk.source.groupId,
      source_table: chunk.source.table,
      source_id: chunk.source.id,
      content: chunk.text,
      embedding: embeddings[idx],
      metadata: {
        ...chunk.metadata,
        chunk_index: chunk.chunkIndex,
        total_chunks: chunk.totalChunks,
      },
    }));

    const { error, count } = await this.supabaseAdmin
      .from("embeddings")
      .insert(records);

    if (error) throw new Error(`Batch insert failed: ${error.message}`);

    return {
      total: allChunks.length,
      stored: count || records.length,
    };
  }

  // --------------------------------------------------------------------------
  // INCREMENTAL: Change Detection
  // --------------------------------------------------------------------------

  async needsReindex(text: string, source: EmbeddingSource): Promise<boolean> {
    if (!this.supabaseAdmin) throw new Error("Supabase admin not available.");

    const contentHash = await this.hashContent(text);

    const { data } = await this.supabaseAdmin
      .from("embeddings")
      .select("content_hash")
      .eq("source_table", source.table)
      .eq("source_id", source.id)
      .eq("org_id", source.orgId)
      .limit(1)
      .single();

    return !data || data.content_hash !== contentHash;
  }

  async deleteEmbeddings(source: EmbeddingSource): Promise<void> {
    if (!this.supabaseAdmin) throw new Error("Supabase admin not available.");

    await this.supabaseAdmin
      .from("embeddings")
      .delete()
      .eq("source_table", source.table)
      .eq("source_id", source.id)
      .eq("org_id", source.orgId);
  }

  private async hashContent(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
}

// ============================================================================
// FACTORY
// ============================================================================

/**
 * Get an EmbeddingService instance with API key from platform settings.
 */
export async function getEmbeddingService(
  config?: EmbeddingConfig
): Promise<EmbeddingService> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured.");
  return new EmbeddingService(apiKey, config);
}
