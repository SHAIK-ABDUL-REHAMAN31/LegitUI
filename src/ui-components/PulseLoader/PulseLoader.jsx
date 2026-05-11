'use client';
import React from 'react';
import styles from './PulseLoader.module.css';
const PulseLoader = ({ size = 12, color = '#a855f7', count = 3, speed = 1.4, className = '', }) => {
    return (<div className={`${styles.container} ${className}`} style={{
            '--dot-size': `${size}px`,
            '--dot-gap': `${size * 0.5}px`,
            '--dot-color': color,
            '--dot-speed': `${speed}s`,
        }}>
      {Array.from({ length: count }).map((_, i) => (<div key={i} className={styles.dot} style={{ '--dot-delay': `${i * 0.16}s` }}/>))}
    </div>);
};
export default PulseLoader;
