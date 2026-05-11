"use client";

import React from "react";
import TextRoller from "./TextRoller";

const TextRollerUsage = (props: any) => {
  return (
    <div style={{
      width: "100%",
      height: "100%",
      minHeight: "500px",
      backgroundColor: "#000000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    }}>
      <TextRoller {...props} />
    </div>
  );
};

export default TextRollerUsage;
