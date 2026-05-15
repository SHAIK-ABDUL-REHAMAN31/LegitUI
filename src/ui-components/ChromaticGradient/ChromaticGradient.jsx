import React, { useRef, useEffect } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";
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

uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;

varying vec2 vUv;

// Ashima's Simplex 3D Noise
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){ 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

  i = mod(i, 289.0 ); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  float n_ = 1.0/7.0;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
}

vec3 computeColor(vec2 uv, float t, vec2 resolution, vec2 mouse) {
    vec2 aspect = vec2(resolution.x / resolution.y, 1.0);
    vec2 p = (uv * 2.0 - 1.0) * aspect;
    
    // Parallax mouse effect
    p -= mouse * 0.15;
    
    // Soft flowing distortion
    float n1 = snoise(vec3(p * 0.8, t * 0.15));
    float n2 = snoise(vec3(p * 1.2 + n1, t * 0.2));
    float n3 = snoise(vec3(p * 2.0 + n2, t * 0.25));
    
    vec2 distorted = p + vec2(n2, n3) * 0.8;
    
    // Bloom 1
    vec2 pos1 = vec2(sin(t * 0.3) * 0.5, cos(t * 0.4) * 0.3) * aspect;
    float d1 = length(distorted - pos1);
    float glow1 = exp(-d1 * d1 * 1.5) * 0.8;
    vec3 col1 = uColor1 * glow1;
    
    // Bloom 2
    vec2 pos2 = vec2(cos(t * 0.5) * 0.6, sin(t * 0.2) * 0.4) * aspect;
    float d2 = length(distorted - pos2);
    float glow2 = exp(-d2 * d2 * 2.0) * 0.7;
    vec3 col2 = uColor2 * glow2;
    
    // Bloom 3
    vec2 pos3 = vec2(sin(t * 0.2 + 2.0) * 0.4, cos(t * 0.6 + 1.0) * 0.5) * aspect;
    float d3 = length(distorted - pos3);
    float glow3 = exp(-d3 * d3 * 1.2) * 0.5;
    vec3 col3 = uColor3 * glow3;
    
    vec3 color = col1 + col2 + col3;
    
    // Subtle pulsing
    float pulse = snoise(vec3(p * 0.5, t * 0.5)) * 0.1 + 0.9;
    color *= pulse;
    
    return color;
}

void main() {
    vec2 uv = vUv;
    vec2 center = vec2(0.5);
    float dist = length(uv - center);
    
    // Chromatic aberration
    float caStrength = dist * 0.015;
    vec2 dir = normalize(uv - center);
    
    float r = computeColor(uv + dir * caStrength, uTime, uResolution, uMouse).r;
    float g = computeColor(uv, uTime, uResolution, uMouse).g;
    float b = computeColor(uv - dir * caStrength, uTime, uResolution, uMouse).b;
    
    vec3 finalColor = vec3(r, g, b);
    
    // Grain
    float grain = (fract(sin(dot(uv.xy, vec2(12.9898,78.233))) * 43758.5453123) - 0.5) * 0.04;
    finalColor += grain;
    
    // Vignette for a cinematic look
    float vignette = 1.0 - smoothstep(0.5, 1.2, dist);
    finalColor *= vignette;

    gl_FragColor = vec4(finalColor, 1.0);
}
`;
export function ChromaticGradient({ className = "", colors = {
    color1: [0.4, 0.1, 0.9], // Deep purple
    color2: [0.1, 0.5, 1.0], // Bright blue
    color3: [0.0, 0.8, 0.9], // Cyan
}, speed = 1.0, children, }) {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
    useEffect(() => {
        if (!containerRef.current || !canvasRef.current)
            return;
        const renderer = new Renderer({
            canvas: canvasRef.current,
            alpha: true,
            antialias: true,
            dpr: Math.min(window.devicePixelRatio, 2),
        });
        const gl = renderer.gl;
        const geometry = new Triangle(gl);
        const program = new Program(gl, {
            vertex: vertexShader,
            fragment: fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uResolution: { value: [gl.canvas.width, gl.canvas.height] },
                uMouse: { value: [0, 0] },
                uColor1: { value: colors.color1 || [0.4, 0.1, 0.9] },
                uColor2: { value: colors.color2 || [0.1, 0.5, 1.0] },
                uColor3: { value: colors.color3 || [0.0, 0.8, 0.9] },
            },
        });
        const mesh = new Mesh(gl, { geometry, program });
        let animationId;
        const startTime = performance.now();
        const resize = () => {
            if (!containerRef.current)
                return;
            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;
            renderer.setSize(width, height);
            program.uniforms.uResolution.value = [width, height];
        };
        window.addEventListener("resize", resize);
        resize();
        const handleMouseMove = (e) => {
            const rect = gl.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width * 2 - 1;
            const y = -(e.clientY - rect.top) / rect.height * 2 + 1;
            mouseRef.current.targetX = x;
            mouseRef.current.targetY = y;
        };
        window.addEventListener("mousemove", handleMouseMove);
        const render = (t) => {
            animationId = requestAnimationFrame(render);
            const time = (t - startTime) * 0.001 * speed;
            program.uniforms.uTime.value = time;
            // Smooth mouse interpolation
            mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
            mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;
            program.uniforms.uMouse.value = [mouseRef.current.x, mouseRef.current.y];
            // Update colors if they change (though normally we'd need a deep compare effect for this, 
            // we'll update them directly here just in case they are reactive)
            program.uniforms.uColor1.value = colors.color1 || [0.4, 0.1, 0.9];
            program.uniforms.uColor2.value = colors.color2 || [0.1, 0.5, 1.0];
            program.uniforms.uColor3.value = colors.color3 || [0.0, 0.8, 0.9];
            renderer.render({ scene: mesh });
        };
        animationId = requestAnimationFrame(render);
        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(animationId);
            gl.getExtension("WEBGL_lose_context")?.loseContext();
        };
    }, [speed]); // Re-init if speed radically changes or just rely on render loop
    return (<div ref={containerRef} className={`relative w-full h-full overflow-hidden bg-black ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}/>
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>);
}
