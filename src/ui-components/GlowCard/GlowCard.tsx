'use client';

import React, { useRef, useState } from 'react';
import styles from './GlowCard.module.css';

interface GlowCardProps {
  /** Card content. */
  children: React.ReactNode;
  /** Additional CSS classes. @default "" */
  className?: string;
  /** Glow color. @default '168, 85, 247' */
  glowColor?: string;
  /** Card background color. @default '#16161a' */
  backgroundColor?: string;
  /** Card border color. @default '#27272a' */
  borderColor?: string;
  /** Card border radius. @default '16px' */
  borderRadius?: string;
}

const GlowCard: React.FC<GlowCardProps> = ({
  children,
  className = '',
  glowColor = '168, 85, 247',
  backgroundColor = '#16161a',
  borderColor = '#27272a',
  borderRadius = '16px',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [glowPos, setGlowPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setGlowPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={cardRef}
      className={`${styles.card} ${className}`}
      style={{
        '--bg-color': backgroundColor,
        '--border-color': borderColor,
        '--border-radius': borderRadius,
        '--glow-color': glowColor,
      } as React.CSSProperties}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={styles.glow}
        style={{
          left: glowPos.x,
          top: glowPos.y,
          opacity: isHovered ? 1 : 0,
        }}
        aria-hidden="true"
      />
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default GlowCard;
