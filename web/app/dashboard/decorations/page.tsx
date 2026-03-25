"use client"

import { useState, useMemo, useCallback } from 'react'
import PageHeader from '@/components/shared/PageHeader'
import Modal from '@/components/shared/Modal'
import { useToast } from '@/components/shared/DemoToastProvider'
import { getDemoDecoratorMatrices, getDemoVendors } from '@/lib/demo/demo-data-provider'
import { DECORATION_METHOD_LABELS } from '@/lib/constants/app'
import type { DecoratorMatrixDisplay, Vendor } from '@/lib/types/app'
import type { DecorationMethod } from '@/lib/types/app'
import {
  Palette,
  Printer,
  Layers,
  Flame,
  Grid3x3,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  DollarSign,
  Hash,
  Settings2,
  Zap,
  Stamp,
  ArrowLeft,
  Building2,
  MapPin,
} from 'lucide-react'

// ===== LOCAL TYPES FOR SETUP & RUN CHARGES =====

interface DecorationSetupCharge {
  id: string
  name: string
  cost: number
  sale_price: number
  free_above_qty?: number
}

interface DecorationRunCharge {
  id: string
  name: string
  cost: number
  sale: number
}

interface DecorationChargesMap {
  [matrixId: string]: {
    setupCharges: DecorationSetupCharge[]
    runCharges: DecorationRunCharge[]
  }
}

// ===== CONSTANTS =====

const DECORATION_METHODS: { value: DecorationMethod; label: string }[] = [
  { value: 'embroidery', label: 'Embroidery' },
  { value: 'screen-print', label: 'Screen Printing' },
  { value: 'dtg', label: 'DTG (Direct-to-Garment)' },
  { value: 'heat-transfer', label: 'Heat Transfer' },
  { value: 'sublimation', label: 'Sublimation' },
  { value: 'laser-engrave', label: 'Laser Engrave' },
  { value: 'pad-print', label: 'Pad Print' },
  { value: 'deboss', label: 'Deboss' },
]

const METHOD_ICON_MAP: Record<string, typeof Palette> = {
  'Screen Print': Printer,
  'Embroidery': Layers,
  'Heat Transfer': Flame,
  'DTG': Zap,
  'Sublimation': Stamp,
  'Laser Engrave': Settings2,
  'Pad Print': Stamp,
  'Deboss': Stamp,
}

const METHOD_COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  'Screen Print': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Embroidery': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Heat Transfer': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'DTG': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Sublimation': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  'Laser Engrave': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Pad Print': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  'Deboss': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
}

const DEFAULT_METHOD_COLOR = { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' }

type ModalTab = 'basics' | 'price-breaks' | 'charges'

// Helper to generate unique IDs
function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// Convert method display string to DecorationMethod key
function methodDisplayToKey(display: string): DecorationMethod {
  const entry = Object.entries(DECORATION_METHOD_LABELS).find(([, label]) => label === display)
  return (entry?.[0] as DecorationMethod) ?? 'other'
}

// Get column label based on method
function getColumnLabel(method: string): string {
  const key = methodDisplayToKey(method)
  if (key === 'embroidery') return 'Stitch Count'
  return 'Colors'
}

// Map a matrix to a vendor by matching the vendor name prefix in matrix.name
function getVendorForMatrix(matrix: DecoratorMatrixDisplay, vendors: Vendor[]): Vendor | undefined {
  return vendors.find(v =>
    matrix.name.toLowerCase().startsWith(v.name.toLowerCase())
  )
}

// ===== DEFAULT DEMO CHARGES =====

function buildDefaultCharges(): DecorationChargesMap {
  return {
    'mat-1': {
      setupCharges: [
        { id: 'sc-1', name: 'Screen Setup', cost: 25, sale_price: 45, free_above_qty: 500 },
        { id: 'sc-2', name: 'Color Change Fee', cost: 10, sale_price: 20 },
      ],
      runCharges: [
        { id: 'rc-1', name: 'Flash Charge (per unit)', cost: 0.35, sale: 0.75 },
      ],
    },
    'mat-2': {
      setupCharges: [
        { id: 'sc-3', name: 'Digitizing Fee', cost: 25, sale_price: 50 },
        { id: 'sc-4', name: 'Tape & Edit Fee', cost: 10, sale_price: 20 },
      ],
      runCharges: [
        { id: 'rc-2', name: 'Per Head Run Charge', cost: 0.5, sale: 1 },
      ],
    },
    'mat-3': {
      setupCharges: [
        { id: 'sc-5', name: 'Setup Fee', cost: 20, sale_price: 35 },
      ],
      runCharges: [],
    },
    'mat-4': {
      setupCharges: [
        { id: 'sc-6', name: 'Art Setup', cost: 15, sale_price: 30 },
      ],
      runCharges: [],
    },
    'mat-5': {
      setupCharges: [
        { id: 'sc-7', name: 'Digitizing Fee', cost: 30, sale_price: 55 },
      ],
      runCharges: [
        { id: 'rc-3', name: 'Per Head Run Charge', cost: 0.45, sale: 0.90 },
      ],
    },
  }
}

// ===== MAIN PAGE COMPONENT =====

export default function DecorationsPage() {
  const { showToast } = useToast()

  // Core state
  const [matrices, setMatrices] = useState<DecoratorMatrixDisplay[]>(() => getDemoDecoratorMatrices())
  const [chargesMap, setChargesMap] = useState<DecorationChargesMap>(() => buildDefaultCharges())
  const vendors = useMemo(() => getDemoVendors().filter(v => v.type === 'decorator' || v.type === 'both'), [])

  // Vendor drill-down state
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null)
  const selectedVendor = vendors.find(v => v.id === selectedVendorId) ?? null

  // Modal state
  const [editingMatrix, setEditingMatrix] = useState<DecoratorMatrixDisplay | null>(null)
  const [activeTab, setActiveTab] = useState<ModalTab>('basics')
  const [isCreating, setIsCreating] = useState(false)

  // Edit form state (synced when modal opens)
  const [editName, setEditName] = useState('')
  const [editMethod, setEditMethod] = useState<string>('')
  const [editGrid, setEditGrid] = useState<Record<string, Record<string, number>>>({})
  const [editColorCounts, setEditColorCounts] = useState<number[]>([])
  const [editSetupCharges, setEditSetupCharges] = useState<DecorationSetupCharge[]>([])
  const [editRunCharges, setEditRunCharges] = useState<DecorationRunCharge[]>([])

  // Group matrices by vendor
  const vendorMatricesMap = useMemo(() => {
    const map: Record<string, DecoratorMatrixDisplay[]> = {}
    vendors.forEach(v => { map[v.id] = [] })
    map['unassigned'] = []
    matrices.forEach(m => {
      const vendor = getVendorForMatrix(m, vendors)
      if (vendor) {
        map[vendor.id].push(m)
      } else {
        map['unassigned'].push(m)
      }
    })
    return map
  }, [matrices, vendors])

  // Current view matrices (filtered by selected vendor)
  const currentMatrices = selectedVendorId
    ? (vendorMatricesMap[selectedVendorId] ?? [])
    : matrices

  // ── Open modal for existing matrix ──
  const openEditModal = useCallback((matrix: DecoratorMatrixDisplay) => {
    setEditingMatrix(matrix)
    setIsCreating(false)
    setActiveTab('basics')
    setEditName(matrix.name)
    setEditMethod(matrix.method)
    setEditGrid(JSON.parse(JSON.stringify(matrix.pricing_grid)))
    setEditColorCounts([...matrix.color_counts])
    const charges = chargesMap[matrix.id] ?? { setupCharges: [], runCharges: [] }
    setEditSetupCharges(JSON.parse(JSON.stringify(charges.setupCharges)))
    setEditRunCharges(JSON.parse(JSON.stringify(charges.runCharges)))
  }, [chargesMap])

  // ── Open modal for new decoration ──
  const openCreateModal = useCallback(() => {
    const newId = `mat-new-${uid()}`
    const blank: DecoratorMatrixDisplay = {
      id: newId,
      name: selectedVendor ? `${selectedVendor.name} — ` : '',
      method: 'Screen Print',
      tier_count: 0,
      color_counts: [1],
      pricing_grid: {},
    }
    setEditingMatrix(blank)
    setIsCreating(true)
    setActiveTab('basics')
    setEditName(blank.name)
    setEditMethod('Screen Print')
    setEditGrid({})
    setEditColorCounts([1])
    setEditSetupCharges([])
    setEditRunCharges([])
  }, [selectedVendor])

  // ── Close modal ──
  const closeModal = useCallback(() => {
    setEditingMatrix(null)
    setIsCreating(false)
  }, [])

  // ── Save changes ──
  const handleSave = useCallback(() => {
    if (!editingMatrix) return
    if (!editName.trim()) {
      showToast('Please enter a decoration name.', 'alert')
      return
    }

    const qtyRows = Object.keys(editGrid)
    const updated: DecoratorMatrixDisplay = {
      ...editingMatrix,
      name: editName.trim(),
      method: editMethod,
      tier_count: qtyRows.length,
      color_counts: editColorCounts,
      pricing_grid: JSON.parse(JSON.stringify(editGrid)),
    }

    setMatrices(prev => {
      const exists = prev.find(m => m.id === updated.id)
      if (exists) {
        return prev.map(m => m.id === updated.id ? updated : m)
      }
      return [...prev, updated]
    })

    setChargesMap(prev => ({
      ...prev,
      [updated.id]: {
        setupCharges: JSON.parse(JSON.stringify(editSetupCharges)),
        runCharges: JSON.parse(JSON.stringify(editRunCharges)),
      },
    }))

    showToast(isCreating ? 'Decoration created successfully.' : 'Decoration updated successfully.', 'action')
    closeModal()
  }, [editingMatrix, editName, editMethod, editGrid, editColorCounts, editSetupCharges, editRunCharges, isCreating, showToast, closeModal])

  // ── Delete matrix ──
  const handleDelete = useCallback((matrixId: string) => {
    setMatrices(prev => prev.filter(m => m.id !== matrixId))
    setChargesMap(prev => {
      const next = { ...prev }
      delete next[matrixId]
      return next
    })
    showToast('Decoration deleted.', 'action')
    closeModal()
  }, [showToast, closeModal])

  // ── Price Grid Mutations ──

  const addQuantityRow = useCallback(() => {
    const existingRows = Object.keys(editGrid)
    let nextMin = 1
    if (existingRows.length > 0) {
      const lastRow = existingRows[existingRows.length - 1]
      const parts = lastRow.split('-')
      if (parts.length === 2) {
        nextMin = parseInt(parts[1]) + 1
      } else {
        const num = parseInt(lastRow.replace('+', ''))
        if (!isNaN(num)) nextMin = num + 1
      }
    }
    const newKey = `${nextMin}-${nextMin + 99}`
    const newRow: Record<string, number> = {}
    editColorCounts.forEach(c => { newRow[String(c)] = 0 })
    setEditGrid(prev => ({ ...prev, [newKey]: newRow }))
  }, [editGrid, editColorCounts])

  const removeQuantityRow = useCallback((rowKey: string) => {
    setEditGrid(prev => {
      const next = { ...prev }
      delete next[rowKey]
      return next
    })
  }, [])

  const addColorColumn = useCallback(() => {
    const maxColor = editColorCounts.length > 0 ? Math.max(...editColorCounts) : 0
    const newColor = maxColor + 1
    setEditColorCounts(prev => [...prev, newColor])
    setEditGrid(prev => {
      const next = { ...prev }
      Object.keys(next).forEach(rowKey => {
        next[rowKey] = { ...next[rowKey], [String(newColor)]: 0 }
      })
      return next
    })
  }, [editColorCounts])

  const removeColorColumn = useCallback((colorNum: number) => {
    setEditColorCounts(prev => prev.filter(c => c !== colorNum))
    setEditGrid(prev => {
      const next = { ...prev }
      Object.keys(next).forEach(rowKey => {
        const row = { ...next[rowKey] }
        delete row[String(colorNum)]
        next[rowKey] = row
      })
      return next
    })
  }, [])

  const updateCellPrice = useCallback((rowKey: string, colKey: string, value: number) => {
    setEditGrid(prev => ({
      ...prev,
      [rowKey]: { ...prev[rowKey], [colKey]: value },
    }))
  }, [])

  const updateRowKey = useCallback((oldKey: string, newKey: string) => {
    if (oldKey === newKey) return
    setEditGrid(prev => {
      const next: Record<string, Record<string, number>> = {}
      Object.entries(prev).forEach(([k, v]) => {
        next[k === oldKey ? newKey : k] = v
      })
      return next
    })
  }, [])

  // ── Setup Charge Mutations ──

  const addSetupCharge = useCallback(() => {
    setEditSetupCharges(prev => [...prev, {
      id: `sc-${uid()}`,
      name: '',
      cost: 0,
      sale_price: 0,
    }])
  }, [])

  const updateSetupCharge = useCallback((id: string, field: keyof DecorationSetupCharge, value: string | number | undefined) => {
    setEditSetupCharges(prev => prev.map(sc => sc.id === id ? { ...sc, [field]: value } : sc))
  }, [])

  const removeSetupCharge = useCallback((id: string) => {
    setEditSetupCharges(prev => prev.filter(sc => sc.id !== id))
  }, [])

  // ── Run Charge Mutations ──

  const addRunCharge = useCallback(() => {
    setEditRunCharges(prev => [...prev, {
      id: `rc-${uid()}`,
      name: '',
      cost: 0,
      sale: 0,
    }])
  }, [])

  const updateRunCharge = useCallback((id: string, field: keyof DecorationRunCharge, value: string | number) => {
    setEditRunCharges(prev => prev.map(rc => rc.id === id ? { ...rc, [field]: value } : rc))
  }, [])

  const removeRunCharge = useCallback((id: string) => {
    setEditRunCharges(prev => prev.filter(rc => rc.id !== id))
  }, [])

  // ── Render ──

  const qtyRows = Object.keys(editGrid)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Decorations"
        subtitle={selectedVendor
          ? `${selectedVendor.name} — ${currentMatrices.length} pricing matrices`
          : `${vendors.length} decorator vendors · ${matrices.length} pricing matrices`
        }
        action={
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Decoration
          </button>
        }
      />

      {/* Breadcrumb */}
      {selectedVendor && (
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => setSelectedVendorId(null)}
            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All Decorators
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-700 font-medium">{selectedVendor.name}</span>
        </div>
      )}

      {/* ===== VENDOR CARDS VIEW (Landing) ===== */}
      {!selectedVendor && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.map(vendor => {
            const vendorMatrices = vendorMatricesMap[vendor.id] ?? []
            const methods = [...new Set(vendorMatrices.map(m => m.method))]

            return (
              <button
                key={vendor.id}
                onClick={() => setSelectedVendorId(vendor.id)}
                className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:border-slate-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors mt-1" />
                </div>

                <h3 className="text-sm font-semibold text-slate-900 mb-1">{vendor.name}</h3>

                {vendor.city && vendor.state && (
                  <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                    <MapPin className="w-3 h-3" />
                    {vendor.city}, {vendor.state}
                  </p>
                )}

                {/* Methods offered */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {methods.map(method => {
                    const colors = METHOD_COLOR_MAP[method] ?? DEFAULT_METHOD_COLOR
                    return (
                      <span key={method} className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${colors.bg} ${colors.text}`}>
                        {method}
                      </span>
                    )
                  })}
                  {methods.length === 0 && (
                    <span className="text-[10px] text-slate-400">No matrices yet</span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 pt-3 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <Grid3x3 className="w-3 h-3" />
                    {vendorMatrices.length} {vendorMatrices.length === 1 ? 'matrix' : 'matrices'}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {vendorMatrices.reduce((sum, m) => sum + m.tier_count, 0)} price breaks
                  </span>
                </div>
              </button>
            )
          })}

          {/* Unassigned matrices indicator */}
          {(vendorMatricesMap['unassigned']?.length ?? 0) > 0 && (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-5 text-left">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-3">
                <Palette className="w-5 h-5 text-slate-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700 mb-1">Unassigned</h3>
              <p className="text-xs text-slate-500 mb-3">{vendorMatricesMap['unassigned'].length} matrices not linked to a vendor</p>
              <div className="space-y-1.5">
                {vendorMatricesMap['unassigned'].map(m => (
                  <button
                    key={m.id}
                    onClick={() => openEditModal(m)}
                    className="w-full text-left text-xs text-slate-600 hover:text-blue-600 transition-colors truncate"
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== VENDOR MATRICES VIEW (Drilled in) ===== */}
      {selectedVendor && (
        <>
          {currentMatrices.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Palette className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Decoration Matrices</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                {selectedVendor.name} doesn&apos;t have any pricing matrices yet. Add one to start building price breaks.
              </p>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Decoration
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentMatrices.map(matrix => {
                const colors = METHOD_COLOR_MAP[matrix.method] ?? DEFAULT_METHOD_COLOR
                const Icon = METHOD_ICON_MAP[matrix.method] ?? Palette
                const charges = chargesMap[matrix.id]
                const setupCount = charges?.setupCharges.length ?? 0
                const runCount = charges?.runCharges.length ?? 0

                return (
                  <button
                    key={matrix.id}
                    onClick={() => openEditModal(matrix)}
                    className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:border-slate-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${colors.text}`} />
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors mt-1" />
                    </div>

                    <h3 className="text-sm font-semibold text-slate-900 mb-1 truncate">{matrix.name}</h3>

                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} mb-3`}>
                      {matrix.method}
                    </span>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 pt-3 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Grid3x3 className="w-3 h-3" />
                        {matrix.tier_count} price breaks
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {runCount} run
                      </span>
                      <span className="flex items-center gap-1">
                        <Settings2 className="w-3 h-3" />
                        {setupCount} setup
                      </span>
                    </div>
                  </button>
                )
              })}

              {/* + Add Card */}
              <button
                onClick={openCreateModal}
                className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-5 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center min-h-[160px] group"
              >
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                  <Plus className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <span className="text-sm font-medium text-slate-500 group-hover:text-blue-600 transition-colors">Add Decoration</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* ===== EDIT MODAL ===== */}
      <Modal
        isOpen={!!editingMatrix}
        onClose={closeModal}
        title={isCreating ? 'New Decoration' : `Edit: ${editingMatrix?.name || ''}`}
        size="lg"
        footer={
          <div className="flex items-center justify-between">
            <div>
              {!isCreating && editingMatrix && (
                <button
                  onClick={() => handleDelete(editingMatrix.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
              >
                {isCreating ? 'Create Decoration' : 'Save Changes'}
              </button>
            </div>
          </div>
        }
      >
        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 -mx-6 px-6 mb-5">
          {([
            { key: 'basics' as ModalTab, label: 'Basics', icon: Pencil },
            { key: 'price-breaks' as ModalTab, label: 'Price Breaks', icon: Grid3x3 },
            { key: 'charges' as ModalTab, label: 'Run Charges & Setups', icon: DollarSign },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab 1: Basics ── */}
        {activeTab === 'basics' && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Decoration Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                placeholder="e.g., Culture Studio — Screen Print"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Decoration Type
              </label>
              <select
                value={methodDisplayToKey(editMethod)}
                onChange={e => {
                  const label = DECORATION_METHOD_LABELS[e.target.value] ?? e.target.value
                  setEditMethod(label)
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                {DECORATION_METHODS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {editingMatrix && (
              <div className="bg-slate-50 rounded-lg p-4 text-xs text-slate-500 space-y-1">
                <p><span className="font-medium text-slate-600">ID:</span> {editingMatrix.id}</p>
                <p><span className="font-medium text-slate-600">Tiers:</span> {qtyRows.length} quantity rows</p>
                <p><span className="font-medium text-slate-600">Columns:</span> {editColorCounts.length} {getColumnLabel(editMethod).toLowerCase()} columns</p>
              </div>
            )}
          </div>
        )}

        {/* ── Tab 2: Price Breaks ── */}
        {activeTab === 'price-breaks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900">Price Break Matrix</h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={addColorColumn}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add {getColumnLabel(editMethod)}
                </button>
                <button
                  onClick={addQuantityRow}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add Qty Row
                </button>
              </div>
            </div>

            {qtyRows.length === 0 ? (
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-8 text-center">
                <Hash className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500 mb-3">No price breaks configured yet.</p>
                <p className="text-xs text-slate-400">Add quantity rows and color/stitch columns to build your pricing matrix.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider min-w-[120px]">
                        Qty Range
                      </th>
                      {editColorCounts.map(colorNum => (
                        <th key={colorNum} className="px-2 py-2.5 text-center min-w-[100px]">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-xs font-semibold text-slate-600">
                              {colorNum} {getColumnLabel(editMethod).toLowerCase()}
                            </span>
                            {editColorCounts.length > 1 && (
                              <button
                                onClick={() => removeColorColumn(colorNum)}
                                className="p-0.5 text-slate-300 hover:text-red-500 transition-colors"
                                title="Remove column"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </th>
                      ))}
                      <th className="px-2 py-2.5 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {qtyRows.map((rowKey, rowIdx) => (
                      <tr key={rowKey} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="px-2 py-1.5">
                          <input
                            type="text"
                            value={rowKey}
                            onChange={e => updateRowKey(rowKey, e.target.value)}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs font-mono text-slate-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                        </td>
                        {editColorCounts.map(colorNum => (
                          <td key={colorNum} className="px-2 py-1.5">
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
                              <input
                                type="number" onFocus={(e) => e.target.select()}
                                step="0.01"
                                min="0"
                                value={editGrid[rowKey]?.[String(colorNum)] ?? 0}
                                onChange={e => updateCellPrice(rowKey, String(colorNum), parseFloat(e.target.value) || 0)}
                                className="w-full pl-5 pr-2 py-1.5 border border-slate-200 rounded text-xs font-mono text-slate-700 text-right focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              />
                            </div>
                          </td>
                        ))}
                        <td className="px-1 py-1.5 text-center">
                          <button
                            onClick={() => removeQuantityRow(rowKey)}
                            className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                            title="Remove row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <p className="text-xs text-slate-400">
              Enter the per-unit decoration cost at each quantity break and {getColumnLabel(editMethod).toLowerCase()} level. These costs are used when building project quotes.
            </p>
          </div>
        )}

        {/* ── Tab 3: Run Charges & Setups ── */}
        {activeTab === 'charges' && (
          <div className="space-y-8">
            {/* Decoration Setup Charges */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Decoration Setup Charges</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Setup charges for the primary decoration (e.g., screen setup, digitizing).
                  </p>
                </div>
                <button
                  onClick={addSetupCharge}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add Setup
                </button>
              </div>

              {editSetupCharges.length === 0 ? (
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-6 text-center">
                  <p className="text-sm text-slate-500">No setup charges configured.</p>
                  <p className="text-xs text-slate-400 mt-1">Add charges like digitizing fees, screen setup fees, etc.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-[110px]">Cost ($)</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-[110px]">Sale Price ($)</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-[120px]">Free Above Qty</th>
                        <th className="px-3 py-2.5 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {editSetupCharges.map((sc, idx) => (
                        <tr key={sc.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                          <td className="px-2 py-1.5">
                            <input
                              type="text"
                              value={sc.name}
                              onChange={e => updateSetupCharge(sc.id, 'name', e.target.value)}
                              placeholder="e.g., Digitizing Fee"
                              className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs text-slate-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
                              <input
                                type="number" onFocus={(e) => e.target.select()}
                                step="0.01"
                                min="0"
                                value={sc.cost}
                                onChange={e => updateSetupCharge(sc.id, 'cost', parseFloat(e.target.value) || 0)}
                                className="w-full pl-5 pr-2 py-1.5 border border-slate-200 rounded text-xs font-mono text-slate-700 text-right focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              />
                            </div>
                          </td>
                          <td className="px-2 py-1.5">
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
                              <input
                                type="number" onFocus={(e) => e.target.select()}
                                step="0.01"
                                min="0"
                                value={sc.sale_price}
                                onChange={e => updateSetupCharge(sc.id, 'sale_price', parseFloat(e.target.value) || 0)}
                                className="w-full pl-5 pr-2 py-1.5 border border-slate-200 rounded text-xs font-mono text-slate-700 text-right focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              />
                            </div>
                          </td>
                          <td className="px-2 py-1.5">
                            <input
                              type="number" onFocus={(e) => e.target.select()}
                              min="0"
                              value={sc.free_above_qty ?? ''}
                              onChange={e => {
                                const val = e.target.value ? parseInt(e.target.value) : undefined
                                updateSetupCharge(sc.id, 'free_above_qty', val)
                              }}
                              placeholder="--"
                              className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs font-mono text-slate-700 text-right focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                          </td>
                          <td className="px-1 py-1.5 text-center">
                            <button
                              onClick={() => removeSetupCharge(sc.id)}
                              className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                              title="Remove charge"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200" />

            {/* Run Charges */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Run Charges</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Per-unit surcharges applied during production (e.g., puff ink, printed tags).
                  </p>
                </div>
                <button
                  onClick={addRunCharge}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add Charge
                </button>
              </div>

              {editRunCharges.length === 0 ? (
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-6 text-center">
                  <p className="text-sm text-slate-500">No run charges configured.</p>
                  <p className="text-xs text-slate-400 mt-1">Add per-unit charges like flash charges, specialty ink surcharges, etc.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-[130px]">Cost ($) / unit</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-[130px]">Sale ($) / unit</th>
                        <th className="px-3 py-2.5 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {editRunCharges.map((rc, idx) => (
                        <tr key={rc.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                          <td className="px-2 py-1.5">
                            <input
                              type="text"
                              value={rc.name}
                              onChange={e => updateRunCharge(rc.id, 'name', e.target.value)}
                              placeholder="e.g., Per Head Run Charge"
                              className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs text-slate-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
                              <input
                                type="number" onFocus={(e) => e.target.select()}
                                step="0.01"
                                min="0"
                                value={rc.cost}
                                onChange={e => updateRunCharge(rc.id, 'cost', parseFloat(e.target.value) || 0)}
                                className="w-full pl-5 pr-2 py-1.5 border border-slate-200 rounded text-xs font-mono text-slate-700 text-right focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              />
                            </div>
                          </td>
                          <td className="px-2 py-1.5">
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
                              <input
                                type="number" onFocus={(e) => e.target.select()}
                                step="0.01"
                                min="0"
                                value={rc.sale}
                                onChange={e => updateRunCharge(rc.id, 'sale', parseFloat(e.target.value) || 0)}
                                className="w-full pl-5 pr-2 py-1.5 border border-slate-200 rounded text-xs font-mono text-slate-700 text-right focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              />
                            </div>
                          </td>
                          <td className="px-1 py-1.5 text-center">
                            <button
                              onClick={() => removeRunCharge(rc.id)}
                              className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                              title="Remove charge"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
