"use client";
import React, { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Color } from "ogl";
const vertexShader = `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;
const fragmentShader = `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;

  // Colors
  uniform vec3 uBaseColor1; // #0B0F1A
  uniform vec3 uBaseColor2; // #0F1626
  uniform vec3 uColor1;     // #6C5CE7 (indigo)
  uniform vec3 uColor2;     // #00D4FF (cyan)
  uniform vec3 uColor3;     // #FF6EC7 (pink)
  uniform vec3 uColor4;     // #7B5CFF (violet)
  uniform vec3 uHighlight;  // #FFFFFF

  // Animation configuration
  uniform float uSpeed;
  uniform float uWarpFreq;
  uniform float uWarpAmp;
  uniform float uIntensity;

  varying vec2 vUv;

  // Simplex 2D noise
  //
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);

    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;

    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));

    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
      dot(x12.zw,x12.zw)), 0.0);
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

  // Fractal Brownian Motion
  float fbm(vec2 x) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
    for (int i = 0; i < 5; ++i) { // 5 octaves
      v += a * snoise(x);
      x = rot * x * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // Normalize coordinates
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec2 p = uv * 2.0 - 1.0;
    p.x *= uResolution.x / uResolution.y;

    vec2 mouseP = uMouse * 2.0 - 1.0;
    mouseP.x *= uResolution.x / uResolution.y;

    // Water Ripple Effect around cursor
    float dist = length(p - mouseP);
    float ripple = sin(dist * 30.0 - uTime * 15.0) * 0.03 * exp(-dist * 5.0);
    if (dist > 0.001) {
      p += normalize(p - mouseP) * ripple;
    }

    // Base zoom and speed
    float time = uTime * uSpeed;

    // Subtle mouse movement influence
    vec2 mouseOffset = (uMouse - 0.5) * 0.20; 
    p += mouseOffset;

    vec2 q = vec2(0.0);
    q.x = fbm(p * uWarpFreq + vec2(0.0, 0.0) + time * 0.3);
    q.y = fbm(p * uWarpFreq + vec2(5.2, 1.3) + time * 0.2);

    vec2 r = vec2(0.0);
    r.x = fbm(p * uWarpFreq + uWarpAmp * q + vec2(1.7, 9.2) + time * 0.5);
    r.y = fbm(p * uWarpFreq + uWarpAmp * q + vec2(8.3, 2.8) + time * 0.4);

    float f = fbm(p * 1.1 + uWarpAmp * r + time * 0.2);

    // Color Mixing based on noise values
    // Depth base space color
    vec3 color = mix(uBaseColor1, uBaseColor2, uv.y);

    // Liquid Flow
    // Blend cyan and indigo using 'q' vector
    vec3 flowColor1 = mix(uColor2, uColor1, clamp(length(q) * 1.5, 0.0, 1.0));
    
    // Blend pink and violet using 'r' vector
    vec3 flowColor2 = mix(uColor3, uColor4, clamp(length(r) * 1.5, 0.0, 1.0));

    // Combine flows with fbm intensity
    color = mix(color, flowColor1, clamp(f * uIntensity * 2.5, 0.0, 1.0));
    color = mix(color, flowColor2, clamp(f * f * uIntensity * 3.0, 0.0, 1.0));

    // Breathing glow
    float pulse = sin(time * 2.0) * 0.5 + 0.5;
    float glow = exp(-3.0 * length(r - q));
    color += uHighlight * glow * (0.1 + 0.1 * pulse); // Soft white highlights with 10-20% opacity

    // Soft Bloom / Blur emulation via subtle smoothing
    color = smoothstep(0.0, 1.1, color);

    // Subtle stars (particles)
    float starDensity = snoise(p * 50.0);
    float starGlow = smoothstep(0.85, 1.0, starDensity) * 0.3;
    color += uHighlight * starGlow;

    gl_FragColor = vec4(color, 1.0);
  }
`;
export default function LiquidNebula({ className = "", speed = 0.35, warpFreq = 1.3, warpAmp = 0.8, baseColor1 = "#0B0F1A", baseColor2 = "#0F1626", color1 = "#6C5CE7", color2 = "#00D4FF", color3 = "#FF6EC7", color4 = "#7B5CFF", highlight = "#FFFFFF", intensity = 0.65, }) {
    const containerRef = useRef(null);
    const mouseRef = useRef([0.5, 0.5]); // Center initially
    const programRef = useRef(null);
    useEffect(() => {
        const container = containerRef.current;
        if (!container)
            return;
        // Initialize OGL Renderer
        const renderer = new Renderer({ alpha: true, antialias: true });
        const gl = renderer.gl;
        container.appendChild(gl.canvas);
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        // Resize handling
        const resize = () => {
            renderer.setSize(container.clientWidth, container.clientHeight);
            program.uniforms.uResolution.value = [
                gl.canvas.width,
                gl.canvas.height,
            ];
        };
        window.addEventListener("resize", resize);
        // Geometry & Shader Program
        const geometry = new Triangle(gl);
        const program = new Program(gl, {
            vertex: vertexShader,
            fragment: fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uResolution: { value: [gl.canvas.width, gl.canvas.height] },
                uMouse: { value: [0.5, 0.5] },
                uBaseColor1: { value: new Color(baseColor1) },
                uBaseColor2: { value: new Color(baseColor2) },
                uColor1: { value: new Color(color1) },
                uColor2: { value: new Color(color2) },
                uColor3: { value: new Color(color3) },
                uColor4: { value: new Color(color4) },
                uHighlight: { value: new Color(highlight) },
                uSpeed: { value: speed },
                uWarpFreq: { value: warpFreq },
                uWarpAmp: { value: warpAmp },
                uIntensity: { value: intensity },
            },
        });
        programRef.current = program;
        const mesh = new Mesh(gl, { geometry, program });
        // Handle mouse move
        const onMouseMove = (e) => {
            const rect = container.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = 1.0 - (e.clientY - rect.top) / rect.height; // invert Y for WebGL
            // Smooth interpolation towards mouse position
            mouseRef.current[0] += (x - mouseRef.current[0]) * 0.1;
            mouseRef.current[1] += (y - mouseRef.current[1]) * 0.1;
        };
        window.addEventListener("mousemove", onMouseMove);
        // Animation Loop
        let requestID;
        const update = (t) => {
            requestID = requestAnimationFrame(update);
            program.uniforms.uTime.value = t * 0.001;
            // Interpolate mouse for smooth transitions
            const uMouse = program.uniforms.uMouse.value;
            uMouse[0] += (mouseRef.current[0] - uMouse[0]) * 0.05;
            uMouse[1] += (mouseRef.current[1] - uMouse[1]) * 0.05;
            renderer.render({ scene: mesh });
        };
        resize();
        requestID = requestAnimationFrame(update);
        // Cleanup
        return () => {
            cancelAnimationFrame(requestID);
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", onMouseMove);
            if (container && gl.canvas.parentNode) {
                container.removeChild(gl.canvas);
            }
            gl.getExtension("WEBGL_lose_context")?.loseContext();
        };
    }, []);
    useEffect(() => {
        if (!programRef.current)
            return;
        programRef.current.uniforms.uBaseColor1.value.set(baseColor1);
        programRef.current.uniforms.uBaseColor2.value.set(baseColor2);
        programRef.current.uniforms.uColor1.value.set(color1);
        programRef.current.uniforms.uColor2.value.set(color2);
        programRef.current.uniforms.uColor3.value.set(color3);
        programRef.current.uniforms.uColor4.value.set(color4);
        programRef.current.uniforms.uHighlight.value.set(highlight);
        programRef.current.uniforms.uSpeed.value = speed;
        programRef.current.uniforms.uWarpFreq.value = warpFreq;
        programRef.current.uniforms.uWarpAmp.value = warpAmp;
        programRef.current.uniforms.uIntensity.value = intensity;
    }, [baseColor1, baseColor2, color1, color2, color3, color4, highlight, speed, warpFreq, warpAmp, intensity]);
    return (<div ref={containerRef} className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none ${className}`} style={{ background: baseColor1, zIndex: -1 }}/>);
}
