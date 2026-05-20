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
    float curve = pow(x, uCurve);
    float rayY = distY / curve;
    float rayX = 1.0 / x - t * 2.0;
    
    // Pack many thin lines into the visible funnel space
    vec2 rayUv = vec2(rayX * 0.02, rayY * uDensity);
    
    // 1. Streak 1 Rays
    float val1 = fbm(vec2(rayUv.x, rayUv.y));
    float core1 = smoothstep(0.65, 0.75, val1);
    float glow1 = smoothstep(0.4, 0.8, val1);
    float streak1 = core1 * 2.0 + glow1 * 0.6;
    
    // 2. Streak 2 Rays
    float val2 = fbm(vec2(rayUv.x + t * 0.01, rayUv.y * 1.5 + 10.0));
    float core2 = smoothstep(0.7, 0.8, val2);
    float glow2 = smoothstep(0.5, 0.85, val2);
    float streak2 = core2 * 2.0 + glow2 * 0.6;
    
    // 3. Streak 3 Rays
    float val3 = fbm(vec2(rayUv.x * 2.0 + t * 0.02, rayUv.y * 2.5 + 20.0));
    float core3 = smoothstep(0.75, 0.85, val3);
    float glow3 = smoothstep(0.6, 0.9, val3);
    float streak3 = core3 * 2.5 + glow3 * 0.5;
    
    // Color composition
    vec3 col = uBackground;
    
    // Add the discrete curved lines
    col += uStreakColor1 * streak1;
    col += uStreakColor2 * streak2;
    col += uStreakColor3 * streak3;
    
    // Straight central glowing beam
    float beamThickness = x * 0.02 + 0.001; 
    float beamDist = abs(distY);
    float beamCore = exp(-beamDist / (beamThickness * 0.2));
    float beamGlow1 = exp(-beamDist / (beamThickness * 0.8));
    float beamGlow2 = exp(-beamDist / (beamThickness * 1.5));
    
    // Pulse the beam along X
    float beamPulse = smoothstep(0.3, 0.7, noise(vec2(rayX * 0.05 - t, 0.0)));
    
    col += uStreakColor1 * beamGlow1 * (0.5 + 0.5 * beamPulse);
    col += uStreakColor3 * beamGlow2 * (0.3 + 0.7 * beamPulse);
    col += vec3(1.0) * beamCore * (0.8 + 0.5 * beamPulse) * 1.5;
    
    // Central glowing core at the focal point
    float centralCoreDist = length(vec2(distX, distY * 2.0)); 
    float centralCore = exp(-centralCoreDist * 10.0);
    col += uCoreColor * centralCore * 2.0; 
    col += vec3(1.0) * centralCore * 1.0; 
    
    // Vertical fade
    float verticalFade = smoothstep(0.52, 0.45, abs(rayY));
    col *= verticalFade;
    
    // Subtle vignette
    float v = 1.0 - dot(uv - 0.5, uv - 0.5) * 1.2;
    col *= clamp(v, 0.0, 1.0);
    
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
export default function HyperspeedLightTunnel({ className = "", background = "#05000a", streakColor1 = "#ff007f", streakColor2 = "#7000ff", streakColor3 = "#00f0ff", coreColor = "#ffaa00", speed = 1.5, density = 30.0, curve = 1.5, children, }) {
    const canvasRef = useRef(null);
    const rafRef = useRef(null);
    const programRef = useRef(null);
    const uniformsRef = useRef({
        background, streakColor1, streakColor2, streakColor3, coreColor, speed, density, curve,
    });
    useEffect(() => {
        uniformsRef.current = {
            background, streakColor1, streakColor2, streakColor3, coreColor, speed, density, curve,
        };
    }, [background, streakColor1, streakColor2, streakColor3, coreColor, speed, density, curve]);
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
                    uStreakColor1: { value: hexToVec3(uniformsRef.current.streakColor1) },
                    uStreakColor2: { value: hexToVec3(uniformsRef.current.streakColor2) },
                    uStreakColor3: { value: hexToVec3(uniformsRef.current.streakColor3) },
                    uCoreColor: { value: hexToVec3(uniformsRef.current.coreColor) },
                    uSpeed: { value: uniformsRef.current.speed },
                    uDensity: { value: uniformsRef.current.density },
                    uCurve: { value: uniformsRef.current.curve },
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
                const u = program.uniforms;
                const cur = uniformsRef.current;
                u.uTime.value = (now - startTime) * 0.001;
                u.uBackground.value = hexToVec3(cur.background);
                u.uStreakColor1.value = hexToVec3(cur.streakColor1);
                u.uStreakColor2.value = hexToVec3(cur.streakColor2);
                u.uStreakColor3.value = hexToVec3(cur.streakColor3);
                u.uCoreColor.value = hexToVec3(cur.coreColor);
                u.uSpeed.value = cur.speed;
                u.uDensity.value = cur.density;
                u.uCurve.value = cur.curve;
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
