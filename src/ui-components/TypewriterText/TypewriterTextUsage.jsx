import React from 'react';
import TypewriterText from './TypewriterText';

const TypewriterTextUsage = () => {
    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#ffffff',
            color: '#000000',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            padding: '2rem',
            textAlign: 'center'
        }}>
            <h1 style={{
                fontSize: 'clamp(2rem, 5vw, 4rem)',
                fontWeight: 800,
                marginBottom: '1.5rem',
                fontFamily: 'inherit'
            }}>
                <TypewriterText
                    text="Build fast. Scale forever."
                    speed={70}
                    delay={500}
                />
            </h1>
            <p style={{
                fontSize: '1.125rem',
                opacity: 0.8,
                maxWidth: '600px',
                lineHeight: 1.6,
                fontFamily: 'inherit'
            }}>
                <TypewriterText
                    text="Experience clean, minimal, and highly performant text animations."
                    speed={30}
                    delay={2500}
                    cursor={false}
                />
            </p>
        </div>
    );
};

export default TypewriterTextUsage;
