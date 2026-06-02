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
            // Animate each character with a complex premium reveal
            gsap.fromTo(charsRef.current, 
                {
                    opacity: opacityStart,
                    color: inactiveColor,
                    y: 40,
                    rotationX: -50,
                    rotationY: 10,
                    scale: 0.8,
                    filter: "blur(10px)",
                },
                {
                    opacity: opacityEnd,
                    color: activeColor,
                    y: 0,
                    rotationX: 0,
                    rotationY: 0,
                    scale: 1,
                    filter: "blur(0px)",
                    ease: "power2.out",
                    stagger: 0.05,
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top 80%",
                        end: "bottom center",
                        scrub: 1.5,
                    },
                }
            );
        });

        return () => ctx.revert();
    }, [activeColor, inactiveColor, opacityStart, opacityEnd]);

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
                            willChange: "opacity, color, transform, filter"
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
