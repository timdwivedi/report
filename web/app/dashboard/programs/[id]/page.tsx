"use client"

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import PageHeader from '@/components/shared/PageHeader'
import AnimatedCounter from '@/components/shared/AnimatedCounter'
import { useToast } from '@/components/shared/DemoToastProvider'
import { getDemoPrograms, getDemoProductsList, PROGRAM_STATUS_STYLES } from '@/lib/demo/demo-data-provider'
import type { Program, ProgramType } from '@/lib/types/app'
import {
  ArrowLeft, MapPin, DollarSign, Package, Clock,
  ShoppingBag, UserCheck, RefreshCw, Settings,
  ClipboardList, TrendingUp, AlertCircle,
} from 'lucide-react'

const TYPE_LABELS: Record<ProgramType, string> = {
  'employee-store': 'Employee Store',
  'uniform-program': 'Uniform Program',
  'event-merch': 'Event Merch',
  'drop-ship': 'Drop Ship',
  'budget-managed': 'Budget Managed',
}

const TYPE_BADGE_STYLES: Record<ProgramType, string> = {
  'employee-store': 'bg-indigo-100 text-indigo-700',
  'uniform-program': 'bg-cyan-100 text-cyan-700',
  'event-merch': 'bg-violet-100 text-violet-700',
  'drop-ship': 'bg-orange-100 text-orange-700',
  'budget-managed': 'bg-sky-100 text-sky-700',
}

// ===== INLINE FAKE LOCATIONS =====

interface ProgramLocation {
  id: string
  name: string
  city: string
  state: string
  budgetAllocation: number
  contactName: string
}

const PROGRAM_LOCATIONS: Record<string, ProgramLocation[]> = {
  '1': [
    { id: 'loc-1a', name: 'Cleveland HQ', city: 'Cleveland', state: 'OH', budgetAllocation: 45000, contactName: 'Jennifer Walsh' },
    { id: 'loc-1b', name: 'Columbus Regional', city: 'Columbus', state: 'OH', budgetAllocation: 35000, contactName: 'Brian Foster' },
    { id: 'loc-1c', name: 'Cincinnati Office', city: 'Cincinnati', state: 'OH', budgetAllocation: 30000, contactName: 'Danielle Reeves' },
    { id: 'loc-1d', name: 'Detroit Branch', city: 'Detroit', state: 'MI', budgetAllocation: 25000, contactName: 'Marcus Webb' },
  ],
  '2': [
    { id: 'loc-2a', name: 'New Orleans Flagship', city: 'New Orleans', state: 'LA', budgetAllocation: 72000, contactName: 'Marcus Thompson' },
    { id: 'loc-2b', name: 'Baton Rouge Store #14', city: 'Baton Rouge', state: 'LA', budgetAllocation: 58000, contactName: 'Ashley Nguyen' },
    { id: 'loc-2c', name: 'Houston Distribution', city: 'Houston', state: 'TX', budgetAllocation: 65000, contactName: 'Derek Collins' },
    { id: 'loc-2d', name: 'Dallas Metro Cluster', city: 'Dallas', state: 'TX', budgetAllocation: 55000, contactName: 'Rachel Kim' },
  ],
  '3': [
    { id: 'loc-3a', name: 'First Horizon Park', city: 'Nashville', state: 'TN', budgetAllocation: 35000, contactName: 'Dustin Parker' },
    { id: 'loc-3b', name: 'Downtown Team Store', city: 'Nashville', state: 'TN', budgetAllocation: 18000, contactName: 'Morgan Hayes' },
    { id: 'loc-3c', name: 'Cool Springs Pop-Up', city: 'Franklin', state: 'TN', budgetAllocation: 12000, contactName: 'Jake Sullivan' },
  ],
}

// ===== INLINE FAKE ACTIVITY =====

interface ActivityEntry {
  id: string
  description: string
  timestamp: string
  icon: 'order' | 'budget' | 'reorder' | 'location' | 'approval' | 'product'
}

const PROGRAM_ACTIVITY: Record<string, ActivityEntry[]> = {
  '1': [
    { id: 'act-1a', description: 'Order #ORD-2026-0138 placed at Cleveland HQ', timestamp: '2 hours ago', icon: 'order' },
    { id: 'act-1b', description: 'Budget updated by Jennifer Walsh — increased Q2 allocation', timestamp: '1 day ago', icon: 'budget' },
    { id: 'act-1c', description: 'New product added: Nike Dri-FIT Polo', timestamp: '2 days ago', icon: 'product' },
    { id: 'act-1d', description: 'Columbus Regional location approved quarterly order', timestamp: '3 days ago', icon: 'approval' },
    { id: 'act-1e', description: 'Detroit Branch submitted reorder request for 120 polos', timestamp: '5 days ago', icon: 'reorder' },
    { id: 'act-1f', description: 'Cincinnati Office contact updated to Danielle Reeves', timestamp: '1 week ago', icon: 'location' },
  ],
  '2': [
    { id: 'act-2a', description: 'Order #ORD-2026-0149 placed at New Orleans Flagship', timestamp: '4 hours ago', icon: 'order' },
    { id: 'act-2b', description: 'Auto-reorder triggered for Baton Rouge Store #14 — 200 crew tees', timestamp: '1 day ago', icon: 'reorder' },
    { id: 'act-2c', description: 'Budget alert: program at 68% utilization', timestamp: '2 days ago', icon: 'budget' },
    { id: 'act-2d', description: 'Houston Distribution received shipment — 350 units', timestamp: '3 days ago', icon: 'order' },
    { id: 'act-2e', description: 'Dallas Metro Cluster added as new location', timestamp: '1 week ago', icon: 'location' },
    { id: 'act-2f', description: 'Apron product removed from allowed catalog', timestamp: '2 weeks ago', icon: 'product' },
  ],
  '3': [
    { id: 'act-3a', description: 'Order #ORD-2026-0141 placed — 200 trucker caps for stadium', timestamp: '6 hours ago', icon: 'order' },
    { id: 'act-3b', description: 'Budget updated by Trevor Mitchell — season extension funds', timestamp: '2 days ago', icon: 'budget' },
    { id: 'act-3c', description: 'Cool Springs Pop-Up location activated for playoff run', timestamp: '4 days ago', icon: 'location' },
    { id: 'act-3d', description: 'New artwork uploaded: 2026 Season Logo (v3)', timestamp: '5 days ago', icon: 'product' },
    { id: 'act-3e', description: 'Downtown Team Store reorder — 150 tees, 100 caps', timestamp: '1 week ago', icon: 'reorder' },
  ],
}

const ACTIVITY_ICONS: Record<ActivityEntry['icon'], typeof ClipboardList> = {
  order: ShoppingBag,
  budget: DollarSign,
  reorder: RefreshCw,
  location: MapPin,
  approval: UserCheck,
  product: Package,
}

const ACTIVITY_COLORS: Record<ActivityEntry['icon'], string> = {
  order: 'bg-blue-100 text-blue-600',
  budget: 'bg-emerald-100 text-emerald-600',
  reorder: 'bg-violet-100 text-violet-600',
  location: 'bg-amber-100 text-amber-600',
  approval: 'bg-cyan-100 text-cyan-600',
  product: 'bg-slate-100 text-slate-600',
}

export default function ProgramDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { showToast } = useToast()
  const programId = params.id as string

  const [programs] = useState(() => getDemoPrograms())
  const program = programs.find(p => p.id === programId)

  const productsList = useMemo(() => getDemoProductsList(), [])
  const displayProducts = productsList.slice(0, 6)

  const locations = PROGRAM_LOCATIONS[programId] || PROGRAM_LOCATIONS['1'] || []
  const activities = PROGRAM_ACTIVITY[programId] || PROGRAM_ACTIVITY['1'] || []

  if (!program) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.push('/dashboard/programs')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Programs
        </button>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 text-center">
          <p className="text-lg font-medium text-slate-900">Program not found</p>
          <p className="text-sm text-slate-500 mt-1">The program you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    )
  }

  const budgetTotal = program.budget_total || 0
  const budgetSpent = program.budget_spent
  const budgetRemaining = program.budget_remaining
  const utilizationPct = budgetTotal > 0 ? (budgetSpent / budgetTotal) * 100 : 0

  const statusStyle = PROGRAM_STATUS_STYLES[program.status] || { bg: 'bg-slate-100', text: 'text-slate-600' }
  const typeBadgeStyle = TYPE_BADGE_STYLES[program.type] || 'bg-slate-100 text-slate-700'

  // Progress bar color based on utilization
  const progressBarColor =
    utilizationPct > 80 ? 'bg-red-500'
    : utilizationPct > 60 ? 'bg-amber-500'
    : 'bg-emerald-500'

  const utilizationLabelColor =
    utilizationPct > 80 ? 'text-red-600'
    : utilizationPct > 60 ? 'text-amber-600'
    : 'text-emerald-600'

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.push('/dashboard/programs')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Programs
      </button>

      {/* Page Header with badges */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-heading text-slate-900">{program.name}</h1>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`inline-flex px-2.5 py-0.5 rounded text-xs font-medium ${typeBadgeStyle}`}>
                {TYPE_LABELS[program.type]}
              </span>
              <span className={`inline-flex px-2.5 py-0.5 rounded text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                {program.status.charAt(0).toUpperCase() + program.status.slice(1)}
              </span>
              <span className="text-sm text-slate-500">{program.client_name}</span>
              <span className="flex items-center gap-1 text-sm text-slate-500">
                <MapPin className="w-3.5 h-3.5" /> {program.locations_count} locations
              </span>
              {program.auto_reorder && (
                <span className="flex items-center gap-1 text-xs text-emerald-600">
                  <RefreshCw className="w-3 h-3" /> Auto-Reorder ({program.reorder_frequency})
                </span>
              )}
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Updated {new Date(program.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            {program.approval_required && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                <AlertCircle className="w-3 h-3" /> Approval Required
              </span>
            )}
          </div>
        </div>

        {/* Notes */}
        {program.notes && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-xs text-slate-500 font-medium mb-1">Notes</p>
            <p className="text-sm text-slate-700">{program.notes}</p>
          </div>
        )}
      </div>

      {/* ===== BUDGET SECTION ===== */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold font-heading text-slate-900 mb-4">Budget Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Total Budget */}
          <div className="bg-slate-50 rounded-xl p-5 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Total Budget</p>
            <AnimatedCounter
              value={budgetTotal}
              prefix="$"
              duration={1.2}
              className="text-2xl font-bold font-mono text-slate-900 block"
            />
          </div>

          {/* Spent */}
          <div className="bg-slate-50 rounded-xl p-5 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Spent</p>
            <AnimatedCounter
              value={budgetSpent}
              prefix="$"
              duration={1.2}
              className="text-2xl font-bold font-mono text-slate-900 block"
            />
          </div>

          {/* Remaining */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-5 text-center text-white">
            <p className="text-xs text-primary-200 uppercase tracking-wider font-medium mb-2">Remaining</p>
            <AnimatedCounter
              value={budgetRemaining}
              prefix="$"
              duration={1.2}
              className="text-2xl font-bold font-mono text-white block"
            />
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${progressBarColor}`}
              style={{ width: `${Math.min(utilizationPct, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-400">$0</p>
            <p className={`text-sm font-semibold ${utilizationLabelColor}`}>
              {Math.round(utilizationPct)}% utilized
            </p>
            <p className="text-xs text-slate-400">${budgetTotal.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* ===== LOCATIONS GRID ===== */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-heading text-slate-900">Locations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {locations.map(loc => (
            <div
              key={loc.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:border-primary-200 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-9 h-9 bg-primary-50 rounded-lg flex-shrink-0">
                  <MapPin className="w-4.5 h-4.5 text-primary-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{loc.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{loc.city}, {loc.state}</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Budget Allocation</span>
                  <span className="text-sm font-mono font-medium text-slate-900">${loc.budgetAllocation.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Contact</span>
                  <span className="text-xs font-medium text-slate-700">{loc.contactName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== ALLOWED PRODUCTS SECTION ===== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-heading text-slate-900">Allowed Products</h2>
          <button
            onClick={() => showToast('Product management will be available in production', 'alert')}
            className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Manage Products
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayProducts.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{product.supplier}</p>
                </div>
                <Package className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                  {product.category}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  ${product.blank_cost_min.toFixed(2)} &ndash; ${product.blank_cost_max.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== ACTIVITY FEED ===== */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-bold font-heading text-slate-900">Recent Activity</h2>
        </div>
        <div className="space-y-4">
          {activities.map(activity => {
            const IconComponent = ACTIVITY_ICONS[activity.icon]
            const iconColor = ACTIVITY_COLORS[activity.icon]
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 ${iconColor}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-700">{activity.description}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{activity.timestamp}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
