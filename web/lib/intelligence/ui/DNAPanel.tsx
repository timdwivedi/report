"use client";

/**
 * Universal DNA Panel Component
 *
 * Displays extracted Subject DNA in an organized panel.
 * Config-driven: reads dimension names and labels from intelligence config.
 *
 * Transplanted from IP's lead detail panels — adapted for any domain.
 */

import { useState } from "react";
import type { SubjectDNA } from "../types/intelligence.types";
import type { IntelligenceConfig } from "../config/intelligence.config";
import { getQualityLabel } from "../types/intelligence.types";

interface DNAPanelProps {
  dna: SubjectDNA;
  config: IntelligenceConfig;
  subjectName?: string;
  className?: string;
}

export function DNAPanel({ dna, config, subjectName, className = "" }: DNAPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const qualityLabel = getQualityLabel(dna.extraction_confidence);

  return (
    <div className={`rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {config.subject.singular.charAt(0).toUpperCase() + config.subject.singular.slice(1)} DNA
            </h3>
            {subjectName && (
              <p className="text-sm text-neutral-500 mt-0.5">{subjectName}</p>
            )}
          </div>
          <ConfidenceBadge confidence={dna.extraction_confidence} label={qualityLabel} />
        </div>

        {/* Archetype match */}
        {dna.matched_archetype && (
          <div className="mt-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {dna.matched_archetype.primary}
              </span>
              <span className="text-xs text-neutral-500">
                {dna.matched_archetype.confidence}% confidence
              </span>
            </div>
            {dna.matched_archetype.secondary && (
              <span className="text-xs text-neutral-400 mt-0.5 block">
                Secondary: {dna.matched_archetype.secondary}
              </span>
            )}
            <p className="text-xs text-neutral-500 mt-1">{dna.matched_archetype.reasoning}</p>
          </div>
        )}
      </div>

      {/* Attributes */}
      {Object.keys(dna.attributes).length > 0 && (
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex flex-wrap gap-2">
            {Object.entries(dna.attributes).map(([key, value]) => {
              if (!value) return null;
              const attrConfig = config.dna.attributes.find(a => a.name === key);
              return (
                <span
                  key={key}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                  title={attrConfig?.label || key}
                >
                  {value}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Dimensions */}
      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {config.dna.dimensions.map(dimConfig => {
          const items = dna.dimensions[dimConfig.name] || [];
          if (items.length === 0) return null;

          const isExpanded = expandedSection === dimConfig.name;

          return (
            <div key={dimConfig.name}>
              <button
                onClick={() => setExpandedSection(isExpanded ? null : dimConfig.name)}
                className="w-full flex items-center justify-between px-6 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors text-left"
              >
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {dimConfig.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400">{items.length} items</span>
                  <svg
                    className={`w-4 h-4 text-neutral-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {isExpanded && (
                <div className="px-6 pb-3 animate-in fade-in slide-in-from-top-1">
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((item, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs bg-neutral-50 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Unique Phrases (always visible if present) */}
      {dna.unique_phrases.length > 0 && (
        <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800">
          <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
            Verbatim Quotes
          </h4>
          <div className="space-y-2">
            {dna.unique_phrases.slice(0, 5).map((phrase, i) => (
              <p
                key={i}
                className="text-sm text-neutral-600 dark:text-neutral-400 italic pl-3 border-l-2 border-neutral-200 dark:border-neutral-700"
              >
                &ldquo;{phrase}&rdquo;
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-between text-xs text-neutral-400">
        <span>Extracted: {new Date(dna.extracted_at).toLocaleDateString()}</span>
        <span>{dna.source_char_count.toLocaleString()} chars analyzed</span>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function ConfidenceBadge({ confidence, label }: { confidence: number; label: string }) {
  const colorClass =
    confidence >= 70 ? "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30" :
    confidence >= 50 ? "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30" :
    confidence >= 30 ? "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/30" :
    "text-neutral-500 bg-neutral-50 dark:text-neutral-400 dark:bg-neutral-900/30";

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      <span>{confidence}%</span>
      <span className="opacity-70">{label}</span>
    </div>
  );
}
