"use client";

import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame
} from "framer-motion";
import styles from "./InfiniteMarquee.module.css";

interface InfiniteMarqueeProps {
  text?: string;
  baseVelocity?: number;
  layers?: number;
  className?: string;
  fontSize?: string;
}

interface MarqueeLayerProps {
  text: string;
  baseVelocity: number;
  fontSize: string;
  opacity: number;
  zIndex: number;
  scale: number;
}

const MarqueeLayer: React.FC<MarqueeLayerProps> = ({
  text,
  baseVelocity = 100,
  fontSize,
  opacity,
  zIndex,
  scale,
}) => {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false
  });

  const directionFactor = useRef<number>(1);
  const x = useTransform(baseX, (v) => `${v}%`);

  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();

    baseX.set(baseX.get() + moveBy);

    // If moving right and crossed 0, jump back to -50%
    if (baseVelocity > 0) {
      if (baseX.get() > 0) {
        baseX.set(-50);
      }
    } else {
      // If moving left and crossed -50%, jump back to 0
      if (baseX.get() < -50) {
        baseX.set(0);
      }
    }
  });

  return (
    <div className={styles.layerContainer} style={{ zIndex, opacity, transform: `scale(${scale})` }}>
      <motion.div className={styles.scroller} style={{ x, fontSize }}>
        {Array.from({ length: 16 }).map((_, idx) => (
          <span key={idx}>{text}</span>
        ))}
      </motion.div>
    </div>
  );
};

const InfiniteMarquee: React.FC<InfiniteMarqueeProps> = ({
  text = "INFINITE PARALLAX MARQUEE — ",
  baseVelocity = -1,
  layers = 1,
  className = "",
  fontSize = "clamp(3rem, 10vw, 8rem)",
}) => {
  const marqueeLayers = Array.from({ length: layers }).map((_, i) => {
    const depth = i;
    const speed = baseVelocity * (1 - depth * 0.25);
    const opacity = 1 - depth * 0.35;
    const scale = 1 - depth * 0.15;
    const zIndex = layers - i;

    return (
      <MarqueeLayer
        key={i}
        text={text}
        baseVelocity={speed}
        fontSize={fontSize}
        opacity={opacity}
        scale={scale}
        zIndex={zIndex}
      />
    );
  });

  // Unique key to force recreation of component and re-eval of animations if props change deeply
  const animationKey = `${text}-${baseVelocity}-${layers}`;

  return (
    <div className={`${styles.container} ${className}`} key={animationKey}>
      {marqueeLayers}
    </div>
  );
};

export default InfiniteMarquee;
