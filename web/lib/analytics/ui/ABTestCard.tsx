"use client";

import type { ABTest } from "../types/analytics.types";

interface ABTestCardProps {
  test: ABTest;
  className?: string;
}

/** A/B test result card with variant stats and significance indicator */
export function ABTestCard({ test, className = "" }: ABTestCardProps) {
  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600",
    running: "bg-blue-100 text-blue-700",
    paused: "bg-amber-100 text-amber-700",
    completed: "bg-emerald-100 text-emerald-700",
  };

  const confidenceLabel = test.confidence_level
    ? `${Math.round(test.confidence_level * 100)}% confidence`
    : "Collecting data...";

  const isSignificant = test.confidence_level !== null && test.confidence_level >= 0.95;

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-semibold text-gray-900">{test.name}</h4>
          {test.description && (
            <p className="text-xs text-gray-500 mt-1">{test.description}</p>
          )}
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[test.status] || statusColors.draft}`}>
          {test.status}
        </span>
      </div>

      {/* Variant bars */}
      <div className="space-y-3 mb-4">
        {test.variants.map((variant) => {
          const stats = test.stats_cache[variant.id];
          if (!stats) return null;

          const isWinner = test.winner_variant === variant.id;
          const barColor = isWinner
            ? "bg-emerald-500"
            : "bg-gray-300";

          return (
            <div key={variant.id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className={`font-medium ${isWinner ? "text-emerald-700" : "text-gray-700"}`}>
                  {variant.name}
                  {isWinner && " (Winner)"}
                </span>
                <span className="font-mono text-gray-900">
                  {stats.rate.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${Math.min(stats.rate * 3, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {stats.conversions}/{stats.impressions}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Significance */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-500">
          Target: {test.target_metric.replace(/_/g, " ")}
        </span>
        <span
          className={`text-xs font-medium ${
            isSignificant ? "text-emerald-600" : "text-gray-400"
          }`}
        >
          {confidenceLabel}
        </span>
      </div>
    </div>
  );
}
