// ════════════════════════════════════════════════════════════════
// LegitUI — Validate Registry Consistency
// ════════════════════════════════════════════════════════════════
// Validates that:
//  1. Every registry entry has a matching folder in ui-components/
//  2. Every component folder has a registry entry
//  3. Every component has a .tsx or .jsx source file
//  4. preview-map.ts and component-registry.ts are in sync
//  5. No duplicate slugs or IDs
//  6. Generated JSON in public/registry/ is valid (if present)
//
// Usage:  npx tsx scripts/validate-registry.ts
//    or:  npm run validate:registry
//
// Exit codes:
//   0 = All checks passed
//   1 = Errors found (build would fail)
// ════════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

// ────────────────────────────────────────────────────
// Paths
// ────────────────────────────────────────────────────
const ROOT_DIR = path.resolve(__dirname, "..");
const UI_COMPONENTS_DIR = path.join(ROOT_DIR, "src", "ui-components");
const REGISTRY_DIR = path.join(ROOT_DIR, "public", "registry");
const COMPONENT_REGISTRY_PATH = path.join(
  ROOT_DIR,
  "src",
  "lib",
  "component-registry.ts"
);
const PREVIEW_MAP_PATH = path.join(ROOT_DIR, "src", "lib", "preview-map.ts");

// ────────────────────────────────────────────────────
// Minimal registry entry type for validation
// ────────────────────────────────────────────────────
interface RegistryEntry {
  id: string;
  slug: string;
  name: string;
  folder: string;
  fileName: string;
  category: string;
  description: string;
  [key: string]: unknown;
}

// ────────────────────────────────────────────────────
// Parser (same as build-registry.ts)
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
      `Failed to parse defaultComponents array: ${evalErr}`
    );
  }
}

// ────────────────────────────────────────────────────
// Extract slugs from preview-map.ts
// ────────────────────────────────────────────────────

function getPreviewMapSlugs(): Set<string> {
  if (!fs.existsSync(PREVIEW_MAP_PATH)) {
    return new Set();
  }
  const source = fs.readFileSync(PREVIEW_MAP_PATH, "utf-8");
  const slugRegex = /'([a-z0-9-]+)'\s*:/g;
  const slugs = new Set<string>();
  let match;
  while ((match = slugRegex.exec(source)) !== null) {
    slugs.add(match[1]);
  }
  return slugs;
}

// ────────────────────────────────────────────────────
// Validate generated JSON files
// ────────────────────────────────────────────────────

function validateGeneratedJSON(
  registryEntries: RegistryEntry[]
): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!fs.existsSync(REGISTRY_DIR)) {
    warnings.push(
      "public/registry/ directory does not exist — run 'npm run registry:build' first"
    );
    return { errors, warnings };
  }

  // Check index.json
  const indexPath = path.join(REGISTRY_DIR, "index.json");
  if (!fs.existsSync(indexPath)) {
    warnings.push(
      "public/registry/index.json does not exist — run 'npm run registry:build'"
    );
  } else {
    try {
      const content = fs.readFileSync(indexPath, "utf-8");
      const parsed = JSON.parse(content);
      if (
        !parsed.components ||
        !Array.isArray(parsed.components)
      ) {
        errors.push(
          "public/registry/index.json has invalid structure (missing 'components' array)"
        );
      } else if (parsed.components.length !== registryEntries.length) {
        warnings.push(
          `public/registry/index.json has ${parsed.components.length} components ` +
            `but registry has ${registryEntries.length} — rebuild needed`
        );
      }
    } catch (err) {
      errors.push(`public/registry/index.json is malformed JSON: ${err}`);
    }
  }

  // Check per-component JSON files
  for (const entry of registryEntries) {
    const jsonPath = path.join(REGISTRY_DIR, `${entry.slug}.json`);
    if (!fs.existsSync(jsonPath)) {
      warnings.push(
        `public/registry/${entry.slug}.json does not exist — rebuild needed`
      );
      continue;
    }

    try {
      const content = fs.readFileSync(jsonPath, "utf-8");
      const parsed = JSON.parse(content);

      if (!parsed.name || !parsed.slug || !parsed.files) {
        errors.push(
          `public/registry/${entry.slug}.json has invalid structure ` +
            `(missing name, slug, or files)`
        );
      }

      if (parsed.slug !== entry.slug) {
        errors.push(
          `public/registry/${entry.slug}.json has mismatched slug: ` +
            `'${parsed.slug}' vs registry '${entry.slug}'`
        );
      }

      if (
        !parsed.files ||
        !Array.isArray(parsed.files) ||
        parsed.files.length === 0
      ) {
        errors.push(
          `public/registry/${entry.slug}.json has no files array or is empty`
        );
      }
    } catch (err) {
      errors.push(
        `public/registry/${entry.slug}.json is malformed JSON: ${err}`
      );
    }
  }

  return { errors, warnings };
}

// ────────────────────────────────────────────────────
// Main Validation
// ────────────────────────────────────────────────────

function main() {
  console.log("╔════════════════════════════════════════════════╗");
  console.log("║  LegitUI — Validating Registry Consistency    ║");
  console.log("╚════════════════════════════════════════════════╝\n");

  // 1. Parse the registry
  console.log("  ◆ Parsing component-registry.ts...");
  let registryEntries: RegistryEntry[];
  try {
    registryEntries = parseRegistryFile();
    console.log(`    Found ${registryEntries.length} component entries\n`);
  } catch (err) {
    console.error(`  ✗ Failed to parse registry: ${err}`);
    process.exit(1);
  }

  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  // 2. Check file system
  console.log("  ◆ Checking ui-components/ folders...");

  const folderNames = fs.existsSync(UI_COMPONENTS_DIR)
    ? fs
        .readdirSync(UI_COMPONENTS_DIR, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
    : [];

  const registryFolders = new Set(registryEntries.map((e) => e.folder));
  const registrySlugs = new Set(registryEntries.map((e) => e.slug));

  // 2a. Registry entry → folder
  for (const entry of registryEntries) {
    const folderPath = path.join(UI_COMPONENTS_DIR, entry.folder);

    if (!fs.existsSync(folderPath)) {
      allErrors.push(
        `Registry entry '${entry.slug}' references folder '${entry.folder}' ` +
          `but src/ui-components/${entry.folder}/ does not exist`
      );
      continue;
    }

    const tsxPath = path.join(folderPath, `${entry.fileName}.tsx`);
    const jsxPath = path.join(folderPath, `${entry.fileName}.jsx`);

    if (!fs.existsSync(tsxPath) && !fs.existsSync(jsxPath)) {
      allErrors.push(
        `src/ui-components/${entry.folder}/ exists but neither ` +
          `${entry.fileName}.tsx nor ${entry.fileName}.jsx was found`
      );
    } else {
      // Check for JSX variant
      if (!fs.existsSync(jsxPath) && fs.existsSync(tsxPath)) {
        allWarnings.push(
          `${entry.slug}: No .jsx variant found — run 'npm run generate:js'`
        );
      }

      // Check for CSS file
      const cssModule = path.join(
        folderPath,
        `${entry.fileName}.module.css`
      );
      const cssPlain = path.join(folderPath, `${entry.fileName}.css`);
      const hasAnyCss = fs
        .readdirSync(folderPath)
        .some((f) => f.endsWith(".css"));

      if (!fs.existsSync(cssModule) && !fs.existsSync(cssPlain) && !hasAnyCss) {
        // Not an error — some components don't need CSS
      }

      // Check for index.ts
      const indexPath = path.join(folderPath, "index.ts");
      if (!fs.existsSync(indexPath)) {
        allWarnings.push(
          `${entry.slug}: Missing index.ts re-export file in ${entry.folder}/`
        );
      }
    }

    console.log(`    ✓ ${entry.slug} → ${entry.folder}/`);
  }

  // 2b. Orphan folders
  for (const folder of folderNames) {
    if (!registryFolders.has(folder)) {
      allWarnings.push(
        `Orphan folder: src/ui-components/${folder}/ has no registry entry`
      );
    }
  }

  // 3. Cross-check with preview-map.ts
  console.log("\n  ◆ Cross-checking preview-map.ts...");
  const previewSlugs = getPreviewMapSlugs();

  for (const slug of previewSlugs) {
    if (!registrySlugs.has(slug)) {
      allErrors.push(
        `preview-map.ts references '${slug}' but no registry entry found`
      );
    }
  }

  for (const slug of registrySlugs) {
    if (!previewSlugs.has(slug)) {
      allWarnings.push(
        `Registry entry '${slug}' is not in preview-map.ts — preview won't work`
      );
    }
  }

  if (previewSlugs.size === registrySlugs.size) {
    const inSync = [...registrySlugs].every((s) => previewSlugs.has(s));
    if (inSync) {
      console.log("    ✓ preview-map.ts and registry are in sync");
    }
  }

  // 4. Duplicate checks
  console.log("\n  ◆ Checking for duplicates...");

  const slugCounts = new Map<string, number>();
  for (const entry of registryEntries) {
    slugCounts.set(entry.slug, (slugCounts.get(entry.slug) || 0) + 1);
  }
  for (const [slug, count] of slugCounts) {
    if (count > 1) {
      allErrors.push(`Duplicate slug '${slug}' found ${count} times`);
    }
  }

  const idCounts = new Map<string, number>();
  for (const entry of registryEntries) {
    idCounts.set(entry.id, (idCounts.get(entry.id) || 0) + 1);
  }
  for (const [id, count] of idCounts) {
    if (count > 1) {
      allErrors.push(`Duplicate ID '${id}' found ${count} times`);
    }
  }

  let hasDupes = false;
  for (const [, count] of slugCounts) {
    if (count > 1) hasDupes = true;
  }
  for (const [, count] of idCounts) {
    if (count > 1) hasDupes = true;
  }
  if (!hasDupes) {
    console.log("    ✓ No duplicate slugs or IDs");
  }

  // 5. Validate generated JSON (if exists)
  console.log("\n  ◆ Checking generated JSON files...");
  const jsonValidation = validateGeneratedJSON(registryEntries);
  allErrors.push(...jsonValidation.errors);
  allWarnings.push(...jsonValidation.warnings);

  if (
    jsonValidation.errors.length === 0 &&
    jsonValidation.warnings.length === 0
  ) {
    console.log("    ✓ All JSON files are valid");
  }

  // ────────────────────────────────────────────────────
  // Summary
  // ────────────────────────────────────────────────────

  console.log("\n  ════════════════════════════════════════════");

  if (allWarnings.length > 0) {
    console.log(`\n  ⚠ ${allWarnings.length} Warning(s):`);
    for (const w of allWarnings) {
      console.warn(`    → ${w}`);
    }
  }

  if (allErrors.length > 0) {
    console.log(`\n  ✗ ${allErrors.length} Error(s):`);
    for (const e of allErrors) {
      console.error(`    → ${e}`);
    }
    console.log("\n  ✗ VALIDATION FAILED\n");
    process.exit(1);
  }

  console.log(
    `\n  ✓ VALIDATION PASSED` +
      `  (${registryEntries.length} components, ` +
      `${allWarnings.length} warning${allWarnings.length !== 1 ? "s" : ""})\n`
  );
}

main();
