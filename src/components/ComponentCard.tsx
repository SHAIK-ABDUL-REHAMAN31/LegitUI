"use client";

// ════════════════════════════════════════════════════════════════
// ComponentCard — Phase 10.1: Viewport-aware lazy loading
// ════════════════════════════════════════════════════════════════
// Cards on the listing page no longer load video/image previews
// until the card enters the viewport (IntersectionObserver) or
// the user hovers. This dramatically reduces initial page weight.
// ════════════════════════════════════════════════════════════════

import Link from "next/link";
import { ComponentMeta } from "@/lib/component-registry";
import { useRef, useState, useCallback, useEffect } from "react";
import styles from "./ComponentCard.module.css";

interface ComponentCardProps {
  component: ComponentMeta;
}

// ── Category visual map ──────────────────────────────
const CATEGORY_VISUALS: Record<string, { icon: string; bg: string }> = {
  buttons: {
    icon: "⬡",
    bg: "linear-gradient(135deg, rgba(168,85,247,0.12), rgba(124,58,237,0.05))",
  },
  cards: {
    icon: "◇",
    bg: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(37,99,235,0.05))",
  },
  "text effects": {
    icon: "✦",
    bg: "linear-gradient(135deg, rgba(236,72,153,0.12), rgba(219,39,119,0.05))",
  },
  loaders: {
    icon: "◎",
    bg: "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(22,163,74,0.05))",
  },
  animations: {
    icon: "◈",
    bg: "linear-gradient(135deg, rgba(249,115,22,0.12), rgba(234,88,12,0.05))",
  },
  inputs: {
    icon: "▣",
    bg: "linear-gradient(135deg, rgba(14,165,233,0.12), rgba(2,132,199,0.05))",
  },
  backgrounds: {
    icon: "◉",
    bg: "linear-gradient(135deg, rgba(168,85,247,0.12), rgba(192,132,252,0.05))",
  },
  legitcomponents: {
    icon: "💎",
    bg: "linear-gradient(135deg, rgba(236,72,153,0.12), rgba(219,39,119,0.05))",
  },
  navigation: {
    icon: "◁",
    bg: "linear-gradient(135deg, rgba(244,63,94,0.12), rgba(225,29,72,0.05))",
  },
};

const FALLBACK_VISUAL = {
  icon: "◆",
  bg: "linear-gradient(135deg, rgba(168,85,247,0.12), transparent)",
};

export default function ComponentCard({ component }: ComponentCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [glowPos, setGlowPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Phase 10.1: Viewport detection — only load media when visible
  const [isInViewport, setIsInViewport] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInViewport(true);
          observer.disconnect(); // Once visible, stay activated
        }
      },
      { rootMargin: "100px", threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setGlowPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    setIsInViewport(true); // Force activate on hover
    if (videoRef.current && component.previewVideo && !videoError) {
      videoRef.current.play().catch(() => {
        // autoplay may fail silently
      });
    }
  }, [component.previewVideo, videoError]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, []);

  const handleVideoCanPlay = useCallback(() => {
    setVideoReady(true);
  }, []);

  const handleVideoError = useCallback(() => {
    setVideoError(true);
    setVideoReady(false);
  }, []);

  const visual =
    CATEGORY_VISUALS[component.category.toLowerCase()] || FALLBACK_VISUAL;
  const hasVideo = !!component.previewVideo && !videoError;
  const hasFallbackImage = !!component.previewImage;

  // Phase 10.1: Only render media when in viewport or hovered
  const shouldLoadMedia = isInViewport || isHovered;

  return (
    <Link href={`/components/${component.slug}`} className={styles.link}>
      <div
        ref={cardRef}
        className="component-card"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Glow follow cursor */}
        <div
          className={styles.glow}
          style={{
            left: glowPos.x - 100,
            top: glowPos.y - 100,
            opacity: isHovered ? 1 : 0,
          }}
        />

        {/* Preview Area */}
        <div className="card-preview" style={{ background: visual.bg }}>
          {/* Badges */}
          <div className={styles.badges}>
            {component.isNew && (
              <span className={styles.badgeNew}>NEW</span>
            )}
            {component.isUpdated && (
              <span className={styles.badgeUpdated}>UPDATED</span>
            )}
          </div>

          {/* Video Preview — only rendered when in viewport */}
          {hasVideo && shouldLoadMedia && (
            <>
              {/* Loading skeleton - shown while video is loading */}
              {!videoReady && isHovered && (
                <div className={styles.videoSkeleton} />
              )}

              {/* The actual video element */}
              <video
                ref={videoRef}
                src={component.previewVideo}
                muted
                loop
                playsInline
                preload="none"
                onCanPlay={handleVideoCanPlay}
                onError={handleVideoError}
                className={styles.previewVideo}
                style={{
                  opacity: isHovered && videoReady ? 1 : 0,
                }}
              />
            </>
          )}

          {/* Fallback image — only when in viewport */}
          {hasFallbackImage && !hasVideo && shouldLoadMedia && (
            <img
              src={component.previewImage}
              alt={`${component.name} preview`}
              className={styles.previewImage}
              loading="lazy"
            />
          )}

          {/* Category icon — hidden when video is playing */}
          <span
            className={styles.categoryIcon}
            style={{
              transform: isHovered ? "scale(1.1)" : "scale(1)",
              opacity:
                isHovered && hasVideo && videoReady ? 0 : undefined,
            }}
          >
            {visual.icon}
          </span>

          {/* ▶ PREVIEW badge — fades in on hover */}
          {hasVideo && (
            <div
              className={styles.previewBadge}
              style={{
                opacity: isHovered ? 1 : 0,
              }}
            >
              <span className={styles.previewBadgeTriangle}>▶</span>
              PREVIEW
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className={`card-body ${styles.cardBodyWrapper}`}>
          <p className="card-title">{component.name}</p>
          <p className="card-category">{component.category}</p>
        </div>
      </div>
    </Link>
  );
}
