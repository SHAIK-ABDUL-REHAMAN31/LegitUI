'use client';
import React, { useState } from 'react';
import styles from './RippleButton.module.css';
const RippleButton = ({ children, onClick, variant = 'filled', backgroundColor = '#a855f7', textColor = '#ffffff', rippleColor = 'rgba(255, 255, 255, 0.35)', borderRadius = 12, duration = 0.6, className = '', }) => {
    const [ripples, setRipples] = useState([]);
    const handleClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const ripple = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            id: Date.now(),
        };
        setRipples(prev => [...prev, ripple]);
        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== ripple.id));
        }, duration * 1000);
        onClick?.();
    };
    const inlineStyles = {
        '--bg-color': backgroundColor,
        '--text-color': textColor,
        '--ripple-color': rippleColor,
        '--border-radius': `${borderRadius}px`,
        '--duration': `${duration}s`,
    };
    return (<button onClick={handleClick} className={`${styles.button} ${variant === 'filled' ? styles.buttonFilled : styles.buttonOutline} ${className}`} style={inlineStyles}>
      {ripples.map(ripple => (<span key={ripple.id} className={styles.ripple} style={{ left: ripple.x - 10, top: ripple.y - 10 }}/>))}
      <span className={styles.label}>{children || 'Click Me'}</span>
    </button>);
};
export default RippleButton;
