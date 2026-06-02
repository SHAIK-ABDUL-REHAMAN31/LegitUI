"use client";

import React, { useState } from "react";
import CinematicText from "./CinematicText";

export const CinematicTextUsage = () => {
    const [text, setText] = useState("LegitUI");
    const [subtitle, setSubtitle] = useState("Open Source Component Library");
    const [activeColor, setActiveColor] = useState<string>("#ffffffff");
    const [inactiveColor, setInactiveColor] = useState<string>("#333333");
    const [fontSize, setFontSize] = useState<string>("clamp(3rem, 10vw, 9rem)");

    return (
        <div style={{ padding: "2rem", fontFamily: "sans-serif", backgroundColor: "#000000", color: "#fff", minHeight: "150vh" }}>


            <div style={{ height: "40vh", display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed #555", borderRadius: "8px", marginBottom: "2rem" }}>
                <p style={{ color: "white" }}>Scroll down to see the animation</p>
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
