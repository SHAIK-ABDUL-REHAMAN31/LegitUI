// ════════════════════════════════════════════════════════════════
// LegitUI MCP — Registry Loader
// ════════════════════════════════════════════════════════════════
// Reads the LegitUI component registry from:
//   1. LEGITUI_REGISTRY_URL env var (remote JSON)
//   2. Local public/registry/index.json (project directory)
// Provides typed access to all component data for MCP tools.
// ════════════════════════════════════════════════════════════════
import { readFileSync, existsSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
// ── State ──
let cachedRegistry = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
// ── Project Root Resolution ──
function findProjectRoot() {
    // 1. Env var
    if (process.env.LEGITUI_PROJECT_ROOT) {
        return resolve(process.env.LEGITUI_PROJECT_ROOT);
    }
    // 2. Walk up from this file's directory looking for the LegitUI project
    const __filename = fileURLToPath(import.meta.url);
    let dir = dirname(__filename);
    for (let i = 0; i < 10; i++) {
        const pkgPath = join(dir, "package.json");
        if (existsSync(pkgPath)) {
            try {
                const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
                if (pkg.name === "legitui")
                    return dir;
            }
            catch {
                // skip
            }
        }
        const parent = dirname(dir);
        if (parent === dir)
            break;
        dir = parent;
    }
    // 3. Fallback to cwd
    return process.cwd();
}
const PROJECT_ROOT = findProjectRoot();
// ── Registry Loading ──
async function fetchRemoteRegistry(url) {
    const res = await fetch(url);
    if (!res.ok)
        throw new Error(`Failed to fetch registry: ${res.status}`);
    const data = await res.json();
    return normalizeRegistry(data);
}
function loadLocalRegistry() {
    const registryPath = join(PROJECT_ROOT, "public", "registry", "index.json");
    if (!existsSync(registryPath)) {
        throw new Error(`Registry not found at ${registryPath}. Run 'npm run registry:build' first.`);
    }
    const raw = readFileSync(registryPath, "utf-8");
    const data = JSON.parse(raw);
    return normalizeRegistry(data);
}
function normalizeRegistry(data) {
    const components = (data.components || []).map((c) => ({
        slug: c.slug,
        name: c.name,
        folder: c.folder || "",
        fileName: c.fileName || "",
        category: c.category || "Uncategorized",
        description: c.description || "",
        tags: c.tags || [],
        dependencies: c.dependencies || [],
        devDependencies: c.devDependencies || [],
        props: c.props || [],
        usageExample: c.usageExample || "",
        featured: c.featured || false,
        isNew: c.isNew || false,
        isUpdated: c.isUpdated || false,
        createdAt: c.createdAt || "",
        updatedAt: c.updatedAt || "",
    }));
    return {
        components,
        version: data.version || "1.0.0",
        updatedAt: data.updatedAt || new Date().toISOString(),
    };
}
// ── Public API ──
export async function getRegistry() {
    const now = Date.now();
    // Return cache if fresh
    if (cachedRegistry && now - cacheTimestamp < CACHE_TTL_MS) {
        return cachedRegistry;
    }
    // Try remote URL first (for npm-published usage)
    const remoteUrl = process.env.LEGITUI_REGISTRY_URL;
    if (remoteUrl) {
        try {
            cachedRegistry = await fetchRemoteRegistry(remoteUrl);
            cacheTimestamp = now;
            return cachedRegistry;
        }
        catch (err) {
            process.stderr.write(`Warning: Remote registry failed, trying local.\n`);
        }
    }
    // Fall back to local
    cachedRegistry = loadLocalRegistry();
    cacheTimestamp = now;
    return cachedRegistry;
}
export async function getComponent(slug) {
    const registry = await getRegistry();
    return registry.components.find((c) => c.slug === slug) || null;
}
export async function searchComponents(query) {
    const registry = await getRegistry();
    const q = query.toLowerCase().trim();
    if (!q)
        return registry.components;
    // Split query into individual words for multi-word matching
    const words = q.split(/\s+/).filter((w) => w.length > 0);
    const scored = registry.components.map((c) => {
        let score = 0;
        const name = c.name.toLowerCase();
        const slug = c.slug;
        const desc = c.description.toLowerCase();
        const tags = c.tags.map((t) => t.toLowerCase());
        const cat = c.category.toLowerCase();
        const deps = c.dependencies.map((d) => d.toLowerCase());
        // Full-phrase matching (highest priority)
        if (slug === q)
            score += 100;
        else if (name === q)
            score += 90;
        else if (name.includes(q))
            score += 70;
        if (desc.includes(q))
            score += 50;
        if (tags.some((t) => t.includes(q)))
            score += 40;
        if (cat.includes(q))
            score += 30;
        if (deps.some((d) => d.includes(q)))
            score += 20;
        // Per-word matching (for multi-word queries like "webgl background")
        if (words.length > 1) {
            for (const word of words) {
                if (name.includes(word))
                    score += 25;
                if (desc.includes(word))
                    score += 15;
                if (tags.some((t) => t.includes(word)))
                    score += 12;
                if (cat.includes(word))
                    score += 10;
                if (deps.some((d) => d.includes(word)))
                    score += 8;
                if (slug.includes(word))
                    score += 20;
            }
        }
        return { component: c, score };
    });
    return scored
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((s) => s.component);
}
export async function listByCategory(category) {
    const registry = await getRegistry();
    if (!category)
        return registry.components;
    const cat = category.toLowerCase();
    return registry.components.filter((c) => c.category.toLowerCase() === cat || c.category.toLowerCase().replace(/\s+/g, "") === cat);
}
export async function getCategories() {
    const registry = await getRegistry();
    const cats = new Set(registry.components.map((c) => c.category));
    return [...cats].sort();
}
export async function getComponentSource(slug, variant = "tsx") {
    const component = await getComponent(slug);
    if (!component)
        return null;
    // Strategy 1: Read directly from disk if folder/fileName exist
    if (component.folder && component.fileName) {
        const ext = variant === "tsx" ? ".tsx" : variant === "jsx" ? ".jsx" : ".module.css";
        const filePath = join(PROJECT_ROOT, "src", "ui-components", component.folder, component.fileName + ext);
        if (existsSync(filePath)) {
            return readFileSync(filePath, "utf-8");
        }
    }
    // Strategy 2: Read from the per-component JSON in public/registry/{slug}.json
    // These files contain a `files[]` array with { name, type, content }
    const jsonPath = join(PROJECT_ROOT, "public", "registry", `${slug}.json`);
    if (existsSync(jsonPath)) {
        try {
            const data = JSON.parse(readFileSync(jsonPath, "utf-8"));
            const files = data.files || [];
            // Map variant to file extension pattern
            const extMap = {
                tsx: [".tsx"],
                jsx: [".jsx"],
                css: [".module.css", ".css"],
            };
            const exts = extMap[variant] || [".tsx"];
            // Find the matching file (skip Usage files — get the core component)
            const match = files.find((f) => {
                const name = f.name.toLowerCase();
                const isUsageFile = name.includes("usage");
                return (!isUsageFile &&
                    exts.some((ext) => name.endsWith(ext.toLowerCase())));
            });
            // Fallback: if no non-usage file found, try any file with the extension
            const fallback = match ||
                files.find((f) => exts.some((ext) => f.name.toLowerCase().endsWith(ext.toLowerCase())));
            if (fallback)
                return fallback.content;
        }
        catch {
            // Skip JSON parse errors
        }
    }
    return null;
}
export { PROJECT_ROOT };
//# sourceMappingURL=registry-loader.js.map