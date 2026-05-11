"use client";
import React from "react";
import TextMorph from "./TextMorph";
const TextMorphUsage = (props) => {
    return (<div style={{
            width: "100%",
            minHeight: "100vh",
            backgroundColor: "#000000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden"
        }}>
      <TextMorph {...props}/>
    </div>);
};
export default TextMorphUsage;
