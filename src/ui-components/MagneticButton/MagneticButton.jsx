'use client';
import React, { useRef, useState } from 'react';
import styles from './MagneticButton.module.css';
const MagneticButton = ({ children, onClick, strength = 0.3, className = '', }) => {
    const btnRef = useRef(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const handleMouseMove = (e) => {
        if (!btnRef.current)
            return;
        const rect = btnRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        setOffset({
            x: (e.clientX - centerX) * strength,
            y: (e.clientY - centerY) * strength,
        });
    };
    const handleMouseLeave = () => setOffset({ x: 0, y: 0 });
    return (<button ref={btnRef} onClick={onClick} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className={`${styles.button} ${className}`} style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}>
      {children}
    </button>);
};
export default MagneticButton;
