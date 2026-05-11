"use client";
import React from "react";
import styles from "./HorizonGradient.module.css";
export default function HorizonGradient({ className = "" }) {
    return (<div className={`${styles.container} ${className}`}>
      <div className={styles.arc}/>
    </div>);
}
