"use client"

import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import styles from './TearableCloth.module.css';

// --- PHYSICS ENGINE ---

class Point {
  x: number;
  y: number;
  px: number;
  py: number;
  pinned: boolean;
  row: number;
  col: number;

  constructor(x: number, y: number, pinned: boolean, row: number, col: number) {
    this.x = x;
    this.y = y;
    this.px = x;
    this.py = y;
    this.pinned = pinned;
    this.row = row;
    this.col = col;
  }

  update(gravity: number, friction: number) {
    if (this.pinned) return;
    const vx = (this.x - this.px) * friction;
    const vy = (this.y - this.py) * friction;
    this.px = this.x;
    this.py = this.y;
    this.x += vx;
    this.y += vy + gravity;
  }
}

class Constraint {
  p1: Point;
  p2: Point;
  length: number;
  broken: boolean = false;

  constructor(p1: Point, p2: Point, length?: number) {
    this.p1 = p1;
    this.p2 = p2;
    this.length = length || Math.hypot(p2.x - p1.x, p2.y - p1.y);
  }

  resolve(tearSensitivity: number) {
    if (this.broken) return;
    const dx = this.p2.x - this.p1.x;
    const dy = this.p2.y - this.p1.y;
    const dist = Math.hypot(dx, dy);

    if (dist > this.length * tearSensitivity) {
      this.broken = true;
      return;
    }

    const diff = (this.length - dist) / dist * 0.5;
    const offsetX = dx * diff;
    const offsetY = dy * diff;

    if (!this.p1.pinned) {
      this.p1.x -= offsetX;
      this.p1.y -= offsetY;
    }
    if (!this.p2.pinned) {
      this.p2.x += offsetX;
      this.p2.y += offsetY;
    }
  }
}

interface DebrisParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
}

export interface TearableClothProps {
  children: React.ReactNode;
  gridSpacing?: number;
  gravity?: number;
  influenceRadius?: number;
  tearSensitivity?: number;
  damping?: number;
  solverIterations?: number;
  clothHeightPercent?: number;
}

export const TearableCloth: React.FC<TearableClothProps> = ({
  children,
  gridSpacing = 14,
  gravity = 0.22,
  influenceRadius = 40,
  tearSensitivity = 1.7,
  damping = 0.98,
  solverIterations = 5,
  clothHeightPercent = 90,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isTearingDone, setIsTearingDone] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const pointsRef = useRef<Point[]>([]);
  const constraintsRef = useRef<Constraint[]>([]);
  const debrisRef = useRef<DebrisParticle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, px: 0, py: 0, down: false });
  const windOffsetRef = useRef(0);
  const statsRef = useRef({ brokenCount: 0, totalCount: 0 });
  const rowsRef = useRef(0);
  const colsRef = useRef(0);

  const initPhysics = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;
    const cols = Math.ceil(width / gridSpacing) + 1;
    const rows = Math.ceil((height * (clothHeightPercent / 100)) / gridSpacing) + 1;

    rowsRef.current = rows;
    colsRef.current = cols;

    const points: Point[] = [];
    const constraints: Constraint[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * gridSpacing;
        const y = r * gridSpacing;
        const pinned = r === 0;
        points.push(new Point(x, y, pinned, r, c));
      }
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        if (c < cols - 1) constraints.push(new Constraint(points[i], points[i + 1]));
        if (r < rows - 1) constraints.push(new Constraint(points[i], points[i + cols]));
      }
    }

    pointsRef.current = points;
    constraintsRef.current = constraints;
    debrisRef.current = [];
    statsRef.current = { brokenCount: 0, totalCount: constraints.length };
    setIsTearingDone(false);
  };

  // Handle reset
  const handleReset = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    initPhysics();
  };

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      initPhysics();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [gridSpacing]);

  const distanceToSegment = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const l2 = dx * dx + dy * dy;
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * dx + (py - y1) * dy) / l2;
    t = Math.max(0, Math.min(1, t));
    const projX = x1 + t * dx;
    const projY = y1 + t * dy;
    return Math.hypot(px - projX, py - projY);
  };

  // Main animation loop
  useEffect(() => {
    let animId: number;

    const updateAndRender = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Gentle sway
      windOffsetRef.current += 0.015;
      const windForce = Math.sin(windOffsetRef.current) * 0.01;

      const points = pointsRef.current;
      for (const p of points) {
        p.update(gravity, damping);
        if (!p.pinned) {
          p.x += windForce * (1.0 + Math.sin(p.row * 0.15 + windOffsetRef.current));
        }
      }

      // Interaction: hold and tear
      const mouse = mouseRef.current;
      const constraints = constraintsRef.current;

      if (mouse.down) {
        let newlyBroken = false;
        for (const c of constraints) {
          if (c.broken) continue;
          const dist = distanceToSegment(mouse.x, mouse.y, c.p1.x, c.p1.y, c.p2.x, c.p2.y);
          if (dist < influenceRadius * 0.55) {
            c.broken = true;
            newlyBroken = true;

            const midX = (c.p1.x + c.p2.x) / 2;
            const midY = (c.p1.y + c.p2.y) / 2;
            for (let k = 0; k < 3; k++) {
              debrisRef.current.push({
                x: midX,
                y: midY,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 2.5 - 1,
                size: Math.random() * 2 + 0.6,
                alpha: 1.0,
                life: 1.0,
              });
            }
          }
        }
        if (newlyBroken) {
          const broken = constraints.filter(c => c.broken).length;
          statsRef.current = { brokenCount: broken, totalCount: constraints.length };
        }
      }

      // Resolve constraints
      for (let step = 0; step < solverIterations; step++) {
        for (const c of constraints) {
          if (c.broken) continue;
          c.resolve(tearSensitivity);
          if (c.broken) {
            const midX = (c.p1.x + c.p2.x) / 2;
            const midY = (c.p1.y + c.p2.y) / 2;
            for (let k = 0; k < 2; k++) {
              debrisRef.current.push({
                x: midX, y: midY,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 1.5 + 0.5,
                alpha: 1.0, life: 1.0,
              });
            }
          }
        }
      }

      // Auto-reveal
      const ratio = statsRef.current.brokenCount / (statsRef.current.totalCount || 1);
      if (ratio > 0.78 && !isTearingDone) {
        setIsTearingDone(true);
      }

      // --- RENDERING ---
      ctx.clearRect(0, 0, width, height);

      const cols = colsRef.current;
      const rows = rowsRef.current;
      const maxDist = gridSpacing * 1.85;

      // Pure white cloth — solid quads (no seam gaps)
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;

      for (let r = 0; r < rows - 1; r++) {
        for (let c = 0; c < cols - 1; c++) {
          const i0 = r * cols + c;
          const i1 = r * cols + c + 1;
          const i2 = (r + 1) * cols + c + 1;
          const i3 = (r + 1) * cols + c;

          const p0 = points[i0];
          const p1 = points[i1];
          const p2 = points[i2];
          const p3 = points[i3];

          if (!p0 || !p1 || !p2 || !p3) continue;

          const conn0_1 = Math.hypot(p1.x - p0.x, p1.y - p0.y) < maxDist;
          const conn1_2 = Math.hypot(p2.x - p1.x, p2.y - p1.y) < maxDist;
          const conn2_3 = Math.hypot(p3.x - p2.x, p3.y - p2.y) < maxDist;
          const conn3_0 = Math.hypot(p0.x - p3.x, p0.y - p3.y) < maxDist;

          // Draw full quad if all edges connected
          if (conn0_1 && conn1_2 && conn2_3 && conn3_0) {
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineTo(p3.x, p3.y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          } else {
            // Partial — draw whichever triangles are still connected
            if (conn0_1 && conn3_0) {
              ctx.beginPath();
              ctx.moveTo(p0.x, p0.y);
              ctx.lineTo(p1.x, p1.y);
              ctx.lineTo(p3.x, p3.y);
              ctx.closePath();
              ctx.fill();
              ctx.stroke();
            }
            if (conn1_2 && conn2_3) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.lineTo(p3.x, p3.y);
              ctx.closePath();
              ctx.fill();
              ctx.stroke();
            }
          }
        }
      }

      // Cursor guide when holding
      if (mouse.down) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, influenceRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Debris particles — white/light scraps
      const debris = debrisRef.current;
      for (let j = debris.length - 1; j >= 0; j--) {
        const p = debris[j];
        p.x += p.vx;
        p.y += p.vy + 0.1;
        p.life -= 0.02;
        p.alpha = Math.max(0, p.life);

        if (p.life <= 0) {
          debris.splice(j, 1);
          continue;
        }

        ctx.fillStyle = `rgba(210, 210, 215, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(updateAndRender);
    };

    animId = requestAnimationFrame(updateAndRender);
    return () => cancelAnimationFrame(animId);
  }, [gravity, damping, tearSensitivity, solverIterations, gridSpacing, influenceRadius, isTearingDone]);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left, y: e.clientY - rect.top,
      px: e.clientX - rect.left, py: e.clientY - rect.top,
      down: true,
    };
    setIsMouseDown(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const mouse = mouseRef.current;
    mouse.px = mouse.x;
    mouse.py = mouse.y;
    mouse.x = x;
    mouse.y = y;
  };

  const handleMouseUpOrLeave = () => {
    mouseRef.current.down = false;
    setIsMouseDown(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    mouseRef.current = {
      x: touch.clientX - rect.left, y: touch.clientY - rect.top,
      px: touch.clientX - rect.left, py: touch.clientY - rect.top,
      down: true,
    };
    setIsMouseDown(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const mouse = mouseRef.current;
    mouse.px = mouse.x;
    mouse.py = mouse.y;
    mouse.x = x;
    mouse.y = y;
  };

  const handleTouchEnd = () => {
    mouseRef.current.down = false;
    setIsMouseDown(false);
  };

  const tearPercentage = Math.min(100, Math.floor((statsRef.current.brokenCount / (statsRef.current.totalCount || 1)) * 100));
  const isFullyTorn = tearPercentage >= 95;

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.backgroundLayer}>
        {children}
      </div>

      <canvas
        className={`${styles.canvasLayer} ${isMouseDown ? styles.canvasGrabbing : ''}`}
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ pointerEvents: isFullyTorn ? 'none' : 'auto' }}
      />

      {/* Reload button — top-right corner */}
      <button
        className={styles.reloadBtn}
        onClick={handleReset}
        title="Reset cloth"
      >
        <RotateCcw size={16} />
      </button>

      {!isTearingDone && (
        <div className={styles.hint}>
          Hold & <strong>drag</strong> to tear the cloth
        </div>
      )}
    </div>
  );
};
