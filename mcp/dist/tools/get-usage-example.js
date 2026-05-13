// ════════════════════════════════════════════════════════════════
// Tool: get_usage_example
// ════════════════════════════════════════════════════════════════
// Returns a complete, working TSX usage example for a component.
// If the registry has a usageExample, uses that. Otherwise,
// generates one from the component's props and metadata.
// ════════════════════════════════════════════════════════════════
import { getComponent, searchComponents } from "../lib/registry-loader.js";
export const definition = {
    name: "get_usage_example",
    description: "Get a complete, working TSX usage example for a LegitUI component. " +
        "Returns import statements, prop usage, and a ready-to-paste code block.",
    inputSchema: {
        type: "object",
        properties: {
            slug: {
                type: "string",
                description: "Component slug in kebab-case. Example: orbit-gallery, shimmer-button",
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
    const componentName = c.fileName || c.name.replace(/\s+/g, "");
    // Use registry example if available
    if (c.usageExample) {
        let output = `# ${c.name} — Usage Example\n\n`;
        output += `\`\`\`tsx\n${c.usageExample}\n\`\`\`\n\n`;
        output += `**Install:** \`npx shadcn@latest add https://legitui.com/r/${slug}.json\`\n`;
        if (c.dependencies.length > 0) {
            output += `**Dependencies:** \`npm install ${c.dependencies.join(" ")}\`\n`;
        }
        return output;
    }
    // Generate a usage example from component metadata
    let example = `import ${componentName} from "@/components/ui/${componentName}";\n\n`;
    example += `export default function ${componentName}Demo() {\n`;
    example += `  return (\n`;
    example += `    <section className="min-h-screen flex items-center justify-center">\n`;
    // Build prop assignments from registry props
    if (c.props && c.props.length > 0) {
        const propLines = c.props
            .filter((p) => p.default !== undefined)
            .map((p) => {
            if (p.type === "string")
                return `        ${p.name}="${p.default}"`;
            if (p.type === "boolean")
                return `        ${p.name}={${p.default}}`;
            return `        ${p.name}={${p.default}}`;
        });
        if (propLines.length > 0) {
            example += `      <${componentName}\n`;
            example += propLines.join("\n") + "\n";
            example += `      />\n`;
        }
        else {
            example += `      <${componentName} />\n`;
        }
    }
    else {
        example += `      <${componentName} />\n`;
    }
    example += `    </section>\n`;
    example += `  );\n`;
    example += `}\n`;
    let output = `# ${c.name} — Usage Example\n\n`;
    output += `\`\`\`tsx\n${example}\`\`\`\n\n`;
    output += `**Import path:** \`@/components/ui/${componentName}\`\n`;
    output += `**Install:** \`npx shadcn@latest add https://legitui.com/r/${slug}.json\`\n`;
    if (c.dependencies.length > 0) {
        output += `\n**Dependencies:**\n\`\`\`bash\nnpm install ${c.dependencies.join(" ")}\n\`\`\`\n`;
    }
    return output;
}
//# sourceMappingURL=get-usage-example.js.map