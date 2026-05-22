"use client";

import React from "react";
import OrbitCarousel, { OrbitCarouselProps } from "./OrbitCarousel";

export default function OrbitCarouselUsage(props: Partial<OrbitCarouselProps>) {
  return (
    <div className="w-full h-full min-h-[100px] bg-black">
      <OrbitCarousel
        radius={200}
        duration={20}
        cardWidth={110}
        cardHeight={145}
        {...props}
      />
    </div>
  );
}
