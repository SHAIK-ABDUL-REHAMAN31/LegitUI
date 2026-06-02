"use client";

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { motion } from 'framer-motion';
import styles from './StaggeredWordSlide.module.css';

interface StaggeredWordSlideProps {
  text?: string;
  duration?: number;
  staggerAmount?: number;
  yOffset?: string | number;
  skewY?: number;
  rotateX?: number;
  ease?: string;
  textColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  fontSize?: string;
}

/**
 * StaggeredWordSlide Component
 * 
 * A premium text effect that slides words up from a mask with a staggered delay.
 * Uses GSAP for high-performance professional motion and Framer Motion for layout.
 */
const StaggeredWordSlide: React.FC<StaggeredWordSlideProps> = ({
  text = "Elevating Digital Experiences With Premium Motion",
  duration = 1.4,
  staggerAmount = 0.4,
  yOffset = "110%",
  skewY = 6,
  rotateX = -8,
  ease = "power4.out",
  textColor = "#ffffff",
  accentColor = "#ffffff",
  backgroundColor = "#000000",
  fontSize = "clamp(2rem, 5.2vw, 4rem)"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    // Clear the ref array before populating to avoid duplicates in dev HMR
    wordsRef.current = wordsRef.current.slice(0, text.split(" ").length);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: ease, duration: duration }
      });

      // Target only the elements that exist
      const validWords = wordsRef.current.filter(Boolean);

      tl.from(validWords, {
        y: yOffset,
        skewY: skewY,
        rotateX: rotateX,
        opacity: 0,
        transformOrigin: "0% 50% -60px",
        stagger: {
          amount: staggerAmount,
          from: "start"
        },
      });

    }, containerRef);

    return () => ctx.revert();
  }, [text, duration, staggerAmount, yOffset, skewY, rotateX, ease, textColor, accentColor, backgroundColor, fontSize]);

  const words = text.split(" ");

  return (
    <section 
      ref={containerRef} 
      className={styles.container}
      style={{ backgroundColor }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className={styles.wrapper}
      >
        <h2 
          className={styles.heading}
          style={{ color: textColor, fontSize }}
        >
          {words.map((word, i) => (
            <span key={i} className={styles.wordContainer}>
              <span
                ref={(el) => { wordsRef.current[i] = el; }}
                className={`${styles.word} ${i >= words.length - 2 ? styles.accent : ''}`}
                style={i >= words.length - 2 ? { color: accentColor } : undefined}
              >
                {word}
              </span>
            </span>
          ))}
        </h2>
      </motion.div>
    </section>
  );
};

export default StaggeredWordSlide;
