"use client"

import { motion } from "motion/react"

interface FeatureVisualProps {
  variant: 'dashboard' | 'chart' | 'form' | 'report' | 'speed' | 'funnel'
  accent?: string
  className?: string
}

export default function FeatureVisual({
  variant,
  accent = '#3B82F6',
  className = '',
}: FeatureVisualProps) {
  const visuals: Record<string, () => JSX.Element> = {
    dashboard: () => <DashboardVisual accent={accent} />,
    chart: () => <ChartVisual accent={accent} />,
    form: () => <FormVisual accent={accent} />,
    report: () => <ReportVisual accent={accent} />,
    speed: () => <SpeedVisual accent={accent} />,
    funnel: () => <FunnelVisual accent={accent} />,
  }

  const Visual = visuals[variant] || visuals.dashboard

  return (
    <div className={`relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 md:p-6 ${className}`}>
      {/* Cinematic ambient background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 blur-[60px] opacity-20 pointer-events-none"
        style={{ backgroundColor: accent }}
      />
      <Visual />
    </div>
  )
}

function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative w-full h-full max-h-[100%] rounded-xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] flex flex-col bg-white/80 backdrop-blur-xl border border-white/60"
    >
      {/* Outer Glow */}
      <div className="absolute inset-0 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,1)] pointer-events-none z-20" />

      {/* MacOS Chrome */}
      <div className="flex items-center gap-2 px-4 py-3 bg-white/50 border-b border-slate-200/50 relative z-10 backdrop-blur-md">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
        </div>
        <div className="mx-auto flex-1 max-w-[60%] h-5 rounded-md bg-white border border-slate-200 shadow-sm flex items-center justify-center">
          <div className="w-1/3 h-1.5 rounded-full bg-slate-200" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-slate-50/50 p-4 md:p-5 relative z-0 overflow-hidden">
        {children}
      </div>
    </motion.div>
  )
}

function DashboardVisual({ accent }: { accent: string }) {
  return (
    <BrowserFrame>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Revenue', val: '$45.2K', up: true },
          { label: 'Active', val: '18', up: true },
          { label: 'Close Rate', val: '28%', up: false }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ y: 10, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 + 0.2 }}
            className="rounded-lg bg-white p-3 border border-slate-200 shadow-sm card-depth relative overflow-hidden"
          >
            {/* Very subtle glow */}
            <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full blur-md opacity-20" style={{ backgroundColor: accent }} />
            <div className="text-[10px] font-medium text-slate-500 mb-1">{stat.label}</div>
            <div className="text-sm md:text-lg font-heading font-bold text-slate-900">{stat.val}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Chart Area */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex-1 min-h-[100px] h-[calc(100%-80px)] rounded-xl bg-white border border-slate-200 shadow-sm card-depth p-4 flex flex-col justify-end gap-1.5 relative overflow-hidden"
      >
        <div className="absolute top-4 left-4 flex gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: accent }} />
          <div className="text-[10px] font-semibold text-slate-700">Pipeline Growth</div>
        </div>

        <div className="flex items-end gap-2 w-full h-[70%] px-2 pt-6">
          {[40, 65, 45, 80, 55, 90, 70, 85].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              whileInView={{ height: `${h}%` }}
              transition={{ delay: 0.5 + i * 0.05, type: 'spring' }}
              className="flex-1 rounded-t-sm relative group"
              style={{
                background: i === 7
                  ? `linear-gradient(to top, ${accent}, color-mix(in srgb, ${accent} 80%, white))`
                  : '#E2E8F0',
                boxShadow: i === 7 ? `0 -4px 12px ${accent}40` : 'none'
              }}
            >
              {i === 7 && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] py-0.5 px-2 rounded-full font-bold shadow-lg">
                  +24%
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </BrowserFrame>
  )
}

function ChartVisual({ accent }: { accent: string }) {
  const points = [80, 70, 65, 55, 60, 45, 50, 30, 20, 15, 5]
  const width = 300
  const height = 120
  const step = width / (points.length - 1)
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${height - (p / 100) * height}`).join(' ')
  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`

  return (
    <BrowserFrame>
      <div className="h-full flex flex-col rounded-xl bg-white border border-slate-200 card-depth p-4 md:p-6 shadow-sm relative overflow-hidden">
        {/* Glow */}
        <div className="absolute bottom-0 right-0 w-32 h-32 blur-[40px] opacity-10" style={{ backgroundColor: accent }} />

        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <div className="h-4 w-24 rounded font-bold text-slate-900 text-sm md:text-lg">Avg Quote Time</div>
            <div className="text-[10px] text-slate-500">Trailing 30 days</div>
          </div>
          <div className="text-right">
            <div className="text-sm md:text-xl font-bold font-mono tracking-tight" style={{ color: accent }}>10.4m</div>
            <div className="text-[10px] font-bold text-emerald-500 bg-emerald-50 inline-block px-1.5 py-0.5 rounded-full mt-1">-85%</div>
          </div>
        </div>

        <div className="flex-1 relative mt-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accent} stopOpacity="0.4" />
                <stop offset="100%" stopColor={accent} stopOpacity="0.0" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <motion.path
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              d={areaD} fill="url(#chartFill)"
            />
            <motion.path
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              d={pathD} fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)"
            />
            <motion.circle
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.5, type: "spring", stiffness: 300, damping: 20 }}
              cx={width} cy={height - (points[points.length - 1] / 100) * height} r="4" fill="white" stroke={accent} strokeWidth="2" className="shadow-lg"
            />
          </svg>
        </div>
      </div>
    </BrowserFrame>
  )
}

function FormVisual({ accent }: { accent: string }) {
  return (
    <BrowserFrame>
      <div className="bg-white rounded-xl border border-slate-200 card-depth p-4 shadow-sm h-full flex flex-col">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: accent }} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Custom Uniform Program</div>
            <div className="text-[10px] text-slate-500">Progressive Insurance</div>
          </div>
        </div>

        <div className="space-y-3 flex-1">
          {/* Progress sequence */}
          <div className="flex items-center justify-between mb-4">
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: '66%' }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ backgroundColor: accent }}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-600 ml-3">Step 2/3</span>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-semibold text-slate-700">Select Quantities</div>
            <div className="grid grid-cols-4 gap-2">
              {['S', 'M', 'L', 'XL'].map((size, i) => (
                <div key={size} className="rounded-md border border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-2">
                  <div className="text-[10px] font-bold text-slate-500 mb-1">{size}</div>
                  <div className="w-full bg-white border border-slate-200 text-center text-[10px] py-1 rounded shadow-sm">
                    {i === 1 ? '150' : i === 2 ? '250' : '50'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="mt-auto pt-2"
          >
            <div className="w-full py-2.5 rounded-lg flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.1)] text-white text-[11px] font-bold cursor-pointer transition-colors"
              style={{ backgroundColor: accent, boxShadow: `0 4px 14px ${accent}40` }}>
              Confirm Quantities
            </div>
          </motion.div>
        </div>
      </div>
    </BrowserFrame>
  )
}

function ReportVisual({ accent }: { accent: string }) {
  return (
    <BrowserFrame>
      {/* Intentionally identical logic to Form, Chart etc but different visuals. 
          Use glass bento feeling. */}
      <div className="grid grid-cols-2 gap-3 h-full">
        {/* Left tall card */}
        <div className="col-span-1 rounded-xl bg-slate-900 text-white p-4 shadow-lg relative overflow-hidden border border-slate-700">
          <div className="absolute -top-10 -left-10 w-24 h-24 blur-2xl opacity-40 rounded-full" style={{ backgroundColor: accent }} />

          <div className="text-[10px] text-slate-400 font-medium mb-1 relative z-10">Monthly Profit</div>
          <div className="text-xl font-bold font-mono relative z-10">$18.4K</div>
          <div className="text-[9px] text-emerald-400 font-bold mb-4 relative z-10">+12% vs last month</div>

          <div className="mt-auto space-y-2 relative z-10 pt-4">
            <div className="flex justify-between text-[9px]">
              <span className="text-slate-400">Total Revenue</span>
              <span className="font-bold">$49.2K</span>
            </div>
            <div className="flex justify-between text-[9px]">
              <span className="text-slate-400">Decorator Cost</span>
              <span className="font-bold">$15.8K</span>
            </div>
            <div className="flex justify-between text-[9px]">
              <span className="text-slate-400">Blank Cost</span>
              <span className="font-bold">$15.0K</span>
            </div>
          </div>
        </div>

        {/* Right stacked cards */}
        <div className="col-span-1 flex flex-col gap-3">
          <div className="flex-1 bg-white rounded-xl border border-slate-200 card-depth p-3 shadow-sm flex flex-col justify-center">
            <div className="text-[9px] text-slate-500 font-medium mb-1 uppercase tracking-wider">Top Client</div>
            <div className="text-sm font-bold text-slate-900">Vanderbilt Med</div>
            <div className="text-[10px] font-bold mt-1" style={{ color: accent }}>3 active projects</div>
          </div>
          <div className="flex-1 bg-white rounded-xl border border-slate-200 card-depth p-3 shadow-sm flex flex-col justify-center relative overflow-hidden">
            {/* Progress circle */}
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#F1F5F9" strokeWidth="4" />
                  <motion.circle
                    initial={{ strokeDasharray: `0 ${2 * Math.PI * 14}` }}
                    whileInView={{ strokeDasharray: `${75 * 2 * Math.PI / 100} ${2 * Math.PI * 14}` }}
                    transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
                    cx="18" cy="18" r="14" fill="none" stroke={accent} strokeWidth="4" strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-[10px] text-slate-900">75%</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-900 leading-tight">Win Rate</div>
                <div className="text-[8px] text-slate-500">Last 30 days</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BrowserFrame>
  )
}

function SpeedVisual({ accent }: { accent: string }) {
  return (
    <BrowserFrame>
      <div className="h-full w-full bg-white rounded-xl border border-slate-200 card-depth shadow-sm relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
        {/* Radar pulses */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            animate={{ scale: [1, 2.5], opacity: [0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            className="absolute rounded-full w-24 h-24 border-2" style={{ borderColor: accent }}
          />
          <motion.div
            animate={{ scale: [1, 2.5], opacity: [0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 1 }}
            className="absolute rounded-full w-24 h-24 border-2" style={{ borderColor: accent }}
          />
        </div>

        <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl relative z-10 mb-4"
          style={{ background: `linear-gradient(135deg, ${accent}, color-mix(in srgb, ${accent} 40%, black))` }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>

        <h3 className="font-heading font-bold text-xl text-slate-900 mb-1 relative z-10">60 Seconds</h3>
        <p className="text-[11px] text-slate-500 font-medium relative z-10">Avg Time from Blank to Quote</p>

        <div className="mt-4 inline-block bg-slate-100 rounded-full px-3 py-1 text-[9px] font-bold text-slate-700 relative z-10 border border-slate-200">
          Powered by Decorator Matrix
        </div>
      </div>
    </BrowserFrame>
  )
}

function FunnelVisual({ accent }: { accent: string }) {
  const stages = [
    { label: 'Opportunity', count: '14', width: '95%' },
    { label: 'Qualifying', count: '10', width: '75%' },
    { label: 'Curating', count: '7', width: '55%' },
    { label: 'Client Verify', count: '4', width: '35%' },
    { label: 'Confirmed', count: '2', width: '20%' },
  ]

  return (
    <BrowserFrame>
      <div className="h-full bg-white rounded-xl border border-slate-200 card-depth p-4 md:p-5 shadow-sm overflow-hidden flex flex-col justify-center">
        <h4 className="text-[11px] font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2 flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
          Pipeline Value: <span style={{ color: accent }}>$186K</span>
        </h4>

        <div className="space-y-2">
          {stages.map((stage, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-20 text-right shrink-0">
                <span className="text-[10px] font-medium text-slate-600">{stage.label}</span>
              </div>
              <div className="flex-1 h-5 rounded-md bg-slate-100 overflow-hidden relative border border-slate-200/50">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: stage.width }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                  className="absolute top-0 left-0 h-full rounded-md flex items-center justify-end pr-2"
                  style={{
                    background: i === 0
                      ? accent
                      : `color-mix(in srgb, ${accent} ${100 - i * 15}%, #F1F5F9)`,
                  }}
                >
                  <span className={`text-[10px] font-bold ${i < 3 ? 'text-white' : 'text-slate-700'}`}>{stage.count}</span>
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BrowserFrame>
  )
}
