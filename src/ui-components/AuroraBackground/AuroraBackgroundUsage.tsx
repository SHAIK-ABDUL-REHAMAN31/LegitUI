import React from 'react';
import AuroraBackground from './AuroraBackground';

export default function AuroraBackgroundUsage() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[500px]">
      <AuroraBackground className="w-full h-[500px] rounded-2xl" intensity="medium">
        <div className="w-full h-full flex flex-col items-center justify-center text-center px-4">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
            <span className="text-sm font-medium text-white/80">New Background Effect</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6">
            Aurora Lights
          </h1>
          <p className="text-lg md:text-xl text-zinc-300 max-w-md mx-auto">
            A mesmerizing animated background effect for your hero sections and landing pages.
          </p>
        </div>
      </AuroraBackground>
    </div>
  );
}
