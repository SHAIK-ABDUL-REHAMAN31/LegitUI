"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./CurvedTypographyGallery.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface CurvedGalleryItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
}

export interface CurvedTypographyGalleryProps {
  items?: CurvedGalleryItem[];
  className?: string;
}

const defaultItems: CurvedGalleryItem[] = [
  { id: "01", title: "PRISM", subtitle: "Refracting reality", image: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?q=80&w=800&auto=format&fit=crop" },
  { id: "02", title: "SILK", subtitle: "Fluid dynamics", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop" },
  { id: "03", title: "MONOLITH", subtitle: "Concrete poetry", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop" },
  { id: "04", title: "LUMINA", subtitle: "Neon reflections", image: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=800&auto=format&fit=crop" },
  { id: "05", title: "NEXUS", subtitle: "Digital frontier", image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=800&auto=format&fit=crop" },
  { id: "06", title: "ABYSS", subtitle: "Deep currents", image: "https://images.unsplash.com/photo-1551244072-5d12893278ab?q=80&w=800&auto=format&fit=crop" },
  { id: "07", title: "ECLIPSE", subtitle: "Shadow and light", image: "https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?q=80&w=800&auto=format&fit=crop" },
  { id: "08", title: "VOID", subtitle: "Absolute zero", image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=800&auto=format&fit=crop" },
];

export default function CurvedTypographyGallery({ items = defaultItems, className = "" }: CurvedTypographyGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const R = 850; // Radius circumference to fit showcase bounds
  const anglePerItem = 15; // Degrees of separation between cards
  const totalItems = items.length;

  useEffect(() => {
    const container = containerRef.current;
    const gallery = galleryRef.current;
    if (!container || !gallery) return;

    // Calculate total rotation to move from first to last item
    const totalRotation = -(totalItems - 1) * anglePerItem;

    // Define card style updater that handles scroll updates and entrance progress simultaneously
    const updateCards = (currentRot: number, entranceProgress: number = 1) => {
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        const itemAngle = i * anglePerItem;
        const absAngle = itemAngle + currentRot;
        const dist = Math.abs(absAngle);
        const maxDist = anglePerItem * 3; // Focus drop-off boundary

        // Base mapping curves driven by scroll distance
        const targetScale = gsap.utils.mapRange(0, maxDist, 1, 0.8, Math.min(dist, maxDist));
        const targetOpacity = gsap.utils.mapRange(0, maxDist, 1, 0.8, Math.min(dist, maxDist));
        const targetBlur = 0; // No blur on side cards for crisp visuals
        const zIndex = 100 - Math.round(dist);
        const yOffset = 0; // Natural circular curvature handles depth and Y offset

        // Blend scroll-driven calculations with the entrance progress
        const scale = gsap.utils.interpolate(targetScale * 0.3, targetScale, entranceProgress);
        const opacity = gsap.utils.interpolate(0, targetOpacity, entranceProgress);
        const blur = gsap.utils.interpolate(10, targetBlur, entranceProgress);
        const y = gsap.utils.interpolate(150, yOffset, entranceProgress);

        gsap.set(card, {
          scale,
          opacity,
          filter: `blur(${blur}px)`,
          y,
          zIndex
        });

        // Text Overlay Focus Effect: Subtle fade for non-active cards
        const textOverlay = card.querySelector(`.${styles.textOverlay}`);
        if (textOverlay) {
          const textDist = Math.min(dist, anglePerItem * 1.5);
          const baseTextOpacity = gsap.utils.mapRange(0, anglePerItem * 1.5, 1, 0.3, textDist);
          const baseTextY = gsap.utils.mapRange(0, anglePerItem * 1.5, 0, 15, textDist);

          const textOpacity = baseTextOpacity * entranceProgress;
          const textY = baseTextY + (1 - entranceProgress) * 20;

          gsap.set(textOverlay, {
            opacity: textOpacity,
            y: textY
          });
        }
      });
    };

    const ctx = gsap.context(() => {
      // 1. Entrance object to track blooming reveal progress
      const entranceObj = { progress: 0 };
      const entranceTween = gsap.to(entranceObj, {
        progress: 1,
        duration: 1.5,
        ease: "power4.out",
        delay: 0.25,
        onUpdate: () => {
          const currentRot = gsap.getProperty(gallery, "rotation") as number || 0;
          updateCards(currentRot, entranceObj.progress);
        }
      });

      // 2. Rotate the entire gallery on scroll (using smoothed tween updates)
      gsap.to(gallery, {
        rotation: totalRotation,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: `+=${totalItems * 400}`,
          scrub: 1.2, // Smoothed scroll lag
          pin: true,
          snap: {
            snapTo: 1 / (totalItems - 1),
            duration: 0.5,
            ease: "power3.inOut"
          }
        },
        onUpdate: function () {
          // This executes on every frame the scroll position (rotation) interpolates
          const currentRot = gsap.getProperty(gallery, "rotation") as number || 0;
          updateCards(currentRot, entranceObj.progress);
        }
      });

      // 3. Ambient entrance and continuous rotation for the warped typography ring
      gsap.fromTo(`.${styles.svgWrapper}`,
        { opacity: 0, scale: 0.8 },
        { opacity: 0.35, scale: 1, duration: 2.0, ease: "power4.out", delay: 0.1 }
      );

      gsap.to(`.${styles.svgWrapper}`, {
        rotation: 360,
        duration: 90,
        repeat: -1,
        ease: "none",
        transformOrigin: "center center"
      });
    });

    return () => ctx.revert();
  }, [totalItems, anglePerItem]);

  const svgR = 770; // Arc radius placed behind cards to fit entirely in viewBox without clipping

  return (
    <div ref={containerRef} className={`${styles.container} ${className}`}>
      {/* Soft Ambient Glow in Center Showcase */}
      <div className={styles.ambientGlow} />
      
      {/* Wrapper to handle absolute positioning without GSAP transform conflicts */}
      <div className={styles.galleryWrapper}>
        
        {/* Rotating Gallery Container */}
        <div 
          ref={galleryRef}
          className={styles.gallery}
          style={{ 
             top: 0,
             left: -R, // Center horizontally relative to the zero-width wrapper
             width: R * 2, 
             height: R * 2,
          }}
        >
          {/* Kinetic Warped Typography SVG */}
          <div className={styles.svgWrapper}>
             <svg width={R * 2} height={R * 2} viewBox={`0 0 ${R*2} ${R*2}`}>
                <defs>
                   <path id="circle-path" d={`M ${R},${R} m -${svgR},0 a ${svgR},${svgR} 0 1,1 ${svgR*2},0 a ${svgR},${svgR} 0 1,1 -${svgR*2},0`} />
                </defs>
                <text fill="#ffffff" fontSize="56" fontWeight="900" letterSpacing="15px" className={styles.curvedText}>
                   <textPath href="#circle-path" startOffset="25%" textAnchor="middle">
                      CURVED TYPOGRAPHY GALLERY · EXPERIMENTAL POSTER SYSTEMS · KINETIC EDITORIAL · DYNAMIC PERSPECTIVE · 
                   </textPath>
                </text>
             </svg>
          </div>

          {/* Cards */}
          {items.map((item, i) => {
            const currentAngle = i * anglePerItem;
            
            return (
              <div 
                key={item.id}
                className={styles.cardContainer}
                style={{
                  transform: `rotate(${currentAngle}deg)`,
                  height: `${R}px`,
                  transformOrigin: `50% 100%`, // Rotate around the center of the large circle
                }}
              >
                 {/* Card - Shifted up slightly to center on the radius perimeter */}
                 <div 
                   ref={(el) => {
                     cardsRef.current[i] = el;
                   }}
                   style={{ opacity: 0 }} // Pre-hidden to prevent FOUC on render
                   className={styles.card}
                    onMouseEnter={(e) => {
                      const inner = e.currentTarget.querySelector(`.${styles.cardInner}`);
                      if (inner) {
                        gsap.to(inner, {
                          scale: 1.08,
                          y: -10,
                          duration: 0.5,
                          ease: "power3.out",
                          overwrite: "auto"
                        });
                      }
                    }}
                    onMouseLeave={(e) => {
                      const inner = e.currentTarget.querySelector(`.${styles.cardInner}`);
                      if (inner) {
                        gsap.to(inner, {
                          scale: 1,
                          y: 0,
                          duration: 0.5,
                          ease: "power3.out",
                          overwrite: "auto"
                        });
                      }
                    }}
                 >
                    <div className={styles.cardInner}>
                       <div className={styles.gradientOverlay} />
                       <img src={item.image} alt={item.title} className={styles.image} />
                       
                       {/* Text overlay */}
                       <div className={styles.textOverlay}>
                          <p className={styles.idText}>
                             {item.id}
                          </p>
                          <h3 className={styles.titleText}>
                             {item.title}
                          </h3>
                          <p className={styles.subtitleText}>
                             {item.subtitle}
                          </p>
                       </div>
                    </div>
                 </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Decorative vertical center line for alignment */}
      <div className={styles.decorativeLine} />
    </div>
  );
}
