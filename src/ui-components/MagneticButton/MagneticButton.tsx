'use client';

import React, { useRef, useState } from 'react';
import styles from './MagneticButton.module.css';

interface MagneticButtonProps {
  /** Button content. */
  children?: React.ReactNode;
  /** Click handler. */
  onClick?: () => void;
  /** Magnetic pull intensity multiplier. @default 0.3 */
  strength?: number;
  /** Hover scale factor. @default 1.08 */
  scale?: number;
  /** Text color. @default "#ffffff" */
  textColor?: string;
  /** Button background color. @default "#a855f7" */
  backgroundColor?: string;
  /** Hover glow color. @default "rgba(168, 85, 247, 0.45)" */
  glowColor?: string;
  /** Corner radius in pixels. @default 12 */
  borderRadius?: number;
  /** Additional CSS classes. @default "" */
  className?: string;
}

const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  onClick,
  strength = 0.3,
  scale = 1.08,
  textColor = '#ffffff',
  backgroundColor = '#a855f7',
  glowColor = 'rgba(168, 85, 247, 0.45)',
  borderRadius = 12,
  className = '',
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setOffset({
      x: (e.clientX - centerX) * strength,
      y: (e.clientY - centerY) * strength,
    });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const inlineStyles = {
    transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${isHovered ? scale : 1})`,
    '--text-color': textColor,
    '--bg-color': backgroundColor,
    '--glow-color': glowColor,
    '--border-radius': `${borderRadius}px`,
  } as React.CSSProperties;

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`${styles.button} ${className}`}
      style={inlineStyles}
    >
      <span className={styles.glow} />
      <span className={styles.content}>{children || 'Hover Me'}</span>
    </button>
  );
};

export default MagneticButton;

