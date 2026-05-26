import React from "react";
import { SignpostNavigation } from "./SignpostNavigation";
import { Puzzle, Heart, Palette, BookOpen, Star } from "lucide-react";
export default function SignpostNavigationUsage() {
    const navigationItems = [
        {
            id: "hobbies",
            label: "Hobbies",
            href: "#hobbies",
            icon: <Puzzle size={20} strokeWidth={2.5}/>,
            color: "#00b4d8", // Blue
            rotation: -3,
            offset: "right",
            shape: "rounded",
        },
        {
            id: "passions",
            label: "PASSIONS",
            href: "#passions",
            icon: <Heart size={20} strokeWidth={2.5}/>,
            color: "#f25c54", // Orange/Red
            rotation: 2,
            offset: "left",
            shape: "rounded",
        },
        {
            id: "projects",
            label: "Projects",
            href: "#projects",
            icon: <Palette size={20} strokeWidth={2.5}/>,
            color: "#4ade80", // Green
            rotation: -1,
            offset: "right",
            shape: "rounded",
        },
        {
            id: "short-stories",
            label: "Short-Stories",
            href: "#short-stories",
            icon: <BookOpen size={20} strokeWidth={2.5}/>,
            color: "#a78bfa", // Purple
            rotation: 4,
            offset: "left",
            shape: "rounded",
        },
        {
            id: "austin-insights",
            label: "Austin Insights",
            href: "#austin-insights",
            icon: <Star size={20} strokeWidth={2.5}/>,
            color: "#facc15", // Yellow
            rotation: -2,
            offset: "right",
            shape: "rounded",
        },
    ];
    return (<div style={{ width: "100%", display: "flex", justifyContent: "center", background: "#f8f9fa", height: "100%", alignItems: "center" }}>
      <SignpostNavigation items={navigationItems}/>
    </div>);
}
;
