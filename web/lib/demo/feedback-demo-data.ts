/**
 * Feedback Demo Data Provider
 *
 * Demo data for the admin Feedback management page.
 * 14 items across 3 dates with varying pipeline statuses.
 */

import type {
  FeedbackItem,
  FeedbackExportMeta,
  FeedbackCategory,
  FeedbackPriority,
} from '@/lib/types/app'

// ===== FEEDBACK ITEMS =====

const DEMO_FEEDBACK_ITEMS: FeedbackItem[] = [
  // ── Feb 20, 2026 — Processed (Round 1) ──────────────
  {
    id: 'fb-001',
    page_path: '/dashboard',
    section_label: 'Pipeline Overview',
    category: 'data' as FeedbackCategory,
    priority: 'high' as FeedbackPriority,
    message: 'The pipeline value on the dashboard feels off — we closed two deals last week but it still shows $0',
    created_at: '2026-02-20T09:15:00Z',
    created_by: 'Trevor Mitchell',
    status: 'resolved',
    sent_at: '2026-02-21T09:00:00Z',
    processed_round: 1,
  },
  {
    id: 'fb-002',
    page_path: '/dashboard/projects',
    section_label: 'Project List',
    category: 'feature' as FeedbackCategory,
    priority: 'medium' as FeedbackPriority,
    message: 'Can we add a bulk order feature for the uniform program?',
    created_at: '2026-02-20T10:30:00Z',
    created_by: 'Ashley Rodriguez',
    status: 'resolved',
    sent_at: '2026-02-21T09:00:00Z',
    processed_round: 1,
  },
  {
    id: 'fb-003',
    page_path: '/dashboard/vendors',
    section_label: 'Vendor Directory',
    category: 'feature' as FeedbackCategory,
    priority: 'medium' as FeedbackPriority,
    message: 'The vendor page needs a way to compare pricing across vendors',
    created_at: '2026-02-20T11:45:00Z',
    created_by: 'Marcus Johnson',
    status: 'resolved',
    sent_at: '2026-02-21T09:00:00Z',
    processed_round: 1,
  },
  {
    id: 'fb-004',
    page_path: '/dashboard/projects/[id]',
    section_label: 'Project Detail — Files',
    category: 'workflow' as FeedbackCategory,
    priority: 'high' as FeedbackPriority,
    message: 'When I click on a project, I want to see all the artwork files in one place',
    created_at: '2026-02-20T14:20:00Z',
    created_by: 'Rachel Kim',
    status: 'resolved',
    sent_at: '2026-02-21T09:00:00Z',
    processed_round: 1,
  },

  // ── Feb 22, 2026 — Sent (not yet processed) ─────────
  {
    id: 'fb-005',
    page_path: '/dashboard/commissions',
    section_label: 'Commission Tracker',
    category: 'ui' as FeedbackCategory,
    priority: 'high' as FeedbackPriority,
    message: 'The commission tracking is confusing — I need to see what I\'m owed per project',
    created_at: '2026-02-22T08:00:00Z',
    created_by: 'Marcus Johnson',
    status: 'acknowledged',
    sent_at: '2026-02-23T10:30:00Z',
  },
  {
    id: 'fb-006',
    page_path: '/dashboard/analytics',
    section_label: 'Revenue Chart',
    category: 'feature' as FeedbackCategory,
    priority: 'low' as FeedbackPriority,
    message: 'Love the analytics page but wish I could filter by date range',
    created_at: '2026-02-22T09:30:00Z',
    created_by: 'Trevor Mitchell',
    status: 'acknowledged',
    sent_at: '2026-02-23T10:30:00Z',
  },
  {
    id: 'fb-007',
    page_path: '/dashboard/orders',
    section_label: 'Order Status',
    category: 'workflow' as FeedbackCategory,
    priority: 'medium' as FeedbackPriority,
    message: 'Order status updates should send me an email notification',
    created_at: '2026-02-22T11:15:00Z',
    created_by: 'Ashley Rodriguez',
    status: 'acknowledged',
    sent_at: '2026-02-23T10:30:00Z',
  },
  {
    id: 'fb-008',
    page_path: '/portal/[shareableLink]',
    section_label: 'Client Portal',
    category: 'feature' as FeedbackCategory,
    priority: 'low' as FeedbackPriority,
    message: 'The client portal is amazing but my client asked about a Spanish language option',
    created_at: '2026-02-22T15:00:00Z',
    created_by: 'Rachel Kim',
    status: 'acknowledged',
    sent_at: '2026-02-23T10:30:00Z',
  },

  // ── Feb 24, 2026 — New (unprocessed) ────────────────
  {
    id: 'fb-009',
    page_path: '/dashboard/settings',
    section_label: 'Product Catalog',
    category: 'ui' as FeedbackCategory,
    priority: 'high' as FeedbackPriority,
    message: 'Product catalog needs a search/filter — too many products to scroll through',
    created_at: '2026-02-24T08:00:00Z',
    created_by: 'Trevor Mitchell',
    status: 'new',
  },
  {
    id: 'fb-010',
    page_path: '/dashboard/projects/[id]',
    section_label: 'Quote Builder',
    category: 'workflow' as FeedbackCategory,
    priority: 'critical' as FeedbackPriority,
    message: 'We need a way to create purchase orders directly from the quote',
    created_at: '2026-02-24T08:45:00Z',
    created_by: 'Ashley Rodriguez',
    status: 'new',
  },
  {
    id: 'fb-011',
    page_path: '/dashboard',
    section_label: 'Dashboard Overview Cards',
    category: 'ui' as FeedbackCategory,
    priority: 'low' as FeedbackPriority,
    message: 'The dashboard overview cards are great but I want to customize which ones show',
    created_at: '2026-02-24T09:30:00Z',
    created_by: 'Marcus Johnson',
    status: 'new',
  },
  {
    id: 'fb-012',
    page_path: '/dashboard/vendors',
    section_label: 'Vendor List',
    category: 'feature' as FeedbackCategory,
    priority: 'medium' as FeedbackPriority,
    message: 'Vendor scorecard would be helpful — track on-time delivery and quality',
    created_at: '2026-02-24T10:15:00Z',
    created_by: 'Rachel Kim',
    status: 'new',
  },
  {
    id: 'fb-013',
    page_path: '/dashboard/projects',
    section_label: 'Project List',
    category: 'workflow' as FeedbackCategory,
    priority: 'medium' as FeedbackPriority,
    message: 'Need a way to archive old projects without deleting them',
    created_at: '2026-02-24T11:00:00Z',
    created_by: 'Devon Park',
    status: 'new',
  },
  {
    id: 'fb-014',
    page_path: '/dashboard/settings',
    section_label: 'Decorator Matrices',
    category: 'data' as FeedbackCategory,
    priority: 'high' as FeedbackPriority,
    message: 'The settings page needs our custom decoration pricing tiers',
    created_at: '2026-02-24T13:30:00Z',
    created_by: 'Trevor Mitchell',
    status: 'new',
  },
]

// ===== EXPORT HISTORY =====

const DEMO_EXPORT_HISTORY: FeedbackExportMeta[] = [
  {
    filename: 'feedback-2026-02-20.md',
    date: '2026-02-20',
    item_count: 4,
    sent_at: '2026-02-21T09:00:00Z',
    processed_round: 1,
  },
  {
    filename: 'feedback-2026-02-22.md',
    date: '2026-02-22',
    item_count: 4,
    sent_at: '2026-02-23T10:30:00Z',
  },
]

// ===== EXPORTED GETTERS =====

export function getDemoFeedbackItems(): FeedbackItem[] {
  return DEMO_FEEDBACK_ITEMS
}

export function getDemoFeedbackExportHistory(): FeedbackExportMeta[] {
  return DEMO_EXPORT_HISTORY
}

export function getDemoFeedbackStats() {
  return { total: 14, unprocessed: 6, sent: 4, processed: 4 }
}
