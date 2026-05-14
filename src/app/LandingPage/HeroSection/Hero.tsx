import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Hero.module.css";

export default function HeroUI() {
    return (
        <div className={styles.heroWrapper}>
            {/* Navigation */}
            <motion.nav
                initial={{ opacity: 0, y: -100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={styles.nav}
            >
                <Link href="/" className={styles.logoLink}>
                    <Image
                        src="/LegitUI-logo.png"
                        alt="LegitUI Logo"
                        width={150}
                        height={60}
                        className={styles.logoImage}
                        priority
                    />
                </Link>
                <div className={styles.navLinks}>
                    <Link href="/components" className={styles.navLink}>Components</Link>
                    <Link href="/docs" className={styles.navLink}>Docs</Link>
                    <Link href="/showcase" className={styles.navLink}>Showcase</Link>
                </div>
                <div className={styles.socialLinks}>
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
            </motion.nav>

            {/* Main Content */}
            <div className={styles.mainContent}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={styles.badge}
                >
                    <span className={styles.badgeDot} />
                    Free & Open Source
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className={styles.title}
                >
                    Build Stunning Interfaces <span className={styles.titleAccent}>Effortlessly.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                    className={styles.description}
                >
                    A premium collection of interactive, animated React components. Copy, paste, and build stunning interfaces effortlessly.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                    className={styles.actions}
                >
                    <Link href="/components" className={styles.primaryAction}>
                        <span className={styles.primaryActionText}>Browse Components</span>
                        <ArrowRight className={styles.arrowIcon} />
                    </Link>
                    <Link href="/docs" className={styles.secondaryAction}>
                        View Documentation
                    </Link>
                </motion.div>
            </div>

            {/* Bottom glowing line */}
            <div className={styles.bottomGlowLine} />
        </div>
    );
}
