'use client';
import React, { useState } from 'react';
import styles from './FloatingInput.module.css';
const FloatingInput = ({ label, type = 'text', value: controlledValue, onChange, backgroundColor = '#111114', borderColor = '#27272a', focusColor = '#a855f7', textColor = '#fafafa', labelColor = '#71717a', borderRadius = '10px', className = '', }) => {
    const [internalValue, setInternalValue] = useState('');
    const [focused, setFocused] = useState(false);
    const value = controlledValue ?? internalValue;
    const isActive = focused || value.length > 0;
    const handleChange = (e) => {
        const newValue = e.target.value;
        setInternalValue(newValue);
        onChange?.(newValue);
    };
    // Compose label class: base + active modifier + focused modifier
    const labelClass = [
        styles.label,
        isActive ? styles.labelActive : '',
        isActive && focused ? styles.labelFocused : '',
        !isActive && focused ? styles.labelFocused : '',
    ].filter(Boolean).join(' ');
    return (<div className={`${styles.wrapper} ${className}`} style={{
            '--bg-color': backgroundColor,
            '--border-color': borderColor,
            '--focus-color': focusColor,
            '--text-color': textColor,
            '--label-color': labelColor,
            '--border-radius': borderRadius,
        }}>
      <input type={type} value={value} onChange={handleChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} className={styles.input}/>
      <label className={labelClass}>{label}</label>
    </div>);
};
export default FloatingInput;
