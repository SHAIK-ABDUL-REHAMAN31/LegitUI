"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { PREVIEW_MAP, type ComponentWeight } from "@/lib/preview-map";

// ════════════════════════════════════════════════════════════════
// PreviewWarmer — Background Route Prefetcher
// ════════════════════════════════════════════════════════════════
// Silently prefetches preview routes in the background after the
// app shell finishes loading. Uses weight metadata from PREVIEW_MAP
// to warm light components first, heavy components last.
// ════════════════════════════════════════════════════════════════

/** Weight priority order — light first, extreme last */
const WEIGHT_ORDER: Record<ComponentWeight, number> = {
  light: 0,
  medium: 1,
  heavy: 2,
  extreme: 3,
};

/**
 * Dynamically build the prefetch list from PREVIEW_MAP,
 * sorted by weight so light components warm first.
 */
const PRIORITY_SLUGS = Object.entries(PREVIEW_MAP)
  .sort(([, a], [, b]) => WEIGHT_ORDER[a.weight] - WEIGHT_ORDER[b.weight])
  .map(([slug]) => slug);

/** Module-level Set to track already-warmed slugs (shared with DocsSidebar prefetch) */
const warmedSlugs = new Set<string>();

/**
 * Inject a `<link rel="prefetch">` for a single preview route.
 * This tells the browser to fetch the route in idle time.
 */
function injectPrefetchLink(slug: string): void {
  if (warmedSlugs.has(slug)) return;
  warmedSlugs.add(slug);

  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = `/preview/${slug}`;
  link.as = "document";
  document.head.appendChild(link);
}

/**
 * Check if the browser supports `requestIdleCallback` and use it,
 * otherwise fall back to setTimeout with 1ms delay.
 */
function whenIdle(callback: () => void): void {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(callback);
  } else {
    setTimeout(callback, 1);
  }
}

export default function PreviewWarmer() {
  const pathname = usePathname();
  const hasWarmedRef = useRef(false);

  useEffect(() => {
    // Don't warm if we're already inside a preview route (iframe context)
    if (pathname.startsWith("/preview")) return;

    // Only warm once per app lifecycle
    if (hasWarmedRef.current) return;
    hasWarmedRef.current = true;

    // Wait 2 seconds for the initial page render to fully settle.
    // This ensures we don't compete with the user's current page load.
    const initialDelay = setTimeout(() => {
      let index = 0;

      function warmNext() {
        if (index >= PRIORITY_SLUGS.length) return;

        const slug = PRIORITY_SLUGS[index];
        index++;

        // Use requestIdleCallback so we only warm when the browser is idle
        whenIdle(() => {
          injectPrefetchLink(slug);

          // Stagger next prefetch by 300ms to avoid network congestion
          setTimeout(warmNext, 300);
        });
      }

      warmNext();
    }, 2000);

    return () => clearTimeout(initialDelay);
  }, [pathname]);

  // No UI — purely a background prefetch runner
  return null;
}
