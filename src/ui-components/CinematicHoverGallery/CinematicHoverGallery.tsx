"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { X, ArrowRight } from "lucide-react";
import styles from "./CinematicHoverGallery.module.css";

export interface GalleryItem {
  id: string | number;
  title: string;
  category: string;
  image: string;
  description?: string;
}

export interface CinematicHoverGalleryProps {
  items: GalleryItem[];
  distortionIntensity?: number;
  springDamping?: number;
  skewStrength?: number;
  className?: string;
}

export const CinematicHoverGallery: React.FC<CinematicHoverGalleryProps> = ({
  items,
  distortionIntensity = 80,
  springDamping = 0.25,
  skewStrength = 2.5,
  className = "",
}) => {
  const [activeId, setActiveId] = useState<string | number | null>(null);
  const [prevId, setPrevId] = useState<string | number | null>(null);
  const [clickedItem, setClickedItem] = useState<GalleryItem | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const displacementRef = useRef<SVGFeDisplacementMapElement>(null);
  const turbulenceRef = useRef<SVGFeTurbulenceElement>(null);

  const lastMouse = useRef({ x: 0, y: 0 });
  const speed = useRef(0);
  const angle = useRef(0);
  const isHovered = useRef(false);

  // Dimension helpers for centering the floating card on the cursor
  const cardWidth = 380;
  const cardHeight = 480;

  // Initialize mouse position interpolation with GSAP quickTo
  const xTo = useRef<((value: number) => void) | null>(null);
  const yTo = useRef<((value: number) => void) | null>(null);

  useEffect(() => {
    if (!floatingRef.current) return;

    // quickTo creates highly optimized tweens updating properties instantly
    xTo.current = gsap.quickTo(floatingRef.current, "x", {
      duration: 0.6,
      ease: `power3.out`,
    });

    yTo.current = gsap.quickTo(floatingRef.current, "y", {
      duration: 0.6,
      ease: `power3.out`,
    });

    // Start with floating container invisible/scaled down
    gsap.set(floatingRef.current, { scale: 0.8, opacity: 0 });
  }, []);

  // Update mouse position and calculate velocity for elastic stretching
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!xTo.current || !yTo.current || !floatingRef.current) return;

      const targetX = e.clientX;
      const targetY = e.clientY;

      // Calculate distance/speed and angle of cursor movement
      const dx = targetX - lastMouse.current.x;
      const dy = targetY - lastMouse.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angleRad = Math.atan2(dy, dx);
      const angleDeg = angleRad * (180 / Math.PI);

      // Store velocity and direction
      speed.current = Math.min(dist * skewStrength, 70); // capped max skewing
      angle.current = angleDeg;

      lastMouse.current = { x: targetX, y: targetY };

      // Update positions (centering card on mouse cursor)
      xTo.current(targetX - cardWidth / 2);
      yTo.current(targetY - cardHeight / 2);

      // Dynamic shear/stretch on the image card wrapper based on speed
      if (isHovered.current) {
        gsap.to(imageWrapperRef.current, {
          skewX: Math.cos(angleRad) * speed.current * 0.35,
          skewY: Math.sin(angleRad) * speed.current * 0.35,
          scaleX: 1 + speed.current * 0.004,
          scaleY: 1 - speed.current * 0.003,
          duration: 0.45,
          ease: "power3.out",
          overwrite: "auto",
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [skewStrength]);

  // Handle decay of skewing/scale when the mouse stops moving
  useEffect(() => {
    let rAFId: number;
    const decayLoop = () => {
      if (speed.current > 0.01) {
        speed.current *= 0.85; // Decay factor per frame

        if (speed.current < 0.1) speed.current = 0;

        const angleRad = (angle.current * Math.PI) / 180;
        gsap.to(imageWrapperRef.current, {
          skewX: Math.cos(angleRad) * speed.current * 0.35,
          skewY: Math.sin(angleRad) * speed.current * 0.35,
          scaleX: 1 + speed.current * 0.004,
          scaleY: 1 - speed.current * 0.003,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
      rAFId = requestAnimationFrame(decayLoop);
    };

    rAFId = requestAnimationFrame(decayLoop);
    return () => cancelAnimationFrame(rAFId);
  }, []);

  // Liquid displacement trigger on active image transition
  useEffect(() => {
    if (activeId !== null && displacementRef.current && turbulenceRef.current) {
      // Pulse SVG filter displacement scale
      gsap.killTweensOf(displacementRef.current);
      gsap.killTweensOf(turbulenceRef.current);

      gsap.timeline()
        .to(displacementRef.current, {
          attr: { scale: distortionIntensity },
          duration: 0.2,
          ease: "power1.out",
        })
        .to(displacementRef.current, {
          attr: { scale: 0 },
          duration: 0.55,
          ease: "power2.inOut",
        });

      // Swirl the noise base frequency slightly to give an organic water flow feel
      gsap.to(turbulenceRef.current, {
        attr: { baseFrequency: `${0.015 + Math.random() * 0.02} 0.02` },
        duration: 0.6,
        ease: "power2.out",
      });
    }
  }, [activeId, distortionIntensity]);

  // Entrance & Exit animations for the floating image card
  const handleMouseEnterList = () => {
    isHovered.current = true;
    gsap.to(floatingRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      ease: "power4.out",
      overwrite: "auto",
    });
  };

  const handleMouseLeaveList = () => {
    isHovered.current = false;
    setActiveId(null);
    setPrevId(null);
    gsap.to(floatingRef.current, {
      opacity: 0,
      scale: 0.85,
      duration: 0.4,
      ease: "power3.inOut",
      overwrite: "auto",
    });
  };

  const handleItemHover = (id: string | number) => {
    if (activeId === id) return;
    setPrevId(activeId);
    setActiveId(id);
  };

  const handleItemClick = (e: React.MouseEvent, item: GalleryItem) => {
    e.preventDefault();
    setClickedItem(item);
  };

  const closeFullscreen = () => {
    setClickedItem(null);
  };

  // Helper to slice text characters for stagger animations
  const renderSplitText = (text: string) => {
    return text.split("").map((char, i) => {
      if (char === " ") return <span key={i}>&nbsp;</span>;
      return (
        <span key={i} className={styles.charOuter}>
          <span
            className={styles.charInner}
            data-char={char}
            style={{ transitionDelay: `${i * 0.018}s` }}
          >
            {char}
          </span>
        </span>
      );
    });
  };

  return (
    <div ref={containerRef} className={`${styles.galleryContainer} ${className}`}>
      {/* Ambient glowing backdrops */}
      <div className={styles.ambientBg}>
        <div className={styles.glare1} />
        <div className={styles.glare2} />
        <div className={styles.noiseOverlay} />
      </div>

      {/* SVG Liquid Displacement Filter Block */}
      <svg style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}>
        <defs>
          <filter id="liquid-distortion-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              ref={turbulenceRef}
              type="fractalNoise"
              baseFrequency="0.02"
              numOctaves="2"
              result="noise"
            />
            <feDisplacementMap
              ref={displacementRef}
              in="SourceGraphic"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Gallery Layout */}
      <div className={styles.galleryContent}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1>Curated Collections</h1>
            <p>Interactive Motion Portfolio</p>
          </div>
          <div className={styles.counter}>
            {activeId !== null
              ? `${String(items.findIndex((item) => item.id === activeId) + 1).padStart(2, "0")} / ${String(
                  items.length
                ).padStart(2, "0")}`
              : `00 / ${String(items.length).padStart(2, "0")}`}
          </div>
        </div>

        <nav
          className={styles.menuList}
          onMouseEnter={handleMouseEnterList}
          onMouseLeave={handleMouseLeaveList}
        >
          {items.map((item, index) => (
            <a
              key={item.id}
              href="#"
              className={styles.menuItem}
              onMouseEnter={() => handleItemHover(item.id)}
              onClick={(e) => handleItemClick(e, item)}
            >
              <div className={styles.itemLabel}>
                <span className={styles.itemNumber}>
                  {String(index + 1).padStart(2, "0")}.
                </span>
                <div className={styles.itemTextWrapper}>
                  <span className={styles.itemText}>{renderSplitText(item.title)}</span>
                </div>
              </div>
              <span className={styles.itemCategory}>{item.category}</span>
            </a>
          ))}
        </nav>
      </div>

      {/* Floating Interactive Image Cursor Preview */}
      <div ref={floatingRef} className={styles.floatingContainer}>
        <div
          ref={imageWrapperRef}
          className={`${styles.imageWrapper} ${
            activeId !== null ? styles.liquidFilterActive : ""
          }`}
        >
          <div className={styles.innerGlow} />
          {items.map((item) => {
            const isActive = activeId === item.id;
            const isPrev = prevId === item.id;
            const imgClass = `${styles.previewImage} ${
              isActive ? styles.previewImageActive : isPrev ? styles.previewImagePrevious : ""
            }`;
            return (
              <img
                key={item.id}
                src={item.image}
                alt={item.title}
                className={imgClass}
                loading="eager"
              />
            );
          })}
        </div>
      </div>

      {/* Fullscreen Overlay Detail Transition */}
      {clickedItem && (
        <div className={styles.fullscreenOverlay}>
          <img
            src={clickedItem.image}
            alt={clickedItem.title}
            className={styles.fullscreenImage}
          />
          <div className={styles.innerGlow} />

          <button
            onClick={closeFullscreen}
            style={{
              position: "absolute",
              top: "2.5rem",
              right: "2.5rem",
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "white",
              padding: "1rem",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              transition: "background 0.3s, transform 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <X size={24} />
          </button>

          <div className={styles.fullscreenContent}>
            <span
              style={{
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "#818cf8",
                fontWeight: 600,
              }}
            >
              {clickedItem.category}
            </span>
            <h2 className={styles.fullscreenTitle}>{clickedItem.title}</h2>
            <p className={styles.fullscreenDesc}>
              {clickedItem.description ||
                "A cinematic visual piece celebrating minimalist composition, premium typography interactions, and advanced motion behaviors designed for digital high-end portfolios."}
            </p>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              style={{
                marginTop: "2rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "white",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.875rem",
                borderBottom: "1px solid white",
                paddingBottom: "0.25rem",
                transition: "gap 0.3s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.gap = "0.75rem")}
              onMouseLeave={(e) => (e.currentTarget.style.gap = "0.5rem")}
            >
              Explore Full Project <ArrowRight size={16} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default CinematicHoverGallery;
