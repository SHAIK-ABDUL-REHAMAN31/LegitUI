'use client';
import React, { useState } from 'react';
import AsciiMotionText from './AsciiMotionText';
const AsciiMotionTextUsage = (props) => {
    const [isHovered, setIsHovered] = useState(false);
    // If the user changes mouseStrength via props, use it as the base.
    const baseStrength = props.mouseStrength !== undefined ? props.mouseStrength : 0.3;
    // Increase strength when hovering.
    const activeStrength = isHovered ? baseStrength * 2.5 : baseStrength;
    return (<div style={{ width: '100%', height: '100vh', background: '#000' }} onPointerEnter={() => setIsHovered(true)} onPointerLeave={() => setIsHovered(false)}>
      <AsciiMotionText {...props} mouseStrength={activeStrength}/>
    </div>);
};
export default AsciiMotionTextUsage;
