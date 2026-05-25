"use client";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import styles from "./SpinningSpiral.module.css";
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}
export default function SpinningSpiral({ armsCount = 10, curvature = 75, strokeWidth = 14, color = "#ffffff", autoSpinSpeed = 0.5, friction = 0.95, interactive = true, size = 400, maxScale = 15, scrollZoom = true, slideUpText = "PUSH THE LIMITS", className = "", }) {
    const containerRef = useRef(null);
    const svgRef = useRef(null);
    const rotationGroupRef = useRef(null);
    const textRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const stateRef = useRef({
        rotation: 0,
        angularVelocity: 0,
        lastMouseAngle: 0,
        isDragging: false,
        autoSpinSpeed: autoSpinSpeed,
        requestRef: 0,
        dragStartTime: 0,
    });
    // Sync speed settings
    useEffect(() => {
        stateRef.current.autoSpinSpeed = autoSpinSpeed;
    }, [autoSpinSpeed]);
    // Game loop for continuous inner rotation and inertia
    useEffect(() => {
        const update = () => {
            const state = stateRef.current;
            if (state.isDragging) {
                // Decay velocity slightly while dragging so it matches hand movement speed
                state.angularVelocity *= 0.8;
            }
            else {
                // Apply friction to velocity
                state.angularVelocity *= friction;
                // Add velocity to rotation
                state.rotation += state.angularVelocity;
                // Fall back to auto-spin if velocity is extremely slow
                if (Math.abs(state.angularVelocity) < 0.05) {
                    state.rotation += state.autoSpinSpeed;
                }
            }
            // Apply rotation to the inner group
            if (rotationGroupRef.current) {
                rotationGroupRef.current.style.transform = `rotate(${state.rotation}deg)`;
            }
            state.requestRef = requestAnimationFrame(update);
        };
        const state = stateRef.current;
        state.requestRef = requestAnimationFrame(update);
        return () => {
            cancelAnimationFrame(state.requestRef);
        };
    }, [friction]);
    // GSAP Timeline and Gesture Listeners for Scroll-linked Zoom and Text reveal
    useEffect(() => {
        if (!scrollZoom) {
            if (svgRef.current) {
                gsap.set(svgRef.current, { scale: 1.0, rotation: 0 });
            }
            if (textRef.current) {
                gsap.set(textRef.current, { y: "100%" });
            }
            return;
        }
        let tl = null;
        let progress = 0;
        const initTimeline = () => {
            if (tl)
                tl.kill();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const maxDistance = Math.hypot(viewportWidth, viewportHeight) / 2;
            const parsedSizeNum = typeof size === "number" ? size : parseFloat(size) || 400;
            const circleSvgRadius = 12; // White circle SVG radius
            const physicalRadius = circleSvgRadius * (parsedSizeNum / 400);
            const dynamicMaxScale = (maxDistance / physicalRadius) * 1.05;
            tl = gsap.timeline({ paused: true });
            // Spin and zoom the outer SVG
            tl.to(svgRef.current, {
                rotation: 360 * 2.5,
                scale: dynamicMaxScale,
                duration: 1,
                ease: "power1.inOut",
            });
            // Slide up text once the zoom is nearly complete (white screen)
            if (textRef.current) {
                tl.to(textRef.current, {
                    y: "0%",
                    duration: 0.3,
                    ease: "power2.out",
                }, "-=0.25");
            }
            // Restore the current progress position
            tl.progress(progress);
        };
        initTimeline();
        const handleWheel = (e) => {
            const nextProgress = Math.max(0, Math.min(1, progress + e.deltaY * 0.0015));
            if ((e.deltaY > 0 && progress < 1) || (e.deltaY < 0 && progress > 0)) {
                e.preventDefault();
                progress = nextProgress;
                if (tl) {
                    gsap.to(tl, {
                        progress: progress,
                        duration: 0.6,
                        ease: "power2.out",
                        overwrite: "auto",
                    });
                }
            }
        };
        let touchStart = 0;
        const handleTouchStart = (e) => {
            if (e.touches.length > 0) {
                touchStart = e.touches[0].clientY;
            }
        };
        const handleTouchMove = (e) => {
            if (e.touches.length === 0)
                return;
            const touchY = e.touches[0].clientY;
            const deltaY = touchStart - touchY;
            touchStart = touchY;
            const nextProgress = Math.max(0, Math.min(1, progress + deltaY * 0.004));
            if ((deltaY > 0 && progress < 1) || (deltaY < 0 && progress > 0)) {
                e.preventDefault();
                progress = nextProgress;
                if (tl) {
                    gsap.to(tl, {
                        progress: progress,
                        duration: 0.6,
                        ease: "power2.out",
                        overwrite: "auto",
                    });
                }
            }
        };
        window.addEventListener("wheel", handleWheel, { passive: false });
        window.addEventListener("touchstart", handleTouchStart, { passive: true });
        window.addEventListener("touchmove", handleTouchMove, { passive: false });
        window.addEventListener("resize", initTimeline);
        return () => {
            window.removeEventListener("wheel", handleWheel);
            window.removeEventListener("touchstart", handleTouchStart);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("resize", initTimeline);
            if (tl)
                tl.kill();
        };
    }, [scrollZoom, size]);
    // Calculate angle relative to center of the spiral
    const getMouseAngle = (clientX, clientY) => {
        if (!containerRef.current)
            return 0;
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = clientX - centerX;
        const dy = clientY - centerY;
        // returns angle in degrees (-180 to 180)
        return Math.atan2(dy, dx) * (180 / Math.PI);
    };
    // Event Handlers for Dragging
    const handleStart = (clientX, clientY) => {
        if (!interactive)
            return;
        const state = stateRef.current;
        state.isDragging = true;
        setIsDragging(true);
        state.lastMouseAngle = getMouseAngle(clientX, clientY);
        state.angularVelocity = 0;
        state.dragStartTime = performance.now();
    };
    const handleMove = (clientX, clientY) => {
        const state = stateRef.current;
        if (!state.isDragging)
            return;
        const currentAngle = getMouseAngle(clientX, clientY);
        let delta = currentAngle - state.lastMouseAngle;
        // Handle wraparound (-180 to 180 boundary)
        if (delta > 180)
            delta -= 360;
        if (delta < -180)
            delta += 360;
        state.rotation += delta;
        state.angularVelocity = delta; // Velocity is change in angle per frame
        state.lastMouseAngle = currentAngle;
    };
    const handleEnd = () => {
        const state = stateRef.current;
        if (!state.isDragging)
            return;
        state.isDragging = false;
        setIsDragging(false);
        // Clamp maximum launch velocity to avoid infinite wild spinning
        const maxVelocity = 15;
        if (state.angularVelocity > maxVelocity)
            state.angularVelocity = maxVelocity;
        if (state.angularVelocity < -maxVelocity)
            state.angularVelocity = -maxVelocity;
    };
    // Touch event listeners
    const onMouseDown = (e) => {
        handleStart(e.clientX, e.clientY);
        const handleMouseMove = (moveEvent) => {
            handleMove(moveEvent.clientX, moveEvent.clientY);
        };
        const handleMouseUp = () => {
            handleEnd();
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    };
    const onTouchStart = (e) => {
        if (e.touches.length === 0)
            return;
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY);
        const handleTouchMove = (moveEvent) => {
            if (moveEvent.touches.length === 0)
                return;
            const t = moveEvent.touches[0];
            handleMove(t.clientX, t.clientY);
        };
        const handleTouchEnd = () => {
            handleEnd();
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("touchend", handleTouchEnd);
        };
        window.addEventListener("touchmove", handleTouchMove, { passive: true });
        window.addEventListener("touchend", handleTouchEnd);
    };
    // Generate path for a single arm
    // R is outer radius. Center is at (0,0).
    const R = 150;
    const endAngleRad = (curvature * Math.PI) / 180;
    const endX = R * Math.cos(endAngleRad);
    const endY = R * Math.sin(endAngleRad);
    // Control points for a beautiful, organic spiral curl
    const cp1X = (R * 0.35) * Math.cos(endAngleRad * 0.15);
    const cp1Y = (R * 0.35) * Math.sin(endAngleRad * 0.15);
    const cp2X = (R * 0.75) * Math.cos(endAngleRad * 0.65);
    const cp2Y = (R * 0.75) * Math.sin(endAngleRad * 0.65);
    const armPath = `M 0 0 C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
    // Generate all arms rotated around center
    const arms = Array.from({ length: armsCount }, (_, i) => {
        const rotationAngle = (i * 360) / armsCount;
        return (<path key={i} d={armPath} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" transform={`rotate(${rotationAngle})`}/>);
    });
    const parsedSize = typeof size === "number" ? `${size}px` : size;
    return (<div ref={containerRef} className={`${styles.spiralContainer} ${isDragging ? styles.dragging : ""} ${className}`} style={{ width: parsedSize, height: parsedSize }} onMouseDown={onMouseDown} onTouchStart={onTouchStart}>
            <svg ref={svgRef} className={styles.spiralSvg} viewBox="-200 -200 400 400" style={{ width: "100%", height: "100%" }}>
                {/* Rotating Group (for drag and auto-spin) */}
                <g ref={rotationGroupRef} className={styles.rotationGroup}>
                    {/* Spiral arms */}
                    <g>{arms}</g>
                    {/* Center cap to smooth the intersection */}
                    <circle r={strokeWidth * 0.65} fill={color}/>
                </g>
                {/* White circle layer in the middle of the spinner */}
                <circle r={12} fill="#ffffff"/>
            </svg>

            {/* Slide up text container */}
            {scrollZoom && slideUpText && (<div className={styles.textContainer}>
                    <div ref={textRef} className={styles.slideUpText}>
                        {slideUpText}
                    </div>
                </div>)}
        </div>);
}
