"use client";

import React from "react";
import AliveGradient from "./AliveGradient";

export default function AliveGradientUsage(props) {
  // The PreviewClient wrapper passes `children` when the "Demo Content" toggle is ON.
  const showContent = !!props.children;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        overflow: "hidden",
        background: "#020205",
      }}
    >
      <AliveGradient
        background="#020205"
        color1="#ea580c"
        color2="#eab308"
        color3="#2563eb"
        color4="#ffffff"
        color5="#10b981"
        speed={0.35}
        intensity={1.0}
        distortion={0.4}
        glowSize={1.0}
        {...props}
      >
        {showContent && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              padding: "2rem",
            }}
          >
            <h1
              style={{
                fontSize: "clamp(2.5rem, 8vw, 6rem)",
                fontWeight: 900,
                color: "#ffffff",
                margin: 0,
                letterSpacing: "-0.05em",
                textShadow: "0 8px 48px rgba(0,0,0,0.9)",
                fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
                textAlign: "center",
                lineHeight: 1.05,
              }}
            >
              Alive Gradient
            </h1>
            <p
              style={{
                fontSize: "clamp(0.95rem, 2vw, 1.25rem)",
                color: "rgba(255, 255, 255, 0.75)",
                maxWidth: "640px",
                textAlign: "center",
                marginTop: "1.5rem",
                fontFamily: "'Inter', system-ui, sans-serif",
                lineHeight: 1.6,
                textShadow: "0 4px 24px rgba(0,0,0,0.9)",
              }}
            >
              A mesmerizing dual-stream WebGL energy field. Rich amber flames twist against cool blue cosmic plasma, creating a breathtaking organic, living backdrop.
            </p>
          </div>
        )}
      </AliveGradient>
    </div>
  );
}
