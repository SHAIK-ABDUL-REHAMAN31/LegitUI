"use client";
import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import styles from "./OrbitGallery.module.css";
export default function OrbitGallery({ titleLine1 = "Join Our", titleLine2 = "Community", buttonText = "Join Us", rings, }) {
    const containerRef = useRef(null);
    const ringRefs = useRef([]);
    const nodeRefs = useRef([]);
    const ringTweens = useRef([]);
    const currentAngles = useRef([]);
    const hoveredIndexRef = useRef(null);
    // Flatten node configurations for the GSAP ticker loop
    const nodeConfigs = React.useMemo(() => {
        const configs = [];
        rings.forEach((ring, rIndex) => {
            ring.nodes.forEach((node, nIndex) => {
                configs.push({
                    ...node,
                    radius: ring.radius,
                    speed: ring.speed,
                    initialAngle: (nIndex / ring.nodes.length) * Math.PI * 2,
                    ringIndex: rIndex,
                });
            });
        });
        return configs;
    }, [rings]);
    useEffect(() => {
        // Initialize current angles
        if (currentAngles.current.length !== nodeConfigs.length) {
            currentAngles.current = nodeConfigs.map((c) => c.initialAngle);
        }
        // 1. Rotate the rings continuously (to animate the stars)
        ringRefs.current.forEach((ring, i) => {
            if (!ring)
                return;
            const ringConfig = rings[i];
            // GSAP rotates the ring in degrees. We convert speed (rad/sec) to total duration for 360 deg.
            // E.g., speed of 0.5 rad/s means 360 deg (6.28 rad) takes ~12.5s.
            const duration = (Math.PI * 2) / Math.abs(ringConfig.speed || 0.1);
            const direction = (ringConfig.speed || 1) > 0 ? 1 : -1;
            ringTweens.current[i] = gsap.to(ring, {
                rotation: 360 * direction,
                duration: duration,
                repeat: -1,
                ease: "none",
            });
        });
        // 2. Animate the nodes using GSAP ticker (mathematical translation)
        // This allows nodes to stay perfectly upright without counter-rotation, making hover expansion clean.
        const tickerCallback = (time, deltaTime) => {
            const dt = deltaTime / 1000;
            nodeRefs.current.forEach((node, i) => {
                if (!node)
                    return;
                const config = nodeConfigs[i];
                if (hoveredIndexRef.current !== i) {
                    currentAngles.current[i] += config.speed * dt;
                }
                const angle = currentAngles.current[i];
                // Calculate x and y based on trigonometry
                const x = Math.cos(angle) * config.radius;
                const y = Math.sin(angle) * config.radius;
                // Apply using GSAP. Since CSS sets transform: translate(-50%, -50%),
                // these x and y pixel values are appended natively.
                gsap.set(node, { x, y, xPercent: -50, yPercent: -50 });
            });
        };
        gsap.ticker.add(tickerCallback);
        return () => {
            gsap.ticker.remove(tickerCallback);
            ringTweens.current.forEach(t => t.kill());
        };
    }, [rings, nodeConfigs]);
    const renderStars = (radius, count) => {
        return Array.from({ length: count }).map((_, i) => {
            const angle = (i / count) * 360;
            return (<div key={`star-${i}`} className={styles.star} style={{
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px)`,
                }}/>);
        });
    };
    return (<div className={styles.container} ref={containerRef}>
      {/* Central Content */}
      <div className={styles.centerContent}>
        <h2 className={styles.title}>
          {titleLine1} <span className={styles.highlight}>{titleLine2}</span>
        </h2>
        <button className={styles.button}>{buttonText}</button>
      </div>

      {/* Orbit Rings (contain the stars) */}
      {rings.map((ring, i) => (<div key={`ring-${i}`} className={styles.orbitRing} ref={(el) => {
                if (el)
                    ringRefs.current[i] = el;
            }} style={{
                width: `${ring.radius * 2}px`,
                height: `${ring.radius * 2}px`,
            }}>
          {ring.stars && renderStars(ring.radius, ring.stars)}
        </div>))}

      {/* Orbit Nodes (rendered independently at center, animated via math) */}
      {nodeConfigs.map((config, i) => (<div key={config.id} className={styles.node} ref={(el) => {
                if (el)
                    nodeRefs.current[i] = el;
            }} onMouseEnter={() => {
                hoveredIndexRef.current = i;
            }} onMouseLeave={() => {
                hoveredIndexRef.current = null;
            }}>
          <img src={config.image} alt={config.name} className={styles.nodeImage}/>
          <div className={styles.nodeInfo}>
            <p className={styles.nodeName}>{config.name}</p>
            <p className={styles.nodeRole}>{config.role}</p>
          </div>
        </div>))}
    </div>);
}
