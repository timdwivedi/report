import type { NavItem } from '@/lib/types/app';

export const SIDEBAR_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Clients', href: '/dashboard/clients', icon: 'Users' },
  { label: 'Projects', href: '/dashboard/projects', icon: 'Kanban', badge: 7 },
  { label: 'Orders', href: '/dashboard/orders', icon: 'Package', badge: 5 },
  { label: 'Products', href: '/dashboard/products', icon: 'ShoppingBag' },
  { label: 'Creative', href: '/dashboard/creative', icon: 'Palette' },
  { label: 'Vendors', href: '/dashboard/vendors', icon: 'Truck' },
  { label: 'Programs', href: '/dashboard/programs', icon: 'Building2' },
  { label: 'Tickets', href: '/dashboard/tickets', icon: 'Ticket' },
  { label: 'Commissions', href: '/dashboard/commissions', icon: 'DollarSign' },
  { label: 'Analytics', href: '/dashboard/analytics', icon: 'BarChart3' },
  { label: 'Settings', href: '/dashboard/settings', icon: 'Settings' },
];

export const PROJECT_STATUS_LABELS: Record<string, string> = {
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

export const PROJECT_STATUS_STYLES: Record<string, { bg: string; text: string }> = {
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

export const ORDER_STATUS_LABELS: Record<string, string> = {
  'order-entry-needed': 'Order Entry Needed',
  'in-production': 'In Production',
  'partially-shipped': 'Partially Shipped',
  'shipped': 'Shipped',
  'ready-for-invoicing': 'Ready for Invoicing',
  'invoiced': 'Invoiced',
  'cancelled': 'Cancelled',
};

export const ORDER_STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  'order-entry-needed': { bg: 'bg-red-100', text: 'text-red-700' },
  'in-production': { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  'partially-shipped': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'shipped': { bg: 'bg-green-100', text: 'text-green-700' },
  'ready-for-invoicing': { bg: 'bg-lime-100', text: 'text-lime-700' },
  'invoiced': { bg: 'bg-slate-100', text: 'text-slate-600' },
  'cancelled': { bg: 'bg-gray-100', text: 'text-gray-500' },
};

export const PROGRAM_STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  'active': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'paused': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'completed': { bg: 'bg-slate-100', text: 'text-slate-600' },
};

export const COMMISSION_STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  'pending': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  'confirmed': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'paid': { bg: 'bg-green-100', text: 'text-green-700' },
};

export const PRODUCT_TYPE_LABELS: Record<string, string> = {
  'contract': 'Contract',
  'all-in': 'All-In',
};

export const VENDOR_TYPE_LABELS: Record<string, string> = {
  'supplier': 'Supplier',
  'decorator': 'Decorator',
  'both': 'Supplier & Decorator',
};

export const PRODUCT_TYPE_DESCRIPTIONS: Record<string, string> = {
  'contract': 'Blank garment + decoration + margin',
  'all-in': 'Single vendor cost + margin',
};

export const DECORATION_METHOD_LABELS: Record<string, string> = {
  'screen-print': 'Screen Print',
  'embroidery': 'Embroidery',
  'dtg': 'DTG (Direct-to-Garment)',
  'heat-transfer': 'Heat Transfer',
  'sublimation': 'Sublimation',
  'laser-engrave': 'Laser Engrave',
  'pad-print': 'Pad Print',
  'deboss': 'Deboss',
  'other': 'Other',
};

export const DECORATION_LOCATION_PRESETS = [
  'Front Chest', 'Full Front', 'Full Back', 'Left Chest',
  'Right Chest', 'Left Sleeve', 'Right Sleeve', 'Collar',
  'Neckline', 'Pocket', 'Other'
] as const;

export const PRODUCT_CATEGORY_LABELS: Record<string, string> = {
  'short-sleeve-tees': 'Short Sleeve Tees',
  'long-sleeve-tees': 'Long Sleeve Tees',
  'sweatshirts-hoodies': 'Sweatshirts & Hoodies',
  'polos': 'Polos',
  'jackets-outerwear': 'Jackets & Outerwear',
  'hats-caps': 'Hats & Caps',
  'bags-totes': 'Bags & Totes',
  'drinkware': 'Drinkware',
  'office-supplies': 'Office Supplies',
  'tech-accessories': 'Tech Accessories',
  'stickers-patches': 'Stickers & Patches',
  'koozies': 'Koozies',
  'lanyards-badges': 'Lanyards & Badges',
  'other': 'Other',
};

export const CLIENT_PRIORITY_LABELS: Record<string, string> = {
  'vip': 'VIP',
  'standard': 'Standard',
  'at-risk': 'At Risk',
};

export const CLIENT_PRIORITY_COLORS: Record<string, string> = {
  'vip': 'bg-amber-100 text-amber-800',
  'standard': 'bg-slate-100 text-slate-600',
  'at-risk': 'bg-red-100 text-red-800',
};

// ===== ROUND 5 — NEW CONSTANTS =====

export const PRICE_CODE_DISCOUNTS: Record<string, number> = {
  'A': 0.50, 'B': 0.475, 'C': 0.45, 'D': 0.425, 'E': 0.40,
  'F': 0.375, 'G': 0.35, 'H': 0.325, 'L': 0.30, 'M': 0.25,
  'N': 0.20, 'P': 0.15, 'R': 0.10,
};

export const PRICE_CODE_LABELS: Record<string, string> = {
  'A': 'A (50% off)', 'B': 'B (47.5% off)', 'C': 'C (45% off)',
  'D': 'D (42.5% off)', 'E': 'E (40% off)', 'F': 'F (37.5% off)',
  'G': 'G (35% off)', 'H': 'H (32.5% off)', 'L': 'L (30% off)',
  'M': 'M (25% off)', 'N': 'N (20% off)', 'P': 'P (15% off)',
  'R': 'R (10% off)',
};

export const CONTACT_TYPE_LABELS: Record<string, string> = {
  'order': 'Order Contact',
  'finance': 'Finance',
  'shipping': 'Shipping',
  'billing': 'Billing',
  'general': 'General',
  'other': 'Other',
};

export const CREATIVE_REQUEST_TYPE_LABELS: Record<string, string> = {
  'branding-deck': 'Branding Deck',
  'tier-a-deck': 'Tier A Deck',
  'tier-b-deck': 'Tier B Deck',
  'tech-pack': 'Tech Pack',
  're-vector': 'Re-Vector',
  'single-mock': 'Single Mock',
  'other': 'Other',
};

export const TICKET_PRIORITY_STYLES: Record<string, { bg: string; text: string }> = {
  'low': { bg: 'bg-slate-100', text: 'text-slate-600' },
  'medium': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'high': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'critical': { bg: 'bg-red-100', text: 'text-red-700' },
};

export const US_STATES: { code: string; name: string }[] = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' }, { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' }, { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' }, { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' },
];
