"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import styles from "./TimelineSteps.module.css";

export interface TimelineStep {
  id: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  align?: "left" | "right";
}

export interface TimelineStepsProps {
  steps: TimelineStep[];
  className?: string;
}

function StepNode({ 
  step, 
  index, 
  totalSteps,
  scrollYProgress 
}: { 
  step: TimelineStep;
  index: number;
  totalSteps: number;
  scrollYProgress: MotionValue<number>;
}) {
  const isLeft = step.align ? step.align === "left" : index % 2 === 0;
  
  const target = (index + 0.5) / totalSteps;
  const start = target - 0.15;
  const end = target;

  const opacity = useTransform(scrollYProgress, [start, end], [0.3, 1]);
  const filter = useTransform(scrollYProgress, [start, end], ["brightness(0.5)", "brightness(1)"]);
  const boxShadow = useTransform(scrollYProgress, [start, end], ["0 0 0px rgba(255,255,255,0)", "0 0 40px rgba(255,255,255,0.08)"]);
  const lineOpacity = useTransform(scrollYProgress, [start, end], [0.1, 0.8]);

  return (
    <div className={`${styles.stepRow} ${isLeft ? styles.rowLeft : styles.rowRight}`}>
      <motion.div className={styles.connectorLine} style={{ opacity: lineOpacity }} />
      
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

export default function TimelineSteps({
  steps,
  className = ""
}: TimelineStepsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const dotTop = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const trailHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.timelineWrapper} ref={containerRef}>
        <div className={styles.timelineLine}>
          <motion.div 
            className={styles.timelineDot}
            style={{ top: dotTop }}
          />
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
              totalSteps={steps.length}
              scrollYProgress={scrollYProgress} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
