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

void main() {
  vec2 p = vUv;
  float t = uTime * uSpeed;

  // Bottom Waves
  float botBase = 0.15 * sin(p.x * 3.0 + t * 0.5) + 0.1 * cos(p.x * 5.0 - t * 0.8);
  float botLayer2 = 0.05 * sin(p.x * 8.0 + t * 1.2) + 0.05 * sin(p.x * 2.0 + t * 0.3);
  float botDrift = 0.1 * sin(t * 0.4);
  float botFinal = botDrift + botBase + botLayer2;
  float botDist = p.y - botFinal;
  float botGlow = smoothstep(uSpread, -0.1, botDist) * uIntensity;

  // Top Waves
  float topBase = 0.15 * sin(p.x * 2.5 - t * 0.6) + 0.1 * cos(p.x * 4.5 + t * 0.7);
  float topLayer2 = 0.05 * sin(p.x * 7.0 - t * 1.1) + 0.05 * cos(p.x * 3.0 - t * 0.4);
  float topDrift = 0.1 * cos(t * 0.35);
  float topFinal = 1.0 - (topDrift + topBase + topLayer2);
  float topDist = topFinal - p.y;
  float topGlow = smoothstep(uSpread, -0.1, topDist) * uIntensity;

  // Centre Accent
  float accWave = 0.5 + 0.2 * sin(p.x * 2.0 + t * 0.4) + 0.1 * cos(p.x * 6.0 - t * 0.9);
  float accDist = abs(p.y - accWave);
  float accGlow = smoothstep(uSpread * 0.7, 0.0, accDist) * uIntensity * 0.6;

  vec3 col = uBackground;
  col = mix(col, uColorBottom, botGlow);
  col = mix(col, uColorTop, topGlow);
  col += uColorAccent * accGlow * 0.5;

  col *= 0.95 + 0.05 * sin(t);

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;
const hexToVec3 = (hex) => {
    let c = hex.replace("#", "");
    if (c.length === 3)
        c = c.split("").map((x) => x + x).join("");
    const n = parseInt(c, 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};
export default function SilkGradient({ className = "", background = "#020617", colorTop = "#1e40af", colorBottom = "#0c4a6e", colorAccent = "#38bdf8", speed = 0.35, intensity = 0.9, spread = 0.65, children, }) {
    const canvasRef = useRef(null);
    const rafRef = useRef(null);
    const programRef = useRef(null);
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
        let renderer, mesh, startTime;
        let ro;
        async function init() {
            const { Renderer, Program, Mesh, Triangle } = await import("ogl");
            const canvas = canvasRef.current;
            if (!canvas)
                return;
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
                    uTime: { value: 0 },
                    uResolution: { value: [canvas.width, canvas.height] },
                    uBackground: { value: hexToVec3(uniformsRef.current.background) },
                    uColorTop: { value: hexToVec3(uniformsRef.current.colorTop) },
                    uColorBottom: { value: hexToVec3(uniformsRef.current.colorBottom) },
                    uColorAccent: { value: hexToVec3(uniformsRef.current.colorAccent) },
                    uSpeed: { value: uniformsRef.current.speed },
                    uIntensity: { value: uniformsRef.current.intensity },
                    uSpread: { value: uniformsRef.current.spread },
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
            if (canvas.parentElement)
                ro.observe(canvas.parentElement);
            startTime = performance.now();
            function frame(now) {
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
            if (ro)
                ro.disconnect();
            if (rafRef.current)
                cancelAnimationFrame(rafRef.current);
            if (renderer)
                renderer.gl.getExtension("WEBGL_lose_context")?.loseContext();
        };
    }, []);
    return (<div className={`${styles.wrapper} ${className}`}>
      <canvas ref={canvasRef} className={styles.canvas}/>
      {children && <div className={styles.content}>{children}</div>}
    </div>);
}
