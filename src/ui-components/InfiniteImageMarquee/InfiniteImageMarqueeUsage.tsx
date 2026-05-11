import React from "react";
import InfiniteImageMarquee from "./InfiniteImageMarquee";

const images1 = [
  "https://images.unsplash.com/photo-1551244072-5d12893278ab?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=800&auto=format&fit=crop",
];

const images2 = [
  "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
];

const images3 = [
  "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551244072-5d12893278ab?q=80&w=800&auto=format&fit=crop",
];

const rows = [
  { images: images1, speed: 1 },
  { images: images2, speed: -1.2 },
  { images: images3, speed: 0.8 },
];

export default function InfiniteImageMarqueeUsage() {
  return (
    <div style={{ backgroundColor: "#050505", minHeight: "200vh" }}>
      <InfiniteImageMarquee rows={rows} />
      <div className="h-screen flex items-center justify-center text-white/50 font-mono text-sm uppercase tracking-widest">
        Scroll to interact with marquee velocity
      </div>
    </div>
  );
}
