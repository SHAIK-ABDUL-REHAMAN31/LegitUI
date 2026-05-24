import React from 'react';
import HalftoneEyes from './HalftoneEyes';

export default function HalftoneEyesUsage(props: any) {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[400px] p-8 bg-black relative overflow-hidden select-none">
      {/* Main eye component */}
      <div className="relative z-10">
        <HalftoneEyes {...props} />
      </div>
    </div>
  );
}
