"use client";
import React from "react";
import LiquidChromeParticles from "./LiquidChromeParticles";
export default function LiquidChromeParticlesUsage(props) {
    return (<div style={{
            position: "relative",
            width: "100%",
            minHeight: "100vh",
            overflow: "hidden",
            background: "#050505",
        }}>
      <LiquidChromeParticles particleCount={40000} baseColor="#05050a" highlightColor="#ffffff" glowColor="#6699ff" speed={0.3} particleSize={12.0} background="#050505" {...props}/>
    </div>);
}
