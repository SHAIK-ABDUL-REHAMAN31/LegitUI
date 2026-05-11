"use client";

import React from "react";
import AsciiText from "./AsciiText";

const AsciiTextUsage = (props: any) => {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <AsciiText text="ASCII" {...props} />
    </div>
  );
};

export default AsciiTextUsage;
