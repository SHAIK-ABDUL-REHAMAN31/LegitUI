"use client";

import React from "react";
import { HoverRevealCard } from "./HoverRevealCard";

const HoverRevealCardUsage = (props: any) => {
  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#000000",
      overflow: "hidden"
    }}>
      <HoverRevealCard {...props} />
    </div>
  );
};

export default HoverRevealCardUsage;
