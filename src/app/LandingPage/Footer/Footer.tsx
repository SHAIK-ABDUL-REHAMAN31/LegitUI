"use client";

import React from "react";
import styles from "./Footer.module.css";

const PixelHeart = () => (
  <svg width="20" height="20" viewBox="0 0 9 9" className={styles.pixelHeart}>
    <rect x="1" y="1" width="2" height="1" />
    <rect x="6" y="1" width="2" height="1" />
    <rect x="0" y="2" width="4" height="1" />
    <rect x="5" y="2" width="4" height="1" />
    <rect x="0" y="3" width="9" height="1" />
    <rect x="0" y="4" width="9" height="1" />
    <rect x="1" y="5" width="7" height="1" />
    <rect x="2" y="6" width="5" height="1" />
    <rect x="3" y="7" width="3" height="1" />
    <rect x="4" y="8" width="1" height="1" />
  </svg>
);

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Top Banner */}
      <div className={styles.footerTop}>
        <div className={styles.footerLove}>
          Built with <PixelHeart /> for developers
        </div>
      </div>

      {/* Middle Text Info */}
      <div className={styles.footerMiddle}>
        <div className={styles.footerCopy}>&copy; {new Date().getFullYear()} LegitUI All rights reserved.</div>
      </div>

      {/* Massive Gradient Text */}
      <div className={styles.massiveTextWrapper}>
        <h1 className={styles.massiveText}>LEGITUI</h1>
      </div>
    </footer>
  );
}
