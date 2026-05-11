"use client";

import React from "react";
import FlipText from "./FlipText";

const FlipTextUsage = (props) => {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#000000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <FlipText text="3D FLIP ENTRANCE" {...props} />
    </div>
  );
};

export default FlipTextUsage;
