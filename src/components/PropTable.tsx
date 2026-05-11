"use client";

// ════════════════════════════════════════════════════════════════
// PropTable — Phase 9.2
// ════════════════════════════════════════════════════════════════
// Type-colored, syntax-highlighted prop documentation table.
// Props come from the merged registry + docgen extraction.
// ════════════════════════════════════════════════════════════════

import React from "react";
import styles from "./PropTable.module.css";

export interface PropTableItem {
  name: string;
  type: string;
  default?: string;
  description: string;
  required?: boolean;
}

interface PropTableProps {
  props: PropTableItem[];
  componentName: string;
}

/**
 * Determine which type-color class to apply based on the type string.
 */
function getTypeClass(type: string): string {
  const t = type.toLowerCase();
  if (t === "string" || t === "string[]" || t === "color" || t === "color[]")
    return styles.typeString;
  if (t === "number") return styles.typeNumber;
  if (t === "boolean") return styles.typeBoolean;
  if (t.includes("reactnode") || t.includes("react.reactnode"))
    return styles.typeReactNode;
  if (t.includes("=>") || t.includes("function") || t.includes("void"))
    return styles.typeFunction;
  if (t.includes("'") && t.includes("|")) return styles.typeEnum;
  if (t.includes("|")) return styles.typeEnum;
  return styles.typeOther;
}

export default function PropTable({ props, componentName }: PropTableProps) {
  if (!props || props.length === 0) return null;

  return (
    <div className={styles.propTableWrapper}>
      <h2 className={styles.propTableTitle}>
        Props
        <span className={styles.propCount}>{props.length}</span>
      </h2>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              {["Prop", "Type", "Default", "Description"].map((h) => (
                <th key={h} className={styles.th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {props.map((prop, i) => (
              <tr
                key={prop.name}
                className={styles.row}
                style={{
                  borderBottom:
                    i < props.length - 1
                      ? "1px solid var(--border-primary)"
                      : "none",
                }}
              >
                <td className={styles.nameCell}>
                  {prop.name}
                  {prop.required && (
                    <span className={styles.requiredStar}>*</span>
                  )}
                </td>
                <td className={styles.typeCell}>
                  <span
                    className={`${styles.typeBadge} ${getTypeClass(prop.type)}`}
                  >
                    {prop.type}
                  </span>
                </td>
                <td className={styles.defaultCell}>
                  {prop.default ? (
                    <code className={styles.defaultValue}>{prop.default}</code>
                  ) : (
                    <span className={styles.defaultNone}>—</span>
                  )}
                </td>
                <td className={styles.descCell}>{prop.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
