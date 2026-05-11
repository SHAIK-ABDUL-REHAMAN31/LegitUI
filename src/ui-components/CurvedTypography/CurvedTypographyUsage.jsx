"use client";
import React from "react";
import CurvedTypography from "./CurvedTypography";
const CurvedTypographyUsage = (props) => {
    return (<div style={{
            width: "100%",
            minHeight: "100vh",
            backgroundColor: "#000000",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-around",
            padding: "2rem",
            gap: "4rem"
        }}>
      <div style={{ width: "100%", maxWidth: "800px" }}>
        <CurvedTypography type="wave" speed={15} fontSize={24} fontWeight={900} letterSpacing="4px" showPath={true} pathColor="rgba(255, 255, 255, 0.1)" morphSpeed={10} {...props}/>
      </div>
    </div>);
};
export default CurvedTypographyUsage;
