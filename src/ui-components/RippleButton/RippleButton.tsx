'use client';

import React, { useState } from 'react';
import styles from './RippleButton.module.css';

interface RippleButtonProps {
  /** Button content. */
  children: React.ReactNode;
  /** Click handler. */
  onClick?: () => void;
  /** Visual style variant. @default 'filled' */
  variant?: 'filled' | 'outline';
}

interface Ripple {
  x: number;
  y: number;
  id: number;
}

const RippleButton: React.FC<RippleButtonProps> = ({
  children,
  onClick,
  variant = 'filled',
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
    }, 600);
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      className={`${styles.button} ${variant === 'filled' ? styles.buttonFilled : styles.buttonOutline}`}
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className={styles.ripple}
          style={{ left: ripple.x - 10, top: ripple.y - 10 }}
        />
      ))}
      <span className={styles.label}>{children}</span>
    </button>
  );
};

export default RippleButton;
