"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./TextMorph.module.css";
const getCharacters = (word) => {
    const counts = {};
    return word.split("").map((char) => {
        const lowerChar = char.toLowerCase();
        counts[lowerChar] = (counts[lowerChar] || 0) + 1;
        return { id: `${lowerChar}-${counts[lowerChar]}`, char };
    });
};
const TextMorph = ({ text = "DREAM,BUILD,INNOVATE,SHAPE", prefix = "LET'S", suffix = "TOGETHER", interval = 1, className = "", fontSize = "clamp(2rem, 4vw, 4rem)", color = "#ffffff", }) => {
    const [index, setIndex] = useState(0);
    const wordList = text.split(",").map((w) => w.trim());
    useEffect(() => {
        if (wordList.length === 0)
            return;
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % wordList.length);
        }, interval * 1000);
        return () => clearInterval(timer);
    }, [text, interval, wordList.length]);
    // Handle case where index is out of bounds after text change
    const safeIndex = index % (wordList.length || 1);
    const currentChars = getCharacters(wordList[safeIndex] || "");
    return (<div className={`${styles.container} ${className}`}>
      <motion.div layout style={{ fontSize }} className={styles.textWrapper} transition={{ type: "spring", stiffness: 150, damping: 20 }}>
        {prefix && (<motion.span layout className={styles.prefix} style={{ color }} transition={{ type: "spring", stiffness: 150, damping: 20 }}>
            {prefix}
          </motion.span>)}
        <motion.div layout className={styles.morphBox} transition={{ type: "spring", stiffness: 150, damping: 20 }}>
          <AnimatePresence mode="popLayout">
            {currentChars.map(({ id, char }) => (<motion.span key={id} layoutId={id} initial={{ opacity: 0, scale: 0.5, filter: "blur(15px)", y: 15 }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }} exit={{ opacity: 0, scale: 1.5, filter: "blur(15px)", y: -15 }} transition={{
                type: "spring",
                stiffness: 150,
                damping: 20,
                mass: 1,
            }} style={{ display: "inline-block", whiteSpace: "pre" }}>
                {char === " " ? "\u00A0" : char}
              </motion.span>))}
          </AnimatePresence>
        </motion.div>
        {suffix && (<motion.span layout className={styles.suffix} style={{ color }} transition={{ type: "spring", stiffness: 150, damping: 20 }}>
            {suffix}
          </motion.span>)}
      </motion.div>
    </div>);
};
export default TextMorph;
