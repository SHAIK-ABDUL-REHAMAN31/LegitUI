'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Float, PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

interface BlackHoleProps {
  containerClassName?: string;
  speed?: number;
  radius?: number;
  starsCount?: number;
  colorOuter?: string;
  colorMid?: string;
  colorInner?: string;
}

const AccretionDiskShader = {
  uniforms: {
    uTime: { value: 0 },
    uRadius: { value: 0.3 },
    uColorInner: { value: new THREE.Color('#fff0ff') },
    uColorMid: { value: new THREE.Color('#a855f7') },
    uColorOuter: { value: new THREE.Color('#4c1d95') },
    uSpeed: { value: 1.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uRadius;
    uniform vec3 uColorInner;
    uniform vec3 uColorMid;
    uniform vec3 uColorOuter;
    uniform float uSpeed;
    varying vec2 vUv;
    varying vec3 vPosition;

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    void main() {
      float dist = length(vPosition.xy);
      if (dist < uRadius) discard;

      float angle = atan(vPosition.y, vPosition.x);
      float swirl = angle + (uTime * uSpeed * 2.0) + (1.5 / dist);
      
      float n = noise(vec2(dist * 8.0 - uTime * uSpeed, swirl * 3.0));
      n += 0.5 * noise(vec2(dist * 16.0, swirl * 6.0));
      
      float intensity = pow(uRadius / dist, 1.5) * (0.8 + 0.4 * n);
      intensity *= smoothstep(uRadius + 2.5, uRadius, dist);

      vec3 color = mix(uColorOuter, uColorMid, smoothstep(uRadius + 1.2, uRadius + 0.4, dist));
      color = mix(color, uColorInner, smoothstep(uRadius + 0.4, uRadius + 0.05, dist));
      
      gl_FragColor = vec4(color * intensity * 1.5, intensity);
    }
  `
};



function EventHorizon({ radius }: { radius: number }) {
  return (
    <mesh>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshBasicMaterial color="#000000" />
    </mesh>
  );
}

function AccretionDisk({ radius, speed, colorInner, colorMid, colorOuter }: any) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uRadius: { value: radius },
    uColorInner: { value: new THREE.Color(colorInner) },
    uColorMid: { value: new THREE.Color(colorMid) },
    uColorOuter: { value: new THREE.Color(colorOuter) },
    uSpeed: { value: speed },
  }), [radius, speed, colorInner, colorMid, colorOuter]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.5, 0, 0]}>
      <planeGeometry args={[radius * 12, radius * 12, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        side={THREE.DoubleSide}
        vertexShader={AccretionDiskShader.vertexShader}
        fragmentShader={AccretionDiskShader.fragmentShader}
        uniforms={uniforms}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function CinematicBlackHoleContent({ speed, radius, starsCount, colorInner, colorMid, colorOuter }: any) {
  const { viewport } = useThree();

  return (
    <>
      <color attach="background" args={['#010103']} />
      <PerspectiveCamera makeDefault position={[0, 1.5, 4.5]} fov={75} />

      <Stars
        radius={100}
        depth={50}
        count={starsCount}
        factor={4}
        saturation={0}
        fade
        speed={speed * 0.5}
      />

      <OrbitControls enableZoom={true} enablePan={false} enableRotate={true} target={[0, 0, 0]} />

      <Float speed={speed * 2} rotationIntensity={0.5} floatIntensity={0.5}>
        <group scale={viewport.width / 6}>
          <EventHorizon radius={radius} />
          <AccretionDisk
            radius={radius}
            speed={speed}
            colorInner={colorInner}
            colorMid={colorMid}
            colorOuter={colorOuter}
          />

          <mesh scale={[1.2, 1.2, 1.2]}>
            <sphereGeometry args={[radius * 1.1, 32, 32]} />
            <meshBasicMaterial color={colorMid} transparent opacity={0.1} />
          </mesh>
        </group>
      </Float>

      <EffectComposer enableNormalPass={false}>
        <Bloom
          intensity={1.5}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
          height={300}
        />
        <Noise opacity={0.05} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  );
}

export default function BlackHole({
  containerClassName = '',
  speed = 1.0,
  radius = 0.3,
  starsCount = 1500,
  colorOuter = '#4c1d95',
  colorMid = '#a855f7',
  colorInner = '#fff0ff',
}: BlackHoleProps) {
  return (
    <div className={containerClassName} style={{ width: '100%', height: '100%', minHeight: '400px' }}>
      <Canvas
        gl={{ antialias: false, stencil: false, depth: true }}
        dpr={[1, 2]}
      >
        <CinematicBlackHoleContent
          speed={speed}
          radius={radius}
          starsCount={starsCount}
          colorInner={colorInner}
          colorMid={colorMid}
          colorOuter={colorOuter}
        />
      </Canvas>
    </div>
  );
}


