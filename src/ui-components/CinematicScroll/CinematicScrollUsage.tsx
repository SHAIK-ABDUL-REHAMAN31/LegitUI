import React from "react";
import CinematicScroll from "./CinematicScroll";

export default function CinematicScrollUsage() {
  return (
    <div className="bg-black min-h-screen">
      <div className="h-screen flex items-center justify-center text-white/50 font-mono text-sm uppercase tracking-widest">
        Scroll Down
      </div>
      <CinematicScroll />
      <div className="h-screen flex items-center justify-center text-white/50 font-mono text-sm uppercase tracking-widest">
        Keep Scrolling
      </div>
    </div>
  );
}
