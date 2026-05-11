"use client";

import React from "react";
import GlitchText from "./GlitchText";

const GlitchTextUsage = (props: any) => {
    return (
        <div style={{
            width: "100%",
            height: "100vh",
            backgroundColor: "#050505",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            padding: "2rem"
        }}>
            <GlitchText 
                text={props.text || "CYBERPUNK"} 
                fontSize={props.fontSize || "clamp(3rem, 10vw, 8rem)"} 
                intensity={props.intensity || 1}
                {...props}
            />
        </div>
    );
};

export default GlitchTextUsage;
