// ════════════════════════════════════════════════════════════════
// Tool: get_component_source
// ════════════════════════════════════════════════════════════════
// Returns the actual source code (TSX, JSX, or CSS) of a component.
// Reads from disk first, falls back to the registry JSON files.
// ════════════════════════════════════════════════════════════════
import { getComponent, getComponentSource } from "../lib/registry-loader.js";
export const definition = {
    name: "get_component_source",
    description: "Get the full source code of a LegitUI component. " +
        "Returns TypeScript, JavaScript, or CSS source. " +
        "Use this when the developer wants to understand how a component " +
        "works or needs to customize it.",
    inputSchema: {
        type: "object",
        properties: {
            slug: {
                type: "string",
                description: "Component slug in kebab-case. Example: orbit-gallery",
            },
            variant: {
                type: "string",
                enum: ["tsx", "jsx", "css"],
                description: "Source variant: tsx (TypeScript), jsx (JavaScript), css (styles). Default: tsx",
            },
        },
        required: ["slug"],
    },
};
export async function handler(args) {
    const slug = args.slug;
    const variant = args.variant || "tsx";
    const component = await getComponent(slug);
    if (!component) {
        return `Component "${slug}" not found. Use \`search_components\` to find the correct slug.`;
    }
    let source = await getComponentSource(slug, variant);
    let actualVariant = variant;
    // Fallback: if TSX not found, try JSX (and vice versa)
    if (!source && (variant === "tsx" || variant === "jsx")) {
        const fallbackVariant = variant === "tsx" ? "jsx" : "tsx";
        source = await getComponentSource(slug, fallbackVariant);
        if (source)
            actualVariant = fallbackVariant;
    }
    if (!source) {
        return (`Source file not found for "${slug}" (variant: ${variant}).\n\n` +
            `The file might not exist locally. Try:\n` +
            `- A different variant: tsx, jsx, or css\n` +
            `- Fetching from: https://legitui.com/r/${slug}.json`);
    }
    const lines = source.split("\n").length;
    const sizeKB = (Buffer.byteLength(source, "utf-8") / 1024).toFixed(1);
    const langMap = { tsx: "tsx", jsx: "jsx", css: "css" };
    const note = actualVariant !== variant
        ? `\n> Note: ${variant.toUpperCase()} not available. Showing ${actualVariant.toUpperCase()} instead.\n`
        : "";
    let output = `# ${component.name} — ${actualVariant.toUpperCase()} Source (\`${slug}\`)\n${note}\n`;
    output += `\`\`\`${langMap[actualVariant]}\n${source}\n\`\`\`\n\n`;
    output += `---\n`;
    output += `Lines: ${lines} | Size: ${sizeKB} KB\n`;
    output += `Install: \`npx shadcn@latest add https://legitui.com/r/${slug}.json\`\n`;
    return output;
}
//# sourceMappingURL=get-source.js.map