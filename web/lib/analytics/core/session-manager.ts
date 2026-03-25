/**
 * Session Manager — Session ID, device detection, UTM capture
 *
 * Creates one session per browser tab visit. Stores session_id in
 * sessionStorage so it survives soft navigations but resets on new tab.
 * Captures device, browser, OS, UTM params, and referrer at session start.
 */

import type { SessionData } from "../types/analytics.types";

const SESSION_KEY = "bloom_analytics_session_id";

// ─── Device Detection ───────────────────────────────────────────────────────

function getDeviceType(): "mobile" | "tablet" | "desktop" {
  if (typeof navigator === "undefined") return "desktop";

  const ua = navigator.userAgent;
  if (/iPad|Android(?!.*Mobile)/i.test(ua)) return "tablet";
  if (/Mobile|iPhone|iPod|Android.*Mobile|webOS|BlackBerry/i.test(ua)) return "mobile";
  return "desktop";
}

function getBrowser(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;

  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("OPR/") || ua.includes("Opera/")) return "Opera";
  if (ua.includes("Chrome/") && !ua.includes("Edg/")) return "Chrome";
  if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "Safari";
  return "Other";
}

function getOS(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;

  if (ua.includes("Win")) return "Windows";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Linux") && !ua.includes("Android")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  return "Other";
}

// ─── UTM Capture ────────────────────────────────────────────────────────────

function captureUTM(): Pick<SessionData, "utm_source" | "utm_medium" | "utm_campaign" | "utm_content"> {
  if (typeof window === "undefined") {
    return { utm_source: null, utm_medium: null, utm_campaign: null, utm_content: null };
  }

  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_content: params.get("utm_content"),
  };
}

// ─── Session Manager ────────────────────────────────────────────────────────

export class SessionManager {
  private sessionData: SessionData | null = null;

  /** Get or create the session ID for this tab */
  getSessionId(): string {
    if (typeof sessionStorage === "undefined") {
      return this.generateId();
    }

    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = this.generateId();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  }

  /** Get full session data (creates session if needed) */
  getSession(): SessionData {
    if (this.sessionData) return this.sessionData;

    const utmData = captureUTM();

    this.sessionData = {
      session_id: this.getSessionId(),
      device_type: getDeviceType(),
      browser: getBrowser(),
      os: getOS(),
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
      utm_source: utmData.utm_source,
      utm_medium: utmData.utm_medium,
      utm_campaign: utmData.utm_campaign,
      utm_content: utmData.utm_content,
      landing_page: typeof window !== "undefined" ? window.location.pathname : "/",
      ab_assignments: {},
      created_at: new Date().toISOString(),
    };

    return this.sessionData;
  }

  /** Store A/B test assignment for this session */
  setABAssignment(testId: string, variantId: string): void {
    const session = this.getSession();
    session.ab_assignments[testId] = variantId;
  }

  /** Get A/B test assignment for this session */
  getABAssignment(testId: string): string | undefined {
    return this.getSession().ab_assignments[testId];
  }

  /** Check if this is a new session (first event) */
  isNewSession(): boolean {
    if (typeof sessionStorage === "undefined") return true;
    return sessionStorage.getItem(SESSION_KEY) === null;
  }

  /** Generate a random session ID using crypto API */
  private generateId(): string {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for older browsers
    return "xxxx-xxxx-xxxx".replace(/x/g, () =>
      Math.floor(Math.random() * 16).toString(16)
    );
  }
}
