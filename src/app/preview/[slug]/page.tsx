// ════════════════════════════════════════════════════════════════
// Preview Route — Phase 6: Streaming Server Component Shell
// ════════════════════════════════════════════════════════════════
// The Server Component renders the shell HTML INSTANTLY (zero JS),
// then streams the client-side PreviewClient via Suspense.
//
// Flow:
//   1. Browser receives the skeleton HTML immediately (SSR-streamed)
//   2. PreviewClient JS loads in the background
//   3. Component renders and replaces the skeleton
//
// This is faster than the old approach where the entire page waited
// for the client bundle before showing anything.
// ════════════════════════════════════════════════════════════════

import { Suspense } from "react";
import { PREVIEW_MAP } from "@/lib/preview-map";
import PreviewClient from "./PreviewClient";

// Cache for 1 hour — component metadata doesn't change often
export const revalidate = 3600;

// Pre-render all preview routes at build time
export async function generateStaticParams() {
  return Object.keys(PREVIEW_MAP).map((slug) => ({ slug }));
}

/**
 * Server-streamed skeleton — this HTML is sent to the browser
 * BEFORE any client JS loads. Pure HTML, zero JS, instant.
 */
function StreamedSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100vh",
        background: "#000000",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(90deg, #0a0a0a 25%, #141414 50%, #0a0a0a 75%)",
          backgroundSize: "200% 100%",
          animation: "preview-shimmer 1.5s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes preview-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Validate slug exists — fail fast with a clear error
  if (!PREVIEW_MAP[slug]) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          color: "#ef4444",
          fontFamily: "monospace",
          fontSize: "14px",
          background: "#000000",
        }}
      >
        Component not found: {slug}
      </div>
    );
  }

  return (
    // The Suspense boundary is in the SERVER component.
    // StreamedSkeleton HTML is sent to the browser IMMEDIATELY.
    // PreviewClient JS loads and hydrates in the background.
    <Suspense fallback={<StreamedSkeleton />}>
      <PreviewClient slug={slug} />
    </Suspense>
  );
}
