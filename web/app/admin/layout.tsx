"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import DemoToastProvider from '@/components/shared/DemoToastProvider'
import { BrandMark } from '@/components/shared/BrandMark'
import XRayToggle from '@/components/feedback/XRayToggle'
import {
  LayoutDashboard,
  Building2,
  Users,
  Activity,
  MessageSquareText,
  BookOpen,
  Settings,
  ArrowLeft,
  Menu,
  X,
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const adminNavigation: NavItem[] = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Accounts', href: '/admin/accounts', icon: Building2 },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Feedback', href: '/admin/feedback', icon: MessageSquareText },
  { name: 'How to Talk to Me', href: '/admin/guide', icon: BookOpen },
  { name: 'Health Monitor', href: '/admin/health', icon: Activity },
  { name: 'Platform Settings', href: '/admin/settings', icon: Settings },
]

const adminToastMessages = [
  { message: 'New account "Nashville Promo Co" activated', type: 'action' as const },
  { message: 'Health alert: Southern Merch Group inactive 25 days', type: 'alert' as const },
  { message: 'Platform revenue crossed $478K this quarter', type: 'metric' as const },
  { message: '85 Supply created 6 new projects this month', type: 'lead' as const },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <DemoToastProvider mockMessages={adminToastMessages} intervalMin={30} intervalMax={60}>
      <div className="min-h-screen bg-slate-50">
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
            'fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Logo + Admin badge */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <BrandMark size={32} showText textClassName="text-lg font-bold text-slate-900" />
              <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                Admin
              </span>
            </div>
            <button
              className="lg:hidden p-1 hover:bg-slate-100 rounded-md"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </div>

          {/* Back to Dashboard */}
          <div className="px-3 pt-3 pb-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 overflow-y-auto">
            <div className="space-y-1">
              {adminNavigation.map((item) => {
                const isActive =
                  item.href === '/admin'
                    ? pathname === '/admin'
                    : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </nav>
        </aside>

        {/* Main content area */}
        <div className="lg:pl-[280px]">
          {/* Header bar */}
          <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5 text-slate-600" />
              </button>
              <h1 className="text-lg font-semibold text-slate-900">BrandOps Admin</h1>
            </div>

            {/* X-Ray Mode toggle */}
            <XRayToggle />
          </header>

          {/* Page content */}
          <main className="p-6 min-h-screen">
            {children}
          </main>
        </div>
      </div>
    </DemoToastProvider>
  )
}
