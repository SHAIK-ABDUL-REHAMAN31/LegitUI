'use client';
import React from 'react';
import styles from './AnimatedBorder.module.css';
const AnimatedBorder = ({ children, borderWidth = 2, className = '', speed = 4, beamSize = 120, // Kept for registry prop compatibility
color1 = '#3b82f6', color2 = '#f97316', innerColor = '#0c0c0e', borderRadius = 24, ambientGlow = true, glowIntensity = 0.15, }) => {
    const isAnimated = speed > 0;
    const animSpeed = isAnimated ? speed : 4;
    return (<div className={`${styles.container} ${className}`} style={{
            '--border-width': `${borderWidth}px`,
            '--speed': `${animSpeed}s`,
            '--border-radius': `${borderRadius}px`,
            '--inner-radius': `${Math.max(0, borderRadius - borderWidth)}px`,
            '--color-1': color1,
            '--color-2': color2,
            '--inner-color': innerColor,
            '--glow-intensity': glowIntensity,
            '--animation-play-state': isAnimated ? 'running' : 'paused',
        }}>
      {/* Ambient background glow placed behind the wrapper */}
      {ambientGlow && (<div className={`${styles.ambientGlow} ${styles.movingGradient}`}/>)}

      {/* Border Wrapper (its background forms the full glowing border) */}
      <div className={`${styles.wrapper} ${styles.movingGradient}`}>
        {/* Inner Card content */}
        <div className={styles.inner}>
          {children}
        </div>
      </div>
    </div>);
};
export default AnimatedBorder;
