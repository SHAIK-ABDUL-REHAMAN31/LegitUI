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
  const spreadX = cardWidth * 0.7;
  const centerIndex = (total - 1) / 2;
  return Array.from({ length: total }, (_, i) => {
    const t = (i - centerIndex) / Math.max(centerIndex, 1);
    return {
      x: (i - centerIndex) * spreadX,
      y: t * t * 40,
      z: i * 5,
      rotationY: 0,
      rotationX: 0,
      rotationZ: (i - centerIndex) * 8,
    };
  });
}

function getMatrixPositions(total: number, cardWidth: number) {
  const cols = 3;
  const colGap = cardWidth * 1.1;
  const rowGap = cardWidth * 1.25;
  return Array.from({ length: total }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      x: (col - (cols - 1) / 2) * colGap,
      y: (row - 0.5) * rowGap - 30,
      z: i * 5,
      rotationY: 0,
      rotationX: 52,
      rotationZ: -40,
    };
  });
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

    // ── Initial state ───────────────────────────────────────────────────────
    gsap.set(sceneRef.current, { rotationY: 0 });
    cardRefs.forEach((ref, i) => {
      if (!ref.current) return;
      gsap.set(ref.current, { ...orbitPos[i], scale: 1 });
    });

    const tl = gsap.timeline({ repeat: -1 });
    tlRef.current = tl;

    // Helper: gather all cards into a flat centered stack
    const gatherToCenter = (label: string) => {
      tl.addLabel(label);
      cardRefs.forEach((ref, i) => {
        if (!ref.current) return;
        tl.to(ref.current, {
          x: 0, y: 0, z: i * 3,
          rotationX: 0, rotationY: 0, rotationZ: 0,
          duration: 1.2 / s,
          ease: "power2.inOut",
        }, label);
      });
    };

    // Helper: spread cards from center stack to a target layout
    const spreadTo = (label: string, positions: ReturnType<typeof getFanPositions>) => {
      tl.addLabel(label);
      cardRefs.forEach((ref, i) => {
        if (!ref.current) return;
        tl.to(ref.current, {
          ...positions[i],
          duration: 1.4 / s,
          ease: "power3.out",
        }, `${label}+=${i * 0.08 / s}`);
      });
    };

    // ── PHASE 1: orbit spin ─────────────────────────────────────────────────
    tl.to(sceneRef.current, {
      rotationY: 360,
      duration: 3.5 / s,
      ease: "power3.inOut",
    });
    tl.set(sceneRef.current, { rotationY: 0 });

    // ── GATHER → FAN ────────────────────────────────────────────────────────
    gatherToCenter("gatherForFan");
    tl.to({}, { duration: 0.3 / s });
    spreadTo("spreadFan", fanPos);
    tl.to({}, { duration: 2.0 / s });

    // ── GATHER → MATRIX ─────────────────────────────────────────────────────
    gatherToCenter("gatherForMatrix");
    tl.to({}, { duration: 0.3 / s });
    spreadTo("spreadMatrix", matrixPos);
    tl.to({}, { duration: 2.0 / s });

    // ── GATHER → ORBIT ──────────────────────────────────────────────────────
    gatherToCenter("gatherForOrbit");
    tl.to({}, { duration: 0.3 / s });
    spreadTo("spreadOrbit", orbitPos);
    tl.to({}, { duration: 0.8 / s });

    return () => { tl.kill(); };
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
            style={{ backgroundImage: `url(${card.image})` }}
          >
            <div className={styles.cardOverlay}>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardSubtitle}>{card.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CinematicCardChoreography;