"use client";

import React from "react";
import styles from "./VioletArcBackground.module.css";

export interface VioletArcBackgroundProps {
  /** Content rendered over the background. */
  children?: React.ReactNode;
  /** Additional CSS classes. @default "" */
  className?: string;
  /** Outermost vivid pink band colour. @default "rgba(88, 28, 135, 0.92)" */
  streakColor1?: string;
  /** Brilliant purple band colour. @default "rgba(139, 92, 246, 0.88)" */
  streakColor2?: string;
  /** Electric cyan band colour. @default "rgba(167, 139, 250, 0.78)" */
  streakColor3?: string;
  /** Core innermost band colour. @default "rgba(221, 214, 254, 0.62)" */
  coreColor?: string;
  /** Central crossing glow colour. @default "rgba(196, 181, 253, 0.30)" */
  glowColor?: string;
  /** Dark background colour. @default "#08060e" */
  background?: string;
  /** Uniform blur radius in pixels. @default 24 */
  blurAmount?: number;
  /** Arc crossing angle in degrees. @default 12 */
  arcAngle?: number;
  /** Toggle the subtle drift animation. @default true */
  animated?: boolean;
  /** Speed multiplier (30 is normal speed). @default 30 */
  speed?: number;
  /** Overall scale factor for the arc widths, heights, and thicknesses. @default 1 */
  arcScale?: number;
  /** Opacity multiplier for the central ambient glow bloom. @default 1 */
  glowIntensity?: number;
}

export default function VioletArcBackground({
  children,
  className = "",
  streakColor1 = "rgba(88, 28, 135, 0.92)",
  streakColor2 = "rgba(139, 92, 246, 0.88)",
  streakColor3 = "rgba(167, 139, 250, 0.78)",
  coreColor = "rgba(221, 214, 254, 0.62)",
  glowColor = "rgba(196, 181, 253, 0.30)",
  background = "#08060e",
  blurAmount = 24,
  arcAngle = 12,
  animated = true,
  speed = 30,
  arcScale = 1,
  glowIntensity = 1,
}: VioletArcBackgroundProps) {
  // Translate numeric speed (0-500) to actual animation multiplier where 30 = 1x speed
  const activeSpeed = Math.max(0.001, speed / 30);

  const cssVars = {
    "--bg-color": background,
    "--color-1": streakColor1,
    "--color-2": streakColor2,
    "--color-3": streakColor3,
    "--color-4": coreColor,
    "--glow-color": glowColor,
    "--blur-amount": `${blurAmount}px`,
    "--angle-a": `-${arcAngle}deg`,
    "--angle-b": `${arcAngle}deg`,
    "--arc-scale": arcScale,
    "--glow-intensity": glowIntensity,
    // Calculate animation durations and delays based on activeSpeed multiplier
    "--breathe-dur": `${12 / activeSpeed}s`,
    "--sway-dur": `${18 / activeSpeed}s`,
    "--pulse-dur": `${10 / activeSpeed}s`,
    "--pulse-delay-mid": `${1.5 / activeSpeed}s`,
    "--pulse-delay-inner": `${3 / activeSpeed}s`,
    "--pulse-delay-core": `${4.5 / activeSpeed}s`,
    "--glow-dur": `${6 / activeSpeed}s`,
  } as React.CSSProperties;

  const rootClasses = [styles.root, animated ? styles.animated : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClasses} style={cssVars}>
      {/* Blurred arc layers */}
      <div className={styles.blurLayer}>
        {/* Arc Group A — tilted left */}
        <div className={styles.arcGroupA}>
          <div className={`${styles.band} ${styles.bandOuter}`} />
          <div className={`${styles.band} ${styles.bandMid}`} />
          <div className={`${styles.band} ${styles.bandInner}`} />
          <div className={`${styles.band} ${styles.bandCore}`} />
        </div>

        {/* Arc Group B — tilted right (mirrored) */}
        <div className={styles.arcGroupB}>
          <div className={`${styles.band} ${styles.bandOuter}`} />
          <div className={`${styles.band} ${styles.bandMid}`} />
          <div className={`${styles.band} ${styles.bandInner}`} />
          <div className={`${styles.band} ${styles.bandCore}`} />
        </div>

        {/* Central crossing glow */}
        <div className={styles.centralGlow} />
      </div>

      {/* Bottom fade into background */}
      <div className={styles.bottomFade} />

      {/* Content overlay */}
      <div className={styles.content}>{children}</div>
    </div>
  );
}
