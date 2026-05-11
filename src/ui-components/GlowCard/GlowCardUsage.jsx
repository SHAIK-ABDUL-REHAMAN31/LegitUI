import React from 'react';
import GlowCard from './GlowCard';
export default function GlowCardUsage() {
    return (<div className="flex items-center justify-center w-full h-full min-h-[400px] p-8">
      <GlowCard className="w-full max-w-sm">
        <div className="flex flex-col gap-4">
          <div className="w-12 h-12 rounded-full bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white">Dynamic Glow</h3>
          <p className="text-zinc-400 leading-relaxed">
            Hover over this card to see the glowing orb follow your cursor around the edges, creating a stunning glassmorphism effect.
          </p>
        </div>
      </GlowCard>
    </div>);
}
