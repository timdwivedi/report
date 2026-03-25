"use client"

import Modal from '@/components/shared/Modal'
import { getDemoProjectTemplates } from '@/lib/demo/demo-data-provider'
import type { ProjectTemplate, TemplateCategory } from '@/lib/types/app'
import { Briefcase, Calendar, Gift, Users, Layers } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// ===== PROPS =====

interface TemplateGalleryModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (template: ProjectTemplate) => void
}

// ===== CATEGORY CONFIG =====

const CATEGORY_ICONS: Record<TemplateCategory, LucideIcon> = {
  corporate: Briefcase,
  event: Calendar,
  employee: Users,
  holiday: Gift,
  custom: Layers,
}

const CATEGORY_STYLES: Record<TemplateCategory, { bg: string; text: string; icon: string }> = {
  corporate: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-500' },
  event: { bg: 'bg-purple-50', text: 'text-purple-700', icon: 'text-purple-500' },
  employee: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'text-emerald-500' },
  holiday: { bg: 'bg-red-50', text: 'text-red-700', icon: 'text-red-500' },
  custom: { bg: 'bg-slate-50', text: 'text-slate-700', icon: 'text-slate-500' },
}

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  corporate: 'Corporate',
  event: 'Event',
  employee: 'Employee',
  holiday: 'Holiday',
  custom: 'Custom',
}

// ===== COMPONENT =====

export default function TemplateGalleryModal({ isOpen, onClose, onSelect }: TemplateGalleryModalProps) {
  const templates = getDemoProjectTemplates()

  function handleSelect(template: ProjectTemplate) {
    onSelect(template)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Project Templates"
      size="lg"
      footer={
        <div className="flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        {templates.map((template) => {
          const Icon = CATEGORY_ICONS[template.category]
          const style = CATEGORY_STYLES[template.category]
          const label = CATEGORY_LABELS[template.category]

          return (
            <button
              key={template.id}
              onClick={() => handleSelect(template)}
              className="flex flex-col items-start gap-3 p-4 rounded-xl border border-slate-200 bg-white text-left hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group"
            >
              {/* Icon + Category */}
              <div className="flex items-center justify-between w-full">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${style.bg}`}>
                  <Icon className={`w-4.5 h-4.5 ${style.icon}`} />
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                  {label}
                </span>
              </div>

              {/* Name + Description */}
              <div>
                <p className="font-semibold text-sm text-slate-900 group-hover:text-primary-700 transition-colors">
                  {template.name}
                </p>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                  {template.description}
                </p>
              </div>

              {/* Line item count badge */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {template.line_items.length} {template.line_items.length === 1 ? 'item' : 'items'}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </Modal>
  )
}
