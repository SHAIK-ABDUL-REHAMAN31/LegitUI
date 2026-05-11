import React from "react";
import CurvedTypographyGallery from "./CurvedTypographyGallery";

export default function CurvedTypographyGalleryUsage() {
  return (
    <div style={{ backgroundColor: "black", minHeight: "100vh" }}>
      <div style={{ 
        height: "100vh", 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center", 
        color: "rgba(255, 255, 255, 0.5)", 
        fontFamily: "monospace", 
        fontSize: "0.875rem", 
        textTransform: "uppercase", 
        letterSpacing: "0.1em",
        gap: "1rem"
      }}>
        <span>Scroll Down</span>
        <div style={{ width: "1px", height: "3rem", backgroundColor: "rgba(255, 255, 255, 0.2)" }} />
      </div>
      
      <CurvedTypographyGallery />
      
      <div style={{ 
        height: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        color: "rgba(255, 255, 255, 0.5)", 
        fontFamily: "monospace", 
        fontSize: "0.875rem", 
        textTransform: "uppercase", 
        letterSpacing: "0.1em" 
      }}>
        Keep Scrolling
      </div>
    </div>
  );
}
