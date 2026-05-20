'use client';

import React, { useState } from 'react';
import styles from './RippleButton.module.css';

interface Ripple {
  x: number;
  y: number;
  id: number;
}

interface RippleButtonProps {
  /** Button content. */
  children?: React.ReactNode;
  /** Click handler. */
  onClick?: () => void;
  /** Visual style variant. @default 'filled' */
  variant?: 'filled' | 'outline';
  /** Background color for filled variant. @default '#a855f7' */
  backgroundColor?: string;
  /** Button text and border color. @default '#ffffff' */
  textColor?: string;
  /** Expanding ripple color. @default 'rgba(255, 255, 255, 0.35)' */
  rippleColor?: string;
  /** Corner radius in pixels. @default 12 */
  borderRadius?: number;
  /** Ripple duration in seconds. @default 0.6 */
  duration?: number;
  /** Additional CSS classes. @default "" */
  className?: string;
}

const RippleButton: React.FC<RippleButtonProps> = ({
  children,
  onClick,
  variant = 'filled',
  backgroundColor = '#a855f7',
  textColor = '#ffffff',
  rippleColor = 'rgba(255, 255, 255, 0.35)',
  borderRadius = 12,
  duration = 0.6,
  className = '',
}) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ripple: Ripple = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      id: Date.now(),
    };
    setRipples(prev => [...prev, ripple]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== ripple.id));
    }, duration * 1000);
    onClick?.();
  };

  const inlineStyles = {
    '--bg-color': backgroundColor,
    '--text-color': textColor,
    '--ripple-color': rippleColor,
    '--border-radius': `${borderRadius}px`,
    '--duration': `${duration}s`,
  } as React.CSSProperties;

  return (
    <button
      onClick={handleClick}
      className={`${styles.button} ${
        variant === 'filled' ? styles.buttonFilled : styles.buttonOutline
      } ${className}`}
      style={inlineStyles}
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className={styles.ripple}
          style={{ left: ripple.x - 10, top: ripple.y - 10 }}
        />
      ))}
      <span className={styles.label}>{children || 'Click Me'}</span>
    </button>
  );
};

export default RippleButton;

