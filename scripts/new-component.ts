// ════════════════════════════════════════════════════════════════
// LegitUI — New Component Scaffold Script
// ════════════════════════════════════════════════════════════════
// Usage: npx tsx scripts/new-component.ts --name "My Component" --category backgrounds --slug my-component
// ════════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

import { parseArgs } from "util";

// 1. Parse arguments manually
let name = "";
let category = "";
let slug = "";

try {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      name: { type: "string" },
      category: { type: "string" },
      slug: { type: "string" },
    },
    strict: false,
  });
  
  name = values.name as string;
  category = values.category as string;
  slug = values.slug as string;
} catch (e) {
  // Ignored
}

if (!name || !category || !slug) {
  console.error("❌ Missing required arguments!");
  console.error(
    "Usage: npx tsx scripts/new-component.ts --name \"My Component\" --category backgrounds --slug my-component"
  );
  process.exit(1);
}

// Format names
const folderName = name
  .split(/\s+/)
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  .join("");
const componentName = folderName;

console.log(`\n✨ Creating ${componentName}...`);

const ROOT_DIR = path.resolve(__dirname, "..");
const UI_COMPONENTS_DIR = path.join(ROOT_DIR, "src", "ui-components", folderName);

// 2. Create folder
if (!fs.existsSync(UI_COMPONENTS_DIR)) {
  fs.mkdirSync(UI_COMPONENTS_DIR, { recursive: true });
}

// 3. Create TSX
const tsxContent = `'use client';

import React from 'react';
import styles from './${componentName}.module.css';

interface ${componentName}Props {
  /** The content of the component */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  children,
  className = '',
}) => {
  return (
    <div className={\`\${styles.root} \${className}\`}>
      {children || '${name} works!'}
    </div>
  );
};

export default ${componentName};
`;
fs.writeFileSync(path.join(UI_COMPONENTS_DIR, `${componentName}.tsx`), tsxContent);

// 4. Create CSS
const cssContent = `.root {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-family: inherit;
}
`;
fs.writeFileSync(path.join(UI_COMPONENTS_DIR, `${componentName}.module.css`), cssContent);

// 5. Create index.ts
const indexContent = `export { default } from './${componentName}';\n`;
fs.writeFileSync(path.join(UI_COMPONENTS_DIR, "index.ts"), indexContent);

console.log(`✓ Created src/ui-components/${folderName}/`);

// 6. Update component-registry.ts
const registryPath = path.join(ROOT_DIR, "src", "lib", "component-registry.ts");
let registryContent = fs.readFileSync(registryPath, "utf-8");

const registryEntry = `  {
    slug: "${slug}",
    name: "${name}",
    folder: "${folderName}",
    fileName: "${componentName}",
    category: "${category}",
    description: "TODO: Add description",
    tags: ["todo"],
    dependencies: [],
    props: [],
    isNew: true,
    createdAt: new Date().toISOString().split('T')[0],
  },
];`;

if (!registryContent.includes(`slug: "${slug}"`)) {
  registryContent = registryContent.replace(/^\];/m, registryEntry);
  fs.writeFileSync(registryPath, registryContent);
  console.log(`✓ Added registry entry for '${slug}'`);
}

// 7. Update preview-map.ts
const previewMapPath = path.join(ROOT_DIR, "src", "lib", "preview-map.ts");
let previewMapContent = fs.readFileSync(previewMapPath, "utf-8");

const previewMapEntry = `  '${slug}': () => import('@/ui-components/${folderName}/${componentName}'),
} as const;`;

if (!previewMapContent.includes(`'${slug}':`)) {
  previewMapContent = previewMapContent.replace(/^\} as const;/m, previewMapEntry);
  fs.writeFileSync(previewMapPath, previewMapContent);
  console.log(`✓ Added to preview-map.ts`);
}

// 8. Print next steps
console.log(`
🎉 Component generated successfully!

Next steps:
1. Implement your component in src/ui-components/${folderName}/${componentName}.tsx
2. Add props to the registry entry in src/lib/component-registry.ts
3. Run: npm run dev
4. Visit: http://localhost:3000/components/${slug}
5. Run: npm run generate:js to generate the JS variant before committing
`);
