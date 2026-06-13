'use client';

import React from 'react';
import { motion } from 'framer-motion';
import PixelBackground from './PixelBackground';

export default function PixelBackgroundUsage(props: any) {
  return (
    <div className="w-full h-screen min-h-[600px] bg-black text-white relative overflow-hidden flex flex-col justify-between">
      {/* Background Component */}
      <PixelBackground
        className="absolute inset-0 w-full h-full"
        gridSpacing={props.gridSpacing ?? 16}
        dotSize={props.dotSize ?? 1.5}
        activeDotSize={props.activeDotSize ?? 3}
        interactionRadius={props.interactionRadius ?? 140}
        pushStrength={props.pushStrength ?? 0.5}
        springTension={props.springTension ?? 0.03}
        damping={props.damping ?? 0.88}
        noiseScale={props.noiseScale ?? 0.005}
        noiseSpeed={props.noiseSpeed ?? 0.002} // Calm default speed
        enableTrail={props.enableTrail ?? true}
        hoverActiveRadius={props.hoverActiveRadius ?? 60}
        {...props}
      >
        <div className="w-full h-full flex flex-col justify-between px-6 py-8 md:px-12 md:py-12 relative z-10 pointer-events-none">
          {/* Header/Nav element (pointer-events-auto so links are clickable if needed, though they are display only) */}
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full flex justify-between items-center pointer-events-auto"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold tracking-wider font-sans bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-400 to-zinc-600">
                LEGIT.UI
              </span>
              <span className="h-4 w-[1px] bg-zinc-800" />
              <span className="text-xs font-mono text-zinc-500 tracking-widest uppercase">
                PX-BG v1.0
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8 text-xs font-mono text-zinc-500 tracking-widest uppercase">
              <span className="text-white hover:text-white transition-colors duration-200 cursor-pointer">PHYSICS</span>
              <span className="hover:text-white transition-colors duration-200 cursor-pointer">PROCEDURAL</span>
              <span className="hover:text-white transition-colors duration-200 cursor-pointer">PERFORMANCE</span>
            </div>
          </motion.header>

          {/* Main Hero Content */}
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center justify-center flex-grow py-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-zinc-800 bg-zinc-950/80 backdrop-blur-md"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
              <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
                Dynamic Canvas Particle Engine
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight text-white font-sans leading-[1.05]"
            >
              PHYSICAL PIXELS
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-zinc-200 via-zinc-500 to-zinc-800">
                ORGANIC FLOWS.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.25, ease: "easeOut" }}
              className="mt-8 text-sm md:text-lg text-zinc-400 max-w-2xl font-light leading-relaxed font-sans"
            >
              A fluid-like pixel grid responsive to cursor magnetic force. Moving your cursor deforms the backdrop dynamically, leaving trailing canvas particles, while procedurally morphing organic landmasses drift quietly in the background.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="mt-12 flex flex-col md:flex-row gap-6 md:gap-16 border-t border-zinc-900 pt-8 w-full max-w-2xl justify-center text-left"
            >
              <div className="flex-1">
                <h3 className="text-xs font-mono tracking-widest text-zinc-500 uppercase mb-2">MAGNETIC DISPLACEMENT</h3>
                <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                  Pixels react to physical cursor proximity, dispersing and snapping back with configurable spring-elastic physics.
                </p>
              </div>
              <div className="h-[1px] md:h-12 w-full md:w-[1px] bg-zinc-900" />
              <div className="flex-1">
                <h3 className="text-xs font-mono tracking-widest text-zinc-500 uppercase mb-2">DYNAMIC SCATTER TRAIL</h3>
                <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                  Mouse velocity generates a crisp grid-aligned pixel dust trail, spawning, drifting, and fading away smoothly.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Minimalist Footer Info */}
          <motion.footer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono text-zinc-600 tracking-widest uppercase gap-4"
          >
            <div>
              HOVER & MOVE CURSOR TO ENGAGE PHYSICS
            </div>
            <div className="flex gap-4">
              <span>REF: CANVAS_2D</span>
              <span>•</span>
              <span>NO DEPENDENCY</span>
            </div>
          </motion.footer>
        </div>
      </PixelBackground>
    </div>
  );
}
