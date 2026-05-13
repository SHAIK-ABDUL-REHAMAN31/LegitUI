#!/usr/bin/env node

// ════════════════════════════════════════════════════════════════
// LegitUI MCP — Setup All AI Tools
// ════════════════════════════════════════════════════════════════
// Detects which AI tools are installed (Claude, Cursor, Windsurf)
// and configures all of them in a single command.
//
// Usage: node mcp/scripts/setup-all.js
// ════════════════════════════════════════════════════════════════

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { homedir, platform } from "node:os";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..", "..");
const mcpEntryPoint = join(projectRoot, "mcp", "dist", "index.js");

// ── Helpers ──

function readJsonSafe(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return null;
  }
}

function writeJsonSafe(path, data) {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2), "utf-8");
}

function upsertMcpEntry(config, entry) {
  if (!config) config = {};
  if (!config.mcpServers) config.mcpServers = {};
  const existed = !!config.mcpServers["legitui"];
  config.mcpServers["legitui"] = entry;
  return { config, existed };
}

// ── Tool Configs ──

function getClaudeConfigPath() {
  const os = platform();
  if (os === "win32") {
    return join(process.env.APPDATA || "", "Claude", "claude_desktop_config.json");
  }
  if (os === "darwin") {
    return join(homedir(), "Library", "Application Support", "Claude", "claude_desktop_config.json");
  }
  return join(homedir(), ".config", "claude", "claude_desktop_config.json");
}

const tools = [
  {
    name: "Claude Desktop",
    configPath: getClaudeConfigPath(),
    entry: {
      command: "node",
      args: [mcpEntryPoint],
      env: { LEGITUI_PROJECT_ROOT: projectRoot },
    },
    detect: () => {
      const configDir = dirname(getClaudeConfigPath());
      return existsSync(configDir);
    },
  },
  {
    name: "Cursor",
    configPath: join(projectRoot, ".cursor", "mcp.json"),
    entry: {
      command: "node",
      args: ["./mcp/dist/index.js"],
      env: { LEGITUI_PROJECT_ROOT: ".", NODE_ENV: "development" },
      description: "LegitUI component library MCP server",
    },
    detect: () => true, // Always configure for the local project
  },
  {
    name: "Windsurf",
    configPath: join(projectRoot, ".windsurf", "mcp.json"),
    entry: {
      command: "node",
      args: ["./mcp/dist/index.js"],
      env: { LEGITUI_PROJECT_ROOT: ".", NODE_ENV: "development" },
    },
    detect: () => true, // Always configure
  },
];

// ── Main ──

function main() {
  console.log("╔════════════════════════════════════════════════════╗");
  console.log("║   LegitUI MCP — Setup All AI Tools                ║");
  console.log("╚════════════════════════════════════════════════════╝\n");

  // Verify build exists
  if (!existsSync(mcpEntryPoint)) {
    console.error("❌ MCP server not built. Run first:\n   npm run mcp:build\n");
    process.exit(1);
  }

  console.log(`📁 Project: ${projectRoot}`);
  console.log(`📁 OS: ${platform()}\n`);

  let configured = 0;
  let skipped = 0;

  for (const tool of tools) {
    if (!tool.detect()) {
      console.log(`⏭️  ${tool.name} — not detected, skipping.`);
      skipped++;
      continue;
    }

    const existing = readJsonSafe(tool.configPath);
    const { config, existed } = upsertMcpEntry(existing, tool.entry);
    writeJsonSafe(tool.configPath, config);

    const action = existed ? "🔄 Updated" : "✅ Added";
    console.log(`${action}  ${tool.name} → ${tool.configPath}`);
    configured++;
  }

  console.log("\n─────────────────────────────────────────────────────");
  console.log(`   ${configured} tool(s) configured, ${skipped} skipped`);
  console.log("─────────────────────────────────────────────────────\n");

  if (configured > 0) {
    console.log("⚡ Next steps:");
    console.log("   1. Restart your AI tools (Claude / Cursor / Windsurf)");
    console.log("   2. The LegitUI tools will appear automatically");
    console.log('   3. Try: "What components does LegitUI have?"\n');
  }
}

main();
