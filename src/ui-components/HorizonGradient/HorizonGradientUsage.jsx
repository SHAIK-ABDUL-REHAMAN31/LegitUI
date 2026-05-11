"use client";
import React from "react";
import HorizonGradient from "./HorizonGradient";
import styles from "./HorizonGradient.module.css";
export default function HorizonGradientUsage({ children, }) {
  const showDemo = !!children;
  return (<div className={styles.wrapper}>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

    <HorizonGradient />


  </div>);
}
