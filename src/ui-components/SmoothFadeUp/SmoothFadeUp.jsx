"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import styles from "./SmoothFadeUp.module.css";
gsap.registerPlugin(ScrollTrigger);
/**
 * SmoothFadeUp — Classic Motion Intro
 *
 * Each child element (heading, paragraph, badge, button …) fades in from
 * below with a staggered delay, creating a polished "rising curtain" feel.
 */
const SmoothFadeUp = ({ heading = "Elevate Your Experience", subheading = "Crafted with precision. Designed for impact.", description = "A smooth, staggered fade‑in from below — the gold‑standard motion pattern used by the world's best landing pages to guide focus and build anticipation.", badge = "✦ Introducing", distance = 60, duration = 1, stagger = 0.15, ease = "power3.out", scrub = false, }) => {
    const sectionRef = useRef(null);
    const itemsRef = useRef([]);
    useEffect(() => {
        const els = itemsRef.current.filter(Boolean);
        const ctx = gsap.context(() => {
            // Starting state
            gsap.set(els, { opacity: 0, y: distance });
            if (scrub) {
                /* ── Scroll‑driven version ─────────────────── */
                gsap.to(els, {
                    opacity: 1,
                    y: 0,
                    ease: "none",
                    stagger: 0.1,
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 80%",
                        end: "top 30%",
                        scrub: 1,
                    },
                });
            }
            else {
                /* ── Auto‑play version (fires once on enter) ─ */
                ScrollTrigger.create({
                    trigger: sectionRef.current,
                    start: "top 80%",
                    once: true,
                    onEnter: () => {
                        gsap.to(els, {
                            opacity: 1,
                            y: 0,
                            duration,
                            ease,
                            stagger,
                        });
                    },
                });
            }
        }, sectionRef);
        return () => ctx.revert();
    }, [distance, duration, stagger, ease, scrub]);
    /* helper – push ref into array */
    const addRef = (el) => {
        if (el && !itemsRef.current.includes(el))
            itemsRef.current.push(el);
    };
    return (<section ref={sectionRef} className={styles.section}>
            <div className={styles.content}>
                {/* ── Badge ─────────────────────────────── */}
                {badge && (<span ref={addRef} className={styles.badge}>
                        {badge}
                    </span>)}

                {/* ── Heading ───────────────────────────── */}
                <h1 ref={addRef} className={styles.heading}>
                    {heading}
                </h1>

                {/* ── Subheading ────────────────────────── */}
                {subheading && (<p ref={addRef} className={styles.subheading}>
                        {subheading}
                    </p>)}

                {/* ── Description ───────────────────────── */}
                {description && (<p ref={addRef} className={styles.description}>
                        {description}
                    </p>)}

                {/* ── Decorative divider ────────────────── */}
                <span ref={addRef} className={styles.divider}/>

                {/* ── CTA Buttons ───────────────────────── */}
                <div ref={addRef} className={styles.buttonGroup}>
                    <button className={styles.primaryBtn}>
                        Get Started
                    </button>
                    <button className={styles.secondaryBtn}>
                        Learn More
                    </button>
                </div>
            </div>
        </section>);
};
export default SmoothFadeUp;
