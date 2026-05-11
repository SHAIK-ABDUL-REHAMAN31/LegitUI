"use client";

import React, { use, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PREVIEW_MAP } from "@/lib/preview-map";

// ────────────────────────────────────────────────────
// Parse URL search params into typed prop values
// ────────────────────────────────────────────────────
function parseSearchParamsToProps(
  searchParams: URLSearchParams
): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  searchParams.forEach((value, key) => {
    // Booleans
    if (value === "true") {
      props[key] = true;
      return;
    }
    if (value === "false") {
      props[key] = false;
      return;
    }
    // Numbers
    if (value !== "" && !isNaN(Number(value))) {
      props[key] = Number(value);
      return;
    }
    // JSON arrays/objects
    if (
      (value.startsWith("[") && value.endsWith("]")) ||
      (value.startsWith("{") && value.endsWith("}"))
    ) {
      try {
        props[key] = JSON.parse(value);
        return;
      } catch {
        /* fall through */
      }
    }
    // Default: string
    props[key] = value;
  });
  return props;
}

// ────────────────────────────────────────────────────
// Demo Content Overlay
// ────────────────────────────────────────────────────
function DemoContent({ title, desc }: { title: string; desc: string }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      <h1
        style={{
          fontSize: "clamp(2rem, 5vw, 3.2rem)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          marginBottom: "0.75rem",
          color: "#ffffff",
          textShadow:
            "0 2px 30px rgba(0,0,0,0.6), 0 0 60px rgba(168,85,247,0.15)",
        }}
      >
        {title}
      </h1>
      <p
        style={{
          fontSize: "clamp(0.85rem, 2vw, 1.05rem)",
          color: "rgba(255,255,255,0.6)",
          maxWidth: "480px",
          lineHeight: 1.6,
          textShadow: "0 1px 15px rgba(0,0,0,0.5)",
          textAlign: "center",
        }}
      >
        {desc}
      </p>
    </div>
  );
}

// ────────────────────────────────────────────────────
// Error Boundary
// ────────────────────────────────────────────────────
class ComponentErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    // Notify the parent window about the error
    if (typeof window !== "undefined") {
      window.parent.postMessage({ type: "ERROR", message: error.message }, window.location.origin);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            gap: "12px",
            background: "#1a0a0a",
          }}
        >
          <span style={{ fontSize: "24px", color: "#ef4444" }}>⚠</span>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>
            Preview Error
          </span>
          <span
            style={{
              fontSize: "12px",
              fontFamily: "monospace",
              color: "#f87171",
              maxWidth: "80%",
              textAlign: "center",
              padding: "0 20px",
            }}
          >
            {this.state.error?.message || "An unexpected error occurred."}
          </span>
        </div>
      );
    }
    return this.props.children;
  }
}

// ────────────────────────────────────────────────────
// Loading Skeleton
// ────────────────────────────────────────────────────
function PreviewSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#0a0a0a",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "rgba(168, 85, 247, 0.1)",
          boxShadow: "0 0 20px rgba(168, 85, 247, 0.2)",
          animation: "preview-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }}
      />
      <style>{`
        @keyframes preview-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .5; transform: scale(0.9); }
        }
      `}</style>
    </div>
  );
}

// ────────────────────────────────────────────────────
// Component Renderer
// ────────────────────────────────────────────────────
function ComponentRenderer({
  slug,
  initialProps,
  showDemoContent,
  demoTitle,
  demoDesc,
}: {
  slug: string;
  initialProps: Record<string, unknown>;
  showDemoContent: boolean;
  demoTitle: string;
  demoDesc: string;
}) {
  const loader = PREVIEW_MAP[slug as keyof typeof PREVIEW_MAP];

  if (!loader) {
    throw new Error(`Component "${slug}" not found in preview map.`);
  }

  // React.lazy handles the dynamic import + suspense integration natively.
  // We use useMemo so we don't recreate the lazy component on every render.
  const LazyComponent = React.useMemo(() => React.lazy(loader), [loader]);

  // Signal parent that we rendered successfully
  useEffect(() => {
    window.parent.postMessage({ type: "RENDERED" }, window.location.origin);
  }, []);

  const renderProps: Record<string, unknown> = { ...initialProps };
  if (showDemoContent) {
    renderProps.children = <DemoContent title={demoTitle} desc={demoDesc} />;
  }

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      <LazyComponent {...renderProps} />
    </div>
  );
}

// ────────────────────────────────────────────────────
// Main Client Component (Inner)
// ────────────────────────────────────────────────────
function PreviewClientInner({ slug }: { slug: string }) {
  const searchParams = useSearchParams();

  const [currentProps, setCurrentProps] = useState<Record<string, unknown>>(
    () => parseSearchParamsToProps(searchParams)
  );
  const [showDemoContent, setShowDemoContent] = useState(true);
  const [demoTitle, setDemoTitle] = useState("Preview");
  const [demoDesc, setDemoDesc] = useState("Interactive component preview");

  // Listen for postMessage from parent (prop updates, demo toggle)
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (!event.data?.type) return;

      if (event.data.type === "LEGITUI_UPDATE_PROPS") {
        setCurrentProps(event.data.props || {});
        if (event.data.showDemoContent !== undefined) {
          setShowDemoContent(event.data.showDemoContent);
        }
        if (event.data.demoTitle) setDemoTitle(event.data.demoTitle);
        if (event.data.demoDesc) setDemoDesc(event.data.demoDesc);
      }

      if (event.data.type === "SET_BACKGROUND") {
        setShowDemoContent(event.data.showDemoContent !== false);
      }
    };

    window.addEventListener("message", handler);
    // Signal ready
    window.parent.postMessage({ type: "READY" }, window.location.origin);

    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <ComponentRenderer
      slug={slug}
      initialProps={currentProps}
      showDemoContent={showDemoContent}
      demoTitle={demoTitle}
      demoDesc={demoDesc}
    />
  );
}

// ────────────────────────────────────────────────────
// Default Export Wrapper
// ────────────────────────────────────────────────────
export default function PreviewClient({ slug }: { slug: string }) {
  return (
    <ComponentErrorBoundary>
      <Suspense fallback={<PreviewSkeleton />}>
        <PreviewClientInner slug={slug} />
      </Suspense>
    </ComponentErrorBoundary>
  );
}
