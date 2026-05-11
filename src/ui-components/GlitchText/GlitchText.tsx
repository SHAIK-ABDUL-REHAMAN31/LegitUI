"use client";

import React, { useEffect, useRef, useId } from "react";
import gsap from "gsap";
import styles from "./GlitchText.module.css";

interface GlitchTextProps {
    /** The text to display and glitch */
    text: string;
    /** Font size of the text */
    fontSize?: string;
    /** Font weight of the text */
    fontWeight?: string;
    /** Font family of the text */
    fontFamily?: string;
    /** Additional CSS classes */
    className?: string;
    /** How intense the glitch effect is (multiplier) */
    intensity?: number;
}

export default function GlitchText({
    text = "CYBERPUNK",
    fontSize = "clamp(3rem, 10vw, 8rem)",
    fontWeight = "900",
    fontFamily = "'Inter', system-ui, sans-serif",
    className = "",
    intensity = 1,
}: GlitchTextProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<SVGFETurbulenceElement>(null);
    const displacementRef = useRef<SVGFEDisplacementMapElement>(null);
    const redRef = useRef<HTMLDivElement>(null);
    const greenRef = useRef<HTMLDivElement>(null);
    const blueRef = useRef<HTMLDivElement>(null);

    // Use a unique ID for the SVG filter so multiple instances don't clash
    const filterId = useId();

    useEffect(() => {
        const ctx = gsap.context(() => {
            // 1. Jitter RGB Channels Continuously
            const rgbLayers = [redRef.current, greenRef.current, blueRef.current];
            
            rgbLayers.forEach((layer) => {
                gsap.to(layer, {
                    x: () => (Math.random() > 0.4 ? gsap.utils.random(-6 * intensity, 6 * intensity) : 0),
                    y: () => (Math.random() > 0.6 ? gsap.utils.random(-2 * intensity, 2 * intensity) : 0),
                    duration: () => gsap.utils.random(0.03, 0.1),
                    repeat: -1,
                    repeatRefresh: true,
                    ease: "steps(1)"
                });
            });

            // 2. Flicker Opacity
            gsap.to(containerRef.current, {
                opacity: () => (Math.random() > 0.8 ? gsap.utils.random(0.6, 0.9) : 1),
                duration: () => gsap.utils.random(0.05, 0.1),
                repeat: -1,
                repeatRefresh: true,
                ease: "steps(1)"
            });

            // 3. Noise Seed Animation for varying the displacement texture
            gsap.to(filterRef.current, {
                attr: {
                    baseFrequency: () => `${gsap.utils.random(0.01, 0.05)} ${gsap.utils.random(0.1, 0.8)}`,
                    seed: () => Math.floor(Math.random() * 100)
                },
                duration: () => gsap.utils.random(0.05, 0.2),
                repeat: -1,
                repeatRefresh: true,
                ease: "steps(1)"
            });

            // 4. Occasional Intense Displacement Glitches
            const glitchTimeline = gsap.timeline({ 
                repeat: -1, 
                repeatRefresh: true 
            });
            
            glitchTimeline.to(displacementRef.current, {
                attr: { scale: () => gsap.utils.random(20 * intensity, 60 * intensity) },
                duration: 0.05,
                ease: "steps(1)",
                delay: () => gsap.utils.random(1, 3)
            })
            .to(displacementRef.current, {
                attr: { scale: 0 },
                duration: 0.05,
                ease: "steps(1)"
            });

        }, containerRef);

        return () => ctx.revert();
    }, [intensity]);

    return (
        <div 
            ref={containerRef} 
            className={`${styles.container} ${className}`}
            style={{ fontSize, fontWeight, fontFamily }}
        >
            {/* Unique SVG Filter per instance */}
            <svg className={styles.svgFilter}>
                <defs>
                    <filter id={`glitch-displacement-${filterId}`} colorInterpolationFilters="sRGB">
                        <feTurbulence
                            ref={filterRef}
                            type="fractalNoise"
                            baseFrequency="0.05 0.9"
                            numOctaves="2"
                            result="noise"
                        />
                        <feDisplacementMap
                            ref={displacementRef}
                            in="SourceGraphic"
                            in2="noise"
                            scale="0"
                            xChannelSelector="R"
                            yChannelSelector="G"
                        />
                    </filter>
                </defs>
            </svg>

            {/* The Text Layers */}
            <div 
                className={styles.textWrapper}
                style={{ filter: `url(#glitch-displacement-${filterId})` }}
            >
                {/* Base layer is transparent and sets the actual DOM width/height */}
                <div className={styles.base}>{text}</div>
                
                {/* RGB Channels for Mix Blend Mode Screen */}
                <div ref={redRef} className={`${styles.channel} ${styles.red}`} aria-hidden="true">
                    {text}
                </div>
                <div ref={greenRef} className={`${styles.channel} ${styles.green}`} aria-hidden="true">
                    {text}
                </div>
                <div ref={blueRef} className={`${styles.channel} ${styles.blue}`} aria-hidden="true">
                    {text}
                </div>
                
                {/* Scanlines Overlay positioned over the text */}
                <div className={styles.scanlines} aria-hidden="true" />
            </div>
        </div>
    );
}
