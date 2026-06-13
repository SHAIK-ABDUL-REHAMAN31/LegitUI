'use client';

import React, { useEffect, useRef } from 'react';
import styles from './PixelBackground.module.css';

// ── PERLIN NOISE 2D GENERATOR ──
// Self-contained permutation table and gradient noise solver.
const permutation = [
  151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
  190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,
  136,171,168, 68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,
  55,46,245,40,244,102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
  135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,
  212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,
  167, 43,172,9,129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,251,34,242,193,238,
  210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,
  50,45,127, 4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
];
const p = new Array(512);
for (let i = 0; i < 256; i++) p[i] = p[i + 256] = permutation[i];

function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(t: number, a: number, b: number) { return a + t * (b - a); }

const grad2 = [
  {x:1, y:1}, {x:-1, y:1}, {x:1, y:-1}, {x:-1, y:-1},
  {x:1, y:0}, {x:-1, y:0}, {x:0, y:1}, {x:0, y:-1}
];
function grad(hash: number, x: number, y: number) {
  const g = grad2[hash % 8];
  return g.x * x + g.y * y;
}

function noise2D(x: number, y: number): number {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  x -= Math.floor(x);
  y -= Math.floor(y);
  const u = fade(x);
  const v = fade(y);
  const A = p[X] + Y;
  const B = p[X + 1] + Y;
  return lerp(v, lerp(u, grad(p[A], x, y), grad(p[B], x - 1, y)),
                 lerp(u, grad(p[A + 1], x, y - 1), grad(p[B + 1], x - 1, y - 1)));
}

// ── TYPE DEFINITIONS ──
interface PixelBackgroundProps {
  /** The content of the component */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Space between pixels in the grid (px) @default 14 */
  gridSpacing?: number;
  /** Base pixel size (px) @default 1.5 */
  dotSize?: number;
  /** Highlight pixel size (px) @default 3 */
  activeDotSize?: number;
  /** Radius of influence around cursor (px) @default 130 */
  interactionRadius?: number;
  /** Displacement force multiplier @default 0.45 */
  pushStrength?: number;
  /** Spring restoring tension coefficient @default 0.025 */
  springTension?: number;
  /** Friction/Damping coefficient (0-1) @default 0.86 */
  damping?: number;
  /** Procedural noise frequency/scale @default 0.006 */
  noiseScale?: number;
  /** Procedural noise morphing speed @default 0.015 */
  noiseSpeed?: number;
  /** Custom base dot color (rgba) @default "rgba(255, 255, 255, 0.08)" */
  dotColor?: string;
  /** Custom highlight dot color (rgba) @default "rgba(255, 255, 255, 0.85)" */
  activeDotColor?: string;
  /** Enable mouse trail pixel particles @default true */
  enableTrail?: boolean;
  /** Custom trail dot color (rgba) @default "rgba(255, 255, 255, 0.9)" */
  trailColor?: string;
  /** Radius around cursor where grid pixels light up (px) @default 60 */
  hoverActiveRadius?: number;
}

interface GridParticle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  noiseOffset: number;
}

interface TrailParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
}

const PixelBackground: React.FC<PixelBackgroundProps> = ({
  children,
  className = '',
  gridSpacing = 14,
  dotSize = 1.5,
  activeDotSize = 3,
  interactionRadius = 130,
  pushStrength = 0.45,
  springTension = 0.025,
  damping = 0.86,
  noiseScale = 0.006,
  noiseSpeed = 0.002, // Calm, premium default speed
  dotColor = 'rgba(255, 255, 255, 0.08)',
  activeDotColor = 'rgba(255, 255, 255, 0.85)',
  enableTrail = true,
  trailColor = 'rgba(255, 255, 255, 0.9)',
  hoverActiveRadius = 60, // Light up grid pixels near cursor
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<{ x: number; y: number; px: number; py: number }>({
    x: -1000,
    y: -1000,
    px: -1000,
    py: -1000,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: GridParticle[] = [];
    let trailParticles: TrailParticle[] = [];
    let animationFrameId: number;
    let time = 0;

    // Resize canvas and populate particles
    const initGrid = () => {
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      particles = [];
      const cols = Math.ceil(width / gridSpacing);
      const rows = Math.ceil(height / gridSpacing);

      // Distribute grid particles
      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const px = c * gridSpacing;
          const py = r * gridSpacing;
          particles.push({
            x: px,
            y: py,
            targetX: px,
            targetY: py,
            vx: 0,
            vy: 0,
            size: dotSize,
            alpha: 0.08,
            noiseOffset: Math.random() * 1000,
          });
        }
      }
    };

    initGrid();

    // Mouse movement listener
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      mouseRef.current.px = mouseRef.current.x;
      mouseRef.current.py = mouseRef.current.y;
      mouseRef.current.x = mx;
      mouseRef.current.y = my;

      // Spawn trail particles if moving and enabled
      if (enableTrail && mouseRef.current.px !== -1000) {
        const dx = mx - mouseRef.current.px;
        const dy = my - mouseRef.current.py;
        const speed = Math.hypot(dx, dy);

        if (speed > 1) {
          const spawnCount = Math.min(Math.floor(speed / 3) + 1, 4);
          for (let i = 0; i < spawnCount; i++) {
            // Interpolate position between last and current frame for a smoother trail
            const ratio = i / spawnCount;
            const px = mouseRef.current.px + dx * ratio;
            const py = mouseRef.current.py + dy * ratio;

            // Random scatter
            const angle = Math.random() * Math.PI * 2;
            const pSpeed = Math.random() * 2 + 0.5;

            trailParticles.push({
              x: px,
              y: py,
              vx: Math.cos(angle) * pSpeed + dx * 0.1,
              vy: Math.sin(angle) * pSpeed + dy * 0.1,
              size: Math.random() * 3 + 2,
              alpha: 1.0,
              decay: Math.random() * 0.03 + 0.02,
              color: trailColor,
            });
          }
        }
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000, px: -1000, py: -1000 };
    };

    // Touch event support
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const rect = container.getBoundingClientRect();
      const mx = e.touches[0].clientX - rect.left;
      const my = e.touches[0].clientY - rect.top;

      mouseRef.current.px = mouseRef.current.x;
      mouseRef.current.py = mouseRef.current.y;
      mouseRef.current.x = mx;
      mouseRef.current.y = my;

      if (enableTrail && mouseRef.current.px !== -1000) {
        const dx = mx - mouseRef.current.px;
        const dy = my - mouseRef.current.py;
        const speed = Math.hypot(dx, dy);

        if (speed > 1) {
          const spawnCount = Math.min(Math.floor(speed / 3) + 1, 3);
          for (let i = 0; i < spawnCount; i++) {
            const ratio = i / spawnCount;
            const px = mouseRef.current.px + dx * ratio;
            const py = mouseRef.current.py + dy * ratio;
            const angle = Math.random() * Math.PI * 2;
            const pSpeed = Math.random() * 1.5 + 0.5;

            trailParticles.push({
              x: px,
              y: py,
              vx: Math.cos(angle) * pSpeed + dx * 0.08,
              vy: Math.sin(angle) * pSpeed + dy * 0.08,
              size: Math.random() * 2.5 + 1.5,
              alpha: 1.0,
              decay: Math.random() * 0.04 + 0.03,
              color: trailColor,
            });
          }
        }
      }
    };

    // Listeners
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('touchmove', handleTouchMove);
    container.addEventListener('touchend', handleMouseLeave);

    const resizeObserver = new ResizeObserver(() => {
      initGrid();
    });
    resizeObserver.observe(container);

    // Render loop
    const render = () => {
      const rect = container.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      time += noiseSpeed;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // 1. Draw Custom Hover Glow Effect (Vignette behind mouse)
      if (mx !== -1000) {
        const glowRad = interactionRadius * 1.5;
        const gradBg = ctx.createRadialGradient(mx, my, 0, mx, my, glowRad);
        // Extract base purple/indigo shade or glow effect
        gradBg.addColorStop(0, 'rgba(139, 92, 246, 0.12)');
        gradBg.addColorStop(0.5, 'rgba(139, 92, 246, 0.03)');
        gradBg.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradBg;
        ctx.fillRect(0, 0, rect.width, rect.height);
      }

      // 2. Draw & Update Grid Particles
      particles.forEach((p) => {
        let isCursorActive = false;

        // Physics Solver: elastic displacement
        if (mx !== -1000) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const dist = Math.hypot(dx, dy);

          if (dist < interactionRadius && dist > 0) {
            // Repulsion strength scales quadratically close to cursor
            const force = (interactionRadius - dist) / interactionRadius;
            const angle = Math.atan2(dy, dx);
            const strength = force * force * pushStrength * 10;
            p.vx += Math.cos(angle) * strength;
            p.vy += Math.sin(angle) * strength;
          }

          // Active cursor effect: grid pixels light up close to mouse
          if (dist < hoverActiveRadius) {
            isCursorActive = true;
          }
        }

        // Spring pulling back to grid target
        const springX = (p.targetX - p.x) * springTension;
        const springY = (p.targetY - p.y) * springTension;
        p.vx += springX;
        p.vy += springY;

        // Apply friction
        p.vx *= damping;
        p.vy *= damping;

        // Position update
        p.x += p.vx;
        p.y += p.vy;

        // Procedural noise mapping (continent outline logic)
        // Shift lookup window by time to animate / morph continents
        const nx = p.targetX * noiseScale + time;
        const ny = p.targetY * noiseScale + time * 0.7;
        const nVal = noise2D(nx, ny);

        // Twinkle factor
        const twinkle = Math.sin(time * 2 + p.noiseOffset) * 0.02;

        // Check if particle is part of a continent shape or highlighted by cursor
        const isHighlight = nVal > 0.18 || isCursorActive;

        const targetSize = isHighlight ? activeDotSize : dotSize;
        const targetAlpha = isHighlight ? 0.85 : 0.06 + twinkle;

        // Smoothly interpolate size & opacity
        p.size += (targetSize - p.size) * 0.1;
        p.alpha += (targetAlpha - p.alpha) * 0.15;

        // Draw particle
        ctx.fillStyle = isHighlight ? activeDotColor : dotColor;
        ctx.globalAlpha = Math.max(0.01, Math.min(p.alpha, 1.0));

        // Highlight dots drawn slightly rounded or square, base dots sharp squares
        if (isHighlight) {
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        } else {
          ctx.fillRect(p.x - 0.5, p.y - 0.5, 1, 1);
        }
      });

      // 3. Draw & Update Cursor Trail Particles
      trailParticles.forEach((tp, index) => {
        tp.x += tp.vx;
        tp.y += tp.vy;
        tp.alpha -= tp.decay;
        tp.size *= 0.96;

        // Apply light friction & gravity
        tp.vx *= 0.95;
        tp.vy *= 0.95;
        tp.vy += 0.05; // tiny gravity drift

        if (tp.alpha <= 0.01 || tp.size <= 0.1) {
          trailParticles.splice(index, 1);
          return;
        }

        ctx.fillStyle = tp.color;
        ctx.globalAlpha = Math.max(0.01, Math.min(tp.alpha, 1.0));
        ctx.fillRect(tp.x - tp.size / 2, tp.y - tp.size / 2, tp.size, tp.size);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Cleanups
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleMouseLeave);
      resizeObserver.disconnect();
    };
  }, [
    gridSpacing,
    dotSize,
    activeDotSize,
    interactionRadius,
    pushStrength,
    springTension,
    damping,
    noiseScale,
    noiseSpeed,
    dotColor,
    activeDotColor,
    enableTrail,
    trailColor,
    hoverActiveRadius,
  ]);

  return (
    <div ref={containerRef} className={`${styles.root} ${className}`}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.overlay} />
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default PixelBackground;
