"use client";
import React from "react";
import SilkGradient from "./SilkGradient";
export default function SilkGradientUsage(props) {
    return (<div style={{
            position: "relative",
            width: "100%",
            minHeight: "100vh",
            overflow: "hidden",
            background: "#020617",
        }}>
      <SilkGradient background="#020617" colorTop="#1e40af" colorBottom="#0c4a6e" colorAccent="#38bdf8" speed={0.35} intensity={0.9} spread={0.65} {...props}/>
    </div>);
}
