import React from "react";
import { ChromaticGradient } from "./ChromaticGradient";
import { motion } from "framer-motion";
export function ChromaticGradientUsage() {
    return (<div className="w-full h-[600px] rounded-xl overflow-hidden border border-white/10 relative">
      <ChromaticGradient speed={0.8}>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center">
            <div className="px-4 py-1.5 mb-6 text-xs font-medium tracking-widest uppercase rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              Cinematic Engine
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-center max-w-2xl bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
              Future of Design
            </h1>
            <p className="mt-6 text-lg text-center text-white/50 max-w-md">
              Experience the atmospheric, premium Apple-like aesthetic with
              real-time OGL powered chromatic gradients.
            </p>

            <button className="mt-10 px-8 py-3 bg-white text-black font-semibold rounded-full hover:scale-105 transition-transform duration-300 ease-out shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              Get Started
            </button>
          </motion.div>
        </div>
      </ChromaticGradient>
    </div>);
}
export default ChromaticGradientUsage;
