"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HeroUI() {
    return (
        <div className="relative z-50 w-full min-h-screen flex flex-col items-center justify-between py-10 px-6 overflow-hidden">
            {/* Navigation */}
            <motion.nav
                initial={{ opacity: 0, y: -100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-7xl flex items-center justify-between px-8 py-4 rounded-full border border-white/10 bg-black/20 backdrop-blur-xl"
            >
                <Link href="/" className="flex items-center">
                    <Image
                        src="/LegitUI-logo.png"
                        alt="LegitUI Logo"
                        width={100}
                        height={40}
                        className="object-contain w-auto h-8"
                        priority
                    />
                </Link>
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
                    <Link href="/components" className="hover:text-white transition-colors">Components</Link>
                    <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
                    <Link href="/showcase" className="hover:text-white transition-colors">Showcase</Link>
                </div>
                <div className="flex items-center gap-4">
                    <svg className="w-5 h-5 text-zinc-400 hover:text-white cursor-pointer" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                    <svg className="w-5 h-5 text-zinc-400 hover:text-white cursor-pointer" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </div>
            </motion.nav>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center text-center max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] uppercase tracking-[0.2em] text-zinc-400 mb-8"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                    Free & Open Source
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="text-6xl md:text-8xl font-bold tracking-tight text-white mb-6 leading-[0.9]"
                >
                    Legit <span className="bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">UI</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                    className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-12 leading-relaxed"
                >
                    A premium collection of interactive, animated React components. Copy, paste, and build stunning interfaces effortlessly.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                    className="flex flex-col sm:flex-row items-center gap-4"
                >
                    <Link href="/components" className="group relative px-8 py-4 rounded-full bg-white text-black font-semibold overflow-hidden transition-all hover:pr-12">
                        Browse Components
                        <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                    <Link href="/docs" className="px-8 py-4 rounded-full border border-white/10 bg-white/5 text-white font-medium hover:bg-white/10 transition-all">
                        View Documentation
                    </Link>
                </motion.div>
            </div>

            {/* Bottom fade overlay */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "180px",
                    background: "linear-gradient(to top, #000000, transparent)",
                    pointerEvents: "none",
                    zIndex: 60,
                }}
            />
        </div>
    );
}
