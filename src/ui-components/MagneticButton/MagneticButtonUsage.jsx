import React from 'react';
import MagneticButton from './MagneticButton';
export default function MagneticButtonUsage(props) {
    return (<div className="flex items-center justify-center w-full h-full min-h-[400px] p-8">
      <MagneticButton {...props}>
        <span className="flex items-center gap-2">
          <span>Explore Component</span>
          <span className="text-xs opacity-70">✦</span>
        </span>
      </MagneticButton>
    </div>);
}
