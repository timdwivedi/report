/**
 * Universal RAG Service (Retrieval-Augmented Generation)
 *
 * Transplanted from Invisible Pipeline's rag-service.ts (~89 lines)
 *
 * Connects the "Brain" (embeddings) to the "Voice" (prompts).
 * Queries stored vector embeddings by semantic similarity and formats
 * results for prompt injection.
 *
 * Original: IP's RAG with user_id + blueprint_id filtering
 * Universal: Org-based multi-tenant filtering with optional grouping
 */

import { EmbeddingService } from "./embedding-service";

// ============================================================================
// TYPES
// ============================================================================

export interface RetrievalResult {
  content: string;
  similarity: number;
  sourceTable: string;
  metadata: any;
}

export interface RetrievalOptions {
  /** Optional group filter (e.g., project ID) */
  groupId?: string;
  /** Number of results to return (default: 5) */
  matchCount?: number;
  /** Minimum similarity threshold (default: 0.5) */
  threshold?: number;
  /** Filter by source table */
  sourceTable?: string;
}

// ============================================================================
// RAG SERVICE
// ============================================================================

export class RAGService {
  private supabaseAdmin: any;
  private embeddingService: EmbeddingService;

  constructor(apiKey: string) {
    this.embeddingService = new EmbeddingService(apiKey);

    const { createClient } = require("@supabase/supabase-js");
    this.supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Retrieve relevant chunks by semantic similarity.
   * Uses Supabase RPC `match_documents` (pgvector similarity search).
   */
  async retrieveContext(
    query: string,
    orgId: string,
    options: RetrievalOptions = {}
  ): Promise<RetrievalResult[]> {
    const {
      groupId,
      matchCount = 5,
      threshold = 0.5,
      sourceTable,
    } = options;

    // Convert query to embedding
    const queryEmbedding =
      await this.embeddingService.generateEmbedding(query);

    // Call RPC for similarity search
    const { data, error } = await this.supabaseAdmin.rpc("match_documents", {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: matchCount,
      filter_org_id: orgId,
      filter_group_id: groupId || null,
      filter_source_table: sourceTable || null,
    });

    if (error) {
      console.error("[RAG] Retrieval RPC failed:", error);
      return [];
    }

    return (data as any[]).map((item) => ({
      content: item.content,
      similarity: item.similarity,
      sourceTable: item.source_table,
      metadata: item.metadata,
    }));
  }

  /**
   * Format retrieved results into a string for prompt injection.
   */
  formatContextForPrompt(results: RetrievalResult[]): string {
    if (results.length === 0) return "No specific historical context found.";

    return results
      .map(
        (res, i) =>
          `--- Context #${i + 1} (Source: ${res.sourceTable}, Relevance: ${(res.similarity * 100).toFixed(0)}%) ---\n${res.content}`
      )
      .join("\n\n");
  }

  /**
   * One-shot: retrieve + format for prompt injection.
   */
  async getContextBlock(
    query: string,
    orgId: string,
    options: RetrievalOptions = {}
  ): Promise<string> {
    const results = await this.retrieveContext(query, orgId, options);
    return this.formatContextForPrompt(results);
  }
}

// ============================================================================
// FACTORY
// ============================================================================

export function getRAGService(): RAGService {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured.");
  return new RAGService(apiKey);
}
