"use client";

import React from "react";
import LiquidWaveText from "./LiquidText";

const LiquidTextUsage = (props) => {
    return (
        <div style={{
            width: "100%",
            minHeight: "100vh",
            backgroundColor: "#000000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <LiquidWaveText {...props} />
        </div>
    );
};

export default LiquidTextUsage;
