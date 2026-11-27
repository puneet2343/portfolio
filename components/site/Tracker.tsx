"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Counts one page view per path change. No cookies, no IDs, nothing third-party. */
export function Tracker() {
  const path = usePathname();
  useEffect(() => {
    if (!path || navigator.webdriver) return;
    const body = JSON.stringify({ path });
    const t = setTimeout(() => {
      try {
        if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) {
          void fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } });
        }
      } catch {
        /* ignore */
      }
    }, 800);
    return () => clearTimeout(t);
  }, [path]);
  return null;
}
