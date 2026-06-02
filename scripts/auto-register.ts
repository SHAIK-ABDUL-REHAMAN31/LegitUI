// ════════════════════════════════════════════════════════════════
// LegitUI — Auto-Register Script
// ════════════════════════════════════════════════════════════════
// Scans src/ui-components/ and auto-generates preview-map.ts
// from the component-registry.ts metadata + filesystem discovery.
//
// This eliminates the need to manually edit preview-map.ts when
// adding or removing components.
//
// Usage:  npx tsx scripts/auto-register.ts
//    or:  npm run auto:register
// ════════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

// ────────────────────────────────────────────────────
// Paths
// ────────────────────────────────────────────────────
const ROOT_DIR = path.resolve(__dirname, "..");
const UI_COMPONENTS_DIR = path.join(ROOT_DIR, "src", "ui-components");
const COMPONENT_REGISTRY_PATH = path.join(
  ROOT_DIR,
  "src",
  "lib",
  "component-registry.ts"
);
const PREVIEW_MAP_PATH = path.join(ROOT_DIR, "src", "lib", "preview-map.ts");

// ────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────
interface RegistryEntry {
  id: string;
  slug: string;
  name: string;
  folder: string;
  fileName: string;
  category: string;
  description: string;
  tags: string[];
  dependencies?: string[];
}

type ComponentWeight = "light" | "medium" | "heavy" | "extreme";

// ────────────────────────────────────────────────────
// Registry Parser (same as build-registry.ts)
// ────────────────────────────────────────────────────
function parseRegistryFile(): RegistryEntry[] {
  const source = fs.readFileSync(COMPONENT_REGISTRY_PATH, "utf-8");

  const startMarker = "export const defaultComponents";
  const startIdx = source.indexOf(startMarker);
  if (startIdx === -1) {
    throw new Error(
      "Could not find 'export const defaultComponents' in component-registry.ts"
    );
  }

  const eqIdx = source.indexOf("=", startIdx);
  if (eqIdx === -1) {
    throw new Error("Could not find '=' in defaultComponents declaration");
  }

  let bracketStart = source.indexOf("[", eqIdx);
  if (bracketStart === -1) {
    throw new Error("Could not find opening '[' for defaultComponents array");
  }

  let depth = 0;
  let bracketEnd = -1;
  for (let i = bracketStart; i < source.length; i++) {
    if (source[i] === "[") depth++;
    if (source[i] === "]") {
      depth--;
      if (depth === 0) {
        bracketEnd = i;
        break;
      }
    }
  }

  if (bracketEnd === -1) {
    throw new Error("Could not find matching ']' for defaultComponents array");
  }

  const arrayStr = source.substring(bracketStart, bracketEnd + 1);

  try {
    const fn = new Function(`return ${arrayStr};`);
    const result = fn();
    if (!Array.isArray(result)) {
      throw new Error("Parsed result is not an array");
    }
    return result as RegistryEntry[];
  } catch (evalErr) {
    throw new Error(
      `Failed to parse defaultComponents array.\n` +
        `Error: ${evalErr}\n\n` +
        `First 500 chars of extracted array:\n${arrayStr.substring(0, 500)}`
    );
  }
}

// ────────────────────────────────────────────────────
// Weight Inference
// ────────────────────────────────────────────────────

const HEAVY_DEPS = new Set(["three", "ogl", "@react-three/fiber", "@react-three/drei"]);
const EXTREME_DEPS = new Set(["@react-three/postprocessing"]);
const MEDIUM_DEPS = new Set(["gsap", "framer-motion", "matter-js", "split-type", "lenis"]);

function inferWeight(dependencies: string[]): ComponentWeight {
  if (!dependencies || dependencies.length === 0) return "light";

  const hasExtreme = dependencies.some((d) => EXTREME_DEPS.has(d));
  const hasHeavy = dependencies.some((d) => HEAVY_DEPS.has(d));
  const hasMedium = dependencies.some((d) => MEDIUM_DEPS.has(d));

  // Multiple heavy deps or heavy + extreme → extreme
  const heavyCount = dependencies.filter((d) => HEAVY_DEPS.has(d)).length;
  if (hasExtreme || heavyCount >= 2) return "extreme";
  if (hasHeavy) return "heavy";
  if (hasMedium) return "medium";
  return "light";
}

// ────────────────────────────────────────────────────
// Discover Usage Files
// ────────────────────────────────────────────────────

function getExactFilename(folderPath: string, filenamePattern: string): string | null {
  if (!fs.existsSync(folderPath)) return null;
  const files = fs.readdirSync(folderPath);
  const targetLower = filenamePattern.toLowerCase();
  const matched = files.find((f) => f.toLowerCase() === targetLower);
  return matched || null;
}

function hasDefaultExport(filePath: string): boolean {
  if (!fs.existsSync(filePath)) return false;
  const content = fs.readFileSync(filePath, "utf-8");
  return (
    /export\s+default\s+/.test(content) ||
    /export\s+\{\s*default\s*\}/.test(content) ||
    /export\s+\{\s*.*as\s+default\s*\}/.test(content)
  );
}

function findUsageFile(folderPath: string, fileName: string): string | null {
  // Prefer *Usage.tsx → *Usage.jsx ONLY if they have a default export
  const exactUsageTsx = getExactFilename(folderPath, `${fileName}Usage.tsx`);
  if (exactUsageTsx && hasDefaultExport(path.join(folderPath, exactUsageTsx))) {
    return exactUsageTsx.replace(/\.tsx$/, "");
  }

  const exactUsageJsx = getExactFilename(folderPath, `${fileName}Usage.jsx`);
  if (exactUsageJsx && hasDefaultExport(path.join(folderPath, exactUsageJsx))) {
    return exactUsageJsx.replace(/\.jsx$/, "");
  }

  // Fall back to main component file
  const exactMainTsx = getExactFilename(folderPath, `${fileName}.tsx`);
  if (exactMainTsx) return exactMainTsx.replace(/\.tsx$/, "");

  const exactMainJsx = getExactFilename(folderPath, `${fileName}.jsx`);
  if (exactMainJsx) return exactMainJsx.replace(/\.jsx$/, "");

  return null;
}

// ────────────────────────────────────────────────────
// Generate preview-map.ts Content
// ────────────────────────────────────────────────────

interface PreviewMapEntry {
  slug: string;
  folder: string;
  importFile: string;
  weight: ComponentWeight;
}

function generatePreviewMapContent(entries: PreviewMapEntry[]): string {
  // Group entries by weight
  const grouped: Record<ComponentWeight, PreviewMapEntry[]> = {
    light: [],
    medium: [],
    heavy: [],
    extreme: [],
  };

  for (const entry of entries) {
    grouped[entry.weight].push(entry);
  }

  // Sort each group alphabetically by slug
  for (const weight of Object.keys(grouped) as ComponentWeight[]) {
    grouped[weight].sort((a, b) => a.slug.localeCompare(b.slug));
  }

  const lines: string[] = [
    "// ════════════════════════════════════════════════════",
    "// LegitUI — Preview Map (slug → dynamic import + weight)",
    "// ════════════════════════════════════════════════════",
    "// AUTO-GENERATED by scripts/auto-register.ts",
    "// Do not edit manually — run: npm run auto:register",
    "//",
    "// Weights:",
    "//   light   — Pure CSS/JS, no heavy deps. Loads instantly.",
    "//   medium  — GSAP or Framer Motion. Loads in 1–2 seconds.",
    "//   heavy   — Three.js, OGL, or R3F. Loads in 2–4 seconds.",
    "//   extreme — R3F + postprocessing, physics, or multiple heavy deps.",
    "// ════════════════════════════════════════════════════",
    "",
    "export type ComponentWeight = 'light' | 'medium' | 'heavy' | 'extreme';",
    "",
    "export interface PreviewEntry {",
    "  load: () => Promise<{ default: React.ComponentType<any> }>;",
    "  weight: ComponentWeight;",
    "}",
    "",
    "export const PREVIEW_MAP: Record<string, PreviewEntry> = {",
  ];

  const weightLabels: Record<ComponentWeight, string> = {
    light: "LIGHT — Pure CSS/JS, no heavy deps",
    medium: "MEDIUM — GSAP or Framer Motion",
    heavy: "HEAVY — OGL / Three.js",
    extreme: "EXTREME — R3F + postprocessing / multiple heavy deps",
  };

  for (const weight of ["light", "medium", "heavy", "extreme"] as ComponentWeight[]) {
    const group = grouped[weight];
    if (group.length === 0) continue;

    lines.push(`  // ── ${weightLabels[weight]} ──`);
    for (const entry of group) {
      lines.push(
        `  '${entry.slug}': { load: () => import('@/ui-components/${entry.folder}/${entry.importFile}'), weight: '${entry.weight}' },`
      );
    }
    lines.push("");
  }

  // Remove trailing empty line before closing brace
  if (lines[lines.length - 1] === "") {
    lines.pop();
  }

  lines.push("};");
  lines.push("");
  lines.push("export type ComponentSlug = keyof typeof PREVIEW_MAP;");
  lines.push("");

  return lines.join("\n");
}

// ────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────

function main() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║  LegitUI — Auto-Register Components         ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  // 1. Parse registry
  console.log("  ◆ Parsing component-registry.ts...");
  let registryEntries: RegistryEntry[];
  try {
    registryEntries = parseRegistryFile();
    console.log(`    Found ${registryEntries.length} registry entries\n`);
  } catch (err) {
    console.error(`  ✗ Failed to parse registry: ${err}`);
    process.exit(1);
  }

  // 2. Discover component folders on disk
  console.log("  ◆ Scanning src/ui-components/...");
  const folderNames = fs.existsSync(UI_COMPONENTS_DIR)
    ? fs
        .readdirSync(UI_COMPONENTS_DIR, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
    : [];
  console.log(`    Found ${folderNames.length} component folders\n`);

  // 3. Build preview-map entries from registry
  const registryFolders = new Set(registryEntries.map((e) => e.folder));
  const previewEntries: PreviewMapEntry[] = [];
  let warnings = 0;

  console.log("  ◆ Generating preview-map entries...");

  for (const entry of registryEntries) {
    const exactFolder = folderNames.find((f) => f.toLowerCase() === entry.folder.toLowerCase());
    if (!exactFolder) {
      console.warn(
        `    ⚠ Registry entry '${entry.slug}' → folder '${entry.folder}/' does not exist (skipping)`
      );
      warnings++;
      continue;
    }

    const folderPath = path.join(UI_COMPONENTS_DIR, exactFolder);

    const importFile = findUsageFile(folderPath, entry.fileName);
    if (!importFile) {
      console.warn(
        `    ⚠ No importable file found for '${entry.slug}' in ${exactFolder}/ (skipping)`
      );
      warnings++;
      continue;
    }

    const weight = inferWeight(entry.dependencies || []);

    previewEntries.push({
      slug: entry.slug,
      folder: exactFolder,
      importFile,
      weight,
    });

    console.log(`    ✓ ${entry.slug}  → ${exactFolder}/${importFile}  [${weight}]`);
  }

  // 4. Check for orphaned folders
  console.log("\n  ◆ Checking for orphaned component folders...");
  let orphans = 0;
  for (const folder of folderNames) {
    if (!registryFolders.has(folder)) {
      console.warn(
        `    ⚠ ORPHAN: '${folder}/' exists but has no registry entry.`
      );
      console.warn(
        `      → Add to component-registry.ts or remove the folder.\n`
      );
      orphans++;
    }
  }

  if (orphans === 0) {
    console.log("    ✓ No orphaned folders found\n");
  } else {
    console.log(`    ${orphans} orphan(s) found\n`);
  }

  // 5. Write preview-map.ts
  console.log("  ◆ Writing src/lib/preview-map.ts...");
  const content = generatePreviewMapContent(previewEntries);
  fs.writeFileSync(PREVIEW_MAP_PATH, content, "utf-8");
  console.log(
    `    ✓ Generated with ${previewEntries.length} entries\n`
  );

  // 6. Summary
  console.log(
    `  Total: ${previewEntries.length} entries  |  Warnings: ${warnings}  |  Orphans: ${orphans}\n`
  );

  if (warnings > 0) {
    console.log("  ⚠ Completed with warnings.\n");
  } else {
    console.log("  ✓ Auto-register complete.\n");
  }
}

main();
