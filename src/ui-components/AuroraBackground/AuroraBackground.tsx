'use client';

import React from 'react';
import styles from './AuroraBackground.module.css';

interface AuroraBackgroundProps {
  /** Content rendered over the aurora background. */
  children?: React.ReactNode;
  /** Additional CSS classes. @default "" */
  className?: string;
  /** Aurora brightness level. @default 'medium' */
  intensity?: 'subtle' | 'medium' | 'vivid';
  /** Gradient color 1. @default '124, 58, 237' */
  color1?: string;
  /** Gradient color 2. @default '168, 85, 247' */
  color2?: string;
  /** Gradient color 3. @default '192, 132, 252' */
  color3?: string;
  /** Background color. @default '#09090b' */
  backgroundColor?: string;
}

const opacityMap = { subtle: 0.15, medium: 0.25, vivid: 0.4 };

const AuroraBackground: React.FC<AuroraBackgroundProps> = ({
  children,
  className = '',
  intensity = 'medium',
  color1 = '124, 58, 237',
  color2 = '168, 85, 247',
  color3 = '192, 132, 252',
  backgroundColor = '#09090b',
}) => {
  const opacity = opacityMap[intensity];

  return (
    <div
      className={`${styles.root} ${className}`}
      style={{
        '--aurora-opacity': opacity,
        '--color-1': color1,
        '--color-2': color2,
        '--color-3': color3,
        '--bg-color': backgroundColor,
      } as React.CSSProperties}
    >
      <div className={styles.blurLayer}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.orb3} />
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default AuroraBackground;
