"use client"

/**
 * Dashboard Home Page
 *
 * Main dashboard with stats, activity feed, and quick actions.
 * ALL data imports from @/lib/demo.
 */

import AnimatedCounter from "@/components/shared/AnimatedCounter";
import { StatCard } from "@/components/shared";
import { getDemoDashboardStats, getDemoRecentActivity, getDemoQuickActions, getDemoRevenueTrend, getDemoPipelineStages } from "@/lib/demo/demo-data-provider";
import { TrendingUp, Kanban, Package, DollarSign, Clock, Eye, ArrowRight } from "lucide-react";
import Link from "next/link";

// Import data at file scope (outside component)
const STATS = getDemoDashboardStats();
const RECENT_ACTIVITY = getDemoRecentActivity();
const QUICK_ACTIONS = getDemoQuickActions();
const REVENUE_TREND = getDemoRevenueTrend();
const PIPELINE_STAGES = getDemoPipelineStages();

// Inline SVG sparkline for revenue trend
function RevenueSparkline({ data }: { data: { month: string; revenue: number }[] }) {
  if (data.length < 2) return null;
  const values = data.map(d => d.revenue);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const padding = 2;
  const points = values.map((v, i) => {
    const x = padding + (i / (values.length - 1)) * (w - padding * 2);
    const y = h - padding - ((v - min) / range) * (h - padding * 2);
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} className="inline-block ml-2 opacity-70">
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-amber-500"
      />
      <circle
        cx={points[points.length - 1].split(",")[0]}
        cy={points[points.length - 1].split(",")[1]}
        r="2.5"
        className="fill-amber-500"
      />
    </svg>
  );
}

export default function DashboardPage() {
  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div>
        <h1 className="text-3xl font-bold font-heading text-slate-900">
          Good {greeting}, Trevor
        </h1>
        <p className="text-slate-500 mt-1">Here's what's happening with your pipeline today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          label="Pipeline Value"
          value={
            <AnimatedCounter
              value={STATS.pipeline_value}
              prefix="$"
              duration={1.5}
              className="text-3xl font-bold font-mono text-slate-900"
            />
          }
          change={`+${STATS.pipeline_change}%`}
          changeType="positive"
          icon={<TrendingUp className="w-5 h-5 text-primary-600" />}
        />
        <StatCard
          label="Active Projects"
          value={
            <AnimatedCounter
              value={STATS.active_projects}
              duration={1.2}
              className="text-3xl font-bold font-mono text-slate-900"
            />
          }
          change={`+${STATS.active_projects_change} this week`}
          changeType="positive"
          icon={<Kanban className="w-5 h-5 text-primary-600" />}
        />
        <StatCard
          label="Orders In Production"
          value={
            <AnimatedCounter
              value={STATS.orders_in_production}
              duration={1}
              className="text-3xl font-bold font-mono text-slate-900"
            />
          }
          change={`${STATS.orders_change} vs last week`}
          changeType="negative"
          icon={<Package className="w-5 h-5 text-primary-600" />}
        />
        <StatCard
          label="Monthly Revenue"
          value={
            <div className="flex items-center">
              <AnimatedCounter
                value={STATS.monthly_revenue}
                prefix="$"
                duration={1.8}
                className="text-3xl font-bold font-mono text-slate-900"
              />
              <RevenueSparkline data={REVENUE_TREND} />
            </div>
          }
          change={`+${STATS.monthly_revenue_change}% vs prior`}
          changeType="positive"
          icon={<DollarSign className="w-5 h-5 text-amber-600" />}
        />
        <StatCard
          label="Avg Quote Time"
          value={
            <div className="flex items-baseline gap-2">
              <AnimatedCounter
                value={STATS.avg_quote_time_seconds}
                duration={1}
                className="text-3xl font-bold font-mono text-slate-900"
              />
              <span className="text-lg text-slate-500">sec</span>
            </div>
          }
          change={`${STATS.quote_time_change}%`}
          changeType="positive"
          icon={<Clock className="w-5 h-5 text-emerald-600" />}
        />
        <StatCard
          label="Client Portal Views"
          value={
            <AnimatedCounter
              value={STATS.portal_views}
              duration={1.4}
              className="text-3xl font-bold font-mono text-slate-900"
            />
          }
          change={`+${STATS.portal_views_change}%`}
          changeType="positive"
          icon={<Eye className="w-5 h-5 text-primary-600" />}
        />
      </div>

      {/* Pipeline Summary Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold font-heading text-slate-900">Pipeline Summary</h3>
          <span className="text-sm font-mono font-semibold text-slate-600">
            ${PIPELINE_STAGES.reduce((s, p) => s + p.total_value, 0).toLocaleString()} total
          </span>
        </div>
        <div className="flex items-center gap-1 h-8 rounded-lg overflow-hidden">
          {PIPELINE_STAGES.map((stage, i) => {
            const total = PIPELINE_STAGES.reduce((s, p) => s + p.total_value, 0);
            const pct = Math.max(8, Math.round((stage.total_value / total) * 100));
            const colors = [
              { bg: "bg-slate-200", text: "text-slate-700" },
              { bg: "bg-blue-200", text: "text-blue-700" },
              { bg: "bg-indigo-200", text: "text-indigo-700" },
              { bg: "bg-purple-200", text: "text-purple-700" },
              { bg: "bg-amber-200", text: "text-amber-700" },
              { bg: "bg-emerald-200", text: "text-emerald-700" },
            ];
            const color = colors[i] || colors[0];
            return (
              <div key={stage.stage} className={`h-full ${color.bg} flex items-center justify-center px-3 group relative`} style={{ width: `${pct}%` }}>
                <span className={`text-xs font-medium ${color.text} truncate`}>
                  {stage.stage}: {stage.project_count}
                </span>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] font-mono px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                  ${stage.total_value.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity Feed */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200">
          <h3 className="text-lg font-bold font-heading text-slate-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {RECENT_ACTIVITY.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors">
                {/* Colored Dot */}
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  item.type === "project" ? "bg-blue-500" :
                  item.type === "order" ? "bg-emerald-500" :
                  item.type === "client" ? "bg-purple-500" :
                  item.type === "approval" ? "bg-amber-500" :
                  "bg-slate-500"
                }`} />
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{item.action}</p>
                  <p className="text-sm text-slate-600 truncate">{item.detail}</p>
                  <p className="text-xs text-slate-400 mt-1">{item.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200">
          <h3 className="text-lg font-bold font-heading text-slate-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.id}
                href={action.href}
                className="group bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-4 hover:from-primary-100 hover:to-primary-200 transition-all border border-primary-200 hover:border-primary-300 hover:shadow-md"
              >
                <div className="text-3xl mb-2">{action.icon}</div>
                <h4 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-primary-700 transition-colors">
                  {action.label}
                </h4>
                <p className="text-xs text-slate-600 mb-2">{action.description}</p>
                <div className="flex items-center text-primary-600 text-xs font-medium">
                  <span>Go</span>
                  <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
