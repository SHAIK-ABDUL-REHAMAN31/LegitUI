import React from 'react';
import AnimatedStackedCards from './AnimatedStackedCards';

const AnimatedStackedCardsUsage: React.FC = () => {
  return (
    <div style={{ 
      background: 'radial-gradient(circle at center, #1b1b1f 0%, #0b0b0d 100%)', 
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      margin: 0,
      boxSizing: 'border-box'
    }}>
      <AnimatedStackedCards />
    </div>
  );
};

export default AnimatedStackedCardsUsage;

