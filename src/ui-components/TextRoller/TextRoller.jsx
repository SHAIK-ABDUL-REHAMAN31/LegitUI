"use client";
import React, { useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import styles from "./TextRoller.module.css";
const TextRoller = ({ words = "APPLICATIONS,ARCHITECTURE,PERFORMANCE,SCALABILITY,SECURITY,DEPLOYMENT,OPTIMIZATION,TESTING,APIs,INTEGRATION", speed = 1.0, className = "", fontSize = "clamp(2rem, 5vw, 3.5rem)", curveStrength = 100, }) => {
    const containerRef = useRef(null);
    const listRef = useRef(null);
    const arrowRef = useRef(null);
    const itemsRef = useRef([]);
    const activeIndexRef = useRef(-1);
    const tweenRef = useRef(null);
    const arrowTweenRef = useRef(null);
    const wordList = words.split(",").map((w) => w.trim());
    // Triple the list for seamless infinite loop
    const tripled = [...wordList, ...wordList, ...wordList];
    const ITEM_HEIGHT = 60;
    const FALLOFF_THRESHOLD = 0.05;
    const updateItemStyles = useCallback(() => {
        const container = containerRef.current;
        if (!container)
            return;
        const containerRect = container.getBoundingClientRect();
        const centerY = containerRect.top + containerRect.height / 2;
        const maxDistance = containerRect.height / 2;
        let closestIdx = -1;
        let closestDist = Infinity;
        itemsRef.current.forEach((item, i) => {
            if (!item)
                return;
            const itemRect = item.getBoundingClientRect();
            const itemCenterY = itemRect.top + itemRect.height / 2;
            const distance = itemCenterY - centerY;
            const normalized = Math.max(-1, Math.min(1, distance / maxDistance));
            const absNorm = Math.abs(normalized);
            // Track closest to center
            if (Math.abs(distance) < closestDist) {
                closestDist = Math.abs(distance);
                closestIdx = i;
            }
            // Center item is fully focused and opaque; others blur and fade
            const opacity = Math.max(0.15, 1 - Math.pow(absNorm, 1.2));
            const scale = 1; // Keeping scale uniform for stability
            const blur = Math.pow(absNorm, 1.3) * 12;
            // Semi-circle arc: center shifts right, edges shift left
            const angle = normalized * (Math.PI / 2.1);
            const arcRadius = curveStrength * 1.5;
            const xOffset = Math.cos(angle) * arcRadius - arcRadius;
            gsap.set(item, {
                opacity,
                scale,
                x: xOffset,
                rotateX: normalized * 75,
                filter: `blur(${blur}px)`,
                zIndex: 100 - Math.round(absNorm * 100),
            });
        });
        // Track active index for internal logic (zIndex/etc)
        if (closestIdx !== activeIndexRef.current && closestIdx >= 0) {
            activeIndexRef.current = closestIdx;
        }
    }, [curveStrength]);
    useEffect(() => {
        const list = listRef.current;
        const container = containerRef.current;
        if (!list || !container)
            return;
        const singleSetHeight = wordList.length * ITEM_HEIGHT;
        // Position the list so the middle set starts centered
        gsap.set(list, { y: -singleSetHeight });
        let currentY = -singleSetHeight;
        let timerRef = null;
        const animateNext = () => {
            currentY -= ITEM_HEIGHT;
            // Predict the incoming active item (the one moving into the center)
            const nextIdx = activeIndexRef.current + 1;
            const incomingItem = itemsRef.current[nextIdx];
            let innerText = null;
            if (incomingItem) {
                innerText = incomingItem.querySelector('.inner-text');
            }
            // Arrow performs a smooth, fluid selection animation
            if (arrowRef.current) {
                gsap.killTweensOf(arrowRef.current);
                const tl = gsap.timeline();
                tl.to(arrowRef.current, { x: 12, duration: 0.2, ease: "power2.out" })
                    .to(arrowRef.current, { x: 0, duration: 0.3, ease: "power2.inOut" });
            }
            // Text reacts smoothly to the arrow
            if (innerText) {
                gsap.killTweensOf(innerText);
                const tlText = gsap.timeline();
                tlText.to(innerText, { x: 12, duration: 0.2, ease: "power2.out" })
                    .to(innerText, { x: 0, duration: 0.3, ease: "power2.inOut" });
            }
            tweenRef.current = gsap.to(list, {
                y: currentY,
                duration: 0.5,
                ease: "power3.inOut",
                onUpdate: updateItemStyles,
                onComplete: () => {
                    // Check if we've scrolled a full set
                    if (currentY <= -singleSetHeight * 2) {
                        currentY += singleSetHeight;
                        gsap.set(list, { y: currentY });
                        updateItemStyles();
                    }
                    timerRef = gsap.delayedCall(speed, animateNext);
                }
            });
        };
        // Start ticking
        timerRef = gsap.delayedCall(speed, animateNext);
        // Arrow idle yoyo animation
        if (arrowRef.current) {
            arrowTweenRef.current = gsap.to(arrowRef.current, {
                x: 6,
                duration: 1.2,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
            });
        }
        // Initial style pass
        updateItemStyles();
        return () => {
            tweenRef.current?.kill();
            timerRef?.kill();
            arrowTweenRef.current?.kill();
        };
    }, [words, speed, wordList.length, updateItemStyles]);
    return (<div ref={containerRef} className={`${styles.container} ${className}`} style={{ perspective: 800 }}>
      {/* Arrow indicator */}
      <div ref={arrowRef} className={styles.arrow}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12h16m-7-7 7 7-7 7"/>
        </svg>
      </div>

      {/* Roller list */}
      <div className={styles.viewport}>
        <div ref={listRef} className={styles.list}>
          {tripled.map((word, i) => (<div key={`${word}-${i}`} ref={(el) => {
                if (el)
                    itemsRef.current[i] = el;
            }} className={styles.item} style={{ height: ITEM_HEIGHT, fontSize }}>
              <div className="inner-text" style={{ willChange: "transform", display: "inline-block" }}>
                {word}
              </div>
            </div>))}
        </div>
      </div>

      {/* Top and bottom fade overlays */}
      <div className={styles.fadeTop}/>
      <div className={styles.fadeBottom}/>
    </div>);
};
export default TextRoller;
