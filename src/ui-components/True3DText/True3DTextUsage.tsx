"use client";

import React from "react";
import True3DText from "./True3DText";

const True3DTextUsage = (props: any) => {
    return (
        <div style={{
            width: "100%",
            height: "100vh",
            backgroundColor: "#000000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden"
        }}>
            <True3DText
                text={props.text || "LEGIT"}
                color={props.color || "#e2e8f0"}
                glowIntensity={props.glowIntensity || 1.2}
                {...props}
            />
        </div>
    );
};

export default True3DTextUsage;
