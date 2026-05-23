"use client";
import React, { useEffect } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import styles from "./Premium3DCursor.module.css";

interface Premium3DCursorProps {
  size?: number;
  baseColor?: string;
  highlightColor?: string;
  lag?: number;
}

export default function Premium3DCursor({
  size = 40,
  baseColor = "#1a1a1a",
  highlightColor = "#ffffff",
  lag = 0.5,
}: Premium3DCursorProps) {
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  // Smooth springs for cursor position
  const springConfig = { damping: 25, stiffness: 300, mass: lag };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      // SVG path tip is at (10, 10) in a 50x50 viewBox, which is exactly a 20% offset.
      // We subtract this offset so the visual tip is perfectly aligned with the cursor position.
      cursorX.set(e.clientX - size * 0.2);
      cursorY.set(e.clientY - size * 0.2);
    };

    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, [cursorX, cursorY, size]);

  return (
    <motion.div
      className={styles.cursorContainer}
      style={{
        x: smoothX,
        y: smoothY,
        width: size,
        height: size,
      }}
    >
      <motion.svg
        viewBox="0 0 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: "100%",
          height: "100%",
          filter: "drop-shadow(4px 12px 10px rgba(0,0,0,0.5))",
        }}
      >
        <defs>
          <linearGradient id="cursorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={baseColor} />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>
          
          <filter id="innerGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feOffset dx="1.5" dy="1.5" />
            <feGaussianBlur stdDeviation="1.5" result="offset-blur" />
            <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
            <feFlood floodColor={highlightColor} floodOpacity="0.8" result="color" />
            <feComposite operator="in" in="color" in2="inverse" result="shadow" />
            <feComposite operator="over" in="shadow" in2="SourceGraphic" />
          </filter>
        </defs>

        <path
          d="M10 10 L 18 42 L 25 30 L 40 33 Z"
          fill="url(#cursorGrad)"
          stroke={highlightColor}
          strokeWidth="1"
          strokeLinejoin="round"
          strokeLinecap="round"
          filter="url(#innerGlow)"
        />
      </motion.svg>
    </motion.div>
  );
}
