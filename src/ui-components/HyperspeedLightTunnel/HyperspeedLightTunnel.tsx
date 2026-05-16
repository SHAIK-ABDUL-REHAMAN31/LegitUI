"use client";

import { useEffect, useRef } from "react";
import styles from "./HyperspeedLightTunnel.module.css";

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
uniform vec3  uStreakColor1;
uniform vec3  uStreakColor2;
uniform vec3  uStreakColor3;
uniform vec3  uCoreColor;
uniform vec3  uBackground;
uniform float uSpeed;
uniform float uDensity;
uniform float uCurve;

varying vec2 vUv;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
        v += a * noise(p);
        p *= 2.0;
        a *= 0.5;
    }
    return v;
}

void main() {
    vec2 uv = vUv;
    float t = uTime * uSpeed;
    
    // Focal point on the right
    vec2 focus = vec2(1.0, 0.5);
    
    float distX = focus.x - uv.x;
    float distY = uv.y - focus.y;
    
    // Prevent division by zero
    float x = max(distX, 0.001);
    
    // Funnel curve mapping!
    // pow(x, 1.5) ensures the lines curve smoothly and become perfectly horizontal at the focus (x=0)
    float curve = pow(x, 1.5);
    float rayY = distY / curve;
    float rayX = 1.0 / x - t * 2.0;
    
    // Pack many thin lines into the visible funnel space
    vec2 rayUv = vec2(rayX * 0.02, rayY * 30.0);
    
    // 1. Pink Rays (Main)
    float val1 = fbm(vec2(rayUv.x, rayUv.y));
    float pinkCore = smoothstep(0.65, 0.75, val1);
    float pinkGlow = smoothstep(0.4, 0.8, val1);
    float streak1 = pinkCore * 2.0 + pinkGlow * 0.6;
    
    // 2. Violet Rays (Denser)
    float val2 = fbm(vec2(rayUv.x + t * 0.01, rayUv.y * 1.5 + 10.0));
    float violetCore = smoothstep(0.7, 0.8, val2);
    float violetGlow = smoothstep(0.5, 0.85, val2);
    float streak2 = violetCore * 2.0 + violetGlow * 0.6;
    
    // 3. Cyan Rays (Thinner, sharp)
    float val3 = fbm(vec2(rayUv.x * 2.0 + t * 0.02, rayUv.y * 2.5 + 20.0));
    float cyanCore = smoothstep(0.75, 0.85, val3);
    float cyanGlow = smoothstep(0.6, 0.9, val3);
    float streak3 = cyanCore * 2.5 + cyanGlow * 0.5;
    
    // 4. Orange/Gold focal bursts
    float val4 = fbm(vec2(rayUv.x * 3.0 - t * 0.01, rayUv.y * 3.0 + 30.0));
    float orangeCore = smoothstep(0.75, 0.85, val4);
    float orangeGlow = smoothstep(0.6, 0.9, val4);
    float streak4 = orangeCore * 2.5 + orangeGlow * 0.5;
    
    // Color composition
    vec3 col = uBackground;
    
    // Add the discrete curved lines
    col += uColor1 * streak1;
    col += uColor2 * streak2;
    col += uColor3 * streak3;
    col += uColor4 * streak4;
    
    // Straight central glowing beam
    float beamThickness = x * 0.02 + 0.001; // Sleek and slim
    float beamDist = abs(distY);
    float beamCore = exp(-beamDist / (beamThickness * 0.2));
    float beamPink = exp(-beamDist / (beamThickness * 0.8));
    float beamCyan = exp(-beamDist / (beamThickness * 1.5));
    
    // Pulse the beam along X
    float beamPulse = smoothstep(0.3, 0.7, noise(vec2(rayX * 0.05 - t, 0.0)));
    
    col += uColor1 * beamPink * (0.5 + 0.5 * beamPulse);
    col += uColor3 * beamCyan * (0.3 + 0.7 * beamPulse);
    col += vec3(1.0) * beamCore * (0.8 + 0.5 * beamPulse) * 1.5;
    
    // Central glowing core at the focal point
    float coreDist = length(vec2(distX, distY * 2.0)); // Oval core
    float core = exp(-coreDist * 10.0);
    col += uColor4 * core * 2.0; // Bright orange core
    col += vec3(1.0) * core * 1.0; // White hot center
    
    // *CRITICAL FIX*: Fade out vertically exactly at the screen corners!
    // rayY = 0.5 corresponds EXACTLY to the top-left and bottom-left corners.
    // A sharp crop from 0.48 to 0.52 ensures lines fill the edge but don't leak out.
    float verticalFade = smoothstep(0.52, 0.45, abs(rayY));
    col *= verticalFade;
    
    // Subtle vignette to frame the scene
    float v = 1.0 - dot(uv - 0.5, uv - 0.5) * 1.2;
    col *= clamp(v, 0.0, 1.0);
    
    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

const hexToVec3 = (hex: string): [number, number, number] => {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const n = parseInt(c, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export interface HyperspeedLightTunnelProps {
  className?: string;
  background?: string;
  color1?: string;   // Pink
  color2?: string;   // Violet
  color3?: string;   // Cyan
  color4?: string;   // Orange
  speed?: number;
  children?: React.ReactNode;
}

export default function HyperspeedLightTunnel({
  className = "",
  background = "#05000a",
  color1 = "#ff007f",
  color2 = "#7000ff",
  color3 = "#00f0ff",
  color4 = "#ffaa00",
  speed = 1.5,
  children,
}: HyperspeedLightTunnelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const programRef = useRef<any>(null);

  const uniformsRef = useRef({
    background, color1, color2, color3, color4, speed,
  });

  useEffect(() => {
    uniformsRef.current = {
      background, color1, color2, color3, color4, speed,
    };
  }, [background, color1, color2, color3, color4, speed]);

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
          uColor1:      { value: hexToVec3(uniformsRef.current.color1) },
          uColor2:      { value: hexToVec3(uniformsRef.current.color2) },
          uColor3:      { value: hexToVec3(uniformsRef.current.color3) },
          uColor4:      { value: hexToVec3(uniformsRef.current.color4) },
          uSpeed:       { value: uniformsRef.current.speed },
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

        const u = program.uniforms;
        const cur = uniformsRef.current;

        u.uTime.value = (now - startTime) * 0.001;
        u.uBackground.value = hexToVec3(cur.background);
        u.uColor1.value = hexToVec3(cur.color1);
        u.uColor2.value = hexToVec3(cur.color2);
        u.uColor3.value = hexToVec3(cur.color3);
        u.uColor4.value = hexToVec3(cur.color4);
        u.uSpeed.value = cur.speed;

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
