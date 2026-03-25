"use client"

/**
 * Quoting Speed ROI Calculator - Signature Element
 *
 * The revenue engine diagnostic that exposes the invisible cost of
 * manual spreadsheet-based quoting: hours burned + deals lost to speed.
 *
 * This makes Trevor's problem UNDENIABLE with specific dollar amounts.
 */

import { useState } from "react";
import { AnimatedCounter } from "@/components/shared";
import { ArrowLeft, Clock, TrendingDown, Hourglass, Zap, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function CalculatorPage() {
  // ============================================================================
  // STATE - Calculator Inputs (matching Creative Brief spec exactly)
  // ============================================================================

  const [projectsPerMonth, setProjectsPerMonth] = useState(20);
  const [avgDealValue, setAvgDealValue] = useState(8500);
  const [currentCloseRate, setCurrentCloseRate] = useState(22);
  const [hoursPerQuote, setHoursPerQuote] = useState(3.5);
  const [hourlyValue, setHourlyValue] = useState(65);
  const [timeToQuote, setTimeToQuote] = useState<"Same day" | "24 hours" | "48 hours" | "3-5 days" | "1 week+">("48 hours");
  const [lostDealsToSpeed, setLostDealsToSpeed] = useState(3);

  // ============================================================================
  // CALCULATIONS - Follow Creative Brief formulas CHARACTER FOR CHARACTER
  // ============================================================================

  // Card 1: Quoting Labor Cost
  const quotingLaborCost = projectsPerMonth * hoursPerQuote * hourlyValue;

  // Card 2: Deals Lost to Slow Quoting
  const dealsLostRevenue = lostDealsToSpeed * avgDealValue;

  // Card 3: Pipeline Velocity Lost
  const timeToQuoteDaysMap = {
    "Same day": 2,
    "24 hours": 3,
    "48 hours": 5,
    "3-5 days": 7,
    "1 week+": 10,
  };
  const pipelineDays = timeToQuoteDaysMap[timeToQuote];
  const pipelineVelocityLostRevenue = pipelineDays * projectsPerMonth * 0.15;

  // Card 4: With BrandOps Instant Quoting
  const projectedCloseRate = currentCloseRate + 8; // +8% lift from instant quoting
  const currentMonthlyRevenue = projectsPerMonth * avgDealValue * (currentCloseRate / 100);
  const projectedMonthlyRevenue = projectsPerMonth * avgDealValue * (projectedCloseRate / 100);
  const quotingTimeSaved = projectsPerMonth * hoursPerQuote;

  // Card 5: Annual Revenue Impact (THE PUNCHLINE)
  const laborCostSaved = quotingLaborCost;
  const dealsRecovered = dealsLostRevenue;
  const monthlyImpact = (projectedMonthlyRevenue - currentMonthlyRevenue) + laborCostSaved + dealsRecovered;
  const annualImpact = monthlyImpact * 12;
  const subscriptionCost = 499; // Growth tier from spec
  const roiMultiple = Math.round(annualImpact / (subscriptionCost * 12));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-primary-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
          <Link href="/login" className="text-sm font-medium text-primary-600 hover:text-primary-700">
            Log In
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold font-heading text-slate-900 mb-4">
            Quoting Speed Revenue Impact Calculator
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Find out exactly how much revenue you're losing to slow quoting — and what instant pricing would unlock.
          </p>
        </div>

        {/* Calculator Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* LEFT COLUMN: Inputs */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-6">
            <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6">Your Current State</h2>

            {/* Input 1: Projects per Month */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Average projects per month
              </label>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={projectsPerMonth}
                onChange={(e) => setProjectsPerMonth(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-3xl font-bold font-mono text-primary-600">{projectsPerMonth}</span>
                <span className="text-sm text-slate-500">Active quote requests you handle monthly</span>
              </div>
            </div>

            {/* Input 2: Average Deal Value */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Average deal value ($)
              </label>
              <input
                type="range"
                min="1000"
                max="50000"
                step="500"
                value={avgDealValue}
                onChange={(e) => setAvgDealValue(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-3xl font-bold font-mono text-primary-600">${avgDealValue.toLocaleString()}</span>
                <span className="text-sm text-slate-500">Typical project revenue when closed</span>
              </div>
            </div>

            {/* Input 3: Current Close Rate */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Current close rate (%)
              </label>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={currentCloseRate}
                onChange={(e) => setCurrentCloseRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-3xl font-bold font-mono text-primary-600">{currentCloseRate}%</span>
                <span className="text-sm text-slate-500">Percentage of quotes that turn into confirmed orders</span>
              </div>
            </div>

            {/* Input 4: Hours per Quote */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Hours per quote (manual)
              </label>
              <input
                type="range"
                min="0.5"
                max="8"
                step="0.5"
                value={hoursPerQuote}
                onChange={(e) => setHoursPerQuote(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-3xl font-bold font-mono text-primary-600">{hoursPerQuote}</span>
                <span className="text-sm text-slate-500">Time spent calculating pricing from spreadsheets per project</span>
              </div>
            </div>

            {/* Input 5: Hourly Value */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Your hourly value ($)
              </label>
              <input
                type="range"
                min="20"
                max="150"
                step="5"
                value={hourlyValue}
                onChange={(e) => setHourlyValue(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-3xl font-bold font-mono text-primary-600">${hourlyValue}</span>
                <span className="text-sm text-slate-500">What you'd charge for 1 hour of your sales/consulting time</span>
              </div>
            </div>

            {/* Input 6: Time to Quote */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Current time-to-quote
              </label>
              <select
                value={timeToQuote}
                onChange={(e) => setTimeToQuote(e.target.value as typeof timeToQuote)}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="Same day">Same day</option>
                <option value="24 hours">24 hours</option>
                <option value="48 hours">48 hours</option>
                <option value="3-5 days">3-5 days</option>
                <option value="1 week+">1 week+</option>
              </select>
              <p className="text-sm text-slate-500 mt-2">How long from request to delivered pricing</p>
            </div>

            {/* Input 7: Lost Deals to Speed */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Lost deals to speed (monthly estimate)
              </label>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={lostDealsToSpeed}
                onChange={(e) => setLostDealsToSpeed(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-3xl font-bold font-mono text-primary-600">{lostDealsToSpeed}</span>
                <span className="text-sm text-slate-500">Projects where client chose a competitor who quoted faster</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Outputs */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6">The Hidden Cost</h2>

            {/* Card 1: Quoting Labor Cost */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-sm border-2 border-red-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-900 mb-2">Quoting Labor Cost</h3>
                  <div className="text-4xl font-bold font-mono text-red-600 mb-1">
                    ${quotingLaborCost.toLocaleString()}/mo
                  </div>
                  <p className="text-sm text-red-700">Burned on manual pricing calculations instead of selling</p>
                </div>
              </div>
            </div>

            {/* Card 2: Deals Lost to Slow Quoting */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm border-2 border-red-300 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-900 mb-2">Deals Lost to Slow Quoting</h3>
                  <div className="text-4xl font-bold font-mono text-red-600 mb-1">
                    ${dealsLostRevenue.toLocaleString()}/mo
                  </div>
                  <p className="text-sm text-red-700">Revenue that went to competitors who quoted faster</p>
                </div>
              </div>
            </div>

            {/* Card 3: Pipeline Velocity Lost */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow-sm border-2 border-amber-300 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Hourglass className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-amber-900 mb-2">Pipeline Velocity Lost</h3>
                  <div className="text-3xl font-bold font-mono text-amber-600 mb-1">
                    {pipelineDays} days avg
                  </div>
                  <p className="text-sm text-amber-700">Average time deals spend waiting for pricing</p>
                </div>
              </div>
            </div>

            {/* Card 4: With BrandOps Instant Quoting */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl shadow-lg border-2 border-emerald-500 p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-emerald-900 mb-2">With BrandOps Instant Quoting</h3>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-emerald-700">Close Rate:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold font-mono text-emerald-600">{projectedCloseRate}%</span>
                    <span className="text-xs text-emerald-600 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +{projectedCloseRate - currentCloseRate}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-emerald-700">Monthly Revenue:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold font-mono text-emerald-600">
                      ${Math.round(projectedMonthlyRevenue).toLocaleString()}
                    </span>
                    <span className="text-xs text-emerald-600 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +${Math.round(projectedMonthlyRevenue - currentMonthlyRevenue).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-emerald-700">Time Saved:</span>
                  <span className="text-lg font-bold font-mono text-emerald-600">{quotingTimeSaved} hrs/mo</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-emerald-700">Time-to-Quote:</span>
                  <span className="text-lg font-bold font-mono text-emerald-600">10 minutes</span>
                </div>
              </div>
            </div>

            {/* Card 5: Annual Revenue Impact (THE PUNCHLINE) */}
            <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl shadow-2xl border-2 border-emerald-600 p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none"></div>
              <div className="relative">
                <h3 className="text-sm font-medium text-emerald-900 mb-4 uppercase tracking-wide">Annual Revenue Impact</h3>
                <div className="mb-4">
                  <AnimatedCounter
                    value={annualImpact}
                    prefix="$"
                    duration={2}
                    className="text-5xl lg:text-6xl font-bold font-mono text-emerald-600"
                  />
                </div>
                <p className="text-sm text-emerald-700 mb-6">Additional revenue in your first year with instant quoting</p>
                <div className="pt-6 border-t border-emerald-300">
                  <p className="text-xl font-bold text-slate-700">
                    <span className="text-3xl font-mono text-emerald-600">{roiMultiple}x</span> return on your BrandOps subscription
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stop Losing ${Math.round(monthlyImpact).toLocaleString()}/Month
          </h2>
          <p className="text-primary-100 text-lg mb-6 max-w-2xl mx-auto">
            BrandOps gives you instant matrix-based quoting, automated pricing calculations, and a client portal
            — so you can close deals faster and spend your time selling, not doing spreadsheet math.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-white text-primary-600 rounded-lg font-bold text-lg hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl"
            >
              Start Free Trial
            </Link>
            <Link
              href="/"
              className="px-8 py-4 bg-primary-500 text-white rounded-lg font-bold text-lg hover:bg-primary-400 transition-all border-2 border-white/20"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
