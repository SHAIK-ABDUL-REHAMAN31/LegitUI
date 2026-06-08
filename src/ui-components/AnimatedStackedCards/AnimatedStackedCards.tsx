"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./AnimatedStackedCards.module.css";

export interface StackedCard {
  id: string | number;
  frontBg: string;
  backBg: string;
}

export interface AnimatedStackedCardsProps {
  cards?: StackedCard[];
  className?: string;
}

const starPath = "M 0.5 0 Q 0.5 0.5 1 0.5 Q 1 0.5 1 0.5 Q 0.5 0.5 0.5 1 Q 0.5 0.5 0 0.5 Q 0 0.5 0 0.5 Q 0.5 0.5 0.5 0 Z";
const cardPath = "M 0.5 0 Q 0.5 0.15 1 0.15 Q 1 0.5 1 0.85 Q 0.5 0.85 0.5 1 Q 0.5 0.85 0 0.85 Q 0 0.5 0 0.15 Q 0.5 0.15 0.5 0 Z";

const defaultCards: StackedCard[] = [
  {
    id: 1,
    frontBg: "linear-gradient(135deg, #4a3728 0%, #b8860b 100%)", // bronze/gold
    backBg: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop')" // Abstract premium curves
  },
  {
    id: 2,
    frontBg: "linear-gradient(135deg, #111111 0%, #222222 100%)", // black metallic
    backBg: "url('https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=600&auto=format&fit=crop')" // Fluid abstract artwork
  },
  {
    id: 3,
    frontBg: "linear-gradient(135deg, #0f2b48 0%, #0072ff 100%)", // blue cyan
    backBg: "url('https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=600&auto=format&fit=crop')" // Gradient geometry
  }
];

export const AnimatedStackedCards: React.FC<AnimatedStackedCardsProps> = ({
  cards = defaultCards,
  className = ""
}) => {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Morph refs for clip path, front face border path, and back face border path
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const frontPathRefs = useRef<(SVGPathElement | null)[]>([]);
  const backPathRefs = useRef<(SVGPathElement | null)[]>([]);
  
  const isAnimComplete = useRef(false);

  const runEntranceAnimation = () => {
    isAnimComplete.current = false;

    // Reset paths to star
    pathRefs.current.forEach((path) => {
      if (path) gsap.set(path, { attr: { d: starPath } });
    });
    frontPathRefs.current.forEach((path) => {
      if (path) gsap.set(path, { attr: { d: starPath } });
    });
    backPathRefs.current.forEach((path) => {
      if (path) gsap.set(path, { attr: { d: starPath } });
    });

    gsap.set(cardRefs.current, {
      x: 0,
      y: 120,
      opacity: 0,
      scale: 0.8,
      width: 130, // Slimmer initial star width
      height: 130,
      xPercent: -50,
      yPercent: -50,
      left: "50%",
      top: "50%",
      transformPerspective: 1500
    });

    gsap.set(innerRefs.current, {
      rotateY: 0,
      rotateX: 0,
      scale: 1
    });

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimComplete.current = true;
      }
    });

    // 1. Slide Up and Fade In (stacked - no stagger so it looks like ONE single card moving)
    tl.to(cardRefs.current, {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 1.0,
      ease: "power3.out"
    });

    // 2. Horizontal Spread out
    tl.to(cardRefs.current[0], {
      x: -280,
      duration: 0.9,
      ease: "power2.inOut"
    }, "+=0.2");

    tl.to(cardRefs.current[2], {
      x: 280,
      duration: 0.9,
      ease: "power2.inOut"
    }, "<");

    // 3. Morph Shape & Expand Dimensions (slim cards)
    tl.to([pathRefs.current, frontPathRefs.current, backPathRefs.current], {
      attr: { d: cardPath },
      duration: 1.0,
      ease: "power3.inOut"
    }, "+=0.1");

    tl.to(cardRefs.current, {
      width: 200, // Slimmer card width
      height: 450, // Slimmer card height
      duration: 1.0,
      ease: "power3.inOut"
    }, "<");

    // 4. 3D Y-flip to reveal the back side
    tl.to(innerRefs.current, {
      rotateY: 180,
      duration: 1.2,
      ease: "back.out(1.2)",
      stagger: 0.15
    }, "-=0.3");
  };

  useEffect(() => {
    runEntranceAnimation();
    return () => {
      gsap.killTweensOf(cardRefs.current);
      gsap.killTweensOf(innerRefs.current);
      gsap.killTweensOf(pathRefs.current);
      gsap.killTweensOf(frontPathRefs.current);
      gsap.killTweensOf(backPathRefs.current);
    };
  }, [cards.length]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    if (!isAnimComplete.current) return;
    const card = cardRefs.current[index];
    const inner = innerRefs.current[index];
    if (!card || !inner) return;

    // Get mouse position relative to card
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Normalize between -1 and 1
    const xNorm = (x / rect.width) * 2 - 1;
    const yNorm = (y / rect.height) * 2 - 1;

    // Determine current flip state
    const currentRotY = gsap.getProperty(inner, "rotateY") as number;
    const isBackShowing = Math.abs(currentRotY - 180) < 45;

    // Calculate rotation offsets (adjust X rotation based on flip state)
    const rotateYOffset = xNorm * 15;
    const rotateXOffset = isBackShowing ? yNorm * 15 : -yNorm * 15;

    gsap.to(inner, {
      rotateY: isBackShowing ? 180 + rotateYOffset : rotateYOffset,
      rotateX: rotateXOffset,
      scale: 1.04,
      duration: 0.3,
      ease: "power1.out",
      overwrite: "auto"
    });
  };

  const handleMouseLeave = (index: number) => {
    if (!isAnimComplete.current) return;
    const inner = innerRefs.current[index];
    if (!inner) return;

    const currentRotY = gsap.getProperty(inner, "rotateY") as number;
    const isBackShowing = Math.abs(currentRotY - 180) < 90;

    gsap.to(inner, {
      rotateY: isBackShowing ? 180 : 0,
      rotateX: 0,
      scale: 1,
      duration: 0.6,
      ease: "power2.out",
      overwrite: "auto"
    });
  };

  const handleCardClick = (index: number) => {
    if (!isAnimComplete.current) return;
    const inner = innerRefs.current[index];
    if (!inner) return;

    const currentRotY = gsap.getProperty(inner, "rotateY") as number;
    const isBackShowing = Math.abs(currentRotY - 180) < 45;
    const targetRotY = isBackShowing ? 0 : 180;

    gsap.to(inner, {
      rotateY: targetRotY,
      rotateX: 0,
      duration: 0.8,
      ease: "back.out(1.2)",
      overwrite: "auto"
    });
  };

  return (
    <div className={`${styles.container} ${className}`}>
      {cards.map((card, idx) => {
        return (
          <div
            key={card.id}
            ref={(el) => { cardRefs.current[idx] = el; }}
            className={styles.cardWrapper}
            onMouseMove={(e) => handleMouseMove(e, idx)}
            onMouseLeave={() => handleMouseLeave(idx)}
            onClick={() => handleCardClick(idx)}
          >
            <div
              ref={(el) => { innerRefs.current[idx] = el; }}
              className={styles.cardInner}
            >
              {/* Front Face */}
              <div
                className={`${styles.cardFace} ${styles.cardFront}`}
                style={{
                  clipPath: `url(#star-card-clip-${idx})`,
                  background: card.frontBg
                }}
              >
                <svg className={styles.borderSvg} viewBox="0 0 1 1" preserveAspectRatio="none">
                  <path
                    ref={(el) => { frontPathRefs.current[idx] = el; }}
                    className={styles.borderPath}
                    d={starPath}
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>

              {/* Back Face */}
              <div
                className={`${styles.cardFace} ${styles.cardBack}`}
                style={{
                  clipPath: `url(#star-card-clip-${idx})`,
                  backgroundColor: "#000000"
                }}
              >
                <svg className={styles.borderSvg} viewBox="0 0 1 1" preserveAspectRatio="none">
                  <path
                    ref={(el) => { backPathRefs.current[idx] = el; }}
                    className={styles.borderPath}
                    d={starPath}
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>

                <div
                  className={styles.backImageOverlay}
                  style={{ backgroundImage: card.backBg }}
                />
              </div>
            </div>
          </div>
        );
      })}

      {/* SVG ClipPath Definitions */}
      <svg width="0" height="0" style={{ position: "absolute", pointerEvents: "none" }}>
        <defs>
          {cards.map((card, idx) => (
            <clipPath
              key={card.id}
              id={`star-card-clip-${idx}`}
              clipPathUnits="objectBoundingBox"
            >
              <path
                ref={(el) => { pathRefs.current[idx] = el; }}
                d={starPath}
              />
            </clipPath>
          ))}
        </defs>
      </svg>
    </div>
  );
};

export default AnimatedStackedCards;
