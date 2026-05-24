'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import styles from './ScrollSnakeTransition.module.css';
const ScrollSnakeTransition = ({ section1Content, section2Content, snakeColor = '#2563eb', strokeWidth = 75, animationDuration = 2.2, className = '', onTransitionStart, onTransitionComplete, }) => {
    const [activeSection, setActiveSection] = useState(1);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const containerRef = useRef(null);
    const section2Ref = useRef(null);
    const isAnimatingRef = useRef(false);
    const touchStartY = useRef(0);
    const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
    const [pathLength, setPathLength] = useState(0);
    const pathRef = useRef(null);
    const transitionDurationMs = animationDuration * 1000;
    // Track window dimensions
    useEffect(() => {
        if (typeof window === 'undefined')
            return;
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    // Measure path length
    useEffect(() => {
        if (pathRef.current) {
            setPathLength(pathRef.current.getTotalLength());
        }
    }, [dimensions]);
    const { width, height } = dimensions;
    // Dynamic coordinates for a perfect S-curve with 4 turns
    const yStart = -100;
    const yEnd = height + 100;
    const y1 = height * 0.20;
    const y2 = height * 0.40;
    const y3 = height * 0.60;
    const y4 = height * 0.80;
    // Responsive turning limits
    const padding = Math.max(80, width * 0.15);
    const xLeft1 = padding;
    const xRight1 = width - padding;
    const xLeft2 = padding * 1.25;
    const xRight2 = width - padding * 1.25;
    const xStart = width * 0.85;
    const xEnd = width * 0.45;
    // Create a perfectly smooth cubic Bezier path with vertical tangents at curves
    const pathD = `M ${xStart} ${yStart} ` +
        `C ${xStart - (xStart - xLeft1) * 0.4} ${yStart + (y1 - yStart) * 0.2}, ${xLeft1} ${y1 - (y1 - yStart) * 0.3}, ${xLeft1} ${y1} ` +
        `C ${xLeft1} ${y1 + (y2 - y1) * 0.4}, ${xRight1} ${y2 - (y2 - y1) * 0.4}, ${xRight1} ${y2} ` +
        `C ${xRight1} ${y2 + (y3 - y2) * 0.4}, ${xLeft2} ${y3 - (y3 - y2) * 0.4}, ${xLeft2} ${y3} ` +
        `C ${xLeft2} ${y3 + (y4 - y3) * 0.4}, ${xRight2} ${y4 - (y4 - y3) * 0.4}, ${xRight2} ${y4} ` +
        `C ${xRight2} ${y4 + (yEnd - y4) * 0.4}, ${xEnd} ${yEnd - (yEnd - y4) * 0.4}, ${xEnd} ${yEnd}`;
    const snakeLength = pathLength ? pathLength * 0.32 : 600;
    const strokeDashoffset = isTransitioning ? -pathLength : snakeLength;
    const currentStrokeWidth = width > 768 ? strokeWidth : Math.min(strokeWidth, 40);
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
        setIsTransitioning(false);
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
        }, transitionDurationMs);
    }, [transitionDurationMs, onTransitionStart, onTransitionComplete]);
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

      {/* ── SOLID SNAKE OVERLAY ── */}
      <svg className={styles.snakeSvg} viewBox={`0 0 ${width} ${height}`} style={{
            opacity: pathLength === 0 ? 0 : 1,
            transition: 'opacity 0.25s ease',
            pointerEvents: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 25,
        }}>
        <motion.path ref={pathRef} d={pathD} fill="none" stroke={snakeColor} strokeWidth={currentStrokeWidth} strokeLinecap="round" strokeLinejoin="round" initial={{
            strokeDasharray: `${snakeLength} ${pathLength + 100}`,
            strokeDashoffset: snakeLength,
        }} animate={{
            strokeDasharray: `${snakeLength} ${pathLength + 100}`,
            strokeDashoffset: strokeDashoffset,
        }} transition={{
            duration: isAnimating ? animationDuration : 0,
            ease: [0.22, 1, 0.36, 1],
        }}/>
      </svg>

      {/* ── SECTION 2 ── */}
      <div ref={section2Ref} className={`${styles.section2} ${activeSection === 2 ? styles.section2Visible : ''}`}>
        {activeSection === 2 && (section2Content ? (section2Content) : (<div className={styles.sec2Content}>
              {/* 3 Blue Cards (sitting above the snake SVG on z-index: 30) */}
              <div className={styles.cardsContainer}>
                {[
                { title: "Seamless Flow", desc: "Experience transitions designed with dynamic organic paths." },
                { title: "Solid Precision", desc: "Flawless rendering powered by modern vector mathematics." },
                { title: "Geist Aesthetics", desc: "Vibrant hues and sleek dark modes tailored for developers." }
            ].map((card, i) => (<motion.div key={i} className={styles.blueCard} custom={i} initial="hidden" animate="visible" variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: (i) => ({
                        opacity: 1,
                        y: 0,
                        transition: {
                            delay: 0.3 + i * 0.15,
                            duration: 0.8,
                            ease: [0.16, 1, 0.3, 1]
                        }
                    })
                }}>
                    <h3 className={styles.cardTitle}>{card.title}</h3>
                    <p className={styles.cardDesc}>{card.desc}</p>
                  </motion.div>))}
              </div>

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
