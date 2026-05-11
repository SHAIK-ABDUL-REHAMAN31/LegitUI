"use client";
import React, { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Image, ScrollControls, useScroll } from "@react-three/drei";
import styles from "./ScrollWaveGallery.module.css";
const DEFAULT_IMAGES = [
    "https://picsum.photos/seed/legit1/800/1200",
    "https://picsum.photos/seed/legit2/1200/800",
    "https://picsum.photos/seed/legit3/800/1200",
    "https://picsum.photos/seed/legit4/1200/800",
    "https://picsum.photos/seed/legit5/800/1200",
    "https://picsum.photos/seed/legit6/1200/800",
    "https://picsum.photos/seed/legit7/800/1200",
    "https://picsum.photos/seed/legit8/1200/800",
    "https://picsum.photos/seed/legit9/800/1200",
    "https://picsum.photos/seed/legit10/1200/800",
];
function Card({ index, total, url, loops, waveAmplitude }) {
    const meshRef = useRef(null);
    const scroll = useScroll();
    const baseOffset = index / total;
    // Alternate aspect ratios
    const isPortrait = index % 2 === 0;
    const scaleX = isPortrait ? 2.2 : 3.8;
    const scaleY = isPortrait ? 3.8 : 2.2;
    useFrame(() => {
        if (!meshRef.current)
            return;
        // scroll.offset is smooth scroll progress from 0 to 1
        const p = scroll.offset;
        const rawT = baseOffset + p * loops;
        const t = rawT % 1; // 0 to 1 wrapping
        // FORWARD MOVEMENT + DIAGONAL WAVE
        // Z-axis moves from -25 (deep) to +10 (past camera)
        const z = -25 + t * 40;
        // Increased Horizontal spread (X: left to right)
        const x = (t - 0.5) * 55;
        // Increased Vertical spread (Y: top to bottom) + Sine Wave curvature
        // Adjusted to hit the bottom corner perfectly
        const diagonalY = (0.5 - t) * 35 - 3;
        const waveY = Math.sin(t * Math.PI * 2) * (waveAmplitude / 8);
        const y = diagonalY + waveY;
        meshRef.current.position.set(x, y, z);
        // Scale increases as it approaches
        const s = 1 + (t * 0.6);
        meshRef.current.scale.setScalar(s);
        // Opacity stays 1 for most of the path, only fades at the very exit/entry
        const opacity = Math.min(1, Math.sin(t * Math.PI) * 2.5);
        if (meshRef.current.children[0]) {
            // @ts-ignore
            meshRef.current.children[0].material.transparent = true;
            // @ts-ignore
            meshRef.current.children[0].material.opacity = opacity;
        }
    });
    return (<group ref={meshRef}>
            <Image url={url} scale={[scaleX, scaleY]} toneMapped={false}/>
        </group>);
}
function Gallery({ images, loops, waveAmplitude }) {
    return (<>
            <ambientLight intensity={0.5}/>
            <group position={[0, 0, 0]}>
                {images.map((url, i) => (<Card key={i} index={i} total={images.length} url={url} loops={loops} waveAmplitude={waveAmplitude}/>))}
            </group>
        </>);
}
export default function ScrollWaveGallery({ images = DEFAULT_IMAGES, className = "", loops = 3, waveAmplitude = 25 }) {
    return (<div className={`${styles.container} ${className}`}>
            <div className={styles.stickyWrapper}>
                <Canvas camera={{ position: [0, 0, 10], fov: 45 }} className={styles.canvas}>
                    <color attach="background" args={["#000000"]}/>
                    {/* ScrollControls creates a virtual scroll area that R3F hooks into */}
                    <ScrollControls pages={4} damping={0.2}>
                        <Suspense fallback={null}>
                            <Gallery images={images} loops={loops} waveAmplitude={waveAmplitude}/>
                        </Suspense>
                    </ScrollControls>
                </Canvas>
            </div>
        </div>);
}
