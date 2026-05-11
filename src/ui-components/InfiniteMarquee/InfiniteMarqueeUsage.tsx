"use client";

import React from "react";
import InfiniteMarquee from "./InfiniteMarquee";

const InfiniteMarqueeUsage = (props: any) => {
  return (
    <div style={{
      width: "100%",
      minHeight: "150vh", // Extra height to allow scrolling for the scroll-linked speed effect
      backgroundColor: "#000000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflowX: "hidden",
      position: "relative"
    }}>
      <div style={{
        position: "absolute",
        top: "2rem",
        width: "100%",
        textAlign: "center",
        color: "#6b7280",
        fontFamily: "system-ui, sans-serif",
        fontSize: "0.9rem"
      }}>
        Scroll up and down to see the scroll-linked parallax velocity effect!
      </div>
      <InfiniteMarquee {...props} />
    </div>
  );
};

export default InfiniteMarqueeUsage;
