'use client';

import React from 'react';
import PixelBackground from './PixelBackground';

export default function PixelBackgroundUsage(props: any) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", minHeight: "100vh", overflow: "hidden", background: "#000000" }}>
      {/* Background Component */}
      <PixelBackground
        className="absolute inset-0 w-full h-full"
        gridSpacing={props.gridSpacing ?? 16}
        dotSize={props.dotSize ?? 1.5}
        activeDotSize={props.activeDotSize ?? 3}
        interactionRadius={props.interactionRadius ?? 140}
        pushStrength={props.pushStrength ?? 0.15}
        springTension={props.springTension ?? 0.03}
        damping={props.damping ?? 0.60}
        noiseScale={props.noiseScale ?? 0.005}
        noiseSpeed={props.noiseSpeed ?? 0.002}
        enableTrail={props.enableTrail ?? false}
        hoverActiveRadius={props.hoverActiveRadius ?? 0}
        {...props}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 1.5rem",
            position: "relative",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          {/* Heading */}
          <h1
            style={{
              fontFamily: "var(--font-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              fontSize: "clamp(2rem, 5.5vw, 3.8rem)",
              fontWeight: 400,
              color: "#fff",
              letterSpacing: "-0.04em",
              lineHeight: 1.15,
              margin: 0,
              textShadow: "0 4px 60px rgba(139, 92, 246, 0.15)",
            }}
          >
            Distributed Network
            <br />
            Infrastructure.
          </h1>

        </div>
      </PixelBackground>
    </div>
  );
}

