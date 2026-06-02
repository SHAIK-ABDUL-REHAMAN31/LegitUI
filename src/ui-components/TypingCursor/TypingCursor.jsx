"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { motion } from "framer-motion";
import styles from "./TypingCursor.module.css";
/**
 * UltraSmoothTyping Component
 *
 * A premium typing effect that uses GSAP for high-performance character staggering
 * and Framer Motion for a smooth, glowing cursor.
 *
 * Features:
 * - Fluid character reveals (opacity + transform + blur)
 * - Gradient text support
 * - Hardware-accelerated animations
 */
const TypingCursor = ({ text, typingSpeed = 0.04, delay = 0.5, className = "", fontSize, textColor = "#ffffff", backgroundColor = "#000000", cursorColor, }) => {
    const containerRef = useRef(null);
    const charsRef = useRef([]);
    useEffect(() => {
        if (!containerRef.current)
            return;
        // Reset character refs array
        charsRef.current = charsRef.current.slice(0, text.length);
        // Initial state: Hidden from flow so cursor stays at the start
        gsap.set(charsRef.current, {
            opacity: 0,
            y: 10,
            rotateX: -60,
            scale: 0.9,
            filter: "blur(10px)",
            display: "none" // Removed from flow
        });
        const tl = gsap.timeline({ delay });
        // The core 'Typing' logic:
        // We use a stagger to flip 'display' to 'inline-block' one by one,
        // which pushes the cursor forward in the flow.
        tl.to(charsRef.current, {
            display: "inline-block",
            duration: 0, // Instant flip to show in flow
            stagger: typingSpeed,
        })
            .to(charsRef.current, {
            opacity: 1,
            y: 0,
            rotateX: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.6,
            ease: "power3.out",
            stagger: typingSpeed,
        }, 0); // Start at the same time as the display flip
        return () => {
            tl.kill();
        };
    }, [text, typingSpeed, delay, textColor, backgroundColor, cursorColor]);
    return (<div className={`${styles.container} ${className}`} ref={containerRef} style={{ 
            fontSize: fontSize || undefined,
            color: textColor,
            backgroundColor: backgroundColor
        }}>
            <span className={styles.gradientText}>
                {text.split("").map((char, index) => (<span key={`${char}-${index}`} ref={(el) => {
                if (el)
                    charsRef.current[index] = el;
            }} className={styles.char}>
                        {char === " " ? "\u00A0" : char}
                    </span>))}
                <motion.span className={styles.cursor} style={cursorColor ? { background: cursorColor, boxShadow: `0 0 10px ${cursorColor}` } : undefined}/>
            </span>
        </div>);
};
export default TypingCursor;
