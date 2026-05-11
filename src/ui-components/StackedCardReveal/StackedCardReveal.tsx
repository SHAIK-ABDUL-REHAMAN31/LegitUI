'use client';
import React, { useRef, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import styles from './StackedCardReveal.module.css';

// Convert hex to RGB values
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

export interface CardData {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  color: string;
}

export interface StackedCardRevealProps {
  cards?: CardData[];
  containerHeight?: string;
}

const defaultCards: CardData[] = [
  {
    id: 1,
    title: "The Genesis",
    subtitle: "Phase 01",
    description: "Every masterpiece begins with a blank canvas. We strip away the noise to focus on raw, fundamental geometry and structural elegance.",
    color: "#ff3b30",
  },
  {
    id: 2,
    title: "Structural Flow",
    subtitle: "Phase 02",
    description: "Motion is breathed into the static forms. Fluid dynamics and spring physics create a natural, organic rhythm that feels alive.",
    color: "#007aff",
  },
  {
    id: 3,
    title: "Radiant Aura",
    subtitle: "Phase 03",
    description: "Light and shadow sculpt the final experience. We introduce dynamic environmental lighting, glassmorphism, and cinematic depth.",
    color: "#34c759",
  },
  {
    id: 4,
    title: "Culmination",
    subtitle: "Phase 04",
    description: "The synthesis of form, motion, and light. A seamless, high-performance interactive experience pushing the boundaries of web design.",
    color: "#af52de",
  }
];

const Card = ({ card, index, progress, totalCards }: { card: CardData, index: number, progress: any, totalCards: number }) => {
  // Determine the scroll range where THIS card starts sticking
  // and finishes scaling when the LAST card sticks.
  const isLast = index === totalCards - 1;
  const start = isLast ? 0.99 : index / (totalCards - 1);
  const range = [start, 1];

  // Scale down the cards behind the current one
  const targetScale = 1 - ((totalCards - index - 1) * 0.05);
  const scale = useTransform(progress, range, [1, targetScale]);
  
  // Push them up slightly to create depth
  const y = useTransform(progress, range, [0, -20]);
  
  // Subtle 3D rotation backwards
  const rotateX = useTransform(progress, range, [0, 5]);
  
  // Dark overlay opacity: 0 = fully visible, 0.6 = dimmed
  // This replaces the old card-level opacity which made the background transparent
  const dimOverlayOpacity = useTransform(progress, range, [0, 0.6]);

  // Build a rich gradient from the card's accent color
  const cardGradient = useMemo(() => {
    const [r, g, b] = hexToRgb(card.color);
    return `linear-gradient(135deg, 
      #0a0a0a 0%, 
      rgba(${Math.round(r * 0.15)}, ${Math.round(g * 0.15)}, ${Math.round(b * 0.15)}, 1) 40%, 
      rgba(${Math.round(r * 0.25)}, ${Math.round(g * 0.25)}, ${Math.round(b * 0.25)}, 1) 100%)`;
  }, [card.color]);

  return (
    <div className={styles.cardContainer} style={{ top: `calc(10vh + ${index * 30}px)` }}>
      <motion.div 
        className={styles.card}
        style={{ 
          scale, 
          y,
          rotateX,
          transformOrigin: 'top center',
          background: cardGradient,
        }}
      >
        <div className={styles.grain} />
        
        <div className={styles.glow} style={{ background: card.color }} />
        
        <div className={styles.cardContent}>
          <div className={styles.cardHeader}>
            <span className={styles.subtitle} style={{ color: card.color }}>{card.subtitle}</span>
            <h2 className={styles.title}>{card.title}</h2>
          </div>
          <div className={styles.cardBody}>
            <p className={styles.description}>{card.description}</p>
          </div>
        </div>

        {/* Dark overlay for dimming — keeps card background 100% opaque */}
        <motion.div className={styles.dimOverlay} style={{ opacity: dimOverlayOpacity }} />
      </motion.div>
    </div>
  );
};

export const StackedCardReveal: React.FC<StackedCardRevealProps> = ({ 
  cards = defaultCards,
  containerHeight = "100vh"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <div className={styles.wrapper} ref={containerRef}>
      {cards.map((card, i) => (
        <Card 
          key={card.id} 
          card={card} 
          index={i} 
          progress={scrollYProgress} 
          totalCards={cards.length} 
        />
      ))}
    </div>
  );
};

export default StackedCardReveal;
