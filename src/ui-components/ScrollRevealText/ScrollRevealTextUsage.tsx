"use client";

import React from "react";
import ScrollRevealText from "./ScrollRevealText";

const ScrollRevealTextUsage = (props: any) => {
  return (
    <div style={{
      width: "100%",
      backgroundColor: "#000000",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      overflowX: "hidden",
    }}>
      <div style={{ 
        height: "100vh", 
        width: "100%",
        display: "flex", 
        flexDirection: "column",
        alignItems: "center", 
        justifyContent: "center", 
        color: "#6b7280",
        fontFamily: "system-ui, sans-serif"
      }}>
        <div style={{ marginBottom: "1rem" }}>Scroll Down</div>
        <div style={{ height: "40px", width: "1px", background: "linear-gradient(to bottom, #6b7280, transparent)" }}></div>
      </div>
      
      <ScrollRevealText {...props} />
      
      <div style={{ height: "100vh" }} />
    </div>
  );
};

export default ScrollRevealTextUsage;
