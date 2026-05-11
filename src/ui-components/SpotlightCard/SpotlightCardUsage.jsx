import React from 'react';
import SpotlightCard from './SpotlightCard';
export default function SpotlightCardUsage() {
    return (<div className="flex items-center justify-center w-full h-full min-h-[400px] p-8">
      <SpotlightCard className="w-full max-w-sm">
        <div className="flex flex-col gap-4">
          <div className="w-12 h-12 rounded-full bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white">Spotlight Effect</h3>
          <p className="text-zinc-400 leading-relaxed">
            A beautiful spotlight gradient follows your mouse position, revealing subtle borders and illuminating the content.
          </p>
        </div>
      </SpotlightCard>
    </div>);
}
