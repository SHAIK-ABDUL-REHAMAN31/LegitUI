import React from 'react';
import AnimatedStackedCards from './AnimatedStackedCards';

const AnimatedStackedCardsUsage: React.FC = () => {
  return (
    <div style={{ 
      background: '#f4f4f5', 
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      paddingBottom: '150px', // Moves the component up so the dropping card doesn't hit the bottom
      fontFamily: 'system-ui, -apple-system, sans-serif',
      margin: 0,
      boxSizing: 'border-box'
    }}>
      <AnimatedStackedCards />
    </div>
  );
};

export default AnimatedStackedCardsUsage;
