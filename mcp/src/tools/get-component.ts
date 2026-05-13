// ════════════════════════════════════════════════════════════════
// Tool: get_component
// ════════════════════════════════════════════════════════════════
// Returns complete information about a single component —
// props table, dependencies, install commands, usage example,
// and file structure. Everything an AI needs to use it correctly.
// ════════════════════════════════════════════════════════════════

import { getComponent, searchComponents } from "../lib/registry-loader.js";

export const definition = {
  name: "get_component",
  description:
    "Get complete information about a specific LegitUI component " +
    "including props, dependencies, usage example, and install command. " +
    "Use the component slug (kebab-case) as the identifier.",
  inputSchema: {
    type: "object" as const,
    properties: {
      slug: {
        type: "string",
        description:
          "Component slug in kebab-case. Examples: orbit-gallery, text-reveal, liquid-nebula",
      },
    },
    required: ["slug"],
  },
};

export async function handler(args: Record<string, unknown>): Promise<string> {
  const slug = args.slug as string;
  const c = await getComponent(slug);

  if (!c) {
    // Try to suggest alternatives
    const suggestions = await searchComponents(slug);
    const suggestionText =
      suggestions.length > 0
        ? `\n\nDid you mean:\n${suggestions
            .slice(0, 5)
            .map((s) => `- **${s.name}** (\`${s.slug}\`)`)
            .join("\n")}`
        : "";
    return `Component "${slug}" not found.${suggestionText}`;
  }

  const componentName =
    c.fileName || c.name.replace(/\s+/g, "");

  let output = `# ${c.name}\n`;
  output += `**Slug:** \`${c.slug}\`\n`;
  output += `**Category:** ${c.category}\n`;
  if (c.isNew) output += `**Status:** 🆕 New\n`;
  if (c.featured) output += `**Status:** ⭐ Featured\n`;
  output += "\n";

  // Description
  output += `## Description\n${c.description}\n\n`;

  // Props table
  if (c.props && c.props.length > 0) {
    output += `## Props\n`;
    output += `| Prop | Type | Default | Description |\n`;
    output += `|------|------|---------|-------------|\n`;
    for (const p of c.props) {
      const def = p.default !== undefined ? `\`${p.default}\`` : "—";
      output += `| \`${p.name}\` | \`${p.type}\` | ${def} | ${p.description} |\n`;
    }
    output += "\n";
  }

  // Dependencies
  if (c.dependencies.length > 0) {
    output += `## Dependencies\n`;
    output += `npm packages required: ${c.dependencies.join(", ")}\n`;
    output += `\`\`\`bash\nnpm install ${c.dependencies.join(" ")}\n\`\`\`\n\n`;
  } else {
    output += `## Dependencies\nNo external dependencies — pure React + CSS.\n\n`;
  }

  // Install commands
  output += `## Install\n`;
  output += `### Via shadcn CLI (recommended):\n`;
  output += `\`\`\`bash\nnpx shadcn@latest add https://legitui.com/r/${c.slug}.json\n\`\`\`\n\n`;
  output += `### Via manual copy:\n`;
  output += `Visit: https://legitui.com/components/${c.slug}\n`;
  output += `Copy the source code from the Code tab.\n\n`;

  // Usage example
  if (c.usageExample) {
    output += `## Usage Example\n\`\`\`tsx\n${c.usageExample}\n\`\`\`\n\n`;
  } else {
    output += `## Usage\n\`\`\`tsx\nimport ${componentName} from "@/components/ui/${componentName}";\n\n`;
    output += `export default function Example() {\n  return <${componentName} />;\n}\n\`\`\`\n\n`;
  }

  // File structure
  output += `## File Structure (after install)\n`;
  output += `\`\`\`\nsrc/components/ui/\n├── ${componentName}.tsx\n└── ${componentName}.module.css\n\`\`\`\n\n`;

  // Notes for heavy components
  if (c.dependencies.some((d) => ["three", "ogl", "@react-three/fiber"].includes(d))) {
    output += `## Notes\n`;
    output += `- Requires WebGL support in the browser\n`;
    output += `- Component handles cleanup/dispose automatically on unmount\n`;
    output += `- Consider lazy-loading with \`React.lazy()\` for performance\n`;
  }

  return output;
}
