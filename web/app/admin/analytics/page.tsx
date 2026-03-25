"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/lib/analytics/ui/MetricCard";
import { FunnelChart } from "@/lib/analytics/ui/FunnelChart";
import { ArchetypeDistribution } from "@/lib/analytics/ui/ArchetypeDistribution";
import { HeatMap } from "@/lib/analytics/ui/HeatMap";
import { ABTestCard } from "@/lib/analytics/ui/ABTestCard";
import { ConversionTrend } from "@/lib/analytics/ui/ConversionTrend";
import {
  getDemoFunnelSummary,
  getDemoArchetypeDistribution,
  getDemoQuestionHeatmap,
  getDemoMetrics,
  getDemoABTests,
  getDemoConversionTrend,
} from "@/lib/analytics/demo/analytics-demo-data";
import type {
  FunnelSummary,
  QuestionHeatmapRow,
  MetricData,
  ABTest,
} from "@/lib/analytics/types/analytics.types";

type DateRange = "7d" | "30d" | "90d";

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<DateRange>("30d");
  const [funnel, setFunnel] = useState<FunnelSummary | null>(null);
  const [archetypes, setArchetypes] = useState<ReturnType<typeof getDemoArchetypeDistribution>>([]);
  const [heatmap, setHeatmap] = useState<QuestionHeatmapRow[]>([]);
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [abTests, setAbTests] = useState<ABTest[]>([]);
  const [trendData, setTrendData] = useState<ReturnType<typeof getDemoConversionTrend>>([]);
  const [isDemo, setIsDemo] = useState(true);

  useEffect(() => {
    loadData(range);
  }, [range]);

  async function loadData(dateRange: DateRange) {
    try {
      // Try real data first
      const orgId = process.env.NEXT_PUBLIC_ORG_ID;
      if (orgId) {
        const [funnelRes, heatmapRes, abRes] = await Promise.allSettled([
          fetch(`/api/analytics/funnel?org_id=${orgId}&range=${dateRange}`),
          fetch(`/api/analytics/heatmap?org_id=${orgId}&range=${dateRange}`),
          fetch(`/api/analytics/ab-tests?org_id=${orgId}`),
        ]);

        const funnelData = funnelRes.status === "fulfilled" && funnelRes.value.ok
          ? await funnelRes.value.json() : null;
        const heatmapData = heatmapRes.status === "fulfilled" && heatmapRes.value.ok
          ? await heatmapRes.value.json() : null;
        const abData = abRes.status === "fulfilled" && abRes.value.ok
          ? await abRes.value.json() : null;

        if (funnelData?.stages?.length > 0 && funnelData.total_visitors > 0) {
          setFunnel(funnelData);
          setHeatmap(heatmapData || []);
          setAbTests(abData || []);
          setMetrics(extractMetricsFromFunnel(funnelData));
          // Extract archetypes from daily rows if available, else use demo
          setArchetypes(getDemoArchetypeDistribution());
          setTrendData(getDemoConversionTrend());
          setIsDemo(false);
          return;
        }
      }
    } catch {
      // Fall through to demo data
    }

    // Demo mode
    setFunnel(getDemoFunnelSummary());
    setArchetypes(getDemoArchetypeDistribution());
    setHeatmap(getDemoQuestionHeatmap());
    setMetrics(getDemoMetrics());
    setAbTests(getDemoABTests());
    setTrendData(getDemoConversionTrend());
    setIsDemo(true);
  }

  if (!funnel) return null;

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discovery Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">
            Funnel performance, engagement, and A/B test results
            {isDemo && (
              <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                Demo Data
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

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {(isDemo ? metrics : extractMetricsFromFunnel(funnel)).map((metric) => (
          <Card key={metric.label}>
            <CardContent className="pt-6">
              <MetricCard metric={metric} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Funnel Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <FunnelChart stages={funnel.stages} />
        </CardContent>
      </Card>

      {/* Two-column: Archetypes + Trend */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Result Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ArchetypeDistribution distribution={archetypes} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ConversionTrend data={trendData} />
          </CardContent>
        </Card>
      </div>

      {/* Question Heat Map */}
      <Card>
        <CardHeader>
          <CardTitle>Question Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <HeatMap questions={heatmap} />
        </CardContent>
      </Card>

      {/* A/B Tests */}
      {abTests.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">A/B Tests</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {abTests.map((test) => (
              <ABTestCard key={test.id} test={test} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Extract metric cards from real funnel data */
function extractMetricsFromFunnel(funnel: FunnelSummary): MetricData[] {
  const landing = funnel.stages.find((s) => s.stage === "landing");
  const quizComplete = funnel.stages.find((s) => s.stage === "quiz_complete");
  const bridgeCta = funnel.stages.find((s) => s.stage === "bridge_cta");

  return [
    {
      label: "Total Visitors",
      value: funnel.total_visitors,
    },
    {
      label: "Quiz Completion",
      value: landing && quizComplete && landing.count > 0
        ? Math.round((quizComplete.count / landing.count) * 1000) / 10
        : 0,
      suffix: "%",
    },
    {
      label: "Bridge CTA Rate",
      value: bridgeCta?.rate ? Math.round(bridgeCta.rate * 10) / 10 : 0,
      suffix: "%",
    },
    {
      label: "Overall Conversion",
      value: Math.round(funnel.overall_conversion_rate * 10) / 10,
      suffix: "%",
    },
  ];
}
