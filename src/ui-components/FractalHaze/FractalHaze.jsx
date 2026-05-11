'use client';
import { useEffect, useRef } from "react";
import styles from "./FractalHaze.module.css";
const VERT = /* glsl */ `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;
const FRAG = /* glsl */ `
precision highp float;

uniform vec2  uResolution;
uniform float uTime;
uniform float uSpeed;
uniform float uBarWidth;
uniform vec3  uColor1;
uniform vec3  uColor2;
uniform vec3  uColor3;
uniform vec3  uColor4;
uniform vec3  uColor5;
uniform vec3  uColor6;

/* ─── helpers ──────────────────────────────────────────────────── */

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 getBg(vec2 uv, float time) {
    float t = time * uSpeed; // Speed uniform
    
    // Complex organic waves for fast, high-quality fluid motion
    vec2 p = uv;
    p.x += sin(p.y * 4.0 + t) * 0.12 + sin(p.y * 7.0 - t * 1.2) * 0.05;
    p.y += cos(p.x * 4.0 - t * 0.8) * 0.12 + cos(p.x * 8.0 + t) * 0.05;

    vec3 col = uColor1; // Deep red base

    // Main Crimson Body (moves fluidly left/right rapidly)
    float redCenter = 0.35 + sin(p.y * 2.0 + t * 0.8) * 0.15; 
    float redStrength = smoothstep(0.45, 0.0, abs(p.x - redCenter));
    col = mix(col, uColor2, redStrength);

    // Top Right White / Pale Pink
    float whiteDist = length(vec2((p.x - 1.0) * 0.8, p.y - 1.0));
    float whiteStrength = smoothstep(0.8, 0.0, whiteDist);
    col = mix(col, uColor3, whiteStrength);

    // Right Dark Void (Middle Right)
    float voidDist = length(vec2((p.x - 0.7)*1.2, p.y - 0.4));
    float voidStrength = smoothstep(0.5, 0.0, voidDist);
    col = mix(col, uColor4, voidStrength * 0.95);

    // Bottom Right Deep Red
    float brDist = length(vec2(p.x - 1.0, p.y + 0.1));
    float brStrength = smoothstep(0.5, 0.0, brDist);
    col = mix(col, uColor5, brStrength * 0.8);

    // Left Edge
    float leftMix = smoothstep(0.2, 0.8, p.y);
    vec3 leftColor = mix(uColor6, uColor4, leftMix);
    float leftStrength = smoothstep(0.3, -0.1, p.x);
    col = mix(col, leftColor, leftStrength);

    return col;
}

/* ─── main ──────────────────────────────────────────────────────── */

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  uv.y = 1.0 - uv.y;               /* flip Y so 0 = top */

  // Number of glass flutes
  float colCount = uResolution.x / uBarWidth;
  
  // local u inside each flute (-1 to +1)
  float localU = fract(uv.x * colCount) * 2.0 - 1.0;
  
  // Lens curve: z is the thickness or height of the glass
  float z = sqrt(1.0 - localU * localU);
  
  // Refraction offsets the background UV horizontally based on the lens curve
  float refractionStrength = 0.015;
  vec2 refractedUv = uv;
  refractedUv.x -= localU * refractionStrength;
  
  // Get the background fluid color
  vec3 col = getBg(refractedUv, uTime);
  
  // Physically accurate lighting for the fluted glass
  // Light from top-left. Normal X is localU, Normal Z is z.
  vec3 normal = normalize(vec3(localU, 0.0, z));
  vec3 lightDir = normalize(vec3(-0.8, 0.0, 0.6));
  float diffuse = dot(normal, lightDir);
  
  // Shadow on the right side of the flute
  float rightShadow = smoothstep(0.0, 1.0, localU);
  col = mix(col, col * 0.4, rightShadow * 0.8);
  
  // Specular highlight on the left edge - sharper to match the new image
  float spec = pow(max(0.0, diffuse), 10.0) * 0.6;
  col += spec * (col + 0.5); // Tinted bright glow

  gl_FragColor = vec4(col, 1.0);
}
`;
const hexToRgb = (hex) => {
    let c = hex.replace(/^#/, '');
    if (c.length === 3)
        c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
};
export default function FractalHaze({ children, className = "", speed = 1.8, barWidth = 27.0, color1 = "#260005", color2 = "#ff001a", color3 = "#fff2e5", color4 = "#05000c", color5 = "#7f0005", color6 = "#99ccff" }) {
    const safeSpeed = Math.max(0, Math.min(speed, 5));
    const canvasRef = useRef(null);
    const rafRef = useRef(null);
    const programRef = useRef(null);
    useEffect(() => {
        let renderer, program, mesh, startTime;
        let ro;
        async function init() {
            /* ── dynamic import so OGL is optional at bundle time ── */
            const { Renderer, Program, Mesh, Triangle } = await import("ogl");
            const canvas = canvasRef.current;
            if (!canvas)
                return;
            renderer = new Renderer({ canvas, alpha: false, antialias: true, dpr: typeof window !== 'undefined' ? window.devicePixelRatio : 1 });
            const gl = renderer.gl;
            gl.clearColor(0, 0, 0, 1);
            const geometry = new Triangle(gl);
            program = new Program(gl, {
                vertex: VERT,
                fragment: FRAG,
                uniforms: {
                    uResolution: { value: [canvas.width, canvas.height] },
                    uTime: { value: 0 },
                    uSpeed: { value: safeSpeed },
                    uBarWidth: { value: barWidth },
                    uColor1: { value: hexToRgb(color1) },
                    uColor2: { value: hexToRgb(color2) },
                    uColor3: { value: hexToRgb(color3) },
                    uColor4: { value: hexToRgb(color4) },
                    uColor5: { value: hexToRgb(color5) },
                    uColor6: { value: hexToRgb(color6) },
                },
            });
            programRef.current = program;
            mesh = new Mesh(gl, { geometry, program });
            /* ── resize handler ── */
            ro = new ResizeObserver((entries) => {
                const entry = entries[0];
                if (entry) {
                    const { width, height } = entry.contentRect;
                    renderer.setSize(width, height);
                    if (programRef.current) {
                        programRef.current.uniforms.uResolution.value = [
                            width * renderer.dpr,
                            height * renderer.dpr,
                        ];
                    }
                }
            });
            if (canvas.parentElement) {
                ro.observe(canvas.parentElement);
            }
            /* ── animation loop ── */
            startTime = performance.now();
            function frame() {
                rafRef.current = requestAnimationFrame(frame);
                if (programRef.current) {
                    programRef.current.uniforms.uTime.value = (performance.now() - startTime) * 0.001;
                }
                renderer.render({ scene: mesh });
            }
            rafRef.current = requestAnimationFrame(frame);
            /* return cleanup references */
            return () => {
                if (ro)
                    ro.disconnect();
                if (rafRef.current)
                    cancelAnimationFrame(rafRef.current);
                renderer.gl.getExtension("WEBGL_lose_context")?.loseContext();
            };
        }
        let cleanup;
        init().then((fn) => { cleanup = fn; });
        return () => {
            cleanup?.();
            if (rafRef.current)
                cancelAnimationFrame(rafRef.current);
        };
    }, []); // Initialize once
    // Update uniforms when props change
    useEffect(() => {
        if (programRef.current) {
            programRef.current.uniforms.uSpeed.value = safeSpeed;
            programRef.current.uniforms.uBarWidth.value = barWidth;
            programRef.current.uniforms.uColor1.value = hexToRgb(color1);
            programRef.current.uniforms.uColor2.value = hexToRgb(color2);
            programRef.current.uniforms.uColor3.value = hexToRgb(color3);
            programRef.current.uniforms.uColor4.value = hexToRgb(color4);
            programRef.current.uniforms.uColor5.value = hexToRgb(color5);
            programRef.current.uniforms.uColor6.value = hexToRgb(color6);
        }
    }, [safeSpeed, barWidth, color1, color2, color3, color4, color5, color6]);
    return (<div className={`${styles.wrapper} ${className}`.trim()}>
            <canvas ref={canvasRef} className={styles["fractal-haze-canvas"]}/>
            {children && (<div className={styles.content}>
                    {children}
                </div>)}
        </div>);
}
