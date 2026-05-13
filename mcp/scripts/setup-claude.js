#!/usr/bin/env node

// ════════════════════════════════════════════════════════════════
// LegitUI MCP — Claude Code / Claude Desktop Setup Script
// ════════════════════════════════════════════════════════════════
// Automatically detects your OS, finds the Claude config file,
// and adds the LegitUI MCP server entry.
//
// Usage: node mcp/scripts/setup-claude.js
// ════════════════════════════════════════════════════════════════

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { homedir, platform } from "node:os";
import { fileURLToPath } from "node:url";

// ── Resolve paths ──

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..", "..");
const mcpEntryPoint = join(projectRoot, "mcp", "dist", "index.js");

// ── Detect OS & config path ──

function getClaudeConfigPath() {
  const os = platform();

  if (os === "win32") {
    const appData = process.env.APPDATA;
    if (!appData) {
      console.error("❌ APPDATA environment variable not found.");
      process.exit(1);
    }
    return join(appData, "Claude", "claude_desktop_config.json");
  }

  if (os === "darwin") {
    return join(
      homedir(),
      "Library",
      "Application Support",
      "Claude",
      "claude_desktop_config.json"
    );
  }

  // Linux
  return join(homedir(), ".config", "claude", "claude_desktop_config.json");
}

// ── Main ──

function main() {
  console.log("╔════════════════════════════════════════════════╗");
  console.log("║   LegitUI MCP — Claude Setup                  ║");
  console.log("╚════════════════════════════════════════════════╝\n");

  // Verify MCP server is built
  if (!existsSync(mcpEntryPoint)) {
    console.error(
      `❌ MCP server not built. Run first:\n   npm run mcp:build\n`
    );
    process.exit(1);
  }

  const configPath = getClaudeConfigPath();
  console.log(`📁 OS: ${platform()}`);
  console.log(`📄 Config: ${configPath}\n`);

  // Read existing config or start fresh
  let config = { mcpServers: {} };
  if (existsSync(configPath)) {
    try {
      config = JSON.parse(readFileSync(configPath, "utf-8"));
      if (!config.mcpServers) config.mcpServers = {};
      console.log(`✅ Existing config found — merging.\n`);
    } catch {
      console.log(`⚠️  Config exists but failed to parse — creating new.\n`);
      config = { mcpServers: {} };
    }
  } else {
    console.log(`📝 No config found — creating new.\n`);
  }

  // Add LegitUI MCP entry
  const existingEntry = config.mcpServers["legitui"];
  config.mcpServers["legitui"] = {
    command: "node",
    args: [mcpEntryPoint],
    env: {
      LEGITUI_PROJECT_ROOT: projectRoot,
    },
  };

  // Ensure directory exists
  const configDir = dirname(configPath);
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }

  // Write config
  writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");

  // Summary
  if (existingEntry) {
    console.log(`🔄 Updated existing LegitUI MCP entry.`);
  } else {
    console.log(`✅ Added LegitUI MCP server to Claude config.`);
  }

  console.log(`\n📄 Config written to:`);
  console.log(`   ${configPath}\n`);

  console.log(`📋 Entry added:`);
  console.log(`   {`);
  console.log(`     "command": "node",`);
  console.log(`     "args": ["${mcpEntryPoint}"],`);
  console.log(`     "env": {`);
  console.log(`       "LEGITUI_PROJECT_ROOT": "${projectRoot}"`);
  console.log(`     }`);
  console.log(`   }\n`);

  console.log("─────────────────────────────────────────────────");
  console.log("⚡ Next steps:");
  console.log("   1. Restart Claude Desktop (or Claude Code)");
  console.log("   2. The LegitUI tools will appear automatically");
  console.log(
    '   3. Try: "What components does LegitUI have?"'
  );
  console.log("─────────────────────────────────────────────────\n");
}

main();
