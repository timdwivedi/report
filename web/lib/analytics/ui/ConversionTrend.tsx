"use client";

interface TrendPoint {
  date: string;
  visitors: number;
  quiz_starts: number;
  quiz_completes: number;
  applications: number;
  conversion_rate: number;
}

interface ConversionTrendProps {
  data: TrendPoint[];
  className?: string;
}

/** Simple conversion rate trend visualization using CSS bars */
export function ConversionTrend({ data, className = "" }: ConversionTrendProps) {
  if (!data.length) return null;

  const maxRate = Math.max(...data.map((d) => d.conversion_rate), 1);
  const avgRate =
    data.reduce((sum, d) => sum + d.conversion_rate, 0) / data.length;

  // Show last 14 days max for readability
  const displayData = data.slice(-14);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-2xl font-bold text-gray-900">
            {avgRate.toFixed(1)}%
          </span>
          <span className="text-sm text-gray-500 ml-2">avg conversion</span>
        </div>
        <span className="text-xs text-gray-400">Last {displayData.length} days</span>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-1 h-32">
        {displayData.map((point) => {
          const heightPercent = maxRate > 0 ? (point.conversion_rate / maxRate) * 100 : 0;
          const isAboveAvg = point.conversion_rate >= avgRate;

          return (
            <div
              key={point.date}
              className="flex-1 flex flex-col items-center group relative"
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                  <p className="font-semibold">{formatDate(point.date)}</p>
                  <p>{point.visitors} visitors</p>
                  <p>{point.applications} applications</p>
                  <p>{point.conversion_rate.toFixed(1)}% conversion</p>
                </div>
              </div>

              {/* Bar */}
              <div
                className={`w-full rounded-t transition-all duration-300 cursor-pointer hover:opacity-80 ${
                  isAboveAvg ? "bg-emerald-400" : "bg-gray-300"
                }`}
                style={{ height: `${Math.max(heightPercent, 4)}%` }}
              />
            </div>
          );
        })}
      </div>

      {/* Average line label */}
      <div className="flex items-center gap-2 mt-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400">avg {avgRate.toFixed(1)}%</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Date labels */}
      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-400">
          {displayData.length > 0 ? formatDate(displayData[0].date) : ""}
        </span>
        <span className="text-xs text-gray-400">
          {displayData.length > 0 ? formatDate(displayData[displayData.length - 1].date) : ""}
        </span>
      </div>
    </div>
  );
}
