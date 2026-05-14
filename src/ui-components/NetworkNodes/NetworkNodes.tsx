"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import styles from "./NetworkNodes.module.css";

export interface NodeItem {
  id: string;
  icon: React.ReactNode;
  position: { x: number; y: number }; // Percentage from 0 to 100 relative to container
}

export interface NetworkNodesProps {
  /** Main central node icon/content */
  mainNodeIcon?: React.ReactNode;
  /** Surrounding nodes with their relative positions */
  nodes?: NodeItem[];
  /** Color of the glowing particle */
  particleColor?: string;
  /** Color of the connection lines */
  lineColor?: string;
  /** Speed of the particles (duration in seconds) */
  particleSpeed?: number;
  /** Custom CSS class */
  className?: string;
}

export default function NetworkNodes({
  mainNodeIcon,
  nodes = [],
  particleColor = "#ffffff",
  lineColor = "rgba(255, 255, 255, 0.2)",
  particleSpeed = 3,
  className = "",
}: NetworkNodesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const centerX = containerSize.width / 2;
  const centerY = containerSize.height / 2;

  // Pre-calculate delays for consistency
  const particleDelays = useMemo(() => {
    return nodes.map((_, i) => (i * particleSpeed) / nodes.length);
  }, [nodes, particleSpeed]);

  return (
    <div ref={containerRef} className={`${styles.container} ${className}`}>
      {containerSize.width > 0 && (
        <svg className={styles.svgLayer}>
          {nodes.map((node, i) => {
            const startX = (node.position.x / 100) * containerSize.width;
            const startY = (node.position.y / 100) * containerSize.height;

            const isLeft = startX < centerX;
            const convergeX = isLeft ? centerX - 60 : centerX + 60;

            // Calculate a dynamic curve to prevent straight horizontal lines
            let curveOffset = 0;
            if (Math.abs(startY - centerY) < 20) {
              curveOffset = isLeft ? -30 : 30;
            }

            // Smooth S-curve path leading to the converge point, then a straight line to the center
            const pathData = `M ${startX} ${startY} C ${(startX + convergeX) / 2} ${startY + curveOffset}, ${(startX + convergeX) / 2} ${centerY - curveOffset}, ${convergeX} ${centerY} L ${centerX} ${centerY}`;

            return (
              <g key={`path-${node.id}`}>
                <path
                  d={pathData}
                  className={styles.line}
                  style={{ stroke: lineColor }}
                />
                <motion.path
                  d={pathData}
                  className={styles.particle}
                  style={{ stroke: particleColor }}
                  pathLength="1"
                  strokeDasharray="0.03 1.5"
                  initial={{ strokeDashoffset: 1 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{
                    duration: particleSpeed,
                    repeat: Infinity,
                    ease: "linear",
                    delay: particleDelays[i],
                  }}
                />
              </g>
            );
          })}
        </svg>
      )}

      {/* Main Node */}
      <div className={styles.mainNodeWrapper}>
        {mainNodeIcon || (
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
          </svg>
        )}
      </div>

      {/* Sub Nodes */}
      {containerSize.width > 0 &&
        nodes.map((node) => {
          const x = (node.position.x / 100) * containerSize.width;
          const y = (node.position.y / 100) * containerSize.height;

          return (
            <div
              key={node.id}
              className={styles.subNodeWrapper}
              style={{ left: `${x}px`, top: `${y}px` }}
            >
              {node.icon}
            </div>
          );
        })}
    </div>
  );
}
