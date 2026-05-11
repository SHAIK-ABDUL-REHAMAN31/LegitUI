"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import styles from "./ScaleBlur.module.css";

gsap.registerPlugin(ScrollTrigger);

interface ScaleBlurProps {
    text?: string;
}

const ScaleBlur: React.FC<ScaleBlurProps> = ({
    text = "Build. Ship. Scale.",
}) => {
    const sectionRef = useRef<HTMLElement | null>(null);
    const descriptionRef = useRef<HTMLParagraphElement | null>(null);
    const wordsRef = useRef<(HTMLSpanElement | null)[]>([]);
    const words = text.split(" ").filter(Boolean);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Initial states
            gsap.set(wordsRef.current, {
                opacity: 0,
                y: 24,
                scale: 0.94,
                filter: "blur(20px)",
            });

            gsap.set(descriptionRef.current, {
                opacity: 0,
                y: 30,
            });

            // Animation timeline
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 78%",
                    end: "top 58%",
                    once: true,
                },
            });

            tl.to(wordsRef.current, {
                opacity: 1,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
                duration: 1,
                ease: "power3.out",
                stagger: 0.1,
            })
                .to(descriptionRef.current, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power2.out",
                }, "-=0.6"); // Start slightly before the words finish
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const addWordRef = (el: HTMLSpanElement | null) => {
        if (el && !wordsRef.current.includes(el)) {
            wordsRef.current.push(el);
        }
    };

    return (
        <section ref={sectionRef} className={styles.container}>
            <h2 className={styles.title}>
                {words.map((word, index) => (
                    <span
                        key={index}
                        ref={addWordRef}
                        className={styles.word}
                    >
                        {word}
                    </span>
                ))}
            </h2>

            <p ref={descriptionRef} className={styles.description}>
                Where innovation meets flawless execution in every pixel.
            </p>
        </section>
    );
};

export default ScaleBlur;
