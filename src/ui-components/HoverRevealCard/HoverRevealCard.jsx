"use client";
import React, { useRef } from 'react';
import gsap from 'gsap';
import styles from './HoverRevealCard.module.css';
export const HoverRevealCard = ({ title = "The Weeknd", subtitle = "STARBOY", description = "Experience the electric energy of Starboy, a cinematic and auditory masterpiece.", imageSrc = "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=800&auto=format&fit=crop", buttonText = "Play Now", perspective = 1000, hoverDelay = 0, className = "" }) => {
    const cardRef = useRef(null);
    const contentRef = useRef(null);
    const imageRef = useRef(null);
    const handleMouseEnter = () => {
        if (!cardRef.current || !contentRef.current || !imageRef.current)
            return;
        gsap.to(cardRef.current, {
            rotationX: 10,
            rotationY: -10,
            scale: 1.05,
            duration: 0.6,
            ease: "power3.out",
            delay: hoverDelay
        });
        gsap.to(contentRef.current, {
            z: 50,
            duration: 0.6,
            ease: "power3.out"
        });
        gsap.to(imageRef.current, {
            scale: 1.1,
            duration: 0.6,
            ease: "power3.out"
        });
    };
    const handleMouseLeave = () => {
        if (!cardRef.current || !contentRef.current || !imageRef.current)
            return;
        gsap.to(cardRef.current, {
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            duration: 0.8,
            ease: "power3.out"
        });
        gsap.to(contentRef.current, {
            z: 0,
            duration: 0.8,
            ease: "power3.out"
        });
        gsap.to(imageRef.current, {
            scale: 1,
            duration: 0.8,
            ease: "power3.out"
        });
    };
    const handleMouseMove = (e) => {
        if (!cardRef.current)
            return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -15;
        const rotateY = ((x - centerX) / centerX) * 15;
        gsap.to(cardRef.current, {
            rotationX: rotateX,
            rotationY: rotateY,
            duration: 0.4,
            ease: "power2.out"
        });
    };
    return (<div className={`${styles.container} ${className}`} style={{ perspective: `${perspective}px` }}>
      <div ref={cardRef} className={styles.card} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onMouseMove={handleMouseMove}>
        <div className={styles.imageContainer}>
          <img ref={imageRef} src={imageSrc} alt={title} className={styles.image}/>
          <div className={styles.overlay}/>
        </div>

        <div ref={contentRef} className={styles.content}>
          <span className={styles.subtitle}>{subtitle}</span>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>
          <button className={styles.button}>{buttonText}</button>
        </div>
      </div>
    </div>);
};
export default HoverRevealCard;
