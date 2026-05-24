'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './HalftoneEyes.module.css';

// Preset themes for easy premium styling
export type HalftoneEyesTheme = 'crimson' | 'sapphire' | 'emerald' | 'amethyst' | 'amber' | 'cyanide' | 'custom';

export interface HalftoneEyesProps {
  /** Width and height of each eye canvas (px) */
  eyeSize?: number;
  /** Spacing between halftone dots (px) */
  gridSpacing?: number;
  /** Maximum offset the pupil/iris can move from center (px) */
  maxOffset?: number;
  /** Smoothness of movement lag (0.01 - 1) */
  lerpSpeed?: number;
  /** Preset theme name for colors */
  theme?: HalftoneEyesTheme;
  /** Hex color of the iris (active when theme is 'custom') */
  irisColor?: string;
  /** Hex color of the sclera (active when theme is 'custom') */
  scleraColor?: string;
  /** Radius of the pupil hole (px) */
  pupilRadius?: number;
  /** Radius of the iris circle (px) */
  irisRadius?: number;
  /** Radius of the sclera circle (px) */
  scleraRadius?: number;
  /** Background void color of the canvas */
  backgroundColor?: string;
  /** Distance between the two eyes (px) */
  eyeDistance?: number;
  /** Enable organic micro-movements when cursor is idle */
  ambientDrift?: boolean;
  /** Additional CSS class for the container */
  className?: string;
}

const THEME_COLORS = {
  crimson: { iris: '#ff3344', sclera: '#fdfaf6' },
  sapphire: { iris: '#3b82f6', sclera: '#eff6ff' },
  emerald: { iris: '#10b981', sclera: '#ecfdf5' },
  amethyst: { iris: '#a855f7', sclera: '#faf5ff' },
  amber: { iris: '#f59e0b', sclera: '#fffbeb' },
  cyanide: { iris: '#06b6d4', sclera: '#f0fdfa' },
  custom: { iris: '#3b82f6', sclera: '#fdfaf6' },
};

const HalftoneEyes: React.FC<HalftoneEyesProps> = ({
  eyeSize = 220,
  gridSpacing = 8,
  maxOffset = 35,
  lerpSpeed = 0.08,
  theme = 'sapphire',
  irisColor = '#3b82f6',
  scleraColor = '#fdfaf6',
  pupilRadius = 32,
  irisRadius = 65,
  scleraRadius = 100,
  backgroundColor = '#000000',
  eyeDistance = 40,
  ambientDrift = true,
  className = '',
}) => {
  const leftCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mouse coordinate tracking
  const mouseRef = useRef({ x: 0, y: 0 });
  const hasMouseMovedRef = useRef(false);
  const lastInteractionTimeRef = useRef(Date.now());

  // Detect which prop was changed most recently by the user
  const prevThemeRef = useRef(theme);
  const prevIrisRef = useRef(irisColor);
  const prevScleraRef = useRef(scleraColor);
  const [activeMode, setActiveMode] = useState<'theme' | 'custom'>('theme');

  useEffect(() => {
    if (theme !== prevThemeRef.current) {
      setActiveMode('theme');
      prevThemeRef.current = theme;
    }
  }, [theme]);

  useEffect(() => {
    if (irisColor !== prevIrisRef.current || scleraColor !== prevScleraRef.current) {
      setActiveMode('custom');
      prevIrisRef.current = irisColor;
      prevScleraRef.current = scleraColor;
    }
  }, [irisColor, scleraColor]);

  // Determine active colors based on mode
  const colors = activeMode === 'custom'
    ? { iris: irisColor, sclera: scleraColor }
    : THEME_COLORS[theme] || THEME_COLORS.sapphire;


  // Track the mouse coordinates globally
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      hasMouseMovedRef.current = true;
      lastInteractionTimeRef.current = Date.now();
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const leftCanvas = leftCanvasRef.current;
    const rightCanvas = rightCanvasRef.current;
    if (!leftCanvas || !rightCanvas) return;

    const leftCtx = leftCanvas.getContext('2d');
    const rightCtx = rightCanvas.getContext('2d');
    if (!leftCtx || !rightCtx) return;

    let animationFrameId: number;

    // Track smooth, interpolated position for each eye's gaze
    const leftGaze = { cx: 0, cy: 0 };
    const rightGaze = { cx: 0, cy: 0 };

    // Saccadic movement counters
    let saccadeX = 0;
    let saccadeY = 0;
    let nextSaccadeTime = 0;

    // Helper: smoothstep function
    const smoothstep = (min: number, max: number, value: number): number => {
      const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
      return x * x * (3 - 2 * x);
    };

    const drawEye = (
      ctx: CanvasRenderingContext2D,
      canvas: HTMLCanvasElement,
      gaze: { cx: number; cy: number }
    ) => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear with background color
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Restrict calculation limits to the bounding box of the sclera to optimize draw time
      const startX = Math.max(0, Math.floor((cx - scleraRadius) / gridSpacing) * gridSpacing);
      const endX = Math.min(width, Math.ceil((cx + scleraRadius) / gridSpacing) * gridSpacing);
      const startY = Math.max(0, Math.floor((cy - scleraRadius) / gridSpacing) * gridSpacing);
      const endY = Math.min(height, Math.ceil((cy + scleraRadius) / gridSpacing) * gridSpacing);

      // Blending parameters (proportional to grid spacing for visual consistency)
      const wScleraOuter = Math.max(6, gridSpacing * 1.5);
      const wIrisBlend = Math.max(6, gridSpacing * 1.7);
      const wPupilBlend = Math.max(4, gridSpacing * 1.2);

      // Maximum dot radius: slightly larger than half grid spacing to allow merging
      const maxDotRadius = gridSpacing * 0.65;

      for (let x = startX; x <= endX; x += gridSpacing) {
        for (let y = startY; y <= endY; y += gridSpacing) {
          // Distance from eye center (Sclera reference)
          const dxS = x - cx;
          const dyS = y - cy;
          const dS = Math.sqrt(dxS * dxS + dyS * dyS);

          if (dS > scleraRadius) continue;

          // Distance from the shifted iris center
          const dxI = x - (cx + gaze.cx);
          const dyI = y - (cy + gaze.cy);
          const dI = Math.sqrt(dxI * dxI + dyI * dyI);

          // 1. Pupil Mask (0 inside pupil, 1 outside)
          const pupilMask = smoothstep(pupilRadius - wPupilBlend / 2, pupilRadius + wPupilBlend / 2, dI);

          // 2. Iris Intensity (Red ring)
          // Iris reaches maximum density in the middle of its radius boundary
          const rMid = (pupilRadius + irisRadius) / 2;
          const rHalfWidth = (irisRadius - pupilRadius) / 2;
          
          let irisIntensity = 0;
          if (dI > pupilRadius - wPupilBlend && dI < irisRadius + wIrisBlend) {
            const normalizedDist = (dI - rMid) / rHalfWidth; // -1 at boundaries, 0 at midpoint
            irisIntensity = Math.max(0, 1 - normalizedDist * normalizedDist);
          }
          const finalIrisIntensity = irisIntensity * pupilMask;
          const rIris = maxDotRadius * finalIrisIntensity;

          // 3. Sclera Intensity (White area)
          // Fades near outer border of sclera and near the border of the shifted iris
          const scleraOuterFade = smoothstep(scleraRadius, scleraRadius - wScleraOuter, dS);
          const scleraIrisFade = smoothstep(irisRadius - wIrisBlend / 2, irisRadius + wIrisBlend / 2, dI);
          
          const finalScleraIntensity = scleraOuterFade * scleraIrisFade;
          const rSclera = maxDotRadius * finalScleraIntensity;

          // 4. Draw Dot
          if (rIris > rSclera && rIris > 0.3) {
            ctx.beginPath();
            ctx.arc(x, y, rIris, 0, Math.PI * 2);
            ctx.fillStyle = colors.iris;
            ctx.fill();
          } else if (rSclera > 0.3) {
            ctx.beginPath();
            ctx.arc(x, y, rSclera, 0, Math.PI * 2);
            ctx.fillStyle = colors.sclera;
            ctx.fill();
          }
        }
      }
    };

    const updateGaze = (
      canvas: HTMLCanvasElement,
      gaze: { cx: number; cy: number },
      time: number
    ) => {
      const rect = canvas.getBoundingClientRect();
      // Center of the canvas on the viewport screen
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;

      let targetX = 0;
      let targetY = 0;

      const idleDuration = Date.now() - lastInteractionTimeRef.current;
      const isIdle = !hasMouseMovedRef.current || (ambientDrift && idleDuration > 3000);

      if (isIdle) {
        // Trigger a new micro-saccade periodically
        if (time > nextSaccadeTime) {
          // Rapid jump (saccade) every 1.5 to 4.5 seconds
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * 8; // Small saccadic amplitude
          saccadeX = Math.cos(angle) * distance;
          saccadeY = Math.sin(angle) * distance;
          
          nextSaccadeTime = time + 1500 + Math.random() * 3000;
        }

        // Slow breathing/drifting noise overlayed on the saccade offset
        const driftX = Math.sin(time * 0.001) * 3 + Math.cos(time * 0.003) * 1.5;
        const driftY = Math.cos(time * 0.0012) * 3 + Math.sin(time * 0.0025) * 1.5;

        targetX = saccadeX + driftX;
        targetY = saccadeY + driftY;
      } else {
        // Track active cursor position relative to eye center
        const dx = mouseRef.current.x - eyeCenterX;
        const dy = mouseRef.current.y - eyeCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0.1) {
          // Organic gaze distance curve (shifts faster initially, asymptotes smoothly to maxOffset)
          // formula: maxOffset * (distance / sqrt(distance^2 + scale_factor^2))
          const scaleFactor = 150; // controls how steep the looking is
          const gazeOffsetMagnitude = maxOffset * (distance / Math.sqrt(distance * distance + scaleFactor * scaleFactor));
          
          targetX = (dx / distance) * gazeOffsetMagnitude;
          targetY = (dy / distance) * gazeOffsetMagnitude;
        }
      }

      // Linear interpolation (lerp) for smooth muscle movement delay
      gaze.cx += (targetX - gaze.cx) * lerpSpeed;
      gaze.cy += (targetY - gaze.cy) * lerpSpeed;
    };

    const loop = (timestamp: number) => {
      // 1. Update eye state positions
      updateGaze(leftCanvas, leftGaze, timestamp);
      updateGaze(rightCanvas, rightGaze, timestamp);

      // 2. Render each eye
      drawEye(leftCtx, leftCanvas, leftGaze);
      drawEye(rightCtx, rightCanvas, rightGaze);

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    eyeSize,
    gridSpacing,
    maxOffset,
    lerpSpeed,
    colors,
    pupilRadius,
    irisRadius,
    scleraRadius,
    backgroundColor,
    ambientDrift,
  ]);

  return (
    <div className={`${styles.container} ${className}`}>
      <div 
        className={styles.eyesWrapper} 
        style={{ gap: `${eyeDistance}px` }}
      >
        <canvas
          ref={leftCanvasRef}
          width={eyeSize}
          height={eyeSize}
          className={styles.eyeCanvas}
          style={{ width: `${eyeSize}px`, height: `${eyeSize}px` }}
        />
        <canvas
          ref={rightCanvasRef}
          width={eyeSize}
          height={eyeSize}
          className={styles.eyeCanvas}
          style={{ width: `${eyeSize}px`, height: `${eyeSize}px` }}
        />
      </div>
    </div>
  );
};

export default HalftoneEyes;
