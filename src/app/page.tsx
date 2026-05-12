"use client";

import Link from "next/link";
import Image from "next/image";
import { useComponentStore } from "@/lib/component-store";
import {
  ArrowRight,
  Box,
} from "lucide-react";
import styles from "./page.module.css";
import LiquidChromium from "./LandingPage/HeroSection/LuquidChromuim";
import Hero from "./LandingPage/HeroSection/Hero";
import WhatsInside from "./LandingPage/WhatsInside/WhatsInside";

export default function HomePage() {
  const { components } = useComponentStore();

  const showcaseComponents = components.slice(0, 6);

  return (
    <div className={styles.pageWrapper}>
      {/* ====== HERO SECTION ====== */}
      <section style={{ position: "relative", minHeight: "100vh" }}>
        <LiquidChromium />
        <Hero />
      </section>

      {/* ====== WHAT'S INSIDE ====== */}
      <WhatsInside />

      {/* ====== SEE THEM IN ACTION (Showcase Grid) ====== */}
      <section className={styles.showcaseSection}>
        <h2 className={styles.sectionTitle}>See them in action</h2>
        <p className={styles.showcaseSubtitle}>
          A taste of what you can build.{" "}
          <span className={styles.accentText}>
            {components.length}+ components
          </span>{" "}
          and growing.
        </p>

        <div className={styles.showcaseGrid}>
          {showcaseComponents.map((comp) => (
            <Link
              key={comp.id}
              href={`/components/${comp.slug}`}
              className={styles.showcaseLink}
            >
              <div className={styles.showcaseCard}>
                <div className={styles.showcaseCardPreview}>
                  <div className={styles.showcaseCardDotGrid} />
                  <Box size={32} className={styles.showcaseCardIcon} />
                </div>
                <div className={styles.showcaseCardBody}>
                  <p className={styles.showcaseCardName}>{comp.name}</p>
                  <p className={styles.showcaseCardCategory}>{comp.category}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className={styles.viewAllCenter}>
          <Link href="/components" className={styles.viewAllButton}>
            View All Components
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ====== GET STARTED ====== */}
      <section className={styles.getStartedSection}>
        <h2 className={styles.getStartedTitle}>Get started in seconds</h2>
        <p className={styles.getStartedSubtitle}>
          Simply browse, find a component you like, and copy the code.
        </p>

        {/* Steps */}
        <div className={styles.stepsContainer}>
          {[
            {
              step: "1",
              title: "Browse Components",
              desc: "Explore the library and find the component you need.",
              code: null,
            },
            {
              step: "2",
              title: "Copy the Code",
              desc: "Click the copy button to grab the component source.",
              code: 'import ShimmerButton from "./components/ShimmerButton";',
            },
            {
              step: "3",
              title: "Customize & Ship",
              desc: "Adjust props, colors, and styles to match your design system.",
              code: '<ShimmerButton onClick={handleCTA}>Get Started</ShimmerButton>',
            },
          ].map((item) => (
            <div key={item.step} className={styles.stepCard}>
              <div className={styles.stepNumber}>{item.step}</div>
              <div className={styles.stepContent}>
                <p className={styles.stepTitle}>{item.title}</p>
                <p className={styles.stepDesc} style={{ marginBottom: item.code ? "8px" : 0 }}>
                  {item.desc}
                </p>
                {item.code && (
                  <div className={styles.stepCode}>{item.code}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ====== FINAL CTA ====== */}
      <section className={styles.finalCtaSection}>
        <div className={styles.finalCtaBackground} />
        <div className={styles.finalCtaContent}>
          <h2 className={styles.finalCtaTitle}>Stop building from scratch</h2>
          <p className={styles.finalCtaSubtitle}>
            Start shipping beautiful interfaces today with our free component
            library.
          </p>
          <div className={styles.finalCtaButtons}>
            <Link href="/components" className={styles.finalCtaPrimary}>
              Browse Components
              <ArrowRight size={16} />
            </Link>
            <a
              href="https://github.com/SHAIK-ABDUL-REHAMAN31/LegitUI"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.githubButton}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <Image
            src="/LegitUI-logo.png"
            alt="LegitUI Logo"
            width={40}
            height={40}
            className={styles.footerBrandIcon}
          />
        </div>
        <p className={styles.footerCopy}>
          Free &amp; Open Source. Built with ❤️ for the React community.
        </p>
      </footer>
    </div>
  );
}
