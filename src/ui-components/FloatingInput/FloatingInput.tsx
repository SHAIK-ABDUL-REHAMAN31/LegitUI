'use client';

import React, { useState } from 'react';
import styles from './FloatingInput.module.css';

interface FloatingInputProps {
  /** Floating label text displayed above the input. */
  label: string;
  /** HTML input type. @default 'text' */
  type?: string;
  /** Controlled input value. */
  value?: string;
  /** Callback fired when the input value changes. */
  onChange?: (value: string) => void;
  /** Background color. @default '#111114' */
  backgroundColor?: string;
  /** Border color. @default '#27272a' */
  borderColor?: string;
  /** Focus color. @default '#a855f7' */
  focusColor?: string;
  /** Text color. @default '#fafafa' */
  textColor?: string;
  /** Label color. @default '#71717a' */
  labelColor?: string;
  /** Border radius. @default '10px' */
  borderRadius?: string;
  /** Additional CSS classes. @default "" */
  className?: string;
}

const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  type = 'text',
  value: controlledValue,
  onChange,
  backgroundColor = '#111114',
  borderColor = '#27272a',
  focusColor = '#a855f7',
  textColor = '#fafafa',
  labelColor = '#71717a',
  borderRadius = '10px',
  className = '',
}) => {
  const [internalValue, setInternalValue] = useState('');
  const [focused, setFocused] = useState(false);
  const value = controlledValue ?? internalValue;
  const isActive = focused || value.length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  return (
    <div
      className={`${styles.wrapper} ${className}`}
      style={{
        '--bg-color': backgroundColor,
        '--border-color': borderColor,
        '--focus-color': focusColor,
        '--text-color': textColor,
        '--label-color': labelColor,
        '--border-radius': borderRadius,
      } as React.CSSProperties}
    >
      <input
        type={type}
        value={value}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={styles.input}
      />
      <label className={labelClass}>{label}</label>
    </div>
  );
};

export default FloatingInput;
