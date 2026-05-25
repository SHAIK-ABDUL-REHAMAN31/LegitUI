'use client';
import React, { useRef, useEffect } from 'react';
import styles from './BlurCursorText.module.css';
const BlurCursorText = ({ text = 'Flow', maxBlur = 4, proximityRadius = 80, transitionDuration = 0.25, fontSize = 'clamp(5rem, 15vw, 12rem)', fontWeight = '800', fontFamily = 'var(--font-geist-sans), "Outfit", "Inter", sans-serif', textColor = '#ffffff', className = '', }) => {
    const containerRef = useRef(null);
    useEffect(() => {
        const container = containerRef.current;
        if (!container)
            return;
        const handleMouseMove = (e) => {
            const charElements = container.querySelectorAll(`.${styles.char}`);
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            charElements.forEach((el) => {
                const span = el;
                const rect = span.getBoundingClientRect();
                // Calculate center point of the letter
                const charX = rect.left + rect.width / 2;
                const charY = rect.top + rect.height / 2;
                // Euclidean distance from cursor to character center
                const dx = mouseX - charX;
                const dy = mouseY - charY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < proximityRadius) {
                    // Linear factor: 1 at cursor center, 0 at proximity boundary
                    const rawFactor = 1 - dist / proximityRadius;
                    // Apply cosine-like curve for smoother organic interpolation
                    const factor = Math.sin(rawFactor * Math.PI / 2);
                    const blur = factor * maxBlur;
                    span.style.setProperty('--char-blur', `${blur}px`);
                }
                else {
                    span.style.setProperty('--char-blur', '0px');
                }
            });
        };
        const handleMouseLeave = () => {
            const charElements = container.querySelectorAll(`.${styles.char}`);
            charElements.forEach((el) => {
                const span = el;
                span.style.setProperty('--char-blur', '0px');
            });
        };
        // Attach listeners
        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseLeave);
        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [maxBlur, proximityRadius]);
    const chars = Array.from(text);
    return (<div ref={containerRef} className={`${styles.container} ${className}`} style={{
            fontSize,
            fontWeight,
            fontFamily,
            color: textColor,
            // Set dynamic transition duration as a CSS custom property
            ['--char-transition-duration']: `${transitionDuration}s`,
        }}>
      {chars.map((char, index) => (<span key={index} className={styles.char} style={{
                // Prevent layout shifts while scaling up
                display: 'inline-block',
            }}>
          {char === ' ' ? '\u00A0' : char}
        </span>))}
    </div>);
};
export default BlurCursorText;
