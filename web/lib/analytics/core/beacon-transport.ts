/**
 * Beacon Transport — navigator.sendBeacon wrapper with fetch fallback
 *
 * Primary: navigator.sendBeacon — non-blocking, survives page unload.
 * Fallback: fetch with keepalive — for browsers/contexts without sendBeacon.
 *
 * Handles batching, retry queue, and unload flushing.
 */

import type { AnalyticsEvent, SessionData } from "../types/analytics.types";

interface TransportPayload {
  session: SessionData;
  events: AnalyticsEvent[];
}

interface TransportOptions {
  endpoint: string;
  debug?: boolean;
}

export class BeaconTransport {
  private endpoint: string;
  private debug: boolean;
  private failedQueue: TransportPayload[] = [];

  constructor(options: TransportOptions) {
    this.endpoint = options.endpoint;
    this.debug = options.debug ?? false;
  }

  /** Send a batch of events with session data */
  send(payload: TransportPayload): boolean {
    const json = JSON.stringify(payload);

    if (this.debug) {
      console.log("[analytics] sending", payload.events.length, "events");
    }

    // Primary: sendBeacon (non-blocking, works during unload)
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([json], { type: "application/json" });
      const sent = navigator.sendBeacon(this.endpoint, blob);

      if (sent) {
        this.drainFailedQueue();
        return true;
      }

      // sendBeacon can fail if payload > ~64KB, fall through to fetch
      if (this.debug) {
        console.warn("[analytics] sendBeacon failed, trying fetch");
      }
    }

    // Fallback: fetch with keepalive
    this.fetchFallback(json);
    return true;
  }

  /** Retry any previously failed payloads */
  private drainFailedQueue(): void {
    if (this.failedQueue.length === 0) return;

    const queue = [...this.failedQueue];
    this.failedQueue = [];

    for (const payload of queue) {
      this.send(payload);
    }
  }

  /** Fetch fallback for when sendBeacon is unavailable */
  private fetchFallback(json: string): void {
    if (typeof fetch === "undefined") return;

    fetch(this.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: json,
      keepalive: true,
    }).catch(() => {
      // If fetch also fails, queue for next attempt
      try {
        const payload = JSON.parse(json) as TransportPayload;
        if (this.failedQueue.length < 10) {
          this.failedQueue.push(payload);
        }
      } catch {
        // Discard malformed payload
      }
    });
  }

  /** Get count of queued (failed) payloads */
  getQueueSize(): number {
    return this.failedQueue.length;
  }
}
