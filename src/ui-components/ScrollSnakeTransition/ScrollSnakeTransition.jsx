'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import styles from './ScrollSnakeTransition.module.css';
const ScrollSnakeTransition = ({ section1Content, section2Content, snakeColor = '#2563eb', strokeWidth = 75, animationDuration = 2.2, className = '', onTransitionStart, onTransitionComplete, }) => {
    const [activeSection, setActiveSection] = useState(1);
    const [isAnimating, setIsAnimating] = useState(false);
    const containerRef = useRef(null);
    const section2Ref = useRef(null);
    const isAnimatingRef = useRef(false);
    const touchStartY = useRef(0);
    const transitionDurationMs = animationDuration * 1000;
    // ── Forward Transition (Section 1 ➔ Section 2) ──
    const triggerForward = useCallback(() => {
        if (isAnimatingRef.current)
            return;
        isAnimatingRef.current = true;
        setIsAnimating(true);
        if (onTransitionStart) {
            onTransitionStart(2);
        }
        // Set Section 2 active (fades in Section 2 container)
        setActiveSection(2);
        setTimeout(() => {
            isAnimatingRef.current = false;
            setIsAnimating(false);
            if (onTransitionComplete) {
                onTransitionComplete(2);
            }
        }, transitionDurationMs);
    }, [transitionDurationMs, onTransitionStart, onTransitionComplete]);
    // ── Backward Transition (Section 2 ➔ Section 1) ──
    const triggerBackward = useCallback(() => {
        if (isAnimatingRef.current)
            return;
        isAnimatingRef.current = true;
        setIsAnimating(true);
        setActiveSection(1);
        if (onTransitionStart) {
            onTransitionStart(1);
        }
        setTimeout(() => {
            isAnimatingRef.current = false;
            setIsAnimating(false);
            if (onTransitionComplete) {
                onTransitionComplete(1);
            }
        }, 1200); // Section 2 fade-out takes 1.2s
    }, [onTransitionStart, onTransitionComplete]);
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
                    // Scroll up at top of Section 2
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
            const deltaY = touchStartY.current - touchY;
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
                    if (scrollTop <= 0 && deltaY < -15) {
                        e.preventDefault();
                        triggerBackward();
                    }
                }
            }
        };
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
    const lastColor = '#e2e5e9';
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

      {/* ── SECTION 2 ── */}
      <div ref={section2Ref} className={`${styles.section2} ${activeSection === 2 ? styles.section2Visible : ''}`}>
        {activeSection === 2 && (section2Content ? (section2Content) : (<div className={styles.sec2Content}>
              {/* Text layer in the background */}
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

              {/* Slithering Snake overlay in the foreground (solid rendering) */}
              <svg className={styles.snakeSvg} viewBox="0 0 1000 1000" preserveAspectRatio="none">
                <motion.path d="M 850, -50 C 650, 150 250, 200 350, 480 C 450, 750 800, 650 650, 900 C 550, 1020 200, 950 150, 1050" fill="none" stroke={snakeColor} strokeWidth={strokeWidth} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: animationDuration, ease: [0.22, 1, 0.36, 1] }}/>
              </svg>

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
export default ScrollSnakeTransition;
