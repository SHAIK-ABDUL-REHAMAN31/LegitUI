"use client";

import React from "react";
import PhysicsText from "./PhysicsText";

const PhysicsTextUsage = (props: any) => {
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
            <PhysicsText 
                text={props.text || "Craft stunning interactive user interfaces with LegitUI"} 
                fontSize={props.fontSize || "clamp(1.5rem, 4vw, 2.5rem)"} 
                {...props}
            />
        </div>
    );
};

export default PhysicsTextUsage;
