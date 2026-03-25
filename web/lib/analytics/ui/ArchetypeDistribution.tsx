"use client";

interface ArchetypeData {
  archetype: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

interface ArchetypeDistributionProps {
  distribution: ArchetypeData[];
  className?: string;
}

/** Archetype/result type distribution with horizontal bars */
export function ArchetypeDistribution({
  distribution,
  className = "",
}: ArchetypeDistributionProps) {
  if (!distribution.length) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      {distribution.map((archetype) => (
        <div key={archetype.archetype} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">{archetype.label}</span>
            <div className="flex items-center gap-3">
              <span className="text-gray-500">
                {archetype.count} submission{archetype.count !== 1 ? "s" : ""}
              </span>
              <span className="font-mono text-gray-900 font-bold min-w-[4rem] text-right">
                {archetype.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${archetype.percentage}%`,
                backgroundColor: archetype.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
