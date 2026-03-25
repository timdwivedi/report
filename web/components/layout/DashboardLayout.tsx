"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { useAuth } from '@/components/providers/AuthProvider'
import { useOrgContext } from '@/components/providers/OrgContextProvider'
import DemoToastProvider from '@/components/shared/DemoToastProvider'
import DemoNotifications from '@/components/shared/DemoNotifications'
import OrgSwitcher from '@/components/shared/OrgSwitcher'
import ImpersonationBanner from '@/components/shared/ImpersonationBanner'
import XRayToggle from '@/components/feedback/XRayToggle'
import ThemeToggle from '@/components/shared/ThemeToggle'
import { BrandMark } from '@/components/shared/BrandMark'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import CommandPalette from '@/components/shared/CommandPalette'
import ShortcutsHelpModal from '@/components/shared/ShortcutsHelpModal'
import {
  LayoutDashboard,
  Kanban,
  Users,
  Package,
  ShoppingBag,
  Truck,
  Building2,
  Ticket,
  DollarSign,
  BarChart3,
  Settings,
  Shield,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Paintbrush,
  Palette,
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  comingSoon?: boolean
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clients', href: '/dashboard/clients', icon: Users },
  { name: 'Projects', href: '/dashboard/projects', icon: Kanban, badge: 7 },
  { name: 'Orders', href: '/dashboard/orders', icon: Package, badge: 5 },
  { name: 'Products', href: '/dashboard/products', icon: ShoppingBag },
  { name: 'Creative', href: '/dashboard/creative', icon: Palette },
  { name: 'Decorations', href: '/dashboard/decorations', icon: Paintbrush },
  { name: 'Vendors', href: '/dashboard/vendors', icon: Truck },
  { name: 'Programs', href: '/dashboard/programs', icon: Building2 },
  { name: 'Tickets', href: '/dashboard/tickets', icon: Ticket, badge: 2 },
  { name: 'Commissions', href: '/dashboard/commissions', icon: DollarSign },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

// Domain-specific demo toast messages
const mockToastMessages = [
  { message: 'New project request from Raisin Canes — Q2 Uniform Rollout ($250K)', type: 'lead' as const },
  { message: 'Red Bull Nashville approved summer event order via portal', type: 'action' as const },
  { message: 'Order ORD-2026-0138 shipped — Nashville Sounds caps via UPS', type: 'sync' as const },
  { message: 'Artwork received: Threadbird front chest design uploaded', type: 'action' as const },
  { message: 'Progressive Insurance confirmed regional polo order ($22,000)', type: 'lead' as const },
  { message: 'Commission payout: $9,170 partner commission confirmed', type: 'metric' as const },
]

// Domain-specific demo notifications
const mockNotifications = [
  { id: '1', message: 'Raisin Canes submitted new project request', time: '12 min ago', read: false, type: 'lead' as const },
  { id: '2', message: 'Artwork uploaded by Red Bull Nashville', time: '1 hr ago', read: false, type: 'action' as const },
  { id: '3', message: 'Order shipped: Nashville Sounds caps', time: '2 hrs ago', read: false, type: 'action' as const },
  { id: '4', message: 'Progressive Insurance approved $22K order', time: '3 hrs ago', read: true, type: 'action' as const },
  { id: '5', message: 'Budget alert: Raisin Canes program at 68%', time: '1 day ago', read: true, type: 'alert' as const },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, isSuperAdmin } = useAuth()
  const { isViewingAs } = useOrgContext()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { commandPaletteOpen, setCommandPaletteOpen, shortcutsHelpOpen, setShortcutsHelpOpen } = useKeyboardShortcuts()

  // Get page title from pathname
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard'
    const segments = pathname.split('/')
    const lastSegment = segments[segments.length - 1]
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
  }

  return (
    <DemoToastProvider mockMessages={mockToastMessages}>
      <ImpersonationBanner />
      <div className={cn('min-h-screen bg-slate-50', isViewingAs && 'pt-10')}>
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transform transition-all duration-200 ease-in-out lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
            sidebarCollapsed ? 'w-[72px]' : 'w-[280px]'
          )}
        >
          {/* Logo / Brand */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200">
            <Link href="/dashboard" className="flex items-center gap-2">
              <BrandMark size={32} showText={!sidebarCollapsed} textClassName="text-lg font-bold text-slate-900" />
            </Link>
            <button
              className="lg:hidden p-1 hover:bg-slate-100 rounded-md"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 overflow-y-auto">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative',
                      isActive
                        ? 'bg-blue-50 text-blue-600 border-l-3 border-blue-500 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-400'
                        : 'text-slate-600 hover:bg-slate-100'
                    )}
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r" />
                    )}
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1">{item.name}</span>
                        {item.comingSoon ? (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-400 rounded">
                            Soon
                          </span>
                        ) : item.badge ? (
                          <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-600 rounded-full">
                            {item.badge}
                          </span>
                        ) : null}
                      </>
                    )}
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Admin link (super admin only) */}
          {isSuperAdmin && (
            <div className="px-3 pb-2">
              <Link
                href="/admin"
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  pathname.startsWith('/admin')
                    ? 'bg-red-50 text-red-600'
                    : 'text-red-600 hover:bg-red-50'
                )}
                title={sidebarCollapsed ? 'Admin Panel' : undefined}
              >
                <Shield className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>Admin Panel</span>}
              </Link>
            </div>
          )}

          {/* Collapse toggle (desktop only) */}
          <div className="hidden lg:block p-3 border-t border-slate-200">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="w-full flex items-center justify-center px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <>
                  <ChevronLeft className="h-5 w-5 mr-2" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className={cn(
          'transition-all duration-200',
          sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[280px]'
        )}>
          {/* Top bar */}
          <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5 text-slate-600" />
              </button>
              <h1 className="text-lg font-semibold text-slate-900">{getPageTitle()}</h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Org Switcher */}
              <OrgSwitcher />

              {/* Demo Notifications */}
              <DemoNotifications notifications={mockNotifications} />

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* X-Ray Mode Toggle */}
              <XRayToggle />

              {/* User avatar */}
              <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.email?.[0].toUpperCase() || 'T'}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>

      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
      <ShortcutsHelpModal isOpen={shortcutsHelpOpen} onClose={() => setShortcutsHelpOpen(false)} />
    </DemoToastProvider>
  )
}
