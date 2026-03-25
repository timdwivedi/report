/**
 * Universal Output Validator
 *
 * Transplanted from Invisible Pipeline's output-validator.ts
 * Quality gates AI output BEFORE it reaches the user.
 *
 * Catches: Banned phrases, AI tells, thinking leakage, wrong length,
 * format artifacts, data pollution.
 *
 * Original: Validated DM output in IP
 * Universal: Validates ANY AI-generated content
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  severity: "pass" | "warning" | "fail";
  suggestedAction: "use" | "retry" | "warn_user";
}

export interface ValidationIssue {
  type: "banned_phrase" | "thinking_leaked" | "length" | "format" | "data_pollution" | "ai_tell";
  message: string;
  severity: "warning" | "critical";
  match?: string;
}

// ============================================================================
// BANNED PATTERNS (AI tells + weak phrases)
// ============================================================================

const BANNED_PATTERNS: Array<{ pattern: RegExp; reason: string; severity: "warning" | "critical" }> = [
  // Weak openers
  { pattern: /\bI noticed\b/i, reason: 'Weak opener "I noticed"', severity: "warning" },
  { pattern: /\bI saw your\b/i, reason: 'Weak opener "I saw your"', severity: "warning" },
  { pattern: /\bI came across\b/i, reason: 'Weak opener "I came across"', severity: "warning" },
  { pattern: /\bJust wanted to\b/i, reason: 'Weak opener "Just wanted to"', severity: "warning" },
  { pattern: /\bHope this finds\b/i, reason: 'Formal cliche "Hope this finds"', severity: "warning" },
  { pattern: /\bQuick question\b/i, reason: 'Overused "Quick question"', severity: "warning" },

  // AI tell words
  { pattern: /\bdelve\b/i, reason: 'AI tell "delve"', severity: "warning" },
  { pattern: /\bleverage\b/i, reason: 'AI tell "leverage"', severity: "warning" },
  { pattern: /\butilize\b/i, reason: 'AI tell "utilize"', severity: "warning" },
  { pattern: /\bfoster\b/i, reason: 'AI tell "foster"', severity: "warning" },
  { pattern: /\bstreamline\b/i, reason: 'AI tell "streamline"', severity: "warning" },
  { pattern: /\bunlock\b/i, reason: 'AI tell "unlock"', severity: "warning" },
  { pattern: /\bseamless\b/i, reason: 'AI tell "seamless"', severity: "warning" },
  { pattern: /\brobust\b/i, reason: 'AI tell "robust"', severity: "warning" },
  { pattern: /\bresonate\b/i, reason: 'AI tell "resonate"', severity: "warning" },
  { pattern: /\bgame-?changer\b/i, reason: 'AI tell "game-changer"', severity: "warning" },
  { pattern: /\bpivotal\b/i, reason: 'AI tell "pivotal"', severity: "warning" },
  { pattern: /\bharness\b/i, reason: 'AI tell "harness"', severity: "warning" },
  { pattern: /\btapestry\b/i, reason: 'AI tell "tapestry"', severity: "warning" },
  { pattern: /\bforefront\b/i, reason: 'AI tell "forefront"', severity: "warning" },
  { pattern: /\bever-evolving\b/i, reason: 'AI tell "ever-evolving"', severity: "warning" },
  { pattern: /\bnavigate\b/i, reason: 'AI tell "navigate"', severity: "warning" },

  // Format tells
  { pattern: /—/g, reason: "Em-dash (AI formatting tell)", severity: "warning" },
];

// Thinking/analysis leakage patterns
const THINKING_PATTERNS: RegExp[] = [
  /^(ANALYSIS|INTERNAL|REASONING|THINKING|STRATEGY|APPROACH|NOTE|CONTEXT):/im,
  /^Step \d+:/im,
  /^\[.*\]$/m,
  /^>{2,}/m,
  /^Here'?s? (?:a|an|the|my) (?:message|DM|email|response)/im,
  /^(?:Draft|Option|Version) \d/im,
];

// ============================================================================
// MAIN VALIDATOR
// ============================================================================

/**
 * Validate AI output before returning to user.
 *
 * @param output - The AI-generated text
 * @param expectedLength - Expected word count range [min, max]
 * @param customBannedWords - Additional banned words from config/constitution
 */
export function validateOutput(
  output: string,
  expectedLength?: { min: number; max: number },
  customBannedWords?: string[]
): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!output || output.trim().length === 0) {
    return {
      valid: false,
      issues: [{ type: "length", message: "Empty output", severity: "critical" }],
      severity: "fail",
      suggestedAction: "retry",
    };
  }

  // 1. Check banned patterns
  for (const { pattern, reason, severity } of BANNED_PATTERNS) {
    const match = output.match(pattern);
    if (match) {
      issues.push({ type: "ai_tell", message: reason, severity, match: match[0] });
    }
  }

  // 2. Check custom banned words
  if (customBannedWords?.length) {
    for (const word of customBannedWords) {
      if (output.toLowerCase().includes(word.toLowerCase())) {
        issues.push({
          type: "banned_phrase",
          message: `Custom banned word: "${word}"`,
          severity: "warning",
          match: word,
        });
      }
    }
  }

  // 3. Check for thinking leakage
  for (const pattern of THINKING_PATTERNS) {
    if (pattern.test(output)) {
      issues.push({
        type: "thinking_leaked",
        message: "AI thinking/analysis leaked into output",
        severity: "critical",
        match: output.match(pattern)?.[0],
      });
    }
  }

  // 4. Check length
  if (expectedLength) {
    const wordCount = output.split(/\s+/).length;
    if (wordCount < expectedLength.min) {
      issues.push({
        type: "length",
        message: `Too short: ${wordCount} words (expected ${expectedLength.min}-${expectedLength.max})`,
        severity: wordCount < expectedLength.min / 2 ? "critical" : "warning",
      });
    }
    if (wordCount > expectedLength.max * 1.5) {
      issues.push({
        type: "length",
        message: `Too long: ${wordCount} words (expected max ${expectedLength.max})`,
        severity: "warning",
      });
    }
  }

  // 5. Check for format artifacts
  if (/```/.test(output)) {
    issues.push({ type: "format", message: "Code block in output", severity: "critical" });
  }
  if (/^#{1,3}\s/m.test(output)) {
    issues.push({ type: "format", message: "Markdown headers in output", severity: "warning" });
  }
  if (/\{[\s\S]*"[\s\S]*":[\s\S]*\}/.test(output) && output.length < 500) {
    issues.push({ type: "format", message: "JSON detected in output", severity: "critical" });
  }

  // Determine overall severity
  const hasCritical = issues.some(i => i.severity === "critical");
  const warningCount = issues.filter(i => i.severity === "warning").length;

  let severity: ValidationResult["severity"] = "pass";
  let suggestedAction: ValidationResult["suggestedAction"] = "use";

  if (hasCritical) {
    severity = "fail";
    suggestedAction = "retry";
  } else if (warningCount >= 3) {
    severity = "warning";
    suggestedAction = "warn_user";
  } else if (warningCount >= 1) {
    severity = "warning";
    suggestedAction = "use";
  }

  return {
    valid: !hasCritical,
    issues,
    severity,
    suggestedAction,
  };
}

/**
 * Clean output by removing detected issues where possible.
 * Use this as a post-processing step before returning to user.
 */
export function cleanOutput(output: string): string {
  let cleaned = output.trim();

  // Remove thinking leakage (everything before the actual message)
  for (const pattern of THINKING_PATTERNS) {
    const match = cleaned.match(pattern);
    if (match && match.index !== undefined) {
      // Find the end of the thinking section (next empty line)
      const afterThinking = cleaned.substring(match.index);
      const nextParagraph = afterThinking.indexOf("\n\n");
      if (nextParagraph > 0) {
        cleaned = cleaned.substring(0, match.index) + afterThinking.substring(nextParagraph + 2);
      }
    }
  }

  // Remove code blocks
  cleaned = cleaned.replace(/```[\s\S]*?```/g, "").trim();

  // Remove markdown headers
  cleaned = cleaned.replace(/^#{1,3}\s.*$/gm, "").trim();

  // Remove em-dashes (replace with commas or nothing)
  cleaned = cleaned.replace(/\s*—\s*/g, ", ").replace(/,\s*,/g, ",");

  return cleaned.trim();
}
