'use client';
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useFBO, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import styles from './AsciiMotionText.module.css';
// --- SHADERS ---
const simulationVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const simulationFragmentShader = `
  uniform sampler2D tPosition;
  uniform sampler2D tOriginal;
  uniform sampler2D tVelocity;
  uniform sampler2D tSource; // The text/image brightness
  uniform float uTime;
  uniform float uDelta;
  uniform vec3 uMouse;
  uniform float uMouseRadius;
  uniform float uMouseStrength;
  uniform float uRelaxation;
  uniform float uDamping;
  uniform float uNoiseFreq;
  uniform float uNoiseAmp;

  varying vec2 vUv;

  // Simplex noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
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
    vec4 pos = texture2D(tPosition, vUv);
    vec4 origin = texture2D(tOriginal, vUv);
    vec4 vel = texture2D(tVelocity, vUv);
    vec4 source = texture2D(tSource, vUv);

    vec3 p = pos.xyz;
    vec3 v = vel.xyz;
    vec3 o = origin.xyz;

    // 1. Spring back to origin
    vec3 springForce = (o - p) * uRelaxation;
    
    // 2. Damping
    v *= uDamping;

    // 3. Mouse repulsion
    float dist = distance(uMouse, p);
    if(dist < uMouseRadius) {
      vec3 dir = normalize(p - uMouse + vec3(0.0001)); // Add offset to prevent NaN
      float force = (1.0 - dist / uMouseRadius) * uMouseStrength;
      v += dir * force;
    }

    // 4. Noise turbulence
    float nX = snoise(vUv * uNoiseFreq + uTime * 0.1);
    float nY = snoise(vUv * uNoiseFreq + 10.0 + uTime * 0.1);
    float nZ = snoise(vUv * uNoiseFreq + 20.0 + uTime * 0.1);
    v += vec3(nX, nY, nZ) * uNoiseAmp * 0.01;

    // Apply forces
    v += springForce;
    
    // Output VELOCITY (not position)
    gl_FragColor = vec4(v, 1.0);
  }
`;
const renderVertexShader = `
  uniform sampler2D tPosition;
  uniform float uPointSize;
  varying vec2 vUv;
  varying float vBrightness;

  void main() {
    // instanceMatrix is provided by InstancedMesh, but we use tPosition for displacement
    // Each instance has its own UV coordinate in the GPGPU texture
    vec2 pUv = vec2(
      mod(float(instanceID), 128.0) / 128.0,
      floor(float(instanceID) / 128.0) / 128.0
    );
    
    vec4 posData = texture2D(tPosition, pUv);
    vBrightness = posData.w;

    // Apply instance position
    vec3 pos = posData.xyz + position; // position is the plane's local vertex pos
    
    vUv = uv; // local plane UV
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;
const renderFragmentShader = `
  varying vec2 vUv;
  varying float vBrightness;
  uniform sampler2D tAscii;
  uniform float uAsciiCount;
  uniform vec3 uColor;
  uniform float uTime;

  // Simple noise for shimmer
  float rand(vec2 n) { 
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
  }

  void main() {
    float charIndex = floor(vBrightness * (uAsciiCount - 0.001));
    vec2 asciiUv = vec2((vUv.x + charIndex) / uAsciiCount, vUv.y);
    vec4 tex = texture2D(tAscii, asciiUv);
    
    if(tex.a < 0.1) discard;

    // Pulse and shimmer
    float shimmer = rand(vUv + uTime * 0.1) * 0.15;
    float pulse = sin(uTime * 2.0 + vBrightness * 10.0) * 0.05 + 0.95;
    
    gl_FragColor = vec4(uColor * tex.rgb * pulse * (1.0 + shimmer), tex.a * vBrightness);
  }
`;
const AsciiParticleSystem = ({ text = "MOTION", fontSize = 1.5, density = 128, mouseRadius = 0.5, mouseStrength = 0.3, relaxation = 0.06, damping = 0.05, noiseFreq = 0.0, noiseAmp = 0.0, asciiChars = " .:-=+*%#░▒▓█" }) => {
    const { gl, size, viewport, mouse, camera } = useThree();
    const meshRef = useRef(null);
    const simMatRef = useRef(null);
    const sizeG = density;
    const count = sizeG * sizeG;
    // Text Texture Generation
    const [textTexture, setTextTexture] = useState(null);
    useEffect(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = `bold ${fontSize * 120}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Draw multiline text if needed or just single
        const lines = text.split('\n');
        const lineHeight = fontSize * 140;
        const totalHeight = lines.length * lineHeight;
        lines.forEach((line, i) => {
            ctx.fillText(line, canvas.width / 2, canvas.height / 2 - totalHeight / 2 + i * lineHeight + lineHeight / 2);
        });
        const tex = new THREE.CanvasTexture(canvas);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        setTextTexture(tex);
    }, [text, fontSize]);
    // ASCII Atlas Generation
    const asciiTexture = useMemo(() => {
        const chars = asciiChars.split('');
        const charSize = 128;
        const canvas = document.createElement('canvas');
        canvas.width = charSize * chars.length;
        canvas.height = charSize;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return new THREE.Texture();
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        // Use a high-quality monospace font
        ctx.font = `bold ${charSize * 0.9}px "Courier New", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        chars.forEach((char, i) => {
            ctx.fillText(char, charSize * i + charSize / 2, charSize / 2);
        });
        const tex = new THREE.CanvasTexture(canvas);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        return tex;
    }, [asciiChars]);
    // Initialize GPGPU Textures
    const { posTex, velTex } = useMemo(() => {
        const dataPos = new Float32Array(count * 4);
        const dataVel = new Float32Array(count * 4);
        const aspect = viewport.width / viewport.height;
        const worldSize = 12.0;
        for (let i = 0; i < count; i++) {
            const x = (i % sizeG + 0.5) / sizeG;
            const y = (Math.floor(i / sizeG) + 0.5) / sizeG;
            const posX = (x - 0.5) * worldSize * aspect;
            const posY = (y - 0.5) * worldSize;
            dataPos[i * 4 + 0] = posX;
            dataPos[i * 4 + 1] = posY;
            dataPos[i * 4 + 2] = 0;
            dataPos[i * 4 + 3] = 0; // brightness
            dataVel[i * 4 + 0] = 0;
            dataVel[i * 4 + 1] = 0;
            dataVel[i * 4 + 2] = 0;
            dataVel[i * 4 + 3] = 0;
        }
        const tPos = new THREE.DataTexture(dataPos, sizeG, sizeG, THREE.RGBAFormat, THREE.FloatType);
        const tVel = new THREE.DataTexture(dataVel, sizeG, sizeG, THREE.RGBAFormat, THREE.FloatType);
        tPos.needsUpdate = true;
        tVel.needsUpdate = true;
        return { posTex: tPos, velTex: tVel };
    }, [count, sizeG, viewport]);
    // Render Targets for GPGPU
    const renderTargetPos1 = useFBO(sizeG, sizeG, { type: THREE.FloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
    const renderTargetPos2 = useFBO(sizeG, sizeG, { type: THREE.FloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
    const renderTargetVel1 = useFBO(sizeG, sizeG, { type: THREE.FloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
    const renderTargetVel2 = useFBO(sizeG, sizeG, { type: THREE.FloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
    // Initial render to FBOs
    useEffect(() => {
        const simScene = new THREE.Scene();
        const simCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const initMat = new THREE.ShaderMaterial({
            uniforms: { tMap: { value: posTex } },
            vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }`,
            fragmentShader: `uniform sampler2D tMap; varying vec2 vUv; void main() { gl_FragColor = texture2D(tMap, vUv); }`
        });
        const simQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), initMat);
        simScene.add(simQuad);
        gl.setRenderTarget(renderTargetPos1);
        gl.render(simScene, simCam);
        gl.setRenderTarget(renderTargetPos2);
        gl.render(simScene, simCam);
        initMat.uniforms.tMap.value = velTex;
        gl.setRenderTarget(renderTargetVel1);
        gl.render(simScene, simCam);
        gl.setRenderTarget(renderTargetVel2);
        gl.render(simScene, simCam);
        gl.setRenderTarget(null);
    }, [gl, posTex, velTex, renderTargetPos1, renderTargetPos2, renderTargetVel1, renderTargetVel2]);
    // Velocity Sim Shader
    const velSimMat = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            tPosition: { value: null },
            tOriginal: { value: posTex },
            tVelocity: { value: null },
            tSource: { value: textTexture },
            uTime: { value: 0 },
            uDelta: { value: 0 },
            uMouse: { value: new THREE.Vector3() },
            uMouseRadius: { value: mouseRadius },
            uMouseStrength: { value: mouseStrength },
            uRelaxation: { value: relaxation },
            uDamping: { value: damping },
            uNoiseFreq: { value: noiseFreq },
            uNoiseAmp: { value: noiseAmp }
        },
        vertexShader: simulationVertexShader,
        fragmentShader: simulationFragmentShader
    }), [posTex, textTexture, mouseRadius, mouseStrength, relaxation, damping, noiseFreq, noiseAmp]);
    // Position Sim Shader
    const posSimMat = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            tPosition: { value: null },
            tVelocity: { value: null },
            tSource: { value: textTexture },
            uDelta: { value: 0 }
        },
        vertexShader: simulationVertexShader,
        fragmentShader: `
      uniform sampler2D tPosition;
      uniform sampler2D tVelocity;
      uniform sampler2D tSource;
      uniform float uDelta;
      varying vec2 vUv;
      void main() {
        vec4 pos = texture2D(tPosition, vUv);
        vec4 vel = texture2D(tVelocity, vUv);
        vec4 source = texture2D(tSource, vUv);
        
        // Update w with brightness from source
        float brightness = source.r; 
        
        gl_FragColor = vec4(pos.xyz + vel.xyz * uDelta * 60.0, brightness);
      }
    `
    }), [textTexture]);
    const simScene = useMemo(() => {
        const scene = new THREE.Scene();
        const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), undefined);
        scene.add(quad);
        return { scene, quad };
    }, []);
    const simCam = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), []);
    let frame = 0;
    useFrame((state, delta) => {
        const { gl, mouse, camera } = state;
        // Smooth delta to prevent jumps
        const d = Math.min(delta, 0.033);
        // Mouse to world
        const mouseV3 = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera);
        const dir = mouseV3.sub(camera.position).normalize();
        const distToPlane = -camera.position.z / dir.z;
        const posOnPlane = camera.position.clone().add(dir.multiplyScalar(distToPlane));
        velSimMat.uniforms.uTime.value = state.clock.elapsedTime;
        velSimMat.uniforms.uDelta.value = d;
        velSimMat.uniforms.uMouse.value.copy(posOnPlane);
        velSimMat.uniforms.tSource.value = textTexture;
        // Dynamically update props
        velSimMat.uniforms.uMouseRadius.value = mouseRadius;
        velSimMat.uniforms.uMouseStrength.value = mouseStrength;
        velSimMat.uniforms.uRelaxation.value = relaxation;
        velSimMat.uniforms.uDamping.value = damping;
        velSimMat.uniforms.uNoiseFreq.value = noiseFreq;
        velSimMat.uniforms.uNoiseAmp.value = noiseAmp;
        const targetVel = frame % 2 === 0 ? renderTargetVel1 : renderTargetVel2;
        const currentVel = frame % 2 === 0 ? renderTargetVel2 : renderTargetVel1;
        const targetPos = frame % 2 === 0 ? renderTargetPos1 : renderTargetPos2;
        const currentPos = frame % 2 === 0 ? renderTargetPos2 : renderTargetPos1;
        // Update Velocity
        simScene.quad.material = velSimMat;
        velSimMat.uniforms.tPosition.value = currentPos.texture;
        velSimMat.uniforms.tVelocity.value = currentVel.texture;
        gl.setRenderTarget(targetVel);
        gl.render(simScene.scene, simCam);
        // Update Position
        simScene.quad.material = posSimMat;
        posSimMat.uniforms.tPosition.value = currentPos.texture;
        posSimMat.uniforms.tVelocity.value = targetVel.texture;
        posSimMat.uniforms.tSource.value = textTexture;
        posSimMat.uniforms.uDelta.value = d;
        gl.setRenderTarget(targetPos);
        gl.render(simScene.scene, simCam);
        // Render Mesh
        if (meshRef.current && meshRef.current.material) {
            const material = meshRef.current.material;
            material.uniforms.tPosition.value = targetPos.texture;
            material.uniforms.uTime.value = state.clock.elapsedTime;
            material.uniforms.uAsciiCount.value = asciiChars.length;
        }
        gl.setRenderTarget(null);
        frame++;
    });
    const geometry = useMemo(() => new THREE.PlaneGeometry(0.12, 0.12), []);
    const renderMat = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            tPosition: { value: null },
            tAscii: { value: asciiTexture },
            uAsciiCount: { value: asciiChars.length },
            uColor: { value: new THREE.Color('#ffffff') },
            uTime: { value: 0 }
        },
        vertexShader: `
      uniform sampler2D tPosition;
      varying vec2 vUv;
      varying float vBrightness;
      attribute vec2 aInstanceUv;

      void main() {
        vec4 posData = texture2D(tPosition, aInstanceUv);
        vBrightness = posData.w;

        vec3 pos = posData.xyz + position;
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
        fragmentShader: renderFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }), [asciiTexture, asciiChars.length]);
    useEffect(() => {
        const instUv = new Float32Array(count * 2);
        for (let i = 0; i < count; i++) {
            instUv[i * 2 + 0] = (i % sizeG + 0.5) / sizeG;
            instUv[i * 2 + 1] = (Math.floor(i / sizeG) + 0.5) / sizeG;
        }
        meshRef.current.geometry.setAttribute('aInstanceUv', new THREE.InstancedBufferAttribute(instUv, 2));
    }, [count, sizeG]);
    return (<instancedMesh ref={meshRef} args={[geometry, undefined, count]}>
      <primitive object={renderMat} attach="material"/>
    </instancedMesh>);
};
export const AsciiMotionText = (props) => {
    return (<div className={styles.container}>
      <Canvas dpr={[1, 2]} gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}>
        <color attach="background" args={['#000000']}/>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50}/>
        <AsciiParticleSystem {...props}/>
        <EffectComposer>
          <Bloom luminanceThreshold={0.1} mipmapBlur intensity={1.2} radius={0.5}/>
          <Vignette eskil={false} offset={0.1} darkness={1.1}/>
        </EffectComposer>
      </Canvas>
    </div>);
};
export default AsciiMotionText;
