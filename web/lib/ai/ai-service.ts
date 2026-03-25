/**
 * Universal AI Service (Multi-Provider LLM Router)
 *
 * Transplanted from Invisible Pipeline's ai-service.ts (~440 lines)
 *
 * THE plumbing layer. Every intelligence service that calls an LLM
 * goes through this. Handles:
 *   - Multi-provider routing (Anthropic → OpenAI → Gemini)
 *   - Model ID normalization (display names → real API IDs)
 *   - Retry with validation feedback
 *   - Timing + token tracking
 *   - Graceful fallback across providers
 *
 * Original: IP's callAI with extension-specific prefs + DM validation
 * Universal: Clean provider router with config-driven settings
 */

// ============================================================================
// TYPES
// ============================================================================

export type AIProvider = "anthropic" | "openai" | "gemini";

export interface AIResponse {
  content: string;
  provider: string;
  model: string;
  timing?: {
    aiCallTimeMs: number;
    totalTimeMs: number;
  };
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AICallOptions {
  maxTokens?: number;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  /** Provider priority order. Default: ["anthropic", "openai", "gemini"] */
  providerOrder?: AIProvider[];
  /** API keys — if not provided, falls back to env vars */
  apiKeys?: {
    anthropic?: string;
    openai?: string;
    gemini?: string;
  };
  /** Optional validator — if it returns a string, that's the error and we retry */
  validator?: (content: string) => string | null;
  /** Max validation retries (default: 2) */
  maxRetries?: number;
  /** Logging context — app-specific, stored in execution log */
  loggingContext?: Record<string, any>;
}

// ============================================================================
// MODEL NORMALIZATION
// ============================================================================

/**
 * Map display names to real API IDs.
 * Anthropic requires full IDs with date stamps.
 */
function normalizeModelId(
  model: string | undefined,
  provider: AIProvider
): string {
  if (!model) return "";

  if (provider === "anthropic") {
    const map: Record<string, string> = {
      "claude-haiku-4.5": "claude-haiku-4-5-20251001",
      "claude-sonnet-4.5": "claude-sonnet-4-5-20250929",
      "claude-opus-4.5": "claude-opus-4-5-20251101",
      "claude-sonnet-4": "claude-sonnet-4-20250514",
      "claude-3-5-haiku": "claude-3-5-haiku-20241022",
      "claude-3-5-sonnet": "claude-3-5-sonnet-20241022",
      "claude-3-haiku": "claude-3-haiku-20240307",
      "claude-3-sonnet": "claude-3-sonnet-20240229",
      "claude-3-opus": "claude-3-opus-20240229",
    };
    if (map[model]) return map[model];
    if (model.match(/\d{8}$/)) return model;
    if (model.includes("haiku") && model.includes("4"))
      return "claude-haiku-4-5-20251001";
    if (model.includes("haiku")) return "claude-3-5-haiku-20241022";
    if (model.includes("sonnet") && model.includes("4"))
      return "claude-sonnet-4-5-20250929";
    if (model.includes("sonnet")) return "claude-3-5-sonnet-20241022";
    if (model.includes("opus")) return "claude-sonnet-4-5-20250929";
    return "claude-haiku-4-5-20251001";
  }

  if (provider === "openai") {
    if (
      model.startsWith("gpt-5") ||
      model.startsWith("gpt-4") ||
      model.startsWith("o1")
    )
      return model;
    if (model.includes("gpt-5")) return "gpt-5.1";
    if (model.includes("gpt-4o")) return "gpt-4o";
    if (model.includes("gpt-4")) return "gpt-4-turbo";
    return "gpt-5.1";
  }

  if (provider === "gemini") {
    const map: Record<string, string> = {
      "gemini-3-flash": "gemini-3-flash-preview",
      "gemini-3-flash-preview": "gemini-3-flash-preview",
      "gemini-3-pro": "gemini-3-pro-preview",
      "gemini-3-pro-preview": "gemini-3-pro-preview",
      "gemini-2.5-flash": "gemini-2.5-flash",
      "gemini-2.5-flash-lite": "gemini-2.5-flash-lite",
      "gemini-2.5-pro": "gemini-2.5-pro",
      "gemini-2.0-flash": "gemini-2.0-flash",
      "gemini-1.5-flash": "gemini-1.5-flash",
      "gemini-1.5-pro": "gemini-1.5-pro",
    };
    if (map[model]) return map[model];
    if (model.startsWith("gemini")) return model;
    if (model.includes("flash")) return "gemini-2.5-flash";
    if (model.includes("pro")) return "gemini-2.5-pro";
    return "gemini-2.0-flash";
  }

  return model;
}

// ============================================================================
// PROVIDER CALLERS (Thin wrappers — apps can swap these)
// ============================================================================

async function callAnthropic(
  prompt: string,
  model: string,
  maxTokens: number,
  apiKey: string,
  systemPrompt?: string,
  temperature?: number
): Promise<{ content: string; usage?: AIResponse["usage"] }> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    ...(systemPrompt ? { system: systemPrompt } : {}),
    ...(temperature !== undefined ? { temperature } : {}),
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  return {
    content: text,
    usage: {
      promptTokens: response.usage.input_tokens,
      completionTokens: response.usage.output_tokens,
      totalTokens: response.usage.input_tokens + response.usage.output_tokens,
    },
  };
}

async function callOpenAI(
  prompt: string,
  model: string,
  maxTokens: number,
  apiKey: string,
  systemPrompt?: string,
  temperature?: number
): Promise<{ content: string; usage?: AIResponse["usage"] }> {
  const OpenAI = (await import("openai")).default;
  const client = new OpenAI({ apiKey });

  const messages: any[] = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: prompt });

  const response = await client.chat.completions.create({
    model,
    max_tokens: maxTokens,
    ...(temperature !== undefined ? { temperature } : {}),
    messages,
  });

  return {
    content: response.choices[0]?.message?.content || "",
    usage: response.usage
      ? {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens || 0,
          totalTokens: response.usage.total_tokens,
        }
      : undefined,
  };
}

async function callGemini(
  prompt: string,
  model: string,
  maxTokens: number,
  apiKey: string,
  systemPrompt?: string,
  temperature?: number
): Promise<{ content: string; usage?: AIResponse["usage"] }> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);

  const genModel = genAI.getGenerativeModel({
    model,
    ...(systemPrompt
      ? { systemInstruction: { role: "system", parts: [{ text: systemPrompt }] } }
      : {}),
    generationConfig: {
      maxOutputTokens: maxTokens,
      ...(temperature !== undefined ? { temperature } : {}),
    },
  });

  const result = await genModel.generateContent(prompt);
  const text = result.response.text();
  const usage = result.response.usageMetadata;

  return {
    content: text,
    usage: usage
      ? {
          promptTokens: usage.promptTokenCount || 0,
          completionTokens: usage.candidatesTokenCount || 0,
          totalTokens: usage.totalTokenCount || 0,
        }
      : undefined,
  };
}

// ============================================================================
// MAIN: callAI — The Universal Provider Router
// ============================================================================

/**
 * Call an LLM with automatic multi-provider fallback.
 *
 * Priority: explicit model → provider order → fallback
 * Retries: Optional validator for quality gating
 */
export async function callAI(
  prompt: string,
  options: AICallOptions = {}
): Promise<AIResponse> {
  const startTime = Date.now();

  const {
    maxTokens = 4096,
    systemPrompt,
    temperature,
    validator,
    maxRetries = 2,
    apiKeys = {},
  } = options;

  // Resolve API keys: explicit > env
  const keys: Record<AIProvider, string | undefined> = {
    anthropic: apiKeys.anthropic || process.env.ANTHROPIC_API_KEY,
    openai: apiKeys.openai || process.env.OPENAI_API_KEY,
    gemini: apiKeys.gemini || process.env.GEMINI_API_KEY,
  };

  // Determine provider order
  let providerOrder: AIProvider[] = options.providerOrder || [
    "anthropic",
    "openai",
    "gemini",
  ];

  // If a specific model is requested, force that provider
  if (options.model) {
    if (options.model.startsWith("claude")) {
      providerOrder = ["anthropic"];
    } else if (
      options.model.startsWith("gpt") ||
      options.model.startsWith("o1")
    ) {
      providerOrder = ["openai"];
    } else if (options.model.startsWith("gemini")) {
      providerOrder = ["gemini"];
    }
  }

  // Build provider configs
  const providers = providerOrder.map((id) => ({
    id,
    key: keys[id],
    model: normalizeModelId(
      options.model || getDefaultModel(id),
      id
    ),
  }));

  let lastError: Error | null = null;

  for (const provider of providers) {
    if (!provider.key) continue;

    try {
      let response: { content: string; usage?: AIResponse["usage"] } =
        {} as any;
      const aiCallStart = Date.now();

      // Retry loop with optional validation
      let attempts = 0;
      let currentPrompt = prompt;
      let validationError: string | null = null;

      while (attempts < maxRetries) {
        const promptToUse = validationError
          ? `${currentPrompt}\n\nPREVIOUS ATTEMPT REJECTED: ${validationError}. Fix this.`
          : currentPrompt;

        if (provider.id === "anthropic") {
          response = await callAnthropic(
            promptToUse,
            provider.model,
            maxTokens,
            provider.key!,
            systemPrompt,
            temperature
          );
        } else if (provider.id === "gemini") {
          response = await callGemini(
            promptToUse,
            provider.model,
            maxTokens,
            provider.key!,
            systemPrompt,
            temperature
          );
        } else {
          response = await callOpenAI(
            promptToUse,
            provider.model,
            maxTokens,
            provider.key!,
            systemPrompt,
            temperature
          );
        }

        // Validate if validator provided
        if (validator) {
          const error = validator(response.content);
          if (error) {
            validationError = error;
            attempts++;
            if (attempts >= maxRetries) break;
            continue;
          }
        }

        break; // Success
      }

      const aiCallTime = Date.now() - aiCallStart;
      const totalTime = Date.now() - startTime;

      return {
        content: response.content,
        provider: provider.id,
        model: provider.model,
        timing: {
          aiCallTimeMs: aiCallTime,
          totalTimeMs: totalTime,
        },
        usage: response.usage,
      };
    } catch (error) {
      console.error(`[AI Service] Error with ${provider.id}:`, error);
      lastError = error as Error;
    }
  }

  throw (
    lastError ||
    new Error(
      "No AI providers available or all failed. Check API keys."
    )
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function getDefaultModel(provider: AIProvider): string {
  switch (provider) {
    case "anthropic":
      return "claude-haiku-4-5-20251001";
    case "openai":
      return "gpt-5.1";
    case "gemini":
      return "gemini-2.0-flash";
  }
}

/**
 * Quick helper for fast/cheap AI calls (classification, extraction).
 * Uses the cheapest available model.
 */
export async function callAIFast(
  prompt: string,
  options: Omit<AICallOptions, "model"> = {}
): Promise<AIResponse> {
  return callAI(prompt, {
    ...options,
    model: "claude-haiku-4-5-20251001",
    maxTokens: options.maxTokens || 1024,
  });
}

/**
 * Helper for structured JSON output.
 * Adds JSON instruction to system prompt and parses result.
 */
export async function callAIJSON<T = any>(
  prompt: string,
  options: AICallOptions = {}
): Promise<{ data: T; raw: AIResponse }> {
  const systemPrompt = [
    options.systemPrompt || "",
    "Return ONLY valid JSON. No markdown, no backticks, no explanation.",
  ]
    .filter(Boolean)
    .join("\n\n");

  const response = await callAI(prompt, {
    ...options,
    systemPrompt,
    maxTokens: options.maxTokens || 4096,
  });

  // Extract JSON from response
  const jsonMatch = response.content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("[AI Service] No JSON found in response");
  }

  const data = JSON.parse(jsonMatch[0]) as T;
  return { data, raw: response };
}
