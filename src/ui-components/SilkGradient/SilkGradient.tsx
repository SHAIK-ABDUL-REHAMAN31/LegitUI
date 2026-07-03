"use client";

import { useEffect, useRef } from "react";
import styles from "./SilkGradient.module.css";

/* ─── Vertex Shader ─── */
const VERT = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

/* ─── Fragment Shader ─── */
const FRAG = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec2  uResolution;
uniform vec3  uColorTop;
uniform vec3  uColorBottom;
uniform vec3  uColorAccent;
uniform vec3  uBackground;
uniform float uSpeed;
uniform float uIntensity;
uniform float uSpread;

varying vec2 vUv;

// Generic pseudo-random function
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

// Value noise
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// Fractional Brownian Motion
#define OCTAVES 5
float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    vec2 p = vUv;
    float t = uTime * uSpeed * 0.4;

    // Domain warping technique
    vec2 q = vec2(0.0);
    q.x = fbm(p + vec2(0.0, 0.0) + t * 0.5);
    q.y = fbm(p + vec2(5.2, 1.3) - t * 0.4);

    vec2 r = vec2(0.0);
    r.x = fbm(p + 2.0 * q + vec2(1.7, 9.2) + t * 0.6);
    r.y = fbm(p + 2.0 * q + vec2(8.3, 2.8) + t * 0.3);

    float f = fbm(p + 3.0 * r);

    // Color mixing based on the noise fields
    vec3 col = uBackground;
    
    // Mix bottom color based on overall noise
    col = mix(col, uColorBottom, clamp(f * uSpread * 2.0, 0.0, 1.0));
    
    // Mix top color based on warped domain
    col = mix(col, uColorTop, clamp(length(q) * uSpread * 1.5, 0.0, 1.0));
    
    // Add accent color in the ridges
    col = mix(col, uColorAccent, clamp(r.x * r.y * uIntensity * 3.0, 0.0, 1.0));
    
    // Add silky glossy reflections (specular-like folds)
    float fold = smoothstep(0.4, 0.5, fbm(p + r * 2.0 + t));
    col += uColorAccent * fold * (uIntensity * 0.5);

    // Global brightness / intensity scaling
    col *= 0.5 + 0.5 * uIntensity;

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

const hexToVec3 = (hex: string): [number, number, number] => {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const n = parseInt(c, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export interface SilkGradientProps {
  className?: string;
  background?: string;
  colorTop?: string;
  colorBottom?: string;
  colorAccent?: string;
  speed?: number;
  intensity?: number;
  spread?: number;
  children?: React.ReactNode;
}

export default function SilkGradient({
  className = "",
  background = "#020617",
  colorTop = "#1e40af",
  colorBottom = "#0c4a6e",
  colorAccent = "#38bdf8",
  speed = 0.35,
  intensity = 0.9,
  spread = 0.65,
  children,
}: SilkGradientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const programRef = useRef<any>(null);
  
  // Store all current prop values in a ref for the frame loop
  const uniformsRef = useRef({
    background,
    colorTop,
    colorBottom,
    colorAccent,
    speed,
    intensity,
    spread,
  });

  // Keep ref in sync with latest props
  useEffect(() => {
    uniformsRef.current = {
      background,
      colorTop,
      colorBottom,
      colorAccent,
      speed,
      intensity,
      spread,
    };
  }, [background, colorTop, colorBottom, colorAccent, speed, intensity, spread]);

  useEffect(() => {
    let renderer: any, mesh: any, startTime: number;
    let ro: ResizeObserver;

    async function init() {
      const { Renderer, Program, Mesh, Triangle } = await import("ogl");
      const canvas = canvasRef.current;
      if (!canvas) return;

      renderer = new Renderer({
        canvas,
        alpha: false,
        antialias: true,
        dpr: Math.min(window.devicePixelRatio, 2),
      });
      const gl = renderer.gl;

      const geometry = new Triangle(gl);
      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uTime:        { value: 0 },
          uResolution:  { value: [canvas.width, canvas.height] },
          uBackground:  { value: hexToVec3(uniformsRef.current.background) },
          uColorTop:    { value: hexToVec3(uniformsRef.current.colorTop) },
          uColorBottom: { value: hexToVec3(uniformsRef.current.colorBottom) },
          uColorAccent: { value: hexToVec3(uniformsRef.current.colorAccent) },
          uSpeed:       { value: uniformsRef.current.speed },
          uIntensity:   { value: uniformsRef.current.intensity },
          uSpread:      { value: uniformsRef.current.spread },
        },
      });
      programRef.current = program;
      mesh = new Mesh(gl, { geometry, program });

      ro = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          const { width, height } = entry.contentRect;
          renderer.setSize(width, height);
          program.uniforms.uResolution.value = [width * renderer.dpr, height * renderer.dpr];
        }
      });
      if (canvas.parentElement) ro.observe(canvas.parentElement);

      startTime = performance.now();

      function frame(now: number) {
        rafRef.current = requestAnimationFrame(frame);
        
        // APPLY LATEST PROPS FROM REF EVERY FRAME
        const u = program.uniforms;
        const cur = uniformsRef.current;
        
        u.uTime.value = (now - startTime) * 0.001;
        u.uBackground.value = hexToVec3(cur.background);
        u.uColorTop.value = hexToVec3(cur.colorTop);
        u.uColorBottom.value = hexToVec3(cur.colorBottom);
        u.uColorAccent.value = hexToVec3(cur.colorAccent);
        u.uSpeed.value = cur.speed;
        u.uIntensity.value = cur.intensity;
        u.uSpread.value = cur.spread;

        renderer.render({ scene: mesh });
      }
      rafRef.current = requestAnimationFrame(frame);
    }

    init();

    return () => {
      if (ro) ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (renderer) renderer.gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <canvas ref={canvasRef} className={styles.canvas} />
      {children && <div className={styles.content}>{children}</div>}
    </div>
  );
}
