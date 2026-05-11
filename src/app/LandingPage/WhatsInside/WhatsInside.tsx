"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Sparkles,
  Shield,
  Code2,
  Globe,
  Copy,
  Zap,
  Eye,
  Paintbrush,
  Terminal,
  Newspaper,
  Wrench,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import styles from "./WhatsInside.module.css";

/* ── animation variants ── */

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.96, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/* ── card data ── */

const featureCards = [
  {
    icon: Eye,
    title: "Full Source Access",
    description:
      "Every component ships with TSX, JSX, and CSS source code. View it, copy it, paste it — no installs, no black boxes.",
    cta: "View Source →",
  },
  {
    icon: Wrench,
    title: "33+ Interactive Components",
    description:
      "WebGL effects, animated gradients, magnetic buttons, skeleton loaders, and more — all production-ready and fully customizable.",
    cta: "Browse Components →",
  },
  {
    icon: Lightbulb,
    title: "Zero Dependencies",
    description:
      "Pure React components. No npm installs, no external libraries required. Just copy the code and ship it.",
    cta: "Get Started →",
  },
];

export default function WhatsInside() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section ref={ref} className={styles.section} id="whats-inside">
      {/* ── bg layer ── */}
      <div className={styles.bgEffects}>
        <div className={styles.gridOverlay} />
        <div className={styles.glowOrb1} />
        <div className={styles.glowOrb2} />
      </div>

      <div className={styles.container}>
        {/* ══════ HEADER ══════ */}
        <motion.div
          className={styles.header}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={stagger}
        >
          <motion.div className={styles.badge} variants={fadeUp}>
            <Sparkles size={14} className={styles.badgeIcon} />
            Built for Developers
          </motion.div>

          <motion.h2 className={styles.title} variants={fadeUp}>
            What&apos;s Inside{" "}
            <span className={styles.titleAccent}>LegitUI</span>
          </motion.h2>

          <motion.p className={styles.subtitle} variants={fadeUp}>
            A modern component library with powerful features that make building
            stunning, interactive interfaces effortless.
          </motion.p>
        </motion.div>

        {/* ══════ SPOTLIGHT CARD — Live Previews ══════ */}
        <motion.div
          className={styles.spotlightCard}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={scaleIn}
        >
          <div className={styles.spotlightGlow} />
          <div className={styles.spotlightShine} />
          <div className={styles.spotlightInner}>
            {/* left column */}
            <div className={styles.spotlightLeft}>
              <div className={styles.featureNumber}>01</div>
              <span className={styles.featureLabel}>CORE ADVANTAGE</span>
              <h3 className={styles.spotlightTitle}>
                Isolated Live Previews
              </h3>
              <p className={styles.spotlightDesc}>
                Every component runs in a sandboxed iframe environment, ensuring
                WebGL, styles, and scripts never interfere with your app.
                Crash-proof. Conflict-free.
              </p>
              <div className={styles.spotlightBadges}>
                <div className={styles.spotlightBadge}>
                  <Shield size={14} />
                  <span>Crash Protection</span>
                </div>
                <div className={styles.spotlightBadge}>
                  <Code2 size={14} />
                  <span>Style Isolation</span>
                </div>
                <div className={styles.spotlightBadge}>
                  <Globe size={14} />
                  <span>WebGL Safe</span>
                </div>
              </div>
            </div>

            {/* right column — mock preview */}
            <div className={styles.spotlightRight}>
              <div className={styles.previewTagline}>
                <Zap size={12} />
                Powered by iframe sandbox
              </div>
              <div className={styles.previewWindow}>
                {/* browser chrome */}
                <div className={styles.previewChrome}>
                  <div className={styles.previewDots}>
                    <span className={styles.dotRed} />
                    <span className={styles.dotYellow} />
                    <span className={styles.dotGreen} />
                  </div>
                  <div className={styles.previewUrl}>
                    <span>🔒</span> /preview/liquid-nebula
                  </div>
                </div>
                {/* preview body */}
                <div className={styles.previewBody}>
                  {/* nebula visual */}
                  <div className={styles.nebulaVisual}>
                    <div className={styles.nebulaCore} />
                    <div className={styles.nebulaRing1} />
                    <div className={styles.nebulaRing2} />
                    <div className={styles.nebulaRing3} />
                    {/* particles — deterministic to avoid hydration mismatch */}
                    {[
                      { l: 12, t: 8, d: 0.2, s: 1.4 },
                      { l: 85, t: 15, d: 1.1, s: 2.1 },
                      { l: 45, t: 22, d: 0.6, s: 1.8 },
                      { l: 72, t: 35, d: 2.3, s: 1.2 },
                      { l: 28, t: 42, d: 1.5, s: 2.5 },
                      { l: 91, t: 50, d: 0.4, s: 1.6 },
                      { l: 55, t: 58, d: 2.0, s: 1.3 },
                      { l: 18, t: 65, d: 0.9, s: 2.8 },
                      { l: 78, t: 72, d: 1.8, s: 1.1 },
                      { l: 35, t: 80, d: 0.3, s: 2.2 },
                      { l: 62, t: 88, d: 2.5, s: 1.5 },
                      { l: 8, t: 30, d: 1.2, s: 1.9 },
                      { l: 95, t: 45, d: 0.7, s: 2.4 },
                      { l: 42, t: 55, d: 2.1, s: 1.7 },
                      { l: 68, t: 12, d: 1.4, s: 2.0 },
                      { l: 22, t: 92, d: 0.1, s: 1.3 },
                      { l: 50, t: 38, d: 2.8, s: 2.6 },
                      { l: 82, t: 62, d: 0.5, s: 1.1 },
                      { l: 15, t: 48, d: 1.7, s: 2.3 },
                      { l: 58, t: 75, d: 0.8, s: 1.6 },
                    ].map((star, i) => (
                      <div
                        key={i}
                        className={styles.nebulaStar}
                        style={{
                          left: `${star.l}%`,
                          top: `${star.t}%`,
                          animationDelay: `${star.d}s`,
                          width: `${star.s}px`,
                          height: `${star.s}px`,
                        }}
                      />
                    ))}
                  </div>

                  {/* controls panel */}
                  <div className={styles.controlsPanel}>
                    <div className={styles.controlsTitle}>Controls</div>
                    {[
                      { label: "Speed", value: "1.25" },
                      { label: "Density", value: "2.40" },
                      { label: "Intensity", value: "1.80" },
                    ].map((ctrl) => (
                      <div key={ctrl.label} className={styles.controlRow}>
                        <span className={styles.controlLabel}>
                          {ctrl.label}
                        </span>
                        <div className={styles.controlSlider}>
                          <div className={styles.controlTrack}>
                            <div
                              className={styles.controlFill}
                              style={{
                                width: `${(parseFloat(ctrl.value) / 3) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <span className={styles.controlValue}>
                          {ctrl.value}
                        </span>
                      </div>
                    ))}
                    <div className={styles.controlRow}>
                      <span className={styles.controlLabel}>Color</span>
                      <div className={styles.colorSwatch} />
                      <span className={styles.controlValue}>#8B5CF6</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ══════ 3 FEATURE CARDS — Premium glow style ══════ */}
        <motion.div
          className={styles.cardRow}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={stagger}
        >
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                className={styles.glowCard}
                variants={scaleIn}
              >
                {/* Bottom glow layer */}
                <div className={styles.glowCardGlow} />
                {/* Border glow layer */}
                <div className={styles.glowCardBorder} />
                {/* Shiny white rotating gradient border layer */}
                <div className={styles.glowCardShine} />
                {/* Content */}
                <div className={styles.glowCardContent}>
                  <div className={styles.glowCardIcon}>
                    <Icon size={20} />
                  </div>
                  <h4 className={styles.glowCardTitle}>{card.title}</h4>
                  <p className={styles.glowCardDesc}>{card.description}</p>
                  <a className={styles.glowCardCta} href="#">
                    {card.cta}
                  </a>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
