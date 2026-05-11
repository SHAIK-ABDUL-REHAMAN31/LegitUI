"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import styles from "./ComponentPreview.module.css";

/* ────────────────────────────────────────────────────
   ComponentPreview — Phase 1 Production Upgrade
   ────────────────────────────────────────────────────
   Uses a native Next.js route (/preview/[slug]) inside
   an iframe instead of the old Babel-in-browser srcDoc.

   - No CDN dependencies
   - No @babel/standalone
   - No eval() / new Function()
   - Props sent via postMessage
   ──────────────────────────────────────────────────── */

interface ComponentPreviewProps {
  slug: string;
  initialProps?: Record<string, unknown>;
  currentProps?: Record<string, unknown>;
  showDemoContent?: boolean;
  componentName?: string;
  componentDesc?: string;
  height?: number;
  className?: string;
  // Legacy props (kept for backward compat, but no longer drive behavior)
  code?: string;
  customProps?: Record<string, unknown>;
}

export default function ComponentPreview({
  slug,
  initialProps,
  currentProps,
  showDemoContent = true,
  componentName,
  componentDesc,
  height = 480,
  className,
  // Legacy destructure — `customProps` is aliased to currentProps for compat
  code: _code,
  customProps,
}: ComponentPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewState, setPreviewState] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const iframeReadyRef = useRef(false);

  // Resolve which props to use (support both new `currentProps` and legacy `customProps`)
  const resolvedProps = currentProps || customProps || initialProps || {};

  // ── Build the iframe src URL ──
  const iframeSrc = buildPreviewUrl(slug, initialProps || resolvedProps);

  // ── Message handler from iframe ──
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (!event.data?.type) return;

      switch (event.data.type) {
        case "READY":
          iframeReadyRef.current = true;
          // Send initial props after iframe signals ready
          sendPropsUpdate();
          break;
        case "RENDERED":
          setPreviewState("ready");
          setErrorMessage(null);
          break;
        case "ERROR":
          setPreviewState("error");
          setErrorMessage(event.data.message || "Unknown error");
          break;
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // ── Send prop updates via postMessage ──
  const sendPropsUpdate = useCallback(() => {
    if (!iframeRef.current?.contentWindow || !iframeReadyRef.current) return;

    iframeRef.current.contentWindow.postMessage(
      {
        type: "LEGITUI_UPDATE_PROPS",
        props: resolvedProps,
        showDemoContent,
        demoTitle: componentName || "Preview",
        demoDesc: componentDesc || "Interactive component preview",
      },
      window.location.origin
    );
  }, [resolvedProps, showDemoContent, componentName, componentDesc]);

  // ── When props/showDemoContent change, push update to iframe ──
  useEffect(() => {
    if (iframeReadyRef.current) {
      sendPropsUpdate();
    }
  }, [sendPropsUpdate]);

  // ── Retry handler ──
  const handleRetry = useCallback(() => {
    setPreviewState("loading");
    setErrorMessage(null);
    iframeReadyRef.current = false;
    // Force iframe reload by toggling key
    if (iframeRef.current) {
      iframeRef.current.src = iframeSrc;
    }
  }, [iframeSrc]);

  return (
    <div className={`${styles.previewWrapper} ${className || ''}`} style={{ height }}>
      {/* Loading State */}
      {previewState === "loading" && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner} />
          <span className={styles.loadingText}>Rendering component...</span>
        </div>
      )}

      {/* Error State */}
      {previewState === "error" && (
        <div className={styles.errorOverlay}>
          <span className={styles.errorIcon}>⚠</span>
          <span className={styles.errorTitle}>Preview Error</span>
          <span className={styles.errorMessage}>
            {errorMessage || "An unknown error occurred"}
          </span>
          <button className={styles.retryBtn} onClick={handleRetry}>
            Retry
          </button>
        </div>
      )}

      {/* The iframe — uses native Next.js route instead of srcDoc */}
      <iframe
        ref={iframeRef}
        src={iframeSrc}
        className={styles.iframe}
        style={{
          opacity: previewState === "ready" ? 1 : 0,
          height: height,
        }}
        title="Component Preview"
        onLoad={() => {
          // The iframe's own JS will send READY via postMessage
          // This is a fallback safety net
        }}
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────
   Build the preview URL from slug + initial props
   ──────────────────────────────────────────────────── */
function buildPreviewUrl(
  slug: string,
  props?: Record<string, unknown>
): string {
  const params = new URLSearchParams();
  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (value === undefined || value === null) continue;
      if (typeof value === 'object') {
        params.set(key, JSON.stringify(value));
      } else {
        params.set(key, String(value));
      }
    }
  }
  const qs = params.toString();
  return `/preview/${slug}${qs ? `?${qs}` : ''}`;
}
