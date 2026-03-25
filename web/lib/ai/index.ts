/**
 * AI Infrastructure — Foundation Layer
 *
 * Provides the plumbing that the Intelligence Engine depends on.
 *
 * Usage:
 *   import { callAI, callAIFast, callAIJSON } from "@/lib/ai"
 *   import { EmbeddingService, getEmbeddingService } from "@/lib/ai"
 *   import { RAGService, getRAGService } from "@/lib/ai"
 */

// AI Service (Multi-Provider LLM Router)
export {
  callAI,
  callAIFast,
  callAIJSON,
} from "./ai-service";
export type {
  AIResponse,
  AICallOptions,
  AIProvider,
} from "./ai-service";

// Embedding Service (Vector Embeddings)
export {
  EmbeddingService,
  getEmbeddingService,
} from "./embedding-service";
export type {
  EmbeddingSource,
  EmbeddingConfig,
} from "./embedding-service";

// RAG Service (Retrieval-Augmented Generation)
export {
  RAGService,
  getRAGService,
} from "./rag-service";
export type {
  RetrievalResult,
  RetrievalOptions,
} from "./rag-service";
