"use client";
import React from "react";
import SlideUpText from "./SlideUpText";
const SlideUpTextUsage = (props) => {
    return (<div style={{
            width: "100%",
            minHeight: "100vh",
            backgroundColor: "#000000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
        }}>
      <SlideUpText {...props}/>
    </div>);
};
export default SlideUpTextUsage;
