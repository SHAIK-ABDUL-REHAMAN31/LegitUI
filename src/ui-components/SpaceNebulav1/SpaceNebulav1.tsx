'use client';

import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Geometry, Triangle, Transform, Color } from 'ogl';
import styles from './SpaceNebulav1.module.css';

/* ───────────────────────────────────────────────────
   GLSL – Nebula fullscreen fragment shader
   Matches reference: horizontal S-curve pink flow,
   cyan in bottom-left curving up, purple ambient haze
   ─────────────────────────────────────────────────── */

const nebulaVertex = /* glsl */ `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const nebulaFragment = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2  uResolution;

  varying vec2 vUv;

  /* ── Gradient noise ── */
  vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)),
             dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

    float a = dot(hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0));
    float b = dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
    float c = dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
    float d = dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  /* ── FBM 6 octaves ── */
  float fbm(vec2 p) {
    float val = 0.0;
    float amp = 0.5;
    float freq = 1.0;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 6; i++) {
      val += amp * noise(p * freq);
      p = rot * p;
      freq *= 2.0;
      amp *= 0.5;
    }
    return val;
  }

  /* ── 3-level domain warp ── */
  float warpedFbm(vec2 p, float t) {
    vec2 q = vec2(
      fbm(p + vec2(0.0, 0.0) + t * 0.032),
      fbm(p + vec2(5.2, 1.3) + t * 0.032)
    );
    vec2 r = vec2(
      fbm(p + 4.0 * q + vec2(1.7, 9.2) + t * 0.022),
      fbm(p + 4.0 * q + vec2(8.3, 2.8) + t * 0.022)
    );
    vec2 s = vec2(
      fbm(p + 3.5 * r + vec2(3.1, 7.4) + t * 0.015),
      fbm(p + 3.5 * r + vec2(6.7, 4.1) + t * 0.015)
    );
    return fbm(p + 3.0 * s);
  }

  /* ── Distance from a point to a dynamic curve ──
     Path: y = a*(x - b)^2 + c + amp*sin(freq*x + phase)
  */
  float distToPath(vec2 p, float a, float b, float c, float amp, float freq, float phase,
                   float xStart, float xEnd) {
    float minDist = 100.0;
    for (int i = 0; i <= 80; i++) {
      float t = float(i) / 80.0;
      float cx = mix(xStart, xEnd, t);
      float cy = a * pow(cx - b, 2.0) + c + amp * sin(freq * cx + phase);
      float d = length(p - vec2(cx, cy));
      minDist = min(minDist, d);
    }
    return minDist;
  }

  /* ── Gaussian glow from distance ── */
  float gaussGlow(float dist, float width) {
    return exp(-dist * dist / (width * width));
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    vec2 p = vec2(uv.x * aspect, uv.y);

    float t = uTime;

    /* ── Background ── */
    vec3 bgTop    = vec3(12.0, 6.0, 35.0) / 255.0;
    vec3 bgMid    = vec3(5.0, 3.0, 22.0) / 255.0;
    vec3 bgBottom = vec3(3.0, 2.0, 14.0) / 255.0;
    vec3 bg = mix(bgBottom, bgMid, smoothstep(0.0, 0.45, uv.y));
    bg = mix(bg, bgTop, smoothstep(0.45, 1.0, uv.y));

    /* ── Vignette ── */
    vec2 vigUv = uv * 2.0 - 1.0;
    float vig = 1.0 - dot(vigUv * 0.52, vigUv * 0.52);
    vig = smoothstep(0.0, 0.6, clamp(vig, 0.0, 1.0));
    bg *= vig;

    /* ── Domain warp fields ── */
    float w1 = warpedFbm(p * 2.0, t);
    float w2 = warpedFbm(p * 2.2 + vec2(4.5, 2.1), t * 1.1);
    float w3 = warpedFbm(p * 1.8 + vec2(8.2, 5.3), t * 0.85);
    float w4 = warpedFbm(p * 2.5 + vec2(12.0, 7.0), t * 1.0);
    float w5 = warpedFbm(p * 1.6 + vec2(15.0, 3.5), t * 0.75);

    /* ── Organic displacement applied to sample point ── */
    vec2 pWarp1 = p + vec2(w1, w2) * 0.08;
    vec2 pWarp2 = p + vec2(w3, w4) * 0.07;
    vec2 pWarp3 = p + vec2(w2, w5) * 0.06;

    /* ═══════════════════════════════════════════════════════
       MAIN PINK/MAGENTA SWEEPING CURVE
       — Swoops from top-left, dips in the lower-middle, rises to top-right
       ═══════════════════════════════════════════════════════ */

    // Main U-curve parameters
    float magA = 0.55; // Steepness of parabola
    float magB = aspect * 0.5 + 0.1; // Vertex X (center-right)
    float magC = 0.35; // Vertex Y (dip height)
    float magAmp = 0.05 + sin(t * 0.08) * 0.02; // Small ripple
    float magFreq = 3.0;
    float magPhase = t * 0.06;

    float magDist = distToPath(pWarp1,
      magA, magB, magC, magAmp, magFreq, magPhase,
      -0.5, aspect + 0.5);

    // Second parallel stream
    float magDist2 = distToPath(pWarp2,
      magA * 0.9, magB - 0.1, magC + 0.08, magAmp * 1.5, magFreq * 1.1, magPhase + 1.5,
      -0.5, aspect + 0.5);

    // Third wispy tendril
    float magDist3 = distToPath(pWarp3,
      magA * 1.1, magB + 0.05, magC - 0.06, magAmp * 0.8, magFreq * 0.9, magPhase - 0.8,
      -0.5, aspect + 0.5);

    // Combine into volumetric shape
    float magGlow  = gaussGlow(magDist, 0.16) * 0.95;
    float magGlow2 = gaussGlow(magDist2, 0.12) * 0.65;
    float magGlow3 = gaussGlow(magDist3, 0.10) * 0.45;

    float magenta = max(magGlow, max(magGlow2, magGlow3));
    // Add soft outer fog
    magenta += (gaussGlow(magDist, 0.32) + gaussGlow(magDist2, 0.25)) * 0.15;

    // Internal gas texture
    float magTex = fbm(p * 5.0 + vec2(w1, w2) * 2.0 + t * 0.01);
    magenta *= 0.5 + magTex * 0.6;

    // Bright luminous core (narrow)
    float magCore = gaussGlow(magDist, 0.035) * 1.6;

    // Clamped
    magenta = clamp(magenta, 0.0, 1.0);

    // Color palette
    vec3 magHot   = vec3(255.0, 180.0, 240.0) / 255.0;
    vec3 magBright= vec3(255.0, 80.0, 200.0) / 255.0;
    vec3 magMid   = vec3(200.0, 30.0, 180.0) / 255.0;
    vec3 magOuter = vec3(130.0, 10.0, 180.0) / 255.0;
    vec3 magFade  = vec3(60.0, 0.0, 110.0) / 255.0;

    float mm = smoothstep(0.0, 1.0, magenta);
    vec3 magColor = mix(magFade, magOuter, smoothstep(0.0, 0.15, mm));
    magColor = mix(magColor, magMid, smoothstep(0.15, 0.35, mm));
    magColor = mix(magColor, magBright, smoothstep(0.35, 0.6, mm));
    magColor = mix(magColor, magHot, smoothstep(0.6, 0.9, mm));

    // White-hot core
    magColor = mix(magColor, vec3(1.0, 0.92, 0.97), magCore * 0.55);

    vec3 magResult = magColor * magenta;

    /* ═══════════════════════════════════════════════════════
       CYAN/BLUE FLOW
       — Sweeps up from the bottom-left into the main flow
       ═══════════════════════════════════════════════════════ */

    // Cyan curve - rises sharply from bottom left
    float cyanA = -0.4; // Downward facing parabola to form an arch
    float cyanB = aspect * 0.2; // Peak is left-aligned
    float cyanC = 0.5; // Height of the peak
    float cyanAmp = 0.06;
    float cyanFreq = 2.0;
    float cyanPhase = 1.0 + t * 0.05;

    float cyanDist = distToPath(pWarp2,
      cyanA, cyanB, cyanC, cyanAmp, cyanFreq, cyanPhase,
      -0.5, aspect * 0.6);

    // Secondary cyan tendril
    float cyanDist2 = distToPath(pWarp3,
      cyanA * 0.8, cyanB + 0.2, cyanC + 0.1, cyanAmp * 0.8, cyanFreq * 1.3, cyanPhase - 1.2,
      -0.5, aspect * 0.8);

    float cyanGlow  = gaussGlow(cyanDist, 0.14) * 0.85;
    float cyanGlow2 = gaussGlow(cyanDist2, 0.10) * 0.45;
    float cyanOuter = gaussGlow(cyanDist, 0.28) * 0.12;

    float cyan = max(cyanGlow, cyanGlow2) + cyanOuter;

    // Internal texture
    float cyanTex = fbm(p * 4.5 + vec2(w3, w4) * 1.8 + t * 0.012);
    cyan *= 0.45 + cyanTex * 0.65;

    // Bright core
    float cyanCore = gaussGlow(cyanDist, 0.035) * 1.4;

    cyan = clamp(cyan, 0.0, 1.0);

    // Fade cyan as it goes too far right (concentrated left)
    float cyanFade = smoothstep(0.85, 0.35, uv.x);
    // Also keep it lower (concentrated bottom-left)
    cyanFade *= smoothstep(0.95, 0.55, uv.y);
    // Re-add for the secondary tendril in upper-right
    float cyanRight = gaussGlow(cyanDist2, 0.10) * 0.3 * smoothstep(0.4, 0.8, uv.x);
    cyan = cyan * cyanFade + cyanRight;

    // Color palette
    vec3 cyanHot   = vec3(200.0, 255.0, 255.0) / 255.0;
    vec3 cyanBr    = vec3(20.0, 220.0, 255.0) / 255.0;
    vec3 cyanMidC  = vec3(0.0, 130.0, 240.0) / 255.0;
    vec3 cyanOuterC= vec3(0.0, 55.0, 180.0) / 255.0;
    vec3 cyanFadeC = vec3(10.0, 15.0, 90.0) / 255.0;

    float cm = smoothstep(0.0, 1.0, cyan);
    vec3 cyanColor = mix(cyanFadeC, cyanOuterC, smoothstep(0.0, 0.15, cm));
    cyanColor = mix(cyanColor, cyanMidC, smoothstep(0.15, 0.35, cm));
    cyanColor = mix(cyanColor, cyanBr, smoothstep(0.35, 0.6, cm));
    cyanColor = mix(cyanColor, cyanHot, smoothstep(0.6, 0.9, cm));

    // White-hot core
    cyanColor = mix(cyanColor, vec3(0.92, 0.98, 1.0), cyanCore * cyanFade * 0.4);

    vec3 cyanResult = cyanColor * cyan;

    /* ═══════════════════════════════════════════════════════
       PURPLE/VIOLET AMBIENT HAZE
       — Fills gaps, adds depth around the flows
       ═══════════════════════════════════════════════════════ */

    // Large-scale purple clouds
    float purp1 = warpedFbm(p * 1.4 + vec2(3.0, 2.0), t * 0.6);
    purp1 = smoothstep(-0.12, 0.55, purp1) * 0.065;

    float purp2 = warpedFbm(p * 1.2 + vec2(7.5, 4.5), t * 0.5);
    purp2 = smoothstep(-0.1, 0.5, purp2) * 0.05;

    // Purple concentrated between the two main flows
    float purpBand = gaussGlow(
      abs(uv.y - 0.42 - w1 * 0.05), 0.18) * 0.04;

    vec3 purpColor1 = vec3(90.0, 15.0, 180.0) / 255.0;
    vec3 purpColor2 = vec3(55.0, 8.0, 130.0) / 255.0;
    vec3 purpResult = purpColor1 * (purp1 + purpBand) + purpColor2 * purp2;

    /* ═══════════════════════════════════════════════════════
       INTERACTION / BLEND where pink and cyan overlap
       ═══════════════════════════════════════════════════════ */

    float interact = magenta * cyan;
    vec3 interactColor = vec3(160.0, 80.0, 230.0) / 255.0;
    vec3 interactResult = interactColor * interact * 0.35;

    /* ═══════════════════════════════════════════════════════
       COMPOSITE
       ═══════════════════════════════════════════════════════ */

    vec3 color = bg;
    color += purpResult;
    color += cyanResult;
    color += magResult;
    color += interactResult;

    // Subtle ambient purple glow near flows
    float nearFlow = (gaussGlow(magDist, 0.35) + gaussGlow(cyanDist, 0.30)) * 0.025;
    color += vec3(0.06, 0.01, 0.12) * nearFlow;

    // Tone mapping
    color = pow(color, vec3(0.93));
    color = clamp(color, 0.0, 1.0);

    gl_FragColor = vec4(color, 1.0);
  }
`;

/* ───────────────────────────────────────────────────
   GLSL – Stars (point sprites)
   ─────────────────────────────────────────────────── */

const starsVertex = /* glsl */ `
  attribute vec3 position;
  attribute float aSize;
  attribute float aSeed;
  attribute vec3 aColor;

  uniform float uTime;
  uniform vec2  uResolution;

  varying float vAlpha;
  varying vec3  vColor;

  void main() {
    vColor = aColor;
    // Twinkle
    vAlpha = sin(uTime * 2.0 + aSeed * 6.2831) * 0.3 + 0.7;

    // Position in clip space
    vec2 pos = position.xy * 2.0 - 1.0; // map [0,1] → [-1,1]
    gl_Position = vec4(pos, 0.0, 1.0);
    gl_PointSize = aSize * min(uResolution.x, uResolution.y) / 800.0;
  }
`;

const starsFragment = /* glsl */ `
  precision highp float;

  varying float vAlpha;
  varying vec3  vColor;

  void main() {
    // Soft circular point sprite
    vec2 c = gl_PointCoord * 2.0 - 1.0;
    float d = dot(c, c);
    if (d > 1.0) discard;

    float alpha = (1.0 - d) * vAlpha;
    // Extra glow falloff
    alpha *= smoothstep(1.0, 0.0, sqrt(d));

    gl_FragColor = vec4(vColor * alpha, alpha);
  }
`;

/* ───────────────────────────────────────────────────
   React Component
   ─────────────────────────────────────────────────── */



export interface SpaceNebulav1Props {
  className?: string;
  speed?: number;
  starCount?: number;
  warpFreq?: number;
  warpAmp?: number;
  waveDirX?: number;
  waveDirY?: number;
  color1?: string;
  color2?: string;
  baseColor?: string;
  children?: React.ReactNode;
}

export default function SpaceNebulav1({
  className = "",
  speed = 1.0,
  starCount = 1200,
  warpFreq = 1.0,
  warpAmp = 1.0,
  waveDirX = 1.0,
  waveDirY = 1.0,
  color1 = "#ffb4f0",
  color2 = "#c8ffff",
  baseColor = "#03020e",
  children,
}: SpaceNebulav1Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const programRef = useRef<Program | null>(null);
  const speedRef = useRef(speed);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    if (!programRef.current) return;
    programRef.current.uniforms.uWarpFreq.value = warpFreq;
    programRef.current.uniforms.uWarpAmp.value = warpAmp;
    programRef.current.uniforms.uWaveDir.value = [waveDirX, waveDirY];
    programRef.current.uniforms.uColor1.value.set(color1);
    programRef.current.uniforms.uColor2.value.set(color2);
    programRef.current.uniforms.uBaseColor.value.set(baseColor);
  }, [warpFreq, warpAmp, waveDirX, waveDirY, color1, color2, baseColor]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /* ── Renderer setup ── */
    const dpr = Math.min(window.devicePixelRatio, 2);
    const renderer = new Renderer({
      dpr,
      alpha: false,
      depth: false,
      stencil: false,
      antialias: false,
      premultipliedAlpha: false,
      autoClear: true,
    });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);

    gl.clearColor(3 / 255, 2 / 255, 15 / 255, 1);

    /* ── Scene ── */
    const scene = new Transform();

    /* ── Resize handler ── */
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);

      if (nebulaProgram) {
        nebulaProgram.uniforms.uResolution.value = [w * dpr, h * dpr];
      }
      if (starsProgram) {
        starsProgram.uniforms.uResolution.value = [w * dpr, h * dpr];
      }
    };

    /* ── Nebula fullscreen triangle ── */
    const nebulaGeometry = new Triangle(gl);

    const nebulaProgram = new Program(gl, {
      vertex: nebulaVertex,
      fragment: nebulaFragment,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [window.innerWidth * dpr, window.innerHeight * dpr] },
        uWarpFreq: { value: warpFreq },
        uWarpAmp: { value: warpAmp },
        uWaveDir: { value: [waveDirX, waveDirY] },
        uColor1: { value: new Color(color1) },
        uColor2: { value: new Color(color2) },
        uBaseColor: { value: new Color(baseColor) },
      },
      depthTest: false,
      depthWrite: false,
      cullFace: false,
    });
    programRef.current = nebulaProgram;

    const nebulaMesh = new Mesh(gl, {
      geometry: nebulaGeometry,
      program: nebulaProgram,
    });
    nebulaMesh.setParent(scene);

    /* ── Stars ── */
    const STAR_COUNT = starCount;
    const positions = new Float32Array(STAR_COUNT * 3);
    const sizes = new Float32Array(STAR_COUNT);
    const seeds = new Float32Array(STAR_COUNT);
    const colors = new Float32Array(STAR_COUNT * 3);

    for (let i = 0; i < STAR_COUNT; i++) {
      positions[i * 3 + 0] = Math.random();     // x [0,1]
      positions[i * 3 + 1] = Math.random();     // y [0,1]
      positions[i * 3 + 2] = 0;

      sizes[i] = 0.4 + Math.random() * 1.8;
      seeds[i] = Math.random();

      // Mostly white, ~15% cyan-blue tinted
      if (Math.random() < 0.15) {
        colors[i * 3 + 0] = 0.7 + Math.random() * 0.3;
        colors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
        colors[i * 3 + 2] = 1.0;
      } else {
        const warmth = 0.85 + Math.random() * 0.15;
        colors[i * 3 + 0] = warmth;
        colors[i * 3 + 1] = warmth;
        colors[i * 3 + 2] = 0.9 + Math.random() * 0.1;
      }
    }

    const starsGeometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      aSize: { size: 1, data: sizes },
      aSeed: { size: 1, data: seeds },
      aColor: { size: 3, data: colors },
    });

    const starsProgram = new Program(gl, {
      vertex: starsVertex,
      fragment: starsFragment,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [window.innerWidth * dpr, window.innerHeight * dpr] },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      cullFace: false,
    });
    // Additive blending for stars
    starsProgram.setBlendFunc(gl.SRC_ALPHA, gl.ONE);

    const starsMesh = new Mesh(gl, {
      mode: gl.POINTS,
      geometry: starsGeometry,
      program: starsProgram,
      renderOrder: 1,
    });
    starsMesh.setParent(scene);

    /* ── Init size ── */
    resize();
    window.addEventListener('resize', resize);

    /* ── Animation loop ── */
    let time = 0;
    let frameId: number;

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      time += 0.016 * speedRef.current;
      nebulaProgram.uniforms.uTime.value = time;
      starsProgram.uniforms.uTime.value = time;

      renderer.render({ scene });
    };

    frameId = requestAnimationFrame(animate);

    /* ── Cleanup ── */
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);

      // Remove canvas
      if (gl.canvas.parentNode) {
        gl.canvas.parentNode.removeChild(gl.canvas);
      }

      // Dispose OGL resources
      nebulaProgram.remove();
      starsProgram.remove();
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className={`${styles.container} ${className}`}
      />
      {children && (
        <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {children}
        </div>
      )}
    </>
  );
}
