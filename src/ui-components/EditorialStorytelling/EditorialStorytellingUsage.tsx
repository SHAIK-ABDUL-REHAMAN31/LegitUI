import React from "react";
import EditorialStorytelling from "./EditorialStorytelling";

const chapters = [
  {
    title: "Origins of Silence",
    description: "Deep within the atmospheric layers, true beauty resides in the absence of noise. Every gradient tells a story of forgotten space, woven through time.",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=3000&auto=format&fit=crop"
  },
  {
    title: "The Velocity of Light",
    description: "When movement becomes so fast it appears still. The kinetic energy bounds through these realms, capturing moments that ordinary eyes miss.",
    image: "https://images.unsplash.com/photo-1551244072-5d12893278ab?q=80&w=3000&auto=format&fit=crop"
  },
  {
    title: "Echoes in Dust",
    description: "A final lingering whisper of a dying star. Editorial luxury meets deep cosmic solitude, crafting a narrative that stands the test of infinity.",
    image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=3000&auto=format&fit=crop"
  }
];

export default function EditorialStorytellingUsage() {
  return (
    <div style={{ backgroundColor: "#000" }}>
      <div className="h-screen flex items-center justify-center text-white/50 font-mono text-sm uppercase tracking-widest bg-black">
        Scroll Down
      </div>
      <EditorialStorytelling chapters={chapters} />
      <div className="h-screen flex items-center justify-center text-white/50 font-mono text-sm uppercase tracking-widest bg-black">
        Keep Scrolling
      </div>
    </div>
  );
}
