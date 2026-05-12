"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useComponentStore } from "@/lib/component-store";
import { useRef, useCallback } from "react";
import styles from "./DocsSidebar.module.css";

/* ── Hover-based preview prefetching ── */
const prefetchedSlugs = new Set<string>();

function prefetchPreview(slug: string) {
  if (prefetchedSlugs.has(slug)) return;
  prefetchedSlugs.add(slug);

  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = `/preview/${slug}`;
  link.as = "document";
  document.head.appendChild(link);
}

export default function DocsSidebar() {
  const pathname = usePathname();
  const { categories, components } = useComponentStore();
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = useCallback((slug: string) => {
    // Debounce: only prefetch after 100ms of sustained hover
    hoverTimerRef.current = setTimeout(() => {
      prefetchPreview(slug);
    }, 100);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, []);

  const getStartedLinks = [
    { label: "Introduction", href: "/docs" },
    { label: "Installation", href: "/docs/installation" },
    { label: "Index", href: "/components" },
  ];

  return (
    <aside className="docs-sidebar">
      {/* Get Started Section */}
      <div className={`sidebar-section-title ${styles.sectionTitleFirst}`}>
        Get Started
      </div>
      {getStartedLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`sidebar-link ${pathname === link.href ? "active" : ""}`}
        >
          {link.label}
        </Link>
      ))}

      {/* Category Sections */}
      {categories.map((cat) => {
        const catComponents = components.filter(
          (c) => c.category.toLowerCase() === cat.slug
        );
        if (catComponents.length === 0) return null;

        return (
          <div key={cat.slug}>
            <div className="sidebar-section-title">{cat.name}</div>
            {catComponents.map((comp) => (
              <Link
                key={comp.slug}
                href={`/components/${comp.slug}`}
                className={`sidebar-link ${pathname === `/components/${comp.slug}` ? "active" : ""
                  }`}
                onMouseEnter={() => handleMouseEnter(comp.slug)}
                onMouseLeave={handleMouseLeave}
              >
                <span className={styles.linkContent}>
                  {comp.name}
                  {comp.isNew && (
                    <span className={styles.badgeNew}>NEW</span>
                  )}
                  {comp.isUpdated && (
                    <span className={styles.badgeUpdated}>UPDATED</span>
                  )}
                </span>
              </Link>
            ))}
          </div>
        );
      })}
    </aside>
  );
}
