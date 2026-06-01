"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./AliveGradient.module.css";

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
uniform vec3  uBackground;
uniform vec3  uColor1;
uniform vec3  uColor2;
uniform vec3  uColor3;
uniform vec3  uColor4;
uniform vec3  uColor5;
uniform float uSpeed;
uniform float uIntensity;
uniform float uDistortion;
uniform float uGlowSize;

varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

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

void main() {
  vec2 uv = vUv;
  float t = uTime * uSpeed;
  float aspect = uResolution.x / uResolution.y;

  vec2 warp = vec2(
    fbm(uv * 1.8 + vec2(t * 0.15, t * 0.05)),
    fbm(uv * 1.8 + vec2(-t * 0.08, t * 0.18))
  );
  vec2 warpedUv = uv + (warp - 0.5) * uDistortion * 0.38;

  float drift1 = 0.08 * sin(warpedUv.x * 2.5 + t * 0.6) + 0.03 * cos(warpedUv.x * 5.0 - t * 0.9);
  float path1 = 0.42 - 2.8 * pow(warpedUv.x - 0.32, 2.0) + drift1;
  float dist1 = abs(warpedUv.y - path1);

  float wGlowScale = 12.0 / clamp(uGlowSize, 0.1, 5.0);
  float wCoreScale = 35.0 / clamp(uGlowSize, 0.1, 5.0);
  float glow1 = exp(-dist1 * wGlowScale);
  float core1 = exp(-dist1 * wCoreScale);

  float drift2 = 0.07 * cos(warpedUv.x * 2.8 + t * 0.5) + 0.03 * sin(warpedUv.x * 6.0 - t * 1.1);
  float path2 = 0.12 + 0.76 * smoothstep(0.35, 1.0, warpedUv.x) + drift2;
  float dist2 = abs(warpedUv.y - path2);

  float cGlowScale = 14.0 / clamp(uGlowSize, 0.1, 5.0);
  float cCoreScale = 45.0 / clamp(uGlowSize, 0.1, 5.0);
  float glow2 = exp(-dist2 * cGlowScale);
  float core2 = exp(-dist2 * cCoreScale);

  float edgeCondition = smoothstep(0.0, 0.08, warpedUv.y - path2);
  float greenGlow = exp(-dist2 * 18.0) * edgeCondition * 0.58;

  vec3 col = uBackground;

  vec3 warmCol = mix(uColor1, uColor2, core1) * (glow1 + core1 * 0.8);
  col += warmCol * uIntensity;

  vec3 coolCol = mix(uColor3, uColor4, core2) * (glow2 + core2 * 0.9);
  coolCol += uColor5 * greenGlow;
  col += coolCol * uIntensity;

  vec2 vig = uv * 2.0 - 1.0;
  vig.x *= aspect;
  float v = 1.0 - dot(vig * 0.42, vig * 0.42);
  v = clamp(v, 0.0, 1.0);
  col *= v * v;

  col *= 0.97 + 0.03 * sin(t * 0.8);

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

const hexToVec3 = (hex) => {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const n = parseInt(c, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export default function AliveGradient({
  className = "",
  background = "#020205",
  color1 = "#ea580c",
  color2 = "#eab308",
  color3 = "#2563eb",
  color4 = "#ffffff",
  color5 = "#10b981",
  speed = 0.35,
  intensity = 1.0,
  distortion = 0.4,
  glowSize = 1.0,
  children,
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  const uniformsRef = useRef({
    background,
    color1,
    color2,
    color3,
    color4,
    color5,
    speed,
    intensity,
    distortion,
    glowSize,
  });

  useEffect(() => {
    uniformsRef.current = {
      background,
      color1,
      color2,
      color3,
      color4,
      color5,
      speed,
      intensity,
      distortion,
      glowSize,
    };
  }, [
    background,
    color1,
    color2,
    color3,
    color4,
    color5,
    speed,
    intensity,
    distortion,
    glowSize,
  ]);

  useEffect(() => {
    let renderer;
    let mesh;
    let startTime;
    let ro;

    async function init() {
      try {
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
        if (!gl) {
          setHasWebGL(false);
          return;
        }

        const geometry = new Triangle(gl);
        const program = new Program(gl, {
          vertex: VERT,
          fragment: FRAG,
          uniforms: {
            uTime: { value: 0 },
            uResolution: { value: [canvas.width, canvas.height] },
            uBackground: { value: hexToVec3(uniformsRef.current.background) },
            uColor1: { value: hexToVec3(uniformsRef.current.color1) },
            uColor2: { value: hexToVec3(uniformsRef.current.color2) },
            uColor3: { value: hexToVec3(uniformsRef.current.color3) },
            uColor4: { value: hexToVec3(uniformsRef.current.color4) },
            uColor5: { value: hexToVec3(uniformsRef.current.color5) },
            uSpeed: { value: uniformsRef.current.speed },
            uIntensity: { value: uniformsRef.current.intensity },
            uDistortion: { value: uniformsRef.current.distortion },
            uGlowSize: { value: uniformsRef.current.glowSize },
          },
        });

        mesh = new Mesh(gl, { geometry, program });

        ro = new ResizeObserver((entries) => {
          const entry = entries[0];
          if (entry) {
            const { width, height } = entry.contentRect;
            renderer.setSize(width, height);
            program.uniforms.uResolution.value = [
              width * renderer.dpr,
              height * renderer.dpr,
            ];
          }
        });

        if (canvas.parentElement) {
          ro.observe(canvas.parentElement);
        }

        startTime = performance.now();

        function frame(now) {
          rafRef.current = requestAnimationFrame(frame);

          const u = program.uniforms;
          const cur = uniformsRef.current;

          u.uTime.value = (now - startTime) * 0.001;
          u.uBackground.value = hexToVec3(cur.background);
          u.uColor1.value = hexToVec3(cur.color1);
          u.uColor2.value = hexToVec3(cur.color2);
          u.uColor3.value = hexToVec3(cur.color3);
          u.uColor4.value = hexToVec3(cur.color4);
          u.uColor5.value = hexToVec3(cur.color5);
          u.uSpeed.value = cur.speed;
          u.uIntensity.value = cur.intensity;
          u.uDistortion.value = cur.distortion;
          u.uGlowSize.value = cur.glowSize;

          renderer.render({ scene: mesh });
        }

        rafRef.current = requestAnimationFrame(frame);
      } catch (err) {
        console.warn("WebGL initialization failed, using CSS fallback:", err);
        setHasWebGL(false);
      }
    }

    init();

    return () => {
      if (ro) ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (renderer && renderer.gl) {
        renderer.gl.getExtension("WEBGL_lose_context")?.loseContext();
      }
    };
  }, []);

  return (
    <div
      className={`${styles.wrapper} ${className}`}
      style={{
        "--bg-color": background,
        "--color-1": color1,
        "--color-2": color2,
        "--color-3": color3,
        "--color-4": color4,
        "--color-5": color5,
        "--intensity": intensity,
      }}
    >
      {hasWebGL ? (
        <canvas ref={canvasRef} className={styles.canvas} />
      ) : (
        <div className={styles.fallback}>
          <div className={styles.fallbackBlur}>
            <div className={styles.fallbackWarm} />
            <div className={styles.fallbackCool} />
          </div>
        </div>
      )}
      {children && <div className={styles.content}>{children}</div>}
    </div>
  );
}
