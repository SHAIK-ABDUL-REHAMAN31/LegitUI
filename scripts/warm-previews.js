// ════════════════════════════════════════════════════════════════
// warm-previews.js — Dev Server Route Warmer
// ════════════════════════════════════════════════════════════════
// Hits every preview route after the dev server starts, forcing
// Turbopack to compile them all upfront instead of on-demand.
//
// Usage:
//   1. Start the dev server: npm run dev
//   2. In a second terminal: npm run dev:warm
//   3. Wait ~2-5 minutes for all routes to compile
//   4. Every component page now loads instantly
// ════════════════════════════════════════════════════════════════

const BASE = process.env.BASE_URL || "http://localhost:3000";

// All slugs from the preview map
const ALL_SLUGS = [
  "shimmer-button",
  "glow-card",
  "pulse-loader",
  "typewriter-text",
  "animated-border",
  "floating-input",
  "aurora-background",
  "magnetic-button",
  "spotlight-card",
  "skeleton-loader",
  "ripple-button",
  "particles-background",
  "neon-waves",
  "mirror-capsules",
  "fractal-haze",
  "liquid-nebula",
  "space-nebula-v1",
  "space-nebula-v2",
  "green-wave-ribbons",
  "cinematic-black-hole",
  "3d-gallery",
  "scroll-gallery",
  "text-reveal",
  "smooth-fade-up",
  "cinematic-text",
  "scale-blur",
  "staggered-word-slide",
  "typing-cursor",
  "typewriter-text-new",
  "pixelify-text",
  "numbers-count",
  "premium-bank-card",
  "animated-gradient-text",
  "liquid-wave-text",
  "flip-text",
  "infinite-marquee",
  "text-morph",
  "scroll-reveal-text",
  "slide-up-text",
  "text-roller",
  "magnetic-hover-text",
  "hover-reveal-card",
  "rotating-text",
  "ascii-text",
  "kinetic-split-text",
  "curved-typography",
  "glitch-text",
  "physics-text",
  "depth-text",
  "true-3d-text",
  "scroll-wave-gallery",
  "ascii-motion-text",
  "stacked-card-reveal",
  "cinematic-scroll",
  "curved-typography-gallery",
  "infinite-image-marquee",
  "editorial-storytelling",
  "cursor-image-trail",
  "orbit-gallery",
  "magnetic-dock",
  "horizon-gradient",
];

// ANSI colors for terminal output
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

async function checkServer() {
  try {
    const res = await fetch(BASE, { signal: AbortSignal.timeout(5000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function warmAll() {
  console.log(`\n${BOLD}${CYAN}🔥 LegitUI Preview Warmer${RESET}`);
  console.log(`${DIM}   Warming ${ALL_SLUGS.length} preview routes at ${BASE}${RESET}\n`);

  // Check if dev server is running
  const serverUp = await checkServer();
  if (!serverUp) {
    console.log(`${RED}✗ Dev server not running at ${BASE}${RESET}`);
    console.log(`${DIM}  Start it first: npm run dev${RESET}\n`);
    process.exit(1);
  }

  let success = 0;
  let failed = 0;
  const startTime = Date.now();

  for (let i = 0; i < ALL_SLUGS.length; i++) {
    const slug = ALL_SLUGS[i];
    const index = `${String(i + 1).padStart(2, " ")}/${ALL_SLUGS.length}`;
    const url = `${BASE}/preview/${slug}`;

    try {
      const t0 = Date.now();
      await fetch(url, { signal: AbortSignal.timeout(60000) });
      const ms = Date.now() - t0;
      const timeStr = ms > 3000 ? `${YELLOW}${ms}ms${RESET}` : `${DIM}${ms}ms${RESET}`;
      console.log(`  ${GREEN}✓${RESET} ${index} ${slug} ${timeStr}`);
      success++;
    } catch (e) {
      console.log(`  ${RED}✗${RESET} ${index} ${slug} ${RED}(timeout/error)${RESET}`);
      failed++;
    }

    // Small delay between requests to avoid overwhelming Turbopack
    if (i < ALL_SLUGS.length - 1) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
  console.log(`  ${GREEN}${success} warmed${RESET}  ${failed > 0 ? `${RED}${failed} failed${RESET}  ` : ""}${DIM}${totalTime}s total${RESET}`);
  console.log(`${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
  console.log(`\n${DIM}  All preview routes are now compiled.`);
  console.log(`  Component navigation will be near-instant.${RESET}\n`);
}

warmAll();
