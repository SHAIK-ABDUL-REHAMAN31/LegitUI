import React from "react";
import TypingCursor from "./TypingCursor";

interface TypingCursorUsageProps {
  text?: string;
  typingSpeed?: number;
  delay?: number;
  className?: string;
  fontSize?: string;
  textColor?: string;
  backgroundColor?: string;
  cursorColor?: string;
}

const TypingCursorUsage: React.FC<TypingCursorUsageProps> = (props) => {
  return (
    <main 
      style={{ 
        background: props.backgroundColor || "#000000", 
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <section style={{ 
        width: "100%", 
        minHeight: "100vh", 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center", 
        textAlign: "center", 
        padding: "0 1rem" 
      }}>
        <TypingCursor
          text="Introducing LegitUI"
          fontSize="clamp(2rem, 6vw, 4rem)"
          {...props}
        />
      </section>
    </main>
  );
};

export default TypingCursorUsage;
