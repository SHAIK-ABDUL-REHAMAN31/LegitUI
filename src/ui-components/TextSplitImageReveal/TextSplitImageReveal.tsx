"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import styles from "./TextSplitImageReveal.module.css";

export interface TextSplitImageRevealProps {
  /** First word to display */
  word1?: string;
  /** Second word to display */
  word2?: string;
  /** The image source URL */
  imageUrl: string;
  /** Additional classname for the container */
  className?: string;
  /** Overall speed multiplier */
  speed?: number;
}

export const TextSplitImageReveal: React.FC<TextSplitImageRevealProps> = ({
  word1 = "Creative",
  word2 = "Studio",
  imageUrl,
  className = "",
  speed = 1,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftWrapperRef = useRef<HTMLDivElement>(null);
  const rightWrapperRef = useRef<HTMLDivElement>(null);
  const leftWordRef = useRef<HTMLHeadingElement>(null);
  const rightWordRef = useRef<HTMLHeadingElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power4.inOut" },
      });

      // Reset initial state
      gsap.set([leftWordRef.current, rightWordRef.current], {
        y: "110%",
        rotateX: -45,
        opacity: 0,
      });

      gsap.set([leftWrapperRef.current, rightWrapperRef.current], {
        x: "0vw",
        yPercent: -50,
      });

      gsap.set(imageWrapperRef.current, {
        width: "0vw",
        height: "0vh",
        opacity: 0,
        borderRadius: "999px",
      });

      gsap.set(imageRef.current, {
        scale: 1.5,
      });

      // 1. Words pop up
      tl.to([leftWordRef.current, rightWordRef.current], {
        y: "0%",
        rotateX: 0,
        opacity: 1,
        duration: 0.8 / speed,
        stagger: 0.05,
        ease: "power3.out",
      })
      // 3. Words split to left and right after a short delay (animate wrappers to avoid clipping)
      .to(leftWrapperRef.current, {
        x: "-12vw",
        duration: 1.0 / speed,
      }, "+=0.15") // This delay acts as a pause
      .to(rightWrapperRef.current, {
        x: "12vw",
        duration: 1.0 / speed,
      }, "<")
      // 4. Image fades in and scales slightly between words
      .to(imageWrapperRef.current, {
        opacity: 1,
        width: "20vw",
        height: "12vh",
        borderRadius: "999px",
        duration: 1.0 / speed,
      }, "<")
      .to(imageRef.current, {
        scale: 1.2,
        duration: 1.0 / speed,
      }, "<")
      // 6. Image expands to full screen after a pause
      .to(imageWrapperRef.current, {
        width: "100vw",
        height: "100vh",
        borderRadius: "0px",
        duration: 1.0 / speed,
      }, "+=0.3")
      .to(imageRef.current, {
        scale: 1,
        duration: 1.0 / speed,
      }, "<")
      // 7. Words move completely out and fade
      .to([leftWrapperRef.current], {
        x: "-60vw",
        opacity: 0,
        duration: 0.8 / speed,
      }, "<")
      .to([rightWrapperRef.current], {
        x: "60vw",
        opacity: 0,
        duration: 0.8 / speed,
      }, "<");
      
    }, containerRef);

    return () => ctx.revert();
  }, [speed]);

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className}`}
    >
      <div className={styles.textContainer}>
        <div ref={leftWrapperRef} className={`${styles.wordWrapper} ${styles.leftWrapper}`}>
          <h1 ref={leftWordRef} className={`${styles.word} ${styles.leftWord}`}>
            {word1}
          </h1>
        </div>
        <div ref={rightWrapperRef} className={`${styles.wordWrapper} ${styles.rightWrapper}`}>
          <h1 ref={rightWordRef} className={`${styles.word} ${styles.rightWord}`}>
            {word2}
          </h1>
        </div>
      </div>

      <div ref={imageWrapperRef} className={styles.imageWrapper}>
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Reveal"
          className={styles.image}
        />
      </div>
    </div>
  );
};

export default TextSplitImageReveal;
