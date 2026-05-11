"use client";

import React, { useState } from "react";
import CinematicText from "./CinematicText";

export const CinematicTextUsage = () => {
    const [text, setText] = useState("LegitUI");
    const [subtitle, setSubtitle] = useState("Open Source Component Library");
    const [activeColor, setActiveColor] = useState("#000000ff");
    const [inactiveColor, setInactiveColor] = useState("#1a1a2e");
    const [fontSize, setFontSize] = useState("clamp(3rem, 10vw, 9rem)");

    return (
        <div style={{ padding: "2rem", fontFamily: "sans-serif", backgroundColor: "#ffffffff", color: "#fff", minHeight: "150vh" }}>


            <div style={{ height: "40vh", display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed #333", borderRadius: "8px", marginBottom: "2rem" }}>
                <p style={{ color: "black" }}>Scroll down to see the animation</p>
            </div>

            <CinematicText
                text={text}
                subtitle={subtitle}
                activeColor={activeColor}
                inactiveColor={inactiveColor}
                fontSize={fontSize}
            />
        </div>
    );
};

export default CinematicTextUsage;
