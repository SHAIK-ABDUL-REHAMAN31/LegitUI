import React from 'react';
import ScrollGallery from './ScrollGallery';

const defaultImages = [
  { src: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", title: "Alpine" },
  { src: "https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", title: "Desert" },
  { src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", title: "Forest" },
  { src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", title: "Mountains" },
  { src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", title: "Beach" },
  { src: "https://images.unsplash.com/photo-1534447677768-be436bb09401?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", title: "Canyon" },
  { src: "https://images.unsplash.com/photo-1449844908441-8829872d2607?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", title: "City" },
  { src: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", title: "Waterfall" },
];

export default function ScrollGalleryUsage(props) {
  const showDemo = !!props.children;

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: '#ffffff', overflow: 'hidden' }}>
      {showDemo && (
        <div style={{
          position: 'absolute',
          top: '4%',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          zIndex: 100,
          pointerEvents: 'none'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '3rem',
            fontWeight: 800,
            color: '#111111',
            letterSpacing: '-0.02em',
            textTransform: 'uppercase'
          }}>
            Collection
          </h1>
          <p style={{
            margin: '10px 0 0 0',
            fontSize: '1.2rem',
            color: '#666666',
            fontWeight: 400
          }}>
            Scroll horizontally to explore our latest works
          </p>
        </div>
      )}

      <ScrollGallery
        images={defaultImages}
        backgroundColor="#ffffff"
        textColor="#111111"
        {...props}
      />
    </div>
  );
}
