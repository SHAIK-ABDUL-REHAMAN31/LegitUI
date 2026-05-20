'use client';
import React, { useRef, useState } from 'react';
import styles from './MagneticButton.module.css';
const MagneticButton = ({ children, onClick, strength = 0.3, scale = 1.08, textColor = '#ffffff', backgroundColor = '#a855f7', glowColor = 'rgba(168, 85, 247, 0.45)', borderRadius = 12, className = '', }) => {
    const btnRef = useRef(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
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
        setIsHovered(true);
    };
    const handleMouseLeave = () => {
        setOffset({ x: 0, y: 0 });
        setIsHovered(false);
    };
    const inlineStyles = {
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${isHovered ? scale : 1})`,
        '--text-color': textColor,
        '--bg-color': backgroundColor,
        '--glow-color': glowColor,
        '--border-radius': `${borderRadius}px`,
    };
    return (<button ref={btnRef} onClick={onClick} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className={`${styles.button} ${className}`} style={inlineStyles}>
      <span className={styles.glow}/>
      <span className={styles.content}>{children || 'Hover Me'}</span>
    </button>);
};
export default MagneticButton;
