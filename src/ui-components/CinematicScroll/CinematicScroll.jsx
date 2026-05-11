"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { motion } from "framer-motion";
import styles from "./CinematicScroll.module.css";
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}
const defaultPanels = [
    {
        id: "01",
        title: "ASCEND",
        subtitle: "Peaks piercing through the atmospheric veil.",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=3000&auto=format&fit=crop",
    },
    {
        id: "02",
        title: "ABYSS",
        subtitle: "Unfathomable depths where light ceases to exist.",
        image: "https://images.unsplash.com/photo-1551244072-5d12893278ab?q=80&w=3000&auto=format&fit=crop",
    },
    {
        id: "03",
        title: "EXPANSE",
        subtitle: "An endless ocean of shifting golden sands.",
        image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=3000&auto=format&fit=crop",
    },
    {
        id: "04",
        title: "HORIZON",
        subtitle: "The final frontier unfolding in absolute silence.",
        image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=3000&auto=format&fit=crop",
    },
    {
        id: "05",
        title: "NEXUS",
        subtitle: "A concrete jungle illuminated by neon veins.",
        image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=3000&auto=format&fit=crop",
    },
];
export default function CinematicScroll({ panels = defaultPanels, className = "", }) {
    const containerRef = useRef(null);
    const trackRef = useRef(null);
    useEffect(() => {
        // 1. Initialize Lenis
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            touchMultiplier: 2,
        });
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
        // 2. Setup Horizontal Scroll
        const track = trackRef.current;
        if (!track)
            return;
        // Use specific class names for targeting within the component scope
        const panelsElems = gsap.utils.toArray(containerRef.current?.querySelectorAll(`.${styles.panel}`) || []);
        // Calculate the total scrollable width
        const totalScroll = track.offsetWidth - window.innerWidth;
        // Pinning and horizontal translation
        const pinTween = gsap.to(track, {
            x: -totalScroll,
            ease: "none",
            scrollTrigger: {
                trigger: containerRef.current,
                pin: true,
                scrub: 1,
                end: () => "+=" + track.offsetWidth,
            },
        });
        // 3. Setup Parallax and Blur for Images inside each panel
        panelsElems.forEach((panel, i) => {
            const img = panel.querySelector(`.${styles.image}`);
            const inner = panel.querySelector(`.${styles.inner}`);
            // Image Parallax (Layered movement)
            if (img) {
                gsap.to(img, {
                    xPercent: 30, // move the image horizontally for parallax
                    ease: "none",
                    scrollTrigger: {
                        trigger: panel,
                        containerAnimation: pinTween,
                        start: "left right",
                        end: "right left",
                        scrub: true,
                    },
                });
                // Dynamic blur transitions
                gsap.fromTo(img, { filter: "blur(10px)", scale: 1.1 }, {
                    filter: "blur(0px)",
                    scale: 1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: panel,
                        containerAnimation: pinTween,
                        start: "left center",
                        end: "center center",
                        scrub: 1,
                    }
                });
            }
            // Masking Entrance Animation
            if (inner) {
                if (i === 0) {
                    // First panel animates on vertical scroll into view
                    gsap.fromTo(inner, { clipPath: "inset(0% 100% 0% 0% round 24px)" }, {
                        clipPath: "inset(0% 0% 0% 0% round 24px)",
                        ease: "power3.inOut",
                        scrollTrigger: {
                            trigger: containerRef.current,
                            start: "top 60%",
                            end: "top 20%",
                            scrub: 1,
                        },
                    });
                }
                else {
                    // Subsequent panels animate on horizontal scrub
                    gsap.fromTo(inner, { clipPath: "inset(0% 100% 0% 0% round 24px)" }, {
                        clipPath: "inset(0% 0% 0% 0% round 24px)",
                        ease: "power3.inOut",
                        scrollTrigger: {
                            trigger: panel,
                            containerAnimation: pinTween,
                            start: "left 80%",
                            end: "center center",
                            scrub: 1,
                        },
                    });
                }
            }
        });
        return () => {
            lenis.destroy();
            pinTween.kill();
            ScrollTrigger.getAll().forEach((t) => t.kill());
        };
    }, []);
    return (<div ref={containerRef} className={`${styles.container} ${className}`}>
      <div ref={trackRef} className={styles.track} style={{ width: `${panels.length * 100}vw` }}>
        {panels.map((panel, i) => (<section key={panel.id} className={styles.panel}>
            {/* Background Layer with Masking & Blur */}
            <div className={styles.mask}>
              <div className={styles.inner}>
                <div className={styles.image} style={{
                backgroundImage: `url(${panel.image})`,
            }}/>
                <div className={styles.overlay}/>
              </div>
            </div>

            {/* Giant Typography (Framer Motion) */}
            <div className={styles.textContainer}>
              <motion.h2 initial={{ opacity: 0, y: 100, scale: 0.8 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: false, margin: "-20%" }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }} className={styles.title}>
                {panel.title}
              </motion.h2>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, margin: "-10%" }} transition={{ duration: 1, ease: "easeOut", delay: 0.5 }} className={styles.subtitleContainer}>
                <span className={styles.idBadge}>
                  {panel.id}
                </span>
                <p className={styles.subtitle}>
                  {panel.subtitle}
                </p>
              </motion.div>
            </div>
          </section>))}
      </div>
    </div>);
}
