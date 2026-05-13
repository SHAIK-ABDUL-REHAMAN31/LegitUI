// ════════════════════════════════════════════════════════════════
// Tool: install_component
// ════════════════════════════════════════════════════════════════
// Actually RUNS the install command in the developer's project,
// adding the component files to their codebase via shadcn CLI.
// Includes dry-run mode for safety.
// ════════════════════════════════════════════════════════════════
import { execSync } from "node:child_process";
import { getComponent, PROJECT_ROOT } from "../lib/registry-loader.js";
export const definition = {
    name: "install_component",
    description: "Install a LegitUI component directly into the developer's project " +
        "using the shadcn CLI. This runs the actual install command. " +
        "IMPORTANT: Only run this after confirming with the developer " +
        "which component they want to install.",
    inputSchema: {
        type: "object",
        properties: {
            slug: {
                type: "string",
                description: "Component slug to install. Example: orbit-gallery",
            },
            method: {
                type: "string",
                enum: ["shadcn", "jsrepo"],
                description: "Install method: shadcn (recommended) or jsrepo. Default: shadcn",
            },
            target_dir: {
                type: "string",
                description: "Target directory for component files. Default: src/components/ui/",
            },
            dry_run: {
                type: "boolean",
                description: "If true, show the command that would run without executing it (default: false)",
            },
        },
        required: ["slug"],
    },
};
export async function handler(args) {
    const slug = args.slug;
    const method = args.method || "shadcn";
    const dryRun = args.dry_run === true;
    const component = await getComponent(slug);
    if (!component) {
        return `Component "${slug}" not found. Use \`search_components\` to find the correct slug.`;
    }
    const componentName = component.fileName || component.name.replace(/\s+/g, "");
    // Build the install command
    const commands = {
        shadcn: `npx shadcn@latest add https://legitui.com/r/${slug}.json`,
        jsrepo: `npx jsrepo add legitui.com/${slug}`,
    };
    const command = commands[method] || commands.shadcn;
    // Dry-run mode — show without executing
    if (dryRun) {
        let output = `## Dry Run — Install ${component.name}\n\n`;
        output += `**Would run:**\n\`\`\`bash\n${command}\n\`\`\`\n\n`;
        output += `**In directory:** \`${PROJECT_ROOT}\`\n\n`;
        if (component.dependencies.length > 0) {
            output += `**Then install deps:**\n\`\`\`bash\nnpm install ${component.dependencies.join(" ")}\n\`\`\`\n`;
        }
        else {
            output += "No additional dependencies required.\n";
        }
        return output;
    }
    // Execute the install command
    try {
        const output = execSync(command, {
            cwd: PROJECT_ROOT,
            encoding: "utf-8",
            timeout: 60_000,
        });
        let result = `✅ **${component.name}** installed successfully!\n\n`;
        result += `**Command:** \`${command}\`\n\n`;
        if (output.trim()) {
            result += `**Output:**\n\`\`\`\n${output.trim()}\n\`\`\`\n\n`;
        }
        result += `**Import in your component:**\n`;
        result += `\`\`\`tsx\nimport ${componentName} from "@/components/ui/${componentName}";\n\`\`\`\n\n`;
        if (component.dependencies.length > 0) {
            result += `**Install dependencies:**\n`;
            result += `\`\`\`bash\nnpm install ${component.dependencies.join(" ")}\n\`\`\`\n\n`;
        }
        result += `**Quick start:**\n`;
        result += `\`\`\`tsx\n<${componentName} />\n\`\`\`\n`;
        return result;
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        let result = `❌ **Install failed for ${component.name}**\n\n`;
        result += `**Command:** \`${command}\`\n`;
        result += `**Error:** ${message}\n\n`;
        result += `**Common fixes:**\n`;
        result += `- Ensure shadcn is configured: \`npx shadcn@latest init\`\n`;
        result += `- Check you're in the correct project directory\n`;
        result += `- Try manual install: copy from https://legitui.com/components/${slug}\n`;
        return result;
    }
}
//# sourceMappingURL=install-component.js.map