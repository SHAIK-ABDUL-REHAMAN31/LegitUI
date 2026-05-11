"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Points, PointMaterial } from "@react-three/drei";

const PARTICLE_COUNT = 40000;

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying float vDistance;
  
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uPixelRatio;

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
    float wave = snoise(pos.xy * 0.2 + uTime * 0.3);
    pos.z += wave * 0.4;

    // Cursor interaction (Glow only)
    float dist = distance(pos.xy, uMouse * 15.0);
    vDistance = dist;
    
    // No XY displacement to ensure full fill
    float lift = exp(-dist * dist * 0.5) * 1.0;
    pos.z += lift;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = (12.0 + wave * 5.0 + lift * 8.0) * (1.0 / -mvPosition.z) * uPixelRatio;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying float vDistance;
  varying vec3 vPosition;
  uniform float uTime;

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
    
    // Base colors - Deep Metallic Chrome
    vec3 baseColor = vec3(0.02, 0.02, 0.04); 
    vec3 highlightColor = vec3(1.0, 1.0, 1.0);
    
    vec3 color = mix(baseColor, highlightColor, reflection * 0.7);
    color = mix(color, highlightColor, fresnel * 0.3);
    
    // Cursor Glow (Highlight the particles near mouse)
    float glow = exp(-vDistance * vDistance * 1.5);
    color += vec3(0.4, 0.6, 1.0) * glow * 0.6;
    
    gl_FragColor = vec4(color, alpha * (0.8 + reflection * 0.2 + glow * 0.2));
  }
`;

function Particles() {
    const meshRef = useRef<THREE.Points>(null);
    const { size, viewport } = useThree();
    const dpr = viewport.dpr;

    const particles = useMemo(() => {
        const temp = new Float32Array(PARTICLE_COUNT * 3);
        const side = Math.sqrt(PARTICLE_COUNT);
        const rows = 200;
        const cols = 200;
        const spacing = 0.15; // Sufficient to cover large viewports

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const row = Math.floor(i / cols);
            const col = i % cols;

            const x = (col - cols / 2) * spacing;
            const y = (row - rows / 2) * spacing;

            temp[i * 3] = x;
            temp[i * 3 + 1] = y;
            temp[i * 3 + 2] = 0;
        }
        return temp;
    }, []);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(0, 0) },
            uPixelRatio: { value: dpr },
        }),
        [dpr]
    );

    useFrame((state) => {
        if (!meshRef.current) return;

        const { clock, mouse } = state;
        // @ts-ignore
        meshRef.current.material.uniforms.uTime.value = clock.getElapsedTime();
        // @ts-ignore
        meshRef.current.material.uniforms.uMouse.value.lerp(mouse, 0.1);
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

export default function LiquidChromiumParticles() {
    return (
        <div className="absolute inset-0 w-full h-full -z-10 bg-[#050505]">
            <Canvas
                camera={{ position: [0, 0, 5], fov: 75 }}
                dpr={[1, 2]}
            >
                <Particles />
            </Canvas>
        </div>
    );
}
