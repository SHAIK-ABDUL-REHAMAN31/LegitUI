import type { Metadata } from "next";

/**
 * Preview Layout — Minimal, no navigation chrome.
 *
 * This is a nested layout under the root layout.tsx, so it MUST NOT
 * render <html> or <body> tags (those come from the root layout).
 * Instead, it hides the global navbar and renders children full-screen.
 */

// Preview routes should not appear in search results
export const metadata: Metadata = {
  robots: "noindex, nofollow",
};

// Aggressive 24-hour cache in production — component code rarely changes
export const revalidate = 86400;

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Hide global navbar and sidebar when in preview mode */}
      <style>{`
        nav, .docs-sidebar, header { display: none !important; }
        main { padding: 0 !important; margin: 0 !important; }
        body { overflow: auto !important; margin: 0 !important; }
      `}</style>
      <div
        style={{
          width: '100vw',
          minHeight: '100vh',
          background: '#000000',
          position: 'absolute',
          inset: 0,
          zIndex: 9999,
        }}
      >
        {children}
      </div>
    </>
  );
}
