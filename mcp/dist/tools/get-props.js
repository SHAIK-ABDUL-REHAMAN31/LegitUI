// ════════════════════════════════════════════════════════════════
// Tool: get_component_props
// ════════════════════════════════════════════════════════════════
// Returns a detailed props table for a component — types, defaults,
// min/max ranges, options, and descriptions. Focused tool for when
// the AI just needs prop info, not the full component details.
// ════════════════════════════════════════════════════════════════
import { getComponent, searchComponents } from "../lib/registry-loader.js";
export const definition = {
    name: "get_component_props",
    description: "Get the detailed props table for a LegitUI component. " +
        "Returns types, defaults, min/max ranges, and descriptions. " +
        "Use when you need prop details without full component info.",
    inputSchema: {
        type: "object",
        properties: {
            slug: {
                type: "string",
                description: "Component slug in kebab-case. Example: orbit-gallery, text-reveal",
            },
        },
        required: ["slug"],
    },
};
export async function handler(args) {
    const slug = args.slug;
    const c = await getComponent(slug);
    if (!c) {
        const suggestions = await searchComponents(slug);
        const hint = suggestions.length > 0
            ? `\n\nDid you mean:\n${suggestions
                .slice(0, 5)
                .map((s) => `- \`${s.slug}\` — ${s.name}`)
                .join("\n")}`
            : "";
        return `Component "${slug}" not found.${hint}`;
    }
    if (!c.props || c.props.length === 0) {
        return (`# ${c.name} — Props\n\n` +
            `This component has no configurable props documented in the registry.\n\n` +
            `Use \`get_component_source\` with slug \`${slug}\` to inspect the source code directly.`);
    }
    let output = `# ${c.name} — Props Reference\n\n`;
    output += `| Prop | Type | Default | Required | Description |\n`;
    output += `|------|------|---------|----------|-------------|\n`;
    for (const p of c.props) {
        const def = p.default !== undefined ? `\`${p.default}\`` : "—";
        const req = p.required ? "✅" : "—";
        let desc = p.description || "";
        // Append range info if available
        if (p.min !== undefined || p.max !== undefined) {
            const range = [
                p.min !== undefined ? `min: ${p.min}` : "",
                p.max !== undefined ? `max: ${p.max}` : "",
                p.step !== undefined ? `step: ${p.step}` : "",
            ]
                .filter(Boolean)
                .join(", ");
            desc += ` (${range})`;
        }
        // Append options if available
        if (p.options && p.options.length > 0) {
            const opts = p.options.map((o) => `\`${o.value}\``).join(" · ");
            desc += ` Options: ${opts}`;
        }
        output += `| \`${p.name}\` | \`${p.type}\` | ${def} | ${req} | ${desc} |\n`;
    }
    output += `\n**Total:** ${c.props.length} props\n`;
    return output;
}
//# sourceMappingURL=get-props.js.map