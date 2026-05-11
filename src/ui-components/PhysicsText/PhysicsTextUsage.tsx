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
                text={props.text || "DRAG ME PLAYFUL GRAVITY BOUNCE"} 
                fontSize={props.fontSize || "clamp(2rem, 5vw, 6rem)"} 
                {...props}
            />
        </div>
    );
};

export default PhysicsTextUsage;
