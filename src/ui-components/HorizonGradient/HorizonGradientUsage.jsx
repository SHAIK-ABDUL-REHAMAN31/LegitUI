"use client";
import React from "react";
import HorizonGradient from "./HorizonGradient";
import styles from "./HorizonGradient.module.css";
export default function HorizonGradientUsage({ children, }) {
    return (<div className={styles.wrapper}>

      <HorizonGradient />

    </div>);
}
