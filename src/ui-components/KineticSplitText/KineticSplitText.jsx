"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import SplitType from "split-type";
import styles from "./KineticSplitText.module.css";
const KineticSplitText = ({ text = "KINETIC TYPOGRAPHY", className = "", staggerDuration = 0.04, textColor = "#ffffff", }) => {
    const textRef = useRef(null);
    useEffect(() => {
        if (!textRef.current)
            return;
        // Split the text into words and characters
        const split = new SplitType(textRef.current, { types: "words,chars" });
        // Set initial state for cinematic entrance
        gsap.set(split.chars, {
            opacity: 0,
            y: 120,
            rotateX: -90,
            rotateY: 20,
            z: -200,
            filter: "blur(24px)",
        });
        const tl = gsap.timeline();
        tl.to(split.chars, {
            y: 0,
            opacity: 1,
            rotateX: 0,
            rotateY: 0,
            z: 0,
            filter: "blur(0px)",
            stagger: {
                amount: split.chars ? split.chars.length * staggerDuration : 1,
                from: "start",
                ease: "power2.out",
            },
            ease: "power4.out",
            duration: 1.8,
        });
        // Cleanup on unmount
        return () => {
            split.revert();
            tl.kill();
        };
    }, [text, staggerDuration]);
    return (<div className={`${styles.container} ${className}`}>
      <h1 ref={textRef} className={styles.headline} style={{ color: textColor }}>
        {text}
      </h1>
    </div>);
};
export default KineticSplitText;
