'use client';

import React from 'react';
import GreenWaveRibbons from './GreenWaveRibbons.jsx';

export default function GreenWaveRibbonsUsage(props) {
    // LegitUI preview wrapper passes children when "Demo Content" toggle is ON.
    // We intercept this to show our own custom positioned text instead of the default centered text.
    const showDemo = !!props.children;

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', backgroundColor: '#000' }}>
            {/* Background Component */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
                {/* Pass null to children so the inner component doesn't render the default LegitUI text */}
                <GreenWaveRibbons {...props} children={null} />
            </div>

            {/* Custom Foreground Content - Positioned close to upside */}
            {showDemo && (
                <div style={{ 
                    position: 'absolute', 
                    top: '15%', // Shifted to the upside, not in the middle
                    left: 0,
                    width: '100%',
                    zIndex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    color: 'white', 
                    fontFamily: 'system-ui, sans-serif',
                    pointerEvents: 'none',
                    textAlign: 'center',
                    padding: '0 2rem'
                }}>
                    <h1 style={{ 
                        fontSize: 'clamp(2rem, 5vw, 4rem)', 
                        fontWeight: 800, 
                        margin: '0 0 1rem 0', 
                        letterSpacing: '-0.02em', 
                        textShadow: '0 4px 20px rgba(0,0,0,0.5)'
                    }}>
                        Green Wave Ribbons
                    </h1>
                    <p style={{ 
                        fontSize: '1.2rem', 
                        color: 'rgba(255, 255, 255, 0.7)', 
                        margin: 0, 
                        maxWidth: '600px', 
                        lineHeight: 1.6,
                        textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                    }}>
                        An immersive 3D ribbon terrain using WebGL. Fully customizable colors, height, and animation speed.
                    </p>
                </div>
            )}
        </div>
    );
}
