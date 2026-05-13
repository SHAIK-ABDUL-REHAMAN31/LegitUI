// ════════════════════════════════════════════════════════════════
// Tool: search_components
// ════════════════════════════════════════════════════════════════
// Fuzzy search across all LegitUI components by name, description,
// tags, category, or dependencies. Ranked results with scoring.
// ════════════════════════════════════════════════════════════════

import { searchComponents, type LegitUIComponent } from "../lib/registry-loader.js";

export const definition = {
  name: "search_components",
  description:
    "Search LegitUI components by name, description, tags, or use case. " +
    "Use this when the developer describes what they want but doesn't know " +
    "the exact component name. Examples: 'gallery', 'orbit', 'text fade', " +
    "'WebGL background', '3D card', 'loading spinner'",
  inputSchema: {
    type: "object" as const,
    properties: {
      query: {
        type: "string",
        description: "Search query — component name, description, or use case",
      },
      limit: {
        type: "number",
        description: "Maximum results to return (default: 10)",
      },
    },
    required: ["query"],
  },
};

export async function handler(args: Record<string, unknown>): Promise<string> {
  const query = args.query as string;
  const limit = (args.limit as number) || 10;
  const results = await searchComponents(query);
  const limited = results.slice(0, limit);

  if (limited.length === 0) {
    return (
      `No components found for "${query}".\n\n` +
      `Try broader terms like: "text", "background", "3d", "gallery", ` +
      `"button", "loader", "scroll", "animation"`
    );
  }

  let output = `## Search Results for "${query}" — ${limited.length} found\n\n`;

  limited.forEach((c, i) => {
    const rank = i === 0 ? " ★ Best Match" : "";
    const deps =
      c.dependencies.length > 0 ? c.dependencies.join(", ") : "none";

    output += `### ${i + 1}. ${c.name} (\`${c.slug}\`)${rank}\n`;
    output += `Category: ${c.category}\n`;
    output += `"${c.description}"\n`;
    if (c.props && c.props.length > 0) {
      output += `Props: ${c.props.map((p) => `${p.name} (${p.type})`).join(", ")}\n`;
    }
    output += `Dependencies: ${deps}\n`;
    output += `Install: \`npx shadcn@latest add https://legitui.com/r/${c.slug}.json\`\n\n`;
  });

  output +=
    "---\n" +
    "Use `get_component` with the slug for full details, " +
    "or `install_component` to add it to your project.\n";

  return output;
}
