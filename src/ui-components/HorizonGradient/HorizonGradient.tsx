"use client";

import React from "react";
import styles from "./HorizonGradient.module.css";

export interface HorizonGradientProps {
  className?: string;
}

export default function HorizonGradient({ className = "" }: HorizonGradientProps) {
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.arc} />
    </div>
  );
}
