import React from 'react';
import SkeletonLoader from './SkeletonLoader';
export default function SkeletonLoaderUsage() {
    return (<div className="flex items-center justify-center w-full h-full min-h-[400px] p-8">
      <div className="w-full max-w-sm p-6 border border-zinc-800 rounded-3xl bg-[#09090b] space-y-6">
        <div className="flex items-center gap-4">
          <SkeletonLoader width={48} height={48} borderRadius="50%"/>
          <div className="space-y-3 flex-1">
            <SkeletonLoader width="60%" height={12} borderRadius="6px"/>
            <SkeletonLoader width="40%" height={10} borderRadius="6px"/>
          </div>
        </div>
        <SkeletonLoader width="100%" height={140} borderRadius="16px"/>
        <div className="space-y-3">
          <SkeletonLoader width="100%" height={10} borderRadius="6px"/>
          <SkeletonLoader width="90%" height={10} borderRadius="6px"/>
          <SkeletonLoader width="70%" height={10} borderRadius="6px"/>
        </div>
      </div>
    </div>);
}
