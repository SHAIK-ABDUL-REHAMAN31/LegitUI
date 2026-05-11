'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './NeonWaves.css';

/* ─────────────────────────────────────────────────────────────────
   VERTEX SHADER
───────────────────────────────────────────────────────────────── */
const VERTEX_SHADER = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}
`;

/* ─────────────────────────────────────────────────────────────────
   FRAGMENT SHADER
───────────────────────────────────────────────────────────────── */
const FRAGMENT_SHADER = `
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uSpeed;
varying vec2 vUv;

void main() {
    vec2 uv = (vUv - 0.5) * 2.0;
    uv.x *= uResolution.x / uResolution.y;

    // React to cursor softly
    vec2 mouse = (uMouse - 0.5) * 2.0;
    mouse.x *= uResolution.x / uResolution.y;
    
    // Calculate cursor interaction
    float distToMouse = length(uv - mouse);
    float interaction = exp(-distToMouse * distToMouse * 3.0);
    
    vec3 finalColor = vec3(0.0);

    // Number of lines in bundle
    const int numLines = 40;
    
    for(int i = 0; i < numLines; i++) {
        float fi = float(i);
        
        // Slightly different speed for each line
        float t = uTime * uSpeed * (0.15 + fi * 0.005) + fi * 0.2;
        
        // Primary macro sweep: Left to right like an arching bridge.
        float y = cos(uv.x * 0.8) * 0.6 - 0.4; // Beautiful broad bridge arch
        y += sin(uv.x * 1.5 + t) * 0.15;      // Adding gentle life/wave motion
        
        // Internal bundling spread (so it looks like multiple optical cables)
        float spread = sin(uv.x * 3.0 + t * 1.5 + fi * 15.0) * 0.1;
        y += spread;

        // Interaction distortion: Create a "line shape ball" (orb wrapping) around the cursor
        vec2 diff = uv - mouse;
        float distToMouse = length(diff);
        float ballRadius = 0.4; // Size of the interactive wire ball
        
        if (distToMouse < ballRadius) {
            float strength = smoothstep(ballRadius, 0.0, distToMouse);
            
            // Randomly decide if this specific line wraps OVER or UNDER the ball
            float wrapDir = sign(sin(fi * 45.1)); 
            
            // Compute the spherical y-offset at this x-position to form a perfect circle
            float xOffset = clamp(diff.x, -ballRadius, ballRadius);
            float sphereYOff = sqrt(ballRadius * ballRadius - xOffset * xOffset);
            
            // target Y on the shell of the hover-ball
            float targetY = mouse.y + wrapDir * sphereYOff;
            
            // Smoothly pull the line into the shell formation
            y = mix(y, targetY, strength * 0.85); // 0.85 ensures it's slightly messy/organic
        }

        // Distance from current fragment to the computed line y-coord
        float distanceToLine = abs(uv.y - y);
        
        // Core glow and soft aura
        // Thinner intense core, softer falloff
        float intensity = 0.002 / (distanceToLine + 0.001);
        
        // Faint outer bloom
        intensity += exp(-distanceToLine * 15.0) * 0.15;
        
        // Color mapping
        vec3 color = mix(
            uColor1,
            uColor2,
            sin(fi * 23.45) * 0.5 + 0.5
        );
        
        // Occasionally make a string super bright
        float brightness = mix(0.5, 1.5, sin(fi * 11.1) * 0.5 + 0.5);
        
        // --- Intro Drawing Animation ---
        // Lines trace out from the left edge (-2.5) over time on refresh
        float introTime = uTime * 3.0 * uSpeed - fi * 0.15; // Stagger the start times slightly for each string
        float lineFront = -2.5 + introTime;
        
        // Visibility mask based on x position to create the drawing effect
        float drawMask = smoothstep(0.0, 0.4, lineFront - uv.x);
        
        float finalIntensity = intensity * brightness * drawMask * 0.6;
        finalColor += color * finalIntensity;
    }

    // Vignette for depth
    finalColor *= 1.0 - dot(uv, uv) * 0.15;
    
    // ACES tonemapping
    finalColor = (finalColor * (2.51 * finalColor + 0.03)) / (finalColor * (2.43 * finalColor + 0.59) + 0.14);
    
    // Gamma correction
    finalColor = pow(finalColor, vec3(1.0 / 2.2));

    gl_FragColor = vec4(finalColor, 1.0);
}
`;

/* ─────────────────────────────────────────────────────────────────
   REACT COMPONENT
───────────────────────────────────────────────────────────────── */
export default function NeonWaves({
    lineColor1 = '#ff0096',
    lineColor2 = '#0066ff',
    backgroundColor = 'transparent',
    waveSpeed = 1.0,
    className = '',
    style = {},
    children
}) {
    const containerRef = useRef(null);
    const uniformsRef = useRef({
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2() },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uColor1: { value: new THREE.Color(lineColor1) },
        uColor2: { value: new THREE.Color(lineColor2) },
        uSpeed: { value: waveSpeed }
    });

    useEffect(() => {
        if (uniformsRef.current) {
            uniformsRef.current.uColor1.value.set(lineColor1);
            uniformsRef.current.uColor2.value.set(lineColor2);
            uniformsRef.current.uSpeed.value = waveSpeed;
        }
    }, [lineColor1, lineColor2, waveSpeed]);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;

        // Setup Three.js
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Clear any existing children to prevent duplication on hot reloads
        container.innerHTML = '';
        container.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        const geometry = new THREE.PlaneGeometry(2, 2);

        const material = new THREE.ShaderMaterial({
            vertexShader: VERTEX_SHADER,
            fragmentShader: FRAGMENT_SHADER,
            uniforms: uniformsRef.current,
            transparent: true,
            depthWrite: false
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        const startTime = performance.now();

        let rafId;

        const resize = () => {
            const width = container.clientWidth;
            const height = container.clientHeight;
            renderer.setSize(width, height);
            uniformsRef.current.uResolution.value.set(width, height);
        };

        // Target mouse value, updated via event
        const targetMouse = new THREE.Vector2(0.5, 0.5);

        const handleMouseMove = (e) => {
            const rect = container.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = 1.0 - (e.clientY - rect.top) / rect.height;
            targetMouse.set(x, y);
        };

        const handleMouseLeave = () => {
            // Return to center when mouse leaves
            targetMouse.set(0.5, 0.5);
        };

        window.addEventListener('resize', resize);
        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseLeave);

        resize();

        const animate = () => {
            rafId = requestAnimationFrame(animate);

            // Smoothly interpolate mouse
            uniformsRef.current.uMouse.value.lerp(targetMouse, 0.05);

            uniformsRef.current.uTime.value = (performance.now() - startTime) / 1000;
            renderer.render(scene, camera);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(rafId);

            geometry.dispose();
            material.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <div className={`waves-root ${className}`} style={{ backgroundColor, ...style }}>
            <div
                ref={containerRef}
                className="waves-canvas"
                style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'auto' }}
            />
            {children && (
                <div className="waves-content" style={{ position: 'relative', zIndex: 2, pointerEvents: 'none' }}>
                    {/* Let children be interactive if they want to */}
                    <div style={{ pointerEvents: 'auto' }}>{children}</div>
                </div>
            )}
        </div>
    );
}