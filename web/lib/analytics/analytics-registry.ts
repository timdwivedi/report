/**
 * Analytics Registry — Module Detection for Agent Routing
 *
 * Follows the same pattern as intelligence-registry.ts.
 * Spec Agent reads this to decide which analytics modules to enable.
 * Agent 5 (Welder) reads enabled modules to know which files to wire.
 */

export interface AnalyticsModule {
  /** Unique module identifier */
  id: string;

  /** Human-readable name */
  name: string;

  /** What this module does (1 line) */
  description: string;

  /** Files that belong to this module (relative to bloom/web/lib/analytics/) */
  files: string[];

  /** Other module IDs this depends on */
  dependencies: string[];

  /** Database tables this module needs */
  tables: string[];

  /** Keywords in client intake that suggest this module is needed */
  detectionKeywords: string[];

  /** Whether this module should ALWAYS be included in builds */
  alwaysInclude: boolean;
}

export const ANALYTICS_MODULES: AnalyticsModule[] = [
  // ─── Core Tracking (always included for discovery builds) ────────────
  {
    id: "discovery-tracking",
    name: "Discovery Funnel Tracking",
    description: "Client-side event tracking for quiz, bridge, application funnel",
    files: [
      "core/tracker.ts",
      "core/beacon-transport.ts",
      "core/session-manager.ts",
    ],
    dependencies: ["types", "config"],
    tables: ["analytics_events", "analytics_sessions"],
    detectionKeywords: [
      "quiz", "discovery", "assessment", "funnel", "diagnostic",
      "bridge page", "archetype", "personality", "results page",
    ],
    alwaysInclude: true,
  },

  // ─── Funnel Analytics Dashboard ──────────────────────────────────────
  {
    id: "funnel-analytics",
    name: "Funnel Analytics Dashboard",
    description: "Conversion funnel visualization, archetype distribution, daily aggregates",
    files: [
      "core/funnel-calculator.ts",
      "core/aggregator.ts",
      "ui/FunnelChart.tsx",
      "ui/ArchetypeDistribution.tsx",
      "ui/MetricCard.tsx",
      "ui/ConversionTrend.tsx",
    ],
    dependencies: ["discovery-tracking"],
    tables: ["discovery_funnel_daily"],
    detectionKeywords: [
      "analytics", "dashboard", "conversion", "funnel", "metrics",
    ],
    alwaysInclude: true,
  },

  // ─── Question Heat Map ───────────────────────────────────────────────
  {
    id: "question-heatmap",
    name: "Question Heat Map",
    description: "Per-question analytics: time spent, drop-off rates, input method split",
    files: ["ui/HeatMap.tsx"],
    dependencies: ["discovery-tracking"],
    tables: ["analytics_events"],
    detectionKeywords: ["heatmap", "question", "drop-off", "engagement"],
    alwaysInclude: false,
  },

  // ─── A/B Testing ─────────────────────────────────────────────────────
  {
    id: "ab-testing",
    name: "A/B Testing Framework",
    description: "Variant assignment, event attribution, statistical significance",
    files: [
      "core/ab-test-engine.ts",
      "ui/ABTestCard.tsx",
    ],
    dependencies: ["discovery-tracking"],
    tables: ["ab_tests", "ab_test_assignments"],
    detectionKeywords: ["test", "experiment", "variant", "A/B", "split test"],
    alwaysInclude: false,
  },

  // ─── Infrastructure (always included) ────────────────────────────────
  {
    id: "types",
    name: "Type System",
    description: "All TypeScript interfaces for the analytics engine",
    files: ["types/analytics.types.ts"],
    dependencies: [],
    tables: [],
    detectionKeywords: [],
    alwaysInclude: true,
  },
  {
    id: "config",
    name: "Configuration System",
    description: "AnalyticsConfig interface + event taxonomy",
    files: [
      "config/analytics.config.ts",
      "config/events.config.ts",
    ],
    dependencies: [],
    tables: [],
    detectionKeywords: [],
    alwaysInclude: true,
  },
  {
    id: "demo",
    name: "Demo Data Layer",
    description: "Full analytics demo with realistic funnel data — zero DB, zero API",
    files: [
      "demo/index.ts",
      "demo/analytics-demo-data.ts",
      "demo/analytics-demo-wrapper.ts",
    ],
    dependencies: [],
    tables: [],
    detectionKeywords: ["demo", "prototype", "preview"],
    alwaysInclude: true,
  },
  {
    id: "ui",
    name: "UI Components",
    description: "FunnelChart, MetricCard, HeatMap, ABTestCard — config-driven display",
    files: [
      "ui/index.ts",
      "ui/FunnelChart.tsx",
      "ui/ArchetypeDistribution.tsx",
      "ui/MetricCard.tsx",
      "ui/HeatMap.tsx",
      "ui/ABTestCard.tsx",
      "ui/ConversionTrend.tsx",
    ],
    dependencies: ["types"],
    tables: [],
    detectionKeywords: [],
    alwaysInclude: true,
  },
];

// ─── Query Helpers ──────────────────────────────────────────────────────────

/** Get all modules that should be included for a build */
export function getEnabledModules(enabledIds: string[]): AnalyticsModule[] {
  const enabled = new Set(enabledIds);
  const result = ANALYTICS_MODULES.filter(
    (m) => m.alwaysInclude || enabled.has(m.id)
  );

  // Resolve dependencies
  const resolved = new Set(result.map((m) => m.id));
  let changed = true;
  while (changed) {
    changed = false;
    for (const mod of result) {
      for (const dep of mod.dependencies) {
        if (!resolved.has(dep)) {
          const depModule = ANALYTICS_MODULES.find((m) => m.id === dep);
          if (depModule) {
            result.push(depModule);
            resolved.add(dep);
            changed = true;
          }
        }
      }
    }
  }

  return result;
}

/** Get all files needed for enabled modules */
export function getRequiredFiles(enabledIds: string[]): string[] {
  const modules = getEnabledModules(enabledIds);
  const files = new Set<string>();
  for (const mod of modules) {
    for (const file of mod.files) {
      files.add(file);
    }
  }
  files.add("index.ts");
  return Array.from(files).sort();
}

/** Get all tables needed for enabled modules */
export function getRequiredTables(enabledIds: string[]): string[] {
  const modules = getEnabledModules(enabledIds);
  const tables = new Set<string>();
  for (const mod of modules) {
    for (const table of mod.tables) {
      tables.add(table);
    }
  }
  return Array.from(tables).sort();
}

/** Detect which modules are relevant based on client intake */
export function detectModulesFromIntake(intakeText: string): string[] {
  const lower = intakeText.toLowerCase();
  const detected = new Set<string>();

  for (const mod of ANALYTICS_MODULES) {
    if (mod.alwaysInclude) {
      detected.add(mod.id);
      continue;
    }
    for (const keyword of mod.detectionKeywords) {
      if (lower.includes(keyword.toLowerCase())) {
        detected.add(mod.id);
        break;
      }
    }
  }

  return Array.from(detected);
}

/** Get module by ID */
export function getModule(id: string): AnalyticsModule | undefined {
  return ANALYTICS_MODULES.find((m) => m.id === id);
}
