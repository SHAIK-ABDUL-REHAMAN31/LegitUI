"use client";

import React from "react";
import { MagneticHoverText } from "./MagneticHoverText";

const MagneticHoverTextUsage = (props: any) => {
  return (
    <div style={{
      width: "100%",
      minHeight: "400px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#000000",
      overflow: "hidden"
    }}>
      <MagneticHoverText {...props} />
    </div>
  );
};

export default MagneticHoverTextUsage;
