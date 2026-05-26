import React from 'react';
import ExpandableProductCards from './ExpandableProductCards';

export const ExpandableProductCardsUsage = () => {
  const products = [
    {
      id: "nike-air",
      title: "Nike Air Max",
      subtitle: "Running Collection",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop",
      color: "#d93b3b",
      price: "$129.99"
    },
    {
      id: "sony-alpha",
      title: "Sony Alpha",
      subtitle: "Mirrorless Camera",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop",
      color: "#2b2b2b",
      price: "$999.00"
    },
    {
      id: "minimal-watch",
      title: "Minimal Watch",
      subtitle: "Timeless Design",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop",
      color: "#e2e2e2",
      price: "$199.50"
    },
    {
      id: "beats-studio",
      title: "Beats Studio",
      subtitle: "Wireless Audio",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop",
      color: "#172a3a",
      price: "$349.00"
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <ExpandableProductCards products={products} imageType="cover" defaultExpandedIndex={0} />
    </div>
  );
};

export default ExpandableProductCardsUsage;
