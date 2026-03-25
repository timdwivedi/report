import { isDemoMode } from './demo-data-provider';

/**
 * Generic async wrapper that routes between demo and real data based on demo mode
 *
 * @param demoFn - Function that returns demo data
 * @param realFn - Optional function that returns real data (defaults to demo if not provided)
 * @returns Promise of data (demo or real based on mode)
 */
export async function getDemoOrReal<T>(
  demoFn: () => T | Promise<T>,
  realFn?: () => T | Promise<T>
): Promise<T> {
  if (isDemoMode() || !realFn) {
    return Promise.resolve(demoFn());
  }
  return Promise.resolve(realFn());
}

/**
 * Generic sync wrapper that routes between demo and real data based on demo mode
 *
 * @param demoFn - Function that returns demo data
 * @param realFn - Optional function that returns real data (defaults to demo if not provided)
 * @returns Data (demo or real based on mode)
 */
export function getDemoOrRealSync<T>(
  demoFn: () => T,
  realFn?: () => T
): T {
  if (isDemoMode() || !realFn) {
    return demoFn();
  }
  return realFn();
}

// ===== PRE-WIRED WRAPPERS =====

import {
  getDemoClients,
  getDemoProjects,
  getDemoOrders,
  getDemoPrograms,
  getDemoCommissionRecords,
  getDemoStats,
  getDemoRecentActivity,
  getDemoQuickActions,
  getDemoCalculatorDefaults,
  getDemoCalculatorResults,
  type DemoClient,
  type DemoProject,
  type DemoOrder,
  type DemoProgram,
  type DemoCommissionRecord,
  type DemoStatCardData,
  type DemoRecentActivity,
  type DemoQuickAction,
} from './demo-data-provider';

import type { CalculatorInputs, CalculatorResults } from '@/lib/types/app';

/**
 * Get clients (demo or real)
 * @param realFn - Optional function to fetch real clients from Supabase
 */
export async function getClientsOrDemo(
  realFn?: () => Promise<DemoClient[]>
): Promise<DemoClient[]> {
  return getDemoOrReal(getDemoClients, realFn);
}

/**
 * Get projects (demo or real)
 * @param filters - Optional filters (e.g., { status: 'active', client_id: '123' })
 * @param realFn - Optional function to fetch real projects from Supabase
 */
export async function getProjectsOrDemo(
  filters?: Record<string, unknown>,
  realFn?: () => Promise<DemoProject[]>
): Promise<DemoProject[]> {
  if (isDemoMode() || !realFn) {
    let projects = getDemoProjects();

    // Apply filters if provided
    if (filters) {
      if (filters.status) {
        projects = projects.filter(p => p.status === filters.status);
      }
      if (filters.client_id) {
        projects = projects.filter(p => p.client_id === filters.client_id);
      }
      if (filters.is_critical !== undefined) {
        projects = projects.filter(p => p.is_critical === filters.is_critical);
      }
    }

    return Promise.resolve(projects);
  }
  return realFn();
}

/**
 * Get orders (demo or real)
 * @param filters - Optional filters (e.g., { status: 'shipped', project_id: '123' })
 * @param realFn - Optional function to fetch real orders from Supabase
 */
export async function getOrdersOrDemo(
  filters?: Record<string, unknown>,
  realFn?: () => Promise<DemoOrder[]>
): Promise<DemoOrder[]> {
  if (isDemoMode() || !realFn) {
    let orders = getDemoOrders();

    // Apply filters if provided
    if (filters) {
      if (filters.status) {
        orders = orders.filter(o => o.status === filters.status);
      }
      if (filters.project_id) {
        orders = orders.filter(o => o.project_id === filters.project_id);
      }
    }

    return Promise.resolve(orders);
  }
  return realFn();
}

/**
 * Get programs (demo or real)
 * @param realFn - Optional function to fetch real programs from Supabase
 */
export async function getProgramsOrDemo(
  realFn?: () => Promise<DemoProgram[]>
): Promise<DemoProgram[]> {
  return getDemoOrReal(getDemoPrograms, realFn);
}

/**
 * Get commission records (demo or real)
 * @param filters - Optional filters (e.g., { period: '2026-02', status: 'paid' })
 * @param realFn - Optional function to fetch real commission records from Supabase
 */
export async function getCommissionRecordsOrDemo(
  filters?: Record<string, unknown>,
  realFn?: () => Promise<DemoCommissionRecord[]>
): Promise<DemoCommissionRecord[]> {
  if (isDemoMode() || !realFn) {
    let records = getDemoCommissionRecords();

    // Apply filters if provided
    if (filters) {
      if (filters.period) {
        records = records.filter(r => r.period === filters.period);
      }
      if (filters.status) {
        records = records.filter(r => r.status === filters.status);
      }
    }

    return Promise.resolve(records);
  }
  return realFn();
}

/**
 * Get dashboard stats (demo or real)
 * @param realFn - Optional function to calculate real stats from Supabase
 */
export async function getStatsOrDemo(
  realFn?: () => Promise<DemoStatCardData[]>
): Promise<DemoStatCardData[]> {
  return getDemoOrReal(getDemoStats, realFn);
}

/**
 * Get recent activity feed (demo or real)
 * @param realFn - Optional function to fetch real activity from Supabase
 */
export async function getRecentActivityOrDemo(
  realFn?: () => Promise<DemoRecentActivity[]>
): Promise<DemoRecentActivity[]> {
  return getDemoOrReal(getDemoRecentActivity, realFn);
}

/**
 * Get quick actions (demo or real)
 * @param realFn - Optional function to generate real quick actions
 */
export async function getQuickActionsOrDemo(
  realFn?: () => Promise<DemoQuickAction[]>
): Promise<DemoQuickAction[]> {
  return getDemoOrReal(getDemoQuickActions, realFn);
}

/**
 * Get calculator default inputs
 */
export function getCalculatorDefaultsOrDemo(): CalculatorInputs {
  return getDemoCalculatorDefaults();
}

/**
 * Get calculator results (demo or real)
 * @param inputs - Calculator inputs
 * @param realFn - Optional function to calculate real results
 */
export function getCalculatorResultsOrDemo(
  inputs?: CalculatorInputs,
  realFn?: (inputs: CalculatorInputs) => CalculatorResults
): CalculatorResults {
  if (isDemoMode() || !realFn) {
    return inputs ? getDemoOrRealSync(() => getDemoCalculatorResults()) : getDemoCalculatorResults();
  }
  return realFn(inputs || getDemoCalculatorDefaults());
}
