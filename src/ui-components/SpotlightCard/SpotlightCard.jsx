'use client';
import React, { useRef, useState } from 'react';
import styles from './SpotlightCard.module.css';
const SpotlightCard = ({ children, className = '', spotlightColor = 'rgba(168, 85, 247, 0.08)', backgroundColor = '#16161a', borderColor = '#27272a', borderRadius = '16px', }) => {
    const divRef = useRef(null);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);
    const handleMouseMove = (e) => {
        if (!divRef.current)
            return;
        const rect = divRef.current.getBoundingClientRect();
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    return (<div ref={divRef} className={`${styles.card} ${className}`} style={{
            '--bg-color': backgroundColor,
            '--border-color': borderColor,
            '--border-radius': borderRadius,
        }} onMouseMove={handleMouseMove} onMouseEnter={() => setOpacity(1)} onMouseLeave={() => setOpacity(0)}>
      {/* Spotlight — background and position are fully dynamic */}
      <div className={styles.spotlight} style={{
            opacity,
            background: `radial-gradient(600px circle at ${pos.x}px ${pos.y}px, ${spotlightColor}, transparent 40%)`,
        }} aria-hidden="true"/>
      <div className={styles.content}>{children}</div>
    </div>);
};
export default SpotlightCard;
