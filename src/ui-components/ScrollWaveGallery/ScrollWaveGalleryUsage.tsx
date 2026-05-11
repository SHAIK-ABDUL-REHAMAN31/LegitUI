"use client";

import React from "react";
import ScrollWaveGallery from "./ScrollWaveGallery";

const ScrollWaveGalleryUsage = (props: any) => {
    return (
        <div style={{ width: "100%", backgroundColor: "#050505", color: "#ffffff" }}>
            <ScrollWaveGallery 
                loops={props.loops || 3}
                waveAmplitude={props.waveAmplitude || 25}
                {...props}
            />
        </div>
    );
};

export default ScrollWaveGalleryUsage;
