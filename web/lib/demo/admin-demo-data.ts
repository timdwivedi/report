/**
 * Admin Demo Data Provider
 *
 * Multi-org demo data for the super admin panel.
 * 3 orgs: 85 Supply (primary), Nashville Promo Co, Southern Merch Group
 */

import type {
  AdminOrganization,
  PlatformUser,
  PlatformStats,
  OrgHealthMetric,
  Project,
  Order,
  TeamMember,
  ProjectStatus,
  OrderStatus,
} from '@/lib/types/app'

// ===== ORGANIZATIONS =====

const DEMO_ADMIN_ORGS: AdminOrganization[] = [
  {
    id: 'org-85-supply',
    name: '85 Supply',
    slug: '85-supply',
    primary_color: '#2563eb',
    default_margin_percent: 35,
    margin_safety_percent: 20,
    currency: 'USD',
    salesforce_enabled: true,
    payment_terms_default: 'net30',
    created_at: '2025-06-15T00:00:00Z',
    updated_at: '2026-02-20T14:30:00Z',
    // Admin extensions
    owner_name: 'Trevor Mitchell',
    owner_email: 'trevor@85supply.com',
    member_count: 5,
    project_count: 15,
    order_count: 25,
    total_revenue: 287450,
    last_activity: '2026-02-20T14:30:00Z',
    health_status: 'active',
  },
  {
    id: 'org-nashville-promo',
    name: 'Nashville Promo Co',
    slug: 'nashville-promo',
    primary_color: '#dc2626',
    default_margin_percent: 40,
    margin_safety_percent: 25,
    currency: 'USD',
    salesforce_enabled: false,
    payment_terms_default: 'net30',
    created_at: '2025-09-01T00:00:00Z',
    updated_at: '2026-02-19T10:15:00Z',
    owner_name: 'Sarah Chen',
    owner_email: 'sarah@nashvillepromo.com',
    member_count: 3,
    project_count: 5,
    order_count: 5,
    total_revenue: 124800,
    last_activity: '2026-02-19T10:15:00Z',
    health_status: 'active',
  },
  {
    id: 'org-southern-merch',
    name: 'Southern Merch Group',
    slug: 'southern-merch',
    primary_color: '#059669',
    default_margin_percent: 30,
    margin_safety_percent: 18,
    currency: 'USD',
    salesforce_enabled: false,
    payment_terms_default: 'net45',
    created_at: '2025-11-10T00:00:00Z',
    updated_at: '2026-01-28T08:00:00Z',
    owner_name: 'Jake Dawson',
    owner_email: 'jake@southernmerch.com',
    member_count: 2,
    project_count: 2,
    order_count: 2,
    total_revenue: 65750,
    last_activity: '2026-01-28T08:00:00Z',
    health_status: 'moderate',
  },
]

// ===== PLATFORM STATS =====

const DEMO_PLATFORM_STATS: PlatformStats = {
  total_orgs: 3,
  total_projects: 22,
  total_orders: 32,
  total_revenue: 478000,
  avg_deal_size: 21727,
  active_orgs: 2,
  stale_orgs: 0,
  total_users: 10,
}

// ===== PLATFORM USERS =====

const DEMO_ADMIN_USERS: PlatformUser[] = [
  {
    id: 'user-trevor',
    user_id: 'auth-trevor-001',
    email: 'trevor@85supply.com',
    display_name: 'Trevor Mitchell',
    role: 'super_admin',
    org_memberships: [
      { org_id: 'org-85-supply', org_name: '85 Supply', org_slug: '85-supply', role: 'owner' },
    ],
    last_login: '2026-02-22T09:00:00Z',
    created_at: '2025-06-15T00:00:00Z',
  },
  {
    id: 'user-ashley',
    user_id: 'auth-ashley-002',
    email: 'ashley@85supply.com',
    display_name: 'Ashley Rodriguez',
    role: 'admin',
    org_memberships: [
      { org_id: 'org-85-supply', org_name: '85 Supply', org_slug: '85-supply', role: 'admin' },
    ],
    last_login: '2026-02-21T16:45:00Z',
    created_at: '2025-07-01T00:00:00Z',
  },
  {
    id: 'user-marcus',
    user_id: 'auth-marcus-003',
    email: 'marcus@85supply.com',
    display_name: 'Marcus Johnson',
    role: 'sales',
    org_memberships: [
      { org_id: 'org-85-supply', org_name: '85 Supply', org_slug: '85-supply', role: 'sales' },
    ],
    last_login: '2026-02-20T11:30:00Z',
    created_at: '2025-08-15T00:00:00Z',
  },
  {
    id: 'user-rachel',
    user_id: 'auth-rachel-004',
    email: 'rachel@85supply.com',
    display_name: 'Rachel Kim',
    role: 'production',
    org_memberships: [
      { org_id: 'org-85-supply', org_name: '85 Supply', org_slug: '85-supply', role: 'production' },
    ],
    last_login: '2026-02-19T14:00:00Z',
    created_at: '2025-09-01T00:00:00Z',
  },
  {
    id: 'user-devon',
    user_id: 'auth-devon-005',
    email: 'devon@85supply.com',
    display_name: 'Devon Park',
    role: 'viewer',
    org_memberships: [
      { org_id: 'org-85-supply', org_name: '85 Supply', org_slug: '85-supply', role: 'viewer' },
    ],
    last_login: '2026-02-18T09:00:00Z',
    created_at: '2025-10-01T00:00:00Z',
  },
  // Nashville Promo Co team
  {
    id: 'user-sarah',
    user_id: 'auth-sarah-006',
    email: 'sarah@nashvillepromo.com',
    display_name: 'Sarah Chen',
    role: 'owner',
    org_memberships: [
      { org_id: 'org-nashville-promo', org_name: 'Nashville Promo Co', org_slug: 'nashville-promo', role: 'owner' },
    ],
    last_login: '2026-02-19T10:15:00Z',
    created_at: '2025-09-01T00:00:00Z',
  },
  {
    id: 'user-mike',
    user_id: 'auth-mike-007',
    email: 'mike@nashvillepromo.com',
    display_name: 'Mike Torres',
    role: 'sales',
    org_memberships: [
      { org_id: 'org-nashville-promo', org_name: 'Nashville Promo Co', org_slug: 'nashville-promo', role: 'sales' },
    ],
    last_login: '2026-02-18T15:30:00Z',
    created_at: '2025-10-15T00:00:00Z',
  },
  {
    id: 'user-lisa',
    user_id: 'auth-lisa-008',
    email: 'lisa@nashvillepromo.com',
    display_name: 'Lisa Wang',
    role: 'production',
    org_memberships: [
      { org_id: 'org-nashville-promo', org_name: 'Nashville Promo Co', org_slug: 'nashville-promo', role: 'production' },
    ],
    last_login: '2026-02-17T12:00:00Z',
    created_at: '2025-11-01T00:00:00Z',
  },
  // Southern Merch Group team
  {
    id: 'user-jake',
    user_id: 'auth-jake-009',
    email: 'jake@southernmerch.com',
    display_name: 'Jake Dawson',
    role: 'owner',
    org_memberships: [
      { org_id: 'org-southern-merch', org_name: 'Southern Merch Group', org_slug: 'southern-merch', role: 'owner' },
    ],
    last_login: '2026-01-28T08:00:00Z',
    created_at: '2025-11-10T00:00:00Z',
  },
  {
    id: 'user-emma',
    user_id: 'auth-emma-010',
    email: 'emma@southernmerch.com',
    display_name: 'Emma Phillips',
    role: 'sales',
    org_memberships: [
      { org_id: 'org-southern-merch', org_name: 'Southern Merch Group', org_slug: 'southern-merch', role: 'sales' },
    ],
    last_login: '2026-01-25T16:00:00Z',
    created_at: '2025-12-01T00:00:00Z',
  },
]

// ===== ORG HEALTH METRICS =====

const DEMO_ORG_HEALTH: OrgHealthMetric[] = [
  {
    org_id: 'org-85-supply',
    org_name: '85 Supply',
    org_slug: '85-supply',
    projects_last_30d: 6,
    orders_last_30d: 8,
    revenue_last_30d: 67200,
    last_activity_date: '2026-02-20T14:30:00Z',
    health_status: 'active',
  },
  {
    org_id: 'org-nashville-promo',
    org_name: 'Nashville Promo Co',
    org_slug: 'nashville-promo',
    projects_last_30d: 3,
    orders_last_30d: 2,
    revenue_last_30d: 28400,
    last_activity_date: '2026-02-19T10:15:00Z',
    health_status: 'active',
  },
  {
    org_id: 'org-southern-merch',
    org_name: 'Southern Merch Group',
    org_slug: 'southern-merch',
    projects_last_30d: 0,
    orders_last_30d: 1,
    revenue_last_30d: 4500,
    last_activity_date: '2026-01-28T08:00:00Z',
    health_status: 'moderate',
  },
]

// ===== PER-ORG PROJECTS (for orgs 2 & 3) =====

const NASHVILLE_PROJECTS: Project[] = [
  {
    id: 'np-proj-001',
    org_id: 'org-nashville-promo',
    client_id: 'np-client-001',
    client_name: 'Hattie B\'s Hot Chicken',
    project_number: 'PRJ-2026-0001',
    name: 'Staff Uniforms Q1 2026',
    status: 'confirmed' as ProjectStatus,
    source: 'direct',
    in_hands_date: '2026-03-15',
    budget: 18000,
    is_critical: false,
    estimated_total: 16500,
    line_items: [],
    created_at: '2026-01-10T00:00:00Z',
    updated_at: '2026-02-15T00:00:00Z',
  },
  {
    id: 'np-proj-002',
    org_id: 'org-nashville-promo',
    client_id: 'np-client-002',
    client_name: 'Marathon Music Works',
    project_number: 'PRJ-2026-0002',
    name: 'Concert Series Merch',
    status: 'in-design' as ProjectStatus,
    source: 'referral',
    in_hands_date: '2026-04-01',
    budget: 35000,
    is_critical: true,
    estimated_total: 32000,
    line_items: [],
    created_at: '2026-01-20T00:00:00Z',
    updated_at: '2026-02-19T00:00:00Z',
  },
  {
    id: 'np-proj-003',
    org_id: 'org-nashville-promo',
    client_id: 'np-client-003',
    client_name: 'Puckett\'s Grocery',
    project_number: 'PRJ-2026-0003',
    name: 'New Location Opening Swag',
    status: 'client-review' as ProjectStatus,
    source: 'direct',
    in_hands_date: '2026-05-01',
    budget: 12000,
    is_critical: false,
    estimated_total: 10800,
    line_items: [],
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-02-18T00:00:00Z',
  },
  {
    id: 'np-proj-004',
    org_id: 'org-nashville-promo',
    client_id: 'np-client-001',
    client_name: 'Hattie B\'s Hot Chicken',
    project_number: 'PRJ-2026-0004',
    name: 'Summer Festival Tees',
    status: 'opportunity' as ProjectStatus,
    source: 'direct',
    budget: 22000,
    is_critical: false,
    estimated_total: 22000,
    line_items: [],
    created_at: '2026-02-10T00:00:00Z',
    updated_at: '2026-02-10T00:00:00Z',
  },
  {
    id: 'np-proj-005',
    org_id: 'org-nashville-promo',
    client_id: 'np-client-002',
    client_name: 'Marathon Music Works',
    project_number: 'PRJ-2026-0005',
    name: 'VIP Merch Packs',
    status: 'curating' as ProjectStatus,
    source: 'referral',
    in_hands_date: '2026-06-15',
    budget: 45000,
    is_critical: false,
    estimated_total: 43500,
    line_items: [],
    created_at: '2026-02-15T00:00:00Z',
    updated_at: '2026-02-19T00:00:00Z',
  },
]

const SOUTHERN_PROJECTS: Project[] = [
  {
    id: 'sm-proj-001',
    org_id: 'org-southern-merch',
    client_id: 'sm-client-001',
    client_name: 'Memphis BBQ Co',
    project_number: 'PRJ-2026-0001',
    name: 'Restaurant Staff Polos',
    status: 'shipped' as ProjectStatus,
    source: 'direct',
    in_hands_date: '2026-01-20',
    budget: 8500,
    is_critical: false,
    estimated_total: 8250,
    line_items: [],
    created_at: '2025-12-15T00:00:00Z',
    updated_at: '2026-01-22T00:00:00Z',
  },
  {
    id: 'sm-proj-002',
    org_id: 'org-southern-merch',
    client_id: 'sm-client-002',
    client_name: 'Birmingham Brewing',
    project_number: 'PRJ-2026-0002',
    name: 'Taproom Merch Line',
    status: 'qualifying' as ProjectStatus,
    source: 'website',
    budget: 15000,
    is_critical: false,
    estimated_total: 15000,
    line_items: [],
    created_at: '2026-01-28T00:00:00Z',
    updated_at: '2026-01-28T00:00:00Z',
  },
]

// ===== PER-ORG ORDERS =====

const DEFAULT_ADDRESS = { street: '123 Main St', city: 'Nashville', state: 'TN', zip: '37203', country: 'USA' }

const NASHVILLE_ORDERS: Order[] = [
  {
    id: 'np-ord-001', org_id: 'org-nashville-promo', project_id: 'np-proj-001', project_name: 'Staff Uniforms Q1 2026',
    line_item_id: 'np-li-001', order_number: 'ORD-2026-0001', status: 'in-production' as OrderStatus,
    product_name: 'Custom Polo - Black', quantity: 200, unit_price: 28.50, total: 5700,
    in_hands_date: '2026-03-15', ship_to: DEFAULT_ADDRESS, payment_received: false,
    created_at: '2026-02-01T00:00:00Z', updated_at: '2026-02-15T00:00:00Z',
  },
  {
    id: 'np-ord-002', org_id: 'org-nashville-promo', project_id: 'np-proj-001', project_name: 'Staff Uniforms Q1 2026',
    line_item_id: 'np-li-002', order_number: 'ORD-2026-0002', status: 'in-production' as OrderStatus,
    product_name: 'Custom Apron - Red', quantity: 150, unit_price: 24.00, total: 3600,
    in_hands_date: '2026-03-15', ship_to: DEFAULT_ADDRESS, payment_received: false,
    created_at: '2026-02-01T00:00:00Z', updated_at: '2026-02-12T00:00:00Z',
  },
  {
    id: 'np-ord-003', org_id: 'org-nashville-promo', project_id: 'np-proj-002', project_name: 'Concert Series Merch',
    line_item_id: 'np-li-003', order_number: 'ORD-2026-0003', status: 'order-entry-needed' as OrderStatus,
    product_name: 'Premium Tee - Festival Design', quantity: 500, unit_price: 18.75, total: 9375,
    in_hands_date: '2026-04-01', ship_to: DEFAULT_ADDRESS, payment_received: false,
    created_at: '2026-02-10T00:00:00Z', updated_at: '2026-02-10T00:00:00Z',
  },
  {
    id: 'np-ord-004', org_id: 'org-nashville-promo', project_id: 'np-proj-002', project_name: 'Concert Series Merch',
    line_item_id: 'np-li-004', order_number: 'ORD-2026-0004', status: 'order-entry-needed' as OrderStatus,
    product_name: 'Hoodie - Tour Edition', quantity: 200, unit_price: 42.00, total: 8400,
    in_hands_date: '2026-04-01', ship_to: DEFAULT_ADDRESS, payment_received: false,
    created_at: '2026-02-10T00:00:00Z', updated_at: '2026-02-10T00:00:00Z',
  },
  {
    id: 'np-ord-005', org_id: 'org-nashville-promo', project_id: 'np-proj-003', project_name: 'New Location Opening Swag',
    line_item_id: 'np-li-005', order_number: 'ORD-2026-0005', status: 'shipped' as OrderStatus,
    product_name: 'Tote Bag - Canvas', quantity: 300, unit_price: 12.50, total: 3750,
    in_hands_date: '2026-05-01', ship_to: DEFAULT_ADDRESS, tracking_number: 'FDX-9988776655', carrier: 'FedEx',
    payment_received: false, created_at: '2026-02-05T00:00:00Z', updated_at: '2026-02-18T00:00:00Z',
  },
]

const SOUTHERN_ORDERS: Order[] = [
  {
    id: 'sm-ord-001', org_id: 'org-southern-merch', project_id: 'sm-proj-001', project_name: 'Restaurant Staff Polos',
    line_item_id: 'sm-li-001', order_number: 'ORD-2026-0001', status: 'invoiced' as OrderStatus,
    product_name: 'Embroidered Polo - Navy', quantity: 100, unit_price: 32.00, total: 3200,
    in_hands_date: '2026-01-20', ship_to: DEFAULT_ADDRESS, tracking_number: 'UPS-112233445566', carrier: 'UPS',
    invoice_amount: 3200, payment_received: true, created_at: '2025-12-20T00:00:00Z', updated_at: '2026-01-22T00:00:00Z',
  },
  {
    id: 'sm-ord-002', org_id: 'org-southern-merch', project_id: 'sm-proj-001', project_name: 'Restaurant Staff Polos',
    line_item_id: 'sm-li-002', order_number: 'ORD-2026-0002', status: 'shipped' as OrderStatus,
    product_name: 'Embroidered Cap - Navy', quantity: 75, unit_price: 18.50, total: 1387.50,
    in_hands_date: '2026-01-20', ship_to: DEFAULT_ADDRESS, tracking_number: 'UPS-998877665544', carrier: 'UPS',
    payment_received: false, created_at: '2025-12-20T00:00:00Z', updated_at: '2026-01-18T00:00:00Z',
  },
]

// ===== PER-ORG TEAM MEMBERS =====

const NASHVILLE_TEAM: TeamMember[] = [
  {
    id: 'np-team-001', org_id: 'org-nashville-promo', user_id: 'auth-sarah-006',
    name: 'Sarah Chen', email: 'sarah@nashvillepromo.com', role: 'owner',
    avatar_initials: 'SC', is_active: true, projects_assigned: 5, deals_closed: 3,
    created_at: '2025-09-01T00:00:00Z',
  },
  {
    id: 'np-team-002', org_id: 'org-nashville-promo', user_id: 'auth-mike-007',
    name: 'Mike Torres', email: 'mike@nashvillepromo.com', role: 'sales',
    avatar_initials: 'MT', is_active: true, projects_assigned: 3, deals_closed: 1,
    created_at: '2025-10-15T00:00:00Z',
  },
  {
    id: 'np-team-003', org_id: 'org-nashville-promo', user_id: 'auth-lisa-008',
    name: 'Lisa Wang', email: 'lisa@nashvillepromo.com', role: 'production',
    avatar_initials: 'LW', is_active: true, projects_assigned: 4, deals_closed: 0,
    created_at: '2025-11-01T00:00:00Z',
  },
]

const SOUTHERN_TEAM: TeamMember[] = [
  {
    id: 'sm-team-001', org_id: 'org-southern-merch', user_id: 'auth-jake-009',
    name: 'Jake Dawson', email: 'jake@southernmerch.com', role: 'owner',
    avatar_initials: 'JD', is_active: true, projects_assigned: 2, deals_closed: 1,
    created_at: '2025-11-10T00:00:00Z',
  },
  {
    id: 'sm-team-002', org_id: 'org-southern-merch', user_id: 'auth-emma-010',
    name: 'Emma Phillips', email: 'emma@southernmerch.com', role: 'sales',
    avatar_initials: 'EP', is_active: true, projects_assigned: 1, deals_closed: 0,
    created_at: '2025-12-01T00:00:00Z',
  },
]

// ===== RECENT ACTIVITY (Platform-wide) =====

export interface AdminActivity {
  id: string
  org_name: string
  org_id: string
  action: string
  timestamp: string
  icon: 'project' | 'order' | 'team' | 'payment' | 'settings'
}

const DEMO_ADMIN_ACTIVITY: AdminActivity[] = [
  { id: 'act-01', org_name: '85 Supply', org_id: 'org-85-supply', action: 'New project "Progressive Insurance Q2 Polos" created', timestamp: '2026-02-20T14:30:00Z', icon: 'project' },
  { id: 'act-02', org_name: 'Nashville Promo Co', org_id: 'org-nashville-promo', action: 'Order ORD-2026-0005 shipped via FedEx', timestamp: '2026-02-19T10:15:00Z', icon: 'order' },
  { id: 'act-03', org_name: '85 Supply', org_id: 'org-85-supply', action: 'Invoice generated for Raisin Canes order', timestamp: '2026-02-18T16:00:00Z', icon: 'payment' },
  { id: 'act-04', org_name: 'Nashville Promo Co', org_id: 'org-nashville-promo', action: 'Lisa Wang added as Production team member', timestamp: '2026-02-17T12:00:00Z', icon: 'team' },
  { id: 'act-05', org_name: '85 Supply', org_id: 'org-85-supply', action: 'Project "Nashville Sounds 2026 Season" moved to Confirmed', timestamp: '2026-02-16T09:30:00Z', icon: 'project' },
  { id: 'act-06', org_name: 'Southern Merch Group', org_id: 'org-southern-merch', action: 'Order ORD-2026-0001 invoiced for $3,200', timestamp: '2026-01-28T08:00:00Z', icon: 'payment' },
  { id: 'act-07', org_name: '85 Supply', org_id: 'org-85-supply', action: 'Decorator matrix "Screen Print Standard" updated', timestamp: '2026-02-15T11:00:00Z', icon: 'settings' },
  { id: 'act-08', org_name: 'Nashville Promo Co', org_id: 'org-nashville-promo', action: 'New project "VIP Merch Packs" created', timestamp: '2026-02-15T08:00:00Z', icon: 'project' },
]

// ===== EXPORTED GETTERS =====

export function getDemoAdminOrgs(): AdminOrganization[] {
  return DEMO_ADMIN_ORGS
}

export function getDemoAdminStats(): PlatformStats {
  return DEMO_PLATFORM_STATS
}

export function getDemoAdminUsers(): PlatformUser[] {
  return DEMO_ADMIN_USERS
}

export function getDemoOrgHealth(): OrgHealthMetric[] {
  return DEMO_ORG_HEALTH
}

export function getDemoAdminActivity(): AdminActivity[] {
  return DEMO_ADMIN_ACTIVITY
}

export function getDemoOrgProjects(orgId: string): Project[] {
  switch (orgId) {
    case 'org-nashville-promo': return NASHVILLE_PROJECTS
    case 'org-southern-merch': return SOUTHERN_PROJECTS
    default: return [] // 85 Supply uses main demo-data-provider
  }
}

export function getDemoOrgOrders(orgId: string): Order[] {
  switch (orgId) {
    case 'org-nashville-promo': return NASHVILLE_ORDERS
    case 'org-southern-merch': return SOUTHERN_ORDERS
    default: return []
  }
}

export function getDemoOrgTeam(orgId: string): TeamMember[] {
  switch (orgId) {
    case 'org-nashville-promo': return NASHVILLE_TEAM
    case 'org-southern-merch': return SOUTHERN_TEAM
    default: return []
  }
}
