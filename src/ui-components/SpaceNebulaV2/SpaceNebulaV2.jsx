'use client';
import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Geometry, Triangle, Transform, Color } from 'ogl';
import styles from './SpaceNebulaV2.module.css';
/* ───────────────────────────────────────────────────
   GLSL – Nebula fullscreen fragment shader
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
  uniform float uWarpFreq;
  uniform float uWarpAmp;
  uniform vec3  uColor1;
  uniform vec3  uColor2;
  uniform vec3  uBaseColor;

  varying vec2 vUv;

  /* ── Improved gradient noise ── */
  vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)),
             dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0); // quintic interpolation

    float a = dot(hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0));
    float b = dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
    float c = dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
    float d = dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  /* ── FBM with 6 octaves for richer detail ── */
  float fbm(vec2 p) {
    float val = 0.0;
    float amp = 0.5;
    float freq = 1.0;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8); // rotation to reduce axis-aligned artifacts
    for (int i = 0; i < 6; i++) {
      val += amp * noise(p * freq);
      p = rot * p;
      freq *= 2.0;
      amp *= 0.5;
    }
    return val;
  }

  /* ── Multi-level domain warping for organic flow ── */
  float warpedFbm(vec2 p, float t) {
    vec2 q = vec2(
      fbm(p + vec2(0.0, 0.0) + t * 0.035),
      fbm(p + vec2(5.2, 1.3) + t * 0.035)
    );
    vec2 r = vec2(
      fbm(p + 4.0 * q + vec2(1.7, 9.2) + t * 0.025),
      fbm(p + 4.0 * q + vec2(8.3, 2.8) + t * 0.025)
    );
    vec2 s = vec2(
      fbm(p + 3.5 * r + vec2(3.1, 7.4) + t * 0.018),
      fbm(p + 3.5 * r + vec2(6.7, 4.1) + t * 0.018)
    );
    return fbm(p + 3.0 * s);
  }

  /* ── Soft ribbon-like flow channel with exponential falloff ── */
  float flowChannel(vec2 uv, float warp, float center, float width) {
    float offset = warp * 0.25;
    float d = abs(uv.y - center - offset);
    // Exponential falloff for more natural gas appearance
    float core = exp(-d * d / (width * width * 0.5));
    return core;
  }

  /* ── Wider, softer outer glow around a flow ── */
  float flowGlow(vec2 uv, float warp, float center, float width) {
    float offset = warp * 0.25;
    float d = abs(uv.y - center - offset);
    return exp(-d * d / (width * width * 2.0)) * 0.3;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    vec2 uvA = vec2(uv.x * aspect, uv.y);

    float t = uTime;

    /* ── Coordinate spaces for different flow layers ── */
    // Main diagonal flow — goes from bottom-left to upper-right (pink/magenta)
    float angle1 = -0.55;
    mat2 rot1 = mat2(cos(angle1), sin(angle1), -sin(angle1), cos(angle1));
    vec2 uv1 = rot1 * (uvA - vec2(aspect * 0.5, 0.5)) + vec2(aspect * 0.5, 0.5);

    // Cyan flow — goes from lower-left upward with different angle
    float angle2 = 0.65;
    mat2 rot2 = mat2(cos(angle2), sin(angle2), -sin(angle2), cos(angle2));
    vec2 uv2 = rot2 * (uvA - vec2(aspect * 0.4, 0.5)) + vec2(aspect * 0.5, 0.5);

    // Secondary cyan — upper right region
    float angle3 = -0.3;
    mat2 rot3 = mat2(cos(angle3), sin(angle3), -sin(angle3), cos(angle3));
    vec2 uv3 = rot3 * (uvA - vec2(aspect * 0.75, 0.6)) + vec2(aspect * 0.5, 0.5);

    /* ── Background: deep space gradient ── */
    vec3 bgTop    = uBaseColor * 2.5 + vec3(0.02, 0.0, 0.05);
    vec3 bgMid    = uBaseColor * 1.5 + vec3(0.01, 0.0, 0.02);
    vec3 bgBottom = uBaseColor;
    vec3 bg = mix(bgBottom, bgMid, smoothstep(0.0, 0.5, uv.y));
    bg = mix(bg, bgTop, smoothstep(0.5, 1.0, uv.y));

    /* ── Vignette ── */
    vec2 vigUv = uv * 2.0 - 1.0;
    float vig = 1.0 - dot(vigUv * 0.55, vigUv * 0.55);
    vig = clamp(vig, 0.0, 1.0);
    vig = smoothstep(0.0, 0.6, vig);
    bg *= vig;

    /* ── Domain-warped noise fields ── */
    float wf = uWarpFreq;
    float wa = uWarpAmp;
    float warp1 = warpedFbm(uvA * 2.0 * wf, t) * wa;
    float warp2 = warpedFbm(uvA * 2.3 * wf + vec2(4.5, 2.1), t * 1.1) * wa;
    float warp3 = warpedFbm(uvA * 1.9 * wf + vec2(8.2, 5.3), t * 0.85) * wa;
    float warp4 = warpedFbm(uvA * 2.6 * wf + vec2(12.0, 7.0), t * 1.0) * wa;

    /* ═══════════════════════════════════════════════
       MAIN PINK/MAGENTA FLOW
       — Diagonal S-curve from upper-left to lower-right
       ═══════════════════════════════════════════════ */

    float magFlow1 = flowChannel(uv1, warp1, 0.5, 0.12);
    float magFlow2 = flowChannel(uv1, warp2 * 0.7, 0.47, 0.10);
    float magGlow1 = flowGlow(uv1, warp1, 0.5, 0.14);

    // Combine — keep narrow
    float magenta = max(magFlow1, magFlow2) * 0.85 + magGlow1;
    magenta = pow(magenta, 1.3); // sharpen falloff

    // Internal texture
    float magDetail = fbm(uv1 * 6.0 + t * 0.015 + warp1 * 1.5);
    magenta *= 0.55 + magDetail * 0.55;

    // Bright luminous core (very narrow)
    float magCoreDist = flowChannel(uv1, warp1, 0.5, 0.04);
    float magBright = pow(magCoreDist, 2.0) * 1.8;

    // Color palette
    vec3 magColorHot  = uColor1;
    vec3 magColorCore = uColor1 * 0.8;
    vec3 magColorMid  = uColor1 * 0.5;
    vec3 magColorOuter = uColor1 * 0.25;
    vec3 magColorFade = uColor1 * 0.05;

    float magMix = smoothstep(0.0, 1.0, magenta);
    vec3 magColor = mix(magColorFade, magColorOuter, smoothstep(0.0, 0.2, magMix));
    magColor = mix(magColor, magColorMid, smoothstep(0.2, 0.45, magMix));
    magColor = mix(magColor, magColorCore, smoothstep(0.45, 0.7, magMix));
    magColor = mix(magColor, magColorHot, smoothstep(0.7, 1.0, magMix));

    // White-hot core
    magColor = mix(magColor, vec3(1.0, 0.9, 0.97), magBright * 0.5);

    vec3 magResult = magColor * magenta * 0.9;

    /* ═══════════════════════════════════════════════
       CYAN/BLUE FLOW — bottom-left flowing upward
       ═══════════════════════════════════════════════ */

    vec2 uvCyan = uv2;

    float cyanFlow1 = flowChannel(uvCyan, warp3, 0.45, 0.11);
    float cyanFlow2 = flowChannel(uvCyan, warp4 * 0.6, 0.42, 0.09);
    float cyanGlow1 = flowGlow(uvCyan, warp3, 0.45, 0.13);

    float cyan = max(cyanFlow1, cyanFlow2) * 0.8 + cyanGlow1;
    cyan = pow(cyan, 1.3);

    // Internal texture
    float cyanDetail = fbm(uvCyan * 5.5 + t * 0.018 + warp3 * 1.5);
    cyan *= 0.5 + cyanDetail * 0.6;

    // Bright core
    float cyanCoreDist = flowChannel(uvCyan, warp3, 0.45, 0.035);
    float cyanBright = pow(cyanCoreDist, 2.0) * 1.5;

    // Color palette
    vec3 cyanColorHot  = uColor2;
    vec3 cyanColorCore = uColor2 * 0.8;
    vec3 cyanColorMid  = uColor2 * 0.5;
    vec3 cyanColorOuter = uColor2 * 0.2;
    vec3 cyanColorFade = uColor2 * 0.05;

    float cyanMix = smoothstep(0.0, 1.0, cyan);
    vec3 cyanColor = mix(cyanColorFade, cyanColorOuter, smoothstep(0.0, 0.2, cyanMix));
    cyanColor = mix(cyanColor, cyanColorMid, smoothstep(0.2, 0.45, cyanMix));
    cyanColor = mix(cyanColor, cyanColorCore, smoothstep(0.45, 0.7, cyanMix));
    cyanColor = mix(cyanColor, cyanColorHot, smoothstep(0.7, 1.0, cyanMix));

    // White-hot core
    cyanColor = mix(cyanColor, vec3(0.9, 0.97, 1.0), cyanBright * 0.5);

    vec3 cyanResult = cyanColor * cyan * 0.8;

    /* ═══════════════════════════════════════════════
       SECONDARY CYAN TENDRIL — upper right area
       ═══════════════════════════════════════════════ */

    float cyanT1 = flowChannel(uv3, warp2, 0.5, 0.09);
    float cyanTGlow = flowGlow(uv3, warp2, 0.5, 0.11);
    float cyanTendril = cyanT1 * 0.5 + cyanTGlow;
    cyanTendril = pow(cyanTendril, 1.5);

    float cyanTDetail = fbm(uv3 * 5.0 + warp4 * 1.5 + t * 0.015);
    cyanTendril *= 0.5 + cyanTDetail * 0.5;

    vec3 cyanTColor = mix(cyanColorFade, cyanColorMid, smoothstep(0.0, 0.5, cyanTendril));
    cyanTColor = mix(cyanTColor, cyanColorCore, smoothstep(0.5, 1.0, cyanTendril));
    vec3 cyanTResult = cyanTColor * cyanTendril * 0.5;

    /* ═══════════════════════════════════════════════
       PURPLE AMBIENT HAZE — subtle volumetric fill
       ═══════════════════════════════════════════════ */

    float purpleHaze1 = warpedFbm(uvA * 1.5 + vec2(3.0, 2.0), t * 0.65);
    purpleHaze1 = smoothstep(-0.1, 0.6, purpleHaze1) * 0.05;

    float purpleHaze2 = warpedFbm(uvA * 1.3 + vec2(7.5, 4.5), t * 0.55);
    purpleHaze2 = smoothstep(-0.1, 0.5, purpleHaze2) * 0.04;

    vec3 purpleColor1 = mix(uColor1, uColor2, 0.5) * 0.6;
    vec3 purpleColor2 = mix(uColor1, uColor2, 0.3) * 0.4;
    vec3 purpleResult = purpleColor1 * purpleHaze1 + purpleColor2 * purpleHaze2;

    /* ── Interaction glow where flows overlap ── */
    float interact = magenta * cyan;
    vec3 interactColor = mix(uColor1, uColor2, 0.5) * 1.5;
    vec3 interactResult = interactColor * interact * 0.3;

    /* ═══════════════════════════════════════════════
       COMPOSITE
       ═══════════════════════════════════════════════ */
    vec3 color = bg;
    color += purpleResult;
    color += cyanResult;
    color += cyanTResult;
    color += magResult;
    color += interactResult;

    // Very subtle ambient glow in dark areas near flows
    float ambientGlow = (magGlow1 + cyanGlow1) * 0.04;
    color += vec3(0.08, 0.02, 0.15) * ambientGlow;

    // Tone mapping
    color = pow(color, vec3(0.94));
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
export default function SpaceNebulaV2({ className = "", speed = 1.0, starCount = 1000, warpFreq = 1.0, warpAmp = 1.0, color1 = "#ec4899", color2 = "#6366f1", baseColor = "#03020e", children, }) {
    const containerRef = useRef(null);
    const programRef = useRef(null);
    const speedRef = useRef(speed);
    useEffect(() => {
        speedRef.current = speed;
    }, [speed]);
    useEffect(() => {
        if (!programRef.current)
            return;
        programRef.current.uniforms.uWarpFreq.value = warpFreq;
        programRef.current.uniforms.uWarpAmp.value = warpAmp;
        programRef.current.uniforms.uColor1.value.set(color1);
        programRef.current.uniforms.uColor2.value.set(color2);
        programRef.current.uniforms.uBaseColor.value.set(baseColor);
    }, [warpFreq, warpAmp, color1, color2, baseColor]);
    useEffect(() => {
        const container = containerRef.current;
        if (!container)
            return;
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
                uColor1: { value: new Color(color1) },
                uColor2: { value: new Color(color2) },
                uBaseColor: { value: new Color(baseColor) },
            },
            depthTest: false,
            depthWrite: false,
            cullFace: false,
        });
        const nebulaMesh = new Mesh(gl, {
            geometry: nebulaGeometry,
            program: nebulaProgram,
        });
        nebulaMesh.setParent(scene);
        programRef.current = nebulaProgram;
        /* ── Stars ── */
        const STAR_COUNT = 1000;
        const positions = new Float32Array(STAR_COUNT * 3);
        const sizes = new Float32Array(STAR_COUNT);
        const seeds = new Float32Array(STAR_COUNT);
        const colors = new Float32Array(STAR_COUNT * 3);
        for (let i = 0; i < STAR_COUNT; i++) {
            positions[i * 3 + 0] = Math.random(); // x [0,1]
            positions[i * 3 + 1] = Math.random(); // y [0,1]
            positions[i * 3 + 2] = 0;
            sizes[i] = 0.5 + Math.random() * 1.5; // 0.5–2px radius
            seeds[i] = Math.random();
            // Mostly white, ~15% cyan-blue tinted
            if (Math.random() < 0.15) {
                // Cyan-blue star
                colors[i * 3 + 0] = 0.7 + Math.random() * 0.3;
                colors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
                colors[i * 3 + 2] = 1.0;
            }
            else {
                // White / warm-white
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
        let frameId;
        const animate = () => {
            frameId = requestAnimationFrame(animate);
            time += 0.016 * speedRef.current; // ~60fps timestep
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
    return (<>
            <div ref={containerRef} className={`${styles.container} ${className}`}/>
            {children && (<div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    {children}
                </div>)}
        </>);
}
