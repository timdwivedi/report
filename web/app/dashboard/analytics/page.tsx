"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/lib/analytics/ui/MetricCard";
import { FunnelChart } from "@/lib/analytics/ui/FunnelChart";
import { ArchetypeDistribution } from "@/lib/analytics/ui/ArchetypeDistribution";
import { ConversionTrend } from "@/lib/analytics/ui/ConversionTrend";
import {
  getDemoFunnelSummary,
  getDemoArchetypeDistribution,
  getDemoMetrics,
  getDemoConversionTrend,
} from "@/lib/analytics/demo/analytics-demo-data";
import type { FunnelSummary, MetricData } from "@/lib/analytics/types/analytics.types";

type DateRange = "7d" | "30d" | "90d";

/**
 * Client-facing analytics dashboard.
 * Shows funnel performance in a simplified view.
 * Automatically falls back to demo data when no real analytics exist.
 */
export default function DashboardAnalyticsPage() {
  const [range, setRange] = useState<DateRange>("30d");
  const [funnel, setFunnel] = useState<FunnelSummary>(getDemoFunnelSummary());
  const [archetypes, setArchetypes] = useState(getDemoArchetypeDistribution());
  const [metrics, setMetrics] = useState<MetricData[]>(getDemoMetrics());
  const [trendData, setTrendData] = useState(getDemoConversionTrend());
  const [isDemo, setIsDemo] = useState(true);

  useEffect(() => {
    loadData(range);
  }, [range]);

  async function loadData(dateRange: DateRange) {
    try {
      const orgId = process.env.NEXT_PUBLIC_ORG_ID;
      if (orgId) {
        const res = await fetch(`/api/analytics/funnel?org_id=${orgId}&range=${dateRange}`);
        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();

        if (data?.stages?.length > 0 && data.total_visitors > 0) {
          setFunnel(data);
          setMetrics(extractClientMetrics(data));
          setArchetypes(getDemoArchetypeDistribution());
          setTrendData(getDemoConversionTrend());
          setIsDemo(false);
          return;
        }
      }
    } catch {
      // Fall through to demo
    }

    setFunnel(getDemoFunnelSummary());
    setArchetypes(getDemoArchetypeDistribution());
    setMetrics(getDemoMetrics());
    setTrendData(getDemoConversionTrend());
    setIsDemo(true);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">
            Your discovery funnel performance
            {isDemo && (
              <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                Sample Data
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(["7d", "30d", "90d"] as DateRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                range === r
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {(isDemo ? metrics : extractClientMetrics(funnel)).map((metric) => (
          <Card key={metric.label}>
            <CardContent className="pt-6">
              <MetricCard metric={metric} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Your Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <FunnelChart stages={funnel.stages} />
        </CardContent>
      </Card>

      {/* Two-column: Archetypes + Trend */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Results Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ArchetypeDistribution distribution={archetypes} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ConversionTrend data={trendData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function extractClientMetrics(funnel: FunnelSummary): MetricData[] {
  const quizStart = funnel.stages.find((s) => s.stage === "quiz_start");
  const quizComplete = funnel.stages.find((s) => s.stage === "quiz_complete");
  const appSubmit = funnel.stages.find((s) => s.stage === "application_submit");

  return [
    {
      label: "People Reached",
      value: funnel.total_visitors,
    },
    {
      label: "Started Quiz",
      value: quizStart?.count || 0,
    },
    {
      label: "Completed Quiz",
      value: quizComplete?.count || 0,
    },
    {
      label: "Applications",
      value: appSubmit?.count || 0,
    },
  ];
}
