'use client';

/**
 * SpaceNebulav1Usage.jsx
 * ----------------------
 * Demonstrates how to use the <SpaceNebulav1 /> component with interactive props
 * and demo content overlay.
 */

import React, { useState } from 'react';
import SpaceNebulav1 from './SpaceNebulav1';

/* ── 1. Interactive Demo Example ────────────────────────────────────── */
export function InteractiveDemo() {
  const [speed, setSpeed] = useState(1.0);
  const [warpAmp, setWarpAmp] = useState(1.0);
  const [color1, setColor1] = useState('#ffb4f0');
  const [color2, setColor2] = useState('#c8ffff');

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
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Background Component */}
      <SpaceNebulav1 
        speed={speed} 
        warpAmp={warpAmp} 
        color1={color1} 
        color2={color2} 
      />

      {/* Demo Content Overlay (Glassmorphism Card) */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '3rem',
          maxWidth: '500px',
          width: '90%',
          textAlign: 'center',
          color: '#fff',
          boxShadow: '0 30px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        <div 
          style={{ 
            display: 'inline-block',
            padding: '6px 16px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '999px',
            fontSize: '0.875rem',
            fontWeight: 500,
            letterSpacing: '0.05em',
            marginBottom: '1.5rem',
            border: '1px solid rgba(255,255,255,0.05)'
          }}
        >
          ✨ OGL POWERED
        </div>

        <h1 style={{ 
          fontSize: 'clamp(2rem, 5vw, 3.5rem)', 
          fontWeight: 700, 
          margin: '0 0 1rem 0',
          lineHeight: 1.1,
          background: `linear-gradient(to bottom right, ${color2}, ${color1})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Space Nebula
        </h1>
        
        <p style={{ 
          fontSize: '1.1rem', 
          opacity: 0.7, 
          marginBottom: '2.5rem',
          lineHeight: 1.6
        }}>
          A highly optimized volumetric nebula simulation. Experience organic plasma flows and twinkling stars.
        </p>

        {/* Controls */}
        <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: color1 }}>
                Time Dilation
              </span>
              <span style={{ fontSize: '0.875rem', fontFamily: 'monospace', opacity: 0.8 }}>
                {speed.toFixed(1)}x
              </span>
            </div>
            <input 
              type="range" 
              min="0.1" 
              max="4.0" 
              step="0.1" 
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: color1 }} 
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: color2 }}>
                Wave Amplitude
              </span>
              <span style={{ fontSize: '0.875rem', fontFamily: 'monospace', opacity: 0.8 }}>
                {warpAmp.toFixed(1)}
              </span>
            </div>
            <input 
              type="range" 
              min="0.0" 
              max="3.0" 
              step="0.1" 
              value={warpAmp}
              onChange={(e) => setWarpAmp(parseFloat(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: color2 }} 
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Flow Color</label>
              <input 
                type="color" 
                value={color1} 
                onChange={(e) => setColor1(e.target.value)}
                style={{ width: '100%', height: '36px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'transparent' }} 
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Accent Color</label>
              <input 
                type="color" 
                value={color2} 
                onChange={(e) => setColor2(e.target.value)}
                style={{ width: '100%', height: '36px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'transparent' }} 
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ── 2. Default export — combined demo page ────────────────────────── */
export default function App() {
  return <InteractiveDemo />;
}
