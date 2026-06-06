"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./ExpandableProductCards.module.css";

export interface ProductCard {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  color?: string;
  price: string;
}

export interface ExpandableProductCardsProps {
  products: ProductCard[];
  className?: string;
  imageType?: "cover" | "contain";
  defaultExpandedIndex?: number;
}

export const ExpandableProductCards: React.FC<ExpandableProductCardsProps> = ({
  products,
  className = "",
  imageType = "cover",
  defaultExpandedIndex = products.length - 1
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(defaultExpandedIndex);

  return (
    <div 
      className={`${styles.container} ${className}`}
      onMouseLeave={() => setHoveredIndex(defaultExpandedIndex)}
    >
      {products.map((product, index) => {
        const isHovered = hoveredIndex === index;
        return (
          <motion.div
            key={product.id}
            className={styles.card}
            style={{ backgroundColor: product.color || "#333" }}
            onMouseEnter={() => setHoveredIndex(index)}
            layout
            initial={{ flex: index === defaultExpandedIndex ? 6 : 1 }}
            animate={{ flex: isHovered ? 6 : 1 }}
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
          >
            {/* The image */}
            <motion.div
              className={styles.imageContainer}
              animate={{ 
                scale: isHovered ? 1.05 : 1,
              }}
              transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            >
              <img 
                 src={product.image} 
                 alt={product.title} 
                 className={imageType === "cover" ? styles.productImageCover : styles.productImageContain} 
              />
              <div className={isHovered ? styles.overlayHovered : styles.overlay} />
            </motion.div>

            {/* The content, only visible when hovered */}
            <AnimatePresence>
              {isHovered && (
                <motion.div 
                   className={styles.contentContainer}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -10, transition: { duration: 0.2, delay: 0, ease: "easeIn" } }}
                   transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1], delay: 0.1 }}
                >
                    <div className={styles.largeBackgroundText}>
                      {product.title.split(" ")[0].toUpperCase()}
                    </div>
                    <div className={styles.details}>
                      <motion.p 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 0.8, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1], delay: 0.2 }}
                        className={styles.subtitle}
                      >
                        {product.subtitle}
                      </motion.p>
                      <motion.h2 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1], delay: 0.25 }}
                        className={styles.title}
                      >
                        {product.title}
                      </motion.h2>
                      <motion.p 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1], delay: 0.3 }}
                        className={styles.price}
                      >
                        {product.price}
                      </motion.p>
                      <motion.button 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1], delay: 0.35 }}
                        className={styles.buyButton}
                      >
                        Buy Now
                      </motion.button>
                    </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ExpandableProductCards;
