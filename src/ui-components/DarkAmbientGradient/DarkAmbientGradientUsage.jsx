"use client";
import React from "react";
import DarkAmbientGradient from "./DarkAmbientGradient";
export default function DarkAmbientGradientUsage(props) {
    // The PreviewClient wrapper passes `children` when the "Demo Content" toggle is ON.
    // We check if it exists to show our custom content.
    const showContent = !!props.children;
    return (<div style={{
            position: "relative",
            width: "100%",
            minHeight: "100vh",
            overflow: "hidden",
            background: "#010008",
        }}>
      <DarkAmbientGradient background="#010008" color1="#7c3aed" color2="#db2777" color3="#2563eb" color4="#06b6d4" speed={0.25} intensity={0.9} distortion={0.5} {...props}>
        {showContent && (<div style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
            }}>
            <h1 style={{
                fontSize: "clamp(3rem, 7vw, 5.5rem)",
                fontWeight: 800,
                color: "#ffffff",
                margin: 0,
                letterSpacing: "-0.04em",
                textShadow: "0 4px 60px rgba(0,0,0,0.8)",
                fontFamily: "'Inter', system-ui, sans-serif",
            }}>
              Cosmic Aurora
            </h1>
            <p style={{
                fontSize: "clamp(1rem, 1.5vw, 1.25rem)",
                color: "rgba(255, 255, 255, 0.7)",
                maxWidth: "600px",
                textAlign: "center",
                marginTop: "1.25rem",
                fontFamily: "'Inter', system-ui, sans-serif",
                lineHeight: 1.6,
                textShadow: "0 2px 20px rgba(0,0,0,0.8)",
            }}>
              Experience an ultra-premium cinematic dark ambient gradient. Flowing ribbons of vibrant energy drift through the endless void.
            </p>
          </div>)}
      </DarkAmbientGradient>
    </div>);
}
