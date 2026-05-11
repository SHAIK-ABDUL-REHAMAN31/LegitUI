/**
 * record-previews.ts
 * 
 * Captures animated .webm previews and .jpg thumbnails for every component
 * in the LegitUI registry using Playwright + ffmpeg.
 *
 * Usage:
 *   npm run record-previews
 *   (requires: npm i -D playwright, and ffmpeg installed on PATH)
 *
 * Flow:
 *   1. Reads every component slug from the registry
 *   2. Launches headless Chromium via Playwright
 *   3. For each slug, navigates to localhost:3000/components/[slug]
 *   4. Waits 800ms for the preview iframe to render
 *   5. Captures 90 screenshots (30fps × 3s) of the iframe element
 *   6. Shells out to ffmpeg to produce:
 *       - public/previews/[slug].webm   (VP9, 600×400, crf 32, 3s loop)
 *       - public/previews/[slug]-thumb.jpg  (frame 15)
 */

import { chromium, type ElementHandle } from 'playwright';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// ── Configuration ──────────────────────────────────────────────
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const FPS = 30;
const DURATION_SEC = 3;
const TOTAL_FRAMES = FPS * DURATION_SEC; // 90
const FRAME_INTERVAL = 1000 / FPS;       // ~33.3 ms
const OUTPUT_DIR = path.resolve(__dirname, '..', 'public', 'previews');
const TMP_BASE = path.resolve(__dirname, '..', '.tmp-frames');
const THUMB_FRAME = 15; // 0-indexed frame used for .jpg thumbnail

// ── Helpers ────────────────────────────────────────────────────

/** Ensure a directory exists, creating it recursively if needed. */
function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/** Remove a directory recursively. */
function cleanDir(dir: string) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/** Pad number to 4 digits for ffmpeg sequential naming. */
function pad(n: number): string {
  return String(n).padStart(4, '0');
}

/**
 * Dynamically import the registry to get all component slugs.
 * We read the file and extract slugs with a simple regex to avoid
 * needing a full TS compilation of the registry.
 */
function getComponentSlugs(): string[] {
  const registryPath = path.resolve(__dirname, '..', 'src', 'lib', 'component-registry.ts');
  const content = fs.readFileSync(registryPath, 'utf-8');
  const slugs: string[] = [];
  const regex = /slug:\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    slugs.push(match[1]);
  }
  return slugs;
}

// ── Main ───────────────────────────────────────────────────────

async function main() {
  const slugs = getComponentSlugs();

  if (slugs.length === 0) {
    console.error('No component slugs found in registry.');
    process.exit(1);
  }

  console.log(`\n🎬 Recording previews for ${slugs.length} components\n`);
  console.log(`   Base URL : ${BASE_URL}`);
  console.log(`   Output   : ${OUTPUT_DIR}`);
  console.log(`   FPS      : ${FPS}`);
  console.log(`   Duration : ${DURATION_SEC}s (${TOTAL_FRAMES} frames)\n`);

  ensureDir(OUTPUT_DIR);
  ensureDir(TMP_BASE);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });

  for (const slug of slugs) {
    const page = await context.newPage();
    const framesDir = path.join(TMP_BASE, slug);
    ensureDir(framesDir);

    const url = `${BASE_URL}/components/${slug}`;
    console.log(`📹 ${slug}`);
    console.log(`   Navigating to ${url}...`);

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    } catch {
      console.log(`   ⚠ Timeout/error navigating to ${slug}, skipping.`);
      await page.close();
      continue;
    }

    // Wait for the preview iframe to render
    await page.waitForTimeout(800);

    // Try to find the preview iframe element
    let target: ElementHandle | null = null;
    try {
      target = await page.$('iframe') || await page.$('.preview-canvas') || await page.$('[class*="previewArea"]');
    } catch {
      // fallback
    }

    if (!target) {
      console.log(`   ⚠ No iframe/preview element found for ${slug}, capturing viewport.`);
      // Fall back to a region of the page
      target = await page.$('body');
    }

    if (!target) {
      console.log(`   ⚠ Cannot capture ${slug}, skipping.`);
      await page.close();
      continue;
    }

    // Capture frames
    console.log(`   Capturing ${TOTAL_FRAMES} frames...`);
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const framePath = path.join(framesDir, `${pad(i + 1)}.png`);
      try {
        await target.screenshot({ path: framePath });
      } catch {
        // Element may have moved; skip frame
      }
      await page.waitForTimeout(FRAME_INTERVAL);
    }

    // Encode to .webm via ffmpeg
    const webmPath = path.join(OUTPUT_DIR, `${slug}.webm`);
    const thumbPath = path.join(OUTPUT_DIR, `${slug}-thumb.jpg`);

    console.log(`   Encoding → ${slug}.webm`);
    try {
      execSync(
        `ffmpeg -y -framerate ${FPS} -i "${framesDir}/%04d.png" ` +
        `-c:v libvpx-vp9 -crf 32 -b:v 0 -vf "scale=600:400" ` +
        `-t ${DURATION_SEC} -an "${webmPath}"`,
        { stdio: 'pipe' }
      );
    } catch (err: any) {
      console.log(`   ⚠ ffmpeg encode failed for ${slug}: ${err.message}`);
    }

    // Extract thumbnail from frame 15
    const thumbSrcFrame = path.join(framesDir, `${pad(THUMB_FRAME)}.png`);
    if (fs.existsSync(thumbSrcFrame)) {
      console.log(`   Extracting → ${slug}-thumb.jpg`);
      try {
        execSync(
          `ffmpeg -y -i "${thumbSrcFrame}" -vf "scale=600:400" "${thumbPath}"`,
          { stdio: 'pipe' }
        );
      } catch (err: any) {
        console.log(`   ⚠ ffmpeg thumbnail failed for ${slug}: ${err.message}`);
      }
    }

    console.log(`   ✅ Done\n`);
    await page.close();
  }

  await browser.close();

  // Cleanup temp frames
  cleanDir(TMP_BASE);

  console.log(`\n🎉 All previews recorded! Files saved to: ${OUTPUT_DIR}\n`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
