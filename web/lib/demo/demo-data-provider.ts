import type {
  Client,
  Project,
  Order,
  Program,
  CommissionRecord,
  DecoratorMatrix,
  StatCardData,
  RecentActivity,
  QuickAction,
  Product,
  CalculatorInputs,
  CalculatorResults,
  ProjectStatus,
  OrderStatus,
  ProgramStatus,
  CommissionStatus,
  DashboardStats,
  PipelineStageValue,
  RevenueDataPoint,
  TopClient,
  DecoratorMatrixDisplay,
  ProductDisplay,
  ProjectLineItem,
  Vendor,
  Ticket,
  AddressBook,
  CreativeRequest,
  CreativeRequestVersion,
  EditRequest,
  ProjectFile,
  ScrapedProductData,
  Shipment,
  SplitShipmentDestination,
  PriceCode,
} from '@/lib/types/app';

// ===== DEMO MODE CHECK =====

export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false;

  // Check URL param first
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('demo') === 'true') return true;

  // Check env var
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
}

// ===== LABEL MAPS & STYLE MAPS (for use in pages) =====

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  'opportunity': 'Opportunity',
  'qualifying': 'Qualifying',
  'curating': 'Curating',
  'in-design': 'In Design',
  'presenting': 'Presenting',
  'client-review': 'Client Review',
  'confirmed': 'Confirmed',
  'order-entry': 'Order Entry',
  'in-production': 'In Production',
  'shipped': 'Shipped',
  'cancelled': 'Cancelled',
};

export const PROJECT_STATUS_STYLES: Record<ProjectStatus, { bg: string; text: string }> = {
  'opportunity': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'qualifying': { bg: 'bg-sky-100', text: 'text-sky-700' },
  'curating': { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  'in-design': { bg: 'bg-violet-100', text: 'text-violet-700' },
  'presenting': { bg: 'bg-pink-100', text: 'text-pink-700' },
  'client-review': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'confirmed': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'order-entry': { bg: 'bg-red-100', text: 'text-red-700' },
  'in-production': { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  'shipped': { bg: 'bg-green-100', text: 'text-green-700' },
  'cancelled': { bg: 'bg-gray-100', text: 'text-gray-500' },
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  'order-entry-needed': 'Order Entry Needed',
  'in-production': 'In Production',
  'partially-shipped': 'Partially Shipped',
  'shipped': 'Shipped',
  'ready-for-invoicing': 'Ready for Invoicing',
  'invoiced': 'Invoiced',
  'cancelled': 'Cancelled',
};

export const ORDER_STATUS_STYLES: Record<OrderStatus, { bg: string; text: string }> = {
  'order-entry-needed': { bg: 'bg-red-100', text: 'text-red-700' },
  'in-production': { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  'partially-shipped': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'shipped': { bg: 'bg-green-100', text: 'text-green-700' },
  'ready-for-invoicing': { bg: 'bg-lime-100', text: 'text-lime-700' },
  'invoiced': { bg: 'bg-slate-100', text: 'text-slate-600' },
  'cancelled': { bg: 'bg-gray-100', text: 'text-gray-500' },
};

export const PROGRAM_STATUS_STYLES: Record<ProgramStatus, { bg: string; text: string }> = {
  'active': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'paused': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'completed': { bg: 'bg-slate-100', text: 'text-slate-600' },
};

export const COMMISSION_STATUS_STYLES: Record<CommissionStatus, { bg: string; text: string }> = {
  'pending': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  'confirmed': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'paid': { bg: 'bg-green-100', text: 'text-green-700' },
};

// ===== DEMO CLIENTS =====

export type DemoClient = Client;

const DEMO_CLIENTS: DemoClient[] = [
  {
    id: '1',
    org_id: 'demo-org',
    company_name: 'Raisin Canes',
    industry: 'Restaurant/QSR',
    billing_address: { street: '3520 General De Gaulle Dr', city: 'New Orleans', state: 'LA', zip: '70114', country: 'USA' },
    payment_terms: 'net30',
    credit_limit: 300000,
    tax_exempt: false,
    annual_volume: 250000,
    priority: 'vip',
    status: 'active',
    purchasing_status: 'Approved Vendor',
    last_quoted_date: '2026-02-12T09:00:00Z',
    last_ordered_date: '2026-01-28T15:30:00Z',
    contacts: [
      { id: '1a', client_id: '1', name: 'Marcus Thompson', email: 'marcus@raisincanes.com', phone: '615-555-0101', role: 'primary', contact_type: 'order', is_primary: true },
    ],
    created_at: '2025-11-15T10:30:00Z',
    updated_at: '2026-02-18T14:22:00Z',
  },
  {
    id: '2',
    org_id: 'demo-org',
    company_name: 'Progressive Insurance',
    industry: 'Insurance/Corporate',
    billing_address: { street: '6300 Wilson Mills Rd', city: 'Cleveland', state: 'OH', zip: '44143', country: 'USA' },
    payment_terms: 'net45',
    credit_limit: 500000,
    tax_exempt: false,
    annual_volume: 180000,
    priority: 'vip',
    status: 'active',
    purchasing_status: 'Net 45 Approved',
    last_quoted_date: '2026-02-10T14:00:00Z',
    last_ordered_date: '2026-01-18T10:15:00Z',
    contacts: [
      { id: '2a', client_id: '2', name: 'Jennifer Walsh', email: 'j.walsh@progressive.com', phone: '440-555-0202', role: 'primary', contact_type: 'general', is_primary: true },
    ],
    created_at: '2025-10-22T09:15:00Z',
    updated_at: '2026-02-19T11:45:00Z',
  },
  {
    id: '3',
    org_id: 'demo-org',
    company_name: 'Nashville Sounds',
    industry: 'Sports/Entertainment',
    billing_address: { street: '401 Jackson St', city: 'Nashville', state: 'TN', zip: '37219', country: 'USA' },
    payment_terms: 'net30',
    credit_limit: 100000,
    tax_exempt: true,
    annual_volume: 75000,
    priority: 'standard',
    status: 'active',
    purchasing_status: 'Approved Vendor',
    last_quoted_date: '2026-02-05T11:30:00Z',
    last_ordered_date: '2026-01-22T09:45:00Z',
    contacts: [
      { id: '3a', client_id: '3', name: 'Dustin Parker', email: 'dparker@nashvillesounds.com', phone: '615-555-0303', role: 'primary', is_primary: true },
    ],
    created_at: '2025-12-01T13:20:00Z',
    updated_at: '2026-02-20T08:30:00Z',
  },
  {
    id: '4',
    org_id: 'demo-org',
    company_name: 'Threadbird Studios',
    industry: 'Music/Merch',
    billing_address: { street: '1908 Chet Atkins Pl', city: 'Nashville', state: 'TN', zip: '37212', country: 'USA' },
    payment_terms: 'prepay',
    credit_limit: 150000,
    tax_exempt: false,
    annual_volume: 120000,
    priority: 'standard',
    status: 'active',
    purchasing_status: 'Prepay Only',
    last_quoted_date: '2026-02-14T16:00:00Z',
    last_ordered_date: '2026-02-03T12:20:00Z',
    contacts: [
      { id: '4a', client_id: '4', name: 'Nick Rodriguez', email: 'nick@threadbird.com', phone: '615-555-0404', role: 'primary', is_primary: true },
    ],
    created_at: '2025-09-10T16:45:00Z',
    updated_at: '2026-02-17T15:10:00Z',
  },
  {
    id: '5',
    org_id: 'demo-org',
    company_name: 'Green Beret Foundation',
    industry: 'Nonprofit/Military',
    billing_address: { street: '400 Cobb Pkwy SE', city: 'Marietta', state: 'GA', zip: '30060', country: 'USA' },
    payment_terms: 'net30',
    credit_limit: 75000,
    tax_exempt: true,
    annual_volume: 45000,
    priority: 'at-risk',
    status: 'active',
    purchasing_status: 'Pending Credit Check',
    last_quoted_date: '2026-01-30T10:00:00Z',
    last_ordered_date: '2026-01-15T14:00:00Z',
    contacts: [
      { id: '5a', client_id: '5', name: 'Sarah Mitchell', email: 'sarah.m@greenberetfdn.org', phone: '770-555-0505', role: 'primary', is_primary: true },
    ],
    created_at: '2026-01-05T10:00:00Z',
    updated_at: '2026-02-15T12:00:00Z',
  },
  {
    id: '6',
    org_id: 'demo-org',
    company_name: 'Red Bull Nashville',
    industry: 'Beverage/Sports',
    billing_address: { street: '600 12th Ave S', city: 'Nashville', state: 'TN', zip: '37203', country: 'USA' },
    payment_terms: 'net45',
    credit_limit: 400000,
    tax_exempt: false,
    annual_volume: 200000,
    priority: 'vip',
    status: 'active',
    purchasing_status: 'Net 30 Approved',
    last_quoted_date: '2026-02-18T08:45:00Z',
    last_ordered_date: '2026-02-06T11:00:00Z',
    contacts: [
      { id: '6a', client_id: '6', name: 'Kayla Martinez', email: 'k.martinez@redbull.com', phone: '615-555-0606', role: 'primary', contact_type: 'order', is_primary: true },
    ],
    created_at: '2025-11-20T14:30:00Z',
    updated_at: '2026-02-19T09:15:00Z',
  },
  {
    id: '7',
    org_id: 'demo-org',
    company_name: 'Locksmith Pro USA',
    industry: 'Service/Industrial',
    billing_address: { street: '2215 Sanders Rd', city: 'Northbrook', state: 'IL', zip: '60062', country: 'USA' },
    payment_terms: 'net30',
    credit_limit: 350000,
    tax_exempt: false,
    annual_volume: 300000,
    priority: 'vip',
    status: 'active',
    purchasing_status: 'Approved Vendor',
    last_quoted_date: '2026-02-19T13:15:00Z',
    last_ordered_date: '2026-02-10T16:30:00Z',
    contacts: [
      { id: '7a', client_id: '7', name: 'Tyler Brandt', email: 'tyler@locksmithpro.com', phone: '847-555-0707', role: 'primary', is_primary: true },
    ],
    created_at: '2025-10-12T11:00:00Z',
    updated_at: '2026-02-20T10:45:00Z',
  },
  {
    id: '8',
    org_id: 'demo-org',
    company_name: 'Dish Media Group',
    industry: 'Media/Entertainment',
    billing_address: { street: '1401 Music Row', city: 'Nashville', state: 'TN', zip: '37212', country: 'USA' },
    payment_terms: 'net30',
    credit_limit: 60000,
    tax_exempt: false,
    annual_volume: 40000,
    priority: 'at-risk',
    status: 'active',
    purchasing_status: 'New',
    last_quoted_date: '2026-02-08T10:30:00Z',
    contacts: [
      { id: '8a', client_id: '8', name: 'Ryan Chen', email: 'rchen@dishmedia.com', phone: '615-555-0808', role: 'primary', is_primary: true },
    ],
    created_at: '2026-01-10T09:30:00Z',
    updated_at: '2026-02-18T16:20:00Z',
  },
  {
    id: '9',
    org_id: 'demo-org',
    company_name: 'Austin Tech Summit',
    industry: 'Events/Conferences',
    billing_address: { street: '98 San Jacinto Blvd', city: 'Austin', state: 'TX', zip: '78701', country: 'USA' },
    payment_terms: 'prepay',
    credit_limit: 50000,
    tax_exempt: false,
    annual_volume: 35000,
    priority: 'at-risk',
    status: 'inactive',
    purchasing_status: 'Seasonal',
    last_quoted_date: '2026-01-25T14:00:00Z',
    last_ordered_date: '2025-11-10T09:00:00Z',
    contacts: [
      { id: '9a', client_id: '9', name: 'Hannah Torres', email: 'hannah@austintechsummit.com', phone: '512-555-0909', role: 'primary', is_primary: true },
    ],
    created_at: '2026-01-22T15:00:00Z',
    updated_at: '2026-02-16T13:40:00Z',
  },
  {
    id: '10',
    org_id: 'demo-org',
    company_name: 'Hillsong Church Nashville',
    industry: 'Religious/Events',
    billing_address: { street: '316 Southgate Ct', city: 'Brentwood', state: 'TN', zip: '37027', country: 'USA' },
    payment_terms: 'net30',
    credit_limit: 120000,
    tax_exempt: true,
    annual_volume: 90000,
    priority: 'standard',
    status: 'active',
    purchasing_status: 'Approved Vendor',
    last_quoted_date: '2026-02-15T11:00:00Z',
    last_ordered_date: '2026-01-20T13:30:00Z',
    contacts: [
      { id: '10a', client_id: '10', name: 'David Kim', email: 'david.kim@hillsong.com', phone: '615-555-1010', role: 'primary', is_primary: true },
    ],
    created_at: '2025-12-08T12:15:00Z',
    updated_at: '2026-02-19T14:50:00Z',
  },
  {
    id: '11',
    org_id: 'demo-org',
    company_name: 'Corey Kent',
    industry: 'Music/Entertainment',
    billing_address: { street: '1222 16th Ave S', city: 'Nashville', state: 'TN', zip: '37212', country: 'USA' },
    payment_terms: 'net30',
    credit_limit: 50000,
    tax_exempt: false,
    annual_volume: 45000,
    priority: 'standard',
    status: 'active',
    purchasing_status: 'New Client',
    contacts: [
      { id: '11a', client_id: '11', name: 'Amy Chen', email: 'amy@coreykent.com', phone: '615-555-1111', role: 'primary', is_primary: true },
    ],
    created_at: '2026-01-15T09:00:00Z',
    updated_at: '2026-02-20T10:30:00Z',
  },
  {
    id: '12',
    org_id: 'demo-org',
    company_name: 'Tucker Carlson Network',
    industry: 'Media',
    billing_address: { street: '400 Church St', city: 'Nashville', state: 'TN', zip: '37219', country: 'USA' },
    payment_terms: 'prepay',
    credit_limit: 200000,
    tax_exempt: false,
    annual_volume: 180000,
    priority: 'vip',
    status: 'active',
    purchasing_status: 'Approved Vendor',
    contacts: [
      { id: '12a', client_id: '12', name: 'Ryan Brooks', email: 'rbrooks@tcn.com', phone: '615-555-1212', role: 'primary', contact_type: 'order', is_primary: true },
      { id: '12b', client_id: '12', name: 'Claire Lawson', email: 'clawson@tcn.com', phone: '615-555-1213', role: 'billing', contact_type: 'finance', is_primary: false },
    ],
    created_at: '2025-11-20T14:00:00Z',
    updated_at: '2026-02-22T16:45:00Z',
  },
  {
    id: '13',
    org_id: 'demo-org',
    company_name: 'Disciple',
    industry: 'Music/Entertainment',
    billing_address: { street: '62 Music Square W', city: 'Nashville', state: 'TN', zip: '37203', country: 'USA' },
    payment_terms: 'net15',
    credit_limit: 35000,
    tax_exempt: false,
    annual_volume: 28000,
    priority: 'standard',
    status: 'active',
    purchasing_status: 'New Client',
    contacts: [
      { id: '13a', client_id: '13', name: 'Kevin Young', email: 'kevin@disciplerocks.com', phone: '615-555-1313', role: 'primary', is_primary: true },
    ],
    created_at: '2026-02-01T11:30:00Z',
    updated_at: '2026-02-21T09:15:00Z',
  },
];

export function getDemoClients(orgId?: string): DemoClient[] {
  // Default org or no orgId: return main demo data
  if (!orgId || orgId === 'demo-org' || orgId === 'org-85-supply') {
    return DEMO_CLIENTS;
  }
  // Other orgs: no client data in admin demo yet — return empty
  return [];
}

// ===== DEMO LINE ITEMS (for project detail pages) =====

const DEMO_LINE_ITEMS_PROJECT_1: ProjectLineItem[] = [
  {
    id: 'li-1-1',
    project_id: '1',
    product_id: 'prod-7',
    product_name: 'Gildan 5000 Heavy Cotton Tee',
    product_type: 'contract',
    selected_color: 'Black',
    selected_sizes: [
      { size: 'S', quantity: 100 },
      { size: 'M', quantity: 250 },
      { size: 'L', quantity: 300 },
      { size: 'XL', quantity: 200 },
      { size: '2XL', quantity: 100 },
    ],
    total_quantity: 950,
    decorations: [
      {
        id: 'dec-1-1-1',
        position: 'front',
        position_label: 'Front Chest',
        method: 'screen-print',
        color_count: 3,
        vendor_id: 'vendor-1',
        vendor_name: 'Culture Studio',
        decorator_matrix_id: 'mat-1',
        decoration_cost: 2.25,
        setup_charges: [{ id: 'sc-1-1-1', name: 'Screen Setup', amount: 20.00, calculation: 'setup', per_color: true }],
        run_charges: [],
        art_file_url: '/demo/art/left-chest-logo.png',
      },
      {
        id: 'dec-1-1-2',
        position: 'back',
        position_label: 'Full Back',
        method: 'screen-print',
        color_count: 4,
        vendor_id: 'vendor-1',
        vendor_name: 'Culture Studio',
        decorator_matrix_id: 'mat-1',
        decoration_cost: 2.75,
        setup_charges: [{ id: 'sc-1-1-2', name: 'Screen Setup', amount: 20.00, calculation: 'setup', per_color: true }],
        run_charges: [],
        art_file_url: '/demo/art/full-back-design.png',
      },
    ],
    add_ons: [{ id: 'ao-1-1-1', name: 'Folding & Polybag', cost_per_unit: 0.50, sale_price_per_unit: 0.75, level: 'product' }],
    unit_cost: 8.00,
    margin_percent: 35,
    unit_price: 12.31,
    subtotal: 11694.50,
    art_received: true,
    quantities_received: false,
    artwork_files: ['raisin-canes-front.ai', 'raisin-canes-back.ai'],
    display_name: 'Crew Neck Uniform Tees',
    product_fixed_charges: [{ id: 'pfc-1', name: 'Rush Fee', amount: 150, sale_amount: 200 }],
    estimated_shipping_cost: 180.00,
    sort_order: 0,
  },
  {
    id: 'li-1-2',
    project_id: '1',
    product_id: 'prod-9',
    product_name: 'Richardson 112 Trucker Cap',
    product_type: 'contract',
    selected_color: 'Black/White',
    selected_sizes: [{ size: 'OSFA', quantity: 500 }],
    total_quantity: 500,
    decorations: [
      {
        id: 'dec-1-2-1',
        position: 'front',
        position_label: 'Front Panel',
        method: 'embroidery',
        color_count: 2,
        stitch_count: 8000,
        vendor_id: 'vendor-2',
        vendor_name: 'Lightning Stitch',
        decorator_matrix_id: 'mat-2',
        decoration_cost: 3.75,
        setup_charges: [{ id: 'sc-1-2-1', name: 'Digitizing Fee', amount: 75.00, calculation: 'setup', per_color: false }],
        run_charges: [{ id: 'rc-1-2-1', name: 'Thread Trim', cost_per_unit: 0.15 }],
      },
    ],
    add_ons: [],
    unit_cost: 8.90,
    margin_percent: 35,
    unit_price: 13.69,
    subtotal: 6845.00,
    art_received: true,
    quantities_received: false,
    artwork_files: ['raisin-canes-cap.dst'],
    product_fixed_charges: [],
    sort_order: 1,
  },
  {
    id: 'li-1-3',
    project_id: '1',
    product_id: 'prod-2',
    product_name: 'Port Authority K500 Polo',
    product_type: 'contract',
    selected_color: 'Navy',
    selected_sizes: [
      { size: 'S', quantity: 50 },
      { size: 'M', quantity: 150 },
      { size: 'L', quantity: 200 },
      { size: 'XL', quantity: 100 },
    ],
    total_quantity: 500,
    decorations: [
      {
        id: 'dec-1-3-1',
        position: 'left-chest',
        position_label: 'Left Chest',
        method: 'embroidery',
        color_count: 3,
        stitch_count: 12000,
        vendor_id: 'vendor-2',
        vendor_name: 'Lightning Stitch',
        decorator_matrix_id: 'mat-2',
        decoration_cost: 4.50,
        setup_charges: [{ id: 'sc-1-3-1', name: 'Digitizing Fee', amount: 125.00, calculation: 'setup', per_color: false }],
        run_charges: [{ id: 'rc-1-3-1', name: 'Flash Cure', cost_per_unit: 0.75 }],
        art_file_url: '/demo/art/rc-left-chest-embroidery.dst',
      },
    ],
    add_ons: [
      { id: 'ao-1-3-1', name: 'Name Tag Below Logo', cost_per_unit: 2.00, sale_price_per_unit: 3.25, level: 'product' },
      { id: 'ao-1-3-2', name: 'Puff Ink', cost_per_unit: 0.85, sale_price_per_unit: 1.50, level: 'location', decoration_id: 'dec-1-3-1' },
    ],
    unit_cost: 19.25,
    margin_percent: 38,
    unit_price: 31.05,
    subtotal: 15525.00,
    art_received: false,
    quantities_received: false,
    artwork_files: [],
    display_name: 'Embroidered Polos',
    product_fixed_charges: [],
    sort_order: 2,
  },
];

const DEMO_LINE_ITEMS_PROJECT_2: ProjectLineItem[] = [
  {
    id: 'li-2-1',
    project_id: '2',
    product_id: 'prod-1',
    product_name: 'Bella+Canvas 3001 Unisex Tee',
    product_type: 'contract',
    selected_color: 'Red',
    selected_sizes: [
      { size: 'S', quantity: 200 },
      { size: 'M', quantity: 400 },
      { size: 'L', quantity: 500 },
      { size: 'XL', quantity: 300 },
      { size: '2XL', quantity: 100 },
    ],
    total_quantity: 1500,
    decorations: [
      {
        id: 'dec-2-1-1',
        position: 'front',
        position_label: 'Full Front',
        method: 'screen-print',
        color_count: 4,
        vendor_id: 'vendor-1',
        vendor_name: 'Culture Studio',
        decorator_matrix_id: 'mat-1',
        decoration_cost: 2.75,
        setup_charges: [{ id: 'sc-2-1-1', name: 'Screen Setup', amount: 20.00, calculation: 'setup', per_color: true }],
        run_charges: [],
      },
    ],
    add_ons: [],
    unit_cost: 5.25,
    margin_percent: 35,
    unit_price: 8.08,
    subtotal: 12120.00,
    art_received: true,
    quantities_received: true,
    artwork_files: ['redbull-event-front.ai'],
    product_fixed_charges: [],
    sort_order: 0,
  },
  {
    id: 'li-2-2',
    project_id: '2',
    product_id: 'prod-6',
    product_name: 'Nike Swoosh Performance Cap',
    product_type: 'contract',
    pricing_override: 'all-in',       // Hybrid: contract product quoted as all-in (vendor handles blank + deco)
    selected_color: 'White',
    selected_sizes: [{ size: 'OSFA', quantity: 1000 }],
    total_quantity: 1000,
    decorations: [],                   // All-in override: vendor handles decoration
    add_ons: [],
    vendor_cost: 18.50,               // All-in vendor price
    unit_cost: 18.50,
    margin_percent: 40,
    unit_price: 30.83,
    subtotal: 30830.00,
    art_received: true,
    quantities_received: true,
    artwork_files: ['redbull-cap.dst'],
    sort_order: 1,
  },
  {
    id: 'li-2-3',
    project_id: '2',
    product_id: 'prod-4',
    product_name: 'YETI Rambler 20oz',
    product_type: 'all-in',
    pricing_override: null,
    selected_color: 'Red',
    selected_sizes: [{ size: 'N/A', quantity: 500 }],
    total_quantity: 500,
    decorations: [],               // All-in: vendor handles decoration
    add_ons: [{ id: 'ao-2-3-1', name: 'Gift Box', cost_per_unit: 3.50, sale_price_per_unit: 5.00, level: 'product' }],
    vendor_cost: 26.00,            // All-in: YETI handles blank + laser engrave
    unit_cost: 29.50,
    margin_percent: 42,
    unit_price: 50.86,
    subtotal: 25430.00,
    art_received: true,
    quantities_received: false,
    artwork_files: ['redbull-yeti.svg'],
    sort_order: 2,
  },
];

const DEMO_LINE_ITEMS_PROJECT_5: ProjectLineItem[] = [
  {
    id: 'li-5-1',
    project_id: '5',
    product_id: 'prod-10',
    product_name: 'Comfort Colors 1717 Garment-Dyed Tee',
    product_type: 'contract',
    selected_color: 'Ivory',
    selected_sizes: [
      { size: 'S', quantity: 50 },
      { size: 'M', quantity: 100 },
      { size: 'L', quantity: 150 },
      { size: 'XL', quantity: 75 },
    ],
    total_quantity: 375,
    decorations: [
      {
        id: 'dec-5-1-1',
        position: 'front',
        position_label: 'Full Front',
        method: 'dtg',
        color_count: 1,
        vendor_id: 'vendor-3',
        vendor_name: '33 Inc',
        decorator_matrix_id: 'mat-4',
        decoration_cost: 6.00,
        setup_charges: [],
        run_charges: [],
      },
      {
        id: 'dec-5-1-2',
        position: 'back',
        position_label: 'Full Back',
        method: 'dtg',
        color_count: 1,
        vendor_id: 'vendor-3',
        vendor_name: '33 Inc',
        decorator_matrix_id: 'mat-4',
        decoration_cost: 6.00,
        setup_charges: [],
        run_charges: [],
      },
    ],
    add_ons: [
      { id: 'ao-5-1-1', name: 'Premium Hangtag', cost_per_unit: 1.25, sale_price_per_unit: 2.00, level: 'product' },
      { id: 'ao-5-1-2', name: 'Metallic Ink', cost_per_unit: 1.10, sale_price_per_unit: 1.75, level: 'location', decoration_id: 'dec-5-1-1' },
    ],
    unit_cost: 17.75,
    margin_percent: 45,
    unit_price: 32.27,
    subtotal: 12101.25,
    art_received: true,
    quantities_received: false,
    artwork_files: ['threadbird-front.png', 'threadbird-back.png'],
    sort_order: 0,
  },
  {
    id: 'li-5-2',
    project_id: '5',
    product_id: 'prod-8',
    product_name: 'Gildan 18500 Heavy Blend Hoodie',
    product_type: 'contract',
    selected_color: 'Black',
    selected_sizes: [
      { size: 'S', quantity: 25 },
      { size: 'M', quantity: 50 },
      { size: 'L', quantity: 75 },
      { size: 'XL', quantity: 40 },
    ],
    total_quantity: 190,
    decorations: [
      {
        id: 'dec-5-2-1',
        position: 'left-chest',
        position_label: 'Left Chest',
        method: 'screen-print',
        color_count: 2,
        vendor_id: 'vendor-1',
        vendor_name: 'Culture Studio',
        decorator_matrix_id: 'mat-1',
        decoration_cost: 3.10,
        setup_charges: [{ id: 'sc-5-2-1', name: 'Screen Setup', amount: 20.00, calculation: 'setup', per_color: true }],
        run_charges: [],
      },
    ],
    add_ons: [],
    unit_cost: 13.10,
    margin_percent: 40,
    unit_price: 21.83,
    subtotal: 4147.70,
    art_received: false,
    quantities_received: false,
    artwork_files: [],
    sort_order: 1,
  },
];

const DEMO_LINE_ITEMS_MAP: Record<string, ProjectLineItem[]> = {
  '1': DEMO_LINE_ITEMS_PROJECT_1,
  '2': DEMO_LINE_ITEMS_PROJECT_2,
  '5': DEMO_LINE_ITEMS_PROJECT_5,
};

export function getDemoProjectLineItems(projectId: string): ProjectLineItem[] {
  return DEMO_LINE_ITEMS_MAP[projectId] ?? [];
}

// ===== DEMO PROJECTS =====

export type DemoProject = Project;

const DEMO_PROJECTS: DemoProject[] = [
  {
    id: '1',
    org_id: 'demo-org',
    client_id: '1',
    client_name: 'Raisin Canes',
    project_number: 'PRJ-2026-0042',
    name: 'Q2 Uniform Rollout',
    status: 'curating',
    source: 'website',
    in_hands_date: '2026-04-15',
    project_deadline: '2026-04-15',
    ship_date: '2026-03-20',
    production_time: 'standard',
    budget: 50000,
    is_critical: true,
    estimated_total: 45000,
    estimated_shipping_cost: 450.00,
    internal_notes: '43 locations, multiple sizes per store',
    shareable_link: 'demo-link-1',
    line_items: DEMO_LINE_ITEMS_PROJECT_1,
    split_shipments: [
      {
        id: 'dest-1',
        label: 'Nashville HQ',
        address: { street: '123 Music Row', city: 'Nashville', state: 'TN', zip: '37203', country: 'USA' },
        contact_name: 'Marcus Thompson',
        contact_phone: '615-555-0101',
        allocations: [
          { line_item_id: 'li-1-1', product_name: 'Gildan 5000 Heavy Cotton Tee', quantity: 500 },
          { line_item_id: 'li-1-3', product_name: 'Port Authority K500 Polo', quantity: 250 },
        ],
      },
      {
        id: 'dest-2',
        label: 'LA Warehouse',
        address: { street: '456 Sunset Blvd', city: 'Los Angeles', state: 'CA', zip: '90028', country: 'USA' },
        allocations: [
          { line_item_id: 'li-1-1', product_name: 'Gildan 5000 Heavy Cotton Tee', quantity: 450 },
          { line_item_id: 'li-1-3', product_name: 'Port Authority K500 Polo', quantity: 250 },
        ],
      },
    ],
    comments: [
      { id: 'pc-1', author: 'Trevor Sarver', message: 'Need this by end of month - rush if needed', created_at: '2026-03-01T09:00:00Z' },
      { id: 'pc-2', author: 'Sarah Chen', message: '@trevor confirmed with vendor, rush is possible', created_at: '2026-03-01T14:30:00Z' },
    ],
    change_request_pending: true,
    approval_phase: 'collecting',
    payment_status: 'unpaid',
    created_at: '2026-02-10T09:30:00Z',
    updated_at: '2026-02-20T14:20:00Z',
  },
  {
    id: '2',
    org_id: 'demo-org',
    client_id: '6',
    client_name: 'Red Bull Nashville',
    project_number: 'PRJ-2026-0051',
    name: 'Summer Event Merch',
    status: 'client-review',
    source: 'direct',
    in_hands_date: '2026-05-20',
    project_deadline: '2026-05-20',
    ship_date: '2026-05-10',
    production_time: 'standard',
    budget: 75000,
    is_critical: true,
    estimated_total: 67500,
    estimated_shipping_cost: 200.00,
    internal_notes: 'Premium tees + embroidered caps, 4-color design',
    shareable_link: 'demo-link-2',
    line_items: DEMO_LINE_ITEMS_PROJECT_2,
    split_shipments: [],
    comments: [],
    change_request_pending: false,
    approval_phase: 'final-approval',
    payment_status: 'unpaid',
    created_at: '2026-01-28T11:15:00Z',
    updated_at: '2026-02-19T16:45:00Z',
  },
  {
    id: '3',
    org_id: 'demo-org',
    client_id: '3',
    client_name: 'Nashville Sounds',
    project_number: 'PRJ-2026-0038',
    name: '2026 Season Swag',
    status: 'opportunity',
    source: 'referral',
    in_hands_date: '2026-03-25',
    estimated_total: 8500,
    is_critical: false,
    line_items: [],
    created_at: '2026-02-15T13:00:00Z',
    updated_at: '2026-02-20T09:10:00Z',
  },
  {
    id: '4',
    org_id: 'demo-org',
    client_id: '2',
    client_name: 'Progressive Insurance',
    project_number: 'PRJ-2026-0029',
    name: 'Regional Polos',
    status: 'confirmed',
    source: 'program',
    in_hands_date: '2026-03-10',
    budget: 25000,
    is_critical: false,
    estimated_total: 22000,
    internal_notes: '8 regional offices, drop-ship to each location',
    shareable_link: 'demo-link-4',
    line_items: [],
    split_shipments: [],
    comments: [],
    change_request_pending: false,
    approval_phase: 'approved',
    payment_status: 'paid',
    payment_details: { amount: 22000, method: 'ACH Transfer', date: '2026-02-15', reference: 'ACH-88421' },
    created_at: '2026-01-15T10:20:00Z',
    updated_at: '2026-02-18T15:30:00Z',
  },
  {
    id: '5',
    org_id: 'demo-org',
    client_id: '4',
    client_name: 'Threadbird Studios',
    project_number: 'PRJ-2026-0055',
    name: 'Artist Merch Drop',
    status: 'in-design',
    source: 'direct',
    in_hands_date: '2026-04-01',
    project_deadline: '2026-04-01',
    ship_date: '2026-03-25',
    production_time: 'rush',
    budget: 20000,
    is_critical: true,
    estimated_total: 18750,
    internal_notes: 'Full-color DTG, premium blanks',
    client_facing_notes: 'Rush timeline confirmed. All art files due by 3/10.',
    shareable_link: 'demo-link-5',
    line_items: DEMO_LINE_ITEMS_PROJECT_5,
    split_shipments: [],
    comments: [],
    change_request_pending: false,
    approval_phase: 'approved',
    payment_status: 'unpaid',
    created_at: '2026-02-05T14:45:00Z',
    updated_at: '2026-02-20T11:25:00Z',
  },
  {
    id: '6',
    org_id: 'demo-org',
    client_id: '5',
    client_name: 'Green Beret Foundation',
    project_number: 'PRJ-2026-0047',
    name: 'Gala Gift Bags',
    status: 'qualifying',
    source: 'referral',
    in_hands_date: '2026-05-10',
    estimated_total: 15500,
    is_critical: false,
    internal_notes: 'Nonprofit pricing, 500 units total',
    line_items: [],
    created_at: '2026-02-12T08:30:00Z',
    updated_at: '2026-02-19T10:15:00Z',
  },
  {
    id: '7',
    org_id: 'demo-org',
    client_id: '8',
    client_name: 'Dish Media Group',
    project_number: 'PRJ-2026-0044',
    name: 'Conference Kit',
    status: 'client-review',
    source: 'website',
    in_hands_date: '2026-04-18',
    estimated_total: 9800,
    is_critical: false,
    shareable_link: 'demo-link-7',
    line_items: [],
    created_at: '2026-02-08T12:00:00Z',
    updated_at: '2026-02-20T08:40:00Z',
  },
  {
    id: '8',
    org_id: 'demo-org',
    client_id: '9',
    client_name: 'Austin Tech Summit',
    project_number: 'PRJ-2026-0060',
    name: 'Speaker Gifts',
    status: 'opportunity',
    source: 'direct',
    in_hands_date: '2026-06-01',
    estimated_total: 12000,
    is_critical: false,
    line_items: [],
    created_at: '2026-02-18T15:20:00Z',
    updated_at: '2026-02-20T13:50:00Z',
  },
  {
    id: '9',
    org_id: 'demo-org',
    client_id: '10',
    client_name: 'Hillsong Church Nashville',
    project_number: 'PRJ-2026-0034',
    name: 'Worship Tour Merch',
    status: 'presenting',
    source: 'direct',
    in_hands_date: '2026-03-28',
    budget: 60000,
    is_critical: true,
    estimated_total: 52000,
    internal_notes: 'Multi-location tour, 12 cities',
    shareable_link: 'demo-link-9',
    line_items: [],
    created_at: '2026-01-20T09:45:00Z',
    updated_at: '2026-02-19T12:30:00Z',
  },
  {
    id: '10',
    org_id: 'demo-org',
    client_id: '7',
    client_name: 'Locksmith Pro USA',
    project_number: 'PRJ-2026-0023',
    name: 'Branded Workwear',
    status: 'confirmed',
    source: 'program',
    in_hands_date: '2026-03-05',
    budget: 80000,
    is_critical: true,
    estimated_total: 75000,
    internal_notes: 'Carhartt jackets + embroidered patches, 250 units',
    shareable_link: 'demo-link-10',
    line_items: [],
    split_shipments: [],
    comments: [],
    change_request_pending: false,
    approval_phase: 'approved',
    payment_status: 'partial',
    payment_details: { amount: 37500, method: 'Check', date: '2026-02-01', reference: 'CHK-7742' },
    created_at: '2026-01-08T11:30:00Z',
    updated_at: '2026-02-17T16:00:00Z',
  },
  {
    id: '11',
    org_id: 'demo-org',
    client_id: '1',
    client_name: 'Raisin Canes',
    project_number: 'PRJ-2026-0031',
    name: 'Low Tide Club Tees',
    status: 'opportunity',
    source: 'website',
    in_hands_date: '2026-04-05',
    estimated_total: 3200,
    is_critical: false,
    line_items: [],
    created_at: '2026-02-14T10:15:00Z',
    updated_at: '2026-02-20T10:00:00Z',
  },
  {
    id: '12',
    org_id: 'demo-org',
    client_id: '4',
    client_name: 'Threadbird Studios',
    project_number: 'PRJ-2026-0058',
    name: 'Studio Launch Collection',
    status: 'client-review',
    source: 'direct',
    in_hands_date: '2026-05-15',
    budget: 15000,
    is_critical: false,
    estimated_total: 11400,
    shareable_link: 'demo-link-12',
    line_items: [],
    created_at: '2026-02-16T14:00:00Z',
    updated_at: '2026-02-20T12:20:00Z',
  },
  {
    id: '13',
    org_id: 'demo-org',
    client_id: '6',
    client_name: 'Red Bull Nashville',
    project_number: 'PRJ-2026-0062',
    name: 'Holiday Gift Box',
    status: 'qualifying',
    source: 'direct',
    in_hands_date: '2026-11-20',
    estimated_total: 34200,
    is_critical: false,
    internal_notes: 'Premium drinkware + tech accessories',
    line_items: [],
    created_at: '2026-02-19T09:00:00Z',
    updated_at: '2026-02-20T15:10:00Z',
  },
  {
    id: '14',
    org_id: 'demo-org',
    client_id: '7',
    client_name: 'Locksmith Pro USA',
    project_number: 'PRJ-2026-0039',
    name: 'Q2 Safety Gear',
    status: 'curating',
    source: 'program',
    in_hands_date: '2026-04-10',
    budget: 32000,
    is_critical: false,
    estimated_total: 28600,
    line_items: [],
    created_at: '2026-02-06T13:15:00Z',
    updated_at: '2026-02-19T17:30:00Z',
  },
  {
    id: '15',
    org_id: 'demo-org',
    client_id: '4',
    client_name: 'Threadbird Studios',
    project_number: 'PRJ-2026-0012',
    name: "Jeremy's Concert Tees",
    status: 'cancelled',
    source: 'direct',
    estimated_total: 6500,
    is_critical: false,
    internal_notes: 'Client cancelled tour, 50% deposit kept',
    line_items: [],
    created_at: '2025-12-20T16:00:00Z',
    updated_at: '2026-01-15T11:00:00Z',
  },
  {
    id: '16',
    org_id: 'demo-org',
    client_id: '11',
    client_name: 'Corey Kent',
    project_number: 'PRJ-2026-0013',
    name: 'Corey Kent — 2026 Tour Merch',
    status: 'in-design',
    source: 'referral',
    in_hands_date: '2026-04-01',
    estimated_total: 18500,
    budget: 20000,
    is_critical: false,
    internal_notes: 'First order from Corey Kent team. Amy wants mockup deck before production.',
    line_items: [],
    created_at: '2026-02-18T10:00:00Z',
    updated_at: '2026-02-22T14:30:00Z',
  },
  {
    id: '17',
    org_id: 'demo-org',
    client_id: '12',
    client_name: 'Tucker Carlson Network',
    project_number: 'PRJ-2026-0014',
    name: 'TCN — Staff Polos & Outerwear',
    status: 'confirmed',
    source: 'direct',
    in_hands_date: '2026-03-20',
    production_time: 'standard',
    estimated_total: 67500,
    budget: 70000,
    is_critical: true,
    internal_notes: 'High-profile client. Ryan wants all PMS colors matched exactly. Prepay confirmed.',
    line_items: [],
    created_at: '2026-02-10T09:00:00Z',
    updated_at: '2026-02-23T11:00:00Z',
  },
  {
    id: '18',
    org_id: 'demo-org',
    client_id: '13',
    client_name: 'Disciple',
    project_number: 'PRJ-2026-0015',
    name: 'Disciple — Spring Merch Drop',
    status: 'qualifying',
    source: 'referral',
    estimated_total: 8200,
    is_critical: false,
    line_items: [],
    created_at: '2026-02-20T15:30:00Z',
    updated_at: '2026-02-22T09:45:00Z',
  },
];

export function getDemoProjects(orgId?: string): DemoProject[] {
  // Default org or no orgId: return main demo data
  if (!orgId || orgId === 'demo-org' || orgId === 'org-85-supply') {
    return DEMO_PROJECTS;
  }
  // Other orgs: fetch from admin demo data
  const { getDemoOrgProjects } = require('@/lib/demo/admin-demo-data');
  return getDemoOrgProjects(orgId);
}

// ===== DEMO ORDERS =====

export type DemoOrder = Order;

const DEMO_ORDERS: DemoOrder[] = [
  {
    id: '1',
    org_id: 'demo-org',
    project_id: '4',
    project_name: 'Progressive Regional Polos',
    line_item_id: 'li-1',
    order_number: 'ORD-2026-0138',
    salesforce_id: 'SF-00012345',
    status: 'shipped',
    product_name: 'Port Authority K500 Silk Touch Polo',
    quantity: 120,
    unit_price: 28.50,
    total: 3420,
    in_hands_date: '2026-03-10',
    ship_to: { street: '6300 Wilson Mills Rd', city: 'Cleveland', state: 'OH', zip: '44143', country: 'USA' },
    tracking_number: '1Z999AA10123456784',
    tracking_url: 'https://www.ups.com/track?tracknum=1Z999AA10123456784',
    carrier: 'UPS Ground',
    shipped_date: '2026-02-18',
    invoice_amount: 3420,
    payment_received: false,
    shipments: [{
      id: 'ship-1',
      order_id: '1',
      tracking_number: '1Z999AA10123456784',
      carrier: 'UPS',
      ship_date: '2026-02-18',
      estimated_arrival: '2026-02-21',
      status: 'delivered',
      items_shipped: 120,
    }],
    sales_order_pdf_url: '/demo/docs/SO-2026-0138.pdf',
    invoice_pdf_url: '/demo/docs/INV-2026-0138.pdf',
    created_at: '2026-02-08T10:00:00Z',
    updated_at: '2026-02-18T14:30:00Z',
  },
  {
    id: '2',
    org_id: 'demo-org',
    project_id: '10',
    project_name: 'Locksmith Pro Branded Workwear',
    line_item_id: 'li-2',
    order_number: 'ORD-2026-0142',
    status: 'partially-shipped',
    product_name: 'Carhartt Duck Detroit Jacket',
    quantity: 250,
    unit_price: 89.00,
    total: 22250,
    in_hands_date: '2026-03-05',
    ship_to: { street: '2215 Sanders Rd', city: 'Northbrook', state: 'IL', zip: '60062', country: 'USA' },
    payment_received: false,
    shipments: [{
      id: 'ship-2',
      order_id: '2',
      tracking_number: '1Z999AA10123456799',
      carrier: 'UPS',
      ship_date: '2026-03-15',
      estimated_arrival: '2026-03-18',
      status: 'in-transit',
      items_shipped: 150,
    }],
    created_at: '2026-02-12T09:15:00Z',
    updated_at: '2026-02-20T11:20:00Z',
  },
  {
    id: '3',
    org_id: 'demo-org',
    project_id: '2',
    project_name: 'Red Bull Summer Event Merch',
    line_item_id: 'li-3',
    order_number: 'ORD-2026-0145',
    status: 'order-entry-needed',
    product_name: 'Bella+Canvas 3001 Unisex Tee',
    quantity: 500,
    unit_price: 18.75,
    total: 9375,
    in_hands_date: '2026-05-20',
    ship_to: { street: '600 12th Ave S', city: 'Nashville', state: 'TN', zip: '37203', country: 'USA' },
    payment_received: false,
    shipments: [],
    created_at: '2026-02-19T15:00:00Z',
    updated_at: '2026-02-20T08:45:00Z',
  },
  {
    id: '4',
    org_id: 'demo-org',
    project_id: '9',
    project_name: 'Hillsong Worship Tour Merch',
    line_item_id: 'li-4',
    order_number: 'ORD-2026-0133',
    salesforce_id: 'SF-00012340',
    status: 'in-production',
    product_name: 'Gildan 18500 Heavy Blend Hoodie',
    quantity: 300,
    unit_price: 42.50,
    total: 12750,
    in_hands_date: '2026-03-28',
    ship_to: { street: '316 Southgate Ct', city: 'Brentwood', state: 'TN', zip: '37027', country: 'USA' },
    payment_received: false,
    shipments: [],
    created_at: '2026-02-10T13:30:00Z',
    updated_at: '2026-02-19T10:15:00Z',
  },
  {
    id: '5',
    org_id: 'demo-org',
    project_id: '5',
    project_name: 'Threadbird Artist Merch Drop',
    line_item_id: 'li-5',
    order_number: 'ORD-2026-0147',
    status: 'in-production',
    product_name: 'Comfort Colors 1717 Garment-Dyed Tee',
    quantity: 180,
    unit_price: 24.80,
    total: 4464,
    in_hands_date: '2026-04-01',
    ship_to: { street: '1908 Chet Atkins Pl', city: 'Nashville', state: 'TN', zip: '37212', country: 'USA' },
    payment_received: false,
    shipments: [],
    created_at: '2026-02-15T11:00:00Z',
    updated_at: '2026-02-20T09:30:00Z',
  },
  {
    id: '6',
    org_id: 'demo-org',
    project_id: '1',
    project_name: 'Raisin Canes Q2 Uniform Rollout',
    line_item_id: 'li-6',
    order_number: 'ORD-2026-0149',
    status: 'order-entry-needed',
    product_name: 'Gildan 5000 Heavy Cotton Tee',
    quantity: 850,
    unit_price: 12.50,
    total: 10625,
    in_hands_date: '2026-04-15',
    ship_to: { street: '3520 General De Gaulle Dr', city: 'New Orleans', state: 'LA', zip: '70114', country: 'USA' },
    payment_received: false,
    shipments: [],
    created_at: '2026-02-18T14:45:00Z',
    updated_at: '2026-02-20T13:15:00Z',
  },
  {
    id: '7',
    org_id: 'demo-org',
    project_id: '4',
    project_name: 'Progressive Regional Polos',
    line_item_id: 'li-7',
    order_number: 'ORD-2026-0135',
    salesforce_id: 'SF-00012342',
    status: 'ready-for-invoicing',
    product_name: 'Port Authority K500 Silk Touch Polo',
    quantity: 95,
    unit_price: 28.50,
    total: 2707.50,
    in_hands_date: '2026-03-10',
    ship_to: { street: '6300 Wilson Mills Rd', city: 'Cleveland', state: 'OH', zip: '44143', country: 'USA' },
    tracking_number: '1Z999AA10123456790',
    tracking_url: 'https://www.ups.com/track?tracknum=1Z999AA10123456790',
    carrier: 'UPS Ground',
    shipped_date: '2026-02-16',
    invoice_amount: 2707.50,
    payment_received: false,
    shipments: [{
      id: 'ship-7',
      order_id: '7',
      tracking_number: '1Z999AA10123456790',
      carrier: 'UPS',
      ship_date: '2026-02-16',
      estimated_arrival: '2026-02-19',
      status: 'delivered',
      items_shipped: 95,
    }],
    created_at: '2026-02-07T09:30:00Z',
    updated_at: '2026-02-19T15:00:00Z',
  },
  {
    id: '8',
    org_id: 'demo-org',
    project_id: '3',
    project_name: 'Nashville Sounds 2026 Season Swag',
    line_item_id: 'li-8',
    order_number: 'ORD-2026-0141',
    status: 'in-production',
    product_name: 'Richardson 112 Trucker Cap',
    quantity: 200,
    unit_price: 16.25,
    total: 3250,
    in_hands_date: '2026-03-25',
    ship_to: { street: '401 Jackson St', city: 'Nashville', state: 'TN', zip: '37219', country: 'USA' },
    payment_received: false,
    shipments: [],
    created_at: '2026-02-14T10:20:00Z',
    updated_at: '2026-02-20T12:40:00Z',
  },
  {
    id: '9',
    org_id: 'demo-org',
    project_id: '7',
    project_name: 'Dish Media Conference Kit',
    line_item_id: 'li-9',
    order_number: 'ORD-2026-0148',
    status: 'order-entry-needed',
    product_name: 'Moleskine Classic Notebook + Custom Pen',
    quantity: 150,
    unit_price: 22.00,
    total: 3300,
    in_hands_date: '2026-04-18',
    ship_to: { street: '1401 Music Row', city: 'Nashville', state: 'TN', zip: '37212', country: 'USA' },
    payment_received: false,
    shipments: [],
    created_at: '2026-02-17T13:15:00Z',
    updated_at: '2026-02-20T10:05:00Z',
  },
  {
    id: '10',
    org_id: 'demo-org',
    project_id: '10',
    project_name: 'Locksmith Pro Branded Workwear',
    line_item_id: 'li-10',
    order_number: 'ORD-2026-0150',
    status: 'in-production',
    product_name: 'Custom Embroidered Patches',
    quantity: 250,
    unit_price: 8.50,
    total: 2125,
    in_hands_date: '2026-03-05',
    ship_to: { street: '2215 Sanders Rd', city: 'Northbrook', state: 'IL', zip: '60062', country: 'USA' },
    payment_received: false,
    shipments: [],
    created_at: '2026-02-18T16:00:00Z',
    updated_at: '2026-02-20T14:50:00Z',
  },
  {
    id: '11',
    org_id: 'demo-org',
    project_id: '2',
    project_name: 'Red Bull Summer Event Merch',
    line_item_id: 'li-11',
    order_number: 'ORD-2026-0146',
    status: 'order-entry-needed',
    product_name: 'Richardson 112 Trucker Cap',
    quantity: 300,
    unit_price: 18.50,
    total: 5550,
    in_hands_date: '2026-05-20',
    ship_to: { street: '600 12th Ave S', city: 'Nashville', state: 'TN', zip: '37203', country: 'USA' },
    payment_received: false,
    shipments: [],
    created_at: '2026-02-19T16:30:00Z',
    updated_at: '2026-02-20T09:00:00Z',
  },
  {
    id: '12',
    org_id: 'demo-org',
    project_id: '9',
    project_name: 'Hillsong Worship Tour Merch',
    line_item_id: 'li-12',
    order_number: 'ORD-2026-0134',
    salesforce_id: 'SF-00012341',
    status: 'shipped',
    product_name: 'Bella+Canvas 3001 Unisex Tee',
    quantity: 400,
    unit_price: 16.50,
    total: 6600,
    in_hands_date: '2026-03-28',
    ship_to: { street: '316 Southgate Ct', city: 'Brentwood', state: 'TN', zip: '37027', country: 'USA' },
    tracking_number: '1Z999AA10123456795',
    tracking_url: 'https://www.ups.com/track?tracknum=1Z999AA10123456795',
    carrier: 'UPS Ground',
    shipped_date: '2026-02-17',
    invoice_amount: 6600,
    payment_received: false,
    shipments: [{
      id: 'ship-12',
      order_id: '12',
      tracking_number: '1Z999AA10123456795',
      carrier: 'UPS',
      ship_date: '2026-02-17',
      estimated_arrival: '2026-02-20',
      status: 'delivered',
      items_shipped: 400,
    }],
    created_at: '2026-02-09T12:00:00Z',
    updated_at: '2026-02-17T16:20:00Z',
  },
  {
    id: '13',
    org_id: 'demo-org',
    project_id: '14',
    project_name: 'Locksmith Pro Q2 Safety Gear',
    line_item_id: 'li-13',
    order_number: 'ORD-2026-0139',
    salesforce_id: 'SF-00012343',
    status: 'in-production',
    product_name: 'Hi-Vis Safety Vest with Custom Logo',
    quantity: 180,
    unit_price: 24.00,
    total: 4320,
    in_hands_date: '2026-04-10',
    ship_to: { street: '2215 Sanders Rd', city: 'Northbrook', state: 'IL', zip: '60062', country: 'USA' },
    payment_received: false,
    shipments: [],
    created_at: '2026-02-13T10:45:00Z',
    updated_at: '2026-02-19T14:10:00Z',
  },
  {
    id: '14',
    org_id: 'demo-org',
    project_id: '5',
    project_name: 'Threadbird Artist Merch Drop',
    line_item_id: 'li-14',
    order_number: 'ORD-2026-0144',
    status: 'in-production',
    product_name: 'Custom All-Over Print Tote Bag',
    quantity: 120,
    unit_price: 18.00,
    total: 2160,
    in_hands_date: '2026-04-01',
    ship_to: { street: '1908 Chet Atkins Pl', city: 'Nashville', state: 'TN', zip: '37212', country: 'USA' },
    payment_received: false,
    shipments: [],
    created_at: '2026-02-16T15:30:00Z',
    updated_at: '2026-02-20T11:00:00Z',
  },
  {
    id: '15',
    org_id: 'demo-org',
    project_id: '6',
    project_name: 'Green Beret Gala Gift Bags',
    line_item_id: 'li-15',
    order_number: 'ORD-2026-0143',
    salesforce_id: 'SF-00012344',
    status: 'in-production',
    product_name: 'Custom Canvas Tote + YETI Rambler 20oz',
    quantity: 500,
    unit_price: 38.00,
    total: 19000,
    in_hands_date: '2026-05-10',
    ship_to: { street: '400 Cobb Pkwy SE', city: 'Marietta', state: 'GA', zip: '30060', country: 'USA' },
    payment_received: false,
    shipments: [],
    created_at: '2026-02-15T14:00:00Z',
    updated_at: '2026-02-19T11:30:00Z',
  },
  {
    id: '16',
    org_id: 'demo-org',
    project_id: '1',
    project_name: 'Raisin Canes Q2 Uniform Rollout',
    line_item_id: 'li-16',
    order_number: 'ORD-2026-0136',
    salesforce_id: 'SF-00012346',
    status: 'ready-for-invoicing',
    product_name: 'Richardson 112 Trucker Cap',
    quantity: 430,
    unit_price: 16.80,
    total: 7224,
    in_hands_date: '2026-04-15',
    ship_to: { street: '3520 General De Gaulle Dr', city: 'New Orleans', state: 'LA', zip: '70114', country: 'USA' },
    tracking_number: '1Z999AA10123456788',
    tracking_url: 'https://www.ups.com/track?tracknum=1Z999AA10123456788',
    carrier: 'UPS Ground',
    shipped_date: '2026-02-15',
    invoice_amount: 7224,
    payment_received: false,
    shipments: [{
      id: 'ship-16',
      order_id: '16',
      tracking_number: '1Z999AA10123456788',
      carrier: 'UPS',
      ship_date: '2026-02-15',
      estimated_arrival: '2026-02-18',
      status: 'delivered',
      items_shipped: 430,
    }],
    created_at: '2026-02-11T09:00:00Z',
    updated_at: '2026-02-18T13:45:00Z',
  },
  {
    id: '17',
    org_id: 'demo-org',
    project_id: '12',
    project_name: 'Threadbird Studio Launch Collection',
    line_item_id: 'li-17',
    order_number: 'ORD-2026-0151',
    status: 'order-entry-needed',
    product_name: 'Gildan 18500 Heavy Blend Hoodie',
    quantity: 85,
    unit_price: 38.50,
    total: 3272.50,
    in_hands_date: '2026-05-15',
    ship_to: { street: '1908 Chet Atkins Pl', city: 'Nashville', state: 'TN', zip: '37212', country: 'USA' },
    payment_received: false,
    shipments: [],
    created_at: '2026-02-20T10:30:00Z',
    updated_at: '2026-02-20T15:20:00Z',
  },
  {
    id: '18',
    org_id: 'demo-org',
    project_id: '4',
    project_name: 'Progressive Regional Polos',
    line_item_id: 'li-18',
    order_number: 'ORD-2026-0130',
    salesforce_id: 'SF-00012338',
    status: 'invoiced',
    product_name: 'Port Authority K500 Silk Touch Polo',
    quantity: 110,
    unit_price: 28.50,
    total: 3135,
    in_hands_date: '2026-03-10',
    ship_to: { street: '6300 Wilson Mills Rd', city: 'Cleveland', state: 'OH', zip: '44143', country: 'USA' },
    tracking_number: '1Z999AA10123456780',
    tracking_url: 'https://www.ups.com/track?tracknum=1Z999AA10123456780',
    carrier: 'UPS Ground',
    shipped_date: '2026-02-12',
    invoice_amount: 3135,
    payment_received: true,
    shipments: [{
      id: 'ship-18',
      order_id: '18',
      tracking_number: '1Z999AA10123456780',
      carrier: 'UPS',
      ship_date: '2026-02-12',
      estimated_arrival: '2026-02-15',
      status: 'delivered',
      items_shipped: 110,
    }],
    invoice_pdf_url: '/demo/docs/INV-2026-0130.pdf',
    created_at: '2026-02-05T11:15:00Z',
    updated_at: '2026-02-16T14:00:00Z',
  },
  {
    id: '19',
    org_id: 'demo-org',
    project_id: '10',
    project_name: 'Locksmith Pro Branded Workwear',
    line_item_id: 'li-19',
    order_number: 'ORD-2026-0132',
    salesforce_id: 'SF-00012339',
    status: 'shipped',
    product_name: 'Gildan 5000 Heavy Cotton Tee',
    quantity: 250,
    unit_price: 14.20,
    total: 3550,
    in_hands_date: '2026-03-05',
    ship_to: { street: '2215 Sanders Rd', city: 'Northbrook', state: 'IL', zip: '60062', country: 'USA' },
    tracking_number: '1Z999AA10123456782',
    tracking_url: 'https://www.ups.com/track?tracknum=1Z999AA10123456782',
    carrier: 'UPS Ground',
    shipped_date: '2026-02-14',
    invoice_amount: 3550,
    payment_received: false,
    shipments: [{
      id: 'ship-19',
      order_id: '19',
      tracking_number: '1Z999AA10123456782',
      carrier: 'UPS',
      ship_date: '2026-02-14',
      estimated_arrival: '2026-02-17',
      status: 'delivered',
      items_shipped: 250,
    }],
    created_at: '2026-02-06T14:20:00Z',
    updated_at: '2026-02-14T16:45:00Z',
  },
  {
    id: '20',
    org_id: 'demo-org',
    project_id: '14',
    project_name: 'Locksmith Pro Q2 Safety Gear',
    line_item_id: 'li-20',
    order_number: 'ORD-2026-0140',
    status: 'in-production',
    product_name: 'Custom Work Gloves with Logo',
    quantity: 300,
    unit_price: 12.50,
    total: 3750,
    in_hands_date: '2026-04-10',
    ship_to: { street: '2215 Sanders Rd', city: 'Northbrook', state: 'IL', zip: '60062', country: 'USA' },
    payment_received: false,
    shipments: [],
    created_at: '2026-02-14T11:00:00Z',
    updated_at: '2026-02-20T10:20:00Z',
  },
  {
    id: '21',
    org_id: 'demo-org',
    project_id: '9',
    project_name: 'Hillsong Worship Tour Merch',
    line_item_id: 'li-21',
    order_number: 'ORD-2026-0137',
    salesforce_id: 'SF-00012347',
    status: 'ready-for-invoicing',
    product_name: 'Custom Enamel Pin Set',
    quantity: 600,
    unit_price: 6.50,
    total: 3900,
    in_hands_date: '2026-03-28',
    ship_to: { street: '316 Southgate Ct', city: 'Brentwood', state: 'TN', zip: '37027', country: 'USA' },
    tracking_number: '1Z999AA10123456792',
    tracking_url: 'https://www.ups.com/track?tracknum=1Z999AA10123456792',
    carrier: 'UPS Ground',
    shipped_date: '2026-02-16',
    invoice_amount: 3900,
    payment_received: false,
    shipments: [{
      id: 'ship-21',
      order_id: '21',
      tracking_number: '1Z999AA10123456792',
      carrier: 'UPS',
      ship_date: '2026-02-16',
      estimated_arrival: '2026-02-19',
      status: 'delivered',
      items_shipped: 600,
    }],
    created_at: '2026-02-12T15:45:00Z',
    updated_at: '2026-02-19T12:00:00Z',
  },
  {
    id: '22',
    org_id: 'demo-org',
    project_id: '2',
    project_name: 'Red Bull Summer Event Merch',
    line_item_id: 'li-22',
    order_number: 'ORD-2026-0152',
    status: 'order-entry-needed',
    product_name: 'YETI Rambler 20oz Tumbler',
    quantity: 200,
    unit_price: 32.00,
    total: 6400,
    in_hands_date: '2026-05-20',
    ship_to: { street: '600 12th Ave S', city: 'Nashville', state: 'TN', zip: '37203', country: 'USA' },
    payment_received: false,
    shipments: [],
    created_at: '2026-02-20T11:45:00Z',
    updated_at: '2026-02-20T14:30:00Z',
  },
  {
    id: '23',
    org_id: 'demo-org',
    project_id: '3',
    project_name: 'Nashville Sounds 2026 Season Swag',
    line_item_id: 'li-23',
    order_number: 'ORD-2026-0131',
    salesforce_id: 'SF-00012348',
    status: 'invoiced',
    product_name: 'Bella+Canvas 3001 Unisex Tee',
    quantity: 150,
    unit_price: 15.50,
    total: 2325,
    in_hands_date: '2026-03-25',
    ship_to: { street: '401 Jackson St', city: 'Nashville', state: 'TN', zip: '37219', country: 'USA' },
    tracking_number: '1Z999AA10123456785',
    tracking_url: 'https://www.ups.com/track?tracknum=1Z999AA10123456785',
    carrier: 'UPS Ground',
    shipped_date: '2026-02-13',
    invoice_amount: 2325,
    payment_received: true,
    shipments: [{
      id: 'ship-23',
      order_id: '23',
      tracking_number: '1Z999AA10123456785',
      carrier: 'UPS',
      ship_date: '2026-02-13',
      estimated_arrival: '2026-02-16',
      status: 'delivered',
      items_shipped: 150,
    }],
    invoice_pdf_url: '/demo/docs/INV-2026-0131.pdf',
    created_at: '2026-02-07T10:30:00Z',
    updated_at: '2026-02-17T13:15:00Z',
  },
  {
    id: '24',
    org_id: 'demo-org',
    project_id: '5',
    project_name: 'Threadbird Artist Merch Drop',
    line_item_id: 'li-24',
    order_number: 'ORD-2026-0153',
    status: 'in-production',
    product_name: 'Custom Vinyl Sticker Sheets',
    quantity: 500,
    unit_price: 4.20,
    total: 2100,
    in_hands_date: '2026-04-01',
    ship_to: { street: '1908 Chet Atkins Pl', city: 'Nashville', state: 'TN', zip: '37212', country: 'USA' },
    payment_received: false,
    shipments: [],
    created_at: '2026-02-20T13:00:00Z',
    updated_at: '2026-02-20T16:10:00Z',
  },
  {
    id: '25',
    org_id: 'demo-org',
    project_id: '13',
    project_name: 'Red Bull Holiday Gift Box',
    line_item_id: 'li-25',
    order_number: 'ORD-2026-0154',
    status: 'in-production',
    product_name: 'Custom Tech Organizer Pouch',
    quantity: 250,
    unit_price: 22.50,
    total: 5625,
    in_hands_date: '2026-11-20',
    ship_to: { street: '600 12th Ave S', city: 'Nashville', state: 'TN', zip: '37203', country: 'USA' },
    payment_received: false,
    shipments: [],
    created_at: '2026-02-20T14:15:00Z',
    updated_at: '2026-02-20T16:50:00Z',
  },
];

export function getDemoOrders(orgId?: string): DemoOrder[] {
  // Default org or no orgId: return main demo data
  if (!orgId || orgId === 'demo-org' || orgId === 'org-85-supply') {
    return DEMO_ORDERS;
  }
  // Other orgs: fetch from admin demo data
  const { getDemoOrgOrders } = require('@/lib/demo/admin-demo-data');
  return getDemoOrgOrders(orgId);
}

// ===== DEMO PROGRAMS =====

export type DemoProgram = Program;

const DEMO_PROGRAMS: DemoProgram[] = [
  {
    id: '1',
    org_id: 'demo-org',
    client_id: '2',
    client_name: 'Progressive Insurance',
    name: 'Progressive Polo Program',
    type: 'employee-store',
    status: 'active',
    budget_total: 180000,
    budget_spent: 122400,
    budget_remaining: 57600,
    locations_count: 8,
    approval_required: true,
    auto_reorder: false,
    notes: '8 regional offices, quarterly orders',
    created_at: '2025-10-22T09:15:00Z',
    updated_at: '2026-02-20T11:30:00Z',
  },
  {
    id: '2',
    org_id: 'demo-org',
    client_id: '1',
    client_name: 'Raisin Canes',
    name: 'Raisin Canes Q2 Uniforms',
    type: 'uniform-program',
    status: 'active',
    budget_total: 250000,
    budget_spent: 170000,
    budget_remaining: 80000,
    locations_count: 43,
    approval_required: false,
    auto_reorder: true,
    reorder_frequency: 'Quarterly',
    notes: '43 locations, drop-ship to each store',
    created_at: '2025-11-15T10:30:00Z',
    updated_at: '2026-02-20T14:45:00Z',
  },
  {
    id: '3',
    org_id: 'demo-org',
    client_id: '3',
    client_name: 'Nashville Sounds',
    name: 'Nashville Sounds 2026 Season',
    type: 'event-merch',
    status: 'active',
    budget_total: 75000,
    budget_spent: 48000,
    budget_remaining: 27000,
    locations_count: 4,
    approval_required: false,
    auto_reorder: false,
    notes: 'Stadium + 3 retail locations',
    created_at: '2025-12-01T13:20:00Z',
    updated_at: '2026-02-19T16:20:00Z',
  },
];

export function getDemoPrograms(): DemoProgram[] {
  return DEMO_PROGRAMS;
}

// ===== DEMO COMMISSION RECORDS =====

export type DemoCommissionRecord = CommissionRecord;

const DEMO_COMMISSION_RECORDS: DemoCommissionRecord[] = [
  {
    id: '1',
    org_id: 'demo-org',
    project_id: '10',
    project_name: 'Locksmith Pro Branded Workwear',
    client_name: 'Locksmith Pro USA',
    period: '2026-02',
    gross_revenue: 75000,
    gross_profit: 26250,
    profit_margin_percent: 35,
    owner_share: 13125,
    partner_commission: 5250,
    source: 'program',
    status: 'confirmed',
    created_at: '2026-02-17T16:00:00Z',
  },
  {
    id: '2',
    org_id: 'demo-org',
    project_id: '2',
    project_name: 'Red Bull Summer Event Merch',
    client_name: 'Red Bull Nashville',
    period: '2026-02',
    gross_revenue: 67500,
    gross_profit: 25650,
    profit_margin_percent: 38,
    owner_share: 12825,
    partner_commission: 4725,
    source: 'direct',
    status: 'pending',
    created_at: '2026-02-19T16:45:00Z',
  },
  {
    id: '3',
    org_id: 'demo-org',
    project_id: '9',
    project_name: 'Hillsong Worship Tour Merch',
    client_name: 'Hillsong Church Nashville',
    period: '2026-02',
    gross_revenue: 52000,
    gross_profit: 16640,
    profit_margin_percent: 32,
    owner_share: 8320,
    partner_commission: 3640,
    source: 'direct',
    status: 'confirmed',
    created_at: '2026-02-19T12:30:00Z',
  },
  {
    id: '4',
    org_id: 'demo-org',
    project_id: '4',
    project_name: 'Progressive Regional Polos',
    client_name: 'Progressive Insurance',
    period: '2026-01',
    gross_revenue: 22000,
    gross_profit: 7920,
    profit_margin_percent: 36,
    owner_share: 3960,
    partner_commission: 1540,
    source: 'program',
    status: 'paid',
    created_at: '2026-02-18T15:30:00Z',
  },
  {
    id: '5',
    org_id: 'demo-org',
    project_id: '5',
    project_name: 'Threadbird Artist Merch Drop',
    client_name: 'Threadbird Studios',
    period: '2026-02',
    gross_revenue: 18750,
    gross_profit: 6375,
    profit_margin_percent: 34,
    owner_share: 3187.50,
    partner_commission: 1312.50,
    source: 'direct',
    status: 'pending',
    created_at: '2026-02-20T11:25:00Z',
  },
  {
    id: '6',
    org_id: 'demo-org',
    project_id: '6',
    project_name: 'Green Beret Gala Gift Bags',
    client_name: 'Green Beret Foundation',
    period: '2026-01',
    gross_revenue: 15500,
    gross_profit: 4805,
    profit_margin_percent: 31,
    owner_share: 2402.50,
    partner_commission: 1085,
    source: 'referral',
    status: 'confirmed',
    created_at: '2026-02-19T10:15:00Z',
  },
  {
    id: '7',
    org_id: 'demo-org',
    project_id: '3',
    project_name: 'Nashville Sounds 2026 Season Swag',
    client_name: 'Nashville Sounds',
    period: '2026-01',
    gross_revenue: 8500,
    gross_profit: 2975,
    profit_margin_percent: 35,
    owner_share: 1487.50,
    partner_commission: 595,
    source: 'referral',
    status: 'paid',
    created_at: '2026-02-20T09:10:00Z',
  },
  {
    id: '8',
    org_id: 'demo-org',
    project_id: '12',
    project_name: 'Threadbird Studio Launch Collection',
    client_name: 'Threadbird Studios',
    period: '2026-02',
    gross_revenue: 11400,
    gross_profit: 3876,
    profit_margin_percent: 34,
    owner_share: 1938,
    partner_commission: 798,
    source: 'direct',
    status: 'pending',
    created_at: '2026-02-20T12:20:00Z',
  },
];

export function getDemoCommissionRecords(): DemoCommissionRecord[] {
  return DEMO_COMMISSION_RECORDS;
}

// ===== DEMO DASHBOARD STATS =====

export type DemoStatCardData = StatCardData;

const DEMO_STATS: DemoStatCardData[] = [
  {
    label: 'Pipeline Value',
    value: '$385,450',
    change: '+23.4%',
    changeType: 'positive',
    icon: 'TrendingUp',
  },
  {
    label: 'Active Projects',
    value: '12',
    change: '+3',
    changeType: 'positive',
    icon: 'Kanban',
  },
  {
    label: 'Orders In Production',
    value: '6',
    change: '-1',
    changeType: 'negative',
    icon: 'Package',
  },
  {
    label: 'Monthly Revenue',
    value: '$131,000',
    change: '+142%',
    changeType: 'positive',
    icon: 'DollarSign',
  },
  {
    label: 'Avg Quote Time',
    value: '47 sec',
    change: '-96%',
    changeType: 'positive',
    icon: 'Clock',
  },
  {
    label: 'Client Portal Views',
    value: '234',
    change: '+67%',
    changeType: 'positive',
    icon: 'Eye',
  },
];

export function getDemoStats(): DemoStatCardData[] {
  return DEMO_STATS;
}

// ===== DEMO RECENT ACTIVITY =====

export type DemoRecentActivity = RecentActivity;

const DEMO_RECENT_ACTIVITY: DemoRecentActivity[] = [
  {
    id: '1',
    action: 'New project request',
    detail: 'Raisin Canes Q2 Uniform Rollout submitted via website',
    timestamp: '12 min ago',
    type: 'project',
  },
  {
    id: '2',
    action: 'Order shipped',
    detail: 'ORD-2026-0138 (Nashville Sounds caps) shipped via UPS',
    timestamp: '1 hr ago',
    type: 'order',
  },
  {
    id: '3',
    action: 'Artwork received',
    detail: 'Red Bull Nashville uploaded front chest artwork for summer tees',
    timestamp: '2 hrs ago',
    type: 'project',
  },
  {
    id: '4',
    action: 'Client approved',
    detail: 'Progressive Insurance confirmed Regional Polos order ($22,000)',
    timestamp: '3 hrs ago',
    type: 'project',
  },
  {
    id: '5',
    action: 'Quote sent',
    detail: 'Threadbird Artist Merch Drop quote shared via client portal',
    timestamp: '5 hrs ago',
    type: 'project',
  },
  {
    id: '6',
    action: 'Commission confirmed',
    detail: '$9,170 partner commission confirmed for January 2026',
    timestamp: '8 hrs ago',
    type: 'commission',
  },
  {
    id: '7',
    action: 'New client added',
    detail: 'Austin Tech Summit added as client (Events/Conferences)',
    timestamp: '1 day ago',
    type: 'client',
  },
  {
    id: '8',
    action: 'Program budget alert',
    detail: 'Raisin Canes Uniform Program at 68% of Q2 budget',
    timestamp: '1 day ago',
    type: 'system',
  },
];

export function getDemoRecentActivity(): DemoRecentActivity[] {
  return DEMO_RECENT_ACTIVITY;
}

// ===== DEMO QUICK ACTIONS =====

export type DemoQuickAction = QuickAction;

const DEMO_QUICK_ACTIONS: DemoQuickAction[] = [
  {
    id: 'qa-1',
    label: 'New Project',
    description: 'Start a new project from scratch',
    href: '/dashboard/projects',
    icon: '➕',
  },
  {
    id: 'qa-2',
    label: 'Add Client',
    description: 'Register a new client company',
    href: '/dashboard/clients',
    icon: '👥',
  },
  {
    id: 'qa-3',
    label: 'Configure Matrix',
    description: 'Set up decoration pricing',
    href: '/dashboard/settings/matrices',
    icon: '⚙️',
  },
  {
    id: 'qa-4',
    label: 'View Commissions',
    description: 'Check revenue and payouts',
    href: '/dashboard/commissions',
    icon: '💰',
  },
];

export function getDemoQuickActions(): DemoQuickAction[] {
  return DEMO_QUICK_ACTIONS;
}

// ===== DASHBOARD STATS (FLAT OBJECT) =====

const DEMO_DASHBOARD_STATS: DashboardStats = {
  pipeline_value: 385450,
  pipeline_change: 23.4,
  active_projects: 12,
  active_projects_change: 3,
  orders_in_production: 6,
  orders_change: -1,
  monthly_revenue: 131000,
  monthly_revenue_change: 142,
  avg_quote_time_seconds: 47,
  quote_time_change: -96,
  portal_views: 234,
  portal_views_change: 67,
};

export function getDemoDashboardStats(): DashboardStats {
  return DEMO_DASHBOARD_STATS;
}

// ===== ANALYTICS DATA =====

const DEMO_PIPELINE_STAGES: PipelineStageValue[] = [
  { stage: 'Opportunity', project_count: 3, total_value: 23700 },
  { stage: 'Qualifying', project_count: 2, total_value: 37500 },
  { stage: 'Curating', project_count: 2, total_value: 63750 },
  { stage: 'In Design', project_count: 2, total_value: 77300 },
  { stage: 'Client Review', project_count: 5, total_value: 201200 },
  { stage: 'Confirmed', project_count: 4, total_value: 148600 },
];

export function getDemoPipelineStages(): PipelineStageValue[] {
  return DEMO_PIPELINE_STAGES;
}

const DEMO_REVENUE_TREND: RevenueDataPoint[] = [
  { month: 'Sep', revenue: 42000 },
  { month: 'Oct', revenue: 58000 },
  { month: 'Nov', revenue: 71000 },
  { month: 'Dec', revenue: 89000 },
  { month: 'Jan', revenue: 105000 },
  { month: 'Feb', revenue: 131000 },
];

export function getDemoRevenueTrend(): RevenueDataPoint[] {
  return DEMO_REVENUE_TREND;
}

const DEMO_TOP_CLIENTS: TopClient[] = [
  { company_name: 'Raisin Canes', total_revenue_ytd: 187000, projects_count: 8, avg_deal_size: 23375 },
  { company_name: 'Progressive Insurance', total_revenue_ytd: 142000, projects_count: 6, avg_deal_size: 23667 },
  { company_name: 'Red Bull Nashville', total_revenue_ytd: 128000, projects_count: 5, avg_deal_size: 25600 },
  { company_name: 'Threadbird Studios', total_revenue_ytd: 89000, projects_count: 4, avg_deal_size: 22250 },
  { company_name: 'Locksmith Pro USA', total_revenue_ytd: 78000, projects_count: 3, avg_deal_size: 26000 },
];

export function getDemoTopClients(): TopClient[] {
  return DEMO_TOP_CLIENTS;
}

export function getDemoAnalytics() {
  return {
    pipeline_stages: DEMO_PIPELINE_STAGES,
    revenue_trend: DEMO_REVENUE_TREND,
    top_clients: DEMO_TOP_CLIENTS,
    key_metrics: {
      avg_deal_size: 25697,
      win_rate: 72,
      avg_days_to_close: 14.3,
      projects_per_month: 8.2,
      client_retention: 94,
      quote_to_close_days: 4.1,
    },
  };
}

// ===== VENDORS =====

const DEMO_VENDORS: Vendor[] = [
  {
    id: 'vendor-1',
    org_id: 'org-1',
    name: 'Culture Studio',
    type: 'decorator',
    contact_name: 'Mike Torres',
    contact_email: 'mike@culturestudio.com',
    contact_phone: '(312) 555-0147',
    city: 'Chicago',
    state: 'IL',
    website_url: 'https://culturestudio.com',
    notes: 'Primary screen print decorator. Fast turnaround. Great with large runs.',
    contacts: [
      { id: 'vc-1', first_name: 'Mike', last_name: 'Torres', email: 'mike@culturestudio.com', phone: '(312) 555-0147', title: 'Account Manager' },
      { id: 'vc-2', first_name: 'Sarah', last_name: 'Kim', email: 'sarah@culturestudio.com', phone: '(312) 555-0148', title: 'Production Lead' },
    ],
    is_active: true,
    created_at: '2025-06-15T00:00:00Z',
    updated_at: '2026-01-10T00:00:00Z',
  },
  {
    id: 'vendor-2',
    org_id: 'org-1',
    name: 'Lightning Stitch',
    type: 'decorator',
    contact_name: 'Karen Wells',
    contact_email: 'karen@lightningstitch.com',
    contact_phone: '(214) 555-0293',
    city: 'Dallas',
    state: 'TX',
    website_url: 'https://lightningstitch.com',
    notes: 'Embroidery specialist. Best quality for left-chest logos and caps.',
    contacts: [
      { id: 'vc-3', first_name: 'Karen', last_name: 'Wells', email: 'karen@lightningstitch.com', phone: '(214) 555-0293', title: 'Owner' },
    ],
    is_active: true,
    created_at: '2025-06-15T00:00:00Z',
    updated_at: '2026-01-10T00:00:00Z',
  },
  {
    id: 'vendor-3',
    org_id: 'org-1',
    name: '33 Inc',
    type: 'decorator',
    contact_name: 'James Park',
    contact_email: 'james@33inc.com',
    contact_phone: '(310) 555-0188',
    city: 'Los Angeles',
    state: 'CA',
    notes: 'DTG and heat transfer specialist. Good for small/medium runs with complex art.',
    contacts: [],
    is_active: true,
    created_at: '2025-08-01T00:00:00Z',
    updated_at: '2026-02-01T00:00:00Z',
  },
  {
    id: 'vendor-4',
    org_id: 'org-1',
    name: 'S&S Activewear',
    type: 'supplier',
    contact_name: 'Account Rep',
    contact_email: 'orders@ssactivewear.com',
    contact_phone: '(800) 523-2155',
    city: 'Bolingbrook',
    state: 'IL',
    website_url: 'https://ssactivewear.com',
    notes: 'Primary blank supplier. Ships from 6 warehouses. Same-day shipping available.',
    contacts: [],
    is_active: true,
    created_at: '2025-03-01T00:00:00Z',
    updated_at: '2026-01-15T00:00:00Z',
  },
  {
    id: 'vendor-5',
    org_id: 'org-1',
    name: 'alphabroder',
    type: 'supplier',
    contact_name: 'Account Rep',
    contact_email: 'service@alphabroder.com',
    contact_phone: '(800) 523-4585',
    city: 'Trevose',
    state: 'PA',
    website_url: 'https://alphabroder.com',
    notes: 'Secondary blank supplier. Strong on polos and outerwear.',
    contacts: [],
    is_active: true,
    created_at: '2025-03-01T00:00:00Z',
    updated_at: '2026-01-15T00:00:00Z',
  },
];

export function getDemoVendors(): Vendor[] {
  return DEMO_VENDORS;
}

export function getDemoVendor(id: string): Vendor | undefined {
  return DEMO_VENDORS.find(v => v.id === id);
}

// ===== SETTINGS DATA =====

const DEMO_DECORATOR_MATRICES: DecoratorMatrixDisplay[] = [
  {
    id: 'mat-1',
    name: 'Culture Studio — Screen Print',
    method: 'Screen Print',
    tier_count: 6,
    color_counts: [1, 2, 3, 4],
    pricing_grid: {
      '1-24': { '1': 5.50, '2': 7.00, '3': 8.50, '4': 10.00 },
      '25-49': { '1': 3.75, '2': 4.50, '3': 5.25, '4': 6.00 },
      '50-99': { '1': 2.50, '2': 3.00, '3': 3.50, '4': 4.00 },
      '100-249': { '1': 1.75, '2': 2.25, '3': 2.75, '4': 3.25 },
      '250-499': { '1': 1.25, '2': 1.75, '3': 2.25, '4': 2.75 },
      '500+': { '1': 1.00, '2': 1.50, '3': 2.00, '4': 2.50 },
    },
  },
  {
    id: 'mat-2',
    name: 'Lightning Stitch — Embroidery',
    method: 'Embroidery',
    tier_count: 5,
    color_counts: [1, 2, 3],
    pricing_grid: {
      '1-11': { '1': 8.00, '2': 10.00, '3': 12.00 },
      '12-23': { '1': 5.50, '2': 6.50, '3': 7.50 },
      '24-47': { '1': 4.00, '2': 5.00, '3': 6.00 },
      '48-95': { '1': 3.00, '2': 4.00, '3': 5.00 },
      '96+': { '1': 2.50, '2': 3.50, '3': 4.50 },
    },
  },
  {
    id: 'mat-3',
    name: '33 Inc — Heat Transfer',
    method: 'Heat Transfer',
    tier_count: 4,
    color_counts: [1],
    pricing_grid: {
      '1-23': { '1': 6.00 },
      '24-47': { '1': 4.00 },
      '48-95': { '1': 3.00 },
      '96+': { '1': 2.00 },
    },
  },
  {
    id: 'mat-4',
    name: '33 Inc — DTG',
    method: 'DTG',
    tier_count: 5,
    color_counts: [1],
    pricing_grid: {
      '1-24': { '1': 12.00 },
      '25-49': { '1': 9.00 },
      '50-99': { '1': 7.50 },
      '100-249': { '1': 6.00 },
      '250+': { '1': 4.50 },
    },
  },
  {
    id: 'mat-5',
    name: 'Culture Studio — Embroidery',
    method: 'Embroidery',
    tier_count: 5,
    color_counts: [1, 2, 3],
    pricing_grid: {
      '1-11': { '1': 8.50, '2': 10.50, '3': 12.50 },
      '12-23': { '1': 6.00, '2': 7.00, '3': 8.00 },
      '24-47': { '1': 4.50, '2': 5.50, '3': 6.50 },
      '48-95': { '1': 3.50, '2': 4.50, '3': 5.50 },
      '96+': { '1': 3.00, '2': 4.00, '3': 5.00 },
    },
  },
];

export function getDemoDecoratorMatrices(): DecoratorMatrixDisplay[] {
  return DEMO_DECORATOR_MATRICES;
}

const DEMO_PRODUCTS_LIST: ProductDisplay[] = [
  { id: 'prod-1', name: 'Bella+Canvas 3001 Unisex Tee', product_type: 'contract', category: 'Apparel', supplier: 'S&S Activewear', blank_cost_min: 2.50, blank_cost_max: 4.75, is_active: true },
  { id: 'prod-2', name: 'Port Authority K500 Polo', product_type: 'contract', category: 'Apparel', supplier: 'alphabroder', blank_cost_min: 12.00, blank_cost_max: 18.50, is_active: true },
  { id: 'prod-3', name: 'Carhartt Duck Detroit Jacket', product_type: 'contract', category: 'Apparel', supplier: 'Carhartt', blank_cost_min: 65.00, blank_cost_max: 89.00, is_active: true },
  { id: 'prod-4', name: 'YETI Rambler 20oz', product_type: 'all-in', category: 'Drinkware', supplier: 'YETI', blank_cost_min: 0, blank_cost_max: 0, vendor_cost_min: 22.00, vendor_cost_max: 28.00, is_active: true },
  { id: 'prod-5', name: 'Moleskine Classic Notebook', product_type: 'all-in', category: 'Office', supplier: 'Moleskine', blank_cost_min: 0, blank_cost_max: 0, vendor_cost_min: 8.50, vendor_cost_max: 14.00, is_active: true },
  { id: 'prod-6', name: 'Nike Swoosh Performance Cap', product_type: 'contract', category: 'Apparel', supplier: 'Nike', blank_cost_min: 10.00, blank_cost_max: 16.00, is_active: true },
  { id: 'prod-7', name: 'Gildan 5000 Heavy Cotton Tee', product_type: 'contract', category: 'Apparel', supplier: 'Gildan', blank_cost_min: 2.00, blank_cost_max: 3.50, is_active: true },
  { id: 'prod-8', name: 'Gildan 18500 Heavy Blend Hoodie', product_type: 'contract', category: 'Apparel', supplier: 'Gildan', blank_cost_min: 8.50, blank_cost_max: 14.00, is_active: true },
  { id: 'prod-9', name: 'Richardson 112 Trucker Cap', product_type: 'contract', category: 'Apparel', supplier: 'Richardson', blank_cost_min: 4.00, blank_cost_max: 6.50, is_active: true },
  { id: 'prod-10', name: 'Comfort Colors 1717 Garment-Dyed Tee', product_type: 'contract', category: 'Apparel', supplier: 'Comfort Colors', blank_cost_min: 4.50, blank_cost_max: 7.00, is_active: true },
];

export function getDemoProductsList(): ProductDisplay[] {
  return DEMO_PRODUCTS_LIST;
}

// ===== FULL PRODUCT OBJECTS (for product detail/edit views) =====

const DEMO_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    org_id: 'demo-org',
    name: 'Bella+Canvas 3001 Unisex Jersey Tee',
    internal_sku: '3001',
    product_type: 'contract',
    category: 'short-sleeve-tees',
    description: 'Ultra-soft, premium unisex tee. Side-seamed construction with a relaxed, retail fit.',
    primary_image_url: '/images/demo/bc-3001-black.jpg',
    additional_images: ['/images/demo/bc-3001-white.jpg', '/images/demo/bc-3001-red.jpg'],
    available_colors: [
      { name: 'Black', hex: '#000000', images: [{ url: '/images/demo/bc-3001-black.jpg', is_primary: true }, { url: '/images/demo/bc-3001-black-back.jpg', is_primary: false }] },
      { name: 'White', hex: '#FFFFFF', images: [{ url: '/images/demo/bc-3001-white.jpg', is_primary: true }] },
      { name: 'Red', hex: '#CC0000' },
      { name: 'Navy', hex: '#1B2A4A' },
      { name: 'Heather Grey', hex: '#9CA3AF' },
    ],
    available_sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    blank_costs: [
      { min_quantity: 24, max_quantity: 49, cost_per_unit: 4.75 },
      { min_quantity: 50, max_quantity: 99, cost_per_unit: 3.85 },
      { min_quantity: 100, max_quantity: 249, cost_per_unit: 3.25 },
      { min_quantity: 250, max_quantity: 499, cost_per_unit: 2.90 },
      { min_quantity: 500, max_quantity: 9999, cost_per_unit: 2.50 },
    ],
    applicable_decorations: ['screen-print', 'dtg', 'heat-transfer', 'sublimation'],
    decoration_locations: [
      { id: 'dloc-1-1', location_name: 'Front Chest', placeholder_run_charge: 0, placeholder_setup_charge: 20 },
      { id: 'dloc-1-2', location_name: 'Full Back', placeholder_run_charge: 0, placeholder_setup_charge: 20 },
      { id: 'dloc-1-3', location_name: 'Left Sleeve', placeholder_run_charge: 0.50, placeholder_setup_charge: 15 },
    ],
    supplier_name: 'S&S Activewear',
    all_in_price_breaks: [
      { min_quantity: 25, max_quantity: 49, list_price: 12.50, price_code: 'C' as PriceCode, net_cost: 6.88 },
      { min_quantity: 50, max_quantity: 99, list_price: 10.00, price_code: 'C' as PriceCode, net_cost: 5.50 },
      { min_quantity: 100, max_quantity: 249, list_price: 8.50, price_code: 'D' as PriceCode, net_cost: 4.89 },
      { min_quantity: 250, max_quantity: 999, list_price: 7.00, price_code: 'E' as PriceCode, net_cost: 4.20 },
    ],
    setup_cost_per_color: 50,
    setup_sale_per_color: 75,
    is_active: true,
    show_on_website: true,
    sort_order: 0,
    created_at: '2025-10-01T10:00:00Z',
    updated_at: '2026-02-15T14:30:00Z',
  },
  {
    id: 'prod-7',
    org_id: 'demo-org',
    name: 'Gildan 5000 Heavy Cotton Tee',
    internal_sku: '5000',
    product_type: 'contract',
    category: 'short-sleeve-tees',
    description: 'Classic heavy cotton tee. Durable, preshrunk jersey knit.',
    primary_image_url: '/images/demo/gildan-5000-black.jpg',
    additional_images: [],
    available_colors: [
      { name: 'Black', hex: '#000000', images: [{ url: '/images/demo/gildan-5000-black.jpg', is_primary: true }] },
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Red', hex: '#CC0000' },
      { name: 'Navy', hex: '#1B2A4A' },
    ],
    available_sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    blank_costs: [
      { min_quantity: 24, max_quantity: 49, cost_per_unit: 3.50 },
      { min_quantity: 50, max_quantity: 99, cost_per_unit: 2.95 },
      { min_quantity: 100, max_quantity: 499, cost_per_unit: 2.50 },
      { min_quantity: 500, max_quantity: 9999, cost_per_unit: 2.25 },
    ],
    applicable_decorations: ['screen-print', 'dtg', 'heat-transfer'],
    decoration_locations: [
      { id: 'dloc-7-1', location_name: 'Front Chest', placeholder_run_charge: 0, placeholder_setup_charge: 20 },
      { id: 'dloc-7-2', location_name: 'Full Back', placeholder_run_charge: 0, placeholder_setup_charge: 20 },
    ],
    supplier_name: 'Gildan',
    is_active: true,
    show_on_website: true,
    sort_order: 6,
    created_at: '2025-09-15T09:00:00Z',
    updated_at: '2026-02-10T11:00:00Z',
  },
  {
    id: 'prod-2',
    org_id: 'demo-org',
    name: 'Port Authority K500 Polo',
    internal_sku: 'K500',
    product_type: 'contract',
    category: 'polos',
    description: 'Silk Touch polo with a flat knit collar and three-button placket.',
    primary_image_url: '/images/demo/pa-k500-navy.jpg',
    additional_images: [],
    available_colors: [
      { name: 'Navy', hex: '#1B2A4A' },
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Black', hex: '#000000' },
    ],
    available_sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    blank_costs: [
      { min_quantity: 24, max_quantity: 49, cost_per_unit: 18.50 },
      { min_quantity: 50, max_quantity: 99, cost_per_unit: 15.00 },
      { min_quantity: 100, max_quantity: 499, cost_per_unit: 12.00 },
    ],
    applicable_decorations: ['embroidery', 'screen-print', 'heat-transfer'],
    decoration_locations: [
      { id: 'dloc-2-1', location_name: 'Left Chest', placeholder_run_charge: 0, placeholder_setup_charge: 75 },
      { id: 'dloc-2-2', location_name: 'Right Sleeve', placeholder_run_charge: 0, placeholder_setup_charge: 50 },
    ],
    supplier_name: 'alphabroder',
    is_active: true,
    show_on_website: true,
    sort_order: 1,
    created_at: '2025-10-05T10:00:00Z',
    updated_at: '2026-02-12T09:30:00Z',
  },
];

export function getDemoProduct(id: string): Product | undefined {
  return DEMO_PRODUCTS.find(p => p.id === id);
}

export function getDemoProductsFull(): Product[] {
  return DEMO_PRODUCTS;
}

// ===== AI PRODUCT SCRAPER — MOCK DATA =====

export function getScrapedProductDemo(): ScrapedProductData {
  return {
    source_url: 'https://www.ssactivewear.com/p/bella-canvas/3001',
    product_name: 'Bella+Canvas 3001 Unisex Jersey Tee',
    description: 'Ultra-soft, premium unisex tee crafted from 100% combed and ring-spun cotton. Side-seamed construction eliminates torque for a clean, retail fit. Perfect for screen print, DTG, and heat transfer decoration.',
    original_description: 'BELLA+CANVAS 3001 Unisex Jersey Short Sleeve Tee. 4.2 oz., 100% Airlume combed and ring-spun cotton, 32 singles. Unisex sizing. Side-seamed. Retail fit.',
    images: [
      '/images/demo/scrape-bc3001-1.jpg',
      '/images/demo/scrape-bc3001-2.jpg',
      '/images/demo/scrape-bc3001-3.jpg',
      '/images/demo/scrape-bc3001-4.jpg',
    ],
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Athletic Heather', hex: '#9CA3AF' },
      { name: 'True Royal', hex: '#1D4ED8' },
      { name: 'Red', hex: '#DC2626' },
      { name: 'Navy', hex: '#1E3A5F' },
      { name: 'Soft Pink', hex: '#F9A8D4' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    specs: {
      'Material': '100% Airlume combed and ring-spun cotton',
      'Weight': '4.2 oz',
      'Fit': 'Retail fit, unisex sizing',
      'Construction': 'Side-seamed, tear-away label',
      'Neck': 'Crew neck',
    },
    supplier_name: 'Bella+Canvas',
    supplier_sku: '3001',
    msrp: 6.82,
  };
}

export interface DemoTeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

const DEMO_TEAM_MEMBERS: DemoTeamMember[] = [
  { id: 'team-1', name: 'Trevor Sarver', email: 'trevor@85supply.com', role: 'Owner', status: 'active' },
  { id: 'team-2', name: 'Tyler Mitchell', email: 'tyler@boundless.com', role: 'Production', status: 'active' },
  { id: 'team-3', name: 'Matt Rodriguez', email: 'matt@boundless.com', role: 'Sales', status: 'active' },
];

export function getDemoTeamMembers(): DemoTeamMember[] {
  return DEMO_TEAM_MEMBERS;
}

// ===== ROI CALCULATOR (SIGNATURE ELEMENT) =====

export const DEFAULT_CALCULATOR_INPUTS: CalculatorInputs = {
  projectsPerMonth: 20,
  avgDealValue: 8500,
  currentCloseRate: 22,
  hoursPerQuote: 3.5,
  hourlyValue: 65,
  timeToQuote: '48 hours',
  lostDealsToSpeed: 3,
};

/**
 * Calculate ROI results from inputs
 *
 * FORMULAS (from Creative Brief):
 * - Quoting Labor Cost = projects_per_month × hours_per_quote × hourly_value
 * - Deals Lost to Speed = lost_deals_to_speed × deal_value
 * - Pipeline Velocity Lost = Map time-to-quote to days, then: pipeline_days × projects_per_month × 0.15
 *   - Time-to-quote mapping: "Same day" = 2 days, "24 hours" = 3 days, "48 hours" = 5 days, "3-5 days" = 7 days, "1 week+" = 10 days
 * - With BrandOps:
 *   - Projected close rate = current + 8%
 *   - Projected monthly revenue = projects_per_month × deal_value × new_close_rate
 *   - Quoting time saved = projects_per_month × hours_per_quote
 * - Annual Revenue Impact = (projected_monthly_revenue - current_monthly_revenue + labor_cost_saved + deals_recovered) × 12
 *   - current_monthly_revenue = projects_per_month × deal_value × current_close_rate
 *   - labor_cost_saved = quoting_labor_cost
 *   - deals_recovered = deals_lost_to_speed
 * - ROI Multiple = annual_impact / (subscription_cost × 12) where subscription_cost = £499/mo
 */
export function calculateROI(inputs: CalculatorInputs): CalculatorResults {
  const {
    projectsPerMonth,
    avgDealValue,
    currentCloseRate,
    hoursPerQuote,
    hourlyValue,
    timeToQuote,
    lostDealsToSpeed,
  } = inputs;

  // Convert close rate from percentage to decimal
  const currentCloseRateDecimal = currentCloseRate / 100;

  // Card 1: Quoting Labor Cost
  const quotingLaborCost = projectsPerMonth * hoursPerQuote * hourlyValue;

  // Card 2: Deals Lost to Speed
  const dealsLostToSpeed = lostDealsToSpeed * avgDealValue;

  // Card 3: Pipeline Velocity Lost
  const timeToQuoteMap: Record<string, number> = {
    'Same day': 2,
    '24 hours': 3,
    '48 hours': 5,
    '3-5 days': 7,
    '1 week+': 10,
  };
  const pipelineDays = timeToQuoteMap[timeToQuote] || 5;
  const pipelineVelocityLost = pipelineDays * projectsPerMonth * 0.15 * avgDealValue;

  // Card 4: With BrandOps
  const projectedCloseRate = currentCloseRate + 8; // Add 8 percentage points
  const projectedCloseRateDecimal = projectedCloseRate / 100;
  const projectedMonthlyRevenue = projectsPerMonth * avgDealValue * projectedCloseRateDecimal;
  const quotingTimeSaved = projectsPerMonth * hoursPerQuote;

  // Card 5: Annual Revenue Impact
  const currentMonthlyRevenue = projectsPerMonth * avgDealValue * currentCloseRateDecimal;
  const laborCostSaved = quotingLaborCost;
  const dealsRecovered = dealsLostToSpeed;

  const monthlyImpact =
    (projectedMonthlyRevenue - currentMonthlyRevenue) +
    laborCostSaved +
    dealsRecovered;

  const annualRevenueImpact = monthlyImpact * 12;

  const subscriptionCost = 499; // £499/mo Growth tier
  const roiMultiple = annualRevenueImpact / (subscriptionCost * 12);

  return {
    quotingLaborCost,
    dealsLostToSpeed,
    pipelineVelocityLost,
    pipelineDays,
    withBrandOps: {
      projectedCloseRate,
      projectedMonthlyRevenue,
      quotingTimeSaved,
      timeToQuote: '10 minutes',
    },
    annualRevenueImpact,
    roiMultiple,
    currentMonthlyRevenue,
    subscriptionCost,
  };
}

export function getDemoCalculatorDefaults(): CalculatorInputs {
  return DEFAULT_CALCULATOR_INPUTS;
}

export function getDemoCalculatorResults(): CalculatorResults {
  return calculateROI(DEFAULT_CALCULATOR_INPUTS);
}

// ===== CLIENT SPEND HEATMAP =====

export function getDemoClientSpendHeatmap() {
  const MONTHS = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb']
  return [
    { client_name: 'Raisin Canes', months: MONTHS.map((m, i) => ({
      month: m,
      spend: [18500, 22000, 12000, 28000, 8500, 15000, 32000, 19500, 14000, 5200, 24000, 21800][i],
      profit: [6475, 7700, 4200, 9800, 2975, 5250, 11200, 6825, 4900, 1820, 8400, 7630][i],
      deal_count: [3, 4, 2, 5, 1, 3, 6, 3, 2, 1, 4, 4][i],
    })) },
    { client_name: 'Progressive Insurance', months: MONTHS.map((m, i) => ({
      month: m,
      spend: [9200, 11000, 14500, 8000, 6200, 22000, 18500, 16000, 12800, 28000, 15000, 19500][i],
      profit: [3220, 3850, 5075, 2800, 2170, 7700, 6475, 5600, 4480, 9800, 5250, 6825][i],
      deal_count: [2, 2, 3, 1, 1, 4, 3, 3, 2, 5, 3, 3][i],
    })) },
    { client_name: 'Red Bull Nashville', months: MONTHS.map((m, i) => ({
      month: m,
      spend: [0, 5000, 12000, 35000, 42000, 28000, 15000, 8000, 0, 0, 18000, 32000][i],
      profit: [0, 1750, 4200, 12250, 14700, 9800, 5250, 2800, 0, 0, 6300, 11200][i],
      deal_count: [0, 1, 2, 5, 7, 4, 2, 1, 0, 0, 3, 5][i],
    })) },
    { client_name: 'Nashville Sounds', months: MONTHS.map((m, i) => ({
      month: m,
      spend: [3200, 8500, 22000, 18000, 14500, 9800, 5000, 2000, 0, 0, 6500, 12000][i],
      profit: [1120, 2975, 7700, 6300, 5075, 3430, 1750, 700, 0, 0, 2275, 4200][i],
      deal_count: [1, 2, 4, 3, 3, 2, 1, 1, 0, 0, 1, 2][i],
    })) },
    { client_name: 'Threadbird Studios', months: MONTHS.map((m, i) => ({
      month: m,
      spend: [7500, 9200, 6800, 11000, 8500, 7200, 9800, 12500, 10200, 8800, 11500, 9000][i],
      profit: [2625, 3220, 2380, 3850, 2975, 2520, 3430, 4375, 3570, 3080, 4025, 3150][i],
      deal_count: [2, 2, 1, 2, 2, 1, 2, 3, 2, 2, 2, 2][i],
    })) },
  ]
}

// ===== VENDOR SCORECARDS =====

const VENDOR_SCORECARDS: Record<string, { quality_score: number; on_time_rate: number; avg_lead_time_days: number; reprint_rate: number; total_orders: number; overall_grade: string; quality_trend: number[]; on_time_trend: number[]; lead_time_trend: number[]; reprint_trend: number[] }> = {
  'vendor-1': {
    quality_score: 96, on_time_rate: 94, avg_lead_time_days: 7, reprint_rate: 2.1, total_orders: 142, overall_grade: 'A',
    quality_trend: [93, 94, 95, 96, 97, 96], on_time_trend: [91, 92, 93, 94, 95, 94],
    lead_time_trend: [9, 8, 8, 7, 7, 7], reprint_trend: [3.2, 2.8, 2.5, 2.3, 2.0, 2.1],
  },
  'vendor-2': {
    quality_score: 98, on_time_rate: 97, avg_lead_time_days: 5, reprint_rate: 0.8, total_orders: 89, overall_grade: 'A+',
    quality_trend: [96, 97, 97, 98, 98, 98], on_time_trend: [95, 96, 96, 97, 97, 97],
    lead_time_trend: [6, 6, 5, 5, 5, 5], reprint_trend: [1.5, 1.2, 1.0, 0.9, 0.8, 0.8],
  },
  'vendor-3': {
    quality_score: 88, on_time_rate: 82, avg_lead_time_days: 12, reprint_rate: 4.5, total_orders: 67, overall_grade: 'B+',
    quality_trend: [85, 86, 87, 88, 87, 88], on_time_trend: [78, 80, 81, 82, 83, 82],
    lead_time_trend: [14, 13, 13, 12, 12, 12], reprint_trend: [5.5, 5.2, 4.8, 4.6, 4.5, 4.5],
  },
  'vendor-4': {
    quality_score: 92, on_time_rate: 96, avg_lead_time_days: 3, reprint_rate: 1.2, total_orders: 215, overall_grade: 'A',
    quality_trend: [90, 91, 91, 92, 92, 92], on_time_trend: [94, 95, 95, 96, 96, 96],
    lead_time_trend: [4, 3, 3, 3, 3, 3], reprint_trend: [1.8, 1.5, 1.4, 1.3, 1.2, 1.2],
  },
  'vendor-5': {
    quality_score: 90, on_time_rate: 89, avg_lead_time_days: 4, reprint_rate: 1.8, total_orders: 178, overall_grade: 'B+',
    quality_trend: [87, 88, 89, 90, 90, 90], on_time_trend: [86, 87, 88, 89, 89, 89],
    lead_time_trend: [5, 5, 4, 4, 4, 4], reprint_trend: [2.5, 2.2, 2.0, 1.9, 1.8, 1.8],
  },
}

export function getDemoVendorScorecard(vendorId: string) {
  return VENDOR_SCORECARDS[vendorId] ? { vendor_id: vendorId, ...VENDOR_SCORECARDS[vendorId] } : undefined
}

// ─── Tickets ─────────────────────────────────────────────

const DEMO_TICKETS: Ticket[] = [
  {
    id: 'TKT-2026-0001',
    project_id: '1',
    project_name: 'Raisin Canes — Q2 Uniform Rollout',
    name: 'Misprinted Front Chest Logo',
    type: 'reprint',
    fault: 'vendor',
    reason: 'Misaligned front print on 47 units. Culture Studio acknowledged error.',
    quantity: 47,
    cost: 940,
    status: 'resolved',
    priority: 'high',
    resolution: 'Reprint at vendor cost. Shipped 2/19.',
    order_id: '6',
    linked_vendor_id: 'vendor-1',
    shareable_link: '/tickets/share/TKT-2026-0001',
    comments: [
      { id: 'tc-1', author: 'Trevor Sarver', message: 'Logo was printed off-center by about 1/2 inch', created_at: '2026-02-14T10:00:00Z' },
      { id: 'tc-2', author: 'Mike Torres', message: 'Confirmed issue on our end. Reprinting 47 units at no charge.', created_at: '2026-02-15T09:30:00Z' },
    ],
    created_at: '2026-02-14',
    resolved_at: '2026-02-19',
  },
  {
    id: 'TKT-2026-0002',
    project_id: '3',
    project_name: 'Red Bull Nashville — Summer Event',
    name: 'Wrong Color Shipped',
    type: 'credit',
    fault: 'our-fault',
    reason: 'Wrong color shipped — ordered Red, received Scarlet. Client wants credit not reprint.',
    quantity: 200,
    cost: 3200,
    status: 'open',
    priority: 'critical',
    order_id: '3',
    shareable_link: '/tickets/share/TKT-2026-0002',
    comments: [
      { id: 'tc-3', author: 'Kayla Martinez', message: 'Client is unhappy — needs resolution by end of week', created_at: '2026-02-20T11:00:00Z' },
    ],
    created_at: '2026-02-20',
  },
  {
    id: 'TKT-2026-0003',
    project_id: '3',
    project_name: 'Nashville Sounds — Season Merch',
    name: 'Loose Stitching on Caps',
    type: 'spoilage',
    fault: 'vendor',
    reason: '12 of 500 caps had loose stitching (2.4%). Under 3% threshold — refund only.',
    quantity: 12,
    cost: 78,
    status: 'resolved',
    priority: 'low',
    resolution: 'Refund issued — $78.00. Under 3% spoilage rule.',
    linked_vendor_id: 'vendor-2',
    comments: [],
    created_at: '2026-02-11',
    resolved_at: '2026-02-13',
  },
  {
    id: 'TKT-2026-0004',
    project_id: '4',
    project_name: 'Progressive Insurance — Polo Program',
    name: 'Incorrect PMS Color on Embroidery',
    type: 'reprint',
    fault: 'our-fault',
    reason: 'Incorrect PMS color used on embroidery. Should have been PMS 294, used PMS 287.',
    quantity: 150,
    cost: 2250,
    status: 'in-progress',
    priority: 'medium',
    linked_vendor_id: 'vendor-2',
    shareable_link: '/tickets/share/TKT-2026-0004',
    comments: [],
    created_at: '2026-02-22',
  },
]

export function getDemoTickets(): Ticket[] {
  return DEMO_TICKETS
}

// ─── Address Books ───────────────────────────────────────

const ADDRESS_BOOKS: Record<string, AddressBook> = {
  '1': {
    id: 'ab-1', client_id: '1',
    folders: [
      { id: 'abf-1-1', name: 'Default', entries: [
        { id: 'abe-1-1', label: 'HQ — Baton Rouge', address: { street: '1 Raising Cane Dr', city: 'Baton Rouge', state: 'LA', zip: '70808', country: 'US' }, contact_name: 'Sarah Mitchell', contact_phone: '225-555-0101', is_default: true },
        { id: 'abe-1-2', label: 'Nashville Office', address: { street: '420 Broadway', city: 'Nashville', state: 'TN', zip: '37203', country: 'US' }, contact_name: 'Jeff Parker', contact_phone: '615-555-0202', is_default: false },
      ]},
      { id: 'abf-1-2', name: 'Warehouse Locations', entries: [
        { id: 'abe-1-3', label: 'Central Distro', address: { street: '8900 Distribution Pkwy', city: 'Dallas', state: 'TX', zip: '75247', country: 'US' }, contact_name: 'Mike Torres', contact_phone: '214-555-0303', is_default: false },
      ]},
    ],
  },
  '2': {
    id: 'ab-2', client_id: '2',
    folders: [
      { id: 'abf-2-1', name: 'Default', entries: [
        { id: 'abe-2-1', label: 'Corporate HQ', address: { street: '6300 Wilson Mills Rd', city: 'Mayfield Village', state: 'OH', zip: '44143', country: 'US' }, contact_name: 'Lisa Reynolds', contact_phone: '440-555-0101', is_default: true },
      ]},
      { id: 'abf-2-2', name: 'Event Venues', entries: [
        { id: 'abe-2-2', label: 'Nissan Stadium — Nashville', address: { street: '1 Titans Way', city: 'Nashville', state: 'TN', zip: '37213', country: 'US' }, is_default: false },
        { id: 'abe-2-3', label: 'AT&T Stadium — Dallas', address: { street: '1 AT&T Way', city: 'Arlington', state: 'TX', zip: '76011', country: 'US' }, is_default: false },
      ]},
    ],
  },
  '6': {
    id: 'ab-6', client_id: '6',
    folders: [
      { id: 'abf-6-1', name: 'Default', entries: [
        { id: 'abe-6-1', label: 'Red Bull Nashville HQ', address: { street: '55 Music Square W', city: 'Nashville', state: 'TN', zip: '37203', country: 'US' }, contact_name: 'Jordan Blake', contact_phone: '615-555-0601', is_default: true },
      ]},
      { id: 'abf-6-2', name: 'Event Venues', entries: [
        { id: 'abe-6-2', label: 'Ascend Amphitheater', address: { street: '310 1st Ave S', city: 'Nashville', state: 'TN', zip: '37201', country: 'US' }, is_default: false },
        { id: 'abe-6-3', label: 'Bridgestone Arena', address: { street: '501 Broadway', city: 'Nashville', state: 'TN', zip: '37203', country: 'US' }, is_default: false },
      ]},
    ],
  },
}

// Fallback address book for any client without specific data
const FALLBACK_ADDRESS_BOOK = (clientId: string): AddressBook => ({
  id: `ab-${clientId}`, client_id: clientId,
  folders: [
    { id: `abf-${clientId}-1`, name: 'Default', entries: [
      { id: `abe-${clientId}-1`, label: 'Primary Shipping', address: { street: '100 Commerce St', city: 'Nashville', state: 'TN', zip: '37201', country: 'US' }, is_default: true },
    ]},
  ],
})

export function getDemoAddressBooks(clientId: string): AddressBook {
  return ADDRESS_BOOKS[clientId] || FALLBACK_ADDRESS_BOOK(clientId)
}

// ─── Creative Requests ───────────────────────────────────

const CREATIVE_REQUESTS: Record<string, CreativeRequest[]> = {
  '1': [
    {
      id: 'cr-1', project_id: '1', type: 're-vector',
      title: 'Logo Re-Vector (4-Color Screen Print)',
      description: 'Re-vector Raisin Canes logo for 4-color screen print — current file is a low-res JPG',
      status: 'approved', assigned_to: 'Marcus', due_date: '2026-02-18',
      files: ['raisin-canes-logo-vector.ai'],
      project_name: 'Q2 Uniform Rollout', client_name: 'Raisin Canes',
      time_tracked_minutes: 95,
      versions: [
        { id: 'v-1-1', version_number: 1, file_url: '#', notes: 'Initial trace from JPG', uploaded_by: 'Marcus', created_at: '2026-02-12' },
        { id: 'v-1-2', version_number: 2, file_url: '#', notes: 'Client feedback: thicker stroke on chicken', uploaded_by: 'Marcus', created_at: '2026-02-15' },
        { id: 'v-1-3', version_number: 3, file_url: '#', notes: 'Final approved version', uploaded_by: 'Marcus', created_at: '2026-02-17' },
      ],
      edit_requests: [
        { id: 'er-1-1', description: 'Thicken stroke on chicken outline per client feedback', status: 'completed', requested_by: 'Marcus Thompson', created_at: '2026-02-14' },
      ],
      created_at: '2026-02-10', updated_at: '2026-02-17',
    },
    {
      id: 'cr-2', project_id: '1', type: 'single-mock',
      title: 'Client Review Mockup Deck',
      description: 'Create mockup deck for client review — front/back tee + cap',
      status: 'approved', assigned_to: 'Marcus', due_date: '2026-02-12',
      files: ['rc-mockup-deck-v2.pdf'],
      project_name: 'Q2 Uniform Rollout', client_name: 'Raisin Canes',
      time_tracked_minutes: 120,
      versions: [
        { id: 'v-2-1', version_number: 1, file_url: '#', notes: 'Draft mockup deck', uploaded_by: 'Marcus', created_at: '2026-02-11' },
        { id: 'v-2-2', version_number: 2, file_url: '#', notes: 'Updated with venue photos', uploaded_by: 'Marcus', created_at: '2026-02-12' },
      ],
      created_at: '2026-02-10', updated_at: '2026-02-12',
    },
  ],
  '2': [
    {
      id: 'cr-3', project_id: '2', type: 'tech-pack',
      title: 'PMS 294 Color Separation',
      description: 'Color sep for 6-color Progressive Insurance logo — need PMS 294 spot color',
      status: 'in-progress', assigned_to: 'Jordan', due_date: '2026-02-28', files: [],
      project_name: 'Summer Event Merch', client_name: 'Red Bull Nashville',
      time_tracked_minutes: 45,
      versions: [
        { id: 'v-3-1', version_number: 1, file_url: '#', notes: 'Initial color separation — 6 channels', uploaded_by: 'Jordan', created_at: '2026-02-23' },
      ],
      edit_requests: [
        { id: 'er-3-1', description: 'PMS 294 needs to be exact Pantone match, not CMYK equivalent', status: 'pending', requested_by: 'Jennifer Walsh', created_at: '2026-02-24' },
      ],
      created_at: '2026-02-22', updated_at: '2026-02-23',
    },
    {
      id: 'cr-4', project_id: '2', type: 'single-mock',
      title: 'Embroidered Polo Mockup',
      description: 'Polo mockup with embroidered left chest logo',
      status: 'pending', assigned_to: 'Marcus', due_date: '2026-03-01', files: [],
      project_name: 'Summer Event Merch', client_name: 'Red Bull Nashville',
      created_at: '2026-02-22', updated_at: '2026-02-22',
    },
  ],
  '3': [
    {
      id: 'cr-5', project_id: '3', type: 'tier-a-deck',
      title: 'Full Creative Deck (8 Products)',
      description: 'Full creative deck for Red Bull Nashville event — 8 product mockups with venue photography backgrounds',
      status: 'review', assigned_to: 'Jordan', due_date: '2026-03-05',
      files: ['rb-event-deck-draft.pdf'],
      project_name: '2026 Season Swag', client_name: 'Nashville Sounds',
      time_tracked_minutes: 280,
      versions: [
        { id: 'v-5-1', version_number: 1, file_url: '#', notes: 'First draft — 6 of 8 products', uploaded_by: 'Jordan', created_at: '2026-02-21' },
        { id: 'v-5-2', version_number: 2, file_url: '#', notes: 'All 8 products, venue backgrounds added', uploaded_by: 'Jordan', created_at: '2026-02-23' },
      ],
      edit_requests: [
        { id: 'er-5-1', description: 'Swap venue photo on slide 3 — wrong location', status: 'completed', requested_by: 'Sarah', created_at: '2026-02-22' },
        { id: 'er-5-2', description: 'Add size chart to final slide', status: 'in-progress', requested_by: 'Sarah', created_at: '2026-02-24' },
      ],
      created_at: '2026-02-20', updated_at: '2026-02-23',
    },
    {
      id: 'cr-6', project_id: '3', type: 'branding-deck',
      title: 'Event Brand Mark — Separable Layers',
      description: 'Re-vector Red Bull Nashville custom event mark — convert to separable layers',
      status: 'approved', assigned_to: 'Marcus', files: ['rb-nashville-mark-v.ai'],
      project_name: '2026 Season Swag', client_name: 'Nashville Sounds',
      time_tracked_minutes: 65,
      versions: [
        { id: 'v-6-1', version_number: 1, file_url: '#', notes: 'Initial vector trace', uploaded_by: 'Marcus', created_at: '2026-02-19' },
        { id: 'v-6-2', version_number: 2, file_url: '#', notes: 'Separated into 4 color layers', uploaded_by: 'Marcus', created_at: '2026-02-20' },
      ],
      created_at: '2026-02-18', updated_at: '2026-02-20',
    },
  ],
}

export function getDemoCreativeRequests(projectId: string): CreativeRequest[] {
  return CREATIVE_REQUESTS[projectId] || []
}

export function getAllDemoCreativeRequests(): CreativeRequest[] {
  return Object.values(CREATIVE_REQUESTS).flat()
}

// ─── Project Files (Categorized) ────────────────────────

const PROJECT_FILES: Record<string, ProjectFile[]> = {
  '1': [
    { id: 'pf-1', project_id: '1', name: 'raisin-canes-logo-vector.ai', category: 'client-art', file_url: '#', uploaded_by: 'Marcus', created_at: '2026-02-10' },
    { id: 'pf-2', project_id: '1', name: 'rc-mockup-deck-v2.pdf', category: 'decks', file_url: '#', uploaded_by: 'Marcus', created_at: '2026-02-12' },
    { id: 'pf-3', project_id: '1', name: 'rc-screen-seps-4color.psd', category: 'production-files', file_url: '#', uploaded_by: 'Jordan', decoration_location_id: 'dec-1-1-1', created_at: '2026-02-14' },
    { id: 'pf-4', project_id: '1', name: 'rc-uniform-brief.pdf', category: 'project-files', file_url: '#', uploaded_by: 'Sarah', created_at: '2026-02-08' },
    { id: 'pf-5', project_id: '1', name: 'client-approval-email.pdf', category: 'client-submitted', file_url: '#', created_at: '2026-02-16' },
  ],
  '3': [
    { id: 'pf-6', project_id: '3', name: 'rb-nashville-event-brief.docx', category: 'project-files', file_url: '#', uploaded_by: 'Sarah', created_at: '2026-02-18' },
    { id: 'pf-7', project_id: '3', name: 'rb-event-deck-draft.pdf', category: 'decks', file_url: '#', uploaded_by: 'Jordan', created_at: '2026-02-20' },
    { id: 'pf-8', project_id: '3', name: 'rb-nashville-mark-v.ai', category: 'client-art', file_url: '#', uploaded_by: 'Marcus', created_at: '2026-02-18' },
    { id: 'pf-9', project_id: '3', name: 'red-bull-brand-guidelines.pdf', category: 'client-submitted', file_url: '#', created_at: '2026-02-17' },
    { id: 'pf-10', project_id: '3', name: 'screen-print-setup-front.psd', category: 'production-files', file_url: '#', uploaded_by: 'Jordan', decoration_location_id: 'dec-3-1-1', created_at: '2026-02-22' },
  ],
}

export function getDemoProjectFiles(projectId: string): ProjectFile[] {
  return PROJECT_FILES[projectId] || []
}

// ─── Split Shipments & Shipments Helpers ────────────────

export function getDemoSplitShipments(projectId: string): SplitShipmentDestination[] {
  const project = DEMO_PROJECTS.find(p => p.id === projectId);
  return project?.split_shipments ?? [];
}

export function getDemoShipments(orderId: string): Shipment[] {
  const order = DEMO_ORDERS.find(o => o.id === orderId);
  return order?.shipments ?? [];
}

// ─── Project Templates (E3) ────────────────────────────

import type { ProjectTemplate, ArtworkUpload, CommandPaletteItem } from '@/lib/types/app'

const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'tpl-1', name: 'Corporate Polo Kit', category: 'corporate',
    description: 'Standard corporate polo package — embroidered left chest logo, 3 color options, bell curve sizing.',
    line_items: [
      { product_name: 'Nike Dri-FIT Micro Pique Polo', product_type: 'contract', category: 'polos', suggested_quantity: 100, decoration_method: 'embroidery', decoration_position: 'left-chest', notes: 'Left chest logo, 8K stitches max' },
    ],
    created_at: '2026-01-15',
  },
  {
    id: 'tpl-2', name: 'Trade Show Bundle', category: 'event',
    description: 'Event-ready package — tees, totes, and drinkware with screen print branding.',
    line_items: [
      { product_name: 'Bella Canvas 3001 Unisex Tee', product_type: 'contract', category: 'short-sleeve-tees', suggested_quantity: 250, decoration_method: 'screen-print', decoration_position: 'front', notes: 'Full front 3-color' },
      { product_name: 'Canvas Tote Bag', product_type: 'all-in', category: 'bags-totes', suggested_quantity: 500, decoration_method: 'screen-print', decoration_position: 'front' },
      { product_name: '20oz Insulated Tumbler', product_type: 'all-in', category: 'drinkware', suggested_quantity: 200, decoration_method: 'laser-engrave' },
    ],
    created_at: '2026-01-20',
  },
  {
    id: 'tpl-3', name: 'Employee Welcome Kit', category: 'employee',
    description: 'New hire welcome package — hoodie, notebook, stickers, and lanyard.',
    line_items: [
      { product_name: 'Independent Trading Co. Midweight Hoodie', product_type: 'contract', category: 'sweatshirts-hoodies', suggested_quantity: 50, decoration_method: 'screen-print', decoration_position: 'front', notes: 'Left chest small logo' },
      { product_name: 'Branded Sticker Sheet', product_type: 'all-in', category: 'stickers-patches', suggested_quantity: 50 },
      { product_name: 'Custom Lanyard + Badge', product_type: 'all-in', category: 'lanyards-badges', suggested_quantity: 50, decoration_method: 'sublimation' },
    ],
    created_at: '2026-02-01',
  },
  {
    id: 'tpl-4', name: 'Holiday Gift Set', category: 'holiday',
    description: 'End-of-year client gift box — premium hoodie + tumbler, individually boxed.',
    line_items: [
      { product_name: 'Champion Reverse Weave Hoodie', product_type: 'contract', category: 'sweatshirts-hoodies', suggested_quantity: 75, decoration_method: 'embroidery', decoration_position: 'left-chest' },
      { product_name: 'YETI Rambler 20oz', product_type: 'all-in', category: 'drinkware', suggested_quantity: 75, decoration_method: 'laser-engrave' },
    ],
    created_at: '2026-02-10',
  },
]

export function getDemoProjectTemplates(): ProjectTemplate[] {
  return PROJECT_TEMPLATES
}

// ─── Artwork Uploads — Portal (E6) ─────────────────────

const ARTWORK_UPLOADS: ArtworkUpload[] = [
  { id: 'art-1', filename: 'company-logo-vector.ai', file_size: 2400000, file_type: 'application/illustrator', status: 'approved', notes: 'Primary brand mark — approved by Sarah', uploaded_at: '2026-02-15' },
  { id: 'art-2', filename: 'event-banner-draft.png', file_size: 5800000, file_type: 'image/png', status: 'pending-review', uploaded_at: '2026-02-28' },
  { id: 'art-3', filename: 'back-design-v2.pdf', file_size: 1200000, file_type: 'application/pdf', status: 'pending-review', notes: 'Updated back panel layout', uploaded_at: '2026-03-01' },
]

export function getDemoArtworkUploads(): ArtworkUpload[] {
  return ARTWORK_UPLOADS
}

// ─── Command Palette Items (E7) ─────────────────────────

export function getCommandPaletteItems(): CommandPaletteItem[] {
  const pages: CommandPaletteItem[] = [
    { id: 'pg-dashboard', label: 'Dashboard', category: 'page', href: '/dashboard', keywords: ['home', 'overview'] },
    { id: 'pg-clients', label: 'Clients', category: 'page', href: '/dashboard/clients', keywords: ['accounts', 'companies'] },
    { id: 'pg-projects', label: 'Projects', category: 'page', href: '/dashboard/projects', keywords: ['jobs', 'orders'] },
    { id: 'pg-products', label: 'Products', category: 'page', href: '/dashboard/products', keywords: ['catalog', 'blanks'] },
    { id: 'pg-orders', label: 'Orders', category: 'page', href: '/dashboard/orders', keywords: ['fulfillment', 'shipping'] },
    { id: 'pg-creative', label: 'Creative', category: 'page', href: '/dashboard/creative', keywords: ['art', 'design', 'mockups'] },
    { id: 'pg-decorations', label: 'Decorations', category: 'page', href: '/dashboard/decorations', keywords: ['print', 'embroidery'] },
    { id: 'pg-vendors', label: 'Vendors', category: 'page', href: '/dashboard/vendors', keywords: ['suppliers', 'decorators'] },
    { id: 'pg-analytics', label: 'Analytics', category: 'page', href: '/dashboard/analytics', keywords: ['reports', 'revenue'] },
    { id: 'pg-settings', label: 'Settings', category: 'page', href: '/dashboard/settings', keywords: ['config', 'preferences'] },
    { id: 'pg-commissions', label: 'Commissions', category: 'page', href: '/dashboard/commissions', keywords: ['payouts', 'sales'] },
  ]

  const clients = getDemoClients().map((c) => ({
    id: `cli-${c.id}`, label: c.company_name, description: c.industry || 'Client', category: 'client' as const,
    href: `/dashboard/clients/${c.id}`, keywords: [c.industry || '', c.company_name],
  }))

  const projects = getDemoProjects().map((p) => ({
    id: `prj-${p.id}`, label: `${p.project_number} — ${p.client_name}`, description: p.status, category: 'project' as const,
    href: `/dashboard/projects/${p.id}`, keywords: [p.client_name, p.status],
  }))

  const products = getDemoProductsList().map((p) => ({
    id: `prd-${p.id}`, label: p.name, description: p.category, category: 'product' as const,
    href: '/dashboard/products', keywords: [p.category, p.supplier || ''],
  }))

  const actions: CommandPaletteItem[] = [
    { id: 'act-new-project', label: 'New Project', description: 'Create a new project', category: 'action', keywords: ['create', 'add'] },
    { id: 'act-new-product', label: 'New Product', description: 'Add a product to catalog', category: 'action', keywords: ['create', 'add', 'catalog'] },
  ]

  return [...pages, ...clients, ...projects, ...products, ...actions]
}
