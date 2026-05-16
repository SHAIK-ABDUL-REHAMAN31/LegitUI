"use client";

import React from "react";
import { motion } from "framer-motion";
import styles from "./OrbitCarousel.module.css";

export interface OrbitCarouselItem {
  id: number | string;
  image?: string;
  title?: string;
  color?: string;
}

export interface OrbitCarouselProps {
  /** Array of card items with image/content */
  items?: OrbitCarouselItem[];
  /** Radius of the circle in pixels */
  radius?: number;
  /** Duration for one complete cycle (2 rounds clockwise + 2 rounds anticlockwise) */
  duration?: number;
  /** Width of each card */
  cardWidth?: number;
  /** Height of each card */
  cardHeight?: number;
  /** Additional CSS class */
  className?: string;
}

const defaultItems: OrbitCarouselItem[] = [
  { id: 1, title: "CYBER", image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&q=80" },
  { id: 2, title: "LIQUID", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80" },
  { id: 3, title: "PRISM", image: "https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?w=800&q=80" },
  { id: 4, title: "SPHERE", image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80" },
  { id: 5, title: "MESH", image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80" },
  { id: 6, title: "NEON", image: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=800&q=80" },
  { id: 7, title: "FLOW", image: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80" },
  { id: 8, title: "GLOW", image: "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=800&q=80" },
];

export default function OrbitCarousel({
  items = defaultItems,
  radius = 220,
  duration = 15,
  cardWidth = 120,
  cardHeight = 160,
  className = "",
}: OrbitCarouselProps) {
  
  // Guard: items might arrive as a string from the Customize panel
  const safeItems = Array.isArray(items) ? items : defaultItems;

  // Ensure all numerical props are treated as numbers (Customize panel can send strings)
  const r = Number(radius) || 220;
  const d = Number(duration) || 15;
  const cw = Number(cardWidth) || 120;
  const ch = Number(cardHeight) || 160;

  // We use direct objects in animate to ensure Framer Motion re-evaluates them on every render
  const rotation = {
    rotate: [0, 720],
  };

  const transition = {
    duration: d,
    ease: "easeInOut" as const,
    repeat: Infinity,
    repeatType: "reverse" as const,
  };

  const counterRotation = {
    rotate: [0, -720],
  };

  return (
    <div 
      className={`${styles.wrapper} ${className}`} 
      style={{ 
        "--card-w": `${cw}px`, 
        "--card-h": `${ch}px` 
      } as React.CSSProperties}
    >
      {/* 
         We use a key that combines all reactive props to force a clean remount 
         whenever the animation parameters change. This is the most reliable way 
         to update an infinite CSS/Motion loop.
      */}
      <motion.div
        key={`${d}-${r}-${cw}-${ch}`}
        className={styles.orbitContainer}
        animate={rotation}
        transition={transition}
      >
        {safeItems.map((item, index) => {
          const angle = (index / safeItems.length) * (Math.PI * 2);
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;

          return (
            <div
              key={item.id}
              className={styles.cardPositioner}
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
            >
              <motion.div
                className={styles.card}
                animate={counterRotation}
                transition={transition}
                whileHover={{ 
                  scale: 1.15, 
                  zIndex: 50, 
                  transition: { duration: 0.2, repeat: 0 } 
                }}
              >
                {item.image ? (
                  <img src={item.image} alt={item.title} className={styles.cardImage} />
                ) : (
                  <div className={styles.cardFallback} style={{ background: item.color }} />
                )}
                {item.title && (
                  <div className={styles.cardOverlay}>
                    <span className={styles.cardTitle}>{item.title}</span>
                  </div>
                )}
              </motion.div>
            </div>
          );
        })}
      </motion.div>

      <div className={styles.glow} />
    </div>
  );
}
