import React from "react";
import CursorImageTrail from "./CursorImageTrail";
const images = [
    "https://images.unsplash.com/photo-1551244072-5d12893278ab?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=400&auto=format&fit=crop",
];
export default function CursorImageTrailUsage() {
    return (<div style={{ width: "100%", height: "100vh", backgroundColor: "#f5f5f5" }}>
      <CursorImageTrail images={images} renderCount={15}>
        <div style={{ textAlign: "center", pointerEvents: "none" }}>
          <p style={{
            fontSize: "0.85rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#333",
            marginBottom: "1rem",
            fontWeight: 500,
        }}>
            Grid Builder
          </p>
          <h1 style={{
            fontSize: "12vw",
            fontWeight: 400,
            textTransform: "uppercase",
            lineHeight: 0.85,
            color: "#111",
            margin: 0,
            letterSpacing: "-0.04em",
        }}>
            How <span style={{ marginLeft: "10vw" }}>This</span>
            <br />
            <span style={{ marginLeft: "15vw" }}>Works</span>
            <br />
            Is <span style={{ color: "#aaa", fontWeight: 300 }}>Easy</span>
          </h1>
        </div>
      </CursorImageTrail>
    </div>);
}
