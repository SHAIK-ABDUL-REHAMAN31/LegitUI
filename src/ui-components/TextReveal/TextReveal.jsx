"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import styles from "./TextReveal.module.css";

gsap.registerPlugin(ScrollTrigger);

const ScrollWipeText = ({ 
    text = "Scroll to reveal this text",
    activeColor = "#ffffff",
    inactiveColor = "#6b7280",
    opacityStart = 0.1,
    opacityEnd = 1,
    className = ""
}) => {
    const containerRef = useRef(null);
    const charsRef = useRef([]);

    // Split the text into an array of individual characters
    const chars = text.split("");

    useEffect(() => {
        let ctx = gsap.context(() => {
            // Animate each character to full opacity and active color
            gsap.to(charsRef.current, {
                opacity: opacityEnd,
                color: activeColor,
                ease: "none",
                stagger: 0.1, // Staggers the effect character by character
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 65%", // Adjusted start so the first letter fades naturally
                    end: "bottom center",
                    scrub: 1, // Smooth scrubbing
                },
            });
        });

        return () => ctx.revert();
    }, [activeColor, opacityEnd]);

    return (
        <div
            ref={containerRef}
            className={`${styles.container} ${className}`}
        >
            <h1 className={styles.heading}>
                {chars.map((char, i) => (
                    <span
                        key={i}
                        ref={(el) => (charsRef.current[i] = el)}
                        className={styles.char}
                        style={{
                            color: inactiveColor,
                            opacity: opacityStart,
                            whiteSpace: char === " " ? "pre" : "normal",
                            willChange: "opacity, color"
                        }}
                    >
                        {char}
                    </span>
                ))}
            </h1>
        </div>
    );
};

export default ScrollWipeText;
