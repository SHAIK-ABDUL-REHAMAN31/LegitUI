// ════════════════════════════════════════════════════════════════
// LegitUI — Generate JavaScript (.jsx) variants from TypeScript (.tsx)
// ════════════════════════════════════════════════════════════════
// Uses the TypeScript Compiler API (ts.transpileModule) to produce
// clean JavaScript output with all types stripped, JSX preserved,
// and 'use client' directives intact.
//
// Usage:  npx ts-node scripts/generate-js-variants.ts
//    or:  npm run generate:js
// ════════════════════════════════════════════════════════════════

import * as ts from "typescript";
import * as fs from "fs";
import * as path from "path";

const UI_COMPONENTS_DIR = path.resolve(__dirname, "../src/ui-components");

const compilerOptions: ts.CompilerOptions = {
  jsx: ts.JsxEmit.Preserve,          // Keep JSX as-is, don't compile to createElement
  target: ts.ScriptTarget.ESNext,     // Modern JS
  module: ts.ModuleKind.ESNext,       // ESM imports/exports
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  removeComments: false,              // Preserve comments
  strict: false,
  allowJs: true,
  declaration: false,
  esModuleInterop: true,
  isolatedModules: true,
};

/**
 * Post-process the transpiled output to clean up artifacts.
 */
function postProcess(output: string, originalSource: string): string {
  let result = output;

  // 1. Restore 'use client' directive if present in original
  //    (TypeScript may strip or mangle it)
  const hasUseClient = /^['"]use client['"];?\s*$/m.test(originalSource);
  const outputHasUseClient = /^['"]use client['"];?\s*$/m.test(result);

  if (hasUseClient && !outputHasUseClient) {
    result = "'use client';\n\n" + result;
  }

  // 2. Remove empty export {} that TS sometimes adds for ESM
  result = result.replace(/^export\s*\{\s*\}\s*;?\s*$/gm, "");

  // 3. Clean up excessive blank lines (3+ → 2)
  result = result.replace(/\n{3,}/g, "\n\n");

  // 4. Ensure trailing newline
  if (!result.endsWith("\n")) {
    result += "\n";
  }

  return result;
}

/**
 * Generate a .jsx file from a .tsx source file.
 */
function generateJsxFromTsx(tsxFilePath: string): {
  success: boolean;
  outputPath: string;
  error?: string;
} {
  const dir = path.dirname(tsxFilePath);
  const baseName = path.basename(tsxFilePath, ".tsx");
  const outputPath = path.join(dir, `${baseName}.jsx`);

  try {
    const sourceCode = fs.readFileSync(tsxFilePath, "utf-8");

    const transpileResult = ts.transpileModule(sourceCode, {
      compilerOptions,
      fileName: path.basename(tsxFilePath),
      reportDiagnostics: true,
    });

    // Check for fatal diagnostics
    if (transpileResult.diagnostics && transpileResult.diagnostics.length > 0) {
      const errors = transpileResult.diagnostics
        .filter((d) => d.category === ts.DiagnosticCategory.Error)
        .map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n"));

      if (errors.length > 0) {
        return {
          success: false,
          outputPath,
          error: errors.join("; "),
        };
      }
    }

    const cleanOutput = postProcess(transpileResult.outputText, sourceCode);
    fs.writeFileSync(outputPath, cleanOutput, "utf-8");

    return { success: true, outputPath };
  } catch (err) {
    return {
      success: false,
      outputPath,
      error: String(err),
    };
  }
}

// ────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────

function main() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║  LegitUI — Generating JS variants from TSX  ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  if (!fs.existsSync(UI_COMPONENTS_DIR)) {
    console.error(`ERROR: ui-components directory not found at ${UI_COMPONENTS_DIR}`);
    process.exit(1);
  }

  const componentFolders = fs
    .readdirSync(UI_COMPONENTS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const folder of componentFolders) {
    const folderPath = path.join(UI_COMPONENTS_DIR, folder);
    const tsxFiles = fs
      .readdirSync(folderPath)
      .filter((f) => f.endsWith(".tsx") && !f.endsWith(".d.tsx"));

    if (tsxFiles.length === 0) {
      console.log(`  ⊘ ${folder}/ — no .tsx files (skip)`);
      skipped++;
      continue;
    }

    for (const tsxFile of tsxFiles) {
      const tsxPath = path.join(folderPath, tsxFile);
      const result = generateJsxFromTsx(tsxPath);

      if (result.success) {
        const relPath = path.relative(process.cwd(), result.outputPath).replace(/\\/g, "/");
        console.log(`  ✓ ${relPath}`);
        generated++;
      } else {
        console.error(`  ✗ ${folder}/${tsxFile} — ${result.error}`);
        failed++;
      }
    }
  }

  console.log(`\n  Generated: ${generated}  |  Skipped: ${skipped}  |  Failed: ${failed}\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

main();
