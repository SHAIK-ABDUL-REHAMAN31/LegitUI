import React from 'react';
import AuroraBackground from './AuroraBackground';

export default function AuroraBackgroundUsage() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[600px] bg-black p-4 md:p-10">
      <AuroraBackground className="w-full h-[600px] rounded-3xl overflow-hidden shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)] border border-white/10" intensity="vivid">
        <div className="w-full h-full flex flex-col items-center justify-center text-center px-4 relative z-10">
          <div className="inline-flex items-center px-5 py-2 mb-8 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-xl shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] transition-transform hover:scale-105">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-3 animate-pulse"></span>
            <span className="text-xs md:text-sm font-semibold tracking-widest text-emerald-300 uppercase">Northern Lights</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 tracking-tight mb-8 drop-shadow-lg">
            True Aurora
          </h1>
          <p className="text-lg md:text-2xl text-zinc-300/80 max-w-2xl mx-auto font-light leading-relaxed">
            Experience the mesmerizing beauty of the polar lights, entirely rendered in CSS. A seamless, dynamic background for premium interfaces.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row gap-4">
             <button className="px-8 py-3.5 rounded-full bg-white text-black font-semibold hover:scale-105 transition-all duration-300 shadow-[0_0_30px_-5px_rgba(255,255,255,0.6)]">
               Start Building
             </button>
             <button className="px-8 py-3.5 rounded-full border border-white/20 text-white font-medium hover:bg-white/10 transition-colors backdrop-blur-sm">
               View Components
             </button>
          </div>
        </div>
      </AuroraBackground>
    </div>
  );
}
