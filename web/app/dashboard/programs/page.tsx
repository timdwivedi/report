"use client"

import { useState, useCallback } from 'react'
import PageHeader from '@/components/shared/PageHeader'
import DataTable, { Column } from '@/components/shared/DataTable'
import { DetailPanel } from '@/components/shared/ClickReveal'
import Modal from '@/components/shared/Modal'
import { useToast } from '@/components/shared/DemoToastProvider'
import { getDemoPrograms, getDemoClients } from '@/lib/demo/demo-data-provider'
import { PROGRAM_STATUS_STYLES } from '@/lib/demo/demo-data-provider'
import type { Program, ProgramStatus, ProgramType } from '@/lib/types/app'
import { Building2, Plus, MapPin, RefreshCw, Edit3, Eye, Package } from 'lucide-react'

const TYPE_LABELS: Record<string, string> = {
  'employee-store': 'Employee Store',
  'uniform-program': 'Uniform Program',
  'event-merch': 'Event Merch',
  'drop-ship': 'Drop Ship',
  'budget-managed': 'Budget Managed',
}

const STATUS_OPTIONS: { value: ProgramStatus | 'draft'; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'draft', label: 'Draft' },
]

const TYPE_OPTIONS: { value: ProgramType; label: string }[] = [
  { value: 'employee-store', label: 'Employee Store' },
  { value: 'uniform-program', label: 'Uniform Program' },
  { value: 'event-merch', label: 'Event Merch' },
  { value: 'drop-ship', label: 'Drop Ship' },
  { value: 'budget-managed', label: 'Budget Managed' },
]

// Extend status styles to include draft
const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  ...PROGRAM_STATUS_STYLES,
  draft: { bg: 'bg-blue-100', text: 'text-blue-700' },
}

interface ProgramFormData {
  name: string
  type: ProgramType
  client_id: string
  budget_total: number
  status: ProgramStatus | 'draft'
}

const INITIAL_FORM: ProgramFormData = {
  name: '',
  type: 'employee-store',
  client_id: '',
  budget_total: 0,
  status: 'active',
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>(() => getDemoPrograms())
  const [selected, setSelected] = useState<Program | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)
  const [form, setForm] = useState<ProgramFormData>(INITIAL_FORM)
  const { showToast } = useToast()
  const clients = getDemoClients()

  const openCreateModal = useCallback(() => {
    setEditingProgram(null)
    setForm(INITIAL_FORM)
    setShowModal(true)
  }, [])

  const openEditModal = useCallback((program: Program) => {
    setEditingProgram(program)
    setForm({
      name: program.name,
      type: program.type,
      client_id: program.client_id,
      budget_total: program.budget_total || 0,
      status: program.status,
    })
    setSelected(null)
    setShowModal(true)
  }, [])

  const handleSave = useCallback(() => {
    if (!form.name.trim()) return

    const client = clients.find(c => c.id === form.client_id)
    const clientName = client?.company_name || 'Unknown Client'

    if (editingProgram) {
      // Update existing program
      const updated: Program = {
        ...editingProgram,
        name: form.name.trim(),
        type: form.type,
        client_id: form.client_id,
        client_name: clientName,
        budget_total: form.budget_total,
        budget_remaining: form.budget_total - editingProgram.budget_spent,
        status: form.status as ProgramStatus,
        updated_at: new Date().toISOString(),
      }
      setPrograms(prev => prev.map(p => p.id === editingProgram.id ? updated : p))
      showToast(`Program "${form.name.trim()}" updated`, 'action')
    } else {
      // Create new program
      const newProgram: Program = {
        id: `prog-${Date.now()}`,
        org_id: 'demo-org',
        client_id: form.client_id,
        client_name: clientName,
        name: form.name.trim(),
        type: form.type,
        status: form.status as ProgramStatus,
        budget_total: form.budget_total,
        budget_spent: 0,
        budget_remaining: form.budget_total,
        locations_count: 0,
        approval_required: false,
        auto_reorder: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setPrograms(prev => [...prev, newProgram])
      showToast(`Program "${form.name.trim()}" created`, 'action')
    }

    setShowModal(false)
    setForm(INITIAL_FORM)
    setEditingProgram(null)
  }, [form, editingProgram, clients, showToast])

  const columns: Column<Program>[] = [
    {
      key: 'name',
      header: 'Program Name',
      width: '24%',
      render: (row) => (
        <div>
          <p className="text-sm font-semibold text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-500">{row.client_name}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      width: '14%',
      render: (row) => {
        return <span className="text-sm text-slate-700">{TYPE_LABELS[row.type] || row.type}</span>
      },
    },
    {
      key: 'status',
      header: 'Status',
      width: '10%',
      render: (row) => {
        const style = STATUS_STYLES[row.status] || { bg: 'bg-slate-100', text: 'text-slate-600' }
        return (
          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          </span>
        )
      },
    },
    {
      key: 'budget',
      header: 'Budget',
      width: '20%',
      render: (row) => {
        const pct = row.budget_total ? (row.budget_spent / row.budget_total) * 100 : 0
        return (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-mono text-slate-600">${row.budget_spent.toLocaleString()}</span>
              <span className="text-slate-400">of ${row.budget_total?.toLocaleString()}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  pct > 80 ? 'bg-red-500' : pct > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
          </div>
        )
      },
    },
    {
      key: 'locations',
      header: 'Locations',
      width: '10%',
      align: 'center',
      render: (row) => (
        <div className="flex items-center justify-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-sm font-medium text-slate-700">{row.locations_count}</span>
        </div>
      ),
    },
    {
      key: 'reorder',
      header: 'Auto-Reorder',
      width: '12%',
      align: 'center',
      render: (row) => row.auto_reorder ? (
        <div className="flex items-center justify-center gap-1">
          <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-xs text-emerald-600">{row.reorder_frequency}</span>
        </div>
      ) : (
        <span className="text-xs text-slate-400">Manual</span>
      ),
    },
    {
      key: 'remaining',
      header: 'Remaining',
      width: '10%',
      align: 'right',
      render: (row) => (
        <span className={`text-sm font-mono font-medium ${
          row.budget_remaining < 20000 ? 'text-red-600' : 'text-slate-900'
        }`}>
          ${row.budget_remaining.toLocaleString()}
        </span>
      ),
    },
  ]

  const totalBudget = programs.reduce((sum, p) => sum + (p.budget_total || 0), 0)
  const totalSpent = programs.reduce((sum, p) => sum + p.budget_spent, 0)
  const activeCount = programs.filter(p => p.status === 'active').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Programs"
        subtitle={`${programs.length} programs &middot; ${activeCount} active`}
        action={
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Program
          </button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Total Program Budget</p>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">${totalBudget.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Budget Spent</p>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">${totalSpent.toLocaleString()}</p>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
            <div
              className="h-full rounded-full bg-primary-500"
              style={{ width: `${totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0}%` }}
            />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Total Locations</p>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {programs.reduce((sum, p) => sum + p.locations_count, 0)}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <DataTable
          columns={columns}
          data={programs}
          rowKey={(row) => row.id}
          onRowClick={(row) => setSelected(row)}
          emptyMessage="No programs created yet."
        />
      </div>

      {/* Detail Panel */}
      <DetailPanel
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name || 'Program Details'}
      >
        {selected && (
          <ProgramDetailContent
            program={selected}
            onEdit={openEditModal}
            onViewLocations={() => showToast('Locations view will be available in production', 'alert')}
            onManageProducts={() => showToast('Product management will be available in production', 'alert')}
          />
        )}
      </DetailPanel>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingProgram(null); setForm(INITIAL_FORM) }}
        title={editingProgram ? 'Edit Program' : 'New Program'}
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => { setShowModal(false); setEditingProgram(null); setForm(INITIAL_FORM) }}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!form.name.trim()}
              className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingProgram ? 'Save Changes' : 'Create Program'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Program Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Q3 Uniform Rollout"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value as ProgramType }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
            >
              {TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Client */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Client</label>
            <select
              value={form.client_id}
              onChange={(e) => setForm(prev => ({ ...prev, client_id: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
            >
              <option value="">Select a client...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.company_name}</option>
              ))}
            </select>
          </div>

          {/* Total Budget */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Total Budget</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
              <input
                type="number" onFocus={(e) => e.target.select()}
                value={form.budget_total || ''}
                onChange={(e) => setForm(prev => ({ ...prev, budget_total: Number(e.target.value) || 0 }))}
                placeholder="0"
                min={0}
                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value as ProgramStatus }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ── Detail panel content (replaces MockDetail) ──

function ProgramDetailContent({
  program,
  onEdit,
  onViewLocations,
  onManageProducts,
}: {
  program: Program
  onEdit: (p: Program) => void
  onViewLocations: () => void
  onManageProducts: () => void
}) {
  const statusStyle = STATUS_STYLES[program.status] || { bg: 'bg-slate-100', text: 'text-slate-600' }
  const budgetPct = program.budget_total ? (program.budget_spent / program.budget_total) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Type + Status badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
          {TYPE_LABELS[program.type] || program.type}
        </span>
        <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
          {program.status.charAt(0).toUpperCase() + program.status.slice(1)}
        </span>
      </div>

      {/* Client */}
      <div className="flex justify-between items-center py-2 border-b border-slate-100">
        <span className="text-sm text-slate-500">Client</span>
        <span className="text-sm font-medium text-slate-900">{program.client_name}</span>
      </div>

      {/* Budget Section */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Budget</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500 mb-1">Total</p>
            <p className="text-sm font-bold font-mono text-slate-900">${(program.budget_total || 0).toLocaleString()}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500 mb-1">Spent</p>
            <p className="text-sm font-bold font-mono text-slate-900">${program.budget_spent.toLocaleString()}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500 mb-1">Remaining</p>
            <p className={`text-sm font-bold font-mono ${program.budget_remaining < 20000 ? 'text-red-600' : 'text-emerald-600'}`}>
              ${program.budget_remaining.toLocaleString()}
            </p>
          </div>
        </div>
        {/* Budget progress bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              budgetPct > 80 ? 'bg-red-500' : budgetPct > 60 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(budgetPct, 100)}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 text-right">{Math.round(budgetPct)}% used</p>
      </div>

      {/* Location Count */}
      <div className="flex justify-between items-center py-2 border-b border-slate-100">
        <span className="text-sm text-slate-500">Locations</span>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-sm font-medium text-slate-900">{program.locations_count}</span>
        </div>
      </div>

      {/* Auto-Reorder */}
      <div className="flex justify-between items-center py-2 border-b border-slate-100">
        <span className="text-sm text-slate-500">Auto-Reorder</span>
        <span className="text-sm font-medium text-slate-900">
          {program.auto_reorder ? `Yes (${program.reorder_frequency})` : 'Manual'}
        </span>
      </div>

      {/* Approval Required */}
      <div className="flex justify-between items-center py-2 border-b border-slate-100">
        <span className="text-sm text-slate-500">Approval Required</span>
        <span className="text-sm font-medium text-slate-900">{program.approval_required ? 'Yes' : 'No'}</span>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-4">
        <button
          onClick={() => onEdit(program)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
        >
          <Edit3 className="w-3.5 h-3.5" />
          Edit Program
        </button>
        <button
          onClick={onViewLocations}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
        >
          <Eye className="w-3.5 h-3.5" />
          View Locations
        </button>
        <button
          onClick={onManageProducts}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
        >
          <Package className="w-3.5 h-3.5" />
          Manage Products
        </button>
      </div>
    </div>
  )
}
