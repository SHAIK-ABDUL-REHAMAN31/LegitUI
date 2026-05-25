"use client";
import React, { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import gsap from "gsap";
import styles from "./PhysicsText.module.css";
export default function PhysicsText({
    text = "Craft stunning interactive user interfaces with LegitUI",
    splitMode = "words",
    fontSize = "clamp(1.5rem, 4vw, 2.5rem)",
    fontWeight = 600,
    fontFamily = "'Inter', system-ui, sans-serif",
    textColor = "#ffffff",
    gravity = 1,
    bounciness = 0.6,
    friction = 0.1,
    className = "",
    capsuleBg = "#000000",
    capsuleBorder = "rgba(255, 255, 255, 0.4)",
    showSparkles = false,
}) {
    const containerRef = useRef(null);
    const textRefs = useRef([]);
    
    const [items, setItems] = useState([]);
    const engineRef = useRef(null);
    const renderLoopRef = useRef(0);

    // Smart color fallback: if background is light and text color is white, use dark text
    const isLightBg = capsuleBg === "#ffffff" || capsuleBg.startsWith("rgba(255, 255, 255") || capsuleBg === "white";
    const normalizedColor = textColor.toLowerCase().trim();
    const isWhiteText = normalizedColor === "#ffffff" || normalizedColor === "#fff" || normalizedColor === "rgb(255,255,255)" || normalizedColor === "white";
    
    // For black background capsule, if textColor is dark/black, fall back to white text
    const isDarkBg = capsuleBg === "#000000" || capsuleBg === "black" || capsuleBg.startsWith("rgba(0, 0, 0");
    const isDarkText = normalizedColor === "#000000" || normalizedColor === "#11" || normalizedColor === "#111" || normalizedColor === "#111111" || normalizedColor === "black";
    
    const finalTextColor = (isLightBg && isWhiteText) 
        ? "#111111" 
        : (isDarkBg && isDarkText) 
            ? "#ffffff" 
            : textColor;

    // Smart font size fallback: cap oversized font sizes to keep capsule appearance
    const finalFontSize = typeof fontSize === "string" && (fontSize.includes("5rem") || fontSize.includes("6rem") || fontSize.includes("12rem"))
        ? "clamp(1.2rem, 3vw, 2rem)" 
        : fontSize;

    // Split text whenever it changes
    useEffect(() => {
        let newItems = [];
        if (splitMode === "words") {
            // Split by comma if present, otherwise by spaces
            if (text.includes(",")) {
                newItems = text.split(",").map(t => t.trim()).filter(Boolean);
            } else {
                newItems = text.split(/\s+/).filter(Boolean);
            }
        } else {
            newItems = text.split('').filter(c => c.trim() !== '');
        }
        setItems(newItems);
        // Reset refs array when items change
        textRefs.current = [];
    }, [text, splitMode]);

    useEffect(() => {
        if (!containerRef.current || items.length === 0) return;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // 1. Create Engine & World
        const engine = Matter.Engine.create();
        engine.world.gravity.y = gravity;
        engineRef.current = engine;

        // 2. Setup Boundaries (Floor and Walls)
        const wallOptions = { 
            isStatic: true, 
            render: { visible: false },
            friction: 0.1,
            restitution: 0.4
        };
        const floor = Matter.Bodies.rectangle(width / 2, height + 50, width * 2, 100, wallOptions);
        const wallLeft = Matter.Bodies.rectangle(-50, height / 2, 100, height * 2, wallOptions);
        const wallRight = Matter.Bodies.rectangle(width + 50, height / 2, 100, height * 2, wallOptions);
        const ceiling = Matter.Bodies.rectangle(width / 2, -1000, width * 2, 100, wallOptions);
        
        Matter.World.add(engine.world, [floor, wallLeft, wallRight, ceiling]);

        // 3. Create Text Bodies
        const bodies = items.map((_, i) => {
            const el = textRefs.current[i];
            if (!el) return null;
            
            // Measure precise HTML bounding box
            const bbox = {
                width: el.offsetWidth,
                height: el.offsetHeight
            };
            
            // Random drop spawn position
            const startX = width / 2 + (Math.random() - 0.5) * (width * 0.5);
            const startY = -50 - Math.random() * 300; 

            // Create physical body based on bounding box
            const body = Matter.Bodies.rectangle(
                startX, 
                startY, 
                bbox.width, 
                bbox.height, 
                {
                    restitution: bounciness,
                    friction: friction,
                    frictionAir: 0.01,
                    // Slightly randomize mass/density for playful collisions
                    density: 0.001 + Math.random() * 0.001
                }
            );

            // Add random initial rotation and angular velocity
            Matter.Body.setAngle(body, (Math.random() - 0.5) * 0.5);
            Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.1);

            return body;
        }).filter(Boolean);

        Matter.World.add(engine.world, bodies);

        // 4. Mouse Interactivity (Draggable Typography)
        // Attach to container to ensure coordinate mapping is correct
        const mouse = Matter.Mouse.create(container);
        const mouseConstraint = Matter.MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: { visible: false }
            }
        });
        Matter.World.add(engine.world, mouseConstraint);

        // 5. Game Loop with GSAP Syncing
        const update = () => {
            Matter.Engine.update(engine, 1000 / 60);
            
            bodies.forEach((body, i) => {
                const el = textRefs.current[i];
                if (el) {
                    // Sync HTML elements with physical bodies
                    gsap.set(el, {
                        x: body.position.x,
                        y: body.position.y,
                        xPercent: -50,
                        yPercent: -50,
                        rotation: body.angle * (180 / Math.PI),
                        transformOrigin: "50% 50%",
                        opacity: 1 // Fade in once placed
                    });
                }
            });
            renderLoopRef.current = requestAnimationFrame(update);
        };
        update();

        // 6. Handle Resize
        const handleResize = () => {
            if (!containerRef.current) return;
            const newWidth = containerRef.current.clientWidth;
            const newHeight = containerRef.current.clientHeight;
            
            Matter.Body.setPosition(floor, { x: newWidth / 2, y: newHeight + 50 });
            Matter.Body.setPosition(wallRight, { x: newWidth + 50, y: newHeight / 2 });
            Matter.Body.setPosition(ceiling, { x: newWidth / 2, y: -1000 });
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(renderLoopRef.current);
            Matter.Engine.clear(engine);
            Matter.World.clear(engine.world, false);
            // Must clear mouse to avoid memory leaks
            if (mouseConstraint.mouse) {
                Matter.Mouse.clearSourceEvents(mouseConstraint.mouse);
            }
        };
    }, [items, bounciness, friction, gravity]);

    return (
        <div ref={containerRef} className={`${styles.container} ${className}`}>
            {items.map((item, i) => (
                <div
                    key={`${item}-${i}`}
                    ref={(el) => {
                        textRefs.current[i] = el;
                    }}
                    className={styles.capsule}
                    style={{
                        opacity: 0,
                        fontSize: finalFontSize,
                        fontWeight: fontWeight,
                        fontFamily: fontFamily,
                        color: finalTextColor,
                        backgroundColor: capsuleBg,
                        borderColor: capsuleBorder,
                    }}
                >
                    {showSparkles && (
                        <div className={styles.sparklesContainer}>
                            <svg className={styles.sparkle} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2 Q12 12 22 12 Q12 12 12 22 Q12 12 2 12 Q12 12 12 2 Z" />
                            </svg>
                            <svg className={`${styles.sparkle} ${styles.sparkleSecond}`} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2 Q12 12 22 12 Q12 12 12 22 Q12 12 2 12 Q12 12 12 2 Z" />
                            </svg>
                        </div>
                    )}
                    <span className={styles.text}>{item}</span>
                </div>
            ))}
        </div>
    );
}
