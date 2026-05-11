import React from "react";
import OrbitGallery from "./OrbitGallery";

const orbitData = [
  {
    radius: 140,
    speed: 0.3,
    stars: 3,
    nodes: [
      {
        id: "1",
        name: "Haseeb Arshad",
        role: "3D/2D Animator",
        image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop",
      },
      {
        id: "2",
        name: "Malick Murtaza",
        role: "CEO PRODIGI",
        image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
      },
    ],
  },
  {
    radius: 240,
    speed: -0.2,
    stars: 4,
    nodes: [
      {
        id: "3",
        name: "Syed Muhammad Haris",
        role: "CTO PRODIGI",
        image: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200&auto=format&fit=crop",
      },
      {
        id: "4",
        name: "Jameel",
        role: "UI/UX Designer",
        image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&auto=format&fit=crop",
      },
    ],
  },
  {
    radius: 340,
    speed: 0.15,
    stars: 6,
    nodes: [
      {
        id: "5",
        name: "Tuaha Athar",
        role: "Web Developer",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
      },
      {
        id: "6",
        name: "SaifUllah Mushtaq",
        role: "Web Developer",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop",
      },
      {
        id: "7",
        name: "Sarah Jane",
        role: "Product Manager",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
      },
    ],
  },
];

export default function OrbitGalleryUsage() {
  return <OrbitGallery rings={orbitData} />;
}
