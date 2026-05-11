"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, MotionValue } from "framer-motion";
import styles from "./CinematicText.module.css";

interface CinematicTextSpanProps {
    char: string;
    index: number;
    total: number;
    scrollYProgress: MotionValue<number>;
    activeColor: string;
    inactiveColor: string;
}

const CinematicTextSpan: React.FC<CinematicTextSpanProps> = ({
    char,
    index,
    total,
    scrollYProgress,
    activeColor,
    inactiveColor,
}) => {
    // Each letter occupies a narrow window of the total scroll progress
    const windowSize = 1 / total;
    const start = index * windowSize * 0.65; // overlap windows for smoother cascade
    const end = Math.min(start + windowSize * 2.5, 1);

    const rawProgress = useTransform(scrollYProgress, [start, end], [0, 1]);
    const progress = useSpring(rawProgress, { stiffness: 200, damping: 30 });

    const opacity = useTransform(progress, [0, 1], [0, 1]);
    const y = useTransform(progress, [0, 1], [50, 0]);
    const rotateX = useTransform(progress, [0, 1], [-90, 0]);
    const blur = useTransform(progress, [0, 1], [12, 0]);
    const color = useTransform(progress, [0, 1], [inactiveColor, activeColor]);
    const filter = useTransform(blur, (b) => `blur(${b}px)`);

    return (
        <motion.span
            className={styles.letter}
            style={{
                opacity,
                y,
                rotateX,
                color,
                filter,
                whiteSpace: char === " " ? "pre" : "normal",
            }}
        >
            {char}
        </motion.span>
    );
};

export interface CinematicTextProps {
    text?: string;
    subtitle?: string;
    activeColor?: string;
    inactiveColor?: string;
    fontSize?: string;
}

export const CinematicText: React.FC<CinematicTextProps> = ({
    text = "Cinematic",
    subtitle = "Letter by Letter — Framer Motion",
    activeColor = "#000000ff",
    inactiveColor = "#ffffffff",
    fontSize = "clamp(3rem, 10vw, 9rem)",
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start 80%", "start 10%"],
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
    });

    const chars = text.split("");

    // Derived transforms for supporting elements
    const lineScaleX = useTransform(smoothProgress, [0.6, 1], [0, 1]);
    const subtitleOpacity = useTransform(smoothProgress, [0.7, 1], [0, 1]);
    const subtitleY = useTransform(smoothProgress, [0.7, 1], [20, 0]);
    const subtitleBlur = useTransform(smoothProgress, [0.7, 1], [6, 0]);
    const topRuleScale = useTransform(smoothProgress, [0, 0.3], [0, 1]);
    const topRuleOpacity = useTransform(smoothProgress, [0, 0.3], [0, 1]);
    const subtitleFilter = useTransform(subtitleBlur, (b) => `blur(${b}px)`);

    return (
        <div ref={containerRef} className={styles.container}>
            {/* Top decorative rule */}
            <motion.div
                className={styles.topRule}
                style={{
                    scaleX: topRuleScale,
                    opacity: topRuleOpacity,
                }}
            />

            {/* Letter-by-letter heading */}
            <h1
                className={styles.heading}
                style={{ fontSize }}
            >
                {chars.map((char, i) => (
                    <CinematicTextSpan
                        key={i}
                        char={char}
                        index={i}
                        total={chars.length}
                        scrollYProgress={smoothProgress}
                        activeColor={activeColor}
                        inactiveColor={inactiveColor}
                    />
                ))}
            </h1>

            {/* Gradient underline */}
            <motion.div
                className={styles.underline}
                style={{
                    scaleX: lineScaleX,
                }}
            />

            {/* Subtitle */}
            <motion.p
                className={styles.subtitle}
                style={{
                    opacity: subtitleOpacity,
                    y: subtitleY,
                    filter: subtitleFilter,
                }}
            >
                {subtitle}
            </motion.p>
        </div>
    );
};

export default CinematicText;
