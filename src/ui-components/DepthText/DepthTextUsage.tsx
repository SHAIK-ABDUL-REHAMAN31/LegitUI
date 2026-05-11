"use client";

import React from "react";
import DepthText from "./DepthText";

const DepthTextUsage = (props: any) => {
    return (
        <div style={{
            width: "100%",
            height: "100vh",
            backgroundColor: "#050505",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden"
        }}>
            <DepthText 
                text={props.text || "PARALLAX"} 
                textColor={props.textColor || "#ffffff"}
                shadowColor={props.shadowColor || "#6366f1"}
                {...props}
            />
        </div>
    );
};

export default DepthTextUsage;
