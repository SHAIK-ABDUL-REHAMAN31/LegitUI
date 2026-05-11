// ════════════════════════════════════════════════════════════════
// [slug]/page.tsx — Server Component
// ════════════════════════════════════════════════════════════════
// Phase 2: Reads source code from disk via fs.readFileSync.
// Passes code strings + metadata to the Client Component.
// ════════════════════════════════════════════════════════════════

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { notFound } from "next/navigation";
import { getComponentMetaBySlug } from "@/lib/component-registry";
import ComponentPageClient from "./ComponentPageClient";

const UI_COMPONENTS_DIR = join(process.cwd(), "src", "ui-components");

/**
 * Read a file from disk if it exists, return null otherwise.
 */
function readIfExists(filePath: string): string | null {
  return existsSync(filePath) ? readFileSync(filePath, "utf-8") : null;
}

/**
 * Try multiple file extensions to find source code.
 */
function resolveSourceCode(folder: string, fileName: string): {
  tsxCode: string | null;
  jsxCode: string | null;
  cssCode: string | null;
} {
  const dir = join(UI_COMPONENTS_DIR, folder);

  // TypeScript source
  const tsxCode =
    readIfExists(join(dir, `${fileName}.tsx`)) ??
    readIfExists(join(dir, `${fileName}.ts`));

  // JavaScript source (JSX variant or plain JS)
  const jsxCode =
    readIfExists(join(dir, `${fileName}.jsx`)) ??
    readIfExists(join(dir, `${fileName}.js`));

  // CSS — check module CSS first, then plain CSS
  const cssCode =
    readIfExists(join(dir, `${fileName}.module.css`)) ??
    readIfExists(join(dir, `${fileName}.css`)) ??
    // Also check for folder-named CSS (e.g., NeonWaves.css in NeonWaves/)
    readIfExists(join(dir, `${folder}.css`));

  return { tsxCode, jsxCode, cssCode };
}

export default async function ComponentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Look up component metadata from the registry
  const meta = getComponentMetaBySlug(slug);
  if (!meta) {
    notFound();
  }

  // Read source files from disk
  const { tsxCode, jsxCode, cssCode } = resolveSourceCode(
    meta.folder,
    meta.fileName
  );

  return (
    <ComponentPageClient
      slug={slug}
      metadata={meta}
      tsxCode={tsxCode}
      jsxCode={jsxCode}
      cssCode={cssCode}
    />
  );
}
