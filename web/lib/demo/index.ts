// ===== DEMO MODE CHECK =====
export { isDemoMode } from './demo-data-provider';

// ===== LABEL MAPS & STYLE MAPS =====
export {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_STYLES,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
  PROGRAM_STATUS_STYLES,
  COMMISSION_STATUS_STYLES,
} from './demo-data-provider';

// ===== DEMO DATA TYPES =====
export type {
  DemoClient,
  DemoProject,
  DemoOrder,
  DemoProgram,
  DemoCommissionRecord,
  DemoStatCardData,
  DemoRecentActivity,
  DemoQuickAction,
  DemoTeamMember,
} from './demo-data-provider';

// ===== DEMO DATA GETTERS (raw data) =====
export {
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
  calculateROI,
  DEFAULT_CALCULATOR_INPUTS,
  // Dashboard flat stats
  getDemoDashboardStats,
  // Analytics
  getDemoPipelineStages,
  getDemoRevenueTrend,
  getDemoTopClients,
  getDemoAnalytics,
  // Settings display
  getDemoDecoratorMatrices,
  getDemoProductsList,
  getDemoProduct,
  getDemoProductsFull,
  getScrapedProductDemo,
  getDemoTeamMembers,
  // Project line items
  getDemoProjectLineItems,
  // Creative requests
  getDemoCreativeRequests,
  getAllDemoCreativeRequests,
  // Address books
  getDemoAddressBooks,
  // Project files
  getDemoProjectFiles,
  // Split shipments & shipments
  getDemoSplitShipments,
  getDemoShipments,
} from './demo-data-provider';

// ===== DEMO OR REAL WRAPPERS (for use in pages) =====
export {
  getDemoOrReal,
  getDemoOrRealSync,
  getClientsOrDemo,
  getProjectsOrDemo,
  getOrdersOrDemo,
  getProgramsOrDemo,
  getCommissionRecordsOrDemo,
  getStatsOrDemo,
  getRecentActivityOrDemo,
  getQuickActionsOrDemo,
  getCalculatorDefaultsOrDemo,
  getCalculatorResultsOrDemo,
} from './demo-data-wrapper';
