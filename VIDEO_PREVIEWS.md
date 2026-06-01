# LegitUI — Preview Video Fast Loading Guide
## Replace Placeholder Icons with Looping WebM Videos on the Components Index

> **What you have:** `public/PreviewVideos/` folder with MP4 files —
> AnimatedBorder.mp4, CinematicScroll.mp4, CircleTransition.mp4,
> CursorImageTrail.mp4, CurvedGallery.mp4, HalfToneEyes.mp4,
> InfiniteImageMarquee.mp4, MagneticDock.mp4, OrbitCarousel.mp4,
> OrbitGallery.mp4, SnakeCurve.mp4, SpinningSpiral.mp4, StoryTelling.mp4
>
> **What you want:** These videos playing silently, looping automatically,
> filling the card preview area at `/components` — fast load, no jank.
>
> **Why WebM:** WebM VP9 = 40–60% smaller than MP4 at same quality.
> A 1.3MB MP4 becomes a 280–400KB WebM. 83 cards × 400KB = 33MB total
> vs 83 cards × 1.3MB = 108MB. WebM wins every time.

---

## Table of Contents

- [Step 1 — Convert All MP4s to WebM](#step-1--convert-all-mp4s-to-webm)
- [Step 2 — Rename to Match Slugs](#step-2--rename-to-match-slugs)
- [Step 3 — Update component-registry.ts](#step-3--update-component-registryts)
- [Step 4 — Build the VideoCard Component](#step-4--build-the-videocard-component)
- [Step 5 — Update the Components Index Page](#step-5--update-the-components-index-page)
- [Step 6 — Add Next.js Cache Headers](#step-6--add-nextjs-cache-headers)
- [Step 7 — Vercel Config for Video Serving](#step-7--vercel-config-for-video-serving)
- [Step 8 — Test Everything](#step-8--test-everything)
- [The Master Prompt](#the-master-prompt)

---

## Step 1 — Convert All MP4s to WebM

### Install FFmpeg First (if not installed)
```powershell
winget install FFmpeg
# Then close and reopen terminal to refresh PATH
ffmpeg -version  # verify it works
```

### The Single Batch Command — Converts ALL MP4s at Once

Open PowerShell in your `public/PreviewVideos/` folder and run this:

```powershell
# Navigate to your PreviewVideos folder first
cd D:\LegitUI\legitui\public\PreviewVideos

# Batch convert ALL mp4 files to WebM in one command
Get-ChildItem -Filter "*.mp4" | ForEach-Object {
    $input = $_.FullName
    $output = $_.DirectoryName + "\" + $_.BaseName + ".webm"
    Write-Host "Converting: $($_.Name) → $($_.BaseName).webm"
    ffmpeg -i $input `
        -c:v libvpx-vp9 `
        -crf 40 `
        -b:v 0 `
        -vf "scale=720:405" `
        -an `
        -deadline good `
        -cpu-used 2 `
        $output
    Write-Host "Done: $output"
}
Write-Host "All conversions complete."
```

### What Each Flag Does

| Flag | Value | Why |
|------|-------|-----|
| `-c:v libvpx-vp9` | VP9 codec | 40–60% smaller than H.264 |
| `-crf 40` | Quality level | 0=perfect, 63=worst. 40=sweet spot for card thumbnails |
| `-b:v 0` | No bitrate cap | Lets CRF control quality fully |
| `-vf "scale=720:405"` | 720p output | Cards display at ~380px. 720 is sharp on retina |
| `-an` | No audio | Strip audio completely — never needed |
| `-deadline good` | Encode speed | Balance of speed and compression |
| `-cpu-used 2` | CPU threads | 0=slowest/smallest, 5=fastest/largest. 2 is balanced |

### Expected File Sizes After Conversion

| File | Before (MP4) | After (WebM) | Savings |
|------|-------------|--------------|---------|
| AnimatedBorder.mp4 | ~1.3MB | ~280KB | 78% |
| CinematicScroll.mp4 | ~1.3MB | ~260KB | 80% |
| OrbitGallery.mp4 | ~1.3MB | ~320KB | 75% |
| All others | ~1.3MB | 200–400KB | 70–80% |

### Verify Sizes After Conversion
```powershell
# Check sizes of all WebM files
Get-ChildItem -Filter "*.webm" | Select-Object Name, @{
    Name="Size (KB)"; Expression={ [math]::Round($_.Length / 1KB, 1) }
} | Format-Table
```

If any file is still over 500KB, rerun with `-crf 45` instead of `-crf 40`.
If under 150KB and looking blurry, use `-crf 35` for better quality.

---

## Step 2 — Rename to Match Slugs

Your MP4 files use PascalCase. Your component slugs use kebab-case.
The video filename MUST match the slug exactly for auto-wiring to work.

Run this renaming script in PowerShell:

```powershell
cd D:\LegitUI\legitui\public\PreviewVideos

# Rename WebM files to match component slugs
$renames = @{
    "AnimatedBorder.webm"      = "animated-border.webm"
    "CinematicScroll.webm"     = "cinematic-scroll.webm"
    "CircleTransition.webm"    = "circle-transition.webm"
    "CursorImageTrail.webm"    = "cursor-image-trail.webm"
    "CurvedGallery.webm"       = "curved-typography-gallery.webm"
    "HalfToneEyes.webm"        = "half-tone-eyes.webm"
    "InfiniteImageMarquee.webm"= "infinite-image-marquee.webm"
    "MagneticDock.webm"        = "magnetic-dock.webm"
    "OrbitCarousel.webm"       = "orbit-carousel.webm"
    "OrbitGallery.webm"        = "orbit-gallery.webm"
    "SnakeCurve.webm"          = "snake-curve.webm"
    "SpinningSpiral.webm"      = "spinning-spiral.webm"
    "StoryTelling.webm"        = "story-telling.webm"
}

foreach ($old in $renames.Keys) {
    $new = $renames[$old]
    if (Test-Path $old) {
        Rename-Item $old $new
        Write-Host "Renamed: $old → $new"
    } else {
        Write-Host "NOT FOUND: $old (check spelling)"
    }
}
```

> **CRITICAL:** The slug in the rename map MUST match exactly what is in
> your `component-registry.ts`. Open the registry and double-check every slug.
> If the slug is `curved-typography-gallery` but you renamed to `curved-gallery`,
> the video will not load.

### Final Folder Structure After Rename

```
public/
└── PreviewVideos/
    ├── animated-border.webm        ← renamed from AnimatedBorder
    ├── animated-border.mp4         ← keep original as Safari fallback
    ├── cinematic-scroll.webm
    ├── cinematic-scroll.mp4
    ├── circle-transition.webm
    ├── circle-transition.mp4
    ├── cursor-image-trail.webm
    ├── cursor-image-trail.mp4
    ├── curved-typography-gallery.webm
    ├── curved-typography-gallery.mp4
    ├── half-tone-eyes.webm
    ├── half-tone-eyes.mp4
    ├── infinite-image-marquee.webm
    ├── infinite-image-marquee.mp4
    ├── magnetic-dock.webm
    ├── magnetic-dock.mp4
    ├── orbit-carousel.webm
    ├── orbit-carousel.mp4
    ├── orbit-gallery.webm
    ├── orbit-gallery.mp4
    ├── snake-curve.webm
    ├── snake-curve.mp4
    ├── spinning-spiral.webm
    ├── spinning-spiral.mp4
    └── story-telling.webm
        story-telling.mp4
```

Keep the original MP4s — they are the Safari fallback inside `<source>` tags.

---

## Step 3 — Update component-registry.ts

Add a `previewVideo` field to the registry entries that have videos.
Only add it to components where you HAVE a video file.
Components without a video fall back to the placeholder icon automatically.

```typescript
// src/lib/component-registry.ts

// Add this field to the ComponentRegistryEntry interface:
interface ComponentRegistryEntry {
  slug: string;
  name: string;
  folder: string;
  fileName: string;
  category: string;
  description: string;
  tags: string[];
  dependencies: string[];
  props: ComponentProp[];
  previewVideo?: boolean;  // ← ADD THIS ONE FIELD
  usageExample?: string;
  featured?: boolean;
  new?: boolean;
}

// Then for each component that HAS a video, add previewVideo: true
// Example entries:

export const defaultComponents: ComponentRegistryEntry[] = [
  {
    slug: "animated-border",
    name: "Animated Border",
    folder: "AnimatedBorder",
    fileName: "AnimatedBorder",
    category: "animations",
    description: "...",
    tags: [...],
    dependencies: [...],
    props: [...],
    previewVideo: true,  // ← HAS VIDEO
  },
  {
    slug: "cinematic-scroll",
    name: "Cinematic Scroll",
    folder: "CinematicScroll",
    fileName: "CinematicScroll",
    category: "animations",
    description: "...",
    tags: [...],
    dependencies: [...],
    props: [...],
    previewVideo: true,  // ← HAS VIDEO
  },
  {
    slug: "circle-transition",
    name: "Circle Transition",
    // ...
    previewVideo: true,
  },
  {
    slug: "cursor-image-trail",
    name: "Cursor Image Trail",
    // ...
    previewVideo: true,
  },
  {
    slug: "curved-typography-gallery",
    name: "Curved Typography Gallery",
    // ...
    previewVideo: true,
  },
  {
    slug: "half-tone-eyes",
    name: "Half Tone Eyes",
    // ...
    previewVideo: true,
  },
  {
    slug: "infinite-image-marquee",
    name: "Infinite Image Marquee",
    // ...
    previewVideo: true,
  },
  {
    slug: "magnetic-dock",
    name: "Magnetic Dock",
    // ...
    previewVideo: true,
  },
  {
    slug: "orbit-carousel",
    name: "Orbit Carousel",
    // ...
    previewVideo: true,
  },
  {
    slug: "orbit-gallery",
    name: "Orbit Gallery",
    // ...
    previewVideo: true,
  },
  {
    slug: "snake-curve",
    name: "Snake Curve",
    // ...
    previewVideo: true,
  },
  {
    slug: "spinning-spiral",
    name: "Spinning Spiral",
    // ...
    previewVideo: true,
  },
  {
    slug: "story-telling",
    name: "Story Telling",
    // ...
    previewVideo: true,
  },
  // All other components WITHOUT videos — no previewVideo field
  // They automatically show the placeholder icon
  {
    slug: "shimmer-button",
    name: "Shimmer Button",
    // previewVideo NOT set → shows placeholder icon
  },
];
```

---

## Step 4 — Build the VideoCard Component

Create this new component. This is the most important file.

```typescript
// src/components/VideoCard.tsx
'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface VideoCardProps {
  slug: string;
  name: string;
  category: string;
  previewVideo?: boolean;
  isNew?: boolean;
  featured?: boolean;
}

// Placeholder icon SVGs mapped by category
// These match exactly what you have now so fallback looks identical
const PLACEHOLDER_ICONS: Record<string, JSX.Element> = {
  animations: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <polygon points="20,4 36,36 4,36" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4"/>
    </svg>
  ),
  components: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path d="M20 4L36 20L20 36L4 20Z" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4"/>
    </svg>
  ),
  loaders: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4"/>
      <circle cx="20" cy="20" r="8" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.25"/>
    </svg>
  ),
  backgrounds: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="8" y="8" width="24" height="24" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" rx="2"/>
    </svg>
  ),
  'text-animations': (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path d="M8 20h24M20 8v24" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
    </svg>
  ),
  default: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path d="M20 6L34 20L20 34L6 20Z" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4"/>
    </svg>
  ),
};

export function VideoCard({
  slug,
  name,
  category,
  previewVideo = false,
  isNew = false,
}: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasStartedLoading, setHasStartedLoading] = useState(false);

  const showVideo = previewVideo && !videoError;
  const placeholderIcon = PLACEHOLDER_ICONS[category] ?? PLACEHOLDER_ICONS.default;

  // ── INTERSECTION OBSERVER ──────────────────────────────────────────────────
  // Only start loading the video when the card is 200px from viewport.
  // This prevents loading all 83 videos at once on page load.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !showVideo) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          // Once in view, start loading
          if (!hasStartedLoading) {
            setHasStartedLoading(true);
          }
        } else {
          setIsInView(false);
        }
      },
      {
        rootMargin: '200px', // Start loading 200px before card enters viewport
        threshold: 0,
      }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [showVideo, hasStartedLoading]);

  // ── PLAY / PAUSE BASED ON VISIBILITY ──────────────────────────────────────
  // Play when in viewport, pause when out. Saves GPU and battery.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoLoaded) return;

    if (isInView) {
      // play() returns a Promise — catch the rejection silently
      // (happens when browser blocks autoplay)
      video.play().catch(() => {});
    } else {
      video.pause();
      // Reset to start so it begins fresh when scrolled back into view
      video.currentTime = 0;
    }
  }, [isInView, videoLoaded]);

  const handleVideoCanPlay = useCallback(() => {
    setVideoLoaded(true);
    const video = videoRef.current;
    if (video && isInView) {
      video.play().catch(() => {});
    }
  }, [isInView]);

  const handleVideoError = useCallback(() => {
    setVideoError(true);
  }, []);

  return (
    <Link
      href={`/components/${slug}`}
      className="group block rounded-xl overflow-hidden border border-white/[0.06] bg-[#0d0d14] transition-all duration-300 hover:border-white/[0.14] hover:scale-[1.02] hover:shadow-xl hover:shadow-black/40"
    >
      {/* ── PREVIEW AREA ─────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: '16/9' }}
      >
        {/* Placeholder icon — always rendered, hidden when video is ready */}
        <div
          className="absolute inset-0 flex items-center justify-center text-white/20 transition-opacity duration-500"
          style={{ opacity: videoLoaded && !videoError ? 0 : 1 }}
          aria-hidden="true"
        >
          {placeholderIcon}
        </div>

        {/* Video element — only rendered when we have a video AND it's near viewport */}
        {showVideo && hasStartedLoading && (
          <video
            ref={videoRef}
            loop
            muted
            playsInline
            preload="metadata"
            // preload="metadata" downloads just the first frame for the poster
            // preload="none" = nothing loads until play()
            // preload="metadata" = loads first frame only → card looks filled instantly
            onCanPlay={handleVideoCanPlay}
            onError={handleVideoError}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
            style={{ opacity: videoLoaded ? 1 : 0 }}
          >
            {/* WebM first — Chrome, Firefox, Edge (smaller file, faster load) */}
            <source
              src={`/PreviewVideos/${slug}.webm`}
              type="video/webm"
            />
            {/* MP4 fallback — Safari */}
            <source
              src={`/PreviewVideos/${slug}.mp4`}
              type="video/mp4"
            />
          </video>
        )}

        {/* NEW badge */}
        {isNew && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="bg-emerald-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wide">
              NEW
            </span>
          </div>
        )}
      </div>

      {/* ── CARD FOOTER ──────────────────────────────────────────── */}
      <div className="px-4 py-3.5 border-t border-white/[0.04]">
        <h3 className="text-sm font-semibold text-white/90 leading-tight">
          {name}
        </h3>
        <p className="text-xs text-white/35 mt-0.5 capitalize">
          {category.replace(/-/g, ' ')}
        </p>
      </div>
    </Link>
  );
}
```

---

## Step 5 — Update the Components Index Page

Find your components index page — likely at one of these paths:
- `src/app/components/page.tsx`
- `src/app/(app)/components/page.tsx`
- `src/app/components/index.tsx`

Replace the existing card rendering with `VideoCard`:

```typescript
// src/app/components/page.tsx

import { defaultComponents } from '@/lib/component-registry';
import { VideoCard } from '@/components/VideoCard';

export default function ComponentsPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">

      {/* Search + Filter Bar — keep your existing search/filter UI here */}
      <div className="flex items-center gap-3">
        {/* Your existing search and dropdown here */}
      </div>

      {/* Component count */}
      <p className="text-sm text-white/40 text-right">
        {defaultComponents.length} components
      </p>

      {/* THE GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {defaultComponents.map((component) => (
          <VideoCard
            key={component.slug}
            slug={component.slug}
            name={component.name}
            category={component.category}
            previewVideo={component.previewVideo}
            isNew={component.new}
          />
        ))}
      </div>

    </div>
  );
}
```

---

## Step 6 — Add Next.js Cache Headers

This is critical for Vercel performance. Without this, every video
is fetched from Vercel's edge on every single request.
With this, the browser caches each video for 1 year after first load.

```typescript
// next.config.ts

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ... your existing config

  async headers() {
    return [
      // Cache ALL videos in PreviewVideos for 1 year
      // immutable = browser never re-checks until URL changes
      {
        source: '/PreviewVideos/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          // Allow video to be loaded inside the same origin
          {
            key: 'Accept-Ranges',
            value: 'bytes',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

**What this achieves:**
- First visit: browser downloads the WebM from Vercel edge (~280KB)
- Every visit after: browser serves from local disk cache (0ms, 0 bandwidth)
- With 83 videos: total bandwidth cost is one-time per user per video

---

## Step 7 — Vercel Config for Video Serving

Create or update `vercel.json` at your project root.
This tells Vercel to serve videos with the right headers and
use edge caching for fast global delivery.

```json
{
  "headers": [
    {
      "source": "/PreviewVideos/(.*).webm",
      "headers": [
        {
          "key": "Content-Type",
          "value": "video/webm"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        },
        {
          "key": "Accept-Ranges",
          "value": "bytes"
        }
      ]
    },
    {
      "source": "/PreviewVideos/(.*).mp4",
      "headers": [
        {
          "key": "Content-Type",
          "value": "video/mp4"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        },
        {
          "key": "Accept-Ranges",
          "value": "bytes"
        }
      ]
    }
  ]
}
```

`Accept-Ranges: bytes` is critical — it tells the browser the server
supports partial content requests. This means the video starts playing
before it is fully downloaded (streaming). Without this, the browser
waits for the entire file before playing.

---

## Step 8 — Test Everything

### Local Testing Checklist

```bash
# Start dev server
npm run dev
```

Open `http://localhost:3000/components` and verify:

- [ ] Cards with `previewVideo: true` show video after 0.5s
- [ ] Cards without `previewVideo` still show placeholder icon
- [ ] Videos start playing as you scroll down (IntersectionObserver working)
- [ ] Videos above the fold play immediately on page load
- [ ] Videos below the fold don't load until you scroll near them
- [ ] Open DevTools Network tab → filter by "webm" → videos should load progressively
- [ ] The page itself loads fast — not blocked by video downloads
- [ ] `NEW` badge appears on correct cards

### Check Correct File Path

Open DevTools Network tab, look for a 404 on any video.
If you see: `GET /PreviewVideos/animated-border.webm 404`
It means either the file doesn't exist or the name doesn't match the slug.

Double check:
1. File exists in `public/PreviewVideos/animated-border.webm`
2. Registry has `slug: "animated-border"` and `previewVideo: true`
3. The `<source src>` in VideoCard.tsx uses `/PreviewVideos/${slug}.webm`

### Production Testing (Vercel)

After deploying:
```
1. Open https://legit-ui-blond.vercel.app/components
2. Open DevTools → Network → filter "webm"
3. Watch videos load one by one as you scroll
4. Check Response Headers on any .webm file:
   Cache-Control: public, max-age=31536000, immutable  ✓
   Content-Type: video/webm  ✓
   Accept-Ranges: bytes  ✓
5. Scroll back up — videos that already loaded should NOT appear in Network again
   (they're served from browser cache)
```

---

## The Master Prompt

Copy this entire prompt into Cursor or Claude Code to implement everything at once:

```
I have a Next.js 16 App Router component library called LegitUI deployed at Vercel.

I have MP4 preview videos in public/PreviewVideos/ folder:
AnimatedBorder.mp4, CinematicScroll.mp4, CircleTransition.mp4,
CursorImageTrail.mp4, CurvedGallery.mp4, HalfToneEyes.mp4,
InfiniteImageMarquee.mp4, MagneticDock.mp4, OrbitCarousel.mp4,
OrbitGallery.mp4, SnakeCurve.mp4, SpinningSpiral.mp4, StoryTelling.mp4

I also have WebM versions at the same path with kebab-case names:
animated-border.webm, cinematic-scroll.webm, etc.

I need to replace the placeholder icon in each component card on the
/components index page with a looping, muted, silent video preview.

Requirements:
1. Videos must load FAST — use IntersectionObserver with 200px rootMargin
   to only start loading videos when they are near the viewport
2. Use preload="metadata" — loads just the first frame without downloading
   the full video, so the card fills with a frame instantly
3. Play when in viewport, pause when out of viewport — saves GPU/battery
4. WebM source first, MP4 fallback second (for Safari)
5. Smooth fade-in: video opacity 0 → 1 over 500ms when ready to play
6. Placeholder icon stays visible at opacity 1 until video is ready,
   then fades to opacity 0 as video fades in
7. On video error: stay on placeholder icon silently, no broken UI
8. Keep the NEW badge in top-right corner of the preview area
9. Card hover: scale(1.02), brighter border, shadow — same as current cards

Files to create or update:

FILE 1: src/components/VideoCard.tsx (CREATE NEW)
A 'use client' component that receives:
  { slug, name, category, previewVideo, isNew }
Contains the IntersectionObserver logic, video element with WebM+MP4 sources,
placeholder icon fallback, and smooth transitions.
Video src paths: /PreviewVideos/${slug}.webm and /PreviewVideos/${slug}.mp4

FILE 2: src/lib/component-registry.ts (UPDATE)
Add previewVideo?: boolean to the ComponentRegistryEntry interface.
Add previewVideo: true to these specific slugs:
animated-border, cinematic-scroll, circle-transition, cursor-image-trail,
curved-typography-gallery, half-tone-eyes, infinite-image-marquee,
magnetic-dock, orbit-carousel, orbit-gallery, snake-curve,
spinning-spiral, story-telling

FILE 3: src/app/components/page.tsx (UPDATE)
Import VideoCard and replace the current card rendering loop.
Pass slug, name, category, previewVideo, isNew from the registry to VideoCard.
Keep the existing search input and category filter dropdown exactly as-is.
Keep the exact same grid layout: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3.

FILE 4: next.config.ts (UPDATE)
Add headers() function returning Cache-Control: public, max-age=31536000, immutable
for /PreviewVideos/:path* — both webm and mp4.
Add Accept-Ranges: bytes to both.

FILE 5: vercel.json (CREATE or UPDATE)
Add headers for /PreviewVideos/(.*).webm and /PreviewVideos/(.*).mp4
with Content-Type, Cache-Control: immutable, and Accept-Ranges: bytes.

Show me all 5 files completely. TypeScript throughout.
The videos must start playing immediately when a card enters the viewport
and stop when it leaves. No jank, no layout shift, smooth transitions.
```

---

## Performance Summary

### Before (Placeholder Icons)
- Page load: instant (no videos)
- User experience: static, no preview of what components look like

### After (WebM Videos — This Implementation)

| Metric | Value |
|--------|-------|
| Video size per component | 200–400KB (WebM) |
| Videos loaded on page open | Only the ~6 visible in viewport |
| Videos loaded on full scroll | Progressive — one by one |
| Total bandwidth if all 13 videos viewed | ~3.5MB (one-time, then cached) |
| Repeat visit bandwidth | 0 bytes (browser cache, 1 year) |
| GPU usage | Only cards in viewport are playing |
| Layout shift | Zero — fixed aspect-ratio container |
| Fallback for no-video components | Placeholder icon, identical to current |
| Safari support | MP4 fallback via `<source>` tag |

### The Three Rules of LegitUI Video Cards

```
Rule 1: preload="metadata" — never "auto"
        "metadata" = downloads only the first frame (tiny)
        "auto" = downloads the whole file = kills page load speed

Rule 2: IntersectionObserver rootMargin: "200px"
        Start loading 200px before the card is visible.
        By the time the user sees the card, it's already playing.
        Without this, there's a visible delay as the video loads after scroll.

Rule 3: Always WebM first, MP4 second inside <source> tags.
        Chrome, Firefox, Edge: use WebM (~280KB)
        Safari: uses MP4 (~1.3MB)
        Never use a single src= attribute — it locks you to one format.
```

---

*LegitUI Preview Video Guide*
*public/PreviewVideos/ → WebM conversion → VideoCard component → Vercel deployment*
*Next.js 16 · VP9 WebM · IntersectionObserver · Vercel Edge Cache*
