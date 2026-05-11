'use client';

import React, { useRef, useState } from 'react';
import styles from './MagneticButton.module.css';

interface MagneticButtonProps {
  /** Button content. */
  children: React.ReactNode;
  /** Click handler. */
  onClick?: () => void;
  /** Magnetic pull intensity multiplier. @default 0.3 */
  strength?: number;
}

const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  onClick,
  strength = 0.3,
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setOffset({
      x: (e.clientX - centerX) * strength,
      y: (e.clientY - centerY) * strength,
    });
  };

  const handleMouseLeave = () => setOffset({ x: 0, y: 0 });

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={styles.button}
      style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
    >
      {children}
    </button>
  );
};

export default MagneticButton;
