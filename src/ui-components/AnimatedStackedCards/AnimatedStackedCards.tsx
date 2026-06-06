"use client";
import React, { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { CloudLightning, BarChart3, ShieldCheck } from "lucide-react";
import styles from "./AnimatedStackedCards.module.css";

export interface StackedCard {
  id: string | number;
  title: string;
  subtitle: string;
  color: string;
  icon: React.ReactNode;
}

export interface AnimatedStackedCardsProps {
  cards?: StackedCard[];
  interval?: number;
  className?: string;
}

const defaultCards: StackedCard[] = [
  {
    id: 1,
    title: "Cloud Sync",
    subtitle: "Always backed up and in sync.",
    color: "#e8c4ff",
    icon: <CloudLightning size={28} color="#111" strokeWidth={2.5} />
  },
  {
    id: 2,
    title: "Real-time Stats",
    subtitle: "Monitor your data on the fly.",
    color: "#ffffff",
    icon: <BarChart3 size={28} color="#111" strokeWidth={2.5} />
  },
  {
    id: 3,
    title: "Secure Vault",
    subtitle: "Enterprise-grade security.",
    color: "#ffe699",
    icon: <ShieldCheck size={28} color="#111" strokeWidth={2.5} />
  }
];

export const AnimatedStackedCards: React.FC<AnimatedStackedCardsProps> = ({
  cards = defaultCards,
  interval = 3000,
  className = ""
}) => {
  const cardDistance = 16;
  const verticalDistance = 16;

  const config = {
    ease: "power2.inOut",
    durDrop: 0.8,
    durMove: 0.8,
    durReturn: 0.8,
    promoteOverlap: 0.45,
    returnDelay: 0.2
  };

  const refs = useMemo(
    () => cards.map(() => React.createRef<HTMLDivElement>()),
    [cards.length]
  );

  const order = useRef(Array.from({ length: cards.length }, (_, i) => i));
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const intervalRef = useRef<number | null>(null);

  const makeSlot = (i: number, total: number) => ({
    x: i * cardDistance,
    y: i * verticalDistance,
    scale: 1 - i * 0.05,
    zIndex: total - i
  });

  const placeNow = (el: HTMLDivElement | null, slot: any) => {
    if (!el) return;
    gsap.set(el, {
      x: slot.x,
      y: slot.y,
      scale: slot.scale,
      zIndex: slot.zIndex,
      force3D: true
    });
  };

  useEffect(() => {
    const total = refs.length;
    refs.forEach((r, i) => placeNow(r.current, makeSlot(i, total)));

    const swap = () => {
      if (order.current.length < 2) return;

      const [front, ...rest] = order.current;
      const elFront = refs[front].current;
      if (!elFront) return;

      const tl = gsap.timeline();
      tlRef.current = tl;

      // Drop
      tl.to(elFront, {
        y: "+=200", // drops down smoothly
        duration: config.durDrop,
        ease: config.ease
      });

      tl.addLabel("promote", `-=${config.durDrop * config.promoteOverlap}`);
      
      rest.forEach((idx, i) => {
        const el = refs[idx].current;
        if (!el) return;
        const slot = makeSlot(i, refs.length);
        tl.set(el, { zIndex: slot.zIndex }, "promote");
        tl.to(
          el,
          {
            x: slot.x,
            y: slot.y,
            scale: slot.scale,
            duration: config.durMove,
            ease: config.ease
          },
          `promote+=${i * 0.15}`
        );
      });

      const backSlot = makeSlot(refs.length - 1, refs.length);
      tl.addLabel("return", `promote+=${config.durMove * config.returnDelay}`);
      tl.call(
        () => {
          gsap.set(elFront, { zIndex: backSlot.zIndex });
        },
        undefined,
        "return"
      );
      tl.to(
        elFront,
        {
          x: backSlot.x,
          y: backSlot.y,
          scale: backSlot.scale,
          duration: config.durReturn,
          ease: config.ease
        },
        "return"
      );

      tl.call(() => {
        order.current = [...rest, front];
      });
    };

    intervalRef.current = window.setInterval(swap, interval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      tlRef.current?.kill();
    };
  }, [cards.length, interval]);

  return (
    <div className={`${styles.container} ${className}`}>
      {cards.map((card, idx) => (
        <div
          key={card.id}
          ref={refs[idx]}
          className={styles.cardWrapper}
        >
          <div
            className={styles.card}
            style={{ backgroundColor: card.color }}
          >
            <div className={styles.header}>
              <div className={styles.iconContainer}>{card.icon}</div>
              <h3 className={styles.title}>{card.title}</h3>
            </div>
            <p className={styles.subtitle}>{card.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnimatedStackedCards;
