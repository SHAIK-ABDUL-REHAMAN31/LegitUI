import React from "react";
import CinematicHoverGallery from "./CinematicHoverGallery";

const mockItems = [
  {
    id: 1,
    title: "Valkyrie Horizon",
    category: "Couture / Fashion",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop",
    description: "An high-fashion avant-garde study exploring industrial draping, monochromatic textile textures, and volumetric design."
  },
  {
    id: 2,
    title: "Brutalist Monolith",
    category: "Architecture / Spaces",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
    description: "Capturing concrete textures, mathematical shadows, and spatial geometry in a raw architectural framework."
  },
  {
    id: 3,
    title: "Nebula Synth v2",
    category: "Product / Industrial",
    image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=800&auto=format&fit=crop",
    description: "A futuristic modular sound design console constructed using glass panels and responsive ambient lighting controls."
  },
  {
    id: 4,
    title: "Aura Genesis",
    category: "Digital Art / Motion",
    image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop",
    description: "A generative algorithmic physics exploration mapping spatial color gradients and fluid vector velocities."
  },
  {
    id: 5,
    title: "Midnight Chrome",
    category: "Creative Direction",
    image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb96c?q=80&w=800&auto=format&fit=crop",
    description: "Refractive chrome, high-contrast typography grids, and editorial composition designed for high-end web experiences."
  }
];

export default function CinematicHoverGalleryUsage() {
  return (
    <div style={{ margin: 0, padding: 0, width: "100vw", minHeight: "100vh", background: "#030303" }}>
      <CinematicHoverGallery items={mockItems} />
    </div>
  );
}
