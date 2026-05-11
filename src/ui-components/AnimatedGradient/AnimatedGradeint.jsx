"use client";

import React from 'react';
import { motion } from 'framer-motion';
import styles from './AnimatedGradient.module.css';

/**
 * AnimatedGradientText
 * A premium, Apple-style gradient text component with a continuous "alive" animation.
 */
export default function AnimatedGradientText({
    text = "Beautifully Crafted",
    className = "",
}) {
    return (
        <div className={styles.container}>
            <motion.h1
                className={`${styles.gradientText} ${className}`}
                animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                    duration: 8,
                    ease: "linear",
                    repeat: Infinity,
                }}
            >
                {text}
            </motion.h1>
        </div>
    );
}
