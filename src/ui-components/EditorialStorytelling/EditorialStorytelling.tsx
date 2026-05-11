"use client";

import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import SplitType from "split-type";
import styles from "./EditorialStorytelling.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface StoryChapter {
  title: string;
  description: string;
  image: string;
}

export interface EditorialStorytellingProps {
  chapters: StoryChapter[];
}

export default function EditorialStorytelling({
  chapters,
}: EditorialStorytellingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
    });

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Split text for all titles
    const splits = textRefs.current.map((el) => {
      if (!el) return null;
      const titleEl = el.querySelector(`.${styles.title}`);
      if (titleEl) {
        return new SplitType(titleEl as HTMLElement, { types: "chars,words" });
      }
      return null;
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        pin: true,
        start: "top top",
        end: `+=${chapters.length * 100}%`,
        scrub: 1, // Smooth scrubbing for emotional cinematic feel
      },
    });

    chapters.forEach((_, index) => {
      const textEl = textRefs.current[index];
      const imgEl = imgRefs.current[index];
      if (!textEl || !imgEl) return;

      const imgChild = imgEl.querySelector("img");
      const titleChars = textEl.querySelectorAll(".char");
      const desc = textEl.querySelector(`.${styles.description}`);

      if (index === 0) {
        // Initial state for the first chapter
        gsap.set(textEl, { opacity: 1, y: 0 });
        gsap.set(titleChars, { opacity: 1, y: 0, rotationX: 0 });
        gsap.set(desc, { opacity: 1, y: 0 });
        gsap.set(imgEl, { opacity: 1, zIndex: 1 });
        gsap.set(imgChild, { scale: 1, filter: "blur(0px)" });
      } else {
        // Hidden state for upcoming chapters
        gsap.set(textEl, { opacity: 0, y: 50 });
        gsap.set(titleChars, { opacity: 0, y: 40, rotationX: -90 });
        gsap.set(desc, { opacity: 0, y: 20 });
        gsap.set(imgEl, { opacity: 0, zIndex: 0 });
        gsap.set(imgChild, { scale: 1.4, filter: "blur(20px)" });

        const chapterLabel = `chapter${index}`;

        // Add a small pause between sections
        tl.addLabel(chapterLabel, `+=${0.2}`);

        // Image reveal (opacity + dynamic unblur/scale)
        tl.to(imgEl, { opacity: 1, zIndex: 1, duration: 1, ease: "none" }, chapterLabel);
        tl.to(
          imgChild,
          { scale: 1, filter: "blur(0px)", duration: 1.5, ease: "power2.out" },
          chapterLabel
        );

        // Text wrapper entrance
        tl.to(textEl, { opacity: 1, y: 0, duration: 0.5 }, chapterLabel);

        // Kinetic typography split entrance
        if (titleChars.length) {
          tl.to(
            titleChars,
            {
              opacity: 1,
              y: 0,
              rotationX: 0,
              stagger: 0.05,
              duration: 1,
              ease: "power3.out",
            },
            `${chapterLabel}+=0.2`
          );
        }

        // Subtitle float in
        if (desc) {
          tl.to(
            desc,
            { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
            `${chapterLabel}+=0.5`
          );
        }
      }

      // Fade out current chapter when moving to the next
      if (index < chapters.length - 1) {
        const nextChapterLabel = `chapter${index + 1}`;
        tl.to(
          textEl,
          { opacity: 0, y: -50, duration: 0.5 },
          `${nextChapterLabel}-=0.5`
        );
        // We keep the previous image underneath for a crossfade effect, 
        // but we fade it out slightly before the new one fully overtakes
      }
    });

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      splits.forEach((s) => s?.revert());
    };
  }, [chapters]);

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.leftContent}>
        {chapters.map((chapter, i) => (
          <div
            key={i}
            className={styles.chapterText}
            ref={(el) => {
              if (el) textRefs.current[i] = el;
            }}
          >
            <h2 className={styles.title}>{chapter.title}</h2>
            <p className={styles.description}>{chapter.description}</p>
          </div>
        ))}
      </div>
      <div className={styles.rightContent}>
        {chapters.map((chapter, i) => (
          <div
            key={i}
            className={styles.imageContainer}
            ref={(el) => {
              if (el) imgRefs.current[i] = el;
            }}
          >
            <img src={chapter.image} alt={chapter.title} className={styles.image} />
          </div>
        ))}
      </div>
    </div>
  );
}
