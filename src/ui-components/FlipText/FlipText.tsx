"use client";

import React, { useMemo } from "react";
import { motion, Variants } from "framer-motion";
import styles from "./FlipText.module.css";

interface FlipTextProps {
  text?: string;
  className?: string;
  staggerDuration?: number;
  damping?: number;
  stiffness?: number;
  initialRotateY?: number;
  initialZ?: number;
}

const FlipText: React.FC<FlipTextProps> = ({
  text = "3D FLIP ENTRANCE",
  className = "",
  staggerDuration = 0.05,
  damping = 12,
  stiffness = 120,
  initialRotateY = 90,
  initialZ = -300,
}) => {
  const characters = text.split("");

  const containerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDuration,
      },
    },
  };

  const charVariants: Variants = {
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

  return (
    <div
      className={`${styles.container} ${className}`}
      style={{ perspective: 1000 }}
    >
      <motion.div
        key={animationKey}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={styles.textWrapper}
      >
        {characters.map((char, index) => (
          <motion.span
            key={index}
            variants={charVariants}
            className={styles.character}
            style={{ display: "inline-block", whiteSpace: "pre" }}
          >
            {char}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
};

export default FlipText;
