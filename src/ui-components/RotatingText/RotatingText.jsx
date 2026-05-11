"use client";
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './RotatingText.module.css';
export const RotatingText = ({ fixedText = "WE DESIGN", words = [
    "WEBSITES",
    "EXPERIENCES",
    "INTERFACES",
    "PRODUCTS",
    "SYSTEMS",
    "JOURNEYS",
    "SOLUTIONS",
    "BRANDS"
], interval = 2500, className = "" }) => {
    const scrollObj = useRef({ value: 0 });
    const wordRefs = useRef([]);
    const updatePositions = (scrollVal) => {
        words.forEach((_, i) => {
            const el = wordRefs.current[i];
            if (!el)
                return;
            const len = words.length;
            let diff = i - scrollVal;
            let offset = diff % len;
            if (offset > len / 2)
                offset -= len;
            if (offset < -len / 2)
                offset += len;
            const yPercent = offset * 110;
            const dist = Math.abs(offset);
            let opacity = 0;
            if (dist <= 1)
                opacity = 1 - dist * 0.7; // 1 -> 0.3
            else if (dist <= 1.5)
                opacity = 0.3 - (dist - 1) * 0.6; // 0.3 -> 0
            const scale = 1 - Math.min(dist, 1) * 0.15;
            const filter = `blur(${Math.min(dist, 1.5) * 4}px)`;
            const zIndex = dist < 0.5 ? 10 : 1;
            gsap.set(el, {
                yPercent,
                opacity,
                scale,
                filter,
                zIndex,
            });
        });
    };
    useEffect(() => {
        updatePositions(scrollObj.current.value);
        let currentTarget = 0;
        let direction = 1;
        let lastIndex = 0;
        let timeoutId;
        const spin = () => {
            const len = words.length;
            // Pick a random distinct index
            let newIndex = Math.floor(Math.random() * (len - 1));
            if (newIndex >= lastIndex)
                newIndex += 1;
            // Calculate steps for 2 full rotations + distance to new index
            let spinSteps = 0;
            if (direction === 1) {
                spinSteps = len * 2 + ((newIndex - lastIndex + len) % len);
                currentTarget += spinSteps;
            }
            else {
                spinSteps = len * 2 + ((lastIndex - newIndex + len) % len);
                currentTarget -= spinSteps;
            }
            lastIndex = newIndex;
            direction *= -1; // Alternate direction
            gsap.to(scrollObj.current, {
                value: currentTarget,
                duration: 2.5, // Fast spin, smooth deceleration
                ease: "power4.inOut",
                onUpdate: () => updatePositions(scrollObj.current.value),
                onComplete: () => {
                    // Pause at the word for a random time (1.5s to 3.5s) then spin again
                    const pauseDuration = Math.floor(Math.random() * 2000) + 1500;
                    timeoutId = setTimeout(spin, pauseDuration);
                }
            });
        };
        timeoutId = setTimeout(spin, 1000);
        return () => {
            clearTimeout(timeoutId);
            gsap.killTweensOf(scrollObj.current);
        };
    }, [words.length]);
    return (<div className={`${styles.container} ${className}`}>
      <div className={styles.fixedText}>{fixedText}</div>
      <div className={styles.wordsContainer}>
        {words.map((word, i) => (<div key={i} ref={(el) => { wordRefs.current[i] = el; }} className={styles.word}>
            {word}
          </div>))}
      </div>
    </div>);
};
export default RotatingText;
