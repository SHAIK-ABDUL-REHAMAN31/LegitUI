import React from 'react';
import StackedCardReveal from './StackedCardReveal';

export default function StackedCardRevealUsage(props: any) {
  return (
    <div style={{ backgroundColor: '#050505', paddingBottom: '10vh' }}>
      {/* Spacer to simulate scrolling down to the component */}
      <div style={{ height: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter', letterSpacing: '2px', fontSize: '14px', textTransform: 'uppercase' }}>
          Scroll down to reveal
        </p>
      </div>

      <StackedCardReveal {...props} />

      {/* Spacer below to allow the last card to stick and unstick */}
      <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter', letterSpacing: '2px', fontSize: '14px', textTransform: 'uppercase' }}>
          End of section
        </p>
      </div>
    </div>
  );
}
