"use client";

import CodeBlock from "@/components/CodeBlock";
import styles from "./page.module.css";

export default function InstallationPage() {
  return (
    <div className={styles.pageWrapper}>
      <h1 className={styles.pageTitle}>Installation</h1>

      <p className={styles.introText}>
        LegitUI components are designed to be copied directly into your
        project. No npm package needed — just grab the code and go.
      </p>

      {/* Method 1 */}
      <h2 className={styles.sectionTitle}>Method 1: Copy &amp; Paste</h2>
      <p className={styles.sectionDesc}>
        The simplest way. Browse a component, click the &quot;Copy Code&quot;
        button, and paste it into your project.
      </p>

      <div className={styles.codeBlockWrapper}>
        <CodeBlock
          code={`// 1. Create a new file in your components directory
// e.g., src/components/ui/ShimmerButton.tsx

// 2. Paste the component code

// 3. Import and use it
import ShimmerButton from '@/components/ui/ShimmerButton';

export default function Hero() {
  return (
    <ShimmerButton onClick={() => console.log('clicked')}>
      Get Started
    </ShimmerButton>
  );
}`}
          language="tsx"
          filename="Usage Example"
        />
      </div>

      {/* Method 2 */}
      <h2 className={styles.sectionTitle}>Method 2: CLI (Coming Soon)</h2>
      <p className={styles.sectionDesc}>
        We&apos;re building a CLI tool that will let you install components
        directly from the terminal.
      </p>

      <div className={styles.codeBlockWrapper}>
        <CodeBlock
          code={`# Install the CLI (coming soon)
npx legitui add shimmer-button

# Add multiple components
npx legitui add shimmer-button glow-card pulse-loader

# Add all components from a category
npx legitui add --category buttons`}
          language="bash"
          filename="Terminal"
        />
      </div>

      {/* Prerequisites */}
      <h2 className={styles.sectionTitle}>Prerequisites</h2>
      <div className={styles.prerequisitesList}>
        {[
          { label: "React 18+", note: "with hooks support" },
          { label: "TypeScript 5+", note: "recommended but not required" },
          { label: "Any build tool", note: "Vite, Next.js, CRA, etc." },
        ].map((item) => (
          <div key={item.label} className={styles.prerequisiteItem}>
            <span className={styles.prerequisiteDot} />
            <span className={styles.prerequisiteLabel}>{item.label}</span>
            <span className={styles.prerequisiteNote}>— {item.note}</span>
          </div>
        ))}
      </div>

      {/* Project Structure */}
      <h2 className={styles.sectionTitle}>Recommended Project Structure</h2>

      <CodeBlock
        code={`src/
├── components/
│   └── ui/          ← Put LegitUI components here
│       ├── ShimmerButton.tsx
│       ├── GlowCard.tsx
│       └── PulseLoader.tsx
├── pages/
└── App.tsx`}
        language="bash"
        filename="Project Structure"
        showLineNumbers={false}
      />
    </div>
  );
}
