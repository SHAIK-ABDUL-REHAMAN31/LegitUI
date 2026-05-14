import React, { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Sparkles } from "lucide-react";
import styles from "./LiveAction.module.css";

import TextMorph from "@/ui-components/TextMorph/TextMorph";
import CurvedTypography from "@/ui-components/CurvedTypography/CurvedTypography";
import AsciiText from "@/ui-components/AsciiText/AsciiText";
import NetworkNodes from "@/ui-components/NetworkNodes/NetworkNodes";

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

export default function LiveAction() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className={styles.section} id="live-action">
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={stagger}
        >
          <motion.div className={styles.badge} variants={fadeUp}>
            <Sparkles size={14} className={styles.badgeIcon} />
            Interactive Previews
          </motion.div>

          <motion.h2 className={styles.title} variants={fadeUp}>
            See them in <span className={styles.titleAccent}>Action</span>
          </motion.h2>

          <motion.p className={styles.subtitle} variants={fadeUp}>
            Experience the components exactly how they will feel in your project. Click any card to get the source code instantly.
          </motion.p>
        </motion.div>

        <motion.div
          className={styles.grid}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={stagger}
        >
          {/* Card 1: TextMorph */}
          <motion.div className={styles.card1} variants={fadeUp}>
            <Link href="/components/text-morph" className={styles.cardLink}>
              <div className={styles.card}>
                <div className={styles.cardBody}>
                  <TextMorph
                    text="DREAM,BUILD,INNOVATE,SHAPE"
                    prefix="LET'S"
                    suffix="TOGETHER"
                    fontSize="clamp(1.5rem, 3vw, 2.5rem)"
                  />
                </div>
                <div className={styles.cardFooter}>
                  <span className={styles.cardCategory}>Text Animations</span>
                  <span className={styles.cardName}>TextMorph.tsx</span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Card 2: NetworkNodes */}
          <motion.div className={styles.card2} variants={fadeUp}>
            <Link href="/components/network-nodes" className={styles.cardLink}>
              <div className={styles.card}>
                <div className={styles.cardBody}>
                  <NetworkNodes
                    particleSpeed={2.5}
                    particleColor="#38bdf8"
                    lineColor="rgba(56, 189, 248, 0.2)"
                    nodes={[
                      {
                        id: "node-1", position: { x: 15, y: 20 },
                        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      },
                      {
                        id: "node-left-mid", position: { x: 15, y: 50 },
                        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      },
                      {
                        id: "node-2", position: { x: 15, y: 80 },
                        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      },
                      {
                        id: "node-3", position: { x: 85, y: 20 },
                        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      },
                      {
                        id: "node-right-mid", position: { x: 85, y: 50 },
                        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      },
                      {
                        id: "node-4", position: { x: 85, y: 80 },
                        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      },
                    ]}
                  />
                </div>
                <div className={styles.cardFooter}>
                  <span className={styles.cardCategory}>Interactive Network</span>
                  <span className={styles.cardName}>NetworkNodes.tsx</span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Card 3: AsciiText */}
          <motion.div className={styles.card3} variants={fadeUp}>
            <Link href="/components/ascii-text" className={styles.cardLink}>
              <div className={styles.card}>
                <div className={styles.cardBody} style={{ backgroundColor: "#000" }}>
                  <AsciiText text="LEGIT" />
                </div>
                <div className={styles.cardFooter}>
                  <span className={styles.cardCategory}>Pixel Art</span>
                  <span className={styles.cardName}>AsciiText.tsx</span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Card 4: CurvedTypography */}
          <motion.div className={styles.card4} variants={fadeUp}>
            <Link href="/components/curved-typography" className={styles.cardLink}>
              <div className={styles.card}>
                <div className={styles.cardBody}>
                  <CurvedTypography
                    type="wave"
                    text="LEGITUI COMPONENTS "
                    speed={15}
                    fontSize={48}
                    fontWeight={600}
                    letterSpacing="4px"
                    showPath={true}
                    pathColor="rgba(255, 255, 255, 0.1)"
                  />
                </div>
                <div className={styles.cardFooter}>
                  <span className={styles.cardCategory}>Typography</span>
                  <span className={styles.cardName}>CurvedText.tsx</span>
                </div>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
