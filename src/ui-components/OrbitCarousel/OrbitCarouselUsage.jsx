"use client";
import React from "react";
import OrbitCarousel from "./OrbitCarousel";
export default function OrbitCarouselUsage(props) {
    return (<div className="w-full h-full min-h-[100px] bg-black">
      <OrbitCarousel radius={200} duration={20} cardWidth={110} cardHeight={145} {...props}/>
    </div>);
}
