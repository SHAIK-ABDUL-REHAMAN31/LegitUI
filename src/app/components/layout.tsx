import DocsSidebar from "@/components/DocsSidebar";
import styles from "./layout.module.css";

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layoutWrapper}>
      <DocsSidebar />
      <div className={styles.contentArea}>
        {children}
      </div>
    </div>
  );
}
