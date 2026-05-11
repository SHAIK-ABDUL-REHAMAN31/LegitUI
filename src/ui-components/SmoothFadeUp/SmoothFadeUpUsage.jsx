import SmoothFadeUp from "./SmoothFadeUp";

export default function SmoothFadeUpUsage() {
    return (
        <SmoothFadeUp
            heading="Elevate Your Experience"
            subheading="Crafted with precision. Designed for impact."
            description="A smooth, staggered fade‑in from below — the gold‑standard motion pattern used by the world's best landing pages to guide focus and build anticipation."
            badge="✦ Introducing"
            distance={60}
            duration={1}
            stagger={0.15}
            ease="power3.out"
            scrub={false}
        />
    );
}
