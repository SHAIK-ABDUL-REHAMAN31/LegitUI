"use client";

import React from "react";
import HyperspeedLightTunnel, { HyperspeedLightTunnelProps } from "./HyperspeedLightTunnel";

export default function HyperspeedLightTunnelUsage(props: Partial<HyperspeedLightTunnelProps>) {
  // Use props.children to dictate whether to show custom demo content
  const showContent = !!props.children;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        overflow: "hidden",
        background: "#05000a",
      }}
    >
      <HyperspeedLightTunnel
        background="#05000a"
        coreColor="#ffaa00"
        streakColor1="#ff007f"
        streakColor2="#7000ff"
        streakColor3="#00f0ff"
        speed={1.5}
        density={30.0}
        curve={1.5}
        {...props}
      >
        {showContent && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              paddingLeft: "10%",
              pointerEvents: "none",
            }}
          >
            <h1
              style={{
                fontSize: "clamp(3rem, 7vw, 6rem)",
                fontWeight: 800,
                color: "#ffffff",
                margin: 0,
                letterSpacing: "-0.04em",
                textShadow: "0 4px 60px rgba(0,0,0,0.8)",
                fontFamily: "'Inter', system-ui, sans-serif",
                lineHeight: 1,
              }}
            >
              Warp<br />Speed
            </h1>
            <p
              style={{
                fontSize: "clamp(1rem, 1.5vw, 1.25rem)",
                color: "rgba(255, 255, 255, 0.7)",
                maxWidth: "500px",
                marginTop: "1.5rem",
                fontFamily: "'Inter', system-ui, sans-serif",
                lineHeight: 1.6,
                textShadow: "0 2px 20px rgba(0,0,0,0.8)",
              }}
            >
              A high-performance OGL hyperspeed light tunnel. Cinematic energy streaks converging to a focal point.
            </p>
          </div>
        )}
      </HyperspeedLightTunnel>
    </div>
  );
}
