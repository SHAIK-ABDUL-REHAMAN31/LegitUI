"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Sparkles, Check, Copy } from "lucide-react";
import styles from "./WhatsInside.module.css";

/* ── animation variants ── */
const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/* ── Visual Components ── */

// 1. Live Previews Visual (Carousel style)
const PreviewCarouselVisual = () => (
  <div className={styles.previewCarousel}>
    <motion.div
      className={styles.previewCarouselTrack}
      animate={{ x: ["0%", "-50%"] }}
      transition={{ duration: 15, ease: "linear", repeat: Infinity }}
    >
      {[1, 2, 3, 1, 2, 3].map((item, i) => (
        <div key={i} className={styles.previewCarouselItem}>
          <div className={styles.mockImg} />
          <div className={styles.mockTextRow}>
            <div className={styles.mockLineShort} />
            <div className={styles.mockLineLong} />
          </div>
        </div>
      ))}
    </motion.div>
  </div>
);

// 2. Editor Visual (Monochrome code exact match with Typewriter)
// 2. Editor Visual (Monochrome code exact match with Typewriter)
const snippets = [
  { prompt: "animate hero text", code: 'import Hero from "./Hero"\n<Hero animation="fadeUp" />' },
  { prompt: "add glow card", code: 'import Card from "./Card"\n<Card variant="glass" />' },
  { prompt: "insert marquee", code: 'import Mrq from "./Mrq"\n<Mrq speed="fast" />' }
];

const EditorVisual = () => {
  const [text, setText] = useState("");
  const [snippetIdx, setSnippetIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const currentSnippet = snippets[snippetIdx].code;

    if (isDeleting) {
      if (text === "") {
        setIsDeleting(false);
        setSnippetIdx((prev) => (prev + 1) % snippets.length);
        timer = setTimeout(() => { }, 400);
      } else {
        timer = setTimeout(() => {
          setText((prev) => prev.slice(0, -1));
        }, 15);
      }
    } else {
      if (text === currentSnippet) {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
      } else {
        timer = setTimeout(() => {
          setText((prev) => currentSnippet.slice(0, prev.length + 1));
        }, 40);
      }
    }
    return () => clearTimeout(timer);
  }, [text, isDeleting, snippetIdx]);

  const lines = text.split('\n');
  const displayLines = [lines[0] || "", lines.length > 1 ? lines[1] : ""];

  return (
    <div className={styles.editorVisual}>
      <div className={styles.previewVisualChrome}>
        <div className={styles.previewVisualDots}>
          <span className={styles.dotRed} />
          <span className={styles.dotYellow} />
          <span className={styles.dotGreen} />
        </div>
        <div className={styles.previewUrl}>Editor</div>
      </div>
      <div className={styles.editorBody}>
        <div className={styles.codePrompt}>
          <span className={styles.promptIcon}>$</span> {snippets[snippetIdx].prompt}
        </div>
        <div className={styles.codeLinesWrapper}>
          {displayLines.map((line, i) => (
            <div className={styles.editorLine} key={i}>
              <span className={styles.lineNumber}>{i + 1}</span>
              <span className={styles.codeContent} style={{ whiteSpace: "pre" }}>{line}</span>
              {i === lines.length - 1 && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  style={{ color: "#fff", marginLeft: "2px" }}
                >
                  |
                </motion.span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 3. Marquee Visual
const ComponentsMarquee = () => {
  const components1 = ["Button", "Card", "Modal", "Hero", "Navbar"];
  const components2 = ["Avatar", "Tooltip", "Footer", "Slider", "Badge"];

  return (
    <div className={styles.marqueeVisual}>
      <div className={styles.marqueeTrackWrapper}>
        <motion.div
          className={styles.marqueeTrack}
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 10, ease: "linear", repeat: Infinity }}
        >
          {[...components1, ...components1].map((comp, i) => (
            <div key={i} className={styles.marqueePill}>{comp}</div>
          ))}
        </motion.div>
      </div>
      <div className={styles.marqueeTrackWrapper}>
        <motion.div
          className={styles.marqueeTrack}
          animate={{ x: ["-50%", "0%"] }}
          transition={{ duration: 12, ease: "linear", repeat: Infinity }}
        >
          {[...components2, ...components2].map((comp, i) => (
            <div key={i} className={styles.marqueePillAlt}>{comp}</div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

// 4. Zero Dependencies Visual
const ZeroDepVisual = () => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.zeroDepVisual}>
      <div className={styles.snippetCard}>
        <div className={styles.snippetHeader}>
          <span className={styles.snippetName}>Hero.tsx</span>
          <div className={styles.copyBtn}>
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                >
                  <Check size={12} color="#10b981" />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                >
                  <Copy size={12} color="#a1a1aa" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className={styles.snippetBody}>
          <div className={styles.snippetLine} style={{ width: "80%" }} />
          <div className={styles.snippetLine} style={{ width: "60%" }} />
          <div className={styles.snippetLine} style={{ width: "90%" }} />
          <div className={styles.snippetLine} style={{ width: "40%" }} />
        </div>
      </div>
    </div>
  );
};

/* ── Main Component ── */

const cardsData = [
  {
    id: "live-preview",
    label: "01 CORE ADVANTAGE",
    title: "Isolated Live Previews",
    description:
      "Every component runs in a sandboxed iframe environment, ensuring animations, backgrounds, styles, and scripts never interfere with your app. Crash-proof. Conflict-free.",
    visual: <PreviewCarouselVisual />,
  },
  {
    id: "source-access",
    label: "02 OPEN SOURCE",
    title: "Full Source Access",
    description:
      "Every component ships with TSX, JSX, and CSS source code. View it, copy it, paste it — no installs, no black boxes.",
    visual: <EditorVisual />,
  },
  {
    id: "components",
    label: "03 GROWING LIBRARY",
    title: "33+ Interactive Components",
    description:
      "WebGL effects, animated gradients, magnetic buttons, skeleton loaders, and more — all production-ready and fully customizable.",
    visual: <ComponentsMarquee />,
  },
  {
    id: "modern-stack",
    label: "04 MODERN STACK",
    title: "Seamless Integration",
    description:
      "Built with standard modern libraries like Framer Motion and Lucide React. Designed to drop into your Next.js or Vite projects effortlessly.",
    visual: <ZeroDepVisual />,
  },
];

export default function WhatsInside() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className={styles.section} id="whats-inside">
      <div className={styles.container}>
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

        <motion.div
          className={styles.cardRow}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={stagger}
        >
          {cardsData.map((card) => (
            <motion.div key={card.id} className={styles.card} variants={fadeUp}>
              <div className={styles.cardVisualArea}>{card.visual}</div>
              <div className={styles.cardContent}>
                <div className={styles.cardLabel}>{card.label}</div>
                <h3 className={styles.cardTitle}>{card.title}</h3>
                <p className={styles.cardDesc}>{card.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
