import type { NavItem } from '@/lib/types/app';

// Main sidebar navigation for dashboard
export const SIDEBAR_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Projects', href: '/dashboard/projects', icon: 'Kanban', badge: 7 },
  { label: 'Clients', href: '/dashboard/clients', icon: 'Users' },
  { label: 'Orders', href: '/dashboard/orders', icon: 'Package', badge: 5 },
  { label: 'Creative', href: '/dashboard/creative', icon: 'Palette' },
  { label: 'Programs', href: '/dashboard/programs', icon: 'Building2' },
  { label: 'Commissions', href: '/dashboard/commissions', icon: 'DollarSign' },
  { label: 'Analytics', href: '/dashboard/analytics', icon: 'BarChart3' },
  { label: 'Settings', href: '/dashboard/settings', icon: 'Settings' },
];

// Public header navigation
export const PUBLIC_NAV = [
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Calculator', href: '/calculator' },
  { label: 'Login', href: '/login' },
];
