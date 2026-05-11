/**
 * UsageExample.jsx
 * ----------------
 * Demonstrates several ways to use the <MirrorCapsules /> component.
 *
 * Install Three.js first:
 *   npm install three
 *
 * Then drop MirrorCapsules.jsx + MirrorCapsules.css next to this file.
 */

import MirrorCapsule from './MirrorCapsule';

/* ── 1. Basic usage ────────────────────────────────────────────────── */
export function BasicExample() {
    return <MirrorCapsule />;
}

/* ── 2. Custom size ────────────────────────────────────────────────── */
export function CustomSizeExample() {
    return <MirrorCapsule width="800px" height="600px" />;
}

/* ── 3. Faster animation ───────────────────────────────────────────── */
export function FastExample() {
    return <MirrorCapsule speed={2.5} height="400px" />;
}

/* ── 4. Full-page hero section ─────────────────────────────────────── */
export function HeroExample() {
    return (
        <section
            style={{
                position: 'relative',
                width: '100%',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#000',
                overflow: 'hidden',
            }}
        >
            {/* Full-bleed Three.js background */}
            <MirrorCapsule
                width="100%"
                height="100vh"
                style={{ position: 'absolute', inset: 0 }}
            />

            {/* Overlay copy */}
            <div
                style={{
                    position: 'relative',
                    zIndex: 10,
                    textAlign: 'center',
                    color: '#fff',
                    fontFamily: 'system-ui, sans-serif',
                }}
            >
                <h1 style={{ fontSize: 'clamp(2rem, 6vw, 5rem)', fontWeight: 700, margin: 0 }}>
                    Mirror Capsules
                </h1>
                <p style={{ fontSize: '1.25rem', opacity: 0.6, marginTop: '0.5rem' }}>
                    Powered by Three.js
                </p>
            </div>
        </section>
    );
}

/* ── 5. Default export — combined demo page ────────────────────────── */
export default function App() {
    return (
        <div
            style={{
                minHeight: '100vh',
                background: '#0a0a0f',
                padding: '2rem',
                fontFamily: 'system-ui, sans-serif',
                color: '#fff',
            }}
        >
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>MirrorCapsules demo</h1>
            <p style={{ color: '#888', marginBottom: '2rem', fontSize: '0.9rem' }}>
                Drag the speed slider to change animation pace.
            </p>

            {/* Default */}
            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#555', marginBottom: '0.75rem' }}>
                    default
                </h2>
                <MirrorCapsule height="420px" />
            </section>

            {/* Compact */}
            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#555', marginBottom: '0.75rem' }}>
                    compact — 200px
                </h2>
                <MirrorCapsule height="200px" speed={0.6} />
            </section>

            {/* Fast */}
            <section>
                <h2 style={{ fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#555', marginBottom: '0.75rem' }}>
                    fast — speed × 3
                </h2>
                <MirrorCapsule height="280px" speed={3} />
            </section>
        </div>
    );
}