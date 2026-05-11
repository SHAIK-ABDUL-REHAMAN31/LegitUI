"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./LiquidText.module.css";

interface LiquidWaveTextProps {
    text?: string;
    speed?: number;
    amplitude?: number;
    baseFreqX?: number;
    baseFreqY?: number;
    targetFreqX?: number;
    targetFreqY?: number;
    verticalSway?: number;
    fontSize?: string;
    fontFamily?: string;
    className?: string;
}

const LiquidWaveText: React.FC<LiquidWaveTextProps> = ({
    text = "Liquid Wave",
    speed = 4,
    amplitude = 30,
    baseFreqX = 0.01,
    baseFreqY = 0.015,
    targetFreqX = 0.03,
    targetFreqY = 0.04,
    verticalSway = 12,
    fontSize = "clamp(4rem, 8vw, 130px)",
    fontFamily = "system-ui, sans-serif",
    className = "",
}) => {
    const filterRef = useRef<SVGFETurbulenceElement | null>(null);
    const textRef = useRef<SVGTextElement | null>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Proxy object to smoothly animate the turbulence base frequency
            const proxy = { baseFreqX, baseFreqY };

            const tl = gsap.timeline({ repeat: -1, yoyo: true });

            tl.to(proxy, {
                baseFreqX: targetFreqX,
                baseFreqY: targetFreqY,
                duration: speed,
                ease: "sine.inOut",
                onUpdate: () => {
                    if (filterRef.current) {
                        filterRef.current.setAttribute(
                            "baseFrequency",
                            `${proxy.baseFreqX} ${proxy.baseFreqY}`,
                        );
                    }
                },
            });

            // Sync subtle vertical text motion
            gsap.to(textRef.current, {
                y: verticalSway,
                duration: speed,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
            });
        });

        return () => ctx.revert();
    }, [speed, baseFreqX, baseFreqY, targetFreqX, targetFreqY, verticalSway]);

    return (
        <section className={`${styles.container} ${className}`}>
            <div className={styles.svgWrapper}>
                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 1000 300"
                    className={styles.svgElement}
                >
                    <defs>
                        <filter id="liquidWaveFilter" x="-20%" y="-20%" width="140%" height="140%">
                            <feTurbulence
                                ref={filterRef}
                                type="fractalNoise"
                                baseFrequency={`${baseFreqX} ${baseFreqY}`}
                                numOctaves="3"
                                result="warp"
                            />
                            <feDisplacementMap
                                in="SourceGraphic"
                                in2="warp"
                                scale={amplitude}
                                xChannelSelector="R"
                                yChannelSelector="B"
                            />
                        </filter>
                        <linearGradient
                            id="liquidTextGradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                        >
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="30%" stopColor="#cbd5e1" />
                            <stop offset="48%" stopColor="#94a3b8" />
                            <stop offset="50%" stopColor="#f3f7ffff" />
                            <stop offset="53%" stopColor="#f1f2f4ff" />
                            <stop offset="85%" stopColor="#e2e8f0" />
                            <stop offset="100%" stopColor="#ffffff" />
                        </linearGradient>
                    </defs>

                    <text
                        ref={textRef}
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="url(#liquidTextGradient)"
                        filter="url(#liquidWaveFilter)"
                        className={styles.liquidText}
                        style={{
                            fontFamily,
                            fontSize,
                        }}
                    >
                        {text}
                    </text>
                </svg>
            </div>
        </section>
    );
};

export default LiquidWaveText;
