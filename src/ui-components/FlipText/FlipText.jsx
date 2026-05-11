"use client";
import React from "react";
import { motion } from "framer-motion";
import styles from "./FlipText.module.css";
const FlipText = ({ text = "3D FLIP ENTRANCE", className = "", staggerDuration = 0.05, damping = 12, stiffness = 120, initialRotateY = 90, initialZ = -300, }) => {
    const characters = text.split("");
    const containerVariants = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: staggerDuration,
            },
        },
    };
    const charVariants = {
        hidden: {
            opacity: 0,
            rotateY: initialRotateY,
            z: initialZ,
        },
        visible: {
            opacity: 1,
            rotateY: 0,
            z: 0,
            transition: {
                type: "spring",
                damping: damping,
                stiffness: stiffness,
            },
        },
    };
    // Create a combined key so the animation replays when props change
    const animationKey = `${text}-${staggerDuration}-${damping}-${stiffness}-${initialRotateY}-${initialZ}`;
    return (<div className={`${styles.container} ${className}`} style={{ perspective: 1000 }}>
      <motion.div key={animationKey} variants={containerVariants} initial="hidden" animate="visible" className={styles.textWrapper}>
        {characters.map((char, index) => (<motion.span key={index} variants={charVariants} className={styles.character} style={{ display: "inline-block", whiteSpace: "pre" }}>
            {char}
          </motion.span>))}
      </motion.div>
    </div>);
};
export default FlipText;
