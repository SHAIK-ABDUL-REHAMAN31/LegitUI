"use client";
import React from "react";
import SwipeableCardStack from "./SwipeableCardStack";
export default function SwipeableCardStackUsage(props) {
    return (<div style={{
            position: "relative",
            width: "100%",
            minHeight: "100vh",
            backgroundColor: "#060608",
            backgroundImage: "radial-gradient(circle at center, rgba(255,255,255,0.015) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            overflow: "hidden",
        }}>
            {/* Component mounting */}
            <SwipeableCardStack cardWidth={240} cardHeight={340} {...props}/>
        </div>);
}
