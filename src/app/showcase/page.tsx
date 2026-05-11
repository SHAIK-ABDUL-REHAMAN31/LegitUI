"use client";

import { useComponentStore } from "@/lib/component-store";
import ComponentCard from "@/components/ComponentCard";
import styles from "./page.module.css";

export default function ShowcasePage() {
  const { components } = useComponentStore();

  return (
    <div className={styles.pageWrapper}>
      <h1 className={styles.pageTitle}>Showcase</h1>
      <p className={styles.subtitle}>
        See all {components.length} components in our library. Click any
        component to see the live preview and code.
      </p>

      <div className={styles.grid}>
        {components.map((comp) => (
          <ComponentCard key={comp.id} component={comp} />
        ))}
      </div>
    </div>
  );
}
