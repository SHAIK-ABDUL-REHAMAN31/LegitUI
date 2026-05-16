"use client";

import React from "react";
import OrbitCarousel, { OrbitCarouselProps } from "./OrbitCarousel";

export default function OrbitCarouselUsage(props: Partial<OrbitCarouselProps>) {
  return (
    <div className="w-full h-full min-h-[600px] bg-black">
      <OrbitCarousel
        radius={240}
        duration={12}
        cardWidth={120}
        cardHeight={160}
        {...props}
      />
    </div>
  );
}
