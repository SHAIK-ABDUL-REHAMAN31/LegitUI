"use client";
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { motion } from 'framer-motion';
import styles from './StaggeredWordSlide.module.css';
/**
 * StaggeredWordSlide Component
 *
 * A premium text effect that slides words up from a mask with a staggered delay.
 * Uses GSAP for high-performance professional motion and Framer Motion for layout.
 */
const StaggeredWordSlide = ({ text = "Elevating Digital Experiences With Premium Motion", subtitle = "Our bespoke animation engine delivers fluid, high-fidelity transitions that captivate users and define modern web aesthetics." }) => {
    const containerRef = useRef(null);
    const wordsRef = useRef([]);
    const subtitleRef = useRef(null);
    useEffect(() => {
        // Clear the ref array before populating to avoid duplicates in dev HMR
        wordsRef.current = wordsRef.current.slice(0, text.split(" ").length);
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                defaults: { ease: "power4.out", duration: 1.4 }
            });
            // Target only the elements that exist
            const validWords = wordsRef.current.filter(Boolean);
            tl.from(validWords, {
                y: "110%",
                skewY: 10,
                rotateX: -10,
                opacity: 0,
                stagger: {
                    amount: 0.6,
                    from: "start"
                },
            })
                .to(subtitleRef.current, {
                opacity: 1,
                y: 0,
                duration: 1.2,
                ease: "power3.out"
            }, "-=1.0");
        }, containerRef);
        return () => ctx.revert();
    }, [text]);
    const words = text.split(" ");
    return (<section ref={containerRef} className={styles.container}>
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className={styles.wrapper}>
        <h2 className={styles.heading}>
          {words.map((word, i) => (<span key={i} className={styles.wordContainer}>
              <span ref={(el) => { wordsRef.current[i] = el; }} className={`${styles.word} ${i >= words.length - 2 ? styles.accent : ''}`}>
                {word}
              </span>
            </span>))}
        </h2>
        <p ref={subtitleRef} className={styles.subtitle}>
          {subtitle}
        </p>
      </motion.div>
    </section>);
};
export default StaggeredWordSlide;
