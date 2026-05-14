"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { Search, Copy, Terminal, Zap } from "lucide-react";
import styles from "./GetStarted.module.css";

const steps = [
  {
    id: "01",
    title: "Browse Components",
    desc: "Explore the library and find the exact component you need.",
    icon: <Search size={20} />,
    align: "left"
  },
  {
    id: "02",
    title: "Copy the Code",
    desc: "Copy the raw source code directly into your project.",
    icon: <Copy size={20} />,
    align: "right"
  },
  {
    id: "03",
    title: "Use CLI Commands",
    desc: "Or use our CLI to automatically install dependencies.",
    icon: <Terminal size={20} />,
    align: "left"
  },
  {
    id: "04",
    title: "Build & Ship Faster",
    desc: "Focus on your product while we handle the UI complexity.",
    icon: <Zap size={20} />,
    align: "right"
  }
];

function StepNode({ 
  step, 
  index, 
  scrollYProgress 
}: { 
  step: typeof steps[0], 
  index: number, 
  scrollYProgress: MotionValue<number> 
}) {
  const isLeft = step.align === "left";
  
  // Calculate when the scroll dot is near this card.
  // We have 4 cards, so their vertical centers are roughly at 12.5%, 37.5%, 62.5%, 87.5%
  const target = (index + 0.5) / steps.length;
  // Start animating slightly before the dot reaches it, and finish exactly when it hits
  const start = target - 0.15;
  const end = target;

  const opacity = useTransform(scrollYProgress, [start, end], [0.3, 1]);
  const filter = useTransform(scrollYProgress, [start, end], ["brightness(0.5)", "brightness(1)"]);
  const boxShadow = useTransform(scrollYProgress, [start, end], ["0 0 0px rgba(255,255,255,0)", "0 0 40px rgba(255,255,255,0.08)"]);
  
  // The dotted connector line opacity smoothly fades in as the dot approaches
  const lineOpacity = useTransform(scrollYProgress, [start, end], [0.1, 0.8]);

  return (
    <div className={`${styles.stepRow} ${isLeft ? styles.rowLeft : styles.rowRight}`}>
      {/* Dotted Connection Line */}
      <motion.div className={styles.connectorLine} style={{ opacity: lineOpacity }} />
      
      {/* The Card */}
      <motion.div 
        className={styles.stepCard}
        style={{ opacity, filter, boxShadow }}
      >
        <div className={styles.stepIconWrapper}>
          {step.icon}
        </div>
        <div className={styles.stepContent}>
          <div className={styles.stepTitle}>
            <span className={styles.stepNumber}>{step.id}.</span> {step.title}
          </div>
          <div className={styles.stepDesc}>{step.desc}</div>
        </div>
      </motion.div>
    </div>
  );
}

export default function GetStarted() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const dotTop = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const trailHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className={styles.section}>
      <div className={styles.bgEffects}>
        <div className={styles.gridOverlay} />
        <div className={styles.glowOrb} />
      </div>

      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className={styles.badge}>
            <Terminal size={12} className={styles.badgeIcon} />
            <span>Developer Experience</span>
          </div>
          <h2 className={styles.title}>
            Get started in <span className={styles.titleAccent}>seconds</span>
          </h2>
          <p className={styles.subtitle}>
            Stop wrestling with complex configurations. LegitUI is designed to be copied, pasted, and customized instantly.
          </p>
        </motion.div>

        <div className={styles.timelineWrapper} ref={containerRef}>
          {/* Vertical Line */}
          <div className={styles.timelineLine}>
            <motion.div 
              className={styles.timelineDot}
              style={{ top: dotTop }}
            />
            {/* Active glowing line trail */}
            <motion.div 
              className={styles.timelineTrail}
              style={{ height: trailHeight }}
            />
          </div>

          <div className={styles.timelineSteps}>
            {steps.map((step, index) => (
              <StepNode 
                key={step.id} 
                step={step} 
                index={index} 
                scrollYProgress={scrollYProgress} 
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
