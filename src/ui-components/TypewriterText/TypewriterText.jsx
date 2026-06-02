'use client';
import React, { useState, useEffect } from 'react';
import styles from './TypewriterText.module.css';
const TypewriterText = ({ 
    text, 
    speed = 50, 
    delay = 0, 
    className = '', 
    cursor = true, 
    textColor = '#ffffff', 
    backgroundColor = '#000000', 
    fontSize, 
}) => {
    const [displayed, setDisplayed] = useState('');
    const [started, setStarted] = useState(false);

    // Reset states to restart typing when key props change
    useEffect(() => {
        setDisplayed('');
        setStarted(false);
    }, [text, speed, delay, textColor, backgroundColor, fontSize]);

    useEffect(() => {
        if (!started) {
            const delayTimer = setTimeout(() => setStarted(true), delay);
            return () => clearTimeout(delayTimer);
        }
    }, [started, delay]);

    useEffect(() => {
        if (!started)
            return;
        if (displayed.length < text.length) {
            const timer = setTimeout(() => {
                setDisplayed(text.slice(0, displayed.length + 1));
            }, speed);
            return () => clearTimeout(timer);
        }
    }, [displayed, started, text, speed]);
    return (<span 
        className={`${styles.text} ${className}`}
        style={{
            color: textColor,
            fontSize: fontSize || undefined
        }}
    >
      {displayed}
      {cursor && <span className={styles.cursor}/>}
    </span>);
};
export default TypewriterText;
