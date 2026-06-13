import React from 'react';
import TextScramble from './TextScramble';

const TextScrambleUsage: React.FC = () => {
  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '3rem',
        background: '#050505',
      }}
    >
      <TextScramble
        text="Decode Effect"
        trigger="loop"
        speed={1}
        scrambleDuration={1.2}
        stagger={0.05}
        loopDelay={2.5}

        fontSize="clamp(2.5rem, 7vw, 4.8rem)"
        fontFamily="var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        textColor="#ffffff"
        scrambleColor="#6366f1"
      />
    </div>
  );
};

export default TextScrambleUsage;
