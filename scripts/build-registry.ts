// ════════════════════════════════════════════════════════════════
// LegitUI — Build Registry Script
// ════════════════════════════════════════════════════════════════
// Scans src/ui-components/ and generates static JSON files in
// public/registry/ for every registered component.
//
// Per-component:  public/registry/{slug}.json
// Index:          public/registry/index.json
//
// Usage:  npx tsx scripts/build-registry.ts
//    or:  npm run registry:build
// ════════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import * as docgen from "react-docgen-typescript";

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
const PACKAGE_JSON_PATH = path.join(ROOT_DIR, "package.json");

// ────────────────────────────────────────────────────
// Types (mirrors registry-types.ts for the script)
// ────────────────────────────────────────────────────
interface ComponentProp {
  name: string;
  type: string;
  default?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ label: string; value: string }>;
  label?: string;
  description: string;
  required?: boolean;
}

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
  devDependencies?: string[];
  props?: ComponentProp[];
  usageExample?: string;
  previews?: string[];
  featured?: boolean;
  isNew?: boolean;
  isUpdated?: boolean;
  createdAt: string;
  updatedAt?: string;
  previewVideo?: string;
  previewImage?: string;
}

interface RegistryFile {
  name: string;
  type:
    | "component:tsx"
    | "component:jsx"
    | "style"
    | "index"
    | "usage"
    | "other";
  content: string;
}

interface PerComponentJSON {
  name: string;
  slug: string;
  description: string;
  category: string;
  dependencies: string[];
  devDependencies: string[];
  props: ComponentProp[];
  tags: string[];
  files: RegistryFile[];
  updatedAt: string;
}

interface RegistryIndexEntry {
  slug: string;
  name: string;
  category: string;
  description: string;
  dependencies: string[];
  tags: string[];
  isNew?: boolean;
  isUpdated?: boolean;
}

interface RegistryIndex {
  components: RegistryIndexEntry[];
  updatedAt: string;
  version: string;
}

// ────────────────────────────────────────────────────
// Registry Parser — extract defaultComponents array
// from component-registry.ts without importing it
// (avoids needing the Next.js / React environment)
// ────────────────────────────────────────────────────

function parseRegistryFile(): RegistryEntry[] {
  const source = fs.readFileSync(COMPONENT_REGISTRY_PATH, "utf-8");

  // Find the defaultComponents array definition
  const startMarker = "export const defaultComponents";
  const startIdx = source.indexOf(startMarker);
  if (startIdx === -1) {
    throw new Error(
      "Could not find 'export const defaultComponents' in component-registry.ts"
    );
  }

  // Find the '=' sign first, then the opening bracket after it
  // This avoids matching the '[]' in the type annotation (e.g., ComponentMeta[])
  const eqIdx = source.indexOf("=", startIdx);
  if (eqIdx === -1) {
    throw new Error("Could not find '=' in defaultComponents declaration");
  }

  let bracketStart = source.indexOf("[", eqIdx);
  if (bracketStart === -1) {
    throw new Error("Could not find opening '[' for defaultComponents array");
  }

  // Match the closing bracket by tracking nesting depth
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

  // Use Function constructor to evaluate the array as JavaScript.
  // This handles unquoted keys, trailing commas, single quotes, etc. natively.
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
// File Discovery — find all files in a component folder
// ────────────────────────────────────────────────────

function discoverComponentFiles(
  folderPath: string,
  fileName: string
): RegistryFile[] {
  if (!fs.existsSync(folderPath)) return [];

  const allFiles = fs.readdirSync(folderPath);
  const result: RegistryFile[] = [];

  for (const file of allFiles) {
    const filePath = path.join(folderPath, file);
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) continue;

    const ext = path.extname(file).toLowerCase();
    const baseName = path.basename(file, ext);
    let content: string;

    try {
      content = fs.readFileSync(filePath, "utf-8");
    } catch {
      console.warn(`  ⚠ Could not read ${filePath}, skipping`);
      continue;
    }

    let type: RegistryFile["type"];

    if (ext === ".tsx") {
      type = "component:tsx";
    } else if (ext === ".jsx") {
      // Distinguish between the main component JSX and usage examples
      if (baseName.toLowerCase().includes("usage")) {
        type = "usage";
      } else {
        type = "component:jsx";
      }
    } else if (ext === ".css") {
      type = "style";
    } else if (ext === ".ts" && baseName === "index") {
      type = "index";
    } else {
      type = "other";
    }

    result.push({ name: file, type, content });
  }

  return result;
}

// ────────────────────────────────────────────────────
// Prop Extraction via react-docgen-typescript
// ────────────────────────────────────────────────────

const docgenParser = docgen.withDefaultConfig({
  propFilter: (prop) => {
    // Exclude props inherited from HTML elements / React internals
    if (prop.parent?.fileName.includes("node_modules")) return false;
    return true;
  },
});

/**
 * Extract props from a .tsx file using react-docgen-typescript.
 * Merges extracted props with manually defined registry props.
 * Manual definitions always take priority.
 */
function extractAndMergeProps(
  tsxFilePath: string,
  registryProps: ComponentProp[]
): ComponentProp[] {
  // Build a lookup from manually-defined props
  const manualMap = new Map<string, ComponentProp>();
  for (const p of registryProps) {
    manualMap.set(p.name, p);
  }

  let extracted: ComponentProp[] = [];

  try {
    const docs = docgenParser.parse(tsxFilePath);
    if (docs.length > 0 && docs[0].props) {
      for (const [propName, propItem] of Object.entries(docs[0].props)) {
        // Skip internal/utility props
        if (["key", "ref"].includes(propName)) continue;

        const extractedProp: ComponentProp = {
          name: propName,
          type: propItem.type?.name || "unknown",
          description: propItem.description || "",
          required: propItem.required || false,
        };

        // Extract default value
        if (propItem.defaultValue?.value) {
          extractedProp.default = propItem.defaultValue.value;
        }

        extracted.push(extractedProp);
      }
    }
  } catch {
    // docgen can fail on some files (e.g., WebGL components with complex types)
    // silently fall back to manual props
  }

  if (extracted.length === 0) {
    return registryProps;
  }

  // Merge: manual props take priority, docgen fills gaps
  const merged: ComponentProp[] = [];
  const seen = new Set<string>();

  // First pass: add all manual props (they take priority)
  for (const manual of registryProps) {
    const docgenProp = extracted.find((e) => e.name === manual.name);
    merged.push({
      ...manual,
      // Enrich with docgen if manual fields are missing
      description: manual.description || docgenProp?.description || "",
      required: manual.required ?? docgenProp?.required,
    });
    seen.add(manual.name);
  }

  // Second pass: add docgen-only props not in manual definitions
  for (const ext of extracted) {
    if (!seen.has(ext.name)) {
      merged.push(ext);
      seen.add(ext.name);
    }
  }

  return merged;
}

// ────────────────────────────────────────────────────
// Get project version from package.json
// ────────────────────────────────────────────────────

function getProjectVersion(): string {
  try {
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, "utf-8"));
    return pkg.version || "0.1.0";
  } catch {
    return "0.1.0";
  }
}

// ────────────────────────────────────────────────────
// Validation Helpers
// ────────────────────────────────────────────────────

interface ValidationResult {
  errors: string[];
  warnings: string[];
}

function validateRegistry(registryEntries: RegistryEntry[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Get all component folders on disk
  const folderNames = fs.existsSync(UI_COMPONENTS_DIR)
    ? fs
        .readdirSync(UI_COMPONENTS_DIR, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
    : [];

  const registryFolders = new Set(registryEntries.map((e) => e.folder));
  const registrySlugs = new Set(registryEntries.map((e) => e.slug));

  // 1. Check each registry entry has a matching folder
  for (const entry of registryEntries) {
    const folderPath = path.join(UI_COMPONENTS_DIR, entry.folder);

    if (!fs.existsSync(folderPath)) {
      errors.push(
        `Registry entry '${entry.slug}' references folder '${entry.folder}' ` +
          `but src/ui-components/${entry.folder}/ does not exist`
      );
      continue;
    }

    // Check for the main component file (.tsx or .jsx)
    const tsxPath = path.join(folderPath, `${entry.fileName}.tsx`);
    const jsxPath = path.join(folderPath, `${entry.fileName}.jsx`);

    if (!fs.existsSync(tsxPath) && !fs.existsSync(jsxPath)) {
      errors.push(
        `src/ui-components/${entry.folder}/ exists but neither ` +
          `${entry.fileName}.tsx nor ${entry.fileName}.jsx was found`
      );
    }
  }

  // 2. Check for orphan folders (in ui-components but not in registry)
  for (const folder of folderNames) {
    if (!registryFolders.has(folder)) {
      warnings.push(
        `Found component folder '${folder}' in ui-components/ ` +
          `but no registry entry. Add it to component-registry.ts`
      );
    }
  }

  // 3. Cross-check with preview-map.ts
  if (fs.existsSync(PREVIEW_MAP_PATH)) {
    const previewMapSource = fs.readFileSync(PREVIEW_MAP_PATH, "utf-8");

    // Extract slugs from PREVIEW_MAP
    const slugRegex = /'([a-z0-9-]+)'\s*:/g;
    let match;
    const previewSlugs = new Set<string>();
    while ((match = slugRegex.exec(previewMapSource)) !== null) {
      previewSlugs.add(match[1]);
    }

    // Check preview-map slugs that aren't in registry
    for (const slug of previewSlugs) {
      if (!registrySlugs.has(slug)) {
        errors.push(
          `preview-map.ts references '${slug}' but no registry entry found`
        );
      }
    }

    // Check registry slugs that aren't in preview-map
    for (const slug of registrySlugs) {
      if (!previewSlugs.has(slug)) {
        warnings.push(
          `Registry entry '${slug}' is not in preview-map.ts — ` +
            `preview route will not work`
        );
      }
    }
  }

  // 4. Check for duplicate slugs
  const slugCounts = new Map<string, number>();
  for (const entry of registryEntries) {
    slugCounts.set(entry.slug, (slugCounts.get(entry.slug) || 0) + 1);
  }
  for (const [slug, count] of slugCounts) {
    if (count > 1) {
      errors.push(`Duplicate slug '${slug}' found ${count} times in registry`);
    }
  }

  // 5. Check for duplicate IDs
  const idCounts = new Map<string, number>();
  for (const entry of registryEntries) {
    idCounts.set(entry.id, (idCounts.get(entry.id) || 0) + 1);
  }
  for (const [id, count] of idCounts) {
    if (count > 1) {
      errors.push(`Duplicate ID '${id}' found ${count} times in registry`);
    }
  }

  return { errors, warnings };
}

// ────────────────────────────────────────────────────
// Main Build
// ────────────────────────────────────────────────────

function main() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║  LegitUI — Building Component Registry JSON ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  // 1. Parse registry metadata
  console.log("  ◆ Parsing component-registry.ts...");
  let registryEntries: RegistryEntry[];
  try {
    registryEntries = parseRegistryFile();
    console.log(`    Found ${registryEntries.length} component entries\n`);
  } catch (err) {
    console.error(`  ✗ Failed to parse registry: ${err}`);
    process.exit(1);
  }

  // 2. Validate
  console.log("  ◆ Validating registry consistency...");
  const validation = validateRegistry(registryEntries);

  for (const warning of validation.warnings) {
    console.warn(`    ⚠ WARNING: ${warning}`);
  }
  for (const error of validation.errors) {
    console.error(`    ✗ ERROR: ${error}`);
  }

  if (validation.errors.length > 0) {
    console.error(
      `\n  ✗ ${validation.errors.length} validation error(s) found. Fix them before building.\n`
    );
    process.exit(1);
  }

  if (validation.warnings.length > 0) {
    console.log(
      `    ${validation.warnings.length} warning(s) — build will continue\n`
    );
  } else {
    console.log("    ✓ All checks passed\n");
  }

  // 3. Ensure output directory exists
  if (!fs.existsSync(REGISTRY_DIR)) {
    fs.mkdirSync(REGISTRY_DIR, { recursive: true });
    console.log(`  ◆ Created ${path.relative(ROOT_DIR, REGISTRY_DIR)}/\n`);
  }

  // 4. Generate per-component JSON files
  const now = new Date().toISOString();
  const version = getProjectVersion();
  const indexEntries: RegistryIndexEntry[] = [];
  let generated = 0;
  let failed = 0;

  console.log("  ◆ Generating component JSON files...");

  for (const entry of registryEntries) {
    const folderPath = path.join(UI_COMPONENTS_DIR, entry.folder);
    const files = discoverComponentFiles(folderPath, entry.fileName);

    if (files.length === 0) {
      console.error(
        `    ✗ ${entry.slug} — no files found in ${entry.folder}/`
      );
      failed++;
      continue;
    }

    // Extract + merge props via react-docgen-typescript
    const tsxFilePath = path.join(folderPath, `${entry.fileName}.tsx`);
    const mergedProps = fs.existsSync(tsxFilePath)
      ? extractAndMergeProps(tsxFilePath, entry.props || [])
      : entry.props || [];

    const componentJSON: PerComponentJSON = {
      name: entry.name,
      slug: entry.slug,
      description: entry.description,
      category: entry.category,
      dependencies: entry.dependencies || [],
      devDependencies: entry.devDependencies || [],
      props: mergedProps,
      tags: entry.tags || [],
      files,
      updatedAt: entry.updatedAt || now,
    };

    const outputPath = path.join(REGISTRY_DIR, `${entry.slug}.json`);
    try {
      fs.writeFileSync(outputPath, JSON.stringify(componentJSON, null, 2), "utf-8");
      console.log(
        `    ✓ public/registry/${entry.slug}.json  (${files.length} file${files.length !== 1 ? "s" : ""})`
      );
      generated++;
    } catch (err) {
      console.error(`    ✗ Failed to write ${entry.slug}.json — ${err}`);
      failed++;
      continue;
    }

    // Add to index
    indexEntries.push({
      slug: entry.slug,
      name: entry.name,
      category: entry.category,
      description: entry.description,
      dependencies: entry.dependencies || [],
      tags: entry.tags || [],
      ...(entry.isNew ? { isNew: true } : {}),
      ...(entry.isUpdated ? { isUpdated: true } : {}),
    });
  }

  // 5. Generate index.json
  const indexJSON: RegistryIndex = {
    components: indexEntries,
    updatedAt: now,
    version,
  };

  const indexPath = path.join(REGISTRY_DIR, "index.json");
  try {
    fs.writeFileSync(indexPath, JSON.stringify(indexJSON, null, 2), "utf-8");
    console.log(
      `\n    ✓ public/registry/index.json  (${indexEntries.length} components)`
    );
  } catch (err) {
    console.error(`\n    ✗ Failed to write index.json — ${err}`);
    failed++;
  }

  // 6. Generate shadcn-compatible registry JSON
  const SHADCN_DIR = path.join(REGISTRY_DIR, "shadcn");
  if (!fs.existsSync(SHADCN_DIR)) {
    fs.mkdirSync(SHADCN_DIR, { recursive: true });
  }

  console.log("\n  ◆ Generating shadcn-compatible registry...");

  interface ShadcnFile {
    path: string;
    content: string;
    type: string;
    target: string;
  }

  interface ShadcnRegistryItem {
    $schema: string;
    name: string;
    type: string;
    title: string;
    description: string;
    dependencies: string[];
    devDependencies: string[];
    registryDependencies: string[];
    files: ShadcnFile[];
  }

  const shadcnIndexItems: Array<{
    name: string;
    type: string;
    title: string;
    description: string;
    dependencies: string[];
  }> = [];

  let shadcnGenerated = 0;

  for (const entry of registryEntries) {
    const folderPath = path.join(UI_COMPONENTS_DIR, entry.folder);
    const shadcnFiles: ShadcnFile[] = [];

    // Primary component file — prefer .tsx, fall back to .jsx
    const tsxPath = path.join(folderPath, `${entry.fileName}.tsx`);
    const jsxPath = path.join(folderPath, `${entry.fileName}.jsx`);

    if (fs.existsSync(tsxPath)) {
      shadcnFiles.push({
        path: `components/ui/${entry.fileName}.tsx`,
        content: fs.readFileSync(tsxPath, "utf-8"),
        type: "registry:ui",
        target: "",
      });
    }

    if (fs.existsSync(jsxPath)) {
      shadcnFiles.push({
        path: `components/ui/${entry.fileName}.jsx`,
        content: fs.readFileSync(jsxPath, "utf-8"),
        type: "registry:ui",
        target: "",
      });
    }

    // CSS file
    const cssModulePath = path.join(folderPath, `${entry.fileName}.module.css`);
    const cssPlainPath = path.join(folderPath, `${entry.fileName}.css`);
    const folderCssPath = path.join(folderPath, `${entry.folder}.css`);

    const cssFile = [cssModulePath, cssPlainPath, folderCssPath].find((p) =>
      fs.existsSync(p)
    );

    if (cssFile) {
      const cssName = path.basename(cssFile);
      shadcnFiles.push({
        path: `components/ui/${cssName}`,
        content: fs.readFileSync(cssFile, "utf-8"),
        type: "registry:ui",
        target: "",
      });
    }

    if (shadcnFiles.length === 0) continue;

    const shadcnItem: ShadcnRegistryItem = {
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      name: entry.slug,
      type: "registry:ui",
      title: entry.name,
      description: entry.description,
      dependencies: entry.dependencies || [],
      devDependencies: entry.devDependencies || [],
      registryDependencies: [],
      files: shadcnFiles,
    };

    const shadcnOutputPath = path.join(SHADCN_DIR, `${entry.slug}.json`);
    try {
      fs.writeFileSync(
        shadcnOutputPath,
        JSON.stringify(shadcnItem, null, 2),
        "utf-8"
      );
      console.log(
        `    ✓ public/registry/shadcn/${entry.slug}.json  (${shadcnFiles.length} file${shadcnFiles.length !== 1 ? "s" : ""})`
      );
      shadcnGenerated++;
    } catch (err) {
      console.error(
        `    ✗ Failed to write shadcn/${entry.slug}.json — ${err}`
      );
      failed++;
    }

    shadcnIndexItems.push({
      name: entry.slug,
      type: "registry:ui",
      title: entry.name,
      description: entry.description,
      dependencies: entry.dependencies || [],
    });
  }

  // shadcn index.json
  const shadcnIndex = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "legitui",
    homepage: "https://legitui.com",
    items: shadcnIndexItems,
  };

  const shadcnIndexPath = path.join(SHADCN_DIR, "index.json");
  try {
    fs.writeFileSync(
      shadcnIndexPath,
      JSON.stringify(shadcnIndex, null, 2),
      "utf-8"
    );
    console.log(
      `\n    ✓ public/registry/shadcn/index.json  (${shadcnIndexItems.length} items)`
    );
  } catch (err) {
    console.error(`\n    ✗ Failed to write shadcn/index.json — ${err}`);
    failed++;
  }

  // 7. Summary
  console.log(
    `\n  Generated: ${generated} + ${shadcnGenerated} shadcn  |  Failed: ${failed}  |  Total entries: ${registryEntries.length}\n`
  );

  if (failed > 0) {
    console.error("  ✗ Build completed with errors.\n");
    process.exit(1);
  }

  console.log("  ✓ Registry build complete.\n");
}

main();
