'use client';
import React, { useState } from 'react';
import styles from './RippleButton.module.css';
const RippleButton = ({ children, onClick, variant = 'filled', }) => {
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
        }, 600);
        onClick?.();
    };
    return (<button onClick={handleClick} className={`${styles.button} ${variant === 'filled' ? styles.buttonFilled : styles.buttonOutline}`}>
      {ripples.map(ripple => (<span key={ripple.id} className={styles.ripple} style={{ left: ripple.x - 10, top: ripple.y - 10 }}/>))}
      <span className={styles.label}>{children}</span>
    </button>);
};
export default RippleButton;
