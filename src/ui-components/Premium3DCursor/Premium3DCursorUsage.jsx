"use client";
import React, { useState } from "react";
import Premium3DCursor from "./Premium3DCursor";
export default function Premium3DCursorUsage(props) {
    const [isHovered, setIsHovered] = useState(false);
    // Destructure with default values, just like other components
    const { size = 40, lag = 0.3, baseColor = "#1a1a1a", highlightColor = "#ffffff" } = props;
    return (<div className="absolute inset-0 bg-[#080c18] flex flex-col items-center justify-center font-sans text-white overflow-hidden select-none" style={{ cursor: isHovered ? "none" : "auto" }} // Hide the original browser cursor within the preview area!
     onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {/* Background grid pattern */}
      <div className="absolute inset-0 z-0" style={{
            backgroundImage: 'radial-gradient(circle at center, #333 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            opacity: 0.15
        }}></div>

      {/* The custom 3D cursor */}
      {isHovered && (<Premium3DCursor size={size} lag={lag} baseColor={baseColor} highlightColor={highlightColor}/>)}

      <div className="z-10 text-center max-w-md px-6">
        <h2 className="text-3xl font-extrabold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Premium 3D Cursor
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          Hover over this preview container to experience the custom 3D cursor. Adjust the properties in the controls panel on the right.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
          <span className={`w-2 h-2 rounded-full transition-colors duration-300 ${isHovered ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></span>
          {isHovered ? "Active (Original Cursor Hidden)" : "Hover here to activate"}
        </div>
      </div>
    </div>);
}
