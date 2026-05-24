'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import styles from './ScrollCircleTransition.module.css';
const DEFAULT_COLORS = [
    '#ffffff', // White
    '#2563eb', // Royal Blue
];
const ScrollCircleTransition = ({ section1Content, section2Content, colors = DEFAULT_COLORS, animationDuration = 2.4, staggerDelay = 0.4, className = '', onTransitionStart, onTransitionComplete, }) => {
    const [activeSection, setActiveSection] = useState(1);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const containerRef = useRef(null);
    const section2Ref = useRef(null);
    const isAnimatingRef = useRef(false);
    const touchStartY = useRef(0);
    // Dynamic calculations for overall transition lock duration
    const totalDurationMs = ((colors.length - 1) * staggerDelay + animationDuration) * 1000;
    // ── Forward Transition (Section 1 ➔ Section 2) ──
    const triggerForward = useCallback(() => {
        if (isAnimatingRef.current)
            return;
        isAnimatingRef.current = true;
        setIsAnimating(true);
        setIsTransitioning(true);
        if (onTransitionStart) {
            onTransitionStart(2);
        }
        // Mount Section 2 early (at 1400ms) as the blue circle covers the screen,
        // so the text slide-up starts instantly without waiting for the full settle!
        setTimeout(() => {
            setActiveSection(2);
        }, 1400);
        setTimeout(() => {
            isAnimatingRef.current = false;
            setIsAnimating(false);
            if (onTransitionComplete) {
                onTransitionComplete(2);
            }
        }, totalDurationMs);
    }, [totalDurationMs, onTransitionStart, onTransitionComplete]);
    // ── Backward Transition (Section 2 ➔ Section 1) ──
    const triggerBackward = useCallback(() => {
        if (isAnimatingRef.current)
            return;
        isAnimatingRef.current = true;
        setIsAnimating(true);
        setActiveSection(1);
        setIsTransitioning(false);
        if (onTransitionStart) {
            onTransitionStart(1);
        }
        setTimeout(() => {
            isAnimatingRef.current = false;
            setIsAnimating(false);
            if (onTransitionComplete) {
                onTransitionComplete(1);
            }
        }, totalDurationMs);
    }, [totalDurationMs, onTransitionStart, onTransitionComplete]);
    // ── Scroll & Touch Listener Setup (Non-passive to allow preventDefault) ──
    useEffect(() => {
        const container = containerRef.current;
        if (!container)
            return;
        const handleWheel = (e) => {
            if (isAnimatingRef.current) {
                e.preventDefault();
                return;
            }
            if (activeSection === 1) {
                if (e.deltaY > 0) {
                    e.preventDefault();
                    triggerForward();
                }
            }
            else if (activeSection === 2) {
                const sec2 = section2Ref.current;
                if (sec2) {
                    const scrollTop = sec2.scrollTop;
                    // If we scroll up at the top of Section 2
                    if (scrollTop <= 0 && e.deltaY < 0) {
                        e.preventDefault();
                        triggerBackward();
                    }
                }
            }
        };
        const handleTouchStart = (e) => {
            touchStartY.current = e.touches[0].clientY;
        };
        const handleTouchMove = (e) => {
            if (isAnimatingRef.current) {
                e.preventDefault();
                return;
            }
            const touchY = e.touches[0].clientY;
            const deltaY = touchStartY.current - touchY; // positive = swipe up (scroll down)
            if (activeSection === 1) {
                if (deltaY > 15) {
                    e.preventDefault();
                    triggerForward();
                }
            }
            else if (activeSection === 2) {
                const sec2 = section2Ref.current;
                if (sec2) {
                    const scrollTop = sec2.scrollTop;
                    // Swipe down (deltaY < -15) at the top of Section 2
                    if (scrollTop <= 0 && deltaY < -15) {
                        e.preventDefault();
                        triggerBackward();
                    }
                }
            }
        };
        // Attach non-passive wheel events
        container.addEventListener('wheel', handleWheel, { passive: false });
        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        container.addEventListener('touchmove', handleTouchMove, { passive: false });
        return () => {
            container.removeEventListener('wheel', handleWheel);
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
        };
    }, [activeSection, triggerForward, triggerBackward]);
    // ── Keyboard Listener (ArrowDown/Up, PageDown/Up, Spacebar) ──
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isAnimatingRef.current) {
                e.preventDefault();
                return;
            }
            if (activeSection === 1) {
                if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
                    e.preventDefault();
                    triggerForward();
                }
            }
            else if (activeSection === 2) {
                const sec2 = section2Ref.current;
                if (sec2) {
                    const scrollTop = sec2.scrollTop;
                    if (scrollTop <= 0 && (e.key === 'ArrowUp' || e.key === 'PageUp')) {
                        e.preventDefault();
                        triggerBackward();
                    }
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [activeSection, triggerForward, triggerBackward]);
    // Last color matches background color of Section 2
    const lastColor = colors[colors.length - 1] || '#2563eb';
    return (<div ref={containerRef} className={`${styles.container} ${className}`} style={{
            '--bg-1': '#080710',
            '--bg-2': lastColor,
        }}>
      {/* ── SECTION 1 ── */}
      <div className={`${styles.section1} ${activeSection === 2 ? styles.section1Hidden : ''}`}>
        {section1Content ? (section1Content) : (<>
            <div className={styles.heroGlow}/>
            <motion.h1 className={styles.heroTitle} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}>
              SCROLL FOR TRANSITION
            </motion.h1>
            <motion.div className={styles.scrollIndicator} onClick={triggerForward} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
              <div className={styles.scrollIndicatorDot}/>
            </motion.div>
          </>)}
      </div>

      {/* ── CIRCLES OVERLAY ── */}
      <div className={styles.circleContainer}>
        {colors.map((color, index) => {
            const delay = index * staggerDelay;
            const shrinkDelay = (colors.length - 1 - index) * staggerDelay;
            return (<motion.div key={index} className={styles.circle} initial={{ scale: 0 }} animate={{ scale: isTransitioning ? 1 : 0 }} transition={{
                    duration: isAnimating ? animationDuration : 0,
                    ease: [0.65, 0, 0.35, 1], // easeInOutCubic
                    delay: isAnimating ? (isTransitioning ? delay : shrinkDelay) : 0,
                }} style={{
                    backgroundColor: color,
                    zIndex: 100 + index,
                    x: '-50%',
                    y: '-50%',
                }}/>);
        })}
      </div>

      {/* ── SECTION 2 ── */}
      <div ref={section2Ref} className={`${styles.section2} ${activeSection === 2 ? styles.section2Visible : ''}`}>
        {activeSection === 2 && (section2Content ? (section2Content) : (<div className={styles.sec2Content}>
              <motion.div className={styles.hugeTextContainer} variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        delayChildren: 0.05
                    }
                }
            }} initial="hidden" animate="visible">
                <div className={styles.hugeTextMask}>
                  <motion.h2 className={styles.hugeSingleLine} variants={{
                hidden: { y: '105%' },
                visible: { y: 0 }
            }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}>
                    DESIGN IN MOTION
                  </motion.h2>
                </div>
              </motion.div>

              <motion.div className={styles.sec2Footer} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8, duration: 1.0 }}>
                <button className={styles.backBtn} onClick={triggerBackward}>
                  <ArrowUp size={16}/>
                  Return to Top
                </button>
                <span className={styles.backInstructions}>
                  [Scroll up or swipe down at the top to reverse]
                </span>
              </motion.div>
            </div>))}
      </div>
    </div>);
};
export default ScrollCircleTransition;
