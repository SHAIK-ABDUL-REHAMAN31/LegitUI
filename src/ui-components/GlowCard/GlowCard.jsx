'use client';
import React, { useRef, useState } from 'react';
import styles from './GlowCard.module.css';
const GlowCard = ({ children, className = '', glowColor = '168, 85, 247', backgroundColor = '#16161a', borderColor = '#27272a', borderRadius = '16px', }) => {
    const cardRef = useRef(null);
    const [glowPos, setGlowPos] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const handleMouseMove = (e) => {
        if (!cardRef.current)
            return;
        const rect = cardRef.current.getBoundingClientRect();
        setGlowPos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };
    return (<div ref={cardRef} className={`${styles.card} ${className}`} style={{
            '--bg-color': backgroundColor,
            '--border-color': borderColor,
            '--border-radius': borderRadius,
            '--glow-color': glowColor,
        }} onMouseMove={handleMouseMove} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className={styles.glow} style={{
            left: glowPos.x,
            top: glowPos.y,
            opacity: isHovered ? 1 : 0,
        }} aria-hidden="true"/>
      <div className={styles.content}>{children}</div>
    </div>);
};
export default GlowCard;
