"use client";

import { useState } from "react";
import {
    motion,
    useMotionValue,
    useTransform,
    useAnimationFrame,
    PanInfo,
    MotionValue,
} from "framer-motion";
import styles from "./3DGallery.module.css";

// ─── Types ───────────────────────────────────────────
export interface GalleryImage {
    src: string;
    title?: string;
}

export interface Gallery3DProps {
    /** Array of images to display */
    images: GalleryImage[];
    /** Radius of the 3D carousel ring in px (default: 320) */
    radius?: number;
    /** Card width in px (default: 220) */
    cardWidth?: number;
    /** Card height in px (default: 160) */
    cardHeight?: number;
    /** Auto-spin speed multiplier (default: 0.025) */
    spinSpeed?: number;
    /** Background color of the container */
    backgroundColor?: string;
    /** Glow color in the center */
    glowColor?: string;
    /** Color of the gallery text */
    textColor?: string;
    /** Gallery top header text */
    headerText?: string;
    /** Central big title */
    centralTitle?: string;
    /** Central small subtitle */
    centralSubtitle?: string;
}

// ─── Component ───────────────────────────────────────
export default function Gallery3D({
    images,
    radius = 320,
    cardWidth = 220,
    cardHeight = 160,
    spinSpeed = 0.025,
    backgroundColor = "#ffffff",
    glowColor = "rgba(255,220,180,0.35)",
    textColor = "#8a7a6a",
    headerText = "Gallery",
    centralTitle = "Projects",
    centralSubtitle = "Collection",
}: Gallery3DProps) {
    const cardCount = images.length;

    const rotation = useMotionValue(0);
    const rotationX = useMotionValue(12); // vertical tilt

    const [isDragging, setIsDragging] = useState(false);
    const [autoSpin, setAutoSpin] = useState(true);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // ── Auto-spin animation loop ──
    useAnimationFrame((_, delta) => {
        if (autoSpin && !isDragging) {
            rotation.set(rotation.get() + delta * spinSpeed);
        }
    });

    // ── Mouse drag handlers ──
    const handleDragStart = () => {
        setIsDragging(true);
        setAutoSpin(false);
    };

    const handleDrag = (_: unknown, info: PanInfo) => {
        rotation.set(rotation.get() + info.delta.x * 0.3);
        const newRotX = rotationX.get() - info.delta.y * 0.2;
        rotationX.set(Math.max(-20, Math.min(45, newRotX)));
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        setAutoSpin(true);
    };

    // Transforms for the ring and text
    const ringTransform = useTransform(
        () => `rotateX(${rotationX.get()}deg) rotateY(${rotation.get()}deg)`
    );

    const textTransform = useTransform(
        () =>
            `translate(-50%, -50%) rotateY(${-rotation.get()}deg) rotateX(${-rotationX.get()}deg)`
    );

    return (
        <div
            className={styles.container}
            style={{ background: backgroundColor }}
        >
            {/* Ambient glow */}
            <div
                className={styles.ambientGlow}
                style={{
                    background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
                }}
            />

            <h1 className={styles.header} style={{ color: textColor }}>
                {headerText}
            </h1>

            {/* 3D Stage */}
            <motion.div
                className={styles.stage}
                style={{ cursor: isDragging ? "grabbing" : "grab" }}
                onPanStart={handleDragStart}
                onPan={handleDrag}
                onPanEnd={handleDragEnd}
            >
                {/* The rotating ring */}
                <motion.div
                    className={styles.ring}
                    style={{ transform: ringTransform }}
                >
                    {/* Central Floating Text */}
                    <motion.div className={styles.centralText} style={{ transform: textTransform, color: textColor }}>
                        <h2 className={styles.centralTitle}>{centralTitle}</h2>
                        <p className={styles.centralSubtitle}>{centralSubtitle}</p>
                    </motion.div>

                    {images.map((img, i) => (
                        <GalleryCard
                            key={i}
                            img={img}
                            i={i}
                            cardCount={cardCount}
                            rotation={rotation}
                            cardWidth={cardWidth}
                            cardHeight={cardHeight}
                            radius={radius}
                            hoveredIndex={hoveredIndex}
                            setHoveredIndex={setHoveredIndex}
                        />
                    ))}
                </motion.div>
            </motion.div>

            {/* Controls */}
            <div className={styles.controls}>
                <button
                    className={styles.spinButton}
                    onClick={() => setAutoSpin((s) => !s)}
                    style={{
                        background: autoSpin
                            ? "rgba(80,60,40,0.85)"
                            : "rgba(80,60,40,0.25)",
                        color: autoSpin ? "#f0e8dc" : textColor,
                        border: "1px solid rgba(100,80,60,0.35)",
                    }}
                >
                    {autoSpin ? "⏸ Pause" : "▶ Spin"}
                </button>

                <span className={styles.dragHint} style={{ color: textColor }}>
                    Drag to rotate
                </span>
            </div>

            {/* Shadow on floor */}
            <div
                className={styles.floorShadow}
                style={{
                    background: "radial-gradient(ellipse at center bottom, rgba(80,60,40,0.18) 0%, transparent 70%)",
                }}
            />
        </div>
    );
}

function GalleryCard({
    img,
    i,
    cardCount,
    rotation,
    cardWidth,
    cardHeight,
    radius,
    hoveredIndex,
    setHoveredIndex,
}: {
    img: GalleryImage;
    i: number;
    cardCount: number;
    rotation: MotionValue<number>;
    cardWidth: number;
    cardHeight: number;
    radius: number;
    hoveredIndex: number | null;
    setHoveredIndex: (idx: number | null) => void;
}) {
    const angle = (360 / cardCount) * i;
    const isHovered = hoveredIndex === i;

    // Individual card brightness
    const filter = useTransform(() => {
        const r = rotation.get();
        const relativeAngle = (((r + angle) % 360) + 360) % 360;
        const brightness = 0.65 + 0.45 * Math.cos((relativeAngle * Math.PI) / 180);
        return `brightness(${brightness})`;
    });

    const boxShadow = useTransform(() => {
        const r = rotation.get();
        const relativeAngle = (((r + angle) % 360) + 360) % 360;
        const brightness = 0.65 + 0.45 * Math.cos((relativeAngle * Math.PI) / 180);
        return isHovered
            ? "0 24px 60px rgba(0,0,0,0.55), 0 0 0 2px rgba(255,255,255,0.4)"
            : `0 ${8 + brightness * 16}px ${20 + brightness * 30}px rgba(0,0,0,${0.2 + brightness * 0.25
            }), \n inset 0 1px 0 rgba(255,255,255,0.25)`;
    });

    return (
        <motion.div
            className={styles.cardContainer}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{
                width: cardWidth,
                height: cardHeight,
                left: -cardWidth / 2,
                top: -cardHeight / 2,
                transform: `rotateY(${angle}deg) translateZ(${radius}px) rotateX(-4deg)`,
            }}
        >
            {/* Card */}
            <motion.div
                className={styles.cardInner}
                style={{
                    boxShadow,
                    filter,
                }}
                animate={{
                    scale: isHovered ? 1.06 : 1,
                    y: isHovered ? -8 : 0,
                }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                }}
            >
                <img
                    src={img.src}
                    alt={img.title || `Image ${i + 1}`}
                    className={styles.cardImage}
                    draggable={false}
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                    }}
                />

                {/* Gloss overlay */}
                <div className={styles.glossOverlay} />

                {/* Page edge — right side */}
                <div className={styles.pageEdge} />

                {/* Title badge */}
                {img.title && (
                    <div className={styles.titleBadge}>
                        {img.title}
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}