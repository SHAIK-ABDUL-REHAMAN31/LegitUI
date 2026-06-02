import React from 'react';
import TypewriterText from './TypewriterText';

const TypewriterTextUsage = (props) => {
    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: props.backgroundColor || '#000000',
            color: props.textColor || '#ffffff',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            padding: '2rem',
            textAlign: 'center'
        }}>
            <h1 style={{
                fontSize: 'clamp(2rem, 5vw, 4rem)',
                fontWeight: 800,
                fontFamily: 'inherit'
            }}>
                <TypewriterText
                    text="Build fast. Scale forever."
                    speed={70}
                    delay={500}
                    {...props}
                />
            </h1>
        </div>
    );
};

export default TypewriterTextUsage;
