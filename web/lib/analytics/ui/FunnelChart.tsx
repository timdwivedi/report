"use client";

import type { FunnelStageData } from "../types/analytics.types";

interface FunnelChartProps {
  stages: FunnelStageData[];
  className?: string;
}

/** Funnel visualization — horizontal bars that shrink per stage */
export function FunnelChart({ stages, className = "" }: FunnelChartProps) {
  if (!stages.length) return null;

  const maxCount = stages[0].count;

  // Generate gradient colors from primary to muted
  const getColor = (index: number, total: number) => {
    const hue = 20 + index * Math.floor(160 / Math.max(total - 1, 1));
    const saturation = 70 - index * 2;
    const lightness = 45 + index * 1.5;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {stages.map((stage, index) => {
        const widthPercent = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
        const color = getColor(index, stages.length);

        return (
          <div key={stage.stage} className="group">
            <div className="flex items-center gap-4">
              <div
                className="relative h-12 rounded-xl flex items-center justify-between px-4 text-white transition-all duration-700 min-w-[180px]"
                style={{
                  width: `${Math.max(widthPercent, 15)}%`,
                  background: `linear-gradient(135deg, ${color}, ${color}dd)`,
                }}
              >
                <span className="text-sm font-medium truncate">{stage.label}</span>
                <span className="text-sm font-bold ml-2">{stage.count.toLocaleString()}</span>
              </div>
              {stage.rate !== null && (
                <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {stage.rate.toFixed(1)}% from previous
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
