"use client"

import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import PageHeader from '@/components/shared/PageHeader'
import AnimatedCounter from '@/components/shared/AnimatedCounter'
import DataTable, { Column } from '@/components/shared/DataTable'
import { getDemoCommissionRecords } from '@/lib/demo/demo-data-provider'
import { COMMISSION_STATUS_STYLES } from '@/lib/demo/demo-data-provider'
import type { CommissionRecord, CommissionStatus } from '@/lib/types/app'
import { DollarSign, TrendingUp, Users, ArrowRight, Calculator } from 'lucide-react'

const RECORDS = getDemoCommissionRecords()

export default function CommissionsPage() {
  const [tab, setTab] = useState<'calculator' | 'records'>('calculator')

  // Calculator state
  const [grossRevenue, setGrossRevenue] = useState(131000)
  const [marginPercent, setMarginPercent] = useState(35)
  const [commissionRate, setCommissionRate] = useState(7)
  const [period, setPeriod] = useState<'monthly' | 'annual'>('monthly')

  // Calculate commission breakdown
  const calc = useMemo(() => {
    const grossProfit = grossRevenue * (marginPercent / 100)
    const boundlessShare = grossProfit * 0.5
    const ownerShare = grossProfit * 0.5
    const partnerCommission = grossRevenue * (commissionRate / 100)
    const netToOwner = ownerShare - partnerCommission
    const multiplier = period === 'annual' ? 12 : 1

    return {
      grossRevenue: grossRevenue * multiplier,
      grossProfit: grossProfit * multiplier,
      boundlessShare: boundlessShare * multiplier,
      ownerShare: ownerShare * multiplier,
      partnerCommission: partnerCommission * multiplier,
      netToOwner: netToOwner * multiplier,
    }
  }, [grossRevenue, marginPercent, commissionRate, period])

  // Records summary
  const totalCommissions = RECORDS.reduce((sum, r) => sum + r.partner_commission, 0)
  const totalRevenue = RECORDS.reduce((sum, r) => sum + r.gross_revenue, 0)

  const tableColumns: Column<CommissionRecord>[] = [
    {
      key: 'period',
      header: 'Period',
      width: '10%',
      render: (row) => <span className="text-sm font-medium text-slate-700">{row.period}</span>,
    },
    {
      key: 'project',
      header: 'Project',
      width: '22%',
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-slate-900">{row.project_name}</p>
          <p className="text-xs text-slate-500">{row.client_name}</p>
        </div>
      ),
    },
    {
      key: 'revenue',
      header: 'Revenue',
      width: '14%',
      align: 'right',
      render: (row) => <span className="text-sm font-mono text-slate-900">${row.gross_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>,
    },
    {
      key: 'margin',
      header: 'Margin',
      width: '10%',
      align: 'center',
      render: (row) => <span className="text-sm font-mono text-slate-600">{row.profit_margin_percent}%</span>,
    },
    {
      key: 'profit',
      header: 'Gross Profit',
      width: '14%',
      align: 'right',
      render: (row) => <span className="text-sm font-mono text-slate-700">${row.gross_profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>,
    },
    {
      key: 'commission',
      header: 'Commission',
      width: '14%',
      align: 'right',
      render: (row) => <span className="text-sm font-mono font-bold text-emerald-600">${row.partner_commission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      width: '12%',
      render: (row) => {
        const style = COMMISSION_STATUS_STYLES[row.status]
        return (
          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          </span>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commission Intelligence"
        subtitle="Revenue breakdown and scaling calculator"
      />

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab('calculator')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'calculator' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Calculator className="w-4 h-4" />
          Scaling Calculator
        </button>
        <button
          onClick={() => setTab('records')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'records' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Commission Records
        </button>
      </div>

      {tab === 'calculator' ? (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: Inputs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
              <h3 className="text-lg font-bold font-heading text-slate-900">Inputs</h3>

              {/* Period Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPeriod('monthly')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    period === 'monthly' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setPeriod('annual')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    period === 'annual' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Annual Projection
                </button>
              </div>

              {/* Gross Revenue Slider */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Monthly Gross Revenue</label>
                  <span className="text-sm font-mono font-bold text-slate-900">${grossRevenue.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={25000}
                  max={500000}
                  step={5000}
                  value={grossRevenue}
                  onChange={(e) => setGrossRevenue(Number(e.target.value))}
                  className="w-full accent-primary-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>$25K</span>
                  <span className="text-primary-600 font-medium">Trevor: $131K (first 9 days)</span>
                  <span>$500K</span>
                </div>
              </div>

              {/* Margin Slider */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Average Margin</label>
                  <span className="text-sm font-mono font-bold text-slate-900">{marginPercent}%</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={60}
                  step={1}
                  value={marginPercent}
                  onChange={(e) => setMarginPercent(Number(e.target.value))}
                  className="w-full accent-primary-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>15%</span>
                  <span>60%</span>
                </div>
              </div>

              {/* Commission Rate Slider */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Partner Commission Rate</label>
                  <span className="text-sm font-mono font-bold text-slate-900">{commissionRate}%</span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={15}
                  step={0.5}
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  className="w-full accent-primary-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>3%</span>
                  <span>15%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Outputs */}
          <div className="lg:col-span-3 space-y-4">
            {/* Revenue Flow */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold font-heading text-slate-900 mb-6">
                {period === 'annual' ? 'Annual Projection' : 'Monthly Breakdown'}
              </h3>

              <div className="space-y-4">
                {/* Gross Revenue */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-600">Gross Revenue</span>
                  <AnimatedCounter
                    value={calc.grossRevenue}
                    prefix="$"
                    duration={0.8}
                    className="text-2xl font-bold font-mono text-slate-900"
                  />
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="w-5 h-5 text-slate-300 rotate-90" />
                </div>

                {/* Gross Profit */}
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div>
                    <span className="text-sm font-medium text-emerald-700">Gross Profit</span>
                    <span className="text-xs text-emerald-500 ml-2">({marginPercent}%)</span>
                  </div>
                  <AnimatedCounter
                    value={calc.grossProfit}
                    prefix="$"
                    duration={0.8}
                    className="text-2xl font-bold font-mono text-emerald-700"
                  />
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="w-5 h-5 text-slate-300 rotate-90" />
                </div>

                {/* Split */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-xs font-medium text-blue-600">Boundless Share (50%)</span>
                    <AnimatedCounter
                      value={calc.boundlessShare}
                      prefix="$"
                      duration={0.8}
                      className="text-lg font-bold font-mono text-blue-700 mt-1 block"
                    />
                  </div>
                  <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                    <span className="text-xs font-medium text-primary-600">Owner Share (50%)</span>
                    <AnimatedCounter
                      value={calc.ownerShare}
                      prefix="$"
                      duration={0.8}
                      className="text-lg font-bold font-mono text-primary-700 mt-1 block"
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="w-5 h-5 text-slate-300 rotate-90" />
                </div>

                {/* Partner Commission */}
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-amber-700">Partner Commission</span>
                      <span className="text-xs text-amber-500 ml-2">({commissionRate}% of gross)</span>
                    </div>
                    <AnimatedCounter
                      value={calc.partnerCommission}
                      prefix="$"
                      duration={0.8}
                      className="text-xl font-bold font-mono text-amber-700"
                    />
                  </div>
                </div>

                {/* Net to Owner — THE BIG NUMBER */}
                <motion.div
                  className="p-6 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl text-white"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-primary-200">Net to Owner</p>
                      <p className="text-xs text-primary-300 mt-0.5">After Boundless split + partner commission</p>
                    </div>
                    <AnimatedCounter
                      value={calc.netToOwner}
                      prefix="$"
                      duration={1.2}
                      className="text-3xl font-bold font-mono text-white"
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <p className="text-sm text-slate-500">Total Revenue</p>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-1">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <p className="text-sm text-slate-500">Total Commissions</p>
              <p className="text-2xl font-bold font-mono text-emerald-600 mt-1">${totalCommissions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <p className="text-sm text-slate-500">Avg Margin</p>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {(RECORDS.reduce((sum, r) => sum + r.profit_margin_percent, 0) / RECORDS.length).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <DataTable
              columns={tableColumns}
              data={RECORDS}
              rowKey={(row) => row.id}
              emptyMessage="No commission records found."
            />
          </div>
        </div>
      )}
    </div>
  )
}
