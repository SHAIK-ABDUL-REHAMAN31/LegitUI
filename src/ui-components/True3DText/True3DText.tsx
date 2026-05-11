"use client";

import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { 
  Text3D, 
  Center, 
  Environment, 
  PresentationControls,
  Float,
  ContactShadows
} from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import styles from "./True3DText.module.css";

// Reliable CDN for standard three.js bold font
const FONT_URL = "https://unpkg.com/three@0.132.2/examples/fonts/helvetiker_bold.typeface.json";

export interface True3DTextProps {
    /** The text to render in 3D */
    text?: string;
    /** How thick the bevel should be */
    bevelThickness?: number;
    /** How far the bevel extends */
    bevelSize?: number;
    /** Metalness of the material (0 to 1) */
    metalness?: number;
    /** Roughness of the material (0 to 1) */
    roughness?: number;
    /** Base color of the text */
    color?: string;
    /** Intensity of the cinematic glow */
    glowIntensity?: number;
    /** Additional CSS classes */
    className?: string;
}

const TextScene = ({ text, bevelThickness, bevelSize, metalness, roughness, color }: any) => {
    // Memoize the material so it's not recreated every frame, and looks like premium chrome
    const material = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: color,
        metalness: metalness,
        roughness: roughness,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        envMapIntensity: 2.5,
    }), [color, metalness, roughness]);

    return (
        <>
            <Environment preset="city" />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 10]} intensity={1.5} />
            {/* Dramatic spotlight for cinematic highlights */}
            <spotLight position={[-10, 10, -10]} intensity={2} color="#ffffff" penumbra={1} />
            
            <PresentationControls 
                global 
                snap={true} 
                rotation={[0, 0, 0]} 
                polar={[-Math.PI / 3, Math.PI / 3]} 
                azimuth={[-Math.PI / 2, Math.PI / 2]}
            >
                <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.5}>
                    <Center>
                        <Text3D
                            font={FONT_URL}
                            size={3}
                            height={0.5}
                            curveSegments={32}
                            bevelEnabled
                            bevelThickness={bevelThickness}
                            bevelSize={bevelSize}
                            bevelOffset={0}
                            bevelSegments={8}
                            material={material}
                        >
                            {text}
                        </Text3D>
                    </Center>
                </Float>
            </PresentationControls>

            {/* Premium cinematic floor shadow */}
            <ContactShadows position={[0, -2.5, 0]} opacity={0.6} scale={20} blur={2.5} far={4.5} />
        </>
    );
};

export default function True3DText({
    text = "RAVAS",
    bevelThickness = 0.1,
    bevelSize = 0.04,
    metalness = 1,
    roughness = 0.15,
    color = "#e2e8f0",
    glowIntensity = 1.2,
    className = "",
}: True3DTextProps) {
    return (
        <div className={`${styles.container} ${className}`}>
            <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
                <color attach="background" args={["#000000"]} />
                <React.Suspense fallback={null}>
                    <TextScene 
                        text={text} 
                        bevelThickness={bevelThickness}
                        bevelSize={bevelSize} 
                        metalness={metalness} 
                        roughness={roughness} 
                        color={color} 
                    />
                </React.Suspense>
                
                <EffectComposer multisampling={0}>
                    <Bloom 
                        luminanceThreshold={0.4} 
                        mipmapBlur 
                        luminanceSmoothing={0.9} 
                        intensity={glowIntensity} 
                    />
                </EffectComposer>
            </Canvas>
        </div>
    );
}
