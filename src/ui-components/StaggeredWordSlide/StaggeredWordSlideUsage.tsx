import React from "react";
import StaggeredWordSlide from "./StaggeredWordSlide";

interface StaggeredWordSlideUsageProps {
  text?: string;
  duration?: number;
  staggerAmount?: number;
  yOffset?: string | number;
  skewY?: number;
  rotateX?: number;
  ease?: string;
  textColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  fontSize?: string;
}

const StaggeredWordSlideUsage: React.FC<StaggeredWordSlideUsageProps> = (props) => {
  return (
    <div style={{ background: props.backgroundColor || "#000000", minHeight: "100vh" }}>
      <StaggeredWordSlide {...props} />
    </div>
  );
};

export default StaggeredWordSlideUsage;
