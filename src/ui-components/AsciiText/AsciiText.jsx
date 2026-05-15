"use client";
import React, { useEffect, useRef } from "react";
import styles from "./AsciiText.module.css";
const ON_CHARS = ["█", "▓", "▒", "░", "■"];
const SCRAMBLE_CHARS = ["@", "#", "$", "%", "&", "*", "!", "?", "~", "^", "<", ">"];
const OFF_CHARS = ["·", " "];
export const AsciiText = ({ text = "LEGIT", className = "", hoverRadius = 40, fontSize = 12, charWidth = 8, charHeight = 12, textColor = "#ffffff", }) => {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    useEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas)
            return;
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx)
            return;
        let width = 0;
        let height = 0;
        let cols = 0;
        let rows = 0;
        let cells = [];
        let animationFrameId;
        const initGrid = () => {
            cells = [];
            if (width === 0 || height === 0)
                return;
            const offCanvas = document.createElement("canvas");
            offCanvas.width = cols;
            offCanvas.height = rows;
            const offCtx = offCanvas.getContext("2d", { willReadFrequently: true });
            if (!offCtx)
                return;
            offCtx.fillStyle = "black";
            offCtx.fillRect(0, 0, cols, rows);
            const textFontSize = Math.min((cols / text.length) * 1.5, rows * 0.8);
            offCtx.font = `bold ${textFontSize}px sans-serif`;
            offCtx.fillStyle = "white";
            offCtx.textAlign = "center";
            offCtx.textBaseline = "middle";
            offCtx.fillText(text, cols / 2, rows / 2);
            const imgData = offCtx.getImageData(0, 0, cols, rows).data;
            const now = performance.now();
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const i = (y * cols + x) * 4;
                    const isOn = imgData[i] > 128;
                    cells.push({
                        col: x,
                        row: y,
                        x: x * charWidth + charWidth / 2,
                        y: y * charHeight + charHeight / 2,
                        baseX: x * charWidth + charWidth / 2,
                        baseY: y * charHeight + charHeight / 2,
                        char: SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)],
                        isOn,
                        state: "scramble",
                        resolveTime: now + (x * 40) + (Math.random() * 200),
                        opacity: 0,
                        rot: 0,
                        rippleTime: 0,
                        randomOffset: Math.random() * Math.PI * 2
                    });
                }
            }
        };
        let mouseX = -1000;
        let mouseY = -1000;
        let isHovering = false;
        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
            isHovering = true;
        };
        const handleMouseLeave = () => {
            isHovering = false;
            mouseX = -1000;
            mouseY = -1000;
        };
        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mouseleave", handleMouseLeave);
        const resizeObserver = new ResizeObserver(() => {
            width = container.clientWidth;
            height = container.clientHeight;
            canvas.width = width;
            canvas.height = height;
            cols = Math.ceil(width / charWidth);
            rows = Math.ceil(height / charHeight);
            initGrid();
        });
        resizeObserver.observe(container);
        const render = () => {
            const now = performance.now();
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, width, height);
            ctx.font = `${fontSize}px "Courier New", Courier, monospace`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            cells.forEach(cell => {
                let displayChar = cell.char;
                let opacity = cell.opacity;
                if (cell.state === "scramble") {
                    if (Math.random() < 0.1) {
                        cell.char = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
                    }
                    displayChar = cell.char;
                    opacity = cell.isOn ? 0.8 : 0.1;
                    if (now > cell.resolveTime) {
                        cell.state = "resolved";
                        if (cell.isOn) {
                            cell.char = ON_CHARS[Math.floor(Math.random() * ON_CHARS.length)];
                        }
                        else {
                            cell.char = OFF_CHARS[Math.floor(Math.random() * OFF_CHARS.length)];
                        }
                    }
                }
                else {
                    if (cell.isOn) {
                        opacity = 0.85 + Math.sin(now * 0.002 + cell.randomOffset) * 0.15;
                        displayChar = cell.char;
                        if (cell.rippleTime > now) {
                            displayChar = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
                            opacity = 1;
                        }
                    }
                    else {
                        if (Math.random() < 0.02) {
                            cell.char = OFF_CHARS[Math.floor(Math.random() * OFF_CHARS.length)];
                        }
                        displayChar = cell.char;
                        opacity = 0.08;
                        if (cell.rippleTime > now) {
                            displayChar = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
                            opacity = 0.2;
                        }
                    }
                }
                if (isHovering && cell.state !== "scramble") {
                    const dx = cell.baseX - mouseX;
                    const dy = cell.baseY - mouseY;
                    if (dx * dx + dy * dy < hoverRadius * hoverRadius) {
                        cell.rippleTime = now + 400;
                    }
                }
                if (opacity > 0) {
                    ctx.globalAlpha = opacity;
                    ctx.fillStyle = textColor;
                    if (cell.rot !== 0) {
                        ctx.save();
                        ctx.translate(cell.x, cell.y);
                        ctx.rotate(cell.rot);
                        ctx.fillText(displayChar, 0, 0);
                        ctx.restore();
                    }
                    else {
                        ctx.fillText(displayChar, cell.x, cell.y);
                    }
                }
            });
            animationFrameId = requestAnimationFrame(render);
        };
        render();
        return () => {
            cancelAnimationFrame(animationFrameId);
            resizeObserver.disconnect();
            canvas.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [text, hoverRadius, fontSize, charWidth, charHeight, textColor]);
    return (<div ref={containerRef} className={`${styles.container} ${className}`}>
      <canvas ref={canvasRef} className={styles.canvas}/>
      <div className={styles.scanlines}/>
    </div>);
};
export default AsciiText;
