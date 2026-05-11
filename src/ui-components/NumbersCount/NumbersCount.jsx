"use client";
import React, { useEffect } from 'react';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';
import styles from './NumbersCount.module.css';
/**
 * NumberCountMotion
 * An ultra-smooth number counter using Framer Motion's spring physics.
 */
const NumberCountMotion = ({ end, start = 0, suffix = "", decimals = 0, className = "" }) => {
    const count = useMotionValue(start);
    // Spring configuration for that "premium" smooth bounce
    const springValue = useSpring(count, {
        stiffness: 40,
        damping: 20,
        restDelta: 0.001
    });
    // Transform the raw motion value into a formatted string
    const displayValue = useTransform(springValue, (latest) => {
        return latest.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        });
    });
    // Transform the value into a scale/blur effect for extra "juice"
    const scale = useTransform(springValue, [start, end], [1, 1.1]);
    const opacity = useTransform(springValue, [start, end], [0.8, 1]);
    useEffect(() => {
        // Trigger the animation
        count.set(end);
    }, [end, count]);
    return (<div className={`${styles.container} ${className}`}>
            <motion.span style={{ scale, opacity }} className={styles.number}>
                {displayValue}
            </motion.span>
            {suffix && <span className={styles.suffix}>{suffix}</span>}
        </div>);
};
export default NumberCountMotion;
