'use client';

import React from 'react';
import BlackHole from './BlackHole';

export default function BlackHoleUsage(props) {
    // LegitUI preview wrapper passes children when "Demo Content" toggle is ON.
    const showDemo = !!props.children;

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', backgroundColor: '#000' }}>
            {/* Background Component */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
                {/* Pass null to children so the inner component doesn't render the default LegitUI text */}
                <BlackHole {...props} children={null} />
            </div>

            {/* Custom Foreground Content - Positioned in the bottom corners */}
            {showDemo && (
                <>
                    {/* Bottom Left Corner - Title and Description */}
                    <div style={{
                        position: 'absolute',
                        bottom: '2rem',
                        left: '2rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        color: 'white',
                        fontFamily: 'system-ui, sans-serif',
                        pointerEvents: 'none',
                        zIndex: 1,
                        maxWidth: '500px'
                    }}>
                        <h1 style={{ 
                            fontSize: 'clamp(2rem, 4vw, 3.5rem)', 
                            fontWeight: 800, 
                            margin: '0 0 0.5rem 0', 
                            letterSpacing: '-0.03em', 
                            textShadow: '0 4px 30px rgba(0,0,0,0.8)'
                        }}>
                            Cinematic Black Hole
                        </h1>
                        <p style={{ 
                            fontSize: '1rem', 
                            color: 'rgba(255, 255, 255, 0.7)', 
                            margin: 0, 
                            lineHeight: 1.6,
                            textShadow: '0 2px 10px rgba(0,0,0,0.8)'
                        }}>
                            A breathtaking, high-performance WebGL black hole simulation using React Three Fiber.
                        </p>
                    </div>

                    {/* Bottom Right Corner - Action Buttons */}
                    <div style={{
                        position: 'absolute',
                        bottom: '2rem',
                        right: '2rem',
                        display: 'flex',
                        gap: '1rem',
                        zIndex: 1,
                        fontFamily: 'system-ui, sans-serif',
                    }}>
                        <button style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: 'white',
                            color: 'black',
                            border: 'none',
                            borderRadius: '9999px',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            pointerEvents: 'auto',
                            boxShadow: '0 4px 20px rgba(255,255,255,0.2)',
                            transition: 'transform 0.2s, box-shadow 0.2s'
                        }}>
                            Get Started
                        </button>
                        <button style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '9999px',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            pointerEvents: 'auto',
                            backdropFilter: 'blur(10px)',
                            transition: 'background-color 0.2s'
                        }}>
                            Read More
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
