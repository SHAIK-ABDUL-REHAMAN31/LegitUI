import React from 'react';
import PulseLoader from './PulseLoader';
export default function PulseLoaderUsage() {
    return (<div className="flex items-center justify-center w-full h-full min-h-[400px]">
      <div className="flex flex-col items-center gap-8">
        <PulseLoader size={16} color="#ffffffff"/>
        <span className="text-zinc-400 font-medium tracking-wide">Loading...</span>
      </div>
    </div>);
}
