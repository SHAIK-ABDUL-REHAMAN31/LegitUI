"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import styles from "./LiquidChromeParticles.module.css";

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying float vDistance;
  
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uPixelRatio;
  uniform float uSpeed;
  uniform float uParticleSize;

  // Simple noise function
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                       -0.577350269189626,  // -1.0 + 2.0 * C.x
                        0.024390243902439); // 1.0 / 41.0
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vUv = uv;
    vPosition = position;
    
    vec3 pos = position;
    
    // Calm ocean flow
    float wave = snoise(pos.xy * 0.2 + uTime * uSpeed);
    pos.z += wave * 0.4;

    // Cursor interaction (Glow only)
    float dist = distance(pos.xy, uMouse);
    vDistance = dist;
    
    // No XY displacement to ensure full fill
    float lift = exp(-dist * dist * 0.5) * 1.0;
    pos.z += lift;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = (uParticleSize + wave * 5.0 + lift * 8.0) * (1.0 / -mvPosition.z) * uPixelRatio;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying float vDistance;
  varying vec3 vPosition;
  uniform float uTime;
  uniform vec3 uBaseColor;
  uniform vec3 uHighlightColor;
  uniform vec3 uGlowColor;

  void main() {
    // Circle shape with soft edges
    float d = distance(gl_PointCoord, vec2(0.5));
    if (d > 0.5) discard;
    
    // Smooth circle edge
    float alpha = smoothstep(0.5, 0.45, d);
    
    // Iridescent Chrome / Metallic look
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    
    // Fake environment reflection
    float reflection = sin(vPosition.x * 3.0 + vPosition.y * 3.0 + uTime * 2.0 + cxy.x * 3.0) * 0.5 + 0.5;
    reflection = pow(reflection, 3.0); 
    
    // Fresnel-like edge highlight
    float fresnel = pow(d * 2.0, 4.0);
    
    vec3 color = mix(uBaseColor, uHighlightColor, reflection * 0.7);
    color = mix(color, uHighlightColor, fresnel * 0.3);
    
    // Cursor Glow (Highlight the particles near mouse)
    float glow = exp(-vDistance * vDistance * 1.5);
    color += uGlowColor * glow * 0.6;
    
    gl_FragColor = vec4(color, alpha * (0.8 + reflection * 0.2 + glow * 0.2));
  }
`;

export interface LiquidChromeParticlesProps {
    className?: string;
    particleCount?: number;
    baseColor?: string;
    highlightColor?: string;
    glowColor?: string;
    speed?: number;
    particleSize?: number;
    background?: string;
}

const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? new THREE.Color(
              parseInt(result[1], 16) / 255,
              parseInt(result[2], 16) / 255,
              parseInt(result[3], 16) / 255
          )
        : new THREE.Color();
};

function Particles({
    particleCount,
    baseColor,
    highlightColor,
    glowColor,
    speed,
    particleSize,
}: {
    particleCount: number;
    baseColor: string;
    highlightColor: string;
    glowColor: string;
    speed: number;
    particleSize: number;
}) {
    const meshRef = useRef<THREE.Points>(null);
    const { size, viewport } = useThree();
    const dpr = viewport.dpr;

    const particles = useMemo(() => {
        const temp = new Float32Array(particleCount * 3);
        const cols = Math.floor(Math.sqrt(particleCount));
        const rows = cols;
        const spacing = 0.15;

        for (let i = 0; i < particleCount; i++) {
            const row = Math.floor(i / cols);
            const col = i % cols;

            const x = (col - cols / 2) * spacing;
            const y = (row - rows / 2) * spacing;

            temp[i * 3] = x;
            temp[i * 3 + 1] = y;
            temp[i * 3 + 2] = 0;
        }
        return temp;
    }, [particleCount]);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(0, 0) },
            uPixelRatio: { value: dpr },
            uBaseColor: { value: hexToRgb(baseColor) },
            uHighlightColor: { value: hexToRgb(highlightColor) },
            uGlowColor: { value: hexToRgb(glowColor) },
            uSpeed: { value: speed },
            uParticleSize: { value: particleSize },
        }),
        [dpr, baseColor, highlightColor, glowColor, speed, particleSize]
    );

    const targetMouse = useRef(new THREE.Vector2(0, 0));

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Normalized coordinates (-1 to 1)
            const nx = (e.clientX / window.innerWidth) * 2 - 1;
            const ny = -(e.clientY / window.innerHeight) * 2 + 1;
            targetMouse.current.set(nx, ny);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        const { clock, viewport } = state;
        
        const material = meshRef.current.material as THREE.ShaderMaterial;
        material.uniforms.uTime.value = clock.getElapsedTime();

        // Convert normalized mouse coords to world coordinates at z=0
        const worldX = (targetMouse.current.x * viewport.width) / 2;
        const worldY = (targetMouse.current.y * viewport.height) / 2;

        // Apply ultra-smooth, framerate-independent damping to the uniform
        const uMouse = material.uniforms.uMouse.value;
        uMouse.x = THREE.MathUtils.damp(uMouse.x, worldX, 4, delta);
        uMouse.y = THREE.MathUtils.damp(uMouse.y, worldY, 4, delta);
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[particles, 3]}
                />
            </bufferGeometry>
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

export default function LiquidChromeParticles({
    className = "",
    particleCount = 40000,
    baseColor = "#05050a",
    highlightColor = "#ffffff",
    glowColor = "#6699ff",
    speed = 0.3,
    particleSize = 12.0,
    background = "#050505",
}: LiquidChromeParticlesProps) {
    return (
        <div 
            className={`${styles.container} ${className}`}
            style={{ backgroundColor: background }}
        >
            <Canvas
                camera={{ position: [0, 0, 5], fov: 75 }}
                dpr={[1, 2]}
            >
                <Particles 
                    particleCount={particleCount}
                    baseColor={baseColor}
                    highlightColor={highlightColor}
                    glowColor={glowColor}
                    speed={speed}
                    particleSize={particleSize}
                />
            </Canvas>
        </div>
    );
}
