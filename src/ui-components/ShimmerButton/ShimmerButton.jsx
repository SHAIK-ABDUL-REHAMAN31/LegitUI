'use client';
import React from 'react';
import styles from './ShimmerButton.module.css';
const ShimmerButton = ({ children, onClick, className = '', background = 'linear-gradient(135deg, #b7d823ff, #c37e06ff)', shimmerColor = 'rgba(255, 255, 255, 0.2)', shimmerDuration = '2s', borderRadius = '10px', }) => {
    return (<button onClick={onClick} className={`${styles.button} ${className}`} style={{
            '--bg': background,
            '--shimmer-color': shimmerColor,
            '--shimmer-duration': shimmerDuration,
            '--border-radius': borderRadius,
        }}>
      <span className={styles.shimmer} aria-hidden="true"/>
      <span className={styles.label}>{children}</span>
    </button>);
};
export default ShimmerButton;
