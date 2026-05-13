#!/usr/bin/env node

// ════════════════════════════════════════════════════════════════
// LegitUI MCP — Windsurf Setup Script
// ════════════════════════════════════════════════════════════════
// Creates or updates .windsurf/mcp.json in the project root.
//
// Usage: node mcp/scripts/setup-windsurf.js
// ════════════════════════════════════════════════════════════════

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..", "..");
const windsurfDir = join(projectRoot, ".windsurf");
const configPath = join(windsurfDir, "mcp.json");

function main() {
  console.log("╔════════════════════════════════════════════════╗");
  console.log("║   LegitUI MCP — Windsurf Setup                ║");
  console.log("╚════════════════════════════════════════════════╝\n");

  const mcpDist = join(projectRoot, "mcp", "dist", "index.js");
  if (!existsSync(mcpDist)) {
    console.error(
      `❌ MCP server not built. Run first:\n   npm run mcp:build\n`
    );
    process.exit(1);
  }

  let config = { mcpServers: {} };
  if (existsSync(configPath)) {
    try {
      config = JSON.parse(readFileSync(configPath, "utf-8"));
      if (!config.mcpServers) config.mcpServers = {};
      console.log(`✅ Existing .windsurf/mcp.json found — merging.\n`);
    } catch {
      config = { mcpServers: {} };
    }
  }

  const existed = !!config.mcpServers["legitui"];
  config.mcpServers["legitui"] = {
    command: "node",
    args: ["./mcp/dist/index.js"],
    env: {
      LEGITUI_PROJECT_ROOT: ".",
      NODE_ENV: "development",
    },
  };

  if (!existsSync(windsurfDir)) {
    mkdirSync(windsurfDir, { recursive: true });
  }

  writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");

  console.log(
    existed
      ? `🔄 Updated LegitUI entry in .windsurf/mcp.json`
      : `✅ Added LegitUI MCP server to .windsurf/mcp.json`
  );
  console.log(`\n📄 Config: ${configPath}\n`);
  console.log("⚡ Restart Windsurf to activate.\n");
}

main();
