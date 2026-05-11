import React from 'react';
import Gallery3D from './3DGallery';

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

export default function Gallery3DUsage(props) {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Gallery3D 
        images={defaultImages} 
        {...props}
      />
    </div>
  );
}
