"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./ColorPicker.module.css";

/* ────────────────────────────────────────────────────
   Hex ↔ RGB conversion helpers
   ──────────────────────────────────────────────────── */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace(/^#/, "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const n = parseInt(full, 16);
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255,
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
      .join("")
  );
}

function isValidHex(hex: string): boolean {
  return /^#?[0-9a-fA-F]{6}$/.test(hex);
}

/* ────────────────────────────────────────────────────
   Preset swatches
   ──────────────────────────────────────────────────── */
const PRESET_SWATCHES = [
  "#ffffff",
  "#000000",
  "#a855f7",
  "#6366f1",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
];

/* ────────────────────────────────────────────────────
   ColorPicker Component — Phase 4-A
   ──────────────────────────────────────────────────── */
interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value.replace("#", "").toUpperCase());
  const [alpha, setAlpha] = useState(100);
  const popoverRef = useRef<HTMLDivElement>(null);
  const swatchRef = useRef<HTMLButtonElement>(null);

  const rgb = hexToRgb(value);

  // Sync hex input when value changes from outside
  useEffect(() => {
    setHexInput(value.replace("#", "").toUpperCase());
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        swatchRef.current &&
        !swatchRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const handleHexChange = useCallback(
    (val: string) => {
      const clean = val.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
      setHexInput(clean.toUpperCase());
      if (clean.length === 6 && isValidHex(clean)) {
        onChange("#" + clean.toLowerCase());
      }
    },
    [onChange]
  );

  const handleRgbChange = useCallback(
    (channel: "r" | "g" | "b", val: number) => {
      const newRgb = { ...rgb, [channel]: Math.max(0, Math.min(255, val)) };
      const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
      onChange(hex);
    },
    [rgb, onChange]
  );

  const handleAlphaChange = useCallback((val: number) => {
    setAlpha(Math.max(0, Math.min(100, val)));
    // Alpha is visual-only for now (hex doesn't support alpha)
  }, []);

  return (
    <div className={styles.wrapper}>
      {/* Swatch trigger button */}
      <button
        ref={swatchRef}
        className={styles.swatchBtn}
        style={{ background: value }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Color: ${value}`}
      />

      {/* Floating popover */}
      {isOpen && (
        <div ref={popoverRef} className={styles.popover}>
          {/* Color preview bar */}
          <div
            className={styles.previewBar}
            style={{ background: value, opacity: alpha / 100 }}
          />

          {/* Hex input */}
          <div className={styles.hexRow}>
            <span className={styles.hexHash}>#</span>
            <input
              type="text"
              className={styles.hexInput}
              value={hexInput}
              onChange={(e) => handleHexChange(e.target.value)}
              maxLength={6}
              placeholder="A855F7"
            />
          </div>

          {/* RGB Sliders */}
          <div className={styles.sliderGroup}>
            <div className={styles.sliderRow}>
              <span className={styles.sliderLabel}>R</span>
              <input
                type="range"
                className={styles.slider}
                style={
                  {
                    "--slider-color": "#ef4444",
                  } as React.CSSProperties
                }
                min={0}
                max={255}
                value={rgb.r}
                onChange={(e) => handleRgbChange("r", parseInt(e.target.value))}
              />
              <span className={styles.sliderValue}>{rgb.r}</span>
            </div>
            <div className={styles.sliderRow}>
              <span className={styles.sliderLabel}>G</span>
              <input
                type="range"
                className={styles.slider}
                style={
                  {
                    "--slider-color": "#22c55e",
                  } as React.CSSProperties
                }
                min={0}
                max={255}
                value={rgb.g}
                onChange={(e) => handleRgbChange("g", parseInt(e.target.value))}
              />
              <span className={styles.sliderValue}>{rgb.g}</span>
            </div>
            <div className={styles.sliderRow}>
              <span className={styles.sliderLabel}>B</span>
              <input
                type="range"
                className={styles.slider}
                style={
                  {
                    "--slider-color": "#3b82f6",
                  } as React.CSSProperties
                }
                min={0}
                max={255}
                value={rgb.b}
                onChange={(e) => handleRgbChange("b", parseInt(e.target.value))}
              />
              <span className={styles.sliderValue}>{rgb.b}</span>
            </div>
          </div>

          {/* Alpha slider */}
          <div className={styles.sliderRow}>
            <span className={styles.sliderLabel}>A</span>
            <input
              type="range"
              className={styles.slider}
              style={
                {
                  "--slider-color": "#a855f7",
                } as React.CSSProperties
              }
              min={0}
              max={100}
              value={alpha}
              onChange={(e) => handleAlphaChange(parseInt(e.target.value))}
            />
            <span className={styles.sliderValue}>{alpha}%</span>
          </div>

          {/* Preset swatches */}
          <div className={styles.presetRow}>
            {PRESET_SWATCHES.map((color) => (
              <button
                key={color}
                className={`${styles.presetSwatch} ${
                  value.toLowerCase() === color ? styles.presetSwatchActive : ""
                }`}
                style={{ background: color }}
                onClick={() => onChange(color)}
                aria-label={`Preset ${color}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────
   ColorArrayPicker — Phase 4-B
   Array of color swatches with add/remove
   ──────────────────────────────────────────────────── */
interface ColorArrayPickerProps {
  value: string[];
  onChange: (colors: string[]) => void;
}

export function ColorArrayPicker({ value, onChange }: ColorArrayPickerProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (openIndex === null) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpenIndex(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openIndex]);

  const updateColor = useCallback(
    (index: number, color: string) => {
      const next = [...value];
      next[index] = color;
      onChange(next);
    },
    [value, onChange]
  );

  const addColor = useCallback(() => {
    onChange([...value, "#ffffff"]);
  }, [value, onChange]);

  const removeColor = useCallback(
    (index: number) => {
      if (value.length <= 1) return; // min 1 color always
      const next = value.filter((_, i) => i !== index);
      onChange(next);
      if (openIndex === index) setOpenIndex(null);
    },
    [value, onChange, openIndex]
  );

  const displayColors = value.slice(0, 5);

  return (
    <div className={styles.arrayWrapper}>
      <div className={styles.arraySwatchRow}>
        {displayColors.map((color, i) => (
          <div key={i} className={styles.arraySwatchItem}>
            <button
              className={`${styles.swatchBtn} ${
                openIndex === i ? styles.swatchBtnActive : ""
              }`}
              style={{ background: color }}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              aria-label={`Color ${i + 1}: ${color}`}
            />
            {/* Remove button on hover */}
            {value.length > 1 && (
              <button
                className={styles.removeSwatch}
                onClick={(e) => {
                  e.stopPropagation();
                  removeColor(i);
                }}
                aria-label="Remove color"
              >
                ×
              </button>
            )}

            {/* Inline popover for this swatch */}
            {openIndex === i && (
              <div ref={popoverRef} className={styles.popover} style={{ left: 0 }}>
                <div
                  className={styles.previewBar}
                  style={{ background: color }}
                />
                <div className={styles.hexRow}>
                  <span className={styles.hexHash}>#</span>
                  <input
                    type="text"
                    className={styles.hexInput}
                    value={color.replace("#", "").toUpperCase()}
                    onChange={(e) => {
                      const clean = e.target.value
                        .replace(/[^0-9a-fA-F]/g, "")
                        .slice(0, 6);
                      if (clean.length === 6 && isValidHex(clean)) {
                        updateColor(i, "#" + clean.toLowerCase());
                      }
                    }}
                    maxLength={6}
                  />
                </div>
                <div className={styles.presetRow}>
                  {PRESET_SWATCHES.map((preset) => (
                    <button
                      key={preset}
                      className={`${styles.presetSwatch} ${
                        color.toLowerCase() === preset
                          ? styles.presetSwatchActive
                          : ""
                      }`}
                      style={{ background: preset }}
                      onClick={() => updateColor(i, preset)}
                      aria-label={`Preset ${preset}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add color button */}
        {value.length < 8 && (
          <button className={styles.addSwatchBtn} onClick={addColor} aria-label="Add color">
            +
          </button>
        )}
      </div>

      {value.length > 5 && (
        <span className={styles.moreCount}>+{value.length - 5} more</span>
      )}
    </div>
  );
}
