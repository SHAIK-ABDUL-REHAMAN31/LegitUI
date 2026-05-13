// ════════════════════════════════════════════════════════════════
// Tool: list_components
// ════════════════════════════════════════════════════════════════
// Lists all LegitUI components, optionally filtered by category,
// featured status, or new status.
// ════════════════════════════════════════════════════════════════
import { listByCategory, getCategories, } from "../lib/registry-loader.js";
export const definition = {
    name: "list_components",
    description: "List all available LegitUI components. Optionally filter by category. " +
        "Categories: Backgrounds, TextAnimations, Animations, Buttons, Cards, " +
        "Loaders, Inputs, Navigation, LegitComponents",
    inputSchema: {
        type: "object",
        properties: {
            category: {
                type: "string",
                description: "Filter by category: Backgrounds | TextAnimations | Animations | " +
                    "Buttons | Cards | Loaders | Inputs | Navigation | LegitComponents",
            },
            featured_only: {
                type: "boolean",
                description: "If true, only return featured/highlighted components",
            },
            new_only: {
                type: "boolean",
                description: "If true, only return recently added components",
            },
        },
    },
};
function formatComponent(c) {
    const deps = c.dependencies.length > 0 ? c.dependencies.join(", ") : "none";
    const tags = c.tags.join(", ");
    const badges = [c.isNew ? "🆕" : "", c.featured ? "⭐" : ""]
        .filter(Boolean)
        .join(" ");
    return (`- **${c.name}** (\`${c.slug}\`) ${badges}\n` +
        `  ${c.description}\n` +
        `  Tags: ${tags} | Deps: ${deps}`);
}
export async function handler(args) {
    const category = args?.category;
    const featuredOnly = args?.featured_only === true;
    const newOnly = args?.new_only === true;
    let components = await listByCategory(category);
    const categories = await getCategories();
    // Apply filters
    if (featuredOnly) {
        components = components.filter((c) => c.featured);
    }
    if (newOnly) {
        components = components.filter((c) => c.isNew);
    }
    if (components.length === 0) {
        return (`No components found${category ? ` in category "${category}"` : ""}.\n\n` +
            `Available categories: ${categories.join(", ")}`);
    }
    // Group by category
    const grouped = new Map();
    for (const c of components) {
        if (!grouped.has(c.category))
            grouped.set(c.category, []);
        grouped.get(c.category).push(c);
    }
    let output = `## LegitUI Components — ${category || "All"} (${components.length} total)\n\n`;
    for (const [cat, comps] of grouped) {
        output += `### ${cat} (${comps.length} components)\n`;
        for (const c of comps) {
            output += formatComponent(c) + "\n";
        }
        output += "\n";
    }
    output += "---\n";
    output += "Install any component:\n";
    output += "```bash\nnpx shadcn@latest add https://legitui.com/r/{slug}.json\n```\n";
    return output;
}
//# sourceMappingURL=list-components.js.map