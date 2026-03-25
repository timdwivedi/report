/**
 * Discovery Tracker — Main public API for client-side analytics
 *
 * Usage:
 *   const tracker = DiscoveryTracker.init({ orgId, endpoint: "/api/analytics/events" });
 *   tracker.track("quiz_start", { quiz_version: "v1" });
 *   tracker.track("bridge_cta_click", { cta_text: "Apply Now" });
 *   const variant = tracker.getVariant("bridge-cta-framing");
 *   tracker.flush(); // sends remaining batch on unload
 *
 * Features:
 *   - Batches events (configurable size + interval)
 *   - navigator.sendBeacon primary, fetch keepalive fallback
 *   - Session ID from crypto.randomUUID(), stored in sessionStorage
 *   - A/B variant assignment via deterministic hash (murmur3)
 *   - Auto-flush on page unload
 *   - SSR-safe (no-ops on server)
 */

import type {
  AnalyticsEvent,
  TrackerConfig,
} from "../types/analytics.types";
import { validateEvent, inferFunnelStage } from "../config/events.config";
import { SessionManager } from "./session-manager";
import { BeaconTransport } from "./beacon-transport";

const DEFAULT_BATCH_SIZE = 5;
const DEFAULT_FLUSH_INTERVAL = 3000; // 3 seconds

export class DiscoveryTracker {
  private config: Required<TrackerConfig>;
  private session: SessionManager;
  private transport: BeaconTransport;
  private eventQueue: AnalyticsEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private sessionSent = false;
  private static instance: DiscoveryTracker | null = null;

  private constructor(config: TrackerConfig) {
    this.config = {
      orgId: config.orgId,
      endpoint: config.endpoint,
      batchSize: config.batchSize ?? DEFAULT_BATCH_SIZE,
      flushInterval: config.flushInterval ?? DEFAULT_FLUSH_INTERVAL,
      debug: config.debug ?? false,
    };

    this.session = new SessionManager();
    this.transport = new BeaconTransport({
      endpoint: this.config.endpoint,
      debug: this.config.debug,
    });

    this.startFlushTimer();
    this.registerUnloadHandler();
  }

  /** Initialize tracker (singleton per page) */
  static init(config: TrackerConfig): DiscoveryTracker {
    if (typeof window === "undefined") {
      // Return a no-op tracker for SSR
      return new DiscoveryTracker(config);
    }

    if (!DiscoveryTracker.instance) {
      DiscoveryTracker.instance = new DiscoveryTracker(config);
    }
    return DiscoveryTracker.instance;
  }

  /** Get existing instance (returns null if not initialized) */
  static getInstance(): DiscoveryTracker | null {
    return DiscoveryTracker.instance;
  }

  /** Track an analytics event */
  track(eventType: string, properties: Record<string, unknown> = {}): void {
    if (typeof window === "undefined") return;

    // Validate event properties
    const validation = validateEvent(eventType, properties);
    if (!validation.valid && this.config.debug) {
      console.warn(
        `[analytics] Missing required properties for ${eventType}:`,
        validation.missing
      );
    }

    // Infer funnel stage
    const funnelStage = inferFunnelStage(eventType, properties);

    const event: AnalyticsEvent = {
      event_type: eventType,
      session_id: this.session.getSessionId(),
      org_id: this.config.orgId,
      event_category: this.inferCategory(eventType),
      properties,
      page_path: window.location.pathname,
      funnel_stage: funnelStage,
      quiz_submission_id: (properties.submission_id as string) ?? null,
      ab_test_id: (properties.ab_test_id as string) ?? null,
      ab_variant: (properties.ab_variant as string) ?? null,
      duration_ms: (properties.duration_ms as number) ?? null,
      created_at: new Date().toISOString(),
    };

    this.eventQueue.push(event);

    if (this.config.debug) {
      console.log("[analytics] queued:", eventType, properties);
    }

    // Flush if batch is full
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /** Get A/B test variant for this session (deterministic) */
  getVariant(testId: string, variants?: { id: string; weight: number }[]): string | null {
    // Check if already assigned
    const existing = this.session.getABAssignment(testId);
    if (existing) return existing;

    if (!variants || variants.length === 0) return null;

    // Deterministic assignment via murmur3 hash
    const sessionId = this.session.getSessionId();
    const hash = murmur3(sessionId + testId);
    const bucket = Math.abs(hash) % 100;

    // Walk through weights to find variant
    let cumulative = 0;
    for (const variant of variants) {
      cumulative += variant.weight;
      if (bucket < cumulative) {
        this.session.setABAssignment(testId, variant.id);
        return variant.id;
      }
    }

    // Fallback to last variant
    const fallback = variants[variants.length - 1].id;
    this.session.setABAssignment(testId, fallback);
    return fallback;
  }

  /** Flush all queued events immediately */
  flush(): void {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    const session = this.session.getSession();

    // Include session data with first batch
    if (!this.sessionSent) {
      this.sessionSent = true;
    }

    this.transport.send({ session, events });
  }

  /** Stop the tracker and flush remaining events */
  destroy(): void {
    this.flush();
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    DiscoveryTracker.instance = null;
  }

  /** Get current session ID */
  getSessionId(): string {
    return this.session.getSessionId();
  }

  // ─── Private Methods ────────────────────────────────────────────────────

  private inferCategory(eventType: string): AnalyticsEvent["event_category"] {
    if (eventType.includes("submit") || eventType.includes("cta_click")) return "conversion";
    if (eventType.includes("view") || eventType.includes("scroll") || eventType.includes("select") || eventType.includes("video")) return "engagement";
    if (eventType.includes("quiz_") || eventType.includes("bridge_view") || eventType.includes("application_start")) return "funnel";
    return "engagement";
  }

  private startFlushTimer(): void {
    if (typeof setInterval === "undefined") return;
    this.flushTimer = setInterval(() => this.flush(), this.config.flushInterval);
  }

  private registerUnloadHandler(): void {
    if (typeof window === "undefined") return;

    // Use both pagehide and beforeunload for maximum coverage
    const handler = () => this.flush();
    window.addEventListener("pagehide", handler);
    window.addEventListener("beforeunload", handler);
  }
}

// ─── Murmur3 Hash (Deterministic A/B Assignment) ────────────────────────────

/**
 * MurmurHash3 (32-bit) — fast, non-cryptographic hash.
 * Used for deterministic A/B variant assignment.
 * Same session + test always gets the same variant, no cookies needed.
 */
function murmur3(key: string, seed: number = 0): number {
  let h = seed;
  const len = key.length;
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;

  let i = 0;
  while (i + 4 <= len) {
    let k =
      (key.charCodeAt(i) & 0xff) |
      ((key.charCodeAt(i + 1) & 0xff) << 8) |
      ((key.charCodeAt(i + 2) & 0xff) << 16) |
      ((key.charCodeAt(i + 3) & 0xff) << 24);

    k = Math.imul(k, c1);
    k = (k << 15) | (k >>> 17);
    k = Math.imul(k, c2);

    h ^= k;
    h = (h << 13) | (h >>> 19);
    h = Math.imul(h, 5) + 0xe6546b64;

    i += 4;
  }

  // Handle remaining bytes
  let k = 0;
  switch (len - i) {
    case 3:
      k ^= (key.charCodeAt(i + 2) & 0xff) << 16;
    // falls through
    case 2:
      k ^= (key.charCodeAt(i + 1) & 0xff) << 8;
    // falls through
    case 1:
      k ^= key.charCodeAt(i) & 0xff;
      k = Math.imul(k, c1);
      k = (k << 15) | (k >>> 17);
      k = Math.imul(k, c2);
      h ^= k;
  }

  // Finalize
  h ^= len;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;

  return h >>> 0; // Unsigned 32-bit
}
