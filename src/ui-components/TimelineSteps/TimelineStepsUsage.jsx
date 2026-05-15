"use client";
import React from "react";
import TimelineSteps from "./TimelineSteps";
import { Search, Copy, Terminal, Zap } from "lucide-react";
export default function TimelineStepsUsage() {
    const steps = [
        {
            id: "01",
            title: "Browse Components",
            desc: "Explore the library and find the exact component you need.",
            icon: <Search size={20}/>,
            align: "left"
        },
        {
            id: "02",
            title: "Copy the Code",
            desc: "Copy the raw source code directly into your project.",
            icon: <Copy size={20}/>,
            align: "right"
        },
        {
            id: "03",
            title: "Use CLI Commands",
            desc: "Or use our CLI to automatically install dependencies.",
            icon: <Terminal size={20}/>,
            align: "left"
        },
        {
            id: "04",
            title: "Build & Ship Faster",
            desc: "Focus on your product while we handle the UI complexity.",
            icon: <Zap size={20}/>,
            align: "right"
        }
    ];
    return (<div style={{ width: "100%", background: "#050505" }}>
        {/* Top Spacer */}
        <div style={{
            height: "80vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.5rem"
        }}>
            <span style={{
            color: "#666",
            fontSize: "0.75rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            fontFamily: "var(--font-geist-sans), sans-serif"
        }}>
                Scroll Down
            </span>
            <div style={{
            width: "1px",
            height: "60px",
            background: "linear-gradient(to bottom, #666, transparent)"
        }}/>
        </div>

        {/* The Component */}
        <TimelineSteps steps={steps}/>

        {/* Bottom Spacer */}
        <div style={{ height: "80vh" }}/>
    </div>);
}
