'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import styles from './TextScramble.module.css';

// ── Default character pool ──
const DEFAULT_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#&*!?';

export interface TextScrambleProps {
  /** Target text to decode into */
  text?: string;
  /** When to play the effect */
  trigger?: 'mount' | 'hover' | 'loop';
  /** Overall speed multiplier (1 = default) */
  speed?: number;
  /** How long each character scrambles before resolving (seconds) */
  scrambleDuration?: number;
  /** Delay between each character's resolve (seconds) */
  stagger?: number;
  /** Pause between loops in seconds (only for 'loop' trigger) */
  loopDelay?: number;
  /** Characters to cycle through during the scramble phase */
  charSet?: string;
  /** Interval between random character swaps during scramble (ms) */
  scrambleSpeed?: number;
  /** GSAP easing for the resolve snap */
  ease?: string;
  /** CSS font-size */
  fontSize?: string;
  /** CSS font-family */
  fontFamily?: string;
  /** Color of the resolved/final text */
  textColor?: string;
  /** Color of the characters during the scramble phase */
  scrambleColor?: string;
  /** Additional CSS class name */
  className?: string;
}

function randomChar(pool: string): string {
  return pool[Math.floor(Math.random() * pool.length)];
}

export const TextScramble: React.FC<TextScrambleProps> = ({
  text = 'DECODE EFFECT',
  trigger = 'mount',
  speed = 1,
  scrambleDuration = 1.4,
  stagger = 0.06,
  loopDelay = 2.5,
  charSet = DEFAULT_CHARS,
  scrambleSpeed = 55,
  ease = 'elastic.out(1, 0.5)',
  fontSize = 'clamp(2rem, 6vw, 5rem)',
  fontFamily,
  textColor = '#ffffff',
  scrambleColor = '#6366f1',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const activeRef = useRef(true);

  const chars = useMemo(() => text.split(''), [text]);

  // ── Cleanup helpers ──
  const cleanupAll = () => {
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current = [];
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    gsap.killTweensOf(charRefs.current.filter(Boolean));
  };

  // ── Schedule a timeout (tracked for cleanup) ──
  const safeTimeout = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timeoutsRef.current.push(id);
    return id;
  };

  useEffect(() => {
    activeRef.current = true;
    const elements = charRefs.current;
    const s = Math.max(speed, 0.1);
    const interval = Math.max(scrambleSpeed / s, 25);

    // ── Play the scramble → resolve animation ──
    const playScramble = (onDone?: () => void) => {
      if (!activeRef.current) return;
      cleanupAll();

      const dur = scrambleDuration / s;
      const stag = stagger / s;

      // Phase 1: Set all characters hidden + scrambled
      chars.forEach((char, i) => {
        const el = elements[i];
        if (!el) return;
        if (char === ' ') {
          el.textContent = '\u00A0';
          return;
        }
        el.textContent = randomChar(charSet);
        el.style.color = scrambleColor;
        el.classList.add(styles.scrambling);
        el.classList.remove(styles.resolved);
        gsap.set(el, { y: 10, opacity: 0, filter: 'blur(4px)', scale: 0.9 });
      });

      // Phase 2: Staggered fade-in with scramble cycling
      chars.forEach((char, i) => {
        const el = elements[i];
        if (!el || char === ' ') return;

        const appearDelay = i * stag * 0.6 * 1000;

        safeTimeout(() => {
          if (!activeRef.current || !el) return;

          // Start cycling random characters
          const cycleId = setInterval(() => {
            if (el.dataset.resolved !== 'true') {
              el.textContent = randomChar(charSet);
            }
          }, interval);
          intervalsRef.current[i] = cycleId;

          // Smooth slide-up + fade-in
          gsap.to(el, {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            scale: 1,
            duration: 0.6 / s,
            ease: 'power2.out',
          });
        }, appearDelay);
      });

      // Phase 3: Staggered resolve with rapid final flicker
      const resolveStartMs = (chars.length * stag * 0.6 + dur * 0.4) * 1000;

      chars.forEach((char, i) => {
        const el = elements[i];
        if (!el || char === ' ') return;

        const resolveDelay = resolveStartMs + i * stag * 1000;

        safeTimeout(() => {
          if (!activeRef.current || !el) return;

          // Stop the main cycle
          if (intervalsRef.current[i]) {
            clearInterval(intervalsRef.current[i]);
          }

          // Rapid 4-frame flicker before landing
          let flickCount = 0;
          const flickTotal = 3 + Math.floor(Math.random() * 2);
          const flickerId = setInterval(() => {
            flickCount++;
            if (flickCount >= flickTotal) {
              clearInterval(flickerId);
              // Lock in the correct character
              el.textContent = char;
              el.style.color = textColor;
              el.dataset.resolved = 'true';
              el.classList.remove(styles.scrambling);
              el.classList.add(styles.resolved);

              // Elastic pop
              gsap.fromTo(el,
                { scale: 1.12, y: -2 },
                { scale: 1, y: 0, duration: 0.55 / s, ease }
              );
            } else {
              el.textContent = randomChar(charSet);
            }
          }, 40 / s);
          timeoutsRef.current.push(flickerId as unknown as ReturnType<typeof setTimeout>);
        }, resolveDelay);
      });

      // Total animation duration — call onDone when fully resolved
      const totalMs = resolveStartMs + chars.length * stag * 1000 + 600 / s;
      safeTimeout(() => {
        if (activeRef.current && onDone) onDone();
      }, totalMs);
    };

    // ── Graceful fade-out (for loop reset) ──
    const fadeOutAll = (onDone?: () => void) => {
      if (!activeRef.current) return;
      cleanupAll();

      chars.forEach((char, i) => {
        const el = elements[i];
        if (!el || char === ' ') return;
        el.dataset.resolved = 'false';

        gsap.to(el, {
          y: -6,
          opacity: 0,
          filter: 'blur(3px)',
          scale: 0.92,
          duration: 0.4 / s,
          delay: i * 0.02,
          ease: 'power2.in',
        });
      });

      const fadeMs = (chars.length * 0.02 + 0.4 / s) * 1000 + 100;
      safeTimeout(() => {
        if (activeRef.current && onDone) onDone();
      }, fadeMs);
    };

    // ── Set resolved immediately ──
    const setResolved = () => {
      chars.forEach((char, i) => {
        const el = elements[i];
        if (!el) return;
        el.textContent = char === ' ' ? '\u00A0' : char;
        el.style.color = textColor;
        el.dataset.resolved = 'true';
        el.classList.remove(styles.scrambling);
        el.classList.add(styles.resolved);
        gsap.set(el, { y: 0, opacity: 1, filter: 'blur(0px)', scale: 1 });
      });
    };

    // ── Trigger logic ──
    if (trigger === 'mount') {
      safeTimeout(() => playScramble(), 200);
    }

    if (trigger === 'loop') {
      const runLoop = () => {
        if (!activeRef.current) return;
        playScramble(() => {
          if (!activeRef.current) return;
          // Hold the resolved text, then fade out and restart
          safeTimeout(() => {
            if (!activeRef.current) return;
            fadeOutAll(() => {
              if (!activeRef.current) return;
              safeTimeout(() => {
                if (activeRef.current) runLoop();
              }, 350);
            });
          }, loopDelay * 1000);
        });
      };

      safeTimeout(() => runLoop(), 300);
    }

    if (trigger === 'hover') {
      setResolved();

      const container = containerRef.current;
      if (!container) return;

      const handleEnter = () => {
        playScramble();
      };

      container.addEventListener('mouseenter', handleEnter);
      return () => {
        activeRef.current = false;
        cleanupAll();
        container.removeEventListener('mouseenter', handleEnter);
      };
    }

    return () => {
      activeRef.current = false;
      cleanupAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, trigger, speed, scrambleDuration, stagger, loopDelay, charSet, scrambleSpeed, ease, fontSize, fontFamily, textColor, scrambleColor]);

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className}`}
      style={{
        fontSize,
        fontFamily,
        '--text-color': textColor,
        '--scramble-color': scrambleColor,
      } as React.CSSProperties}
    >
      <span className={styles.text} aria-label={text}>
        {chars.map((char, i) => (
          <span
            key={`${i}-${char}`}
            ref={(el) => { charRefs.current[i] = el; }}
            className={`${styles.char} ${char === ' ' ? styles.space : ''}`}
            aria-hidden="true"
          >
            {char}
          </span>
        ))}
      </span>
    </div>
  );
};

export default TextScramble;
