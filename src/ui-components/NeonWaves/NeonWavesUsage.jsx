import NeonWaves from './NeonWaves';

/* ─────────────────────────────────────────────────────────────────────
   USAGE EXAMPLES — Waves WebGL Ribbon Background
   Drop any of these into your page/layout.
───────────────────────────────────────────────────────────────────── */

/* ── 1. Default purple / pink / blue ───────────── */
export function DefaultWaves() {
    return (
        <NeonWaves>
            <div className="waves-hero">
                <h1>Neon Ribbon</h1>
                <p>WebGL · cursor interactive</p>
            </div>
        </NeonWaves>
    );
}

/* ── 2. Crimson / orange fire ribbon ──────────────────────────────── */
export function FireWaves() {
    return (
        <NeonWaves
            lineColor1="#FF4400"
            lineColor2="#FFD700"
            waveSpeed={0.70}
            backgroundColor="#1a0500"
        />
    );
}

/* ── 3. Cyan / teal ocean ribbon ──────────────────────────────────── */
export function OceanWaves() {
    return (
        <NeonWaves
            lineColor1="#00E5FF"
            lineColor2="#007A8A"
            waveSpeed={0.40}
            backgroundColor="#00090a"
        />
    );
}

/* ── 4. Subtle single ribbon (minimal / header use) ───────────────── */
export function MinimalWaves() {
    return (
        <NeonWaves
            lineColor1="#818CF8"
            lineColor2="#3730A3"
            waveSpeed={0.35}
            backgroundColor="#0a0a1a"
        />
    );
}

/* ── 5. All props reference ───────────────────────────────────────── */
export function FullPropsExample() {
    return (
        <NeonWaves
            /* ── Animation ────────────────────── */
            waveSpeed={0.55}      // overall animation speed

            /* ── Colour ───────────────────────── */
            lineColor1="#7EB8FF"   // mix color 1
            lineColor2="#7B2FBE"   // mix color 2
            backgroundColor="#000000" // background color

            /* ── Layout ───────────────────────── */
            className="my-bg"
            style={{ minHeight: '100vh' }}
        >
            {/* optional overlay content */}
            <div className="waves-hero">
                <h1>Your Title</h1>
                <p>Subtext here</p>
            </div>
        </NeonWaves>
    );
}