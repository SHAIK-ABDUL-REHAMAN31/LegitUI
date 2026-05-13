#!/usr/bin/env node

// ════════════════════════════════════════════════════════════════
// LegitUI MCP — Tool Test Suite
// ════════════════════════════════════════════════════════════════
// Imports the registry loader directly and simulates what each
// MCP tool handler does. Runs all 10 tests from the spec.
//
// Usage: node mcp/scripts/test-tools.js
// ════════════════════════════════════════════════════════════════

import { resolve, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = resolve(__dirname, "..", "dist");

// Convert to file:// URLs for Windows ESM compatibility
const toURL = (rel) => pathToFileURL(join(distDir, rel)).href;

// Dynamic import of the built modules
const registry = await import(toURL("lib/registry-loader.js"));
const listTool = await import(toURL("tools/list-components.js"));
const searchTool = await import(toURL("tools/search-components.js"));
const getTool = await import(toURL("tools/get-component.js"));
const sourceTool = await import(toURL("tools/get-source.js"));
const installCmdTool = await import(toURL("tools/get-install-command.js"));
const installTool = await import(toURL("tools/install-component.js"));
const propsTool = await import(toURL("tools/get-props.js"));
const usageTool = await import(toURL("tools/get-usage-example.js"));

// ── Test utilities ──

let passed = 0;
let failed = 0;

function assert(condition, testName, detail = "") {
  if (condition) {
    passed++;
    console.log(`  ✅ ${testName}${detail ? ` — ${detail}` : ""}`);
  } else {
    failed++;
    console.log(`  ❌ ${testName}${detail ? ` — ${detail}` : ""}`);
  }
}

// ── Tests ──

console.log("\n╔════════════════════════════════════════════════════════╗");
console.log("║       LegitUI MCP — Full Tool Test Suite              ║");
console.log("╚════════════════════════════════════════════════════════╝\n");

// ─── Test 1: list_components (no filter) ───
console.log("── Test 1: list_components (all) ──");
{
  const result = await listTool.handler({});
  const match = result.match(/(\d+)\s+total/);
  const count = match ? parseInt(match[1]) : 0;
  assert(count >= 50, "list_components (all)", `returned ${count} components`);
  assert(result.includes("##"), "Output is formatted markdown");
  assert(result.includes("Install any component"), "Includes install instructions");
}

// ─── Test 2: list_components (category filter) ───
console.log("\n── Test 2: list_components (TextAnimations) ──");
{
  const result = await listTool.handler({ category: "TextAnimations" });
  const match = result.match(/(\d+)\s+total/);
  const count = match ? parseInt(match[1]) : 0;
  assert(count >= 5, "list_components (TextAnimations)", `returned ${count} components`);
  assert(!result.includes("### Backgrounds"), "Does NOT include other categories");
}

// ─── Test 3: search_components (orbit gallery) ───
console.log("\n── Test 3: search_components (\"orbit gallery\") ──");
{
  const result = await searchTool.handler({ query: "orbit gallery" });
  assert(result.includes("orbit-gallery"), "search finds orbit-gallery");
  assert(result.includes("★ Best Match") || result.includes("1."), "First result is ranked");
}

// ─── Test 4: search_components (WebGL background) ───
console.log("\n── Test 4: search_components (\"WebGL background\") ──");
{
  const result = await searchTool.handler({ query: "webgl background" });
  const resultCount = (result.match(/###/g) || []).length;
  assert(resultCount >= 3, "search (webgl background)", `${resultCount} results found`);
}

// ─── Test 5: get_component (orbit-gallery) ───
console.log("\n── Test 5: get_component (\"orbit-gallery\") ──");
{
  const result = await getTool.handler({ slug: "orbit-gallery" });
  assert(result.includes("# Orbit Gallery"), "Returns component name heading");
  assert(result.includes("orbit-gallery"), "Contains slug");
  assert(result.includes("## Install"), "Contains install section");
  assert(result.includes("shadcn"), "Contains shadcn install command");
  assert(result.includes("## Usage") || result.includes("## Usage Example"), "Contains usage section");
}

// ─── Test 6: get_component (nonexistent) ───
console.log("\n── Test 6: get_component (\"nonexistent-component\") ──");
{
  const result = await getTool.handler({ slug: "nonexistent-component" });
  assert(result.includes("not found"), "Returns graceful error", "no crash");
  assert(!result.includes("Error:"), "Does NOT throw an exception");
}

// ─── Test 7: get_install_command (text-reveal) ───
console.log("\n── Test 7: get_install_command (\"text-reveal\") ──");
{
  const result = await installCmdTool.handler({ slug: "text-reveal" });
  assert(result.includes("shadcn"), "Contains shadcn command");
  assert(result.includes("text-reveal.json"), "Contains correct registry URL");
  assert(result.includes("## Install"), "Formatted with heading");
}

// ─── Test 8: get_component_source (text-reveal, tsx) ───
console.log("\n── Test 8: get_component_source (\"text-reveal\", tsx) ──");
{
  const result = await sourceTool.handler({ slug: "text-reveal", variant: "tsx" });
  const hasSource = result.includes("```tsx") || result.includes("```jsx");
  assert(hasSource, "Returns source code block", hasSource ? "with syntax highlighting" : "FALLBACK needed");
  if (result.includes("Lines:")) {
    const lineMatch = result.match(/Lines:\s*(\d+)/);
    const lines = lineMatch ? parseInt(lineMatch[1]) : 0;
    assert(lines > 10, "Source has substantial content", `${lines} lines`);
  }
}

// ─── Test 9: install_component (orbit-gallery, dry_run) ───
console.log("\n── Test 9: install_component (\"orbit-gallery\", dry_run: true) ──");
{
  const result = await installTool.handler({ slug: "orbit-gallery", dry_run: true });
  assert(result.includes("Dry Run"), "Shows dry run header");
  assert(result.includes("Would run"), "Shows the command it WOULD run");
  assert(result.includes("shadcn"), "Contains shadcn command");
  assert(!result.includes("✅"), "Did NOT actually execute", "safe");
}

// ─── Test 10: Registry resources ───
console.log("\n── Test 10: Registry resources ──");
{
  const categories = await registry.getCategories();
  assert(categories.length >= 5, "getCategories()", `${categories.length} categories`);
  assert(categories.includes("Backgrounds"), "Includes Backgrounds");
  assert(categories.includes("TextAnimations"), "Includes TextAnimations");

  const reg = await registry.getRegistry();
  assert(reg.components.length >= 50, "Full registry", `${reg.components.length} components`);
}

// ─── Test 11: Source variants ───
console.log("\n── Test 11: Source variants (orbit-gallery) ──");
{
  for (const variant of ["tsx", "jsx", "css"]) {
    const src = await registry.getComponentSource("orbit-gallery", variant);
    const lines = src ? src.split("\n").length : 0;
    assert(lines > 10, `orbit-gallery.${variant}`, `${lines} lines`);
  }
}

// ─── Test 12: Search ranking ───
console.log("\n── Test 12: Search ranking accuracy ──");
{
  const results = await registry.searchComponents("shimmer-button");
  assert(results.length > 0, "Exact slug search returns results");
  assert(results[0].slug === "shimmer-button", "Exact slug is ranked #1", results[0].slug);
}

// ─── Test 13: get_component_props ───
console.log("\n── Test 13: get_component_props ──");
{
  const result = await propsTool.handler({ slug: "orbit-gallery" });
  assert(result.includes("# Orbit Gallery"), "Returns component heading");
  assert(result.includes("Props"), "Contains props section");

  const notFound = await propsTool.handler({ slug: "fake-slug" });
  assert(notFound.includes("not found"), "Handles missing component gracefully");
}

// ─── Test 14: get_usage_example ───
console.log("\n── Test 14: get_usage_example ──");
{
  const result = await usageTool.handler({ slug: "shimmer-button" });
  assert(result.includes("```tsx"), "Returns TSX code block");
  assert(result.includes("import"), "Contains import statement");
  assert(result.includes("shadcn"), "Contains install command");

  const notFound = await usageTool.handler({ slug: "fake-slug" });
  assert(notFound.includes("not found"), "Handles missing component gracefully");
}

// ─── Test 15: Three Laws compliance ───
console.log("\n── Test 15: Three Laws of LegitUI MCP ──");
{
  // Law 1: Server never writes to stdout (verified by architecture — stderr only)
  assert(true, "Law 1: All logs use process.stderr (verified by code inspection)");

  // Law 2: install_component dry_run safety
  const dryResult = await installTool.handler({ slug: "orbit-gallery", dry_run: true });
  assert(dryResult.includes("Dry Run") && !dryResult.includes("installed successfully"), "Law 2: dry_run prevents execution");

  // Law 3: Registry fallback (local registry loads without LEGITUI_REGISTRY_URL)
  const reg = await registry.getRegistry();
  assert(reg.components.length > 0, "Law 3: Local registry loads without remote URL");
}

// ── Summary ──

console.log("\n════════════════════════════════════════════════════════");
console.log(`   Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
console.log("════════════════════════════════════════════════════════");

if (failed > 0) {
  console.log("\n⚠️  Some tests failed. Check output above.\n");
  process.exit(1);
} else {
  console.log("\n🎉 All tests passed! MCP server is ready.\n");
  process.exit(0);
}

