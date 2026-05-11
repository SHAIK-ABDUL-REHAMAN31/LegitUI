"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion";
import styles from "./MagneticDock.module.css";

interface DockItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  mouseX: any;
  isActive?: boolean;
}

function DockItem({ icon, label, onClick, mouseX, isActive }: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Distance from center of item to mouseX
  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Base scaling based on proximity
  const widthSync = useTransform(distance, [-120, 0, 120], [44, 68, 44]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 200, damping: 16 });
  const iconSize = useSpring(widthSync, { mass: 0.1, stiffness: 200, damping: 16 });

  // Move upward based on distance
  const ySync = useTransform(distance, [-120, 0, 120], [0, -8, 0]);
  const ySpring = useSpring(ySync, { mass: 0.1, stiffness: 200, damping: 16 });

  // Tooltip moves up with the icon
  const tooltipYSync = useTransform(distance, [-120, 0, 120], [0, -20, 0]);
  const tooltipYSpring = useSpring(tooltipYSync, { mass: 0.1, stiffness: 200, damping: 16 });

  // Magnetic effect state
  const magX = useMotionValue(0);
  const magY = useMotionValue(0);
  const springMagX = useSpring(magX, { mass: 0.1, stiffness: 200, damping: 20 });
  const springMagY = useSpring(magY, { mass: 0.1, stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Magnetic pull towards the cursor
    const pullX = (e.clientX - centerX) * 0.1;
    const pullY = (e.clientY - centerY) * 0.1;
    magX.set(pullX);
    magY.set(pullY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    magX.set(0);
    magY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ width }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`${styles.dockItem} ${isActive ? styles.active : ""}`}
    >
      <motion.div
        className={styles.dockIconContainer}
        style={{ 
          width: iconSize, 
          height: iconSize, 
          y: ySpring,
          x: springMagX
        }}
      >
        <div className={styles.dockIconGlow}></div>
        <motion.div className={styles.icon} style={{ x: springMagX, y: springMagY }}>
          {icon}
        </motion.div>
      </motion.div>
      {isActive && <div className={styles.dockActiveIndicator}></div>}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            style={{ y: tooltipYSpring }}
            className={styles.dockTooltipWrapper}
          >
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={styles.dockTooltip}
            >
              {label}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export interface MagneticDockProps {
  items: {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
  }[];
  activeItem?: string;
  className?: string;
}

export default function MagneticDock({ items, activeItem, className = "" }: MagneticDockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <div className={`${styles.dockWrapper} ${className}`}>
      <motion.div
        className={styles.dockContainer}
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
      >
        {items.map((item, idx) => (
          <DockItem
            key={idx}
            icon={item.icon}
            label={item.label}
            onClick={item.onClick}
            mouseX={mouseX}
            isActive={activeItem === item.label}
          />
        ))}
      </motion.div>
    </div>
  );
}
