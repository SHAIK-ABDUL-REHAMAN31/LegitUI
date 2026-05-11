'use client';

import React from 'react';
import styles from './PulseLoader.module.css';

interface PulseLoaderProps {
  /** Diameter of each dot in pixels. @default 12 */
  size?: number;
  /** Dot color as CSS color string. @default '#a855f7' */
  color?: string;
  /** Number of animated dots. @default 3 */
  count?: number;
  /** Animation duration in seconds. @default 1.4 */
  speed?: number;
  /** Additional CSS classes. @default "" */
  className?: string;
}

const PulseLoader: React.FC<PulseLoaderProps> = ({
  size = 12,
  color = '#a855f7',
  count = 3,
  speed = 1.4,
  className = '',
}) => {
  return (
    <div
      className={`${styles.container} ${className}`}
      style={{
        '--dot-size': `${size}px`,
        '--dot-gap': `${size * 0.5}px`,
        '--dot-color': color,
        '--dot-speed': `${speed}s`,
      } as React.CSSProperties}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={styles.dot}
          style={{ '--dot-delay': `${i * 0.16}s` } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default PulseLoader;
