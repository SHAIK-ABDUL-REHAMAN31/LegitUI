"use client";

import React from "react";
import SpinningSpiral from "./SpinningSpiral";

export default function SpinningSpiralUsage(props: any) {
    return (
        <div style={{
            position: "relative",
            width: "100%",
            height: "200vh", // Creates scroll space for scroll-linked zoom
            backgroundColor: "#0a0a0f",
            backgroundImage: "radial-gradient(circle at center, rgba(255,255,255,0.015) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            overflowX: "hidden",
        }}>
            {/* Centered frame fixed to viewport */}
            <div style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                zIndex: 1,
            }}>
                <div style={{ pointerEvents: "auto" }}>
                    <SpinningSpiral {...props} />
                </div>
            </div>
            
            {/* Soft hint text to tell users to scroll */}
            <div style={{
                position: "fixed",
                bottom: "2rem",
                left: "50%",
                transform: "translateX(-50%)",
                color: "rgba(255, 255, 255, 0.4)",
                fontSize: "0.85rem",
                fontWeight: 500,
                letterSpacing: "0.05em",
                pointerEvents: "none",
                zIndex: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem"
            }}>
                <span>SCROLL DOWN TO ZOOM</span>
                <span style={{ fontSize: "1rem" }}>↓</span>
            </div>
        </div>
    );
}
