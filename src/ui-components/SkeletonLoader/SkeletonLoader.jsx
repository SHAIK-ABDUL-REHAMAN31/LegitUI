'use client';
import React from 'react';
import styles from './SkeletonLoader.module.css';
const normalize = (v) => typeof v === 'number' ? `${v}px` : v;
const Skeleton = ({ width = '100%', height = '20px', borderRadius = '8px', className = '', baseColor = '#1c1c22', highlightColor = '#27272a', speed = 1.5, }) => {
    return (<div className={`${styles.skeleton} ${className}`} style={{
            '--sk-width': normalize(width),
            '--sk-height': normalize(height),
            '--sk-radius': normalize(borderRadius),
            '--sk-base-color': baseColor,
            '--sk-highlight-color': highlightColor,
            '--sk-speed': `${speed}s`,
        }}/>);
};
export default Skeleton;
