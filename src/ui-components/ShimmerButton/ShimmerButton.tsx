'use client';

import React from 'react';
import styles from './ShimmerButton.module.css';

interface ShimmerButtonProps {
  /** Button content. */
  children: React.ReactNode;
  /** Click handler. */
  onClick?: () => void;
  /** Additional CSS classes. @default "" */
  className?: string;
  /** Button background (color or gradient). @default 'linear-gradient(135deg, #FF0080, #a47bceff)' */
  background?: string;
  /** Shimmer line color. @default 'rgba(255, 255, 255, 0.2)' */
  shimmerColor?: string;
  /** Shimmer animation duration. @default '2s' */
  shimmerDuration?: string;
  /** Border radius. @default '10px' */
  borderRadius?: string;
}

const ShimmerButton: React.FC<ShimmerButtonProps> = ({
  children,
  onClick,
  className = '',
  background = 'linear-gradient(135deg, #b7d823ff, #c37e06ff)',
  shimmerColor = 'rgba(255, 255, 255, 0.2)',
  shimmerDuration = '2s',
  borderRadius = '10px',
}) => {
  return (
    <button
      onClick={onClick}
      className={`${styles.button} ${className}`}
      style={{
        '--bg': background,
        '--shimmer-color': shimmerColor,
        '--shimmer-duration': shimmerDuration,
        '--border-radius': borderRadius,
      } as React.CSSProperties}
    >
      <span className={styles.shimmer} aria-hidden="true" />
      <span className={styles.label}>{children}</span>
    </button>
  );
};

export default ShimmerButton;
