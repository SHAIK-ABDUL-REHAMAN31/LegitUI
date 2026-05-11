"use client";
import React from "react";
import { motion } from "framer-motion";
import styles from "./SlideUpText.module.css";
const SlideUpText = ({ text = "Beautiful things happen when you least expect them", className = "", fontSize = "clamp(2rem, 5vw, 4rem)", color = "#ffffff", staggerDuration = 0.17, yOffset = 54, }) => {
    const words = text.split(" ");
    const containerVariants = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: staggerDuration,
                delayChildren: 0.1,
            },
        },
    };
    const wordVariants = {
        hidden: {
            opacity: 0,
            y: yOffset,
            filter: "blur(4px)",
        },
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
                type: "spring",
                damping: 20,
                stiffness: 100,
                mass: 0.8,
            },
        },
    };
    const animationKey = `${text}-${staggerDuration}-${yOffset}`;
    return (<div className={`${styles.container} ${className}`}>
      <motion.p key={animationKey} variants={containerVariants} initial="hidden" animate="visible" className={styles.text} style={{ fontSize, color }}>
        {words.map((word, i) => (<span key={i} className={styles.wordWrapper}>
            <motion.span variants={wordVariants} className={styles.word}>
              {word}
            </motion.span>
          </span>))}
      </motion.p>
    </div>);
};
export default SlideUpText;
