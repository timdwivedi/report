"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

let trackerInitialized = false;

export function TrackingProvider({ orgId }: { orgId: string }) {
  const pathname = usePathname();
  const prevPathRef = useRef("");

  useEffect(() => {
    async function initTracker() {
      if (trackerInitialized || typeof window === "undefined") return;
      const { DiscoveryTracker } = await import("@/lib/analytics");
      DiscoveryTracker.init({
        orgId,
        endpoint: "/api/analytics/events",
        debug: process.env.NODE_ENV === "development",
      });
      trackerInitialized = true;
    }
    initTracker();
  }, [orgId]);

  useEffect(() => {
    if (pathname && pathname !== prevPathRef.current) {
      prevPathRef.current = pathname;
      import("@/lib/analytics").then(({ DiscoveryTracker }) => {
        const tracker = DiscoveryTracker.getInstance();
        if (tracker) {
          tracker.track("page_view", { path: pathname, title: document.title });
        }
      });
    }
  }, [pathname]);

  return null;
}
