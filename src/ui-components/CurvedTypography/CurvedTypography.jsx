"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { motion } from "framer-motion";
import styles from "./CurvedTypography.module.css";
const pathData = {
    circle: {
        viewBox: "0 0 500 500",
        d1: "M 250,50 A 200,200 0 1,1 249.9,50",
        d2: "M 250,40 A 210,190 0 1,1 249.9,40",
    },
    wave: {
        viewBox: "0 0 1000 300",
        d1: "M -100,150 C 150,0 350,300 600,150 C 850,0 1050,300 1300,150",
        d2: "M -100,150 C 150,50 350,250 600,150 C 850,50 1050,250 1300,150",
    },
    spiral: {
        viewBox: "0 0 500 500",
        d1: "M 250,250 m 0,-20 a 20,20 0 1,1 -20,20 a 40,40 0 1,0 40,-40 a 60,60 0 1,1 -60,60 a 80,80 0 1,0 80,-80 a 100,100 0 1,1 -100,100 a 120,120 0 1,0 120,-120 a 140,140 0 1,1 -140,140 a 160,160 0 1,0 160,-160 a 180,180 0 1,1 -180,180 a 200,200 0 1,0 200,-200",
        d2: "M 250,250 m 0,-15 a 15,15 0 1,1 -15,15 a 35,35 0 1,0 35,-35 a 55,55 0 1,1 -55,55 a 75,75 0 1,0 75,-75 a 95,95 0 1,1 -95,95 a 115,115 0 1,0 115,-115 a 135,135 0 1,1 -135,135 a 155,155 0 1,0 155,-155 a 175,175 0 1,1 -175,175 a 195,195 0 1,0 195,-195",
    },
};
const CurvedTypography = ({ text = "CREATIVE TECHNOLOGY · EXPERIMENTAL TYPOGRAPHY · WEB DEVELOPMENT · ", type = "wave", speed = 10, textColor = "#ffffff", fontSize = 20, fontWeight = 800, letterSpacing = "2px", showPath = true, pathColor = "rgba(255, 255, 255, 0.05)", morphSpeed = 8, className = "", }) => {
    const textPathRef = useRef(null);
    const data = pathData[type] || pathData.wave;
    // Multiply text to ensure it's long enough to cover the path
    const multipliedText = Array(15).fill(text).join(" ");
    const pathId = `curved-path-${type}`;
    useEffect(() => {
        if (!textPathRef.current)
            return;
        // Use GSAP modifiers for continuous seamless scrolling
        // Animating startOffset from 0 to -100% and wrapping
        const tween = gsap.to(textPathRef.current, {
            attr: { startOffset: "-100%" },
            duration: speed,
            ease: "none",
            repeat: -1,
            modifiers: {
                startOffset: (value) => {
                    const num = parseFloat(value);
                    // Keep it between 0 and -100 for seamless repeating
                    return `${-(((Math.abs(num) % 100) + 100) % 100)}%`;
                },
            },
        });
        return () => {
            tween.kill();
        };
    }, [speed]);
    return (<div className={`${styles.container} ${className}`}>
      <svg className={styles.svg} viewBox={data.viewBox} preserveAspectRatio="xMidYMid meet">
        <defs>
          <motion.path id={pathId} d={data.d1} animate={{ d: [data.d1, data.d2, data.d1] }} transition={{
            duration: morphSpeed,
            ease: "easeInOut",
            repeat: Infinity,
        }}/>
        </defs>

        {showPath && (<motion.path className={styles.path} style={{ stroke: pathColor }} d={data.d1} animate={{ d: [data.d1, data.d2, data.d1] }} transition={{
                duration: morphSpeed,
                ease: "easeInOut",
                repeat: Infinity,
            }}/>)}

        <text className={styles.textPath} fill={textColor} fontSize={fontSize} fontWeight={fontWeight} letterSpacing={letterSpacing}>
          <textPath ref={textPathRef} href={`#${pathId}`} startOffset="0%">
            {multipliedText}
          </textPath>
        </text>
      </svg>
    </div>);
};
export default CurvedTypography;
