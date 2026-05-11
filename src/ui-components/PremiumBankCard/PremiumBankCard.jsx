"use client";
import React, { useState } from "react";
import styles from "./PremiumBankCard.module.css";
export default function PremiumBankCard() {
    const [isActive, setIsActive] = useState(true);
    return (<div className={styles.wrapper}>
            {/* LAYER 1: Base Black Card */}
            <div className={styles.cardBase}>
                <div className={styles.innerCard}>

                    {/* LAYER 2: Green Gradient Layer */}
                    <div className={styles.greenLayer}>
                        <div className={styles.shineOverlay}/>
                        <div className={styles.shineStreak}/>
                    </div>

                    {/* LAYER 3 & 4: Black Slope Layer covering the bottom */}
                    {/* This combines the short bottom cover and the taller sloped piece to form a perfect curve */}
                    <div className={styles.blackSlopeLayer}/>

                    {/* ── Content Elements ── */}

                    {/* Chip circles */}
                    <div className={styles.chipContainer}>
                        <div className={styles.chipCircleBack}/>
                        <div className={styles.chipCircleFront}/>
                    </div>

                    {/* Balance */}
                    <div className={styles.balanceContainer}>
                        <span className={styles.balanceAmount}>$80.600</span>
                        <span className={styles.balanceLabel}>TOTAL BALANCE</span>
                    </div>

                    {/* Text */}
                    <div className={styles.textContainer}>
                        <span className={styles.title}>Premium Banking</span>
                        <span className={styles.subtitle}>For Exclusive Clients</span>
                    </div>

                    {/* Toggle switch */}
                    <div className={styles.toggleArea}>
                        <button onClick={() => setIsActive(!isActive)} className={`${styles.toggleTrack} ${isActive ? styles.toggleTrackActive : styles.toggleTrackInactive}`} aria-label="Toggle card">
                            <div className={`${styles.toggleThumb} ${isActive ? styles.toggleThumbActive : styles.toggleThumbInactive}`}/>
                        </button>
                    </div>

                </div>
            </div>
        </div>);
}
