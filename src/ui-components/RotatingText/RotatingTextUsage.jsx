"use client";
import React from "react";
import RotatingText from "./RotatingText";
const RotatingTextUsage = (props) => {
    return (<div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#000000",
            overflow: "hidden"
        }}>
      <RotatingText {...props}/>
    </div>);
};
export default RotatingTextUsage;
