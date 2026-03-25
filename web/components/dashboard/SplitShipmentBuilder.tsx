"use client"

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  MapPin,
  Plus,
  Trash2,
  AlertTriangle,
  Check,
  Package,
  ChevronDown,
  Download,
  User,
  Phone,
  X,
} from 'lucide-react'
import type {
  SplitShipmentDestination,
  SplitShipmentAllocation,
  AddressBookFolder,
  AddressBookEntry,
  Address,
} from '@/lib/types/app'

// ===== PROPS =====

interface SplitShipmentLineItem {
  id: string
  productName: string
  totalQuantity: number
}

interface SplitShipmentBuilderProps {
  lineItems: SplitShipmentLineItem[]
  clientId: string
  addressBook: AddressBookFolder[]
  existingDestinations?: SplitShipmentDestination[]
  onSave: (destinations: SplitShipmentDestination[]) => void
  onClose: () => void
  onSaveToAddressBook?: (address: Address, folderName?: string) => void  // FB-047
}

// ===== ID GENERATOR =====

let nextId = 1
function generateId(prefix: string = 'dest') {
  return `${prefix}-${Date.now()}-${nextId++}`
}

// ===== EMPTY ADDRESS =====

const EMPTY_ADDRESS: Address = {
  street: '',
  city: '',
  state: '',
  zip: '',
  country: 'US',
}

// ===== COMPONENT =====

export default function SplitShipmentBuilder({
  lineItems,
  clientId,
  addressBook,
  existingDestinations,
  onSave,
  onClose,
  onSaveToAddressBook,
}: SplitShipmentBuilderProps) {
  // --- State ---
  const [destinations, setDestinations] = useState<SplitShipmentDestination[]>(
    () =>
      existingDestinations?.length
        ? existingDestinations
        : []
  )
  const [showAddressDropdown, setShowAddressDropdown] = useState(false)
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // New address form state
  const [newLabel, setNewLabel] = useState('')
  const [newStreet, setNewStreet] = useState('')
  const [newStreet2, setNewStreet2] = useState('')
  const [newCity, setNewCity] = useState('')
  const [newState, setNewState] = useState('')
  const [newZip, setNewZip] = useState('')
  const [newContactName, setNewContactName] = useState('')
  const [newContactPhone, setNewContactPhone] = useState('')
  const [saveToAddressBook, setSaveToAddressBook] = useState(false)  // FB-047

  // --- Flatten address book ---
  const allAddressEntries = useMemo(() => {
    return addressBook.flatMap((folder) => folder.entries)
  }, [addressBook])

  const hasAddressBookEntries = allAddressEntries.length > 0

  // --- Allocation calculations ---
  const columnTotals = useMemo(() => {
    const totals: Record<string, number> = {}
    lineItems.forEach((li) => {
      totals[li.id] = destinations.reduce((sum, dest) => {
        const alloc = dest.allocations.find((a) => a.line_item_id === li.id)
        return sum + (alloc?.quantity ?? 0)
      }, 0)
    })
    return totals
  }, [destinations, lineItems])

  const columnRemaining = useMemo(() => {
    const remaining: Record<string, number> = {}
    lineItems.forEach((li) => {
      remaining[li.id] = li.totalQuantity - (columnTotals[li.id] ?? 0)
    })
    return remaining
  }, [lineItems, columnTotals])

  const allColumnsBalanced = useMemo(
    () => lineItems.every((li) => columnRemaining[li.id] === 0),
    [lineItems, columnRemaining]
  )

  const isValid = destinations.length > 0 && allColumnsBalanced && destinations.every((d) => d.label.trim())

  const totalPieces = useMemo(
    () => destinations.reduce((sum, d) => sum + d.allocations.reduce((s, a) => s + a.quantity, 0), 0),
    [destinations]
  )

  // --- Toast helper ---
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }, [])

  // --- Add destination from address book ---
  const addFromAddressBook = useCallback(
    (entry: AddressBookEntry) => {
      const newDest: SplitShipmentDestination = {
        id: generateId(),
        address_book_entry_id: entry.id,
        label: entry.label,
        address: { ...entry.address },
        contact_name: entry.contact_name,
        contact_phone: entry.contact_phone,
        allocations: lineItems.map((li) => ({
          line_item_id: li.id,
          product_name: li.productName,
          quantity: 0,
        })),
      }
      setDestinations((prev) => [...prev, newDest])
      setShowAddressDropdown(false)
      showToast(`Added "${entry.label}"`)
    },
    [lineItems, showToast]
  )

  // --- Add new address inline ---
  const addNewAddress = useCallback(() => {
    if (!newLabel.trim() || !newStreet.trim()) return
    const address: Address = {
      street: newStreet.trim(),
      street2: newStreet2.trim() || undefined,
      city: newCity.trim(),
      state: newState.trim().toUpperCase(),
      zip: newZip.trim(),
      country: 'US',
    }
    const newDest: SplitShipmentDestination = {
      id: generateId(),
      label: newLabel.trim(),
      address,
      contact_name: newContactName.trim() || undefined,
      contact_phone: newContactPhone.trim() || undefined,
      allocations: lineItems.map((li) => ({
        line_item_id: li.id,
        product_name: li.productName,
        quantity: 0,
      })),
    }
    setDestinations((prev) => [...prev, newDest])

    // FB-047: Save to client address book if checked
    if (saveToAddressBook && onSaveToAddressBook) {
      onSaveToAddressBook(address, newLabel.trim())
      showToast(`Added "${newDest.label}" — saved to address book`)
    } else {
      showToast(`Added "${newDest.label}"`)
    }

    setShowNewAddressForm(false)
    resetNewAddressForm()
  }, [newLabel, newStreet, newStreet2, newCity, newState, newZip, newContactName, newContactPhone, lineItems, showToast, saveToAddressBook, onSaveToAddressBook])

  const resetNewAddressForm = () => {
    setNewLabel('')
    setNewStreet('')
    setNewStreet2('')
    setNewCity('')
    setNewState('')
    setNewZip('')
    setNewContactName('')
    setNewContactPhone('')
    setSaveToAddressBook(false)
  }

  // --- Remove destination ---
  const removeDestination = useCallback((id: string) => {
    setDestinations((prev) => prev.filter((d) => d.id !== id))
  }, [])

  // --- Update allocation quantity ---
  const updateAllocation = useCallback(
    (destId: string, lineItemId: string, quantity: number) => {
      setDestinations((prev) =>
        prev.map((dest) => {
          if (dest.id !== destId) return dest
          return {
            ...dest,
            allocations: dest.allocations.map((a) =>
              a.line_item_id === lineItemId ? { ...a, quantity: Math.max(0, quantity) } : a
            ),
          }
        })
      )
    },
    []
  )

  // --- FB-049: PNG download via print dialog (html2canvas not available) ---
  const handleDownloadPNG = useCallback(() => {
    const element = document.getElementById('split-shipment-visual')
    if (!element) {
      showToast('Nothing to capture')
      return
    }
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`<html><head><title>Split Shipment</title><style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #1e293b; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; font-size: 13px; }
        th { background: #f8fafc; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; color: #64748b; }
      </style></head><body>`)
      printWindow.document.write(element.outerHTML)
      printWindow.document.write('</body></html>')
      printWindow.document.close()
      printWindow.print()
    }
    showToast('Print dialog opened — save as PDF or print')
  }, [showToast])

  return (
    <div className="space-y-6">
      {/* ===== Header ===== */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold font-heading text-slate-900">
            Split Shipment Builder
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Allocate{' '}
            <span className="font-medium text-slate-700">
              {lineItems.length} product{lineItems.length !== 1 ? 's' : ''}
            </span>{' '}
            across multiple destinations
          </p>
        </div>
        <button
          onClick={handleDownloadPNG}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download PNG
        </button>
      </div>

      {/* ===== Main Layout: Destinations + Allocation Matrix ===== */}
      <div id="split-shipment-visual" className="grid grid-cols-5 gap-5">
        {/* ── Left Column: Destination Cards (2/5) ── */}
        <div className="col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">
              Destinations ({destinations.length})
            </h3>
          </div>

          <AnimatePresence>
            {destinations.map((dest) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-primary-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-3.5 h-3.5 text-primary-600" />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={dest.label}
                        onChange={(e) =>
                          setDestinations((prev) =>
                            prev.map((d) =>
                              d.id === dest.id ? { ...d, label: e.target.value } : d
                            )
                          )
                        }
                        className="text-sm font-semibold text-slate-800 bg-transparent border-0 border-b border-transparent hover:border-slate-200 focus:border-primary-500 outline-none transition-colors w-full"
                        placeholder="Location name"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeDestination(dest.id)}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove destination"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-xs text-slate-500 space-y-0.5 pl-9">
                  <p>{dest.address.street || 'No street'}{dest.address.street2 && `, ${dest.address.street2}`}</p>
                  <p>
                    {dest.address.city}
                    {dest.address.state ? `, ${dest.address.state}` : ''}{' '}
                    {dest.address.zip}
                  </p>
                  {dest.contact_name && (
                    <p className="flex items-center gap-1 mt-1 text-slate-400">
                      <User className="w-3 h-3" />
                      {dest.contact_name}
                      {dest.contact_phone && (
                        <span className="flex items-center gap-0.5 ml-2">
                          <Phone className="w-3 h-3" />
                          {dest.contact_phone}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add Destination Button + Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                if (hasAddressBookEntries) {
                  setShowAddressDropdown(!showAddressDropdown)
                  setShowNewAddressForm(false)
                } else {
                  setShowNewAddressForm(true)
                  setShowAddressDropdown(false)
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-medium text-slate-500 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Destination
              {hasAddressBookEntries && <ChevronDown className="w-3 h-3" />}
            </button>

            {/* Address Book Dropdown */}
            <AnimatePresence>
              {showAddressDropdown && hasAddressBookEntries && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-20 left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden"
                >
                  <div className="max-h-60 overflow-y-auto">
                    {addressBook.map((folder) => (
                      <div key={folder.id}>
                        <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                          {folder.name}
                        </div>
                        {folder.entries.map((entry) => {
                          const alreadyAdded = destinations.some(
                            (d) => d.address_book_entry_id === entry.id
                          )
                          return (
                            <button
                              key={entry.id}
                              onClick={() => !alreadyAdded && addFromAddressBook(entry)}
                              disabled={alreadyAdded}
                              className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
                                alreadyAdded
                                  ? 'text-slate-300 cursor-not-allowed bg-slate-50'
                                  : 'text-slate-700 hover:bg-primary-50 hover:text-primary-700'
                              }`}
                            >
                              <span className="font-medium">{entry.label}</span>
                              {alreadyAdded && (
                                <span className="text-[10px] ml-2 text-slate-400">
                                  (already added)
                                </span>
                              )}
                              <p className="text-xs text-slate-400 mt-0.5">
                                {entry.address.street}, {entry.address.city},{' '}
                                {entry.address.state} {entry.address.zip}
                              </p>
                            </button>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setShowAddressDropdown(false)
                      setShowNewAddressForm(true)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-primary-600 hover:bg-primary-50 border-t border-slate-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    New Address
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Inline New Address Form */}
          <AnimatePresence>
            {showNewAddressForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="bg-primary-50/50 border border-primary-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-primary-700 uppercase tracking-wide">
                      New Address
                    </h4>
                    <button
                      onClick={() => {
                        setShowNewAddressForm(false)
                        resetNewAddressForm()
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wide mb-0.5">
                      Label *
                    </label>
                    <input
                      type="text"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      placeholder="e.g., Nashville HQ"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wide mb-0.5">
                      Street *
                    </label>
                    <input
                      type="text"
                      value={newStreet}
                      onChange={(e) => setNewStreet(e.target.value)}
                      placeholder="123 Broadway"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wide mb-0.5">
                      Street Line 2
                    </label>
                    <input
                      type="text"
                      value={newStreet2}
                      onChange={(e) => setNewStreet2(e.target.value)}
                      placeholder="Suite, Unit, Floor, etc."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wide mb-0.5">
                        City
                      </label>
                      <input
                        type="text"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        placeholder="Nashville"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wide mb-0.5">
                        State
                      </label>
                      <input
                        type="text"
                        value={newState}
                        onChange={(e) => setNewState(e.target.value)}
                        placeholder="TN"
                        maxLength={2}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm uppercase focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wide mb-0.5">
                        ZIP
                      </label>
                      <input
                        type="text"
                        value={newZip}
                        onChange={(e) => setNewZip(e.target.value)}
                        placeholder="37203"
                        maxLength={5}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wide mb-0.5">
                        Contact Name
                      </label>
                      <input
                        type="text"
                        value={newContactName}
                        onChange={(e) => setNewContactName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wide mb-0.5">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        value={newContactPhone}
                        onChange={(e) => setNewContactPhone(e.target.value)}
                        placeholder="615-555-0101"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                      />
                    </div>
                  </div>

                  {/* FB-047: Save to address book checkbox */}
                  {onSaveToAddressBook && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveToAddressBook}
                        onChange={(e) => setSaveToAddressBook(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-xs text-slate-600">Save to client address book</span>
                    </label>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={addNewAddress}
                      disabled={!newLabel.trim() || !newStreet.trim()}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                        newLabel.trim() && newStreet.trim()
                          ? 'bg-primary-600 text-white hover:bg-primary-700'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      Add Address
                    </button>
                    <button
                      onClick={() => {
                        setShowNewAddressForm(false)
                        resetNewAddressForm()
                      }}
                      className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {destinations.length === 0 && !showNewAddressForm && (
            <div className="text-center py-6">
              <MapPin className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">
                {hasAddressBookEntries
                  ? 'Select from address book or add a new address'
                  : 'No saved addresses'}
              </p>
            </div>
          )}
        </div>

        {/* ── Right Area: Allocation Matrix (3/5) ── */}
        <div className="col-span-3">
          {destinations.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
              <Package className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500">
                Add destinations to start allocating
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Products will appear as columns, destinations as rows
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Matrix Header */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-44">
                        Destination
                      </th>
                      {lineItems.map((li) => (
                        <th
                          key={li.id}
                          className="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide min-w-[120px]"
                        >
                          <div className="truncate max-w-[120px] mx-auto" title={li.productName}>
                            {li.productName}
                          </div>
                          <span className="text-[10px] font-normal text-slate-400">
                            ({li.totalQuantity.toLocaleString()} total)
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {destinations.map((dest) => (
                      <tr key={dest.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-slate-700 truncate max-w-[140px]">
                              {dest.label || 'Untitled'}
                            </span>
                          </div>
                        </td>
                        {lineItems.map((li) => {
                          const alloc = dest.allocations.find(
                            (a) => a.line_item_id === li.id
                          )
                          return (
                            <td key={li.id} className="px-3 py-3 text-center">
                              <input
                                type="number"
                                value={alloc?.quantity ?? 0}
                                onChange={(e) =>
                                  updateAllocation(
                                    dest.id,
                                    li.id,
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                onFocus={(e) => e.target.select()}
                                min={0}
                                className="w-20 mx-auto px-2 py-1.5 border border-slate-200 rounded-lg text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </td>
                          )
                        })}
                      </tr>
                    ))}

                    {/* Totals Row */}
                    <tr className="bg-slate-50 border-t border-slate-200">
                      <td className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                        Allocated
                      </td>
                      {lineItems.map((li) => {
                        const total = columnTotals[li.id] ?? 0
                        const remaining = columnRemaining[li.id] ?? 0
                        const isExact = remaining === 0
                        const isOver = remaining < 0
                        return (
                          <td key={li.id} className="px-3 py-3 text-center">
                            <span
                              className={`text-sm font-mono font-bold ${
                                isExact
                                  ? 'text-emerald-600'
                                  : isOver
                                    ? 'text-red-600'
                                    : 'text-amber-600'
                              }`}
                            >
                              {total.toLocaleString()}/{li.totalQuantity.toLocaleString()}
                            </span>
                          </td>
                        )
                      })}
                    </tr>

                    {/* Remaining Row */}
                    <tr className="bg-slate-50/50">
                      <td className="px-4 py-2 text-xs font-medium text-slate-400">
                        Remaining
                      </td>
                      {lineItems.map((li) => {
                        const remaining = columnRemaining[li.id] ?? 0
                        const isExact = remaining === 0
                        const isOver = remaining < 0
                        return (
                          <td key={li.id} className="px-3 py-2 text-center">
                            {isExact ? (
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                                <Check className="w-3 h-3" />
                                Balanced
                              </span>
                            ) : isOver ? (
                              <span className="inline-flex items-center gap-1 text-xs text-red-600">
                                <AlertTriangle className="w-3 h-3" />
                                {Math.abs(remaining)} over
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                                {remaining.toLocaleString()} left
                              </span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== Summary Footer ===== */}
      {destinations.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-slate-400 text-xs">Destinations</span>
                <p className="font-mono font-bold text-slate-800">
                  {destinations.length}
                </p>
              </div>
              <div className="w-px h-8 bg-slate-100" />
              <div>
                <span className="text-slate-400 text-xs">Total Pieces</span>
                <p className="font-mono font-bold text-slate-800">
                  {totalPieces.toLocaleString()}
                </p>
              </div>
              <div className="w-px h-8 bg-slate-100" />
              <div>
                <span className="text-slate-400 text-xs">Per-Product</span>
                <div className="flex items-center gap-3">
                  {lineItems.map((li) => {
                    const balanced = columnRemaining[li.id] === 0
                    return (
                      <span
                        key={li.id}
                        className={`text-xs font-mono ${
                          balanced ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                        title={li.productName}
                      >
                        {(columnTotals[li.id] ?? 0).toLocaleString()}/{li.totalQuantity.toLocaleString()}
                        {balanced && <Check className="w-3 h-3 inline ml-0.5" />}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>

            {!allColumnsBalanced && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-medium text-amber-700">
                  Quantities not balanced
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== Action Buttons ===== */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-400">
          {destinations.length} destination{destinations.length !== 1 ? 's' : ''}{' '}
          &middot; {lineItems.length} product{lineItems.length !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(destinations)}
            disabled={!isValid}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              isValid
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Package className="w-4 h-4" />
            Save Split Shipment
          </button>
        </div>
      </div>

      {/* ===== Toast ===== */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-[9999] bg-white border border-emerald-200 shadow-xl rounded-xl px-4 py-3 flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-slate-700">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
