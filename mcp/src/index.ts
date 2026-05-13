#!/usr/bin/env node

// ════════════════════════════════════════════════════════════════
// LegitUI MCP Server — Main Entry Point
// ════════════════════════════════════════════════════════════════
// Exposes the LegitUI component library to AI assistants via MCP.
//
// Tools (8):
//   • list_components      — List all components (optionally by category)
//   • search_components    — Fuzzy search by name, description, tags
//   • get_component        — Full details for a single component
//   • get_component_props  — Detailed props table with types/defaults
//   • get_component_source — Read the actual source code (TSX/JSX/CSS)
//   • get_usage_example    — Complete working TSX usage example
//   • get_install_command  — Get install commands (shadcn, manual)
//   • install_component    — Actually run the install command
//
// Resources (3):
//   • legitui://components       — Full component registry as JSON
//   • legitui://categories       — All categories with counts
//   • legitui://component/{slug} — Single component data as JSON
//
// Transport: stdio (standard for MCP child-process servers)
// ════════════════════════════════════════════════════════════════

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { getRegistry, getCategories, getComponent as getComponentData, listByCategory } from "./lib/registry-loader.js";

// ── Import tool modules ──
import * as listComponents from "./tools/list-components.js";
import * as searchComponents from "./tools/search-components.js";
import * as getComponent from "./tools/get-component.js";
import * as getSource from "./tools/get-source.js";
import * as getInstallCommand from "./tools/get-install-command.js";
import * as installComponent from "./tools/install-component.js";
import * as getProps from "./tools/get-props.js";
import * as getUsageExample from "./tools/get-usage-example.js";

// ── Tool registry — maps tool name → handler ──
interface ToolModule {
  definition: {
    name: string;
    description: string;
    inputSchema: {
      type: "object";
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
  handler: (args: Record<string, unknown>) => Promise<string>;
}

const TOOL_MODULES: Record<string, ToolModule> = {
  list_components: listComponents,
  search_components: searchComponents,
  get_component: getComponent,
  get_component_props: getProps,
  get_component_source: getSource,
  get_usage_example: getUsageExample,
  get_install_command: getInstallCommand,
  install_component: installComponent,
};

// ── Server ──

const server = new Server(
  {
    name: "legitui",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// ── List all available tools ──
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: Object.values(TOOL_MODULES).map((m) => m.definition),
}));

// ── Handle tool calls ──
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const tool = TOOL_MODULES[name];

  if (!tool) {
    return {
      content: [
        {
          type: "text",
          text: `Unknown tool: "${name}". Available tools: ${Object.keys(TOOL_MODULES).join(", ")}`,
        },
      ],
      isError: true,
    };
  }

  try {
    const result = await tool.handler((args as Record<string, unknown>) || {});
    return { content: [{ type: "text", text: result }] };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text", text: `Error in ${name}: ${message}` }],
      isError: true,
    };
  }
});

// ── List available resources ──
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const registry = await getRegistry();
  const componentResources = registry.components.map((c) => ({
    uri: `legitui://component/${c.slug}`,
    name: c.name,
    description: c.description,
    mimeType: "application/json",
  }));

  return {
    resources: [
      {
        uri: "legitui://components",
        name: "LegitUI Component Registry",
        description: "Full list of all LegitUI components with metadata",
        mimeType: "application/json",
      },
      {
        uri: "legitui://categories",
        name: "LegitUI Categories",
        description: "All categories with component counts",
        mimeType: "application/json",
      },
      ...componentResources,
    ],
  };
});

// ── Handle resource reads ──
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === "legitui://components") {
    const registry = await getRegistry();
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(registry, null, 2),
        },
      ],
    };
  }

  if (uri === "legitui://categories") {
    const categories = await getCategories();
    const registry = await getRegistry();
    const componentCount: Record<string, number> = {};
    for (const c of registry.components) {
      componentCount[c.category] = (componentCount[c.category] || 0) + 1;
    }
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify({ categories, componentCount }, null, 2),
        },
      ],
    };
  }

  // Dynamic resource: legitui://component/{slug}
  const match = uri.match(/^legitui:\/\/component\/(.+)$/);
  if (match) {
    const slug = match[1];
    const component = await getComponentData(slug);
    if (!component) {
      throw new Error(`Component not found: ${slug}`);
    }
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(component, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

// ── Error Handling ──

process.on("uncaughtException", (err) => {
  process.stderr.write(`LegitUI MCP — Uncaught exception: ${err}\n`);
});

process.on("unhandledRejection", (reason) => {
  process.stderr.write(`LegitUI MCP — Unhandled rejection: ${reason}\n`);
});

// ── Start ──

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write("LegitUI MCP server started (stdio transport)\n");
}

main().catch((err) => {
  process.stderr.write(`Failed to start LegitUI MCP server: ${err}\n`);
  process.exit(1);
});
