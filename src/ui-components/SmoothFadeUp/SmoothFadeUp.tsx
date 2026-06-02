"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import styles from "./SmoothFadeUp.module.css";

gsap.registerPlugin(ScrollTrigger);

interface SmoothFadeUpProps {
    /** Main headline text */
    heading?: React.ReactNode | React.ReactNode[];
    /** Secondary tagline / subtitle */
    subheading?: React.ReactNode | React.ReactNode[];
    /** Body paragraph */
    description?: React.ReactNode;
    /** Small pill / badge text above the heading */
    badge?: string;
    /** px the elements travel upward (default 60) */
    distance?: number;
    /** seconds per element (default 1) */
    duration?: number;
    /** seconds between each element (default 0.15) */
    stagger?: number;
    /** GSAP ease string (default "power3.out") */
    ease?: string;
    /** tie animation to scroll progress (default false) */
    scrub?: boolean;
    /** show CTA buttons (default true) */
    showButtons?: boolean;
    /** show decorative divider (default true) */
    showDivider?: boolean;
}

/**
 * SmoothFadeUp — Classic Motion Intro
 *
 * Each child element (heading, paragraph, badge, button …) fades in from
 * below with a staggered delay, creating a polished "rising curtain" feel.
 */
const SmoothFadeUp: React.FC<SmoothFadeUpProps> = ({
    heading = "Elevate Your Experience",
    subheading = "Crafted with precision. Designed for impact.",
    description = "A smooth, staggered fade‑in from below — the gold‑standard motion pattern used by the world's best landing pages to guide focus and build anticipation.",
    badge = "✦ Introducing",
    distance = 60,
    duration = 1.2,
    stagger = 0.15,
    ease = "power3.out",
    scrub = false,
    showButtons = true,
    showDivider = true,
}) => {
    const sectionRef = useRef<HTMLElement>(null);
    const itemsRef = useRef<(HTMLElement | null)[]>([]);

    useEffect(() => {
        const els = itemsRef.current.filter(Boolean) as HTMLElement[];

        const ctx = gsap.context(() => {
            // Starting state
            gsap.set(els, { opacity: 0, y: distance, filter: "blur(10px)", scale: 0.95 });

            if (scrub) {
                /* ── Scroll‑driven version ─────────────────── */
                gsap.to(els, {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    scale: 1,
                    ease: "none",
                    stagger: 0.1,
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 80%",
                        end: "top 30%",
                        scrub: 1,
                    },
                });
            } else {
                /* ── Auto‑play version (fires once on enter) ─ */
                ScrollTrigger.create({
                    trigger: sectionRef.current,
                    start: "top 85%",
                    once: true,
                    onEnter: () => {
                        gsap.to(els, {
                            opacity: 1,
                            y: 0,
                            filter: "blur(0px)",
                            scale: 1,
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
    const addRef = (el: HTMLElement | null) => {
        if (el && !itemsRef.current.includes(el)) itemsRef.current.push(el);
    };

    return (
        <section ref={sectionRef} className={styles.section}>
            <div className={styles.content}>
                {/* ── Badge ─────────────────────────────── */}
                {badge && (
                    <span ref={addRef} className={styles.badge}>
                        {badge}
                    </span>
                )}

                {/* ── Heading ───────────────────────────── */}
                <h1 className={styles.heading}>
                    {Array.isArray(heading) ? (
                        heading.map((line, idx) => (
                            <span key={idx} ref={addRef} style={{ display: "block" }}>
                                {line}
                            </span>
                        ))
                    ) : (
                        <span ref={addRef} style={{ display: "block" }}>
                            {heading}
                        </span>
                    )}
                </h1>

                {/* ── Subheading ────────────────────────── */}
                {subheading && (
                    <p ref={addRef} className={styles.subheading}>
                        {subheading}
                    </p>
                )}

                {/* ── Description ───────────────────────── */}
                {description && (
                    <p ref={addRef} className={styles.description}>
                        {description}
                    </p>
                )}

                {/* ── Decorative divider ────────────────── */}
                {showDivider && <span ref={addRef} className={styles.divider} />}

                {/* ── CTA Buttons ───────────────────────── */}
                {showButtons && (
                    <div ref={addRef} className={styles.buttonGroup}>
                        <button className={styles.primaryBtn}>
                            Get Started
                        </button>
                        <button className={styles.secondaryBtn}>
                            Learn More
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default SmoothFadeUp;
