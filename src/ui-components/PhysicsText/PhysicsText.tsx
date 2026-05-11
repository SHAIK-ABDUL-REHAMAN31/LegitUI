"use client";

import React, { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import gsap from "gsap";
import styles from "./PhysicsText.module.css";

export interface PhysicsTextProps {
    /** The text to display */
    text?: string;
    /** Whether to split by characters or words */
    splitMode?: "chars" | "words";
    /** Font size of the text */
    fontSize?: string | number;
    /** Font weight */
    fontWeight?: string | number;
    /** Font family */
    fontFamily?: string;
    /** Text color */
    textColor?: string;
    /** Gravity multiplier */
    gravity?: number;
    /** Bounciness (restitution) of the text (0 to 1) */
    bounciness?: number;
    /** Friction of the text bodies (0 to 1) */
    friction?: number;
    /** Additional CSS classes for the container */
    className?: string;
}

export default function PhysicsText({
    text = "DRAG ME AROUND PLAYFUL GRAVITY BOUNCING",
    splitMode = "words",
    fontSize = "clamp(2rem, 6vw, 5rem)",
    fontWeight = 900,
    fontFamily = "'Inter', system-ui, sans-serif",
    textColor = "#ffffff",
    gravity = 1,
    bounciness = 0.6,
    friction = 0.1,
    className = "",
}: PhysicsTextProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const textRefs = useRef<(SVGTextElement | null)[]>([]);
    
    const [items, setItems] = useState<string[]>([]);
    const engineRef = useRef<Matter.Engine | null>(null);
    const renderLoopRef = useRef<number>(0);

    // Split text whenever it changes
    useEffect(() => {
        let newItems: string[] = [];
        if (splitMode === "words") {
            newItems = text.split(/\s+/).filter(Boolean);
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
            
            // Measure precise SVG bounding box
            const bbox = el.getBBox();
            
            // Random drop spawn position
            const startX = width / 2 + (Math.random() - 0.5) * (width * 0.5);
            const startY = -50 - Math.random() * 300; 

            // Create physical body based on bounding box
            const body = Matter.Bodies.rectangle(
                startX, 
                startY, 
                bbox.width * 0.95, // slight tolerance so they can pack tighter
                bbox.height * 0.8, // text visual height is smaller than bbox 
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
        }).filter(Boolean) as Matter.Body[];

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
                    // Sync SVG <text> elements with physical bodies
                    gsap.set(el, {
                        x: body.position.x,
                        y: body.position.y,
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
            <svg ref={svgRef} className={styles.svg}>
                {items.map((item, i) => (
                    <text
                        key={`${item}-${i}`}
                        ref={(el) => {
                            textRefs.current[i] = el;
                        }}
                        className={styles.textParticle}
                        x={0}
                        y={0}
                        fontSize={fontSize}
                        fontWeight={fontWeight}
                        fontFamily={fontFamily}
                        fill={textColor}
                        textAnchor="middle"
                        dominantBaseline="central"
                        style={{ opacity: 0 }}
                    >
                        {item}
                    </text>
                ))}
            </svg>
        </div>
    );
}
