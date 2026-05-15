// ════════════════════════════════════════════════════
// LegitUI — Preview Map (slug → dynamic import + weight)
// ════════════════════════════════════════════════════
// Maps every component slug to a dynamic import and weight metadata.
// Weight determines loading strategy and prefetch priority.
//
// Weights:
//   light   — Pure CSS/JS, no heavy deps. Loads instantly.
//   medium  — GSAP or Framer Motion. Loads in 1–2 seconds.
//   heavy   — Three.js, OGL, or R3F. Loads in 2–4 seconds.
//   extreme — R3F + postprocessing, physics, or multiple heavy deps.
// ════════════════════════════════════════════════════

export type ComponentWeight = 'light' | 'medium' | 'heavy' | 'extreme';

export interface PreviewEntry {
  load: () => Promise<{ default: React.ComponentType<any> }>;
  weight: ComponentWeight;
}

export const PREVIEW_MAP: Record<string, PreviewEntry> = {
  // ── LIGHT — Pure CSS/JS, no heavy deps ──
  'shimmer-button':       { load: () => import('@/ui-components/ShimmerButton/ShimmerButtonUsage'),       weight: 'light' },
  'glow-card':            { load: () => import('@/ui-components/GlowCard/GlowCardUsage'),                weight: 'light' },
  'pulse-loader':         { load: () => import('@/ui-components/PulseLoader/PulseLoaderUsage'),           weight: 'light' },
  'typewriter-text':      { load: () => import('@/ui-components/TypewriterText/TypewriterTextUsage'),     weight: 'light' },
  'animated-border':      { load: () => import('@/ui-components/AnimatedBorder/AnimatedBorderUsage'),     weight: 'light' },
  'floating-input':       { load: () => import('@/ui-components/FloatingInput/FloatingInputUsage'),       weight: 'light' },
  'spotlight-card':       { load: () => import('@/ui-components/SpotlightCard/SpotlightCardUsage'),       weight: 'light' },
  'skeleton-loader':      { load: () => import('@/ui-components/SkeletonLoader/SkeletonLoaderUsage'),     weight: 'light' },
  'ripple-button':        { load: () => import('@/ui-components/RippleButton/RippleButton'),              weight: 'light' },
  'magnetic-button':      { load: () => import('@/ui-components/MagneticButton/MagneticButton'),          weight: 'light' },
  'premium-bank-card':    { load: () => import('@/ui-components/PremiumBankCard/PremiumBankCardUsage'),   weight: 'light' },
  'typewriter-text-new':  { load: () => import('@/ui-components/TypewriterText/TypewriterTextUsage'),     weight: 'light' },
  'hover-reveal-card':    { load: () => import('@/ui-components/HoverRevealCard/HoverRevealCardUsage'),   weight: 'light' },

  // ── MEDIUM — GSAP or Framer Motion ──
  'aurora-background':       { load: () => import('@/ui-components/AuroraBackground/AuroraBackgroundUsage'),   weight: 'medium' },
  'text-reveal':             { load: () => import('@/ui-components/TextReveal/TextRevealUsage'),               weight: 'medium' },
  'smooth-fade-up':          { load: () => import('@/ui-components/SmoothFadeUp/SmoothFadeUpUsage'),           weight: 'medium' },
  'cinematic-text':          { load: () => import('@/ui-components/CinematicText/CinematicTextUsage'),         weight: 'medium' },
  'scale-blur':              { load: () => import('@/ui-components/ScaleBlur/ScaleBlurUsage'),                 weight: 'medium' },
  'staggered-word-slide':    { load: () => import('@/ui-components/StaggeredWordSlide/StaggeredWordSlideUsage'), weight: 'medium' },
  'typing-cursor':           { load: () => import('@/ui-components/TypingCursor/TypingCursorUsage'),           weight: 'medium' },
  'pixelify-text':           { load: () => import('@/ui-components/PixelifyText/PixelifyUsage'),               weight: 'medium' },
  'numbers-count':           { load: () => import('@/ui-components/NumbersCount/NumbersCountUsage'),           weight: 'medium' },
  'animated-gradient-text':  { load: () => import('@/ui-components/AnimatedGradient/AnimatedGradientUsage'),   weight: 'medium' },
  'liquid-wave-text':        { load: () => import('@/ui-components/LiquidText/LiquidTextUsage'),               weight: 'medium' },
  'flip-text':               { load: () => import('@/ui-components/FlipText/FlipTextUsage'),                   weight: 'medium' },
  'infinite-marquee':        { load: () => import('@/ui-components/InfiniteMarquee/InfiniteMarqueeUsage'),     weight: 'medium' },
  'text-morph':              { load: () => import('@/ui-components/TextMorph/TextMorphUsage'),                 weight: 'medium' },
  'scroll-reveal-text':      { load: () => import('@/ui-components/ScrollRevealText/ScrollRevealTextUsage'),   weight: 'medium' },
  'slide-up-text':           { load: () => import('@/ui-components/SlideUpText/SlideUpTextUsage'),             weight: 'medium' },
  'text-roller':             { load: () => import('@/ui-components/TextRoller/TextRollerUsage'),               weight: 'medium' },
  'magnetic-hover-text':     { load: () => import('@/ui-components/MagneticHoverText/MagneticHoverTextUsage'), weight: 'medium' },
  'rotating-text':           { load: () => import('@/ui-components/RotatingText/RotatingTextUsage'),           weight: 'medium' },
  'glitch-text':             { load: () => import('@/ui-components/GlitchText/GlitchTextUsage'),               weight: 'medium' },
  'kinetic-split-text':      { load: () => import('@/ui-components/KineticSplitText/KineticSplitTextUsage'),   weight: 'medium' },
  'shine-text':              { load: () => import('@/ui-components/ShineText/ShineTextUsage'),                 weight: 'medium' },
  'magnetic-dock':           { load: () => import('@/ui-components/MagneticDock/MagneticDockUsage'),           weight: 'medium' },
  'stacked-card-reveal':     { load: () => import('@/ui-components/StackedCardReveal/StackedCardRevealUsage'), weight: 'medium' },
  'network-nodes':           { load: () => import('@/ui-components/NetworkNodes/NetworkNodesUsage'),           weight: 'medium' },
  'horizon-gradient':        { load: () => import('@/ui-components/HorizonGradient/HorizonGradientUsage'),     weight: 'medium' },
  'timeline-steps':          { load: () => import('@/ui-components/TimelineSteps/TimelineStepsUsage'),         weight: 'medium' },

  // ── HEAVY — OGL / Three.js ──
  'particles-background':    { load: () => import('@/ui-components/Particles/SpaceParticles'),                       weight: 'heavy' },
  'neon-waves':              { load: () => import('@/ui-components/NeonWaves/NeonWaves'),                             weight: 'heavy' },
  'fractal-haze':            { load: () => import('@/ui-components/FractalHaze/FractalHaze'),                         weight: 'heavy' },
  'liquid-nebula':           { load: () => import('@/ui-components/LiquidNebula/LiquidNebula'),                       weight: 'heavy' },
  'space-nebula-v1':         { load: () => import('@/ui-components/SpaceNebulav1/SpaceNebulav1'),                     weight: 'heavy' },
  'space-nebula-v2':         { load: () => import('@/ui-components/SpaceNebulaV2/SpaceNebulaV2'),                     weight: 'heavy' },
  'green-wave-ribbons':      { load: () => import('@/ui-components/GreenWaveRibbons/GreenWaveRibbonsUsage'),           weight: 'heavy' },
  'ascii-text':              { load: () => import('@/ui-components/AsciiText/AsciiTextUsage'),                         weight: 'heavy' },
  'depth-text':              { load: () => import('@/ui-components/DepthText/DepthTextUsage'),                         weight: 'heavy' },
  'physics-text':            { load: () => import('@/ui-components/PhysicsText/PhysicsTextUsage'),                     weight: 'heavy' },
  'curved-typography':       { load: () => import('@/ui-components/CurvedTypography/CurvedTypographyUsage'),           weight: 'heavy' },
  'ascii-motion-text':       { load: () => import('@/ui-components/AsciiMotionText/AsciiMotionTextUsage'),             weight: 'heavy' },
  'cinematic-scroll':        { load: () => import('@/ui-components/CinematicScroll/CinematicScrollUsage'),             weight: 'heavy' },
  'editorial-storytelling':  { load: () => import('@/ui-components/EditorialStorytelling/EditorialStorytellingUsage'), weight: 'heavy' },
  'cursor-image-trail':      { load: () => import('@/ui-components/CursorImageTrail/CursorImageTrailUsage'),           weight: 'heavy' },
  'infinite-image-marquee':  { load: () => import('@/ui-components/InfiniteImageMarquee/InfiniteImageMarqueeUsage'),   weight: 'heavy' },

  // ── EXTREME — R3F + postprocessing / multiple heavy deps ──
  'mirror-capsules':              { load: () => import('@/ui-components/MirrorCapsules/MirrorCapsule'),                               weight: 'extreme' },
  'cinematic-black-hole':         { load: () => import('@/ui-components/BlackHole/BlackHoleUsage'),                                   weight: 'extreme' },
  '3d-gallery':                   { load: () => import('@/ui-components/3DGallery/3DGalleryUsage'),                                   weight: 'extreme' },
  'scroll-gallery':               { load: () => import('@/ui-components/ScrollGallery/ScrollGalleryUsage'),                           weight: 'extreme' },
  'true-3d-text':                 { load: () => import('@/ui-components/True3DText/True3DTextUsage'),                                 weight: 'extreme' },
  'scroll-wave-gallery':          { load: () => import('@/ui-components/ScrollWaveGallery/ScrollWaveGalleryUsage'),                   weight: 'extreme' },
  'curved-typography-gallery':    { load: () => import('@/ui-components/CurvedTypographyGallery/CurvedTypographyGalleryUsage'),       weight: 'extreme' },
  'orbit-gallery':                { load: () => import('@/ui-components/OrbitGallery/OrbitGalleryUsage'),                             weight: 'extreme' },
};

export type ComponentSlug = keyof typeof PREVIEW_MAP;
