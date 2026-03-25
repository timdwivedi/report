// ===== ENUMS / UNION TYPES =====

export type ProjectStatus =
  | 'opportunity'
  | 'qualifying'
  | 'curating'
  | 'in-design'
  | 'presenting'
  | 'client-review'
  | 'confirmed'
  | 'order-entry'
  | 'in-production'
  | 'shipped'
  | 'cancelled';

export type OrderStatus =
  | 'order-entry-needed'
  | 'in-production'
  | 'partially-shipped'
  | 'shipped'
  | 'ready-for-invoicing'
  | 'invoiced'
  | 'cancelled';

export type DecorationMethod =
  | 'screen-print'
  | 'embroidery'
  | 'dtg'
  | 'heat-transfer'
  | 'sublimation'
  | 'laser-engrave'
  | 'pad-print'
  | 'deboss'
  | 'other';

export type ProductCategory =
  | 'short-sleeve-tees'
  | 'long-sleeve-tees'
  | 'sweatshirts-hoodies'
  | 'polos'
  | 'jackets-outerwear'
  | 'hats-caps'
  | 'bags-totes'
  | 'drinkware'
  | 'office-supplies'
  | 'tech-accessories'
  | 'stickers-patches'
  | 'koozies'
  | 'lanyards-badges'
  | 'other';

export type ProductType = 'contract' | 'all-in';
export type VendorType = 'supplier' | 'decorator' | 'both';
export type ContactRole = 'primary' | 'billing' | 'shipping' | 'finance' | 'all' | 'other';
export type PaymentTerms = 'prepay' | 'net15' | 'net30' | 'net45' | 'net60';
export type ProgramType = 'employee-store' | 'uniform-program' | 'event-merch' | 'drop-ship' | 'budget-managed';
export type ProgramStatus = 'active' | 'paused' | 'completed';
export type CommissionStatus = 'pending' | 'confirmed' | 'paid';
export type TeamRole = 'owner' | 'admin' | 'sales' | 'production' | 'viewer';
export type ProjectSource = 'website' | 'direct' | 'referral' | 'program';
export type DecorationPosition = 'front' | 'back' | 'left-sleeve' | 'right-sleeve' | 'left-chest' | 'collar' | 'neckline' | 'pocket' | 'other';
export type ShipmentStatus = 'pending' | 'shipped' | 'delivered';
export type ChargeType = 'setup' | 'run' | 'fixed';

export type ProductionTime = 'standard' | 'rush';
export type ProjectFileCategory = 'product-files' | 'project-files' | 'decks' | 'client-art' | 'client-submitted' | 'production-files' | 'miscellaneous';

export type CreativeRequestStatus = 'pending' | 'in-progress' | 'review' | 'approved' | 'cancelled';
export type CreativeRequestType = 'branding-deck' | 'tier-a-deck' | 'tier-b-deck' | 'tech-pack' | 're-vector' | 'single-mock' | 'other';

export type TicketType = 'reprint' | 'credit' | 'spoilage' | 'refund';
export type TicketFault = 'vendor' | 'our-fault';
export type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';

// ===== CORE ENTITIES =====

export interface Organization {
  id: string;
  name: string;                    // "85 Supply"
  slug: string;                    // "85-supply"
  logo_url?: string;
  website_url?: string;
  primary_color: string;           // Brand color for white-labeling
  default_margin_percent: number;  // e.g., 35
  margin_safety_percent: number;   // Minimum acceptable margin — warnings below this
  currency: string;                // "USD"
  salesforce_enabled: boolean;
  payment_terms_default: PaymentTerms;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  org_id: string;
  company_name: string;            // "Raisin Canes"
  industry?: string;               // "Restaurant/QSR"
  billing_address: Address;
  shipping_address?: Address;
  payment_terms: PaymentTerms;
  credit_limit?: number;
  tax_exempt: boolean;
  annual_volume?: number;          // Estimated annual spend
  notes?: string;
  priority?: 'vip' | 'standard' | 'at-risk';
  status: 'active' | 'inactive';
  purchasing_status?: string;      // "Approved Vendor", "Pending Credit Check", "New"
  last_quoted_date?: string;
  last_ordered_date?: string;
  contacts: ClientContact[];
  created_at: string;
  updated_at: string;
}

export interface ClientContact {
  id: string;
  client_id: string;
  name: string;
  email: string;
  phone?: string;
  role: ContactRole;
  contact_type?: ContactType;
  is_primary: boolean;
}

export interface AddressBook {
  id: string;
  client_id: string;
  folders: AddressBookFolder[];
}

export interface AddressBookFolder {
  id: string;
  name: string;              // "2026 World Tour", "HQ Locations", "Default"
  entries: AddressBookEntry[];
}

export interface AddressBookEntry {
  id: string;
  label: string;             // "Nashville HQ", "Chicago Warehouse"
  address: Address;
  contact_name?: string;
  contact_phone?: string;
  is_default: boolean;
}

export interface Address {
  street: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Product {
  id: string;
  org_id: string;
  name: string;                    // "Gildan 5000 Heavy Cotton Tee"
  internal_sku?: string;           // "5000"
  product_type: ProductType;       // 'contract' = blank + decoration + margin; 'all-in' = vendor_cost + margin
  category: ProductCategory;
  description?: string;
  primary_image_url?: string;
  additional_images: string[];
  available_colors: ProductColor[];
  available_sizes: string[];       // ["S", "M", "L", "XL", "2XL", "3XL"]
  blank_costs: BlankCost[];        // Contract products: cost per quantity break
  vendor_cost?: number;            // All-in products: single vendor cost per unit
  applicable_decorations: DecorationMethod[];
  decoration_locations?: ProductDecorationLocation[];
  supplier_name?: string;          // "Gildan" (contract) or "YETI" (all-in)
  suppliers?: SupplierPricing[];   // Multi-supplier pricing entries
  price_code?: string;             // ASI price code (e.g., "C" = 40%, "G" = 20%)
  vendor_source?: string;          // "Hit Promo", "Manual", etc.
  vendor_api_id?: string;          // For API-sourced products, links back to vendor catalog
  all_in_price_breaks?: AllInPriceBreak[];
  setup_cost_per_color?: number;
  setup_sale_per_color?: number;
  contract_matrix?: string;          // "GSA Schedule", "State Contract A", etc.
  is_active: boolean;
  show_on_website: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductColor {
  name: string;                    // "Black"
  hex: string;                     // "#000000"
  swatch_url?: string;
  images?: { url: string; is_primary: boolean }[];
}

export interface BlankCost {
  min_quantity: number;            // 25
  max_quantity: number;            // 49
  cost_per_unit: number;           // 3.50
}

export interface SupplierPricing {
  supplier_name: string;
  blank_costs: BlankCost[];
}

export interface Vendor {
  id: string;
  org_id: string;
  name: string;                    // "Culture Studio"
  type: VendorType;                // 'supplier' | 'decorator' | 'both'
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  city?: string;
  state?: string;
  website_url?: string;
  notes?: string;
  contacts?: VendorContact[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DecoratorMatrix {
  id: string;
  org_id: string;
  vendor_id?: string;              // null = org default, populated = vendor-specific
  vendor_name?: string;            // Denormalized for display
  name: string;                    // "Culture Studio — Screen Print"
  decoration_method: DecorationMethod;
  pricing_tiers: DecoratorTier[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface DecoratorTier {
  min_quantity: number;
  max_quantity: number;
  prices_by_colors: Record<number, number>;  // { 1: 2.50, 2: 3.65, 3: 4.80 }
}

export interface Project {
  id: string;
  org_id: string;
  client_id: string;
  client_name: string;             // Denormalized for display
  project_number: string;          // "PRJ-2026-0042"
  name: string;                    // "Jeremy's Concert Tees"
  status: ProjectStatus;
  source: ProjectSource;
  in_hands_date?: string;
  project_deadline?: string;          // Previously enhanced_date — the deadline for the project
  ship_date?: string;
  production_time?: ProductionTime;
  budget?: number;
  is_critical: boolean;
  estimated_total: number;
  estimated_shipping_cost?: number;
  internal_notes?: string;
  client_notes?: string;
  client_facing_notes?: string;
  shareable_link?: string;         // UUID for client portal
  assigned_to?: string;
  line_items: ProjectLineItem[];
  split_shipments?: SplitShipmentDestination[];
  comments?: ProjectComment[];
  change_request_pending?: boolean;
  approval_phase?: 'collecting' | 'final-approval' | 'approved';
  payment_status?: 'unpaid' | 'paid' | 'partial';
  payment_details?: { amount: number; method: string; date: string; reference?: string };
  created_at: string;
  updated_at: string;
}

export interface ProjectLineItem {
  id: string;
  project_id: string;
  product_id: string;
  product_name: string;
  product_type: ProductType;       // 'contract' or 'all-in'
  pricing_override?: 'contract' | 'all-in' | null;  // null = use product default
  product_image_url?: string;
  selected_color?: string;
  selected_sizes: SizeQuantity[];
  total_quantity: number;
  decorations: LineItemDecoration[];     // Contract products: decoration locations with costs
  add_ons: LineItemAddOn[];
  vendor_cost?: number;            // All-in products: per-unit cost from vendor
  unit_cost: number;
  margin_percent: number;
  unit_price: number;
  subtotal: number;
  art_received: boolean;
  quantities_received: boolean;
  artwork_files: string[];
  product_fixed_charges?: ProductFixedCharge[];
  display_name?: string;
  project_deadline?: string;          // Per-product deadline (previously enhanced_date)
  ship_date?: string;
  estimated_shipping_cost?: number;
  production_time?: ProductionTime;   // Per-product production time
  sort_order: number;
}

export interface SizeQuantity {
  size: string;
  quantity: number;
}

export interface LineItemDecoration {
  id: string;
  position: DecorationPosition;    // Where on the garment (front, back, left-chest, etc.)
  position_label: string;          // "Front Chest", "Full Back", "Left Chest"
  method: DecorationMethod;
  color_count: number;             // Screen print: # of ink colors. Embroidery: thread colors.
  stitch_count?: number;           // Embroidery: stitch count (e.g., 8000, 12000)
  decorator_matrix_id?: string;    // Which pricing matrix to use
  vendor_id?: string;              // Which decorator handles this location
  vendor_name?: string;            // Denormalized for display
  decoration_cost: number;         // Per-unit cost from matrix lookup
  setup_charges: FixedCharge[];    // Setup fees ($20/color/location, etc.)
  run_charges: RunCharge[];        // Per-unit surcharges (puff ink, printed tags, etc.)
  production_file_url?: string;    // Art file specific to this location
  art_file_url?: string;           // Direct link to art file for this decoration
  notes?: string;
}

export interface RunCharge {
  id: string;
  name: string;                    // "Puff Ink", "Printed Tags", "Specialty Ink"
  cost_per_unit: number;           // Per-unit surcharge
  quantity_breaks?: { min: number; max: number; cost: number }[];
}

export interface FixedCharge {
  id: string;
  name: string;                    // "Screen Setup", "Flash Charge", "Color Change"
  amount: number;                  // Flat fee
  calculation: ChargeType;         // 'setup' = per-color-per-location, 'fixed' = flat per job
  per_color: boolean;              // If true, amount × color_count
}

export interface LineItemAddOn {
  id: string;
  name: string;                    // "Folding & Polybag"
  cost_per_unit: number;
  sale_price_per_unit: number;
  level: AddOnLevel;               // 'product' = applies to whole item, 'location' = tied to decoration
  decoration_id?: string;          // Only for location-level add-ons — links to LineItemDecoration.id
}

export interface Order {
  id: string;
  org_id: string;
  project_id: string;
  project_name: string;            // Denormalized
  line_item_id: string;
  order_number: string;            // "ORD-2026-0142"
  salesforce_id?: string;
  status: OrderStatus;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
  in_hands_date?: string;
  ship_to: Address;
  tracking_number?: string;
  tracking_url?: string;
  carrier?: string;
  shipped_date?: string;
  invoice_amount?: number;
  payment_received: boolean;
  notes?: string;
  shipments?: Shipment[];
  sales_order_pdf_url?: string;
  invoice_pdf_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  name: string;
  category: ProjectFileCategory;
  file_url: string;
  uploaded_by?: string;
  decoration_location_id?: string;   // For production files linked to a decoration location
  linked_product_id?: string;        // For product files linked to a specific line item
  file_status?: 'ok' | 'problem';   // Client-submitted file review status
  created_at: string;
}

export interface CreativeRequest {
  id: string;
  project_id: string;
  type: CreativeRequestType;
  custom_type_name?: string;        // User-defined type when type === 'other'
  description: string;
  status: CreativeRequestStatus;
  assigned_to?: string;
  due_date?: string;
  files: string[];
  project_name?: string;            // Denormalized for breadcrumb
  client_name?: string;             // Denormalized for breadcrumb
  title?: string;                   // "Homepage Banner Design"
  initial_draft_date?: string;
  time_tracked_minutes?: number;    // Time tracking (display as Xh Ym)
  versions?: CreativeRequestVersion[];
  edit_requests?: EditRequest[];
  created_at: string;
  updated_at: string;
}

export interface CreativeRequestVersion {
  id: string;
  version_number: number;
  file_url?: string;
  url?: string;
  notes?: string;
  uploaded_by?: string;
  created_at: string;
}

export interface EditRequest {
  id: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  requested_by?: string;
  created_at: string;
}

export interface Ticket {
  id: string;
  project_id: string;
  project_name: string;
  name?: string;
  type: TicketType;
  fault: TicketFault;
  reason: string;
  quantity: number;
  cost?: number;
  status: TicketStatus;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  resolution?: string;
  order_id?: string;
  linked_vendor_id?: string;
  shareable_link?: string;
  comments?: TicketComment[];
  created_at: string;
  resolved_at?: string;
}

export interface Program {
  id: string;
  org_id: string;
  client_id: string;
  client_name: string;
  name: string;                    // "Progressive Insurance — Polo Program"
  type: ProgramType;
  status: ProgramStatus;
  budget_total?: number;
  budget_spent: number;
  budget_remaining: number;
  locations_count: number;
  approval_required: boolean;
  auto_reorder: boolean;
  reorder_frequency?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ProgramLocation {
  id: string;
  program_id: string;
  name: string;                    // "Nashville HQ"
  address: Address;
  budget_allocation?: number;
  contact_name?: string;
  contact_email?: string;
}

export interface CommissionRecord {
  id: string;
  org_id: string;
  project_id: string;
  project_name: string;
  client_name: string;
  period: string;                  // "2026-02"
  gross_revenue: number;
  gross_profit: number;
  profit_margin_percent: number;
  owner_share: number;             // 50% of profit
  partner_commission: number;      // 7% of gross
  source: ProjectSource;
  status: CommissionStatus;
  created_at: string;
}

export interface TeamMember {
  id: string;
  org_id: string;
  user_id: string;
  name: string;
  email: string;
  role: TeamRole;
  avatar_initials: string;
  is_active: boolean;
  projects_assigned: number;
  deals_closed: number;
  created_at: string;
}

// ===== COMPONENT PROP TYPES =====

export interface StatCardData {
  label: string;
  value: string;
  change: string;                  // "+12.5%"
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

export interface RecentActivity {
  id: string;
  action: string;
  detail: string;
  timestamp: string;
  type: 'project' | 'order' | 'client' | 'commission' | 'system' | 'approval';
}

export interface QuickAction {
  id?: string;
  label: string;
  description: string;
  href: string;
  icon: string;
}

// ===== DASHBOARD TYPES =====

export interface DashboardStats {
  pipeline_value: number;
  pipeline_change: number;
  active_projects: number;
  active_projects_change: number;
  orders_in_production: number;
  orders_change: number;
  monthly_revenue: number;
  monthly_revenue_change: number;
  avg_quote_time_seconds: number;
  quote_time_change: number;
  portal_views: number;
  portal_views_change: number;
}

// ===== ANALYTICS TYPES =====

export interface PipelineStageValue {
  stage: string;
  project_count: number;
  total_value: number;
}

export interface RevenueDataPoint {
  month: string;
  revenue: number;
}

export interface TopClient {
  company_name: string;
  total_revenue_ytd: number;
  projects_count: number;
  avg_deal_size: number;
}

// ===== SETTINGS DISPLAY TYPES =====

export interface DecoratorMatrixDisplay {
  id: string;
  name: string;
  method: string;
  tier_count: number;
  color_counts: number[];
  pricing_grid: Record<string, Record<string, number>>;
}

export interface ProductDisplay {
  id: string;
  name: string;
  product_type: ProductType;
  category: string;
  supplier: string;
  blank_cost_min: number;
  blank_cost_max: number;
  vendor_cost_min?: number;        // All-in products: vendor cost range
  vendor_cost_max?: number;
  is_active: boolean;
}

// ===== ROI CALCULATOR (SIGNATURE ELEMENT) =====

export interface CalculatorInputs {
  projectsPerMonth: number;        // 5–100, default 20
  avgDealValue: number;            // £1,000–£50,000, default £8,500
  currentCloseRate: number;        // 5%–50%, default 22%
  hoursPerQuote: number;           // 0.5–8 hours, default 3.5
  hourlyValue: number;             // £20–£150, default £65
  timeToQuote: string;             // "Same day" | "24 hours" | "48 hours" | "3-5 days" | "1 week+"
  lostDealsToSpeed: number;        // 0–20, default 3
}

export interface CalculatorResults {
  quotingLaborCost: number;        // Monthly £ burned on manual pricing
  dealsLostToSpeed: number;        // Monthly £ lost to competitors
  pipelineVelocityLost: number;    // Days in pipeline + £ stalled
  pipelineDays: number;            // Average days deals wait for pricing
  withBrandOps: {
    projectedCloseRate: number;    // Current + 8%
    projectedMonthlyRevenue: number;
    quotingTimeSaved: number;      // Hours/month
    timeToQuote: string;           // "10 minutes"
  };
  annualRevenueImpact: number;     // The BIG number
  roiMultiple: number;             // Annual impact / (subscription × 12)
  currentMonthlyRevenue: number;
  subscriptionCost: number;        // £499/mo (Growth tier)
}

// ===== ADMIN / MULTI-TENANT TYPES =====

export type PlatformRole = 'super_admin' | 'owner' | 'admin' | 'sales' | 'production' | 'viewer'

export interface PlatformUser {
  id: string
  user_id: string
  email: string
  display_name: string
  role: PlatformRole
  org_memberships: { org_id: string; org_name: string; org_slug: string; role: TeamRole }[]
  last_login?: string
  created_at: string
}

export interface AdminOrganization extends Organization {
  owner_name: string
  owner_email: string
  member_count: number
  project_count: number
  order_count: number
  total_revenue: number
  last_activity?: string
  health_status: 'active' | 'moderate' | 'stale'
}

export interface PlatformStats {
  total_orgs: number
  total_projects: number
  total_orders: number
  total_revenue: number
  avg_deal_size: number
  active_orgs: number
  stale_orgs: number
  total_users: number
}

export interface OrgHealthMetric {
  org_id: string
  org_name: string
  org_slug: string
  projects_last_30d: number
  orders_last_30d: number
  revenue_last_30d: number
  last_activity_date: string
  health_status: 'active' | 'moderate' | 'stale'
}

// ===== CLIENT SPEND HEATMAP =====

export interface MonthlyClientSpend {
  client_name: string
  months: { month: string; spend: number }[]
}

// ===== VENDOR SCORECARD =====

export interface VendorScorecard {
  vendor_id: string
  quality_score: number
  on_time_rate: number
  avg_lead_time_days: number
  reprint_rate: number
  total_orders: number
  overall_grade: string
  quality_trend: number[]
  on_time_trend: number[]
  lead_time_trend: number[]
  reprint_trend: number[]
}

// ═══ X-Ray Mode (Client Feedback Overlay) ═══

export type FeedbackCategory = 'ui' | 'data' | 'feature' | 'workflow' | 'bug' | 'other'
export type FeedbackPriority = 'low' | 'medium' | 'high' | 'critical'

export interface FeedbackAttachment {
  id: string
  name: string
  type: string       // MIME type (image/png, image/jpeg, etc.)
  size: number       // bytes
}

export interface FeedbackItem {
  id: string
  page_path: string
  section_label: string
  category: FeedbackCategory
  priority: FeedbackPriority
  message: string
  attachments?: FeedbackAttachment[]  // Screenshot metadata (images in IndexedDB)
  created_at: string
  created_by?: string
  status: 'new' | 'acknowledged' | 'resolved'
  sent_at?: string           // When exported to pipeline
  processed_round?: number   // Which pipeline round processed this
}

export interface FeedbackSession {
  id: string
  project_name: string
  created_at: string
  items: FeedbackItem[]
  exported: boolean
}

export interface FeedbackDayGroup {
  date: string              // YYYY-MM-DD
  items: FeedbackItem[]
  sent: boolean
  processed_round?: number
}

export interface FeedbackExportMeta {
  filename: string
  date: string
  item_count: number
  sent_at: string
  processed_round?: number
}

// ===== PRODUCT DECORATION LOCATIONS =====

export interface ProductDecorationLocation {
  id: string;
  location_name: string;
  placeholder_run_charge?: number;
  placeholder_setup_charge?: number;
}

// ===== AI PRODUCT SCRAPER =====

export interface ScrapedProductData {
  source_url: string;
  product_name: string;
  description: string;
  original_description: string;
  images: string[];
  colors: { name: string; hex?: string; swatch_url?: string }[];
  sizes: string[];
  specs: Record<string, string>;
  supplier_name: string;
  supplier_sku: string;
  msrp?: number;
}

// ===== ADD-ON LEVEL =====

export type AddOnLevel = 'product' | 'location';

// ===== PROJECT TEMPLATES (E3) =====

export type TemplateCategory = 'corporate' | 'event' | 'employee' | 'holiday' | 'custom';

export interface ProjectTemplateLineItem {
  product_name: string;
  product_type: ProductType;
  category: ProductCategory;
  suggested_quantity: number;
  decoration_method?: DecorationMethod;
  decoration_position?: DecorationPosition;
  notes?: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  line_items: ProjectTemplateLineItem[];
  created_at: string;
}

// ===== PURCHASE ORDERS (E4) =====

export interface POLineItem {
  product_name: string;
  quantity: number;
  spoilage_quantity: number;
  unit_cost: number;
  total: number;
  decoration_summary: string;
  color?: string;
  sizes?: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  project_id: string;
  project_name: string;
  vendor_name: string;
  ship_to: Address;
  line_items: POLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  created_at: string;
}

// ===== ARTWORK UPLOADS — Portal (E6) =====

export type ArtworkUploadStatus = 'pending-review' | 'approved' | 'rejected';

export interface ArtworkUpload {
  id: string;
  filename: string;
  file_size: number;
  file_type: string;
  status: ArtworkUploadStatus;
  notes?: string;
  uploaded_at: string;
}

// ===== COMMAND PALETTE (E7) =====

export type CommandCategory = 'page' | 'client' | 'project' | 'product' | 'action';

export interface CommandPaletteItem {
  id: string;
  label: string;
  description?: string;
  category: CommandCategory;
  href?: string;
  keywords?: string[];
}

// ===== ROUND 5 — NEW TYPES =====

export interface ProductFixedCharge {
  id: string;
  name: string;
  amount: number;
  sale_amount: number;
}

export interface Shipment {
  id: string;
  order_id: string;
  tracking_number: string;
  carrier: string;
  ship_date: string;
  estimated_arrival?: string;
  status: 'pending' | 'in-transit' | 'delivered' | 'exception';
  items_shipped?: number;
  notes?: string;
}

export interface SplitShipmentAllocation {
  line_item_id: string;
  product_name: string;
  quantity: number;
}

export interface SplitShipmentDestination {
  id: string;
  address_book_entry_id?: string;
  label: string;
  address: Address;
  contact_name?: string;
  contact_phone?: string;
  allocations: SplitShipmentAllocation[];
}

export type PriceCode = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'L' | 'M' | 'N' | 'P' | 'R';

export interface AllInPriceBreak {
  min_quantity: number;
  max_quantity: number;
  list_price: number;
  price_code: PriceCode;
  net_cost: number;
}

export type ContactType = 'order' | 'finance' | 'shipping' | 'billing' | 'general' | 'other';

export interface VendorContact {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  title?: string;
  notes?: string;
}

export interface TicketComment {
  id: string;
  author: string;
  message: string;
  created_at: string;
}

export interface ProjectComment {
  id: string;
  author: string;
  author_avatar?: string;
  message: string;
  created_at: string;
}

export type CreativeFileSection = 'provided' | 'client-provided' | 'print-files' | 'miscellaneous';
