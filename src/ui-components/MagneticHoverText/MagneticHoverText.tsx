import React, { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import styles from './MagneticHoverText.module.css';

export interface MagneticHoverTextProps {
  text?: string;
  className?: string;
  radius?: number;
  strength?: number;
  fontSize?: string;
}

export const MagneticHoverText: React.FC<MagneticHoverTextProps> = ({
  text = "MAGNETIC HOVER",
  className = "",
  radius = 120,
  strength = 50,
  fontSize = "clamp(3rem, 8vw, 6rem)"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  
  // Store cached positions and quickTo functions
  const itemsData = useRef<Array<{
    el: HTMLSpanElement;
    xTo: gsap.QuickToFunc;
    yTo: gsap.QuickToFunc;
    cx: number;
    cy: number;
  }>>([]);

  // Calculate centers of each letter to avoid layout thrashing on mousemove
  const calculateCenters = useCallback(() => {
    itemsData.current.forEach(item => {
      const rect = item.el.getBoundingClientRect();
      item.cx = rect.left + rect.width / 2;
      item.cy = rect.top + rect.height / 2;
    });
  }, []);

  useEffect(() => {
    // Reset letterRefs array
    letterRefs.current = letterRefs.current.slice(0, text.replace(/\s/g, "").length);
    
    // Initialize itemsData
    itemsData.current = letterRefs.current
      .filter((el): el is HTMLSpanElement => el !== null)
      .map(el => ({
        el,
        xTo: gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" }),
        yTo: gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" }),
        cx: 0,
        cy: 0
      }));

    // Calculate initial centers after a short delay to ensure layout is settled
    const timeout = setTimeout(calculateCenters, 100);

    window.addEventListener('resize', calculateCenters);
    window.addEventListener('scroll', calculateCenters);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', calculateCenters);
      window.removeEventListener('scroll', calculateCenters);
    };
  }, [calculateCenters, text]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    itemsData.current.forEach(item => {
      const dx = mouseX - item.cx;
      const dy = mouseY - item.cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius) {
        // Calculate force (1 at center, 0 at radius)
        const force = Math.pow((radius - dist) / radius, 1.5);
        
        // Push AWAY from mouse
        const pushX = -(dx / dist) * force * strength;
        const pushY = -(dy / dist) * force * strength;
        
        item.xTo(pushX);
        item.yTo(pushY);
      } else {
        // Return to original position
        item.xTo(0);
        item.yTo(0);
      }
    });
  };

  const handleMouseLeave = () => {
    itemsData.current.forEach(item => {
      item.xTo(0);
      item.yTo(0);
    });
  };

  const words = text.split(" ");
  let globalCharIndex = 0;

  return (
    <div 
      ref={containerRef}
      className={`${styles.container} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ fontSize }}
    >
      {words.map((word, wIdx) => (
        <span key={`word-${wIdx}`} className={styles.word}>
          {word.split("").map((char) => {
            const currentIndex = globalCharIndex++;
            return (
              <span 
                key={`char-${currentIndex}`}
                className={styles.char}
                ref={(el) => { letterRefs.current[currentIndex] = el; }}
              >
                {char}
              </span>
            );
          })}
          {wIdx < words.length - 1 && <span className={styles.space}>&nbsp;</span>}
        </span>
      ))}
    </div>
  );
};

export default MagneticHoverText;
