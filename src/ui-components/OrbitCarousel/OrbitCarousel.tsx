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
  { id: 1, title: "CHROME", image: "/images/chrome_sculpture.png" },
  { id: 2, title: "SILHOUETTE", image: "/images/orange_silhouette.png" },
  { id: 3, title: "PROFILE", image: "/images/woman_profile_gray.png" },
  { id: 4, title: "MARBLE", image: "https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=800&q=80" },
  { id: 5, title: "SILHOUETTE", image: "/images/orange_silhouette.png" },
  { id: 6, title: "PROFILE", image: "/images/woman_profile_gray.png" },
  { id: 7, title: "SHADOW", image: "https://images.pexels.com/photos/7828347/pexels-photo-7828347.jpeg?_gl=1*1t91ddy*_ga*MzMwMDY5NzIzLjE3NjYxNTE5OTg.*_ga_8JE65Q40S6*czE3Nzk0ODQ4OTkkbzIwJGcxJHQxNzc5NDg0OTAzJGo1NiRsMCRoMA.." },
  { id: 8, title: "CHROME", image: "/images/chrome_sculpture.png" },
];

export default function OrbitCarousel({
  items = defaultItems,
  radius = 200,
  duration = 20,
  cardWidth = 110,
  cardHeight = 145,
  className = "",
}: OrbitCarouselProps) {

  // Guard: items might arrive as a string from the Customize panel
  const safeItems = Array.isArray(items) ? items : defaultItems;

  // Ensure all numerical props are treated as numbers (Customize panel can send strings)
  const r = Number(radius) || 200;
  const d = Number(duration) || 20;
  const cw = Number(cardWidth) || 110;
  const ch = Number(cardHeight) || 145;

  // Smooth continuous rotation — single full turn
  const rotation = {
    rotate: [0, 360],
  };

  const transition = {
    duration: d,
    ease: "linear" as const,
    repeat: Infinity,
    repeatType: "loop" as const,
  };

  const counterRotation = {
    rotate: [0, -360],
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
      <div className={styles.scaleWrapper}>
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
      </div>

      <div className={styles.glow} />
    </div>
  );
}
