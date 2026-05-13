// ════════════════════════════════════════════════════════════════
// Tool: get_install_command
// ════════════════════════════════════════════════════════════════
// Returns install commands (shadcn, manual) without executing them.
// Useful when the AI wants to suggest the command to the developer.
// ════════════════════════════════════════════════════════════════

import { getComponent } from "../lib/registry-loader.js";

export const definition = {
  name: "get_install_command",
  description:
    "Get the CLI install command for a LegitUI component. " +
    "Returns both shadcn and manual install instructions without running them.",
  inputSchema: {
    type: "object" as const,
    properties: {
      slug: {
        type: "string",
        description: "Component slug in kebab-case. Example: orbit-gallery",
      },
    },
    required: ["slug"],
  },
};

export async function handler(args: Record<string, unknown>): Promise<string> {
  const slug = args.slug as string;
  const component = await getComponent(slug);

  if (!component) {
    return `Component "${slug}" not found. Use \`search_components\` to find the correct slug.`;
  }

  let output = `## Install ${component.name}\n\n`;

  output += `### Option 1: shadcn CLI (recommended)\n`;
  output += `\`\`\`bash\nnpx shadcn@latest add https://legitui.com/r/${slug}.json\n\`\`\`\n\n`;

  output += `### Option 2: Manual copy\n`;
  output += `Copy source from: https://legitui.com/components/${slug}\n`;
  output += `(Click the Code tab, select variant: TSX / JSX / CSS)\n\n`;

  if (component.dependencies.length > 0) {
    output += `### After install, add dependencies:\n`;
    output += `\`\`\`bash\nnpm install ${component.dependencies.join(" ")}\n\`\`\`\n`;
  } else {
    output += `### Dependencies\nNo additional npm packages needed.\n`;
  }

  return output;
}
