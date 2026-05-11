"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./DepthText.module.css";
export default function DepthText({ text = "DEPTH", layers = 12, depth = 12, fontSize = "clamp(4rem, 15vw, 12rem)", fontWeight = 900, fontFamily = "'Inter', system-ui, sans-serif", textColor = "#ffffff", shadowColor = "#3b82f6", maxRotation = 25, className = "", }) {
    const containerRef = useRef(null);
    const sceneRef = useRef(null);
    useEffect(() => {
        if (!containerRef.current || !sceneRef.current)
            return;
        const container = containerRef.current;
        const scene = sceneRef.current;
        // Cinematic GSAP quickTo for highly performant and smooth rotation
        const xTo = gsap.quickTo(scene, "rotationY", { ease: "power3.out", duration: 1.2 });
        const yTo = gsap.quickTo(scene, "rotationX", { ease: "power3.out", duration: 1.2 });
        // Subtle camera drift when idle
        const driftTimeline = gsap.timeline({ repeat: -1, yoyo: true });
        driftTimeline.to(scene, {
            rotationY: 6,
            rotationX: -3,
            duration: 3,
            ease: "sine.inOut"
        }).to(scene, {
            rotationY: -6,
            rotationX: 3,
            duration: 3,
            ease: "sine.inOut"
        });
        let isHovering = false;
        const handleMouseMove = (e) => {
            if (!isHovering) {
                isHovering = true;
                driftTimeline.pause(); // Interrupt drift on user interaction
            }
            const rect = container.getBoundingClientRect();
            // Normalize mouse position from -1 to 1 based on container center
            const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
            const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
            xTo(x * maxRotation);
            yTo(-y * maxRotation); // Invert Y so looking up moves text up
        };
        const handleMouseLeave = () => {
            isHovering = false;
            // Smoothly reset camera and resume drift
            gsap.to(scene, {
                rotationX: 0,
                rotationY: 0,
                duration: 1.5,
                ease: "power3.out",
                onComplete: () => {
                    if (!isHovering)
                        driftTimeline.restart();
                }
            });
        };
        container.addEventListener("mousemove", handleMouseMove);
        container.addEventListener("mouseleave", handleMouseLeave);
        return () => {
            container.removeEventListener("mousemove", handleMouseMove);
            container.removeEventListener("mouseleave", handleMouseLeave);
            driftTimeline.kill();
        };
    }, [maxRotation]);
    // Generate 3D Layers
    const layerElements = [];
    for (let i = 0; i < layers; i++) {
        const progress = i / (layers - 1 || 1); // 0 to 1
        // Front layer is fully opaque, back layers fade out
        const opacity = i === 0 ? 1 : 1 - (progress * 0.8);
        const color = i === 0 ? textColor : shadowColor;
        // Push backwards in Z space
        const zOffset = -i * depth;
        // Slight scale down enhances perspective vanishing point
        const scale = 1 - (i * 0.005);
        layerElements.push(<div key={i} className={`${styles.textLayer} ${i === 0 ? styles.front : ''}`} style={{
                transform: `translateZ(${zOffset}px) scale(${scale})`,
                color: color,
                opacity: opacity,
                // Depth blur effect
                filter: i > 0 ? `blur(${progress * 6}px)` : 'none',
                zIndex: layers - i
            }} aria-hidden={i !== 0}>
                {text}
            </div>);
    }
    return (<div ref={containerRef} className={`${styles.container} ${className}`}>
            <div ref={sceneRef} className={styles.scene} style={{ fontSize, fontWeight, fontFamily }}>
                {/* Invisible base text to maintain the container's exact dimensions */}
                <div className={styles.base} aria-hidden="true">{text}</div>
                
                {/* Layered Parallax Elements */}
                {layerElements}
            </div>
        </div>);
}
