"use client";

import Link from "next/link";
import Image from "next/image";
import { useComponentStore } from "@/lib/component-store";
import {
  ArrowRight,
  Box,
} from "lucide-react";
import styles from "./page.module.css";
import LiquidChromiumParticles from "@/ui-components/LiquidChrome/LiquidChromeParticles";
import Hero from "./LandingPage/HeroSection/Hero";
import WhatsInside from "./LandingPage/WhatsInside/WhatsInside";
import LiveAction from "./LandingPage/LiveAction/LiveAction";
import GetStarted from "./LandingPage/GetStarted/GetStarted";
import FinalCta from "./LandingPage/FinalCta/FinalCta";
import Footer from "./LandingPage/Footer/Footer";

export default function HomePage() {
  const { components } = useComponentStore();

  const showcaseComponents = components.slice(0, 6);

  return (
    <div className={styles.pageWrapper}>
      {/* ====== HERO SECTION ====== */}
      <section style={{ position: "relative", minHeight: "100vh" }}>
        <LiquidChromiumParticles />
        <Hero />
      </section>

      {/* ====== WHAT'S INSIDE ====== */}
      <WhatsInside />

      {/* ====== SEE THEM IN ACTION (Showcase Grid) ====== */}
      <LiveAction />

      {/* ====== GET STARTED ====== */}
      <GetStarted />

      {/* ====== FINAL CTA ====== */}
      <FinalCta />

      {/* ====== FOOTER ====== */}
      <Footer />
    </div>
  );
}
