'use client';

import React from 'react';
import styles from './SkeletonLoader.module.css';

interface SkeletonProps {
  /** Width of the skeleton element. @default '100%' */
  width?: string | number;
  /** Height of the skeleton element. @default '20px' */
  height?: string | number;
  /** Border radius of the skeleton element. @default '8px' */
  borderRadius?: string | number;
  /** Additional CSS classes. @default "" */
  className?: string;
  /** Base background color. @default '#1c1c22' */
  baseColor?: string;
  /** Highlight shimmer color. @default '#27272a' */
  highlightColor?: string;
  /** Shimmer animation speed in seconds. @default 1.5 */
  speed?: number;
}

const normalize = (v: string | number) =>
  typeof v === 'number' ? `${v}px` : v;

const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = '8px',
  className = '',
  baseColor = '#1c1c22',
  highlightColor = '#27272a',
  speed = 1.5,
}) => {
  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={{
        '--sk-width': normalize(width),
        '--sk-height': normalize(height),
        '--sk-radius': normalize(borderRadius),
        '--sk-base-color': baseColor,
        '--sk-highlight-color': highlightColor,
        '--sk-speed': `${speed}s`,
      } as React.CSSProperties}
    />
  );
};

export default Skeleton;
