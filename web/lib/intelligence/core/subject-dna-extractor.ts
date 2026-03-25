/**
 * Universal Subject DNA Extractor
 *
 * Transplanted from Invisible Pipeline's lead-dna-extractor.ts
 * Abstracted to work with ANY domain via intelligence config.
 *
 * Original: Extracted lead profiles from LinkedIn scrapes
 * Universal: Extracts structured DNA from ANY data source (profiles, transcripts, forms, etc.)
 */

import { callAI } from "@/lib/ai/ai-service";
import type { IntelligenceConfig } from "../config/intelligence.config";
import type { SubjectDNA } from "../types/intelligence.types";
import { emptySubjectDNA } from "../types/intelligence.types";

/**
 * Build the DOE extraction prompt dynamically from config.
 * This is the key abstraction — the prompt adapts to any domain.
 */
function buildExtractionPrompt(config: IntelligenceConfig): string {
  const { dna } = config;

  // Build dimension fields for the JSON schema
  const dimensionFields = dna.dimensions
    .sort((a, b) => a.priority - b.priority)
    .map(d => `    "${d.name}": ["<array: ${d.description}>"]`)
    .join(",\n");

  // Build attribute fields
  const attributeFields = dna.attributes
    .map(a => {
      const valuesHint = a.possible_values
        ? ` (${a.possible_values.map(v => `'${v}'`).join(' | ')})`
        : "";
      return `    "${a.name}": "<string or null: ${a.description}${valuesHint}>"`;
    })
    .join(",\n");

  // Build structured fields
  const structuredFields = dna.structured
    .map(s => {
      const subFields = s.fields
        .map(f => `        "${f.name}": "<string or null: ${f.description}>"`)
        .join(",\n");
      return `    "${s.name}": {\n${subFields}\n    }`;
    })
    .join(",\n");

  // Build extraction priorities
  const priorities = dna.dimensions
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 6)
    .map((d, i) => `${i + 1}. **${d.name}** - ${d.description}`)
    .join("\n");

  return `DIRECTIVES (Rules you MUST follow - breaking these is FAILURE):
1. Extract ONLY the data requested in the OUTPUTS schema
2. If a field is missing from the input, return an empty array [] or null
3. Never add fields not in the schema
4. Never explain your output or add commentary
5. Return ONLY valid JSON - no markdown, no code blocks
6. For array fields, extract actual items mentioned - each item should be a short phrase
7. PRESERVE their exact phrasing in "unique_phrases" - these are gold for personalization
8. Be THOROUGH - if content could fit a category, include it
9. Focus on ACTIONABLE intelligence
10. Extract the ESSENCE - what makes THIS ${config.subject.singular} unique

OUTPUTS (Return this EXACT JSON structure):
{
    "dimensions": {
${dimensionFields}
    },
    "attributes": {
${attributeFields}
    },
    "structured": {
${structuredFields}
    },
    "unique_phrases": ["<array: VERBATIM quotes that are uniquely them - PRESERVE EXACT WORDING>"],
    "extraction_confidence": <number 0-100: How confident are you in this extraction based on data quality?>
}

EXTRACTION PRIORITIES (in order of importance):
${priorities}

CONFIDENCE SCORING:
- 90-100: Rich data with lots of content (detailed transcript, full profile)
- 70-89: Good data with some content
- 50-69: Basic data, limited detail
- 30-49: Minimal data, mostly inferred
- 0-29: Almost no usable data

EXECUTABLES (Tools available):
None - just parse the provided data into the JSON structure above.

${config.subject.singular.toUpperCase()} DATA TO EXTRACT:
`;
}

/**
 * Build archetype matching section if archetypes are configured
 */
function buildArchetypeSection(config: IntelligenceConfig): string {
  const archetypes = config.dna.archetypes;
  if (!archetypes || archetypes.length === 0) return "";

  return `

ARCHETYPE MATCHING INSTRUCTIONS:
Match this ${config.subject.singular} to the BEST FIT archetype based on:
- Keywords/terminology they use
- Behavioral indicators
- Language patterns

AVAILABLE ARCHETYPES:
${archetypes.map((a, i) => `
${i + 1}. ${a.name}${a.description ? ` - ${a.description}` : ""}
   - Keywords: ${a.identification_triggers.keywords?.join(", ") || "N/A"}
   - Indicators: ${a.identification_triggers.indicators?.join(", ") || "N/A"}
   - Language: ${a.identification_triggers.language_patterns?.join(", ") || "N/A"}
`).join("\n")}

Add to your JSON output:
"matched_archetype": {
    "primary": "<best matching archetype name or null>",
    "confidence": <number 0-100>,
    "secondary": "<secondary archetype if they blend, or null>",
    "reasoning": "<why this archetype was chosen, citing evidence>"
}

ARCHETYPE MATCHING RULES:
- Cite actual evidence from their data
- Confidence 80-100: Strong match with multiple indicators
- Confidence 50-79: Partial match or indirect indicators
- Confidence 0-49: Weak match or speculation
`;
}

/**
 * Build context string from raw data (generic — works for any source type)
 */
function buildContextString(rawData: Record<string, any>): string {
  const parts: string[] = [];

  // Handle common fields
  if (rawData.name) parts.push(`Name: ${rawData.name}`);
  if (rawData.title) parts.push(`Title: ${rawData.title}`);
  if (rawData.company) parts.push(`Company: ${rawData.company}`);
  if (rawData.location) parts.push(`Location: ${rawData.location}`);
  if (rawData.about) parts.push(`\nAbout/Bio:\n${rawData.about}`);

  // Handle transcript (coaching/diagnostic use case)
  if (rawData.transcript) {
    parts.push(`\nConversation Transcript:\n${rawData.transcript.slice(0, 20000)}`);
    if (rawData.transcript.length > 20000) {
      parts.push(`\n[...truncated ${rawData.transcript.length - 20000} chars]`);
    }
  }

  // Handle posts/content
  if (rawData.featuredPosts?.length) {
    parts.push(`\nFeatured Content:`);
    rawData.featuredPosts.slice(0, 5).forEach((post: any, i: number) => {
      parts.push(`${i + 1}. ${post.title}${post.description ? `: ${post.description}` : ""}`);
    });
  }

  // Handle activity/history
  if (rawData.recentActivity?.length) {
    parts.push(`\nRecent Activity:`);
    rawData.recentActivity.slice(0, 10).forEach((activity: any, i: number) => {
      parts.push(`${i + 1}. ${(activity.text || activity.content || "").slice(0, 500)}`);
    });
  }

  // Handle intake/form data
  if (rawData.intake_responses) {
    parts.push(`\nIntake Form Responses:`);
    if (typeof rawData.intake_responses === "object") {
      Object.entries(rawData.intake_responses).forEach(([q, a]) => {
        parts.push(`Q: ${q}\nA: ${a}`);
      });
    }
  }

  // Handle full page text (LinkedIn scrape, etc.)
  if (rawData.fullPageText) {
    const truncated = rawData.fullPageText.slice(0, 15000);
    parts.push(`\nFull Content:\n${truncated}`);
    if (rawData.fullPageText.length > 15000) {
      parts.push(`\n[...truncated ${rawData.fullPageText.length - 15000} chars]`);
    }
  }

  // Fallback: dump any remaining keys as JSON
  const handledKeys = new Set([
    "name", "title", "company", "location", "about", "transcript",
    "featuredPosts", "recentActivity", "intake_responses", "fullPageText",
  ]);
  const remaining = Object.entries(rawData).filter(([k]) => !handledKeys.has(k));
  if (remaining.length > 0) {
    parts.push(`\nAdditional Data:\n${JSON.stringify(Object.fromEntries(remaining), null, 2).slice(0, 5000)}`);
  }

  return parts.join("\n");
}

// ============================================================================
// MAIN EXTRACTION FUNCTION
// ============================================================================

/**
 * Extract structured DNA from raw data using AI.
 *
 * @param config - Intelligence config for this deployment
 * @param rawData - Raw data to extract from (profile, transcript, form, etc.)
 * @returns Extracted SubjectDNA with metadata
 */
export async function extractSubjectDNA(
  config: IntelligenceConfig,
  rawData: Record<string, any>
): Promise<{ dna: SubjectDNA; meta: { model: string; provider: string } }> {
  if (!config.dna.enabled) {
    return { dna: emptySubjectDNA, meta: { model: "none", provider: "disabled" } };
  }

  const promptTemplate = buildExtractionPrompt(config);
  const archetypeSection = buildArchetypeSection(config);
  const contextString = buildContextString(rawData);
  const sourceCharCount = contextString.length;

  const fullPrompt = promptTemplate + archetypeSection + contextString;

  const aiRes = await callAI(fullPrompt, {
    model: config.ai.extraction_model,
    maxTokens: 8192,
  });

  // Clean the response — extract JSON
  let cleaned = aiRes.content.trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  } else {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/```\s*$/, "").trim();
  }

  try {
    const parsed = JSON.parse(cleaned);
    const validated = validateSubjectDNA(parsed, sourceCharCount, config);

    return {
      dna: validated,
      meta: { model: aiRes.model, provider: aiRes.provider },
    };
  } catch {
    console.error(`[Intelligence] Failed to parse DNA extraction response`);

    let minimumConfidence = 0;
    if (sourceCharCount > 10000) minimumConfidence = 30;
    else if (sourceCharCount > 5000) minimumConfidence = 20;
    else if (sourceCharCount > 1000) minimumConfidence = 10;

    return {
      dna: {
        ...emptySubjectDNA,
        extraction_confidence: minimumConfidence,
        source_char_count: sourceCharCount,
        extracted_at: new Date().toISOString(),
      },
      meta: { model: aiRes.model, provider: aiRes.provider },
    };
  }
}

// ============================================================================
// VALIDATION
// ============================================================================

function validateSubjectDNA(
  data: any,
  sourceCharCount: number,
  config: IntelligenceConfig
): SubjectDNA {
  if (!data || typeof data !== "object") {
    return { ...emptySubjectDNA, source_char_count: sourceCharCount, extracted_at: new Date().toISOString() };
  }

  const toStringArray = (val: unknown): string[] => {
    if (!Array.isArray(val)) return [];
    return val.filter((v) => typeof v === "string" && v.trim()).map((v) => String(v).trim());
  };

  const toStringOrNull = (val: unknown): string | null => {
    if (typeof val === "string" && val.trim()) return val.trim();
    return null;
  };

  const toNumber = (val: unknown, defaultVal: number): number => {
    if (typeof val === "number") {
      const clamped = Math.min(100, Math.max(0, val));
      if (clamped === 0 && sourceCharCount > 1000) return 30;
      return clamped;
    }
    return defaultVal;
  };

  // Extract dimensions from parsed data
  const dimensions: Record<string, string[]> = {};
  const rawDimensions = data.dimensions || data;
  for (const dim of config.dna.dimensions) {
    dimensions[dim.name] = toStringArray(rawDimensions[dim.name]);
  }

  // Extract attributes
  const attributes: Record<string, string | null> = {};
  const rawAttributes = data.attributes || data;
  for (const attr of config.dna.attributes) {
    attributes[attr.name] = toStringOrNull(rawAttributes[attr.name]);
  }

  // Extract structured data
  const structured: Record<string, Record<string, string | null> | null> = {};
  const rawStructured = data.structured || data;
  for (const struct of config.dna.structured) {
    const rawObj = rawStructured[struct.name];
    if (rawObj && typeof rawObj === "object") {
      const fields: Record<string, string | null> = {};
      let hasData = false;
      for (const field of struct.fields) {
        fields[field.name] = toStringOrNull((rawObj as Record<string, unknown>)[field.name]);
        if (fields[field.name]) hasData = true;
      }
      structured[struct.name] = hasData ? fields : null;
    } else {
      structured[struct.name] = null;
    }
  }

  // Extract archetype match
  let matchedArchetype: SubjectDNA["matched_archetype"] = null;
  if (data.matched_archetype && typeof data.matched_archetype === "object") {
    const ma = data.matched_archetype;
    const primary = toStringOrNull(ma.primary);
    const reasoning = toStringOrNull(ma.reasoning);
    if (primary && reasoning) {
      matchedArchetype = {
        primary,
        confidence: toNumber(ma.confidence, 0),
        secondary: toStringOrNull(ma.secondary),
        reasoning,
      };
    }
  }

  return {
    dimensions,
    attributes,
    structured,
    unique_phrases: toStringArray(data.unique_phrases),
    matched_archetype: matchedArchetype,
    extraction_confidence: toNumber(data.extraction_confidence, 50),
    source_char_count: sourceCharCount,
    extracted_at: new Date().toISOString(),
  };
}

/**
 * Check if DNA extraction is needed (no existing DNA or stale)
 */
export function needsDNAExtraction(existingDNA: SubjectDNA | null, maxAgeDays: number = 30): boolean {
  if (!existingDNA) return true;
  if (existingDNA.extraction_confidence === 0) return true;

  const extractedAt = existingDNA.extracted_at;
  if (extractedAt) {
    const ageMs = Date.now() - new Date(extractedAt).getTime();
    const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
    if (ageMs > maxAgeMs) return true;
  }

  return false;
}
