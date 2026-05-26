'use client';

import React from 'react';
import FanningCards, { FanningCardItem } from './FanningCards';

export const FanningCardsUsage = () => {
  // A premium collection of designer eyewear sunglasses
  const eyewearCollection: FanningCardItem[] = [
    {
      id: 'neon-shield',
      title: 'Neon Shield',
      subtitle: 'Cyberpunk Visor',
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=600&auto=format&fit=crop',
      color: '#ec4899'
    },
    {
      id: 'acid-vortex',
      title: 'Acid Vortex',
      subtitle: 'Liquid Neon',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop',
      color: '#06b6d4'
    },
    {
      id: 'aurum-classic',
      title: 'Aurum Classic',
      subtitle: 'Retro Luxury',
      image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=600&auto=format&fit=crop',
      color: '#eab308'
    },
    {
      id: 'chroma-oval',
      title: 'Chroma Oval',
      subtitle: 'Prism Flare',
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop',
      color: '#a855f7'
    },
    {
      id: 'matrix-spec',
      title: 'Matrix Spec',
      subtitle: 'Tactical Shade',
      image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=600&auto=format&fit=crop',
      color: '#10b981'
    }
  ];

  const handleCardClick = (card: FanningCardItem, index: number) => {
    console.log(`[FanningCardsUsage] Clicked card index ${index}: ${card.title} (${card.id})`);
  };

  return (
    <div className="w-full h-screen bg-[#030304] overflow-hidden">
      <FanningCards 
        cards={eyewearCollection} 
        badgeText="✦ Limited Capsule"
        headline="Eyewear That Stands Out"
        buttonText="Enter Store"
        buttonLink="#shop"
        animationDuration={1.2}
        scaleOffset={0.08}
        showGlow={true}
        enableHoverEffect={true}
        onCardClick={handleCardClick}
      />
    </div>
  );
};

export default FanningCardsUsage;
