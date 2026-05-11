'use client';
import React from 'react';
import styles from './AuroraBackground.module.css';
const opacityMap = { subtle: 0.15, medium: 0.25, vivid: 0.4 };
const AuroraBackground = ({ children, className = '', intensity = 'medium', color1 = '124, 58, 237', color2 = '168, 85, 247', color3 = '192, 132, 252', backgroundColor = '#09090b', }) => {
    const opacity = opacityMap[intensity];
    return (<div className={`${styles.root} ${className}`} style={{
            '--aurora-opacity': opacity,
            '--color-1': color1,
            '--color-2': color2,
            '--color-3': color3,
            '--bg-color': backgroundColor,
        }}>
      <div className={styles.blurLayer}>
        <div className={styles.orb1}/>
        <div className={styles.orb2}/>
        <div className={styles.orb3}/>
      </div>
      <div className={styles.content}>{children}</div>
    </div>);
};
export default AuroraBackground;
