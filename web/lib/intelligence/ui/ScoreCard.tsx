"use client";

/**
 * Universal Score Card Component
 *
 * Displays a subject's score with breakdown, inspired by the Revio Selling Index UI.
 * Config-driven: reads scoring dimensions/signals and tiers from intelligence config.
 *
 * Transplanted from IP's LeadScoreTab.tsx — adapted to be domain-agnostic.
 */

import { useState } from "react";
import type { SubjectScore, ScoringBreakdownItem } from "../types/intelligence.types";
import type { IntelligenceConfig } from "../config/intelligence.config";

interface ScoreCardProps {
  score: SubjectScore;
  config: IntelligenceConfig;
  subjectName?: string;
  className?: string;
}

export function ScoreCard({ score, config, subjectName, className = "" }: ScoreCardProps) {
  const [expandedSignal, setExpandedSignal] = useState<string | null>(null);

  // Find the tier for this score
  const tier = findTier(score.total_score, config);

  return (
    <div className={`rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden ${className}`}>
      {/* Header with score badge */}
      <div className="p-6 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {config.name || "Intelligence Score"}
            </h3>
            {subjectName && (
              <p className="text-sm text-neutral-500 mt-0.5">{subjectName}</p>
            )}
          </div>
          <ScoreBadge score={score.total_score} color={tier.color} />
        </div>

        {/* Verdict */}
        <div className="mt-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTierBgClass(tier.color)}`}>
            {score.verdict || tier.label}
          </span>
          {score.summary && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
              {score.summary}
            </p>
          )}
        </div>
      </div>

      {/* Breakdown */}
      <div className="p-4 space-y-3">
        {score.breakdown.map((item) => (
          <SignalRow
            key={item.signal}
            item={item}
            isWeighted={config.scoring.method === "dimension_weighted"}
            maxScore={config.scoring.method === "signal_based"
              ? Math.floor(100 / (config.scoring.signals?.length || 10))
              : 100}
            expanded={expandedSignal === item.signal}
            onToggle={() => setExpandedSignal(
              expandedSignal === item.signal ? null : item.signal
            )}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-between text-xs text-neutral-400">
        <span>Scored: {new Date(score.scored_at).toLocaleDateString()}</span>
        <span>Model: {score.model_used}</span>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function ScoreBadge({ score, color }: { score: number; color: string }) {
  return (
    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-4 ${getScoreBorderClass(color)}`}>
      <span className={getScoreTextClass(color)}>{score}</span>
    </div>
  );
}

function SignalRow({
  item,
  isWeighted,
  maxScore,
  expanded,
  onToggle,
}: {
  item: ScoringBreakdownItem;
  isWeighted: boolean;
  maxScore: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const percentage = isWeighted
    ? item.score
    : Math.round((item.score / maxScore) * 100);

  return (
    <div className="group">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2 px-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate">
              {item.signal}
            </span>
            <span className="text-sm font-semibold ml-2 tabular-nums">
              {isWeighted ? `${item.score}%` : `${item.score}/${maxScore}`}
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${getBarColorClass(percentage)}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && item.reasoning && (
        <div className="px-3 pb-2 text-sm text-neutral-500 dark:text-neutral-400 animate-in fade-in slide-in-from-top-1">
          {item.reasoning}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STYLE HELPERS
// ============================================================================

function findTier(score: number, config: IntelligenceConfig) {
  const sorted = [...config.scoring.tiers].sort((a, b) => b.min - a.min);
  for (const tier of sorted) {
    if (score >= tier.min) return tier;
  }
  return sorted[sorted.length - 1] || { name: "unscored", label: "Unscored", min: 0, color: "gray" };
}

function getBarColorClass(percentage: number): string {
  if (percentage >= 80) return "bg-emerald-500";
  if (percentage >= 60) return "bg-blue-500";
  if (percentage >= 40) return "bg-yellow-500";
  if (percentage >= 20) return "bg-orange-500";
  return "bg-red-500";
}

function getTierBgClass(color: string): string {
  const map: Record<string, string> = {
    emerald: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    amber: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    slate: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300",
    gray: "bg-neutral-100 text-neutral-800 dark:bg-neutral-900/30 dark:text-neutral-300",
  };
  return map[color] || map.gray;
}

function getScoreBorderClass(color: string): string {
  const map: Record<string, string> = {
    emerald: "border-emerald-500",
    blue: "border-blue-500",
    amber: "border-amber-500",
    yellow: "border-yellow-500",
    slate: "border-slate-400",
    gray: "border-neutral-400",
  };
  return map[color] || map.gray;
}

function getScoreTextClass(color: string): string {
  const map: Record<string, string> = {
    emerald: "text-emerald-600 dark:text-emerald-400",
    blue: "text-blue-600 dark:text-blue-400",
    amber: "text-amber-600 dark:text-amber-400",
    yellow: "text-yellow-600 dark:text-yellow-400",
    slate: "text-slate-600 dark:text-slate-400",
    gray: "text-neutral-600 dark:text-neutral-400",
  };
  return map[color] || map.gray;
}
