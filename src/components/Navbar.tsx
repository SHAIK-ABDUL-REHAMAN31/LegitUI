"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Search, Menu, X } from "lucide-react";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Hide the global navbar on the landing page (Hero has its own nav)
  if (pathname === "/") return null;

  const links = [
    { href: "/docs", label: "DOCS" },
    { href: "/components", label: "COMPONENTS" },
    { href: "/showcase", label: "SHOWCASE" },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <nav className="main-navbar">
      <div className={styles.navInner}>
        <Link href="/" className={styles.logoLink}>
          <Image
            src="/LegitUI-logo.png"
            alt="LegitUI Logo"
            width={120}
            height={120}
            priority={true}
          />
        </Link>

        {/* Desktop Nav */}
        <div className={styles.desktopNavInner}>
          <div className={styles.navLinks}>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${isActive(link.href)
                  ? styles.navLinkActive
                  : styles.navLinkInactive
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search */}
          <div className={styles.searchWrapper}>
            <Search size={14} className={styles.searchIcon} />
            <Link
              href="/components"
              className={`search-input ${styles.searchLink}`}
            >
              Search...
            </Link>
          </div>

          {/* GitHub Star Badge */}
          <a
            href="https://github.com/SHAIK-ABDUL-REHAMAN31/LegitUI"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.githubBadge}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Star
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={styles.mobileToggle}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className={styles.mobileMenu}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`${styles.mobileLink} ${isActive(link.href)
                ? styles.mobileLinkActive
                : styles.mobileLinkInactive
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
