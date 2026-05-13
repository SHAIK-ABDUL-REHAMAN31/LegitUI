#!/usr/bin/env node

// ════════════════════════════════════════════════════════════════
// LegitUI MCP — Cursor Setup Script
// ════════════════════════════════════════════════════════════════
// Creates or updates .cursor/mcp.json in the project root
// to connect Cursor's AI to the LegitUI MCP server.
//
// Usage: node mcp/scripts/setup-cursor.js
// ════════════════════════════════════════════════════════════════

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// ── Resolve paths ──

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..", "..");
const cursorDir = join(projectRoot, ".cursor");
const configPath = join(cursorDir, "mcp.json");

// ── Main ──

function main() {
  console.log("╔════════════════════════════════════════════════╗");
  console.log("║   LegitUI MCP — Cursor Setup                  ║");
  console.log("╚════════════════════════════════════════════════╝\n");

  // Verify MCP server is built
  const mcpDist = join(projectRoot, "mcp", "dist", "index.js");
  if (!existsSync(mcpDist)) {
    console.error(
      `❌ MCP server not built. Run first:\n   npm run mcp:build\n`
    );
    process.exit(1);
  }

  // Read existing config or start fresh
  let config = { mcpServers: {} };
  if (existsSync(configPath)) {
    try {
      config = JSON.parse(readFileSync(configPath, "utf-8"));
      if (!config.mcpServers) config.mcpServers = {};
      console.log(`✅ Existing .cursor/mcp.json found — merging.\n`);
    } catch {
      console.log(
        `⚠️  .cursor/mcp.json exists but failed to parse — creating new.\n`
      );
      config = { mcpServers: {} };
    }
  } else {
    console.log(`📝 No .cursor/mcp.json found — creating new.\n`);
  }

  // Add LegitUI MCP entry
  const existed = !!config.mcpServers["legitui"];
  config.mcpServers["legitui"] = {
    command: "node",
    args: ["./mcp/dist/index.js"],
    env: {
      LEGITUI_PROJECT_ROOT: ".",
      NODE_ENV: "development",
    },
    description:
      "LegitUI component library — query, search, and install 61+ premium React components via AI",
  };

  // Ensure .cursor directory exists
  if (!existsSync(cursorDir)) {
    mkdirSync(cursorDir, { recursive: true });
  }

  // Write config
  writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");

  if (existed) {
    console.log(`🔄 Updated existing LegitUI entry in .cursor/mcp.json`);
  } else {
    console.log(`✅ Added LegitUI MCP server to .cursor/mcp.json`);
  }

  console.log(`\n📄 Config written to:`);
  console.log(`   ${configPath}\n`);

  console.log("─────────────────────────────────────────────────");
  console.log("⚡ Next steps:");
  console.log("   1. Open this project in Cursor");
  console.log("   2. The LegitUI tools will appear automatically");
  console.log("   3. Try: \"Search for a 3D gallery component\"");
  console.log("─────────────────────────────────────────────────\n");

  // Also print the config for external developers
  console.log("═══════════════════════════════════════════════════");
  console.log("📋 For EXTERNAL developers (using LegitUI in their project):");
  console.log("   Add this to YOUR project's .cursor/mcp.json:\n");
  console.log(`   {`);
  console.log(`     "mcpServers": {`);
  console.log(`       "legitui": {`);
  console.log(`         "command": "npx",`);
  console.log(`         "args": ["-y", "@legitui/mcp"],`);
  console.log(`         "env": {`);
  console.log(`           "LEGITUI_PROJECT_ROOT": "."`);
  console.log(`         }`);
  console.log(`       }`);
  console.log(`     }`);
  console.log(`   }\n`);
  console.log("═══════════════════════════════════════════════════\n");
}

main();
