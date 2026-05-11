"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import Prism from "prismjs";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-css";
import styles from "./CodeBlock.module.css";

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
  filename?: string;
  /** When true, enables Ctrl+Shift+C keyboard shortcut for copying */
  enableKeyboardShortcut?: boolean;
}

export default function CodeBlock({
  code,
  language = "tsx",
  showLineNumbers = true,
  maxHeight = "520px",
  filename,
  enableKeyboardShortcut = false,
}: CodeBlockProps) {
  const codeRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const [lineToast, setLineToast] = useState<string | null>(null);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for HTTP or permission errors
      const textarea = document.createElement("textarea");
      textarea.value = code;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code]);

  // Keyboard shortcut: Ctrl+Shift+C (or Cmd+Shift+C on Mac)
  useEffect(() => {
    if (!enableKeyboardShortcut) return;

    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "C") {
        e.preventDefault();
        handleCopy();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enableKeyboardShortcut, handleCopy]);

  const handleLineClick = (lineNum: number) => {
    setHighlightedLine(lineNum);

    // Copy line anchor to clipboard
    const anchor = `#L${lineNum}`;
    navigator.clipboard.writeText(anchor).catch(() => {
      // silent fallback
    });

    setLineToast(`Line ${lineNum} copied`);
    setTimeout(() => setLineToast(null), 1500);
  };

  const lines = code.split("\n");

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      {/* Header Bar */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          {/* File dots */}
          <div className={styles.dots}>
            <div className={styles.dotRed} />
            <div className={styles.dotYellow} />
            <div className={styles.dotGreen} />
          </div>
          {filename && (
            <span className={styles.filename}>
              {filename}
            </span>
          )}
        </div>

        <div className={styles.headerRight}>
          {enableKeyboardShortcut && (
            <span className={styles.shortcutHint}>
              {typeof navigator !== "undefined" &&
              /Mac/i.test(navigator.userAgent)
                ? "⌘⇧C"
                : "Ctrl+Shift+C"}
            </span>
          )}
          <button
            onClick={handleCopy}
            className={copied ? styles.copyButtonCopied : styles.copyButton}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className={styles.codeContent} style={{ maxHeight }}>
        <div className={styles.codeInner}>
          {showLineNumbers && (
            <div className={styles.lineNumbers}>
              {lines.map((_, i) => (
                <div
                  key={i}
                  className={`${styles.lineNumber} ${
                    highlightedLine === i + 1 ? styles.lineNumberActive : ""
                  }`}
                  onClick={() => handleLineClick(i + 1)}
                  title={`Copy #L${i + 1}`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          )}
          <pre className={styles.pre}>
            <code ref={codeRef} className={`language-${language}`}>
              {code}
            </code>
          </pre>
        </div>
      </div>

      {/* Line toast notification */}
      {lineToast && (
        <div className={styles.lineToast}>
          {lineToast}
        </div>
      )}
    </div>
  );
}
