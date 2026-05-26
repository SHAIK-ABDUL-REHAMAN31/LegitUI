import React from "react";
import styles from "./SignpostNavigation.module.css";
export const SignpostNavigation = ({ items, className = "", }) => {
    return (<div className={`${styles.container} ${className}`}>
      <div className={styles.pole}></div>
      <div className={styles.signsWrapper}>
        {items.map((item) => {
            const baseRotation = item.rotation || 0;
            const offset = item.offset || "center";
            const rowClass = styles[`offset-${offset}`] || "";
            let shapeClass = "";
            if (item.shape === "pointed-left")
                shapeClass = styles["shape-pointed-left"];
            if (item.shape === "pointed-right")
                shapeClass = styles["shape-pointed-right"];
            return (<div key={item.id} className={`${styles.signRow} ${rowClass}`}>
              <a href={item.href} className={`${styles.sign} ${shapeClass}`} style={{
                    backgroundColor: item.color,
                    "--base-rotation": `${baseRotation}deg`,
                }}>
                {item.icon && <span className={styles.iconWrapper}>{item.icon}</span>}
                <span>{item.label}</span>
              </a>
            </div>);
        })}
      </div>
    </div>);
};
