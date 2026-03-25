"use client";

import type { QuestionHeatmapRow } from "../types/analytics.types";

interface HeatMapProps {
  questions: QuestionHeatmapRow[];
  className?: string;
}

/** Per-question heat map showing time, drop-off, and input method */
export function HeatMap({ questions, className = "" }: HeatMapProps) {
  if (!questions.length) return null;

  const maxDuration = Math.max(...questions.map((q) => q.avg_duration_ms));

  const formatDuration = (ms: number) => {
    const seconds = Math.round(ms / 1000);
    return `${seconds}s`;
  };

  const getHeatColor = (ratio: number) => {
    // 0 = cool (low time), 1 = hot (high time)
    if (ratio < 0.4) return "bg-blue-100 text-blue-800";
    if (ratio < 0.6) return "bg-yellow-100 text-yellow-800";
    if (ratio < 0.8) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-500">Question</th>
            <th className="text-center py-3 px-2 font-medium text-gray-500">Avg Time</th>
            <th className="text-center py-3 px-2 font-medium text-gray-500">Drop-off</th>
            <th className="text-center py-3 px-2 font-medium text-gray-500">Voice %</th>
            <th className="text-center py-3 px-2 font-medium text-gray-500">Answers</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => {
            const timeRatio = maxDuration > 0 ? q.avg_duration_ms / maxDuration : 0;
            const heatClass = getHeatColor(timeRatio);

            return (
              <tr key={q.question_index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 font-mono text-xs">Q{q.question_index}</span>
                    <span className="text-gray-700 truncate max-w-[300px]" title={q.question_text}>
                      {q.question_text}
                    </span>
                  </div>
                </td>
                <td className="text-center py-3 px-2">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${heatClass}`}>
                    {formatDuration(q.avg_duration_ms)}
                  </span>
                </td>
                <td className="text-center py-3 px-2">
                  <span
                    className={`text-xs font-medium ${
                      q.dropoff_rate > 8
                        ? "text-red-600"
                        : q.dropoff_rate > 5
                          ? "text-amber-600"
                          : "text-gray-500"
                    }`}
                  >
                    {q.dropoff_rate.toFixed(1)}%
                  </span>
                </td>
                <td className="text-center py-3 px-2">
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-purple-500"
                        style={{ width: `${q.voice_percent}%` }}
                        title={`Voice: ${q.voice_percent}%`}
                      />
                      <div
                        className="h-full bg-blue-400"
                        style={{ width: `${q.text_percent}%` }}
                        title={`Text: ${q.text_percent}%`}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{q.voice_percent}%</span>
                  </div>
                </td>
                <td className="text-center py-3 px-2 text-gray-500">
                  {q.total_answers.toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
