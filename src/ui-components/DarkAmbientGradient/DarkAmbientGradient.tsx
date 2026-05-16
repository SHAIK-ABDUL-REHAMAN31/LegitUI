"use client";

import { useEffect, useRef } from "react";
import styles from "./DarkAmbientGradient.module.css";

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

/* ─── Fragment Shader ───
   Dark underwater ambient light v2:
   - Distinct flowing light ribbons against deep black
   - Layered sine-wave bands for emerald, teal, navy, cyan
   - Caustic light rays with sharp falloff
   - Heavy vignette and massive negative space
   - Smooth, slow, cinematic motion
─── */
const FRAG = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec2  uResolution;
uniform vec3  uColor1;
uniform vec3  uColor2;
uniform vec3  uColor3;
uniform vec3  uColor4;
uniform vec3  uBackground;
uniform float uSpeed;
uniform float uIntensity;
uniform float uDistortion;

varying vec2 vUv;

// ── Smooth value noise ──
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0); // quintic interpolation

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// ── 3-octave fbm ──
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

// ── Ribbon: a flowing band of light with sharp edges ──
float ribbon(vec2 uv, float yCenter, float width, float warp, float t, float phase) {
  // Warp the center line with layered sine waves for organic flow
  float wave = yCenter;
  wave += 0.12 * sin(uv.x * 2.5 + t * 0.4 + phase);
  wave += 0.07 * sin(uv.x * 4.8 - t * 0.3 + phase * 1.7);
  wave += 0.04 * sin(uv.x * 8.0 + t * 0.6 + phase * 0.5);
  wave += warp * 0.08 * sin(uv.x * 1.2 - t * 0.15 + phase * 2.3);

  float dist = abs(uv.y - wave);
  // Sharp-edged ribbon with soft glow falloff
  float core = smoothstep(width, width * 0.1, dist);
  float glow = smoothstep(width * 3.5, 0.0, dist) * 0.3;
  return core + glow;
}

void main() {
  vec2 uv = vUv;
  float t = uTime * uSpeed;
  float aspect = uResolution.x / uResolution.y;

  // ── Subtle UV distortion for depth ──
  float warpX = fbm(uv * 2.0 + vec2(t * 0.08, 0.0));
  float warpY = fbm(uv * 2.0 + vec2(0.0, t * 0.06) + 5.0);
  vec2 duv = uv + vec2(warpX - 0.5, warpY - 0.5) * uDistortion * 0.15;

  // ── Ribbon 1: Emerald — sweeping diagonal across center ──
  float r1 = ribbon(duv, 0.45, 0.06, uDistortion, t, 0.0);
  r1 *= uIntensity;

  // ── Ribbon 2: Teal — lower sweep ──
  float r2 = ribbon(duv, 0.3, 0.05, uDistortion, t * 0.8, 2.5);
  r2 *= uIntensity * 0.85;

  // ── Ribbon 3: Navy — broad deep undercurrent ──
  float r3 = ribbon(duv, 0.6, 0.10, uDistortion, t * 0.5, 5.0);
  r3 *= uIntensity * 0.5;

  // ── Ribbon 4: Cyan — thin caustic highlight ──
  float r4 = ribbon(duv, 0.52, 0.025, uDistortion, t * 1.1, 8.0);
  r4 *= uIntensity * 0.7;

  // ── Additional subtle caustic sparkles ──
  float caustic = fbm(duv * 6.0 + vec2(t * 0.2, t * 0.12) + 12.0);
  caustic = pow(smoothstep(0.58, 0.78, caustic), 3.0) * uIntensity * 0.2;

  // ── Compose on deep black ──
  vec3 col = uBackground;
  col += uColor3 * r3;         // Navy broad glow (base layer)
  col += uColor1 * r1;         // Emerald main ribbon
  col += uColor2 * r2;         // Teal secondary ribbon
  col += uColor4 * r4;         // Cyan thin caustic ribbon
  col += uColor4 * caustic;    // Scattered sparkle

  // ── Deep vignette — lots of dark edges ──
  vec2 vig = uv * 2.0 - 1.0;
  vig.x *= aspect;
  float v = 1.0 - dot(vig * 0.45, vig * 0.45);
  v = clamp(v, 0.0, 1.0);
  v = v * v;  // aggressive falloff
  col *= v;

  // ── Subtle breathing ──
  col *= 0.96 + 0.04 * sin(t * 0.6);

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

const hexToVec3 = (hex: string): [number, number, number] => {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const n = parseInt(c, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export interface DarkAmbientGradientProps {
  className?: string;
  background?: string;
  color1?: string;   // emerald
  color2?: string;   // teal
  color3?: string;   // navy
  color4?: string;   // soft cyan
  speed?: number;
  intensity?: number;
  distortion?: number;
  children?: React.ReactNode;
}

export default function DarkAmbientGradient({
  className = "",
  background = "#010008",
  color1 = "#7c3aed",
  color2 = "#db2777",
  color3 = "#2563eb",
  color4 = "#06b6d4",
  speed = 0.25,
  intensity = 0.9,
  distortion = 0.5,
  children,
}: DarkAmbientGradientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const programRef = useRef<any>(null);

  // Store current prop values in a ref for the frame loop
  const uniformsRef = useRef({
    background, color1, color2, color3, color4,
    speed, intensity, distortion,
  });

  // Keep ref in sync with latest props
  useEffect(() => {
    uniformsRef.current = {
      background, color1, color2, color3, color4,
      speed, intensity, distortion,
    };
  }, [background, color1, color2, color3, color4, speed, intensity, distortion]);

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
          uIntensity:   { value: uniformsRef.current.intensity },
          uDistortion:  { value: uniformsRef.current.distortion },
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

        // Apply latest props from ref every frame
        const u = program.uniforms;
        const cur = uniformsRef.current;

        u.uTime.value = (now - startTime) * 0.001;
        u.uBackground.value = hexToVec3(cur.background);
        u.uColor1.value = hexToVec3(cur.color1);
        u.uColor2.value = hexToVec3(cur.color2);
        u.uColor3.value = hexToVec3(cur.color3);
        u.uColor4.value = hexToVec3(cur.color4);
        u.uSpeed.value = cur.speed;
        u.uIntensity.value = cur.intensity;
        u.uDistortion.value = cur.distortion;

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
