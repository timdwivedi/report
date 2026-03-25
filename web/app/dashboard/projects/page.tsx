"use client"

import { useState, useMemo, useCallback } from 'react'
import PageHeader from '@/components/shared/PageHeader'
import KanbanBoard from '@/components/shared/KanbanBoard'
import DataTable, { Column } from '@/components/shared/DataTable'
import Modal from '@/components/shared/Modal'
import SlidePanel from '@/components/shared/SlidePanel'
import ProjectDetailPanel from '@/components/projects/ProjectDetailPanel'
import ProductDetailPanel from '@/components/projects/ProductDetailPanel'
import CreativeRequestDetailPanel from '@/components/projects/CreativeRequestDetailPanel'
import TemplateGalleryModal from '@/components/projects/TemplateGalleryModal'
import { useToast } from '@/components/shared'
import { getDemoProjects, getDemoClients, getDemoCreativeRequests } from '@/lib/demo/demo-data-provider'
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_STYLES } from '@/lib/demo/demo-data-provider'
import type { Project, ProjectStatus, ProjectTemplate, ProjectLineItem, Client } from '@/lib/types/app'
import { Kanban, List, Plus, AlertTriangle, Calendar, DollarSign, Copy, Check, Send, Layers, UserPlus } from 'lucide-react'

const KANBAN_STATUSES: ProjectStatus[] = [
  'opportunity', 'qualifying', 'curating', 'in-design',
  'presenting', 'client-review', 'confirmed', 'cancelled',
]

const FORM_STATUSES: ProjectStatus[] = [
  'opportunity', 'qualifying', 'curating', 'in-design',
  'presenting', 'client-review', 'confirmed',
]

const STATUS_COLORS: Record<ProjectStatus, string> = {
  'opportunity': 'bg-blue-500',
  'qualifying': 'bg-sky-500',
  'curating': 'bg-indigo-500',
  'in-design': 'bg-violet-500',
  'presenting': 'bg-pink-500',
  'client-review': 'bg-orange-500',
  'confirmed': 'bg-emerald-500',
  'order-entry': 'bg-red-500',
  'in-production': 'bg-cyan-500',
  'shipped': 'bg-green-500',
  'cancelled': 'bg-gray-400',
}

interface NewProjectForm {
  name: string
  client_id: string
  status: ProjectStatus
  in_hands_date: string
  budget: string
  is_critical: boolean
  internal_notes: string
}

const INITIAL_FORM: NewProjectForm = {
  name: '',
  client_id: '',
  status: 'opportunity',
  in_hands_date: '',
  budget: '',
  is_critical: false,
  internal_notes: '',
}

export default function ProjectsPage() {
  const { showToast } = useToast()
  const [projects, setProjects] = useState<Project[]>(() => getDemoProjects())
  const [view, setView] = useState<'kanban' | 'table'>('kanban')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const [showNewModal, setShowNewModal] = useState(false)
  const [form, setForm] = useState<NewProjectForm>(INITIAL_FORM)

  // Slide panel state
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedLineItem, setSelectedLineItem] = useState<ProjectLineItem | null>(null)
  const [selectedCreativeRequestId, setSelectedCreativeRequestId] = useState<string | null>(null)
  const [showTemplateGallery, setShowTemplateGallery] = useState(false)
  const [copiedPortalLink, setCopiedPortalLink] = useState(false)

  const [localClients, setLocalClients] = useState<Client[]>(() => getDemoClients())
  const demoClients = localClients
  const [showInlineClient, setShowInlineClient] = useState(false)
  const [newClientCompany, setNewClientCompany] = useState('')
  const [newClientContactName, setNewClientContactName] = useState('')
  const [newClientContactEmail, setNewClientContactEmail] = useState('')
  const [newClientContactPhone, setNewClientContactPhone] = useState('')
  const [newClientContactRole, setNewClientContactRole] = useState<'primary' | 'billing' | 'other'>('primary')

  const filteredProjects = useMemo(() => {
    if (statusFilter === 'all') return projects
    return projects.filter(p => p.status === statusFilter)
  }, [statusFilter, projects])

  // Derive selected project and line item
  const selectedProject = useMemo(() => {
    if (!selectedProjectId) return null
    return projects.find(p => p.id === selectedProjectId) ?? null
  }, [selectedProjectId, projects])


  const selectedCreativeRequest = useMemo(() => {
    if (!selectedCreativeRequestId || !selectedProject) return null
    const requests = getDemoCreativeRequests(selectedProject.id)
    return requests.find(r => r.id === selectedCreativeRequestId) ?? null
  }, [selectedCreativeRequestId, selectedProject])

  // Status counts for filter pills
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: projects.length }
    projects.forEach(p => {
      counts[p.status] = (counts[p.status] || 0) + 1
    })
    return counts
  }, [projects])

  // Handle Kanban move
  const handleMove = useCallback((itemId: string, toColumnId: string) => {
    const newStatus = toColumnId as ProjectStatus
    setProjects(prev =>
      prev.map(p =>
        p.id === itemId
          ? { ...p, status: newStatus, updated_at: new Date().toISOString() }
          : p
      )
    )
    const label = PROJECT_STATUS_LABELS[newStatus] || toColumnId
    showToast(`Project moved to ${label}`, 'action')
  }, [showToast])

  // Handle status change from the detail panel stepper
  const handleStatusChange = useCallback((projectId: string, status: ProjectStatus) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? { ...p, status, updated_at: new Date().toISOString() }
          : p
      )
    )
    const label = PROJECT_STATUS_LABELS[status] || status
    showToast(`Status updated to ${label}`, 'action')
  }, [showToast])

  // Handle new project creation
  const handleCreateProject = useCallback(() => {
    if (!form.name.trim()) return

    const client = demoClients.find(c => c.id === form.client_id)
    const now = new Date().toISOString()
    const budgetNum = form.budget ? parseFloat(form.budget) : 0

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      org_id: 'demo-org',
      client_id: form.client_id || 'unknown',
      client_name: client?.company_name || 'Unknown Client',
      project_number: `PRJ-2026-${String(projects.length + 1).padStart(4, '0')}`,
      name: form.name.trim(),
      status: form.status,
      source: 'direct',
      in_hands_date: form.in_hands_date || undefined,
      budget: budgetNum || undefined,
      is_critical: form.is_critical,
      estimated_total: budgetNum,
      internal_notes: form.internal_notes.trim() || undefined,
      line_items: [],
      created_at: now,
      updated_at: now,
    }

    setProjects(prev => [...prev, newProject])
    setShowNewModal(false)
    setForm(INITIAL_FORM)
    showToast('Project created successfully', 'action')
  }, [form, demoClients, projects.length, showToast])

  // Handle copying portal link
  const handleCopyPortalLink = useCallback(() => {
    if (!selectedProject) return
    const link = selectedProject.shareable_link
      ? `${window.location.origin}/portal/${selectedProject.shareable_link}`
      : `${window.location.origin}/portal/${selectedProject.id}`
    navigator.clipboard.writeText(link)
    setCopiedPortalLink(true)
    showToast('Portal link copied to clipboard', 'action')
    setTimeout(() => setCopiedPortalLink(false), 2000)
  }, [selectedProject, showToast])

  // Handle send to client
  const handleSendToClient = useCallback(() => {
    if (!selectedProject) return
    showToast(`Presentation sent to ${selectedProject.client_name}`, 'action')
  }, [selectedProject, showToast])

  // Handle saving a product (line item) from the nested panel
  const handleSaveProduct = useCallback((updatedLineItem: import('@/lib/types/app').ProjectLineItem) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== selectedProjectId) return p
        const updatedItems = p.line_items.map(li =>
          li.id === updatedLineItem.id ? updatedLineItem : li
        )
        // If not found in inline items, append it
        const found = p.line_items.some(li => li.id === updatedLineItem.id)
        return {
          ...p,
          line_items: found ? updatedItems : [...p.line_items, updatedLineItem],
          updated_at: new Date().toISOString(),
        }
      })
    )
    setSelectedLineItem(null)
    showToast('Product saved', 'action')
  }, [selectedProjectId, showToast])

  // Handle template selection (demo — shows toast)
  const handleTemplateSelect = useCallback((template: ProjectTemplate) => {
    showToast(`Template loaded: ${template.name} — ${template.line_items.length} line items pre-configured`, 'action')
  }, [showToast])

  // Kanban data
  const kanbanColumns = useMemo(() =>
    KANBAN_STATUSES.map(status => {
      const statusProjects = projects.filter(p => p.status === status)
      const total = statusProjects.reduce((sum, p) => sum + p.estimated_total, 0)
      return {
        id: status,
        title: PROJECT_STATUS_LABELS[status],
        color: STATUS_COLORS[status],
        count: statusProjects.length,
        subtitle: total > 0 ? `$${total.toLocaleString()}` : undefined,
      }
    }),
    [projects]
  )

  const kanbanItems = useMemo(() =>
    projects.filter(p => KANBAN_STATUSES.includes(p.status)).map(project => ({
      id: project.id,
      columnId: project.status,
      content: (
        <div
          className="space-y-2 cursor-pointer group"
          onClick={() => setSelectedProjectId(project.id)}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{project.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{project.client_name}</p>
            </div>
            {project.is_critical && (
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono font-medium text-slate-700">
              ${project.estimated_total.toLocaleString()}
            </span>
            {project.in_hands_date && (() => {
              const daysLeft = Math.ceil((new Date(project.in_hands_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const urgencyClass = daysLeft <= 0
                ? 'text-red-600 font-semibold'
                : daysLeft <= 7
                ? 'text-amber-600 font-semibold'
                : 'text-slate-500';
              const label = daysLeft <= 0
                ? `${Math.abs(daysLeft)}d overdue`
                : daysLeft === 1
                ? '1 day left'
                : `${daysLeft}d left`;
              return (
                <span className={`flex items-center gap-1 ${urgencyClass}`}>
                  <Calendar className="w-3 h-3" />
                  {label}
                </span>
              );
            })()}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400">{project.project_number}</span>
            {project.source && (
              <span className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
                {project.source}
              </span>
            )}
            {project.change_request_pending && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
                Changes Requested
              </span>
            )}
          </div>
        </div>
      ),
    })),
    [projects]
  )

  // Table columns
  const tableColumns: Column<Project>[] = [
    {
      key: 'number',
      header: 'Project #',
      width: '12%',
      render: (row) => <span className="text-xs font-mono text-slate-600">{row.project_number}</span>,
    },
    {
      key: 'name',
      header: 'Project Name',
      width: '22%',
      render: (row) => (
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-900">{row.name}</p>
          {row.is_critical && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
        </div>
      ),
    },
    {
      key: 'client',
      header: 'Client',
      width: '16%',
      render: (row) => <span className="text-sm text-slate-700">{row.client_name}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      width: '14%',
      render: (row) => {
        const style = PROJECT_STATUS_STYLES[row.status]
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
              {PROJECT_STATUS_LABELS[row.status]}
            </span>
            {row.change_request_pending && (
              <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700">
                Changes Requested
              </span>
            )}
          </div>
        )
      },
    },
    {
      key: 'total',
      header: 'Est. Total',
      width: '12%',
      align: 'right',
      render: (row) => (
        <span className="text-sm font-mono text-slate-900">${row.estimated_total.toLocaleString()}</span>
      ),
    },
    {
      key: 'date',
      header: 'Deadline',
      width: '12%',
      render: (row) => (
        <span className="text-sm text-slate-500">
          {row.in_hands_date
            ? new Date(row.in_hands_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : '\u2014'}
        </span>
      ),
    },
    {
      key: 'source',
      header: 'Source',
      width: '12%',
      render: (row) => (
        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">{row.source}</span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        subtitle={`${projects.length} total projects`}
        action={
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
              <button
                onClick={() => setView('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Kanban className="w-4 h-4" />
                Board
              </button>
              <button
                onClick={() => setView('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <List className="w-4 h-4" />
                Table
              </button>
            </div>

            <button
              onClick={() => setShowTemplateGallery(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              <Layers className="w-4 h-4" />
              From Template
            </button>

            <button
              onClick={() => setShowNewModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>
        }
      />

      {/* Status Filter Pills (table view) */}
      {view === 'table' && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({statusCounts.all})
          </button>
          {KANBAN_STATUSES.filter(s => s !== 'cancelled').map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                statusFilter === status
                  ? `${PROJECT_STATUS_STYLES[status].bg} ${PROJECT_STATUS_STYLES[status].text}`
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {PROJECT_STATUS_LABELS[status]} ({statusCounts[status] || 0})
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {view === 'kanban' ? (
        <KanbanBoard columns={kanbanColumns} items={kanbanItems} onMove={handleMove} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <DataTable
            columns={tableColumns}
            data={filteredProjects}
            rowKey={(row) => row.id}
            onRowClick={(row) => setSelectedProjectId(row.id)}
            emptyMessage="No projects found."
          />
        </div>
      )}

      {/* Pipeline Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-600">Total Pipeline:</span>
            <span className="font-mono font-bold text-slate-900">
              ${projects.reduce((sum, p) => sum + p.estimated_total, 0).toLocaleString()}
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-slate-600">Critical:</span>
            <span className="font-bold text-amber-600">{projects.filter(p => p.is_critical).length}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="text-slate-600">
            Confirmed: <span className="font-bold text-emerald-600">{projects.filter(p => p.status === 'confirmed').length}</span>
          </div>
        </div>
      </div>

      {/* New Project Modal */}
      <Modal
        isOpen={showNewModal}
        onClose={() => { setShowNewModal(false); setForm(INITIAL_FORM) }}
        title="New Project"
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => { setShowNewModal(false); setForm(INITIAL_FORM) }}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateProject}
              disabled={!form.name.trim()}
              className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Project
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Project Name */}
          <div>
            <label htmlFor="project-name" className="block text-sm font-medium text-slate-700 mb-1">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              id="project-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Q3 Company Uniforms"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Client */}
          <div>
            <label htmlFor="project-client" className="block text-sm font-medium text-slate-700 mb-1">
              Client
            </label>
            <select
              id="project-client"
              value={form.client_id}
              onChange={(e) => {
                if (e.target.value === '__new__') {
                  setShowInlineClient(true)
                  setForm(prev => ({ ...prev, client_id: '' }))
                } else {
                  setShowInlineClient(false)
                  setForm(prev => ({ ...prev, client_id: e.target.value }))
                }
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select a client...</option>
              {demoClients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.company_name}
                </option>
              ))}
              <option value="__new__">+ Create New Client</option>
            </select>

            {/* Inline Client Creation */}
            {showInlineClient && (
              <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-slate-700">New Client</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Company Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={newClientCompany}
                    onChange={(e) => setNewClientCompany(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={newClientContactName}
                      onChange={(e) => setNewClientContactName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={newClientContactEmail}
                      onChange={(e) => setNewClientContactEmail(e.target.value)}
                      placeholder="john@acme.com"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={newClientContactPhone}
                      onChange={(e) => setNewClientContactPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Contact Type</label>
                    <select
                      value={newClientContactRole}
                      onChange={(e) => setNewClientContactRole(e.target.value as 'primary' | 'billing' | 'other')}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="primary">Primary</option>
                      <option value="billing">Billing</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      if (!newClientCompany.trim()) return
                      const newId = `client-${Date.now()}`
                      const now = new Date().toISOString()
                      const newClient: Client = {
                        id: newId,
                        org_id: 'demo-org',
                        company_name: newClientCompany.trim(),
                        billing_address: { street: '', city: '', state: '', zip: '', country: 'US' },
                        payment_terms: 'net30',
                        tax_exempt: false,
                        status: 'active',
                        contacts: newClientContactName.trim() ? [{
                          id: `contact-${Date.now()}`,
                          client_id: newId,
                          name: newClientContactName.trim(),
                          email: newClientContactEmail.trim(),
                          phone: newClientContactPhone.trim() || undefined,
                          role: newClientContactRole,
                          is_primary: newClientContactRole === 'primary',
                        }] : [],
                        created_at: now,
                        updated_at: now,
                      }
                      setLocalClients(prev => [...prev, newClient])
                      setForm(prev => ({ ...prev, client_id: newId }))
                      setShowInlineClient(false)
                      setNewClientCompany('')
                      setNewClientContactName('')
                      setNewClientContactEmail('')
                      setNewClientContactPhone('')
                      setNewClientContactRole('primary')
                      showToast(`Client "${newClient.company_name}" created`, 'action')
                    }}
                    disabled={!newClientCompany.trim()}
                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Client
                  </button>
                  <button
                    onClick={() => {
                      setShowInlineClient(false)
                      setNewClientCompany('')
                      setNewClientContactName('')
                      setNewClientContactEmail('')
                      setNewClientContactPhone('')
                    }}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Status + Project Deadline row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="project-status" className="block text-sm font-medium text-slate-700 mb-1">
                Status
              </label>
              <select
                id="project-status"
                value={form.status}
                onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value as ProjectStatus }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {FORM_STATUSES.map(status => (
                  <option key={status} value={status}>
                    {PROJECT_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="project-date" className="block text-sm font-medium text-slate-700 mb-1">
                Project Deadline
              </label>
              <input
                id="project-date"
                type="date"
                value={form.in_hands_date}
                onChange={(e) => setForm(prev => ({ ...prev, in_hands_date: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Budget + Critical row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="project-budget" className="block text-sm font-medium text-slate-700 mb-1">
                Budget ($)
              </label>
              <input
                id="project-budget"
                type="number" onFocus={(e) => e.target.select()}
                min="0"
                step="100"
                value={form.budget}
                onChange={(e) => setForm(prev => ({ ...prev, budget: e.target.value }))}
                placeholder="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_critical}
                  onChange={(e) => setForm(prev => ({ ...prev, is_critical: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Critical Project
                </span>
              </label>
            </div>
          </div>

          {/* Internal Notes */}
          <div>
            <label htmlFor="project-notes" className="block text-sm font-medium text-slate-700 mb-1">
              Internal Notes
            </label>
            <textarea
              id="project-notes"
              rows={3}
              value={form.internal_notes}
              onChange={(e) => setForm(prev => ({ ...prev, internal_notes: e.target.value }))}
              placeholder="Any internal notes about this project..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
          </div>
        </div>
      </Modal>

      {/* Project Detail Slide Panel */}
      <SlidePanel
        isOpen={!!selectedProjectId}
        onClose={() => { setSelectedProjectId(null); setSelectedLineItem(null) }}
        title={selectedProject?.name}
        subtitle={selectedProject ? `${selectedProject.project_number} \u2022 ${selectedProject.client_name}` : undefined}
        width="xl"
        headerActions={
          selectedProject ? (
            <>
              <button
                onClick={handleCopyPortalLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                {copiedPortalLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedPortalLink ? 'Copied!' : 'Copy Portal Link'}
              </button>
              <button
                onClick={handleSendToClient}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Send to Client
              </button>
            </>
          ) : undefined
        }
      >
        {selectedProject && (
          <ProjectDetailPanel
            project={selectedProject}
            onClose={() => setSelectedProjectId(null)}
            onSelectProduct={(item) => setSelectedLineItem(item)}
            onSelectCreativeRequest={(requestId) => setSelectedCreativeRequestId(requestId)}
            onStatusChange={handleStatusChange}
          />
        )}
      </SlidePanel>

      {/* Product Detail Nested Panel */}
      {selectedLineItem && selectedProject && (
        <ProductDetailPanel
          lineItem={selectedLineItem}
          project={selectedProject}
          onSave={handleSaveProduct}
          onClose={() => setSelectedLineItem(null)}
        />
      )}

      {/* Creative Request Detail Panel */}
      {selectedCreativeRequest && selectedProject && (
        <CreativeRequestDetailPanel
          request={selectedCreativeRequest}
          project={selectedProject}
          onClose={() => setSelectedCreativeRequestId(null)}
        />
      )}

      {/* Template Gallery Modal */}
      <TemplateGalleryModal
        isOpen={showTemplateGallery}
        onClose={() => setShowTemplateGallery(false)}
        onSelect={handleTemplateSelect}
      />
    </div>
  )
}
