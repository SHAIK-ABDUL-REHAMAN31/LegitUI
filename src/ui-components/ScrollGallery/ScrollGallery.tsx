'use client';

import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import styles from "./ScrollGallery.module.css";

export interface GalleryImage {
    src: string;
    title: string;
}

export interface ScrollGalleryProps {
    images: GalleryImage[];
    curvature?: number;
    cardWidth?: number;
    cardHeight?: number;
    gap?: number;
    speed?: number;
    fov?: number;
    backgroundColor?: string;
    textColor?: string;
}

/* ─── Load images as CanvasTextures with title overlay ─── */
function useCardTextures(images: GalleryImage[]) {
    const [textures, setTextures] = useState<THREE.CanvasTexture[]>([]);
    useEffect(() => {
        let dead = false;
        const W = 560, H = 840;
        Promise.all(
            images.map((img) => new Promise<THREE.CanvasTexture>((res) => {
                const el = new Image();
                el.crossOrigin = 'anonymous';
                el.onload = () => {
                    const c = document.createElement('canvas');
                    c.width = W; c.height = H;
                    const ctx = c.getContext('2d')!;
                    const sa = el.width / el.height, da = W / H;
                    let sx = 0, sy = 0, sw = el.width, sh = el.height;
                    if (sa > da) { sw = el.height * da; sx = (el.width - sw) / 2; }
                    else { sh = el.width / da; sy = (el.height - sh) / 2; }
                    ctx.drawImage(el, sx, sy, sw, sh, 0, 0, W, H);
                    const g = ctx.createLinearGradient(0, H - 220, 0, H);
                    g.addColorStop(0, 'rgba(0,0,0,0)');
                    g.addColorStop(0.5, 'rgba(0,0,0,0.55)');
                    g.addColorStop(1, 'rgba(0,0,0,0.92)');
                    ctx.fillStyle = g;
                    ctx.fillRect(0, H - 220, W, 220);
                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 30px Inter,Arial,sans-serif';
                    ctx.textAlign = 'left';
                    ctx.shadowColor = 'rgba(0,0,0,0.8)';
                    ctx.shadowBlur = 8;
                    ctx.fillText(img.title.toUpperCase(), 28, H - 30);
                    const t = new THREE.CanvasTexture(c);
                    t.colorSpace = THREE.SRGBColorSpace;
                    t.minFilter = THREE.LinearFilter;
                    res(t);
                };
                el.onerror = () => {
                    const c = document.createElement('canvas');
                    c.width = W; c.height = H;
                    const ctx = c.getContext('2d')!;
                    ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0, 0, W, H);
                    ctx.fillStyle = '#fff'; ctx.font = 'bold 28px Arial';
                    ctx.textAlign = 'center'; ctx.fillText(img.title, W / 2, H / 2);
                    res(new THREE.CanvasTexture(c));
                };
                el.src = img.src;
            }))
        ).then((r) => { if (!dead) setTextures(r); });
        return () => { dead = true; };
    }, [images]);
    return textures;
}

/* ─── Carousel: horizontal scrolling strip with cylindrical bend ─── */
function CarouselScene({
    images, curvature, cardWidth, cardHeight, gap, speed,
}: {
    images: GalleryImage[];
    curvature: number;
    cardWidth: number;
    cardHeight: number;
    gap: number;
    speed: number;
}) {
    const meshes = useRef<(THREE.Mesh | null)[]>([]);
    const textures = useCardTextures(images);
    const offsetRef = useRef(0);
    const hovRef = useRef(false);
    const dragRef = useRef(false);
    const dragSX = useRef(0);
    const dragOff = useRef(0);

    const n = images.length;
    const spacing = cardWidth + gap;
    const totalW = n * spacing;
    const R = curvature;

    useFrame((_, delta) => {
        // Auto scroll
        if (!dragRef.current) {
            const s = hovRef.current ? speed * 0.15 : speed;
            offsetRef.current -= s * delta;
        }
        // Wrap
        while (offsetRef.current < -totalW) offsetRef.current += totalW;
        while (offsetRef.current > 0) offsetRef.current -= totalW;

        // Position each card on the curved path
        for (let idx = 0; idx < 3 * n; idx++) {
            const mesh = meshes.current[idx];
            if (!mesh) continue;

            const copy = Math.floor(idx / n) - 1;
            const i = idx % n;

            // Linear conveyor position
            const linearX = i * spacing + copy * totalW + offsetRef.current;

            // Map to cylindrical arc
            const angle = linearX / R;
            const x = R * Math.sin(angle);
            const z = R * Math.cos(angle) - R;

            mesh.position.set(x, 0, z);
            mesh.rotation.set(0, angle, 0);

            // Center pop
            const dist = Math.abs(angle);
            const t = Math.min(dist / 1.0, 1);
            const sc = THREE.MathUtils.lerp(1.08, 0.8, t);
            mesh.scale.set(sc, sc, 1);

            const mat = mesh.material as THREE.MeshBasicMaterial;
            mat.opacity = 1.0;
            const br = THREE.MathUtils.lerp(1.0, 0.85, t); // very slight darkening
            if (mat?.color) mat.color.setScalar(br);

            mesh.visible = dist < Math.PI * 0.8;
        }
    });

    // Drag + hover
    const { gl } = useThree();
    useEffect(() => {
        const c = gl.domElement;
        const down = (e: PointerEvent) => {
            dragRef.current = true;
            dragSX.current = e.clientX;
            dragOff.current = offsetRef.current;
            c.setPointerCapture(e.pointerId);
        };
        const move = (e: PointerEvent) => {
            if (!dragRef.current) return;
            offsetRef.current = dragOff.current + (e.clientX - dragSX.current) * 0.02;
        };
        const up = () => { dragRef.current = false; };
        const ent = () => { hovRef.current = true; };
        const lv = () => { hovRef.current = false; dragRef.current = false; };
        c.addEventListener('pointerdown', down);
        c.addEventListener('pointermove', move);
        c.addEventListener('pointerup', up);
        c.addEventListener('pointercancel', up);
        c.addEventListener('mouseenter', ent);
        c.addEventListener('mouseleave', lv);
        return () => {
            c.removeEventListener('pointerdown', down);
            c.removeEventListener('pointermove', move);
            c.removeEventListener('pointerup', up);
            c.removeEventListener('pointercancel', up);
            c.removeEventListener('mouseenter', ent);
            c.removeEventListener('mouseleave', lv);
        };
    }, [gl]);

    if (textures.length !== n) return null;

    const cards: React.ReactNode[] = [];
    for (let copy = -1; copy <= 1; copy++) {
        for (let i = 0; i < n; i++) {
            const idx = (copy + 1) * n + i;
            cards.push(
                <mesh key={`${copy}-${i}`} ref={(el) => { meshes.current[idx] = el; }}>
                    <planeGeometry args={[cardWidth, cardHeight]} />
                    <meshBasicMaterial map={textures[i]} side={THREE.FrontSide} toneMapped={false} transparent={true} />
                </mesh>
            );
        }
    }
    return <>{cards}</>;
}

/* ─── Main export ─── */
export default function ScrollGallery({
    images,
    curvature = 10,
    cardWidth = 2,
    cardHeight = 2,
    gap = 0.35,
    speed = 2.5,
    fov = 55,
    backgroundColor = '#ffffff',
    textColor = '#111111',
}: ScrollGalleryProps) {
    return (
        <div className={styles["gallery3d-wrapper"]} style={{ background: backgroundColor }}>
            <div className={styles["gallery3d-bg"]} />
            <div className={styles["gallery3d-vignette"]} />
            <div className={styles["gallery3d-canvas"]}>
                <Canvas
                    camera={{ position: [0, 0, 5], fov, near: 0.1, far: 100 }}
                    gl={{ antialias: true, alpha: true }}
                >
                    <Suspense fallback={null}>
                        <CarouselScene
                            images={images}
                            curvature={curvature}
                            cardWidth={cardWidth}
                            cardHeight={cardHeight}
                            gap={gap}
                            speed={speed}
                        />
                    </Suspense>
                </Canvas>
            </div>
            <div className={styles["gallery3d-center-beam"]} />
        </div>
    );
}
