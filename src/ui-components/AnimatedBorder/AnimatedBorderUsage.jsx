import React from 'react';
import AnimatedBorder from './AnimatedBorder';
export default function AnimatedBorderUsage() {
    return (<div className="flex items-center justify-center w-full h-full min-h-[400px] p-8">
      <AnimatedBorder className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <h3 className="text-2xl font-bold text-white">Premium Plan</h3>
          <p className="text-zinc-400">Unlock all the advanced features and supercharge your workflow.</p>
          <button className="px-6 py-2 bg-white text-black font-semibold rounded-lg mt-4 transition-transform hover:scale-105 active:scale-95">
            Get Started
          </button>
        </div>
      </AnimatedBorder>
    </div>);
}
