"use client";

import React from "react";
import VioletArcBackground, { VioletArcBackgroundProps } from "./VioletArcBackground";

export default function VioletArcBackgroundUsage({
  children,
  ...props
}: VioletArcBackgroundProps) {
  return (
    <div style={{ position: "relative", width: "100%", minHeight: "100vh", overflow: "hidden" }}>
      <VioletArcBackground {...props}>
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
          }}
        >
          {/* Heading */}
          <h1
            style={{
              fontFamily: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              fontSize: "clamp(2.5rem, 7vw, 4.8rem)",
              fontWeight: 400,
              color: "#fff",
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              margin: 0,
              textShadow: "0 4px 60px rgba(139, 92, 246, 0.3)",
            }}
          >
            Comprehensive Payment
            <br />
            Infrastructure.
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
              color: "rgba(255, 255, 255, 0.7)",
              maxWidth: 600,
              marginTop: 18,
              lineHeight: 1.6,
              fontWeight: 300,
            }}
          >
            Enterprise-grade APIs and infrastructure for digital payments, powered by cutting-edge technology.
          </p>
        </div>
      </VioletArcBackground>
    </div>
  );
}
