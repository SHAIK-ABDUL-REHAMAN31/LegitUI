'use client';

import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle, Transform } from 'ogl';

const vertexShader = /* glsl */ `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2  uResolution;

  varying vec2 vUv;

  void main() {
    // Invert UV so 0 is top, 1 is bottom to match the wave height model
    vec2 uv = vec2(vUv.x, 1.0 - vUv.y);

    float ribbonCount = 70.0;
    float ribbonX = uv.x * ribbonCount;
    float ribbonIdx = floor(ribbonX);
    float ribbonFrac = fract(ribbonX);  // 0=left edge, 1=right edge of one fin

    // Dark seam at left edge of each ribbon (simulate gap between fins)
    float seam = smoothstep(0.0, 0.06, ribbonFrac);  // fade in from left

    // Normalized x position of this ribbon (0->1)
    float nx = ribbonIdx / ribbonCount;

    // Wave height profile — two peaks, one valley
    float waveH = 0.87                                     // base floor (moved down by 0.25)
      - 0.22 * exp(-pow((nx - 0.30) * 3.8, 2.0))          // LEFT peak at 30%
      - 0.18 * exp(-pow((nx - 0.74) * 3.5, 2.0))          // RIGHT peak at 74%
      + 0.06 * exp(-pow((nx - 0.52) * 5.0, 2.0))          // center valley bump
      + 0.055 * sin(nx * 14.0 + uTime * 0.55)             // fine ripple animation
      + 0.025 * sin(nx * 28.0 + uTime * 0.90);            // micro detail

    // Clip: above wave top = background
    if (uv.y < waveH) { 
      // Deep black with elliptical green glow centered at ~(50%, 56%)
      vec2 glowCenter = vec2(0.50, 0.56);
      float glowDist  = length((uv - glowCenter) * vec2(1.0, 1.6));
      float glow      = exp(-glowDist * glowDist * 5.5) * (0.80 + 0.20 * sin(uTime * 0.5));
      vec3 bg         = vec3(0.005, 0.008, 0.005)
                      + vec3(0.010, 0.090, 0.025) * glow;
      gl_FragColor = vec4(bg, 1.0);
      return; 
    }

    // Vertical position within the ribbon (0=top edge, 1=bottom)
    float ribbonV = (uv.y - waveH) / (1.0 - waveH);

    // Zone 1: LEFT face of fin (dark — facing away from light)
    float leftFace  = smoothstep(0.30, 0.00, ribbonFrac);

    // Zone 2: RIGHT face of fin (lit — facing toward light)  
    float rightFace = smoothstep(0.70, 1.00, ribbonFrac);

    // Zone 3: Front face (flat center panel)
    float frontFace = 1.0 - leftFace - rightFace;

    // Brightness by face
    float faceBright = 0.25 * leftFace    // dark left
                     + 0.85 * frontFace   // medium front
                     + 1.00 * rightFace;  // bright right

    // Exponential falloff from top edge downward
    float vertGrad = exp(-ribbonV * 4.5);

    // Bright cap at top edge (top 3% of ribbon)
    float topCap = smoothstep(0.06, 0.0, ribbonV) * 1.8;

    // Height-based brightness boost — taller ribbons (near peaks) are brighter overall
    float heightBoost = 1.0 - waveH;  // taller ribbon = larger value
    float brightness = faceBright * vertGrad * (0.6 + heightBoost * 0.9) + topCap;

    vec3 dark    = vec3(0.008, 0.055, 0.015);   // deep shadow base
    vec3 mid     = vec3(0.020, 0.180, 0.045);   // mid ribbon body
    vec3 bright  = vec3(0.055, 0.560, 0.110);   // lit surface
    vec3 hotEdge = vec3(0.100, 0.950, 0.200);   // top cap glow

    vec3 ribbonColor = mix(dark, mid,     smoothstep(0.0, 0.3, brightness));
    ribbonColor      = mix(ribbonColor, bright,  smoothstep(0.3, 0.7, brightness));
    ribbonColor      = mix(ribbonColor, hotEdge, smoothstep(0.7, 1.0, brightness));
    ribbonColor     *= seam;  // apply seam darkening

    gl_FragColor = vec4(ribbonColor, 1.0);
  }
`;

/* ─────────────── React Component ─────────────── */

export default function GreenWaveRibbons() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

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
        gl.clearColor(3 / 255, 5 / 255, 3 / 255, 1);

        const scene = new Transform();

        const resize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            renderer.setSize(w, h);
            if (program) program.uniforms.uResolution.value = [w * dpr, h * dpr];
        };

        const geometry = new Triangle(gl);
        const program = new Program(gl, {
            vertex: vertexShader,
            fragment: fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uResolution: { value: [window.innerWidth * dpr, window.innerHeight * dpr] },
            },
            depthTest: false,
            depthWrite: false,
            cullFace: false,
        });

        const mesh = new Mesh(gl, { geometry, program });
        mesh.setParent(scene);

        resize();
        window.addEventListener('resize', resize);

        let time = 0;
        let frameId: number;
        const animate = () => {
            frameId = requestAnimationFrame(animate);
            time += 0.007;
            program.uniforms.uTime.value = time;
            renderer.render({ scene });
        };
        frameId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('resize', resize);
            if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
            program.remove();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 0,
                overflow: 'hidden',
            }}
        />
    );
}
