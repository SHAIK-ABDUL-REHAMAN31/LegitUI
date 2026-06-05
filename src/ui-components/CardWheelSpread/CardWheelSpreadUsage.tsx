'use client';

import React from 'react';
import CardWheelSpread from './CardWheelSpread';

interface CardWheelSpreadUsageProps {
  [key: string]: any;
}

export default function CardWheelSpreadUsage(props: CardWheelSpreadUsageProps) {
  return (
    <div style={{
      width: '100%',
      height: '100vh',
      backgroundColor: '#000000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0,
      overflow: 'hidden',
    }}>
      <CardWheelSpread {...props} />
    </div>
  );
}
