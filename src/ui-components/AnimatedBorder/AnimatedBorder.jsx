'use client';
import React from 'react';
import styles from './AnimatedBorder.module.css';
const AnimatedBorder = ({ children, borderWidth = 2, className = '', speed = 3, color1 = '#7c3aed', color2 = '#a855f7', color3 = '#c084fc', innerColor = '#16161a', }) => {
    return (<div className={`${styles.wrapper} ${className}`} style={{
            // Dynamic values passed as CSS custom properties
            '--border-width': `${borderWidth}px`,
            '--speed': `${speed}s`,
            '--inner-radius': `${16 - borderWidth}px`,
            '--color-1': color1,
            '--color-2': color2,
            '--color-3': color3,
            '--inner-color': innerColor,
        }}>
      <div className={styles.inner}>
        {children}
      </div>
    </div>);
};
export default AnimatedBorder;
