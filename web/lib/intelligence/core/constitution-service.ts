/**
 * Universal Constitution Service (Brand Governance)
 *
 * Transplanted from Invisible Pipeline's constitution-service.ts
 * Defines the organization's core values, brand personality, and immutable rules.
 * Sits at the TOP of prompt hierarchy — all generated content must embody these.
 *
 * Original: Org-level brand rules for sales messaging in IP
 * Universal: Brand governance for ANY content generation
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ConstitutionValue {
  name: string;
  description: string;
}

export interface BrandVoice {
  personality: string[];  // ["witty", "direct", "empathetic"]
  tone: string;           // "conversational", "professional", "casual"
  formality: number;      // 0 = casual, 1 = formal
}

export interface Constitution {
  id: string;
  org_id: string;
  values: ConstitutionValue[];
  rules: string[];
  brand_voice: BrandVoice;
  updated_at: string;
}

// ============================================================================
// CACHE (Constitution changes rarely — 10 min TTL)
// ============================================================================

interface CacheEntry {
  data: Constitution | null;
  timestamp: number;
}

const CACHE_TTL_MS = 10 * 60 * 1000;
const constitutionCache = new Map<string, CacheEntry>();

/**
 * Fetch Constitution for an organization with caching.
 */
export async function getConstitution(
  supabase: any,
  orgId: string
): Promise<Constitution | null> {
  if (!orgId) return null;

  const cached = constitutionCache.get(orgId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const { data, error } = await supabase
      .from("org_constitution")
      .select("*")
      .eq("org_id", orgId)
      .single();

    if (error) {
      constitutionCache.set(orgId, { data: null, timestamp: Date.now() });
      return null;
    }

    const constitution: Constitution = {
      id: data.id,
      org_id: data.org_id,
      values: data.values || [],
      rules: data.rules || [],
      brand_voice: data.brand_voice || { personality: [], tone: "conversational", formality: 0.5 },
      updated_at: data.updated_at,
    };

    constitutionCache.set(orgId, { data: constitution, timestamp: Date.now() });
    return constitution;
  } catch {
    return null;
  }
}

export function invalidateConstitutionCache(orgId: string): void {
  constitutionCache.delete(orgId);
}

// ============================================================================
// PROMPT BLOCK BUILDERS
// ============================================================================

/** Personality trait → writing guidance mapping */
const PERSONALITY_GUIDANCE: Record<string, string> = {
  witty: "Clever wordplay welcome. Keep it sharp, not corny.",
  direct: "Cut the fluff. Say it straight.",
  empathetic: "Acknowledge feelings. Show understanding.",
  bold: "Make strong statements. No hedging.",
  calm: "Measured and composed. No urgency hype.",
  energetic: "High energy. Enthusiasm is contagious.",
  analytical: "Data and logic lead. Support claims.",
  playful: "Light-hearted approach. Fun > formal.",
  professional: "Business-appropriate. Credibility first.",
  casual: "Relaxed tone. Like talking to a friend.",
  warm: "Friendly and approachable. Human connection.",
  authoritative: "Speak with confidence. Expert positioning.",
};

/**
 * Full constitution block for deep content generation (~200-400 tokens)
 */
export function buildConstitutionBlock(constitution: Constitution): string {
  const { values, rules, brand_voice } = constitution;
  const parts: string[] = [];

  parts.push(`\n## BRAND CONSTITUTION (FOUNDATIONAL IDENTITY)`);
  parts.push(`All content must EMBODY these principles naturally.\n`);

  if (values.length > 0) {
    parts.push(`CORE VALUES:`);
    values.forEach(v => parts.push(`  - ${v.name}${v.description ? `: ${v.description}` : ""}`));
  }

  if (brand_voice.personality?.length) {
    parts.push(`\nBRAND PERSONALITY: ${brand_voice.personality.join(" + ")}`);
    const guidance = brand_voice.personality
      .map(t => PERSONALITY_GUIDANCE[t.toLowerCase()])
      .filter(Boolean);
    if (guidance.length) {
      parts.push(`Guidance:`);
      guidance.forEach(g => parts.push(`  - ${g}`));
    }
  }

  if (brand_voice.formality < 0.3) {
    parts.push(`\nFORMALITY: CASUAL. Contractions, slang OK.`);
  } else if (brand_voice.formality > 0.7) {
    parts.push(`\nFORMALITY: FORMAL. No contractions. Professional language.`);
  } else {
    parts.push(`\nFORMALITY: BALANCED. Professional yet approachable.`);
  }

  if (rules.length > 0) {
    parts.push(`\nCONSTITUTION RULES (MUST FOLLOW):`);
    rules.forEach((r, i) => parts.push(`  ${i + 1}. ${r}`));
  }

  return parts.join("\n");
}

/**
 * Minimal constitution block for DMs (~50-80 tokens)
 */
export function buildMinimalConstitutionBlock(constitution: Constitution): string {
  const { values, brand_voice } = constitution;
  const parts: string[] = [];

  parts.push(`# Brand Constitution`);
  if (brand_voice.personality?.length) {
    parts.push(`Personality: ${brand_voice.personality.join(", ")}`);
  }
  if (values.length > 0) {
    parts.push(`Values: ${values.slice(0, 2).map(v => v.name).join(", ")}`);
  }
  if (brand_voice.formality < 0.3) parts.push(`Tone: Casual`);
  else if (brand_voice.formality > 0.7) parts.push(`Tone: Formal`);

  return parts.join("\n");
}
