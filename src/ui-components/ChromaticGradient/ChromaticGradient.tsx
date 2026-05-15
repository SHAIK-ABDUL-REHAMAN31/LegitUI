"use client";

import React from "react";
import styles from "./ChromaticGradient.module.css";

export interface ChromaticGradientProps {
  /** Additional CSS class for the container */
  className?: string;
  /** Background void colour */
  background?: string;
  /** Top-left bloom colour */
  color1?: string;
  /** Bottom-right bloom colour */
  color2?: string;
  /** Centre haze colour */
  color3?: string;
  /** Top-left warm accent colour */
  color4?: string;
  /** Animation duration in seconds (higher = slower) */
  duration?: number;
  /** Bloom blur radius in vw units */
  blurAmount?: number;
  /** Bloom size in vw units */
  blobSize?: number;
  /** Show subtle film-grain overlay */
  grain?: boolean;
  /** Content rendered above the gradient */
  children?: React.ReactNode;
}

export default function ChromaticGradient({
  className = "",
  background = "#050208",
  color1 = "#7c5cbf",
  color2 = "#a855f7",
  color3 = "#4c1d95",
  color4 = "#d4a574",
  duration = 22,
  blurAmount = 18,
  blobSize = 50,
  grain = true,
  children,
}: ChromaticGradientProps) {
  const vars = {
    "--cg-bg": background,
    "--cg-c1": color1,
    "--cg-c2": color2,
    "--cg-c3": color3,
    "--cg-c4": color4,
    "--cg-dur": `${duration}s`,
    "--cg-blur": `${blurAmount}vw`,
    "--cg-size": `${blobSize}vw`,
  } as React.CSSProperties;

  return (
    <div className={`${styles.wrapper} ${className}`} style={vars}>
      <div className={styles.field}>
        <div className={`${styles.blob} ${styles.b1}`} />
        <div className={`${styles.blob} ${styles.b2}`} />
        <div className={`${styles.blob} ${styles.b3}`} />
        <div className={`${styles.blob} ${styles.b4}`} />
      </div>
      {grain && <div className={styles.grain} />}
      {children && <div className={styles.content}>{children}</div>}
    </div>
  );
}
