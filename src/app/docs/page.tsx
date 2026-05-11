"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Code2, Copy, Layers } from "lucide-react";
import styles from "./page.module.css";

export default function DocsIntroductionPage() {
  return (
    <div className={styles.pageWrapper}>
      <h1 className={styles.pageTitle}>Introduction</h1>

      <p className={styles.introText}>
        <strong className={styles.introStrong}>LegitUI</strong> is a
        free, open-source collection of beautifully crafted React components
        designed for creative developers. Every component is standalone — no
        heavy dependencies, no package lock-in.
      </p>

      {/* Key principles */}
      <div className={styles.principlesGrid}>
        {[
          {
            icon: <Copy size={20} />,
            title: "Copy & Paste",
            desc: "Just copy the code. No package manager needed.",
          },
          {
            icon: <Code2 size={20} />,
            title: "TypeScript First",
            desc: "Full TypeScript support with typed interfaces.",
          },
          {
            icon: <Layers size={20} />,
            title: "Zero Dependencies",
            desc: "Pure React. No extra libraries to install.",
          },
        ].map((item, i) => (
          <div key={i} className={styles.principleCard}>
            <div className={styles.principleIcon}>{item.icon}</div>
            <h3 className={styles.principleTitle}>{item.title}</h3>
            <p className={styles.principleDesc}>{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Philosophy */}
      <h2 className={styles.sectionTitle}>Philosophy</h2>
      <p className={styles.philosophyText}>
        We believe UI components should be{" "}
        <strong className={styles.philosophyStrong}>owned, not rented</strong>.
        Instead of wrapping components in a package you can&apos;t customize,
        LegitUI gives you the actual source code. Copy it, modify it, break it
        apart — it&apos;s yours.
      </p>
      <p className={styles.philosophyTextLast}>
        Each component is designed to be a starting point. We focus on
        beautiful defaults with sensible props, so you can drop them in
        and customize later.
      </p>

      {/* Quick Start */}
      <h2 className={styles.sectionTitle}>Quick Start</h2>
      <div className={styles.quickStartSteps}>
        {[
          { step: "1", title: "Browse the component library", href: "/components" },
          { step: "2", title: "Click on a component to see the preview and code" },
          { step: "3", title: 'Click "Copy Code" and paste into your project' },
          { step: "4", title: "Customize props, styles, and behavior" },
        ].map((item) => (
          <div key={item.step} className={styles.stepItem}>
            <span className={styles.stepNumber}>{item.step}</span>
            {item.href ? (
              <Link href={item.href} className={styles.stepLink}>
                {item.title}
              </Link>
            ) : (
              <span className={styles.stepText}>{item.title}</span>
            )}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className={styles.ctaBox}>
        <div>
          <div className={styles.ctaHeader}>
            <Sparkles size={18} className={styles.ctaIcon} />
            <h3 className={styles.ctaTitle}>Ready to explore?</h3>
          </div>
          <p className={styles.ctaDesc}>
            Jump into the component library and start building.
          </p>
        </div>
        <Link href="/components" className={styles.ctaButton}>
          Browse Components
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
