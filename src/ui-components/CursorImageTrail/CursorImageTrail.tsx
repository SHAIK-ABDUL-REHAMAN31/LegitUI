"use client";

import React, { useRef, useEffect, ReactNode } from "react";
import { gsap } from "gsap";
import styles from "./CursorImageTrail.module.css";

export interface CursorImageTrailProps {
  images: string[];
  renderCount?: number;
  children?: ReactNode;
}

export default function CursorImageTrail({
  images,
  renderCount = 15,
  children,
}: CursorImageTrailProps) {
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  // Store an array of {x, y} for each image.
  const posRef = useRef<{ x: number; y: number }[]>([]);

  useEffect(() => {
    // Generate the array of positions initialized to center screen
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    posRef.current = Array(renderCount)
      .fill(0)
      .map(() => ({ x: cx, y: cy }));

    const mouse = { x: cx, y: cy };

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener("mousemove", onMouseMove);

    // Start GSAP ticker
    const updateLoop = () => {
      imagesRef.current.forEach((img, i) => {
        if (!img) return;

        // Target is either mouse (for head) or previous segment (for body)
        const target = i === 0 ? mouse : posRef.current[i - 1];

        // Interpolation factor determines the elasticity/snappiness of the snake
        const ease = 0.25;

        posRef.current[i].x += (target.x - posRef.current[i].x) * ease;
        posRef.current[i].y += (target.y - posRef.current[i].y) * ease;

        // Dynamic rotation based on horizontal movement
        const dx = target.x - posRef.current[i].x;

        gsap.set(img, {
          x: posRef.current[i].x,
          y: posRef.current[i].y,
          xPercent: -50,
          yPercent: -50,
          rotation: dx * 0.1, // Smooth kinetic tilt based on velocity!
        });
      });
    };

    gsap.ticker.add(updateLoop);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      gsap.ticker.remove(updateLoop);
    };
  }, [renderCount]);

  // Create the extended array of images by repeating the provided images
  const repeatedImages = Array.from({ length: renderCount }).map(
    (_, i) => images[i % images.length]
  );

  return (
    <div className={styles.container}>
      <div className={styles.content}>{children}</div>

      {repeatedImages.map((src, i) => (
        <img
          key={i}
          ref={(el) => {
            if (el) imagesRef.current[i] = el;
          }}
          src={src}
          className={styles.trailImage}
          alt={`trail-${i}`}
          style={{ zIndex: renderCount - i }} // Head (0) has highest z-index
        />
      ))}
    </div>
  );
}
