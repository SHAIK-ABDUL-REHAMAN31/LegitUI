"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import styles from "./SwipeableCardStack.module.css";
import { ArrowLeft, ArrowRight, RotateCcw, ArrowUpRight } from "lucide-react";

export interface CardItem {
    id: number;
    title: string;
    description: string;
    image: string;
    linkText?: string;
    accentColor?: string;
}

export interface SwipeableCardStackProps {
    cards?: CardItem[];
    swipeSpeed?: number;
    cardWidth?: number;
    cardHeight?: number;
    rotationOffset?: number;
    maxVisibleCards?: number;
    enableWheelSwipe?: boolean;
    className?: string;
    onSwipe?: (card: CardItem, direction: "left" | "right" | "up") => void;
    onReset?: () => void;
}

const defaultCards: CardItem[] = [
    {
        id: 1,
        title: "THE LINE",
        description: "A cognitive city stretching across 170 kilometers, from the epic mountains of NEOM across inspirational desert valleys to the beautiful Red Sea.",
        image: "/CardsAssets/the_line.png",
        linkText: "Invest in NEOM",
        accentColor: "#f1c40f",
    },
    {
        id: 2,
        title: "SINDALAH",
        description: "NEOM's luxury island destination in the Red Sea, a yachting hotspot and golf destination with pristine marine life.",
        image: "/CardsAssets/sindalah.png",
        linkText: "Explore Sindalah",
        accentColor: "#00d2d3",
    },
    {
        id: 3,
        title: "TROJENA",
        description: "The mountains of NEOM, a destination offering year-round outdoor sports, skiing, and premium wellness.",
        image: "/CardsAssets/trojena.png",
        linkText: "Visit Trojena",
        accentColor: "#ff7675",
    },
    {
        id: 4,
        title: "OXAGON",
        description: "A reimagined industrial city, a hub for clean industries and advanced innovation, floating on the Red Sea.",
        image: "/CardsAssets/oxagon.png",
        linkText: "Discover Oxagon",
        accentColor: "#1dd1a1",
    },
];

export default function SwipeableCardStack({
    cards = defaultCards,
    swipeSpeed = 0.5,
    cardWidth = 240,
    cardHeight = 340,
    rotationOffset = 4,
    maxVisibleCards = 3,
    enableWheelSwipe = true,
    className = "",
    onSwipe,
    onReset,
}: SwipeableCardStackProps) {
    const [activeCards, setActiveCards] = useState<CardItem[]>(cards);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

    // Drag tracking state
    const dragInfo = useRef({
        startX: 0,
        startY: 0,
        isDragging: false,
        x: 0,
        y: 0,
    });

    // Reset active cards back to default input props
    useEffect(() => {
        setActiveCards(cards);
    }, [cards]);

    // Handle Swipe Actions
    const swipeTopCard = useCallback(
        (direction: "left" | "right" | "up") => {
            if (activeCards.length === 0) return;
            const topCard = activeCards[0];
            const cardEl = cardRefs.current[topCard.id];
            if (!cardEl) return;

            // Determine reveal target to peel card off the stack
            let targetX = 0;
            let targetY = 0;
            let targetRotate = 0;

            if (direction === "left") {
                targetX = -cardWidth - 60;
                targetRotate = -12;
            } else if (direction === "right") {
                targetX = cardWidth + 60;
                targetRotate = 12;
            } else {
                targetY = -cardHeight - 60;
                targetRotate = 5;
            }

            // Peel-off animation (slides to side to reveal next card, doesn't fade)
            gsap.to(cardEl, {
                x: targetX,
                y: targetY,
                rotate: targetRotate,
                scale: 0.9,
                duration: 0.35,
                ease: "power2.out",
                onComplete: () => {
                    // Cycle the swiped card to the bottom of the stack
                    setActiveCards((prev) => {
                        const next = [...prev];
                        const top = next.shift();
                        if (top) next.push(top);
                        return next;
                    });
                    if (onSwipe) onSwipe(topCard, direction);
                },
            });
        },
        [activeCards, cardWidth, cardHeight, onSwipe]
    );

    // Pointer Event Handlers for Dragging
    const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (activeCards.length === 0) return;
        const cardEl = e.currentTarget;
        cardEl.setPointerCapture(e.pointerId);

        dragInfo.current = {
            startX: e.clientX,
            startY: e.clientY,
            isDragging: true,
            x: 0,
            y: 0,
        };

        setIsDragging(true);

        gsap.killTweensOf(cardEl);
        // Visual lift on drag hold
        gsap.to(cardEl, {
            scale: 1.03,
            duration: 0.2,
            ease: "power2.out",
        });
    };

    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        const drag = dragInfo.current;
        if (!drag.isDragging) return;

        const dx = e.clientX - drag.startX;
        const dy = e.clientY - drag.startY;
        drag.x = dx;
        drag.y = dy;

        const cardEl = e.currentTarget;
        gsap.set(cardEl, {
            x: dx,
            y: dy,
            rotate: dx * 0.08, // Dynamic tilt proportional to swipe
        });
    };

    const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        const drag = dragInfo.current;
        if (!drag.isDragging) return;
        drag.isDragging = false;
        setIsDragging(false);

        const cardEl = e.currentTarget;
        cardEl.releasePointerCapture(e.pointerId);

        // Threshold check for swipe out
        const threshold = 120;
        if (drag.x > threshold) {
            swipeTopCard("right");
        } else if (drag.x < -threshold) {
            swipeTopCard("left");
        } else if (drag.y < -threshold) {
            swipeTopCard("up");
        } else {
            // Elastic snap-back
            gsap.to(cardEl, {
                x: 0,
                y: 0,
                rotate: 0,
                scale: 1.0,
                duration: 0.5,
                ease: "elastic.out(1.0, 0.75)",
            });
        }
    };

    // Stagger layout and animate background cards as the top cards are swiped
    useEffect(() => {
        activeCards.forEach((card, index) => {
            const cardEl = cardRefs.current[card.id];
            if (!cardEl) return;

            // Don't override properties if this card is currently being dragged
            if (index === 0 && dragInfo.current.isDragging) return;

            // Visual metrics based on depth
            const scale = 1 - index * 0.045;
            const yOffset = index * 22; // Offset downwards
            const isVisible = index < maxVisibleCards;
            
            // Fanning rotate stagger (alternates directions)
            const baseRotate = index === 0 ? 0 : (index % 2 === 0 ? 1 : -1) * rotationOffset * (1 + index * 0.2);

            gsap.to(cardEl, {
                scale: scale,
                y: yOffset,
                x: 0,
                rotate: baseRotate,
                opacity: isVisible ? 1 : 0,
                pointerEvents: index === 0 ? "auto" : "none",
                duration: 0.5,
                ease: "back.out(1.2)",
                overwrite: "auto",
            });
        });
    }, [activeCards, rotationOffset, maxVisibleCards]);

    return (
        <div className={styles.stackWrapper} ref={containerRef}>
            {/* Left Control Button */}
            {activeCards.length > 0 && (
                <button 
                    className={`${styles.controlBtn} ${styles.controlBtnLeft}`} 
                    onClick={() => swipeTopCard("left")}
                    title="Swipe Left"
                >
                    <ArrowLeft size={18} />
                </button>
            )}

            <div 
                className={styles.stackContainer} 
                style={{ width: cardWidth, height: cardHeight }}
            >
                {/* Render in reverse order so z-index stacks naturally */}
                {[...activeCards].reverse().map((card) => {
                    const originalIndex = activeCards.indexOf(card);
                    const isTop = originalIndex === 0;

                    return (
                        <div
                            key={card.id}
                            ref={(el) => {
                                cardRefs.current[card.id] = el;
                            }}
                            className={styles.card}
                            style={{
                                width: cardWidth,
                                height: cardHeight,
                                zIndex: 100 - originalIndex,
                                cursor: isTop ? (isDragging ? "grabbing" : "pointer") : "default",
                                "--accent-color": card.accentColor || "#a855f7",
                            } as React.CSSProperties}
                            onPointerDown={isTop ? onPointerDown : undefined}
                            onPointerMove={isTop ? onPointerMove : undefined}
                            onPointerUp={isTop ? onPointerUp : undefined}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                                src={card.image} 
                                alt={card.title} 
                                className={styles.cardImage} 
                                draggable={false}
                            />

                            {/* Gradient overlay for text readability */}
                            <div className={styles.gradientOverlay} />

                            {/* Textured overlay */}
                            <div className={styles.grain} />

                            {/* Ambient border accent glow */}
                            <div className={styles.glow} />

                            {/* Top Metadata Header Row */}
                            <div className={styles.header}>
                                <div className={styles.badge}>
                                    <span className={styles.badgeDot} />
                                    <span>DESTINATION</span>
                                </div>
                                <button className={styles.arrowButton}>
                                    <ArrowUpRight size={14} />
                                </button>
                            </div>

                            {/* Card Content Stack */}
                            <div className={styles.cardContent}>
                                <h2 className={styles.title}>{card.title}</h2>
                                <p className={styles.description}>{card.description}</p>
                                {card.linkText && (
                                    <div className={styles.actionLink}>
                                        <span>{card.linkText}</span>
                                        <ArrowRight size={12} style={{ marginLeft: "2px" }} />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Right Control Button */}
            {activeCards.length > 0 && (
                <button 
                    className={`${styles.controlBtn} ${styles.controlBtnRight}`} 
                    onClick={() => swipeTopCard("right")}
                    title="Swipe Right"
                >
                    <ArrowRight size={18} />
                </button>
            )}
        </div>
    );
}
