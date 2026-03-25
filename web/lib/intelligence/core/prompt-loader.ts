/**
 * Universal Prompt Loader & DB Service
 *
 * Transplanted from Invisible Pipeline's loader.ts + db-service.ts (~1,014 lines)
 * Implements the 3-tier prompt resolution system:
 *   1. Custom Overrides (prompt_templates) ← HIGHEST PRIORITY
 *   2. Runtime Prompts (runtime_prompts) ← AI-generated per org
 *   3. Config Defaults (from intelligence config) ← FALLBACK
 *
 * Also handles: team member inheritance, usage tracking, and prompt caching.
 *
 * Original: Hybrid DB/filesystem prompt loading with priority chains in IP
 * Universal: Config-driven prompt resolution for ANY domain
 */

// ============================================================================
// TYPES
// ============================================================================

export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  description?: string;
  template_content: string;
  required_variables?: string[];
  is_active: boolean;
  target_user_id?: string;
  org_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CompiledPrompt {
  id: string;
  name: string;
  content: string;
  missing_variables: string[];
}

export interface PromptResolutionResult {
  prompt: PromptTemplate | null;
  source: "custom_override" | "runtime" | "config_default" | "none";
  runtimeId?: string;
}

// ============================================================================
// PROMPT CACHE (Short TTL for performance)
// ============================================================================

interface CacheEntry {
  data: PromptTemplate | null;
  source: PromptResolutionResult["source"];
  timestamp: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const promptCache = new Map<string, CacheEntry>();

export function invalidatePromptCache(key?: string): void {
  if (key) {
    promptCache.delete(key);
  } else {
    promptCache.clear();
  }
}

// ============================================================================
// MAIN PROMPT FETCHER (3-Tier Resolution)
// ============================================================================

/**
 * Fetch a prompt using the 3-tier priority system.
 *
 * Resolution order:
 *   1. Custom overrides (prompt_templates table) for this user/org
 *   2. Runtime prompts (runtime_prompts table) for this org
 *   3. Config defaults from intelligence config
 *
 * Supports team member inheritance: if user is a team member,
 * they inherit the org owner's custom overrides.
 *
 * @param supabase - Database client
 * @param promptName - Logical prompt name (e.g., "dm_firestarter", "scoring", "dna_extraction")
 * @param orgId - Organization ID
 * @param userId - User ID (for override resolution)
 * @param options - Additional options
 */
export async function fetchPrompt(
  supabase: any,
  promptName: string,
  orgId: string,
  userId: string,
  options?: {
    category?: string;
    skipCache?: boolean;
    configDefaults?: Record<string, string>;
  }
): Promise<PromptResolutionResult> {
  const cacheKey = `${orgId}:${userId}:${promptName}`;

  // Check cache
  if (!options?.skipCache) {
    const cached = promptCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return { prompt: cached.data, source: cached.source };
    }
  }

  try {
    // TIER 1: Custom overrides (prompt_templates)
    const override = await fetchCustomOverride(supabase, promptName, orgId, userId);
    if (override) {
      promptCache.set(cacheKey, { data: override, source: "custom_override", timestamp: Date.now() });
      return { prompt: override, source: "custom_override" };
    }

    // TIER 1b: Team member inherits org owner's overrides
    const ownerOverride = await fetchOwnerOverride(supabase, promptName, orgId, userId);
    if (ownerOverride) {
      promptCache.set(cacheKey, { data: ownerOverride, source: "custom_override", timestamp: Date.now() });
      return { prompt: ownerOverride, source: "custom_override" };
    }

    // TIER 2: Runtime prompts
    const runtime = await fetchRuntimePrompt(supabase, promptName, orgId);
    if (runtime) {
      promptCache.set(cacheKey, { data: runtime.prompt, source: "runtime", timestamp: Date.now() });
      return { prompt: runtime.prompt, source: "runtime", runtimeId: runtime.runtimeId };
    }

    // TIER 3: Config defaults
    if (options?.configDefaults?.[promptName]) {
      const defaultPrompt: PromptTemplate = {
        id: `default:${promptName}`,
        name: promptName,
        category: options.category || "general",
        template_content: options.configDefaults[promptName],
        is_active: true,
      };
      promptCache.set(cacheKey, { data: defaultPrompt, source: "config_default", timestamp: Date.now() });
      return { prompt: defaultPrompt, source: "config_default" };
    }

    // Nothing found
    promptCache.set(cacheKey, { data: null, source: "none", timestamp: Date.now() });
    return { prompt: null, source: "none" };
  } catch (error) {
    console.error("[PromptLoader] Error fetching prompt:", error);
    return { prompt: null, source: "none" };
  }
}

// ============================================================================
// TIER 1: CUSTOM OVERRIDES
// ============================================================================

async function fetchCustomOverride(
  supabase: any,
  promptName: string,
  orgId: string,
  userId: string
): Promise<PromptTemplate | null> {
  try {
    const { data, error } = await supabase
      .from("prompt_templates")
      .select("*")
      .eq("target_user_id", userId)
      .ilike("name", `%${promptName}%`)
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return mapToPromptTemplate(data);
  } catch {
    return null;
  }
}

async function fetchOwnerOverride(
  supabase: any,
  promptName: string,
  orgId: string,
  userId: string
): Promise<PromptTemplate | null> {
  try {
    // Get org owner
    const ownerId = await getOrgOwnerId(supabase, orgId, userId);
    if (!ownerId || ownerId === userId) return null;

    // Fetch owner's overrides
    return fetchCustomOverride(supabase, promptName, orgId, ownerId);
  } catch {
    return null;
  }
}

// ============================================================================
// TIER 2: RUNTIME PROMPTS
// ============================================================================

async function fetchRuntimePrompt(
  supabase: any,
  promptName: string,
  orgId: string
): Promise<{ prompt: PromptTemplate; runtimeId: string } | null> {
  try {
    const { data, error } = await supabase
      .from("runtime_prompts")
      .select("*")
      .eq("org_id", orgId)
      .ilike("name", `%${promptName}%`)
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return {
      prompt: {
        id: data.id,
        name: data.name || promptName,
        category: data.category || "general",
        template_content: data.prompt_content || data.template_content || "",
        is_active: true,
      },
      runtimeId: data.id,
    };
  } catch {
    return null;
  }
}

// ============================================================================
// PROMPT COMPILATION (Variable Injection)
// ============================================================================

/**
 * Compile a prompt template by injecting variables.
 * Variables use {{variable.path}} syntax.
 */
export function compileTemplate(
  template: PromptTemplate,
  variables: Record<string, string>
): CompiledPrompt {
  let content = template.template_content;
  const missingVariables: string[] = [];

  // Find all {{variable}} placeholders
  const placeholders = content.match(/\{\{([^}]+)\}\}/g) || [];

  for (const placeholder of placeholders) {
    const key = placeholder.replace(/\{\{|\}\}/g, "").trim();
    const value = variables[key];

    if (value !== undefined && value !== null) {
      content = content.replace(placeholder, value);
    } else {
      missingVariables.push(key);
    }
  }

  return {
    id: template.id,
    name: template.name,
    content,
    missing_variables: missingVariables,
  };
}

// ============================================================================
// USAGE TRACKING
// ============================================================================

/**
 * Track that a prompt was used (for analytics + effectiveness tracking).
 */
export async function trackPromptUsage(
  supabase: any,
  promptId: string,
  orgId: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await supabase.from("intelligence_execution_logs").insert({
      org_id: orgId,
      operation: "prompt_usage",
      input_summary: JSON.stringify({ prompt_id: promptId, ...metadata }),
      success: true,
    });
  } catch {
    // Non-critical — don't throw
  }
}

/**
 * Track that a prompt produced a successful outcome.
 */
export async function trackPromptSuccess(
  supabase: any,
  promptId: string,
  orgId: string,
  outcomeType: string,
  details?: Record<string, any>
): Promise<void> {
  try {
    await supabase.from("intelligence_effectiveness").insert({
      org_id: orgId,
      operation: "prompt_outcome",
      outcome_type: outcomeType,
      outcome_details: { prompt_id: promptId, ...details },
    });
  } catch {
    // Non-critical — don't throw
  }
}

// ============================================================================
// HELPERS
// ============================================================================

async function getOrgOwnerId(
  supabase: any,
  orgId: string,
  userId: string
): Promise<string | null> {
  try {
    // Check if user is a team member
    const { data: membership } = await supabase
      .from("organization_members")
      .select("organizations!inner(owner_id)")
      .eq("user_id", userId)
      .eq("organization_id", orgId)
      .maybeSingle();

    return membership?.organizations?.owner_id || null;
  } catch {
    return null;
  }
}

function mapToPromptTemplate(data: any): PromptTemplate {
  return {
    id: data.id,
    name: data.name,
    category: data.category || "general",
    description: data.description,
    template_content: data.template_content || "",
    required_variables: data.required_variables,
    is_active: data.is_active !== false,
    target_user_id: data.target_user_id,
    org_id: data.org_id,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}
