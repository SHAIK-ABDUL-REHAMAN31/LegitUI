"use client";
import React from "react";
import styles from "./ChromaticGradient.module.css";
export default function ChromaticGradient({ className = "", background = "#050208", color1 = "#7c5cbf", color2 = "#a855f7", color3 = "#4c1d95", color4 = "#d4a574", duration = 22, blurAmount = 18, blobSize = 50, grain = true, children, }) {
    const vars = {
        "--cg-bg": background,
        "--cg-c1": color1,
        "--cg-c2": color2,
        "--cg-c3": color3,
        "--cg-c4": color4,
        "--cg-dur": `${duration}s`,
        "--cg-blur": `${blurAmount}vw`,
        "--cg-size": `${blobSize}vw`,
    };
    return (<div className={`${styles.wrapper} ${className}`} style={vars}>
      <div className={styles.field}>
        <div className={`${styles.blob} ${styles.b1}`}/>
        <div className={`${styles.blob} ${styles.b2}`}/>
        <div className={`${styles.blob} ${styles.b3}`}/>
        <div className={`${styles.blob} ${styles.b4}`}/>
      </div>
      {grain && <div className={styles.grain}/>}
      {children && <div className={styles.content}>{children}</div>}
    </div>);
}
