'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import styles from './FanningCards.module.css';

export interface FanningCardItem {
  /** Unique identifier for the card */
  id: string | number;
  /** Title of the card display */
  title: string;
  /** Subtitle category or tag */
  subtitle: string;
  /** Image source URL */
  image: string;
  /** Primary accent theme color used for visual glow, defaults to purple */
  color?: string;
}

export interface FanningCardsProps {
  /** The list of cards to display in the fanned arc */
  cards?: FanningCardItem[];
  /** The pill badge text displayed at the top */
  badgeText?: string;
  /** The main copy/headline displayed below the cards */
  headline?: string;
  /** The text displayed inside the call-to-action button */
  buttonText?: string;
  /** The href destination link for the call-to-action button */
  buttonLink?: string;
  /** The duration in seconds of the central card entrance slide-up */
  animationDuration?: number;
  /** The scale offset applied to adjacent cards to create depth (0 to 0.2) */
  scaleOffset?: number;
  /** Toggle the ambient radial gradient background glow */
  showGlow?: boolean;
  /** Enable the interactive card hover straightening and focus effects */
  enableHoverEffect?: boolean;
  /** Callback function triggered when a card is clicked */
  onCardClick?: (card: FanningCardItem, index: number) => void;
  /** Additional custom class names for the root container */
  className?: string;
}

// 5 gorgeous curated eyewear cards with high-fidelity Unsplash images
const defaultCards: FanningCardItem[] = [
  {
    id: 'acid-neon',
    title: 'Neon Acid',
    subtitle: 'Cyber Shield',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop',
    color: '#00f2fe'
  },
  {
    id: 'cyber-jade',
    title: 'Cyber Jade',
    subtitle: 'Tactical Visor',
    image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=600&auto=format&fit=crop',
    color: '#10b981'
  },
  {
    id: 'hot-magenta',
    title: 'Hot Magenta',
    subtitle: 'Editorial Oval',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=600&auto=format&fit=crop',
    color: '#ec4899'
  },
  {
    id: 'liquid-gold',
    title: 'Liquid Gold',
    subtitle: 'Aviator Retro',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop',
    color: '#eab308'
  },
  {
    id: 'dark-vortex',
    title: 'Dark Vortex',
    subtitle: 'Cat Eye Luxe',
    image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=600&auto=format&fit=crop',
    color: '#a855f7'
  }
];

const FanningCards: React.FC<FanningCardsProps> = ({
  cards = defaultCards,
  badgeText = '✦ Premium Eyewear',
  headline = 'Eyewear That Stands Out',
  buttonText = 'Enter Store',
  buttonLink = '#',
  animationDuration = 1.1,
  scaleOffset = 0.08,
  showGlow = true,
  enableHoverEffect = true,
  onCardClick,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Computed layout constants
  const totalCards = cards.length;
  const middleIndex = Math.floor(totalCards / 2);

  // Responsive dimension calculators
  const getLayoutOffsets = () => {
    if (typeof window === 'undefined') {
      return { xOffset: 95, yArc: 12, angleOffset: 9 };
    }
    const width = window.innerWidth;
    if (width < 600) {
      return { xOffset: 52, yArc: 6, angleOffset: 7 };
    } else if (width < 900) {
      return { xOffset: 72, yArc: 9, angleOffset: 8 };
    }
    return { xOffset: 95, yArc: 12, angleOffset: 9 };
  };

  useEffect(() => {
    // Determine offset parameters
    const { xOffset, yArc, angleOffset } = getLayoutOffsets();

    const ctx = gsap.context(() => {
      const cardsElements = gsap.utils.toArray<HTMLElement>(`.${styles.card}`);
      if (!cardsElements.length) return;

      // 1. Initial Stack State (placed low and stacked behind middle)
      gsap.set(cardsElements, {
        x: 0,
        y: 350,
        rotate: 0,
        scale: 0.9,
        opacity: 0,
        zIndex: 5,
        filter: 'blur(0px)'
      });

      // 2. Timeline Sequence
      const tl = gsap.timeline();
      timelineRef.current = tl;

      // First, slide all cards up together to the center (stacked behind the middle one)
      // The middle card scales to 1.0, other cards scale to 0.94 to hide under it cleanly
      tl.to(cardsElements, {
        y: 0,
        opacity: 1,
        scale: (index) => (index === middleIndex ? 1.0 : 0.94),
        zIndex: (index) => (index === middleIndex ? 10 : 5),
        duration: animationDuration,
        ease: 'power4.out',
        stagger: 0.05
      });

      // Add a marker label once the stack has completed its slide-up
      tl.addLabel('fanning');

      // Fan out cards outwards from center (x: 0, rotate: 0) to their target fanned arc
      cardsElements.forEach((card, index) => {
        if (index === middleIndex) return;

        const dist = index - middleIndex;
        const targetX = dist * xOffset;
        const targetY = Math.abs(dist) * yArc;
        const targetRotate = dist * angleOffset;
        const targetScale = 1 - Math.abs(dist) * scaleOffset;
        const targetZIndex = 10 - Math.abs(dist) * 2;

        // Symmetrically stagger from center out:
        // Adjacent cards (dist = -1 or 1) start immediately (delay = 0)
        // Outer cards (dist = -2 or 2) start shortly after (delay = 0.15s)
        const delay = Math.abs(dist) * 0.15 - 0.15;

        tl.to(card, {
          x: targetX,
          y: targetY,
          rotate: targetRotate,
          scale: targetScale,
          zIndex: targetZIndex,
          duration: 0.95,
          ease: 'power3.out'
        }, `fanning+=${delay}`);
      });
    }, containerRef);

    // Dynamic resize listener to recalculate GSAP targets on window resizing
    const handleResize = () => {
      const { xOffset, yArc, angleOffset } = getLayoutOffsets();
      const cardsElements = containerRef.current?.querySelectorAll(`.${styles.card}`);
      if (!cardsElements) return;

      cardsElements.forEach((el, index) => {
        const dist = index - middleIndex;
        const targetX = dist * xOffset;
        const targetY = Math.abs(dist) * yArc;
        const targetRotate = dist * angleOffset;
        const targetScale = 1 - Math.abs(dist) * scaleOffset;
        const targetZIndex = 10 - Math.abs(dist) * 2;

        gsap.to(el, {
          x: targetX,
          y: targetY,
          rotate: targetRotate,
          scale: targetScale,
          zIndex: targetZIndex,
          duration: 0.3,
          ease: 'power1.out'
        });
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      ctx.revert();
      window.removeEventListener('resize', handleResize);
    };
  }, [cards, animationDuration, scaleOffset, middleIndex]);

  // Card Hover Interactions (Subtle single card Y-slide only)
  const handleCardMouseEnter = (index: number) => {
    if (!enableHoverEffect) return;
    const cardsElements = containerRef.current?.querySelectorAll(`.${styles.card}`);
    if (!cardsElements) return;

    const el = cardsElements[index];
    if (!el) return;

    const { yArc } = getLayoutOffsets();
    const dist = index - middleIndex;
    const targetY = Math.abs(dist) * yArc;

    gsap.to(el, {
      y: targetY - 32,
      duration: 0.3,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  };

  const handleCardMouseLeave = (index: number) => {
    if (!enableHoverEffect) return;
    const cardsElements = containerRef.current?.querySelectorAll(`.${styles.card}`);
    if (!cardsElements) return;

    const el = cardsElements[index];
    if (!el) return;

    const { yArc } = getLayoutOffsets();
    const dist = index - middleIndex;
    const targetY = Math.abs(dist) * yArc;

    gsap.to(el, {
      y: targetY,
      duration: 0.3,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  };

  return (
    <div ref={containerRef} className={`${styles.container} ${className}`}>
      {/* Background Radial Glow */}
      {showGlow && <div className={styles.ambientGlow} />}

      {/* Dynamic Curved Card Gallery */}
      <section className={styles.cardArea}>
        <div className={styles.cardsContainer}>
          {cards.map((card, index) => {
            const cardStyle = {
              '--theme-color': card.color || '#a855f7',
              '--glow-color': `${card.color || '#a855f7'}3c`
            } as React.CSSProperties;

            return (
              <div
                key={card.id}
                className={styles.card}
                style={cardStyle}
                onMouseEnter={() => handleCardMouseEnter(index)}
                onMouseLeave={() => handleCardMouseLeave(index)}
                onClick={() => onCardClick && onCardClick(card, index)}
              >
                <div className={styles.grain} />
                <div className={styles.cardGlow} />
                <div className={styles.imageWrapper}>
                  <img
                    src={card.image}
                    alt={card.title}
                    className={styles.cardImage}
                    loading="lazy"
                  />
                </div>
                <div className={styles.cardContent}>
                  <span className={styles.cardSubtitle}>{card.subtitle}</span>
                  <h3 className={styles.cardTitle}>{card.title}</h3>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default FanningCards;
