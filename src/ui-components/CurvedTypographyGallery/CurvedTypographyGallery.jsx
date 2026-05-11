"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./CurvedTypographyGallery.module.css";
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}
const defaultItems = [
    { id: "01", title: "PRISM", subtitle: "Refracting reality", image: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?q=80&w=800&auto=format&fit=crop" },
    { id: "02", title: "SILK", subtitle: "Fluid dynamics", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop" },
    { id: "03", title: "MONOLITH", subtitle: "Concrete poetry", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop" },
    { id: "04", title: "LUMINA", subtitle: "Neon reflections", image: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=800&auto=format&fit=crop" },
    { id: "05", title: "NEXUS", subtitle: "Digital frontier", image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=800&auto=format&fit=crop" },
    { id: "06", title: "ABYSS", subtitle: "Deep currents", image: "https://images.unsplash.com/photo-1551244072-5d12893278ab?q=80&w=800&auto=format&fit=crop" },
    { id: "07", title: "ECLIPSE", subtitle: "Shadow and light", image: "https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?q=80&w=800&auto=format&fit=crop" },
    { id: "08", title: "VOID", subtitle: "Absolute zero", image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=800&auto=format&fit=crop" },
];
export default function CurvedTypographyGallery({ items = defaultItems, className = "" }) {
    const containerRef = useRef(null);
    const galleryRef = useRef(null);
    const cardsRef = useRef([]);
    const R = 1200; // Adjusted radius to fit preview
    const anglePerItem = 14; // Degrees between each item
    const totalItems = items.length;
    useEffect(() => {
        const container = containerRef.current;
        const gallery = galleryRef.current;
        if (!container || !gallery)
            return;
        // Initial state setup for cards
        cardsRef.current.forEach((card, i) => {
            if (!card)
                return;
            const itemAngle = i * anglePerItem;
            const dist = Math.abs(itemAngle);
            const scale = gsap.utils.mapRange(0, anglePerItem * 3, 1, 0.5, Math.min(dist, anglePerItem * 3));
            const opacity = gsap.utils.mapRange(0, anglePerItem * 3, 1, 0.1, Math.min(dist, anglePerItem * 3));
            const blur = gsap.utils.mapRange(0, anglePerItem * 3, 0, 4, Math.min(dist, anglePerItem * 3));
            gsap.set(card, { scale, opacity, filter: `blur(${blur}px)` });
        });
        const totalRotation = -(totalItems - 1) * anglePerItem;
        const ctx = gsap.context(() => {
            // Rotate the entire gallery on scroll
            gsap.to(gallery, {
                rotation: totalRotation,
                ease: "none",
                scrollTrigger: {
                    trigger: container,
                    start: "top top",
                    end: `+=${totalItems * 400}`,
                    scrub: 1,
                    pin: true,
                    snap: {
                        snapTo: 1 / (totalItems - 1),
                        duration: 0.3,
                        ease: "power2.inOut"
                    },
                    onUpdate: (self) => {
                        const currentRot = self.progress * totalRotation;
                        // Dynamic scaling and perspective distortion for each card
                        cardsRef.current.forEach((card, i) => {
                            if (!card)
                                return;
                            const itemAngle = i * anglePerItem;
                            const absAngle = itemAngle + currentRot; // distance from top-center (0)
                            const dist = Math.abs(absAngle);
                            const maxDist = anglePerItem * 3;
                            const scale = gsap.utils.mapRange(0, maxDist, 1, 0.5, Math.min(dist, maxDist));
                            const opacity = gsap.utils.mapRange(0, maxDist, 1, 0.1, Math.min(dist, maxDist));
                            const blur = gsap.utils.mapRange(0, maxDist, 0, 4, Math.min(dist, maxDist));
                            const zIndex = 100 - Math.round(dist); // center card on top
                            gsap.set(card, {
                                scale,
                                opacity,
                                filter: `blur(${blur}px)`,
                                zIndex
                            });
                        });
                    }
                }
            });
            // Independent continuous rotation for the warped typography
            gsap.to(`.${styles.svgWrapper}`, {
                rotation: 360,
                duration: 80,
                repeat: -1,
                ease: "none",
                transformOrigin: "center center"
            });
        });
        return () => ctx.revert();
    }, [totalItems, anglePerItem]);
    const svgR = R - 150; // Text path radius
    return (<div ref={containerRef} className={`${styles.container} ${className}`}>
      
      {/* Wrapper to handle absolute positioning without GSAP transform conflicts */}
      <div className={styles.galleryWrapper}>
        
        {/* Rotating Gallery Container */}
        <div ref={galleryRef} className={styles.gallery} style={{
            top: 0,
            left: -R, // Center horizontally relative to the zero-width wrapper
            width: R * 2,
            height: R * 2,
        }}>
          {/* Kinetic Warped Typography SVG */}
          <div className={styles.svgWrapper}>
             <svg width={R * 2} height={R * 2} viewBox={`0 0 ${R * 2} ${R * 2}`}>
                <defs>
                   <path id="circle-path" d={`M ${R},${R} m -${svgR},0 a ${svgR},${svgR} 0 1,1 ${svgR * 2},0 a ${svgR},${svgR} 0 1,1 -${svgR * 2},0`}/>
                </defs>
                <text fill="#ffffff" fontSize="80" fontWeight="900" letterSpacing="12px" className={styles.curvedText}>
                   <textPath href="#circle-path" startOffset="25%" textAnchor="middle">
                      CURVED TYPOGRAPHY GALLERY · EXPERIMENTAL POSTER SYSTEMS · KINETIC EDITORIAL · DYNAMIC PERSPECTIVE · CURVED TYPOGRAPHY GALLERY · EXPERIMENTAL POSTER SYSTEMS · KINETIC EDITORIAL · DYNAMIC PERSPECTIVE · 
                   </textPath>
                </text>
             </svg>
          </div>

          {/* Cards */}
          {items.map((item, i) => {
            const currentAngle = i * anglePerItem;
            return (<div key={item.id} className={styles.cardContainer} style={{
                    transform: `rotate(${currentAngle}deg)`,
                    height: `${R}px`,
                    transformOrigin: `50% 100%`, // Rotate around the center of the large circle
                }}>
                 {/* Card - Shifted up slightly to center on the radius perimeter */}
                 <div ref={(el) => {
                    cardsRef.current[i] = el;
                }} className={styles.card}>
                    <div className={styles.gradientOverlay}/>
                    <img src={item.image} alt={item.title} className={styles.image}/>
                    
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
              </div>);
        })}
        </div>
      </div>
      
      {/* Decorative vertical center line for alignment */}
      <div className={styles.decorativeLine}/>
    </div>);
}
