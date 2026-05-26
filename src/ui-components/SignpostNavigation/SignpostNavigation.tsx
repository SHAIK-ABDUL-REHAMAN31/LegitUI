import React, { ReactNode } from "react";
import styles from "./SignpostNavigation.module.css";

export interface SignpostItem {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  color: string;
  rotation?: number; // Base rotation in degrees (e.g., -2, 3)
  offset?: "left" | "right" | "center"; // Position relative to pole
  shape?: "rounded" | "pointed-left" | "pointed-right";
}

export interface SignpostNavigationProps {
  items: SignpostItem[];
  className?: string;
}

export const SignpostNavigation: React.FC<SignpostNavigationProps> = ({
  items,
  className = "",
}) => {
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.pole}></div>
      <div className={styles.signsWrapper}>
        {items.map((item) => {
          const baseRotation = item.rotation || 0;
          const offset = item.offset || "center";
          const rowClass = styles[`offset-${offset}`] || "";

          let shapeClass = "";
          if (item.shape === "pointed-left") shapeClass = styles["shape-pointed-left"];
          if (item.shape === "pointed-right") shapeClass = styles["shape-pointed-right"];

          return (
            <div 
              key={item.id} 
              className={`${styles.signRow} ${rowClass}`}
            >
              <a
                href={item.href}
                className={`${styles.sign} ${shapeClass}`}
                style={
                  {
                    backgroundColor: item.color,
                    "--base-rotation": `${baseRotation}deg`,
                  } as React.CSSProperties
                }
              >
                {item.icon && <span className={styles.iconWrapper}>{item.icon}</span>}
                <span>{item.label}</span>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};
