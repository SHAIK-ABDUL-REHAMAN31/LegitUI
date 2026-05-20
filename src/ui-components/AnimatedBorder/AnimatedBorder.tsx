'use client';

import React from 'react';
import styles from './AnimatedBorder.module.css';

interface AnimatedBorderProps {
  /** Content wrapped by the animated border. */
  children: React.ReactNode;
  /** Border thickness in pixels. @default 2 */
  borderWidth?: number;
  /** Additional CSS classes. @default "" */
  className?: string;
  /** Animation cycle duration in seconds. @default 3 */
  speed?: number;
  /** Gradient color 1. @default '#7c3aed' */
  color1?: string;
  /** Gradient color 2. @default '#a855f7' */
  color2?: string;
  /** Gradient color 3. @default '#c084fc' */
  color3?: string;
  /** Inner background color. @default '#16161a' */
  innerColor?: string;
  /** Enable outer neon glow effect. @default true */
  glow?: boolean;
  /** Corner radius in pixels. @default 16 */
  borderRadius?: number;
}

const AnimatedBorder: React.FC<AnimatedBorderProps> = ({
  children,
  borderWidth = 2,
  className = '',
  speed = 3,
  color1 = '#7c3aed',
  color2 = '#a855f7',
  color3 = '#c084fc',
  innerColor = '#16161a',
  glow = true,
  borderRadius = 16,
}) => {
  return (
    <div
      className={`${styles.wrapper} ${className}`}
      style={{
        // Dynamic values passed as CSS custom properties
        '--border-width': `${borderWidth}px`,
        '--speed': `${speed}s`,
        '--border-radius': `${borderRadius}px`,
        '--inner-radius': `${Math.max(0, borderRadius - borderWidth)}px`,
        '--color-1': color1,
        '--color-2': color2,
        '--color-3': color3,
        '--inner-color': innerColor,
      } as React.CSSProperties}
    >
      {glow && <div className={styles.glow} />}
      <div className={styles.inner}>
        {children}
      </div>
    </div>
  );
};

export default AnimatedBorder;

