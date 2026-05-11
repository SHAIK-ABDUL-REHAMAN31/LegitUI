"use client";
import React, { useState } from "react";
import MagneticDock from "./MagneticDock";
import { Home, User, Settings, Mail, Search } from "lucide-react";
export default function MagneticDockUsage() {
    const [active, setActive] = useState("Home");
    const items = [
        {
            icon: <Home size={24}/>,
            label: "Home",
            onClick: () => setActive("Home"),
        },
        {
            icon: <User size={24}/>,
            label: "Profile",
            onClick: () => setActive("Profile"),
        },
        {
            icon: <Search size={24}/>,
            label: "Search",
            onClick: () => setActive("Search"),
        },
        {
            icon: <Mail size={24}/>,
            label: "Messages",
            onClick: () => setActive("Messages"),
        },
        {
            icon: <Settings size={24}/>,
            label: "Settings",
            onClick: () => setActive("Settings"),
        },
    ];
    return (<div style={{ position: "relative", width: "100%", height: "400px", background: "#050505", borderRadius: "12px", overflow: "hidden" }}>
      {/* Background decoration */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", color: "white", fontFamily: "sans-serif" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 600, margin: 0, opacity: 0.8 }}>Magnetic Dock</h2>
        <p style={{ marginTop: "12px", opacity: 0.5, maxWidth: "400px" }}>Hover over the icons below to see the magnetic interactions, proximity scaling, and glassmorphism styling in action.</p>
      </div>
      
      {/* Dock Component */}
      <MagneticDock items={items} activeItem={active}/>
    </div>);
}
