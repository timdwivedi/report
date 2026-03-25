"use client";

import type { MetricData } from "../types/analytics.types";

interface MetricCardProps {
  metric: MetricData;
  className?: string;
}

export function MetricCard({ metric, className = "" }: MetricCardProps) {
  const { label, value, suffix, prefix, trend } = metric;

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">
        {prefix}
        {typeof value === "number" ? value.toLocaleString() : value}
        {suffix}
      </p>
      {trend && (
        <div className="mt-2 flex items-center gap-1.5">
          <span
            className={`text-sm font-medium ${
              trend.direction === "up"
                ? "text-emerald-600"
                : trend.direction === "down"
                  ? "text-red-600"
                  : "text-gray-500"
            }`}
          >
            {trend.direction === "up" ? "+" : trend.direction === "down" ? "-" : ""}
            {trend.percent}%
          </span>
          <span className="text-xs text-gray-400">{trend.period}</span>
        </div>
      )}
    </div>
  );
}
