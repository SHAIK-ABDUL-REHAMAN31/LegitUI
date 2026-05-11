"use client";
import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import styles from "./InfiniteImageMarquee.module.css";
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}
export default function InfiniteImageMarquee({ rows, }) {
    const containerRef = useRef(null);
    const rowsRef = useRef([]);
    useEffect(() => {
        // 1. Initialize Lenis for smooth scrolling
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            touchMultiplier: 2,
        });
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
        const tweens = [];
        // 2. Setup Infinite Marquee Loop
        rowsRef.current.forEach((rowElem, i) => {
            if (!rowElem)
                return;
            const rowData = rows[i];
            const speedMultiplier = rowData.speed || 1;
            const direction = speedMultiplier > 0 ? -1 : 1;
            // Calculate track width for seamless loop
            const track = rowElem.querySelector(`.${styles.track}`);
            const trackWidth = track ? track.clientWidth : 1000;
            // Base duration
            const baseDuration = 30 / Math.abs(speedMultiplier);
            let tween;
            if (direction < 0) {
                // Move Left
                tween = gsap.fromTo(rowElem, { x: 0 }, { x: -trackWidth, duration: baseDuration, ease: "none", repeat: -1 });
            }
            else {
                // Move Right
                tween = gsap.fromTo(rowElem, { x: -trackWidth }, { x: 0, duration: baseDuration, ease: "none", repeat: -1 });
            }
            tweens.push(tween);
            // Entrance Animation: First line left-to-right, Second right-to-left, Third left-to-right
            const startXPercent = i % 2 === 0 ? -25 : 25;
            gsap.fromTo(rowElem, { opacity: 0, xPercent: startXPercent }, {
                opacity: 1,
                xPercent: 0,
                duration: 3,
                ease: "power4.out",
                delay: i * 0.2, // Staggered entry
            });
        });
        // 3. Velocity-based Kinetic Effects (Skew & Blur)
        const proxy = { skew: 0, blur: 0, timeScale: 1 };
        // Create a generic proxy update tween that can be restarted
        const updateEffects = () => {
            rowsRef.current.forEach((row) => {
                if (row) {
                    gsap.set(row, {
                        skewX: proxy.skew,
                        filter: `blur(${proxy.blur}px)`,
                    });
                }
            });
            tweens.forEach((t) => t.timeScale(proxy.timeScale));
        };
        let scrollTimeout;
        const onScroll = ({ velocity }) => {
            const v = velocity; // Lenis velocity
            // Calculate targets based on velocity
            // Math.sign(v) applies directional skew based on scroll direction
            const targetSkew = gsap.utils.clamp(-15, 15, v * 0.15);
            const targetBlur = gsap.utils.clamp(0, 10, Math.abs(v) * 0.05);
            const targetTimeScale = 1 + Math.abs(v) * 0.02;
            // Animate proxy values towards target
            gsap.to(proxy, {
                skew: targetSkew,
                blur: targetBlur,
                timeScale: targetTimeScale,
                duration: 0.4,
                ease: "power2.out",
                onUpdate: updateEffects,
                overwrite: true,
            });
            // Clear previous timeout
            clearTimeout(scrollTimeout);
            // Snap back to zero when scrolling stops
            scrollTimeout = setTimeout(() => {
                gsap.to(proxy, {
                    skew: 0,
                    blur: 0,
                    timeScale: 1,
                    duration: 0.6,
                    ease: "power3.out",
                    onUpdate: updateEffects,
                    overwrite: true,
                });
            }, 50);
        };
        lenis.on("scroll", onScroll);
        return () => {
            lenis.destroy();
            clearTimeout(scrollTimeout);
            tweens.forEach((t) => t.kill());
        };
    }, [rows]);
    return (<div ref={containerRef} className={styles.container}>
      <div className={styles.perspectiveWrapper}>
        {rows.map((row, i) => (<div key={i} className={styles.row} ref={(el) => {
                if (el)
                    rowsRef.current[i] = el;
            }}>
            {/* Render 2 identical tracks to create the seamless infinite scroll */}
            <div className={styles.track}>
              {row.images.map((src, idx) => (<div key={`a-${idx}`} className={styles.imageBox}>
                  <img src={src} alt="marquee" className={styles.image}/>
                </div>))}
            </div>
            <div className={styles.track}>
              {row.images.map((src, idx) => (<div key={`b-${idx}`} className={styles.imageBox}>
                  <img src={src} alt="marquee" className={styles.image}/>
                </div>))}
            </div>
          </div>))}
      </div>
    </div>);
}
