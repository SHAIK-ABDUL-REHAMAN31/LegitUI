# LegitUI MCP Server — Complete Setup Guide
## Make Claude, Cursor, Lovable & Any AI Builder Aware of Your Component Library

> **What this enables:**
> A developer types in Cursor or Claude Code:
> *"Build me a card component using OrbitGallery from LegitUI"*
> → The AI knows OrbitGallery exists, knows its props, fetches the source code
>   via your shadcn registry, installs it, and wires it up — automatically.
>
> This is possible. This guide shows you exactly how to build it.

---

## Table of Contents

- [What MCP Is and Why It Matters for LegitUI](#what-mcp-is)
- [The Vision — What You're Building](#the-vision)
- [Architecture Overview](#architecture-overview)
- [Phase 1 — Build the MCP Server](#phase-1--build-the-mcp-server)
- [Phase 2 — Define the MCP Tools](#phase-2--define-the-mcp-tools)
- [Phase 3 — Connect to Claude Code](#phase-3--connect-to-claude-code)
- [Phase 4 — Connect to Cursor](#phase-4--connect-to-cursor)
- [Phase 5 — Connect to Claude Desktop](#phase-5--connect-to-claude-desktop)
- [Phase 6 — Publish to npm](#phase-6--publish-to-npm)
- [The Prompts — Implement Everything](#the-prompts)
- [Testing & Verification](#testing--verification)

---

## What MCP Is

**Model Context Protocol (MCP)** is an open standard created by Anthropic that
lets AI assistants (Claude, Claude Code, Cursor's AI, Windsurf, Lovable, etc.)
connect to external tools and data sources through a standardized server protocol.

Think of it like this:

```
WITHOUT MCP:
Developer: "Build me a card using OrbitGallery"
AI: "I don't know what OrbitGallery is. Here's a generic card..."

WITH LEGITUI MCP:
Developer: "Build me a card using OrbitGallery"
AI → calls MCP tool: get_component("orbit-gallery")
MCP Server → returns: props, source code, install command, usage example
AI: "I found OrbitGallery in LegitUI. It has these props: radius, speed, items.
     Running: npx shadcn@latest add https://legitui.com/r/orbit-gallery.json
     Here's your card component using it..."
```

The AI goes from **guessing** to **knowing** — because your MCP server
gives it live, accurate information about your actual components.

---

## The Vision

Here is the exact experience you are building:

### Scenario 1 — Cursor

```
User in Cursor chat:
"I want to build a hero section. Use the OrbitGallery component
 from LegitUI for the background."

Cursor AI:
→ Queries LegitUI MCP: search_components("gallery orbit")
→ Finds: orbit-gallery (category: components, deps: three.js)
→ Queries LegitUI MCP: get_install_command("orbit-gallery", "shadcn")
→ Gets: npx shadcn@latest add https://legitui.com/r/orbit-gallery.json
→ Queries LegitUI MCP: get_component_props("orbit-gallery")
→ Gets: { radius: number, speed: number, items: string[], autoRotate: boolean }

Cursor runs the install command in your terminal.
Cursor writes the hero section component using OrbitGallery with correct props.
You see a working component on the first try.
```

### Scenario 2 — Claude Code

```
User in Claude Code:
"Add a loading state to my page using PulseLoader from LegitUI"

Claude Code:
→ Queries LegitUI MCP: get_component("pulse-loader")
→ Gets full source, props, usage example
→ Installs via shadcn CLI
→ Adds PulseLoader to your page with correct import path
→ Wires it to your existing loading state logic
```

### Scenario 3 — Claude Desktop

```
User in Claude chat:
"What text animation components does LegitUI have?
 Which one is best for a hero headline?"

Claude:
→ Queries LegitUI MCP: list_components(category: "text-animations")
→ Returns: TextReveal, CinematicText, SmoothFadeUp, ScaleBlur, TypewriterText...
→ Claude explains each one with props and use cases
→ Recommends CinematicText for hero headlines
→ Shows the exact install command and usage code
```

---

## Architecture Overview

```
Your LegitUI Project
        │
        ▼
┌─────────────────────────────────────────────────────┐
│              LegitUI MCP Server                      │
│         (Node.js + @modelcontextprotocol/sdk)        │
│                                                      │
│  Tools:                                              │
│  • list_components(category?)                        │
│  • search_components(query)                          │
│  • get_component(slug)                               │
│  • get_component_props(slug)                         │
│  • get_install_command(slug, method)                 │
│  • get_usage_example(slug)                           │
│  • get_component_source(slug, variant)               │
│  • install_component(slug, method) → runs CLI        │
│                                                      │
│  Resources:                                          │
│  • legitui://components — full registry              │
│  • legitui://component/{slug} — single component     │
│  • legitui://categories — all categories             │
└─────────────────────────────────────────────────────┘
        │
        │  stdio / HTTP transport
        ▼
┌──────────────────────────────────────────────────────┐
│              AI Clients                               │
│                                                      │
│  • Claude Code (claude_desktop_config.json)          │
│  • Cursor (.cursor/mcp.json)                         │
│  • Claude Desktop (claude_desktop_config.json)       │
│  • Windsurf (.windsurf/mcp.json)                     │
│  • Any MCP-compatible AI tool                        │
└──────────────────────────────────────────────────────┘
```

---

## Phase 1 — Build the MCP Server

### File Structure

```
legitui/
└── mcp/                          ← New folder at project root
    ├── package.json
    ├── tsconfig.json
    ├── src/
    │   ├── index.ts              ← MCP server entry point
    │   ├── tools/
    │   │   ├── list-components.ts
    │   │   ├── search-components.ts
    │   │   ├── get-component.ts
    │   │   ├── get-props.ts
    │   │   ├── get-install-command.ts
    │   │   ├── get-source.ts
    │   │   ├── get-usage.ts
    │   │   └── install-component.ts
    │   ├── resources/
    │   │   ├── registry-resource.ts
    │   │   └── component-resource.ts
    │   └── lib/
    │       ├── registry-loader.ts  ← Reads your component-registry.ts
    │       └── shadcn-runner.ts    ← Runs shadcn CLI commands
    └── README.md
```

---

### PROMPT 1.1 — Initialize the MCP Server Package

```
I am building an MCP (Model Context Protocol) server for LegitUI —
a Next.js component library with 54+ components including WebGL, Three.js,
OGL, and React Three Fiber components.

The MCP server will let AI tools like Claude Code, Cursor, and Claude Desktop
query my component library and install components automatically.

Create the file: mcp/package.json

{
  "name": "@legitui/mcp",
  "version": "1.0.0",
  "description": "MCP server for LegitUI component library — lets AI assistants query and install LegitUI components",
  "type": "module",
  "bin": {
    "legitui-mcp": "./dist/index.js"
  },
  "main": "./dist/index.js",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "start": "node dist/index.js",
    "prepare": "npm run build"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  },
  "files": ["dist", "README.md"],
  "keywords": ["mcp", "legitui", "components", "react", "webgl"],
  "license": "MIT"
}

Then create mcp/tsconfig.json:

{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}

Then run: cd mcp && npm install

Show me both files.
```

---

### PROMPT 1.2 — Create the Registry Loader

```
Create mcp/src/lib/registry-loader.ts

This file reads the LegitUI component registry and exposes it
as typed data to all MCP tools.

The registry is at: ../src/lib/component-registry.ts
But since we can't import TypeScript from a Node.js ESM module directly,
we will instead read from public/registry/index.json
which is generated by the build-registry.ts script.

If public/registry/index.json doesn't exist, fall back to reading
src/lib/component-registry.ts directly using dynamic import with tsx.

Here is the type structure to use:

export interface LegitUIComponent {
  slug: string;
  name: string;
  folder: string;
  fileName: string;
  category: ComponentCategory;
  description: string;
  tags: string[];
  dependencies: string[];
  devDependencies?: string[];
  props: ComponentProp[];
  usageExample?: string;
  featured?: boolean;
  new?: boolean;
}

export type ComponentCategory =
  | 'backgrounds'
  | 'animations'
  | 'components'
  | 'text-animations'
  | 'loaders'
  | '3d';

export interface ComponentProp {
  name: string;
  type: string;
  default?: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  label: string;
  description?: string;
  required?: boolean;
}

export interface ComponentRegistry {
  components: LegitUIComponent[];
  version: string;
  updatedAt: string;
}

The loader should:
1. Try to read from REGISTRY_PATH env var if set (for custom installations)
2. Default to reading ../public/registry/index.json relative to the MCP package
3. Cache the result in memory after first load
4. Export: getRegistry(), getComponent(slug), searchComponents(query), listByCategory(category)

export async function getRegistry(): Promise<ComponentRegistry>
export async function getComponent(slug: string): Promise<LegitUIComponent | null>
export async function searchComponents(query: string): Promise<LegitUIComponent[]>
export async function listByCategory(category?: string): Promise<LegitUIComponent[]>

For searchComponents, search across: name, slug, description, tags, category
Case-insensitive. Return ranked results (exact name match first, then partial).

Show me the complete registry-loader.ts
```

---

### PROMPT 1.3 — Create the Main MCP Server

```
Create mcp/src/index.ts — the main MCP server entry point.

This file creates the MCP server using @modelcontextprotocol/sdk
and registers all tools and resources.

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

The server should:
1. Have name: "legitui" and version: "1.0.0"
2. Set a clear description: "LegitUI component library — query components,
   get props, get source code, and install components via shadcn or jsrepo CLI"

Register these tools (I'll implement each one in separate prompts):
- list_components
- search_components
- get_component
- get_component_props
- get_install_command
- get_usage_example
- get_component_source
- install_component

Register these resources:
- legitui://components — returns the full component registry as JSON
- legitui://categories — returns all available categories
- legitui://component/{slug} — returns a single component's full data

Use StdioServerTransport for the transport layer
(this is standard for MCP servers that run as child processes).

Add this at the bottom:
const server = new Server(...);
const transport = new StdioServerTransport();
await server.connect(transport);

Add proper error handling: uncaught exceptions should log to stderr
(never stdout — stdout is reserved for MCP protocol messages).

process.on('uncaughtException', (err) => {
  process.stderr.write(`Uncaught exception: ${err}\n`);
});

Show me the complete mcp/src/index.ts
```

---

## Phase 2 — Define the MCP Tools

### PROMPT 2.1 — list_components tool

```
Create mcp/src/tools/list-components.ts

This MCP tool lists all available LegitUI components, optionally filtered by category.

Tool definition:
  name: "list_components"
  description: "List all available LegitUI components. Optionally filter by category.
    Categories: backgrounds, animations, components, text-animations, loaders, 3d"

Input schema (Zod):
  {
    category: z.string().optional()
      .describe("Filter by category: backgrounds | animations | components | text-animations | loaders | 3d"),
    featured_only: z.boolean().optional()
      .describe("If true, only return featured/highlighted components"),
    new_only: z.boolean().optional()
      .describe("If true, only return recently added components"),
  }

Output format (return as formatted text that the AI can read):
  ## LegitUI Components — {category || "All"} ({count} total)

  ### Text Animations (12 components)
  - **text-reveal** — A text reveal effect that fades in characters as you scroll
    Tags: scroll, reveal, cinematic | Deps: gsap
  - **cinematic-text** — Hollywood-style text animation with depth blur
    Tags: cinematic, blur, hero | Deps: framer-motion
  ...

  ### Backgrounds (8 components)
  - **orbit-gallery** — 3D orbital image gallery
    Tags: 3d, gallery, three.js | Deps: three, @react-three/fiber
  ...

  ---
  Install any component:
  npx shadcn@latest add https://legitui.com/r/{slug}.json

This formatting helps the AI understand the library structure and make
good recommendations to the developer.

Show me the complete list-components.ts tool implementation.
```

---

### PROMPT 2.2 — search_components tool

```
Create mcp/src/tools/search-components.ts

This is the most important tool — it lets the AI find the right component
when a developer describes what they want.

Tool definition:
  name: "search_components"
  description: "Search LegitUI components by name, description, or use case.
    Use this when the developer describes what they want but doesn't know
    the exact component name. Examples: 'gallery', 'orbit', 'text fade',
    'WebGL background', '3D card', 'loading spinner'"

Input schema:
  {
    query: z.string()
      .describe("Search query — component name, description, or use case"),
    limit: z.number().optional().default(5)
      .describe("Maximum results to return (default: 5)"),
  }

Search logic:
  1. Exact slug match → score: 100
  2. Exact name match → score: 90
  3. Name contains query → score: 70
  4. Description contains query → score: 50
  5. Tags contain query → score: 40
  6. Category matches query → score: 30

Sort by score descending, return top {limit} results.

Output format:
  ## Search Results for "{query}" — {count} found

  ### 1. OrbitGallery (orbit-gallery) ★ Best Match
  Category: components | Weight: heavy
  "3D orbital image gallery with smooth rotation and hover effects"
  Props: radius (number), speed (number), items (string[]), autoRotate (boolean)
  Dependencies: three, @react-three/fiber
  Install: npx shadcn@latest add https://legitui.com/r/orbit-gallery.json

  ### 2. InfiniteImageMarquee (infinite-image-marquee)
  Category: components
  "Infinite scrolling image marquee with configurable speed and direction"
  ...

  ---
  To use any of these: ask me to "get_component" with the slug,
  or "install_component" to add it to your project.

Show me the complete search-components.ts tool implementation.
```

---

### PROMPT 2.3 — get_component tool

```
Create mcp/src/tools/get-component.ts

This tool returns complete information about a specific component —
everything the AI needs to use it correctly.

Tool definition:
  name: "get_component"
  description: "Get complete information about a specific LegitUI component
    including props, dependencies, usage example, and install command.
    Use the component slug (kebab-case) as the identifier."

Input schema:
  {
    slug: z.string()
      .describe("Component slug in kebab-case. Examples: orbit-gallery, text-reveal, liquid-nebula"),
  }

Output format (this is what the AI reads to understand the component):

  # OrbitGallery
  **Slug:** orbit-gallery
  **Category:** components
  **Weight:** heavy (Three.js + R3F)

  ## Description
  3D orbital image gallery with smooth rotation, hover interactions,
  and configurable orbital radius. Renders images as floating cards
  in a 3D orbital path.

  ## Props
  | Prop | Type | Default | Description |
  |------|------|---------|-------------|
  | items | string[] | required | Array of image URLs to display |
  | radius | number | 300 | Orbital radius in pixels |
  | speed | number | 0.5 | Rotation speed (0 = stopped, 2 = fast) |
  | autoRotate | boolean | true | Enable automatic rotation |
  | onSelect | (index: number) => void | undefined | Callback when item selected |

  ## Dependencies
  npm packages required: three, @react-three/fiber, @react-three/drei

  ## Install
  ### Via shadcn CLI (recommended):
  npx shadcn@latest add https://legitui.com/r/orbit-gallery.json

  ### Via jsrepo CLI:
  npx jsrepo add legitui.com/orbit-gallery

  ## Usage Example
  ```tsx
  import { OrbitGallery } from "@/components/ui/OrbitGallery";

  const images = [
    "/img/photo-1.jpg",
    "/img/photo-2.jpg",
    "/img/photo-3.jpg",
  ];

  export function MyGallerySection() {
    return (
      <section className="h-screen">
        <OrbitGallery
          items={images}
          radius={280}
          speed={0.4}
          autoRotate={true}
          onSelect={(index) => console.log("Selected:", index)}
        />
      </section>
    );
  }
  ```

  ## File Structure (after install)
  src/components/ui/
  ├── OrbitGallery.tsx
  └── OrbitGallery.module.css

  ## Notes
  - Requires WebGL support in the browser
  - Works best with consistent image aspect ratios
  - Dispose pattern handled automatically on unmount

This rich output gives the AI everything it needs to use the component
correctly on the first attempt.

Show me the complete get-component.ts tool implementation.
```

---

### PROMPT 2.4 — get_component_source tool

```
Create mcp/src/tools/get-source.ts

This tool returns the actual source code of a component so the AI
can understand its implementation or help the developer customize it.

Tool definition:
  name: "get_component_source"
  description: "Get the full source code of a LegitUI component.
    Returns TypeScript or JavaScript source. Use this when the developer
    wants to understand how a component works or needs to customize it."

Input schema:
  {
    slug: z.string()
      .describe("Component slug in kebab-case"),
    variant: z.enum(['tsx', 'jsx', 'css']).optional().default('tsx')
      .describe("Source variant: tsx (TypeScript), jsx (JavaScript), css (styles)"),
  }

Implementation:
  1. Look up the component in the registry to get folder and fileName
  2. Read the file from disk:
     - tsx: src/ui-components/{folder}/{fileName}.tsx
     - jsx: src/ui-components/{folder}/{fileName}.jsx
     - css: src/ui-components/{folder}/{fileName}.module.css
  3. The REGISTRY_PATH or PROJECT_ROOT env var tells us where the project is

  The server needs to know where the LegitUI project lives.
  Use this resolution order:
  a. LEGITUI_PROJECT_ROOT env var (set by the user in MCP config)
  b. Walk up from __dirname looking for package.json with name "legitui"
  c. Current working directory

Output format:
  # OrbitGallery — TypeScript Source (orbit-gallery)

  ```tsx
  [full source code here]
  ```

  ---
  Lines: 247 | Size: 8.2 KB
  To install this component: npx shadcn@latest add https://legitui.com/r/orbit-gallery.json

Include error handling: if the file doesn't exist locally (user might be
using the published npm version, not the local project), fall back to
fetching from https://legitui.com/r/orbit-gallery.json and extracting
the source from the JSON registry file.

Show me the complete get-source.ts tool implementation.
```

---

### PROMPT 2.5 — install_component tool

```
Create mcp/src/tools/install-component.ts

This is the most powerful tool — it actually RUNS the install command
in the developer's project, adding the component to their codebase.

Tool definition:
  name: "install_component"
  description: "Install a LegitUI component directly into the developer's project
    using shadcn or jsrepo CLI. This runs the actual install command.
    The component files will be added to the project immediately.
    IMPORTANT: Only run this after confirming with the developer which
    component they want and which install method to use."

Input schema:
  {
    slug: z.string()
      .describe("Component slug to install. Example: orbit-gallery"),
    method: z.enum(['shadcn', 'jsrepo']).default('shadcn')
      .describe("Install method: shadcn (recommended) or jsrepo"),
    target_dir: z.string().optional()
      .describe("Target directory for component files. Default: src/components/ui/"),
    dry_run: z.boolean().optional().default(false)
      .describe("If true, show the command that would run without executing it"),
  }

Implementation:
  import { execSync } from 'child_process';

  const commands = {
    shadcn: `npx shadcn@latest add https://legitui.com/r/${slug}.json`,
    jsrepo: `npx jsrepo add legitui.com/${slug}`,
  };

  if (dry_run) {
    return { content: [{ type: 'text', text: `Would run: ${commands[method]}` }] };
  }

  // Run the install command in the project root
  const projectRoot = process.env.LEGITUI_PROJECT_ROOT || process.cwd();

  try {
    const output = execSync(commands[method], {
      cwd: projectRoot,
      encoding: 'utf-8',
      timeout: 60000, // 60 second timeout
      stdio: ['inherit', 'pipe', 'pipe'],
    });

    return success output with:
    - The command that was run
    - The files that were created (parse from shadcn output)
    - The import path to use
    - A ready-to-use code snippet

  } catch (error) {
    return error output with:
    - The exact error message
    - Common fixes (missing shadcn config, wrong directory, etc.)
    - The manual copy alternative
  }

Output format on success:
  ✅ OrbitGallery installed successfully!

  **Files created:**
  - src/components/ui/OrbitGallery.tsx
  - src/components/ui/OrbitGallery.module.css

  **Import in your component:**
  ```tsx
  import { OrbitGallery } from "@/components/ui/OrbitGallery";
  ```

  **Install dependencies:**
  npm install three @react-three/fiber @react-three/drei

  **Quick start:**
  ```tsx
  <OrbitGallery
    items={["/img/1.jpg", "/img/2.jpg", "/img/3.jpg"]}
    radius={300}
    speed={0.5}
  />
  ```

Show me the complete install-component.ts tool implementation.
```

---

### PROMPT 2.6 — get_install_command tool

```
Create mcp/src/tools/get-install-command.ts

Simpler tool — just returns the install commands without running them.
Useful when the AI wants to tell the developer the command rather than
run it automatically.

Tool definition:
  name: "get_install_command"
  description: "Get the CLI install command for a LegitUI component.
    Returns both shadcn and jsrepo install commands."

Input schema:
  {
    slug: z.string()
      .describe("Component slug. Example: orbit-gallery"),
  }

Output format:
  ## Install OrbitGallery

  ### Option 1: shadcn CLI (recommended)
  ```bash
  npx shadcn@latest add https://legitui.com/r/orbit-gallery.json
  ```

  ### Option 2: jsrepo CLI
  ```bash
  npx jsrepo add legitui.com/orbit-gallery
  ```

  ### Option 3: Manual
  Copy source from: https://legitui.com/components/orbit-gallery
  (Click the Code tab, select your variant: TSX / JSX / CSS)

  ### After install, add dependencies:
  ```bash
  npm install three @react-three/fiber @react-three/drei
  ```

Show me the complete get-install-command.ts tool implementation.
```

---

## Phase 3 — Connect to Claude Code

### PROMPT 3.1 — Claude Code / Claude Desktop Configuration

```
Create the configuration file that connects the LegitUI MCP server to Claude Code.

Claude Code uses: ~/claude_desktop_config.json (macOS/Linux)
                  %APPDATA%\Claude\claude_desktop_config.json (Windows)

Also works for Claude Desktop app.

The config format:

{
  "mcpServers": {
    "legitui": {
      "command": "node",
      "args": ["/absolute/path/to/legitui/mcp/dist/index.js"],
      "env": {
        "LEGITUI_PROJECT_ROOT": "/absolute/path/to/your/project",
        "LEGITUI_REGISTRY_URL": "https://legitui.com/registry/index.json"
      }
    }
  }
}

For users who install via npm (once published):
{
  "mcpServers": {
    "legitui": {
      "command": "npx",
      "args": ["-y", "@legitui/mcp"],
      "env": {
        "LEGITUI_PROJECT_ROOT": "/path/to/their/project"
      }
    }
  }
}

Create a setup script at mcp/scripts/setup-claude.js that:
1. Detects the OS
2. Finds the correct config file path
3. Reads existing config (or creates new)
4. Adds the legitui MCP server entry
5. Writes back the config
6. Prints instructions to restart Claude

Usage: node mcp/scripts/setup-claude.js

Also create mcp/scripts/setup-cursor.js for Cursor configuration.
Cursor uses: .cursor/mcp.json in the project root

{
  "mcpServers": {
    "legitui": {
      "command": "node",
      "args": ["./mcp/dist/index.js"],
      "env": {
        "LEGITUI_PROJECT_ROOT": "."
      }
    }
  }
}

Show me both setup scripts and the config file formats.
```

---

## Phase 4 — Connect to Cursor

### PROMPT 4.1 — Cursor MCP Setup

```
Create .cursor/mcp.json at the root of the LegitUI project
(this connects Cursor's AI to the LegitUI MCP server when
 a developer opens the LegitUI project in Cursor).

Also create a SEPARATE config for developers who are working on their
OWN project but want to use LegitUI components — they need to point
the MCP server at the LegitUI registry URL, not a local path.

.cursor/mcp.json (for LegitUI developers — working IN the repo):
{
  "mcpServers": {
    "legitui": {
      "command": "node",
      "args": ["./mcp/dist/index.js"],
      "env": {
        "LEGITUI_PROJECT_ROOT": ".",
        "NODE_ENV": "development"
      },
      "description": "LegitUI component library MCP server"
    }
  }
}

Instructions for external developers (add to README.md):
{
  "mcpServers": {
    "legitui": {
      "command": "npx",
      "args": ["-y", "@legitui/mcp"],
      "env": {
        "LEGITUI_PROJECT_ROOT": "/path/to/your/next-project",
        "LEGITUI_REGISTRY_URL": "https://legitui.com/registry/index.json"
      }
    }
  }
}

LEGITUI_PROJECT_ROOT tells the MCP server WHERE to run install commands.
LEGITUI_REGISTRY_URL tells it where to fetch component data from
(defaults to the local project registry if not set).

Also add npm scripts to package.json:
"scripts": {
  "mcp:build": "cd mcp && npm install && npm run build",
  "mcp:start": "node mcp/dist/index.js",
  "mcp:dev": "cd mcp && npm run dev",
  "mcp:setup:claude": "node mcp/scripts/setup-claude.js",
  "mcp:setup:cursor": "node mcp/scripts/setup-cursor.js"
}

Show me .cursor/mcp.json and the updated root package.json scripts.
```

---

## Phase 5 — Connect to Claude Desktop

### PROMPT 5.1 — Claude Desktop System Prompt

```
When using Claude Desktop with the LegitUI MCP server, the system prompt
helps Claude understand how to use the tools effectively.

Create a file: mcp/CLAUDE_SYSTEM_PROMPT.md

This is the recommended system prompt to add in Claude Desktop settings
when using LegitUI MCP:

---
You have access to the LegitUI MCP server which gives you complete
knowledge of the LegitUI component library.

LegitUI is a premium React component library with 54+ components including:
- WebGL backgrounds (Three.js, OGL)
- 3D components (React Three Fiber)  
- Text animations (GSAP, Framer Motion)
- Interactive components (scroll, physics, cursor)
- Loaders and UI elements

When a developer asks you to:
1. BUILD something using a LegitUI component → use search_components to find
   the right component, then get_component for full details, then install_component
   
2. RECOMMEND a component → use search_components and list_components to find
   the best match, explain the options with get_component

3. USE a specific named component → use get_component directly with the slug,
   then install_component if needed

4. CUSTOMIZE a component → use get_component_source to get the full source,
   then help the developer modify it

Always:
- Run get_component before generating code that uses a component
- Confirm with the developer before running install_component
- Use the TypeScript variant by default unless asked for JavaScript
- Check dependencies and mention they need to be npm installed separately
- Use the correct import path after installation: @/components/ui/{ComponentName}
---

This system prompt makes Claude use the MCP tools proactively rather than
needing to be reminded. Show me the complete CLAUDE_SYSTEM_PROMPT.md.
```

---

## Phase 6 — Publish to npm

### PROMPT 6.1 — Prepare for npm Publishing

```
I want to publish the LegitUI MCP server to npm as @legitui/mcp
so any developer can use it with:

npx @legitui/mcp

or add to their AI tool config:
  "command": "npx",
  "args": ["-y", "@legitui/mcp"]

Steps needed:

1. Update mcp/src/index.ts to handle the case where the server
   is running WITHOUT access to the local LegitUI project files.
   In this mode (remote mode), it should:
   - Fetch component data from LEGITUI_REGISTRY_URL env var
   - Default URL: https://legitui.com/registry/index.json
   - Cache responses for 5 minutes
   - The get_component_source tool fetches from https://legitui.com/r/{slug}.json
   - The install_component tool works normally (runs in user's project)

2. Create mcp/README.md with:
   - What this package does
   - How to install: npm install -g @legitui/mcp
   - How to configure for Claude Code, Claude Desktop, Cursor, Windsurf
   - All available tools with descriptions
   - Environment variables reference
   - Examples of prompts that work well with this MCP

3. Update mcp/package.json:
   - Add "publishConfig": { "access": "public" }
   - Add proper "repository", "homepage", "bugs" fields
   - Ensure "files": ["dist", "README.md", "scripts"]

4. Create .npmignore in mcp/:
   src/
   tsconfig.json
   node_modules/
   *.log

5. Add to root package.json:
   "mcp:publish": "cd mcp && npm run build && npm publish"

6. Create mcp/scripts/setup-all.js that detects which AI tools
   are installed (Claude, Cursor, Windsurf) and configures all of them.

Show me all files needed for publishing.
```

---

## The Prompts — Master Implementation

### MASTER PROMPT — Build the Complete MCP Server in One Pass

```
I am building an MCP (Model Context Protocol) server for LegitUI —
a Next.js 16 App Router component library with 54+ React components
including WebGL (OGL, Three.js), 3D (React Three Fiber), text animations
(GSAP, Framer Motion), and interactive components.

The goal: AI tools like Claude Code, Cursor, and Claude Desktop can:
1. Search my component library ("find me a 3D gallery component")
2. Get full component details (props, dependencies, usage)
3. Get source code of any component
4. Run the shadcn CLI to install components automatically
5. List all components by category

Create the complete MCP server at mcp/ in my project root.

PACKAGE SETUP:
mcp/package.json — @legitui/mcp package, depends on @modelcontextprotocol/sdk and zod
mcp/tsconfig.json — ES2022 module output

REGISTRY LOADER (mcp/src/lib/registry-loader.ts):
- Reads from env LEGITUI_REGISTRY_URL or falls back to local public/registry/index.json
- Exports: getRegistry(), getComponent(slug), searchComponents(query), listByCategory(cat)
- In-memory cache after first load
- Search ranks: exact name > partial name > description > tags

MAIN SERVER (mcp/src/index.ts):
- Uses @modelcontextprotocol/sdk Server + StdioServerTransport
- Registers 8 tools: list_components, search_components, get_component,
  get_component_props, get_install_command, get_usage_example,
  get_component_source, install_component
- Registers 3 resources: legitui://components, legitui://categories, legitui://component/{slug}
- All errors go to process.stderr (never stdout — stdout is MCP protocol)

TOOLS TO IMPLEMENT:

Tool 1: list_components
  Input: { category?: string, featured_only?: boolean, new_only?: boolean }
  Output: Formatted markdown list of components grouped by category
  Each entry: name, slug, description, tags, dependencies, install command

Tool 2: search_components
  Input: { query: string, limit?: number }
  Output: Ranked search results with component details
  Scoring: exact match=100, name contains=70, description=50, tags=40

Tool 3: get_component
  Input: { slug: string }
  Output: Full component info — description, props table, dependencies,
          install commands (shadcn + jsrepo), usage example, file structure after install

Tool 4: get_component_props
  Input: { slug: string }
  Output: Detailed props table with types, defaults, min/max, descriptions

Tool 5: get_install_command
  Input: { slug: string }
  Output: shadcn command, jsrepo command, npm install for deps

Tool 6: get_usage_example
  Input: { slug: string }
  Output: Complete, working TSX usage example with imports

Tool 7: get_component_source
  Input: { slug: string, variant: 'tsx' | 'jsx' | 'css' }
  Output: Full source code from local files (LEGITUI_PROJECT_ROOT env)
          or from https://legitui.com/r/{slug}.json as fallback

Tool 8: install_component
  Input: { slug: string, method: 'shadcn' | 'jsrepo', dry_run?: boolean }
  Output: Runs execSync(install command) in LEGITUI_PROJECT_ROOT
          On success: lists created files, import path, quick start snippet
          On failure: error message + manual alternatives

RESOURCES:
legitui://components → full registry JSON
legitui://categories → { categories: string[], componentCount: Record<string, number> }
legitui://component/{slug} → single component full data as JSON

ENVIRONMENT VARIABLES:
LEGITUI_PROJECT_ROOT — where to run install commands and find source files
LEGITUI_REGISTRY_URL — remote registry URL (default: https://legitui.com/registry/index.json)

CURSOR CONFIG (.cursor/mcp.json at project root):
{
  "mcpServers": {
    "legitui": {
      "command": "node",
      "args": ["./mcp/dist/index.js"],
      "env": { "LEGITUI_PROJECT_ROOT": "." }
    }
  }
}

CLAUDE CONFIG (claude_desktop_config.json):
{
  "mcpServers": {
    "legitui": {
      "command": "node",
      "args": ["{ABSOLUTE_PATH}/mcp/dist/index.js"],
      "env": { "LEGITUI_PROJECT_ROOT": "{ABSOLUTE_PATH}" }
    }
  }
}

After creating all files, give me:
1. The exact commands to build and test the server
2. How to verify it works: run the server manually and test each tool
3. The npm scripts to add to the root package.json

Use TypeScript throughout. All MCP SDK imports use .js extensions.
Show me every file completely.
```

---

## Testing & Verification

### PROMPT — Test Every Tool

```
The LegitUI MCP server is built. Now help me test every tool to verify
it works correctly before connecting to Claude Code or Cursor.

Create mcp/scripts/test-tools.js — a test script that:
1. Starts the MCP server as a child process
2. Sends MCP protocol messages to test each tool
3. Logs the responses
4. Reports pass/fail for each tool

Tests to run:

Test 1: list_components (no filter)
  → Should return all 54+ components grouped by category

Test 2: list_components (category: "text-animations")
  → Should return only text animation components

Test 3: search_components (query: "orbit gallery")
  → Should return OrbitGallery as first result

Test 4: search_components (query: "WebGL background")
  → Should return background components with WebGL deps

Test 5: get_component (slug: "orbit-gallery")
  → Should return full details including props table and install command

Test 6: get_component (slug: "nonexistent-component")
  → Should return graceful error, not crash

Test 7: get_install_command (slug: "text-reveal")
  → Should return shadcn and jsrepo commands

Test 8: get_component_source (slug: "text-reveal", variant: "tsx")
  → Should return the actual source code OR a meaningful error

Test 9: install_component (slug: "orbit-gallery", dry_run: true)
  → Should return the command it WOULD run, not actually run it

Test 10: Read resource legitui://categories
  → Should return all categories with counts

Run with: node mcp/scripts/test-tools.js
Expected output:
  ✓ list_components (all) — returned 54 components
  ✓ list_components (text-animations) — returned 12 components
  ✓ search_components (orbit gallery) — OrbitGallery ranked #1
  ✓ search_components (WebGL background) — 6 results found
  ✓ get_component (orbit-gallery) — full data returned
  ✓ get_component (nonexistent) — graceful error returned
  ✓ get_install_command (text-reveal) — shadcn + jsrepo commands returned
  ✓ get_component_source (text-reveal, tsx) — 247 lines returned
  ✓ install_component (orbit-gallery, dry_run) — command shown, not executed
  ✓ resources/categories — 6 categories returned

Show me the complete test script.
```

---

## What the AI Can Now Do — Example Conversations

### Example 1 — Building a Feature

```
Developer in Cursor:
"I need a 3D product showcase for my e-commerce site.
 Something that rotates and looks impressive."

Cursor AI with LegitUI MCP:
→ search_components("3D rotate showcase product")
→ Finds: OrbitGallery, MirrorCapsules, ScrollGallery
→ get_component("orbit-gallery")
→ Recommends OrbitGallery based on the use case
→ install_component("orbit-gallery", "shadcn") [after confirmation]
→ Writes the product showcase page using OrbitGallery with actual product images
→ Adds the npm install command for three + r3f
→ First attempt works correctly
```

### Example 2 — Discovery

```
Developer in Claude Desktop:
"What does LegitUI have for loading states?
 My app fetches data and I need something beautiful."

Claude with LegitUI MCP:
→ search_components("loading loader skeleton")
→ list_components(category: "loaders")
→ Returns: PulseLoader, SkeletonCard, InfiniteSpinner...
→ Explains each with visual descriptions
→ "PulseLoader has no dependencies and loads in < 1 second.
   Run: npx shadcn@latest add https://legitui.com/r/pulse-loader.json"
```

### Example 3 — Customization

```
Developer in Claude Code:
"I want to customize the TextReveal component —
 make it reveal words instead of characters."

Claude Code with LegitUI MCP:
→ get_component_source("text-reveal", "tsx")
→ Returns full source code
→ Claude analyzes the animateBy prop
→ "TextReveal already has animateBy='words' as a prop option.
   You don't need to modify the source — just pass animateBy='words'"
→ Shows the exact prop usage
```

---

## Summary — What You're Shipping

```
npm run mcp:build
→ Builds mcp/dist/index.js — the MCP server binary

npm run mcp:setup:claude
→ Adds legitui to ~/claude_desktop_config.json automatically

npm run mcp:setup:cursor
→ Creates .cursor/mcp.json in your project

Restart Claude / Cursor → LegitUI MCP is live

Now any developer can say:
"Use LegitUI's OrbitGallery for this gallery section"
And the AI will find it, understand it, install it, and use it correctly.
```

---

## Three Laws of LegitUI MCP

```
Law 1: The MCP server NEVER writes to stdout except for MCP protocol messages.
       All logs, errors, and debug info go to process.stderr.
       Breaking this breaks the entire protocol.

Law 2: install_component ALWAYS uses dry_run: true by default in automated contexts.
       Only run the actual install when explicitly confirmed by the developer.
       Never auto-install without asking.

Law 3: When local files are not accessible (remote usage),
       ALWAYS fall back to fetching from LEGITUI_REGISTRY_URL.
       The MCP server works for both local LegitUI developers
       AND external developers using the npm package.
```

---

*LegitUI MCP Server Guide*
*Model Context Protocol · Claude Code · Cursor · Claude Desktop*
*@modelcontextprotocol/sdk · Next.js 16 · shadcn CLI · May 2026*
