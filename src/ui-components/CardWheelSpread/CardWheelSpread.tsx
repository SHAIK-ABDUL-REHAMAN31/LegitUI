'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './CardWheelSpread.module.css';

export interface CardWheelItem {
  id: string | number;
  title: string;
  subtitle: string;
  image: string;
  color?: string;
}

interface CardWheelSpreadProps {
  /** The list of cards to display in the circular wheel */
  cards?: CardWheelItem[];
  /** Radius of the circular wheel in pixels */
  radius?: number;
  /** Speed of continuous spin in seconds per full revolution */
  spinSpeed?: number;
  /** Centered large header text */
  centerTitle?: string;
  /** Centered small sub-header text */
  centerSubtitle?: string;
  /** Enable hover pause — pauses spin on hover */
  enableHover?: boolean;
  /** Callback triggered when a card is clicked */
  onCardClick?: (card: CardWheelItem, index: number) => void;
  /** Additional CSS class names */
  className?: string;
}

const defaultCardsList: CardWheelItem[] = [
  {
    id: 1,
    title: 'Mike',
    subtitle: 'WANT',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop',
    color: '#ef4444',
  },
  {
    id: 2,
    title: 'Block',
    subtitle: 'RAPTOR',
    image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=600&auto=format&fit=crop',
    color: '#18181b',
  },
  {
    id: 3,
    title: 'Wise',
    subtitle: '7WISE',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=600&auto=format&fit=crop',
    color: '#84cc16',
  },
  {
    id: 4,
    title: 'Mike 2',
    subtitle: 'WANT',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop',
    color: '#dc2626',
  },
  {
    id: 5,
    title: 'Creative',
    subtitle: 'ERA',
    image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=600&auto=format&fit=crop',
    color: '#e2e8f0',
  },
  {
    id: 6,
    title: 'AI Tech',
    subtitle: 'AI',
    image: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?q=80&w=600&auto=format&fit=crop',
    color: '#10b981',
  },
  {
    id: 7,
    title: 'Merc',
    subtitle: 'MERC',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop',
    color: '#2563eb',
  },
];

const CardWheelSpread: React.FC<CardWheelSpreadProps> = ({
  cards = defaultCardsList,
  radius = 130,
  spinSpeed = 12,
  centerTitle = 'CARDS 07',
  centerSubtitle = 'Interactive Wheel',
  enableHover = true,
  onCardClick,
  className = '',
}) => {
  const discRef = useRef<HTMLDivElement>(null);
  const spinTween = useRef<gsap.core.Tween | null>(null);

  const count = cards.length;
  const angleStep = 360 / count;

  /* ── Set up continuous spin ── */
  useEffect(() => {
    const disc = discRef.current;
    if (!disc) return;

    // Infinite spin
    spinTween.current = gsap.to(disc, {
      rotation: '+=360',
      duration: spinSpeed,
      ease: 'none',
      repeat: -1,
    });

    return () => {
      spinTween.current?.kill();
    };
  }, [spinSpeed]);

  /* ── Hover: slow down / speed up ── */
  const handleMouseEnter = () => {
    if (!enableHover || !spinTween.current) return;
    gsap.to(spinTween.current, {
      timeScale: 0.2,
      duration: 0.8,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    if (!enableHover || !spinTween.current) return;
    gsap.to(spinTween.current, {
      timeScale: 1,
      duration: 0.8,
      ease: 'power2.in',
    });
  };

  return (
    <div
      className={`${styles.container} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.wheelArea}>
        {/* Center title below the wheel */}
        <div className={styles.centerContent}>
          <h2 className={styles.centerTitle}>{centerTitle}</h2>
          <span className={styles.centerSubtitle}>{centerSubtitle}</span>
        </div>

        {/* Spinning disc — this element rotates, children stay put relative to it */}
        <div ref={discRef} className={styles.spinDisc}>
          {cards.map((card, i) => {
            // Place each card at its angle, pushed out by `radius`
            const angle = i * angleStep;
            const cardTransform = `rotate(${angle}deg) translateY(-${radius}px)`;

            return (
              <div
                key={card.id}
                className={styles.card}
                style={{
                  transform: cardTransform,
                }}
                onClick={() => onCardClick?.(card, i)}
              >
                {/* Color fill behind image */}
                <div
                  className={styles.cardFill}
                  style={{ backgroundColor: card.color || '#333' }}
                />
                <div className={styles.imageWrapper}>
                  <img
                    src={card.image}
                    alt={card.title}
                    className={styles.cardImage}
                    loading="lazy"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CardWheelSpread;
