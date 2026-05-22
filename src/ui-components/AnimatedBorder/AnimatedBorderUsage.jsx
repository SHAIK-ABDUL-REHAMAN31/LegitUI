'use client';
import React, { useState, useEffect, useRef } from 'react';
import AnimatedBorder from './AnimatedBorder';
import { Paperclip, Brain, ChevronDown, Send } from 'lucide-react';
import gsap from 'gsap';
export default function AnimatedBorderUsage(props) {
    const [inputValue, setInputValue] = useState('');
    const containerRef = useRef(null);
    const wordsRef = useRef([]);
    const footerRef = useRef(null);
    const placeholderText = "Hey, how can I help you?";
    const placeholderWords = placeholderText.split(" ");
    useEffect(() => {
        const container = containerRef.current;
        const footer = footerRef.current;
        if (!container || !footer)
            return;
        // Use gsap.context for React strict-mode safe cleanup
        const ctx = gsap.context(() => {
            // 1. Measure natural height
            gsap.set(container, { height: 'auto' });
            const fullHeight = container.offsetHeight;
            // 2. Set initial locked pill state
            gsap.set(container, { height: 64, overflow: 'hidden' });
            // Initial state is set synchronously; inline style="opacity: 0" prevents flash on mount
            gsap.set(wordsRef.current, { opacity: 0, y: 12, filter: 'blur(4px)' });
            const footerElements = footer.querySelectorAll('.footer-anim-item');
            gsap.set(footerElements, { opacity: 0, y: 12, filter: 'blur(4px)' });
            // 3. Create choreographed timeline
            const tl = gsap.timeline({ delay: 0.2 });
            // Container expands down organically with a premium, smooth deceleration curve
            tl.to(container, {
                height: fullHeight,
                duration: 0.85,
                ease: 'power4.out', // Smooth, long deceleration curve with no sudden stop
                onComplete: () => {
                    gsap.set(container, { height: 'auto', overflow: 'visible' });
                }
            }, 0);
            // Text flows up word-by-word, slightly staggered
            tl.to(wordsRef.current, {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                duration: 0.4,
                stagger: 0.04,
                ease: 'power3.out', // Smooth taper off
            }, 0.15); // Starts as the container begins opening
            // Footer buttons pop up in a distinct one-by-one sequence, blending into the text's flow
            tl.to(footerElements, {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                duration: 0.5,
                stagger: 0.15, // Highly pronounced sequential reveal (Attach -> Deep thinking -> Send)
                ease: 'power3.out', // Smooth deceleration with no abrupt bounce/jerk
            }, 0.5); // Starts exactly when the container is open enough
        }, containerRef); // Scope to container for cleanup
        return () => ctx.revert();
    }, []);
    return (<div className="flex items-center justify-center w-full h-full min-h-[400px] p-8 bg-[#030303] rounded-2xl">
      <AnimatedBorder className="w-full max-w-2xl" {...props}>
        <div ref={containerRef} className="flex flex-col p-4 w-full text-left">
          
          {/* Input Text Area Container */}
          <div className="relative w-full min-h-[30px] flex-shrink-0">
            {/* Fake Placeholder Overlay for Animation */}
            {!inputValue && (<div className="absolute top-0 left-0 flex gap-1.5 pointer-events-none text-lg text-zinc-500 font-medium">
                {placeholderWords.map((word, i) => (<span key={i} ref={(el) => {
                    wordsRef.current[i] = el;
                }} style={{ opacity: 0 }} className="inline-block">
                    {word}
                  </span>))}
              </div>)}
            
            <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={inputValue ? '' : ' '} // Space keeps height logic but hides native placeholder
     className="w-full bg-transparent border-0 outline-none resize-none text-white text-lg min-h-[70px] focus:ring-0 focus:outline-none placeholder-zinc-500"/>
          </div>

          {/* Action Footer */}
          <div ref={footerRef} className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04]">
            {/* Left buttons (Attach, Deep Thinking) */}
            <div className="flex items-center gap-2">
              <button style={{ opacity: 0 }} className="footer-anim-item flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] hover:bg-white/[0.08] active:bg-white/[0.12] text-zinc-400 hover:text-white rounded-full text-xs font-medium border border-white/[0.05] transition-all cursor-pointer">
                <Paperclip className="w-3.5 h-3.5"/>
                <span>Attach files</span>
              </button>

              <button style={{ opacity: 0 }} className="footer-anim-item flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] hover:bg-white/[0.08] active:bg-white/[0.12] text-zinc-400 hover:text-white rounded-full text-xs font-medium border border-white/[0.05] transition-all cursor-pointer">
                <Brain className="w-3.5 h-3.5 text-blue-400"/>
                <span>Deep thinking</span>
                <ChevronDown className="w-3 h-3 text-zinc-500"/>
              </button>
            </div>

            {/* Right button (Send) */}
            <div>
              <button style={{ opacity: 0 }} className={`footer-anim-item flex items-center justify-center w-8 h-8 rounded-full transition-all cursor-pointer ${inputValue.trim()
            ? 'bg-white text-black hover:scale-105 active:scale-95'
            : 'bg-white/[0.06] text-zinc-500 border border-white/[0.05]'}`} aria-label="Send message" disabled={!inputValue.trim()}>
                <Send className="w-3.5 h-3.5"/>
              </button>
            </div>
          </div>
        </div>
      </AnimatedBorder>
    </div>);
}
