"use client";

import React, { useRef } from 'react';
import { motion, useMotionValue, useAnimationFrame, useTransform } from 'framer-motion';
import styles from './ShineText.module.css';

export interface ShineTextProps {
    text?: string;
    className?: string;
    baseColor?: string;
    shineColor?: string;
    shineWidth?: number;
    speed?: number;
    direction?: "left-to-right" | "right-to-left";
}

/**
 * ShineText
 * A dynamic text component that creates a shine effect sliding from left to right or right to left.
 */
export default function ShineText({
    text = "Shine Effect",
    className = "",
    baseColor = "#b5b5b5",
    shineColor = "#ffffff",
    shineWidth = 200,
    speed = 0.5,
    direction = "left-to-right",
}: ShineTextProps) {
    const textRef = useRef<HTMLHeadingElement>(null);
    const progress = useMotionValue(0);

    useAnimationFrame((time, delta) => {
        let newProgress = progress.get() + (delta / 1000) * speed;
        if (newProgress > 1) {
            newProgress = newProgress % 1; // loop
        }
        progress.set(newProgress);
    });

    const bgPos = useTransform(progress, (v) => {
        if (direction === "right-to-left") {
            return `${v * 100}% center`;
        }
        return `${100 - (v * 100)}% center`;
    });

    return (
        <div className={styles.container}>
            <motion.h1 
                ref={textRef}
                className={`${styles.shineText} ${className}`}
                style={{
                    backgroundImage: `linear-gradient(120deg, ${baseColor} calc(50% - ${shineWidth/2}px), ${shineColor} 50%, ${baseColor} calc(50% + ${shineWidth/2}px))`,
                    backgroundSize: `300% 100%`,
                    backgroundPosition: bgPos,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    color: "transparent",
                    display: "inline-block",
                }}
            >
                {text}
            </motion.h1>
        </div>
    );
}
