"use client";
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './PixelifyText.module.css';
/**
 * PixelifyText Component
 * A professional pixel-style text animation.
 * Reconstructs text from individual pixels with a high-end digital effect.
 */
const PixelifyText = ({ text = "PIXEL ART", gridSize = 4, color = "#000000ff", fontSize = 120, fontFamily = "Inter, system-ui, sans-serif", delay = 0, duration = 1.5, stagger = 0.0005, className = "" }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    useEffect(() => {
        let animationFrame;
        let timeline;
        const init = async () => {
            // Ensure fonts are loaded before sampling
            await document.fonts.ready;
            const canvas = canvasRef.current;
            if (!canvas)
                return;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx)
                return;
            const dpr = window.devicePixelRatio || 1;
            // Calculate text dimensions
            ctx.font = `900 ${fontSize}px ${fontFamily}`;
            const metrics = ctx.measureText(text);
            const textWidth = Math.ceil(metrics.width) + 20;
            const textHeight = fontSize * 1.4;
            // Update canvas size to match text
            canvas.width = textWidth * dpr;
            canvas.height = textHeight * dpr;
            canvas.style.width = `${textWidth}px`;
            canvas.style.height = `${textHeight}px`;
            ctx.scale(dpr, dpr);
            // Draw text for sampling
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'white'; // Sample in white for best contrast
            ctx.font = `900 ${fontSize}px ${fontFamily}`;
            ctx.fillText(text, textWidth / 2, textHeight / 2);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            const activePixels = [];
            // Sample pixels
            for (let y = 0; y < canvas.height; y += gridSize * dpr) {
                for (let x = 0; x < canvas.width; x += gridSize * dpr) {
                    const index = (Math.floor(y) * canvas.width + Math.floor(x)) * 4;
                    if (imageData[index + 3] > 128) {
                        const logicalX = x / dpr;
                        const logicalY = y / dpr;
                        activePixels.push({
                            x: logicalX + (Math.random() - 0.5) * 20, // Start with slight offset
                            y: logicalY + (Math.random() - 0.5) * 20,
                            targetX: logicalX,
                            targetY: logicalY,
                            alpha: 0,
                            scale: 0
                        });
                    }
                }
            }
            ctx.clearRect(0, 0, textWidth, textHeight);
            // Shuffle for organic reveal
            for (let i = activePixels.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [activePixels[i], activePixels[j]] = [activePixels[j], activePixels[i]];
            }
            // 3. GSAP Animation - "Stochastic Pop" Effect
            timeline = gsap.timeline({ delay });
            activePixels.forEach((p) => {
                // Each pixel gets a completely unique random delay for a "noise" effect
                const pixelDelay = Math.random() * duration;
                timeline.to(p, {
                    alpha: 1,
                    scale: 1,
                    x: p.targetX,
                    y: p.targetY,
                    duration: 0.3 + Math.random() * 0.4,
                    delay: pixelDelay,
                    ease: "back.out(3)",
                    onStart: () => {
                        // Optional: trigger a small "flash" or "glitch" state if needed
                    }
                }, 0); // All started at absolute 0 with their own delay
            });
            // Render Loop
            const render = () => {
                ctx.clearRect(0, 0, textWidth, textHeight);
                // 1. Draw Connections (Constellation/Web Effect)
                ctx.beginPath();
                ctx.strokeStyle = color;
                ctx.lineWidth = 0.8;
                const maxDistSq = (gridSize * 3) ** 2;
                for (let i = 0; i < activePixels.length; i++) {
                    const p1 = activePixels[i];
                    if (p1.alpha < 0.1)
                        continue;
                    // Connect to a small window of neighboring pixels in the array
                    // Since the array is shuffled, this creates random but stable links
                    const searchRange = 15;
                    for (let j = i + 1; j < Math.min(i + searchRange, activePixels.length); j++) {
                        const p2 = activePixels[j];
                        if (p2.alpha < 0.1)
                            continue;
                        const dx = p1.x - p2.x;
                        const dy = p1.y - p2.y;
                        const distSq = dx * dx + dy * dy;
                        if (distSq < maxDistSq) {
                            const alpha = Math.min(p1.alpha, p2.alpha) * 0.4;
                            ctx.globalAlpha = alpha;
                            ctx.moveTo(p1.x, p1.y);
                            ctx.lineTo(p2.x, p2.y);
                        }
                    }
                }
                ctx.stroke();
                // 2. Draw Pixels
                ctx.fillStyle = color;
                for (let i = 0; i < activePixels.length; i++) {
                    const p = activePixels[i];
                    if (p.alpha > 0.01) {
                        ctx.globalAlpha = p.alpha;
                        const size = (gridSize - 0.5) * p.scale;
                        ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
                    }
                }
                animationFrame = requestAnimationFrame(render);
            };
            render();
        };
        init();
        return () => {
            if (animationFrame)
                cancelAnimationFrame(animationFrame);
            if (timeline)
                timeline.kill();
        };
    }, [text, gridSize, color, fontSize, fontFamily, delay, duration]);
    return (<div ref={containerRef} className={`${styles.container} ${className}`}>
            <canvas ref={canvasRef} className={styles.canvas}/>
        </div>);
};
export default PixelifyText;
