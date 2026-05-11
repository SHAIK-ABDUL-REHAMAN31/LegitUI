"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, MotionValue } from "framer-motion";
import styles from "./ScrollRevealText.module.css";

interface ScrollRevealTextProps {
  text?: string;
  className?: string;
  fontSize?: string;
  color?: string;
}

interface WordProps {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}

const Word: React.FC<WordProps> = ({ children, progress, range }) => {
  // Raw scroll-linked values
  const rawOpacity = useTransform(progress, range, [0, 1]);
  const rawY = useTransform(progress, range, [20, 0]);
  const rawBlur = useTransform(progress, range, [8, 0]);

  // Spring-smoothed for buttery feel
  const springConfig = { stiffness: 200, damping: 30, mass: 0.3 };
  const opacity = useSpring(rawOpacity, springConfig);
  const y = useSpring(rawY, springConfig);
  const blur = useSpring(rawBlur, springConfig);

  const filter = useTransform(blur, (v) => `blur(${v}px)`);

  return (
    <span className={styles.wordWrapper}>
      <motion.span className={styles.word} style={{ opacity, y, filter }}>
        {children}
      </motion.span>
    </span>
  );
};

const ScrollRevealText: React.FC<ScrollRevealTextProps> = ({
  text = "Scroll to reveal this cinematic text scrub animation. It dynamically maps opacity, vertical position, and clip-path directly to your scroll progress for a buttery smooth reading experience.",
  className = "",
  fontSize = "clamp(2rem, 5vw, 4rem)",
  color = "#ffffff",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 90%", "end 60%"] 
  });

  const words = text.split(" ");

  return (
    <div ref={containerRef} className={`${styles.container} ${className}`}>
      <p style={{ fontSize, color }} className={styles.text}>
        {words.map((word, i) => {
          // Wide overlap (5x word spacing) for fast cascading reveal
          const start = i / words.length;
          const end = Math.min(start + (5 / words.length), 1);
          return (
            <Word key={i} progress={scrollYProgress} range={[start, end]}>
              {word}
            </Word>
          );
        })}
      </p>
    </div>
  );
};

export default ScrollRevealText;
