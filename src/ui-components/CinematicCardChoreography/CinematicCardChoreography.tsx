"use client";
import React, { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import styles from "./CinematicCardChoreography.module.css";

export interface CinematicCard {
  id: string | number;
  title: string;
  subtitle: string;
  image: string;
}

export interface CinematicCardChoreographyProps {
  /** Array of card data to display */
  cards?: CinematicCard[];
  /** Additional CSS class for the container */
  className?: string;
  /** Width of each card in pixels */
  cardWidth?: number;
  /** Height of each card in pixels */
  cardHeight?: number;
  /** Radius of the circular orbit in pixels */
  orbitRadius?: number;
  /** Overall animation speed multiplier (1 = default, 2 = twice as fast, 0.5 = half speed) */
  speed?: number;
  /** Pause the animation on hover */
  pauseOnHover?: boolean;
}

const defaultCards: CinematicCard[] = [
  { id: 1, title: "The Catalyst", subtitle: "Ignite the spark of creation.", image: "/images/chrome_sculpture.png" },
  { id: 2, title: "The Architect", subtitle: "Structure your grand design.", image: "/images/orange_silhouette.png" },
  { id: 3, title: "The Oracle", subtitle: "Foresee the hidden patterns.", image: "/images/woman_profile_gray.png" },
  { id: 4, title: "The Vanguard", subtitle: "Lead the charge forward.", image: "/images/chrome_sculpture.png" },
  { id: 5, title: "The Enigma", subtitle: "Embrace the unknown void.", image: "/images/orange_silhouette.png" },
  { id: 6, title: "The Monolith", subtitle: "Stand firm against time.", image: "/images/woman_profile_gray.png" },
];

// ─── position helpers ────────────────────────────────────────────────────────

function getOrbitPositions(total: number, radius: number) {
  return Array.from({ length: total }, (_, i) => {
    const angle = (i / total) * Math.PI * 2;
    return {
      x: Math.sin(angle) * radius,
      y: 0,
      z: Math.cos(angle) * radius,
      rotationY: angle * (180 / Math.PI),
      rotationX: 0,
      rotationZ: 0,
    };
  });
}

function getFanPositions(total: number, cardWidth: number) {
  const spreadX = cardWidth * 0.72;
  const centerIndex = (total - 1) / 2;
  return Array.from({ length: total }, (_, i) => {
    const t = (i - centerIndex) / Math.max(centerIndex, 1);
    return {
      x: (i - centerIndex) * spreadX,
      y: t * t * 35,
      z: (total - i) * 6, // Layer them nicely front-to-back
      rotationY: -(i - centerIndex) * 5,
      rotationX: 8,
      rotationZ: (i - centerIndex) * 4,
    };
  });
}

function getMatrixPositions(total: number, cardWidth: number) {
  const cols = 3;
  const colGap = cardWidth * 1.15;
  const rowGap = cardWidth * 1.3;
  return Array.from({ length: total }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      x: (col - (cols - 1) / 2) * colGap,
      y: (row - 0.5) * rowGap - 20,
      z: i * 4,
      rotationY: -15,
      rotationX: 35,
      rotationZ: -10,
    };
  });
}

function getHelixPositions(total: number, orbitRadius: number) {
  return Array.from({ length: total }, (_, i) => {
    const angle = (i / total) * Math.PI * 2 * 1.5; // 1.5 winds
    const heightSpread = 180; // vertical spacing
    const centerIndex = (total - 1) / 2;
    const y = (i - centerIndex) * (heightSpread / total);
    return {
      x: Math.sin(angle) * orbitRadius * 0.75,
      y: y - 20,
      z: Math.cos(angle) * orbitRadius * 0.75,
      rotationY: angle * (180 / Math.PI) + 90, // face outwards
      rotationX: 10,
      rotationZ: 0,
    };
  });
}

function getStackPositions(total: number) {
  return Array.from({ length: total }, (_, i) => ({
    x: 0,
    y: 0,
    z: i * 4,
    rotationY: 0,
    rotationX: 0,
    rotationZ: 0,
  }));
}

// ─── component ───────────────────────────────────────────────────────────────

export const CinematicCardChoreography: React.FC<CinematicCardChoreographyProps> = ({
  cards = defaultCards,
  className = "",
  cardWidth = 200,
  cardHeight = 280,
  orbitRadius = 320,
  speed = 1,
  pauseOnHover = false,
}) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useMemo(
    () => cards.map(() => React.createRef<HTMLDivElement>()),
    [cards.length]
  );
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // ── Pause on hover ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!pauseOnHover || !containerRef.current) return;
    const el = containerRef.current;
    const onEnter = () => tlRef.current?.pause();
    const onLeave = () => tlRef.current?.resume();
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [pauseOnHover]);

  // ── Main animation ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!sceneRef.current) return;

    // Kill previous timeline so prop changes (sliders) cause a clean rebuild
    if (tlRef.current) {
      tlRef.current.kill();
      tlRef.current = null;
    }

    const s = Math.max(speed, 0.1); // clamp to prevent zero/negative
    const total = cards.length;
    const orbitPos = getOrbitPositions(total, orbitRadius);
    const fanPos = getFanPositions(total, cardWidth);
    const matrixPos = getMatrixPositions(total, cardWidth);
    const helixPos = getHelixPositions(total, orbitRadius);
    const stackPos = getStackPositions(total);

    // ── Initial state ───────────────────────────────────────────────────────
    gsap.set(sceneRef.current, { rotationY: 0 });
    cardRefs.forEach((ref, i) => {
      if (!ref.current) return;
      gsap.set(ref.current, { ...orbitPos[i], scale: 1 });
    });

    const tl = gsap.timeline({ repeat: -1 });
    tlRef.current = tl;

    // ── PHASE 1: Orbit Spin ─────────────────────────────────────────────────
    tl.addLabel("orbitSpin");
    tl.to(sceneRef.current, {
      rotationY: 360,
      duration: 5.0 / s,
      ease: "power2.inOut",
    }, "orbitSpin");
    
    // Wave ripple during orbit spin
    cardRefs.forEach((ref, i) => {
      if (!ref.current) return;
      tl.to(ref.current, {
        y: -20,
        duration: 1.0 / s,
        ease: "sine.inOut",
        repeat: 1,
        yoyo: true,
      }, `orbitSpin+=${i * 0.15 / s}`);
    });
    
    tl.set(sceneRef.current, { rotationY: 0 });

    // ── PHASE 2: Orbit -> Fan (Staggered swoop & flip) ──────────────────────
    tl.addLabel("orbitToFan");
    cardRefs.forEach((ref, i) => {
      if (!ref.current) return;
      tl.to(ref.current, {
        keyframes: [
          {
            x: fanPos[i].x * 1.2,
            y: fanPos[i].y - 100,
            z: fanPos[i].z + 150,
            rotationY: fanPos[i].rotationY + 180, // Flip to reveal back
            rotationX: fanPos[i].rotationX + 15,
            rotationZ: fanPos[i].rotationZ - 5,
            duration: 0.8 / s,
            ease: "power2.out",
          },
          {
            x: fanPos[i].x,
            y: fanPos[i].y,
            z: fanPos[i].z,
            rotationY: fanPos[i].rotationY,
            rotationX: fanPos[i].rotationX,
            rotationZ: fanPos[i].rotationZ,
            duration: 0.8 / s,
            ease: "back.out(1.2)",
          }
        ]
      }, `orbitToFan+=${i * 0.15 / s}`);
    });

    // Fan Idle Float
    tl.addLabel("fanIdle");
    cardRefs.forEach((ref, i) => {
      if (!ref.current) return;
      tl.to(ref.current, {
        y: fanPos[i].y - 8,
        duration: 1.0 / s,
        ease: "sine.inOut",
      }, `fanIdle`);
      tl.to(ref.current, {
        y: fanPos[i].y,
        duration: 1.0 / s,
        ease: "sine.inOut",
      }, `fanIdle+=${1.0 / s}`);
    });

    // ── PHASE 3: Fan -> Matrix (Staggered grid placement & spin) ─────────────
    tl.addLabel("fanToMatrix");
    cardRefs.forEach((ref, i) => {
      if (!ref.current) return;
      tl.to(ref.current, {
        keyframes: [
          {
            x: matrixPos[i].x * 1.3,
            y: matrixPos[i].y - 120,
            z: matrixPos[i].z + 100,
            rotationY: matrixPos[i].rotationY - 180, // Spin revealing back
            rotationX: matrixPos[i].rotationX + 20,
            rotationZ: matrixPos[i].rotationZ + 10,
            duration: 0.8 / s,
            ease: "power2.inOut",
          },
          {
            x: matrixPos[i].x,
            y: matrixPos[i].y,
            z: matrixPos[i].z,
            rotationY: matrixPos[i].rotationY,
            rotationX: matrixPos[i].rotationX,
            rotationZ: matrixPos[i].rotationZ,
            duration: 0.8 / s,
            ease: "power3.out",
          }
        ]
      }, `fanToMatrix+=${i * 0.12 / s}`);
    });

    // Matrix Idle Float
    tl.addLabel("matrixIdle");
    cardRefs.forEach((ref, i) => {
      if (!ref.current) return;
      tl.to(ref.current, {
        y: matrixPos[i].y - 6,
        duration: 1.0 / s,
        ease: "sine.inOut",
      }, `matrixIdle`);
      tl.to(ref.current, {
        y: matrixPos[i].y,
        duration: 1.0 / s,
        ease: "sine.inOut",
      }, `matrixIdle+=${1.0 / s}`);
    });

    // ── PHASE 4: Matrix -> Helix (Staggered wind-up) ────────────────────────
    tl.addLabel("matrixToHelix");
    cardRefs.forEach((ref, i) => {
      if (!ref.current) return;
      tl.to(ref.current, {
        keyframes: [
          {
            x: helixPos[i].x * 1.4,
            z: helixPos[i].z * 1.4,
            y: helixPos[i].y - 50,
            rotationY: helixPos[i].rotationY + 120,
            rotationX: helixPos[i].rotationX - 15,
            duration: 0.8 / s,
            ease: "power2.out",
          },
          {
            x: helixPos[i].x,
            y: helixPos[i].y,
            z: helixPos[i].z,
            rotationY: helixPos[i].rotationY,
            rotationX: helixPos[i].rotationX,
            rotationZ: helixPos[i].rotationZ,
            duration: 0.7 / s,
            ease: "back.out(1.1)",
          }
        ]
      }, `matrixToHelix+=${i * 0.12 / s}`);
    });

    // Helix Spin & Ripple Wave
    tl.addLabel("helixSpin");
    tl.to(sceneRef.current, {
      rotationY: -180,
      duration: 4.5 / s,
      ease: "power2.inOut",
    }, "helixSpin");
    
    cardRefs.forEach((ref, i) => {
      if (!ref.current) return;
      tl.to(ref.current, {
        y: helixPos[i].y + 15,
        duration: 1.2 / s,
        ease: "sine.inOut",
        repeat: 1,
        yoyo: true,
      }, `helixSpin+=${i * 0.2 / s}`);
    });

    // ── PHASE 5: Helix -> Stack (Sequential drop & bounce) ──────────────────
    tl.addLabel("helixToStack");
    tl.to(sceneRef.current, {
      rotationY: 0,
      duration: 1.2 / s,
      ease: "power2.inOut",
    }, "helixToStack");

    cardRefs.forEach((ref, i) => {
      if (!ref.current) return;
      const target = stackPos[i];
      tl.to(ref.current, {
        x: 0,
        z: target.z,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        y: -120, // Hover above target
        duration: 0.7 / s,
        ease: "power2.out",
      }, `helixToStack+=${(total - i - 1) * 0.1 / s}`); // Bottom-to-top drop

      tl.to(ref.current, {
        y: 0,
        duration: 0.5 / s,
        ease: "bounce.out",
      }, `helixToStack+=${((total - i - 1) * 0.1 + 0.7) / s}`);
    });

    // ── PHASE 6: Stack Shuffle (Riffle Split & Staggered Merge) ─────────────
    tl.addLabel("deckShuffle");
    cardRefs.forEach((ref, i) => {
      if (!ref.current) return;
      const isEven = i % 2 === 0;
      const direction = isEven ? -1 : 1;
      tl.to(ref.current, {
        x: direction * (cardWidth * 0.75),
        y: -15,
        z: i * 4 + 15,
        rotationZ: direction * 10,
        rotationY: direction * 20,
        duration: 0.6 / s,
        ease: "power2.out",
      }, "deckShuffle");
    });

    tl.to({}, { duration: 0.3 / s });

    tl.addLabel("deckMerge");
    cardRefs.forEach((ref, i) => {
      if (!ref.current) return;
      const target = stackPos[i];
      tl.to(ref.current, {
        x: 0,
        y: 0,
        z: target.z,
        rotationZ: 0,
        rotationY: 0,
        duration: 0.6 / s,
        ease: "power3.inOut",
      }, `deckMerge+=${i * 0.08 / s}`); // Interlaced merge
    });

    tl.to({}, { duration: 0.5 / s });

    // ── PHASE 7: Stack -> Orbit (Spiral deal-out) ───────────────────────────
    tl.addLabel("stackToOrbit");
    cardRefs.forEach((ref, i) => {
      if (!ref.current) return;
      const target = orbitPos[i];
      tl.to(ref.current, {
        keyframes: [
          {
            x: target.x * 0.4,
            y: -100,
            z: target.z * 0.4 + 80,
            rotationY: target.rotationY + 180, // Flip out
            rotationX: 20,
            duration: 0.8 / s,
            ease: "power1.out",
          },
          {
            x: target.x,
            y: target.y,
            z: target.z,
            rotationY: target.rotationY,
            rotationX: target.rotationX,
            rotationZ: target.rotationZ,
            duration: 0.8 / s,
            ease: "back.out(1.2)",
          }
        ]
      }, `stackToOrbit+=${i * 0.15 / s}`);
    });
    
    tl.to({}, { duration: 1.0 / s });

    return () => {
      tl.kill();
    };
  }, [cards.length, cardRefs, cardWidth, orbitRadius, speed]);

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className}`}
    >
      <div
        className={styles.scene}
        ref={sceneRef}
        style={{ width: cardWidth, height: cardHeight }}
      >
        {cards.map((card, idx) => (
          <div
            key={card.id}
            ref={cardRefs[idx]}
            className={styles.card}
          >
            {/* Front Face */}
            <div
              className={styles.cardFront}
              style={{ backgroundImage: `url(${card.image})` }}
            >
              <div className={styles.cardOverlay}>
                <h3 className={styles.cardTitle}>{card.title}</h3>
                <p className={styles.cardSubtitle}>{card.subtitle}</p>
              </div>
            </div>
            {/* Back Face (Premium Brand Backface) */}
            <div className={styles.cardBack}>
              <div className={styles.cardBackPattern}>
                <div className={styles.cardBackLogo}>LegitUI</div>
                <div className={styles.cardBackGlow} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CinematicCardChoreography;