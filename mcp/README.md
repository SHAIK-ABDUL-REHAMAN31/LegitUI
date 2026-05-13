# @legitui/mcp — LegitUI MCP Server

> Make **Claude, Cursor, Windsurf**, and any MCP-compatible AI assistant
> aware of the LegitUI component library. AI can query, search, read source
> code, and install components — automatically.

[![npm version](https://img.shields.io/npm/v/@legitui/mcp)](https://www.npmjs.com/package/@legitui/mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## What This Does

```
WITHOUT MCP:
Developer: "Build me a hero section with OrbitGallery"
AI: "I don't know what OrbitGallery is. Here's a generic hero..."

WITH LEGITUI MCP:
Developer: "Build me a hero section with OrbitGallery"
AI → calls search_components("orbit gallery")
AI → calls get_component("orbit-gallery")
AI → calls install_component("orbit-gallery")
AI: "✅ OrbitGallery installed! Here's your hero section
     using the correct props: radius, speed, items..."
```

---

## Quick Setup

### Cursor

Add to `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "legitui": {
      "command": "npx",
      "args": ["-y", "@legitui/mcp"],
      "env": {
        "LEGITUI_PROJECT_ROOT": "."
      }
    }
  }
}
```

### Claude Code / Claude Desktop

Add to your Claude config:

- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux:** `~/.config/claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "legitui": {
      "command": "npx",
      "args": ["-y", "@legitui/mcp"],
      "env": {
        "LEGITUI_PROJECT_ROOT": "/path/to/your/project"
      }
    }
  }
}
```

### Windsurf

Add to `.windsurf/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "legitui": {
      "command": "npx",
      "args": ["-y", "@legitui/mcp"],
      "env": {
        "LEGITUI_PROJECT_ROOT": "."
      }
    }
  }
}
```

### Auto-Setup Scripts (from LegitUI repo)

```bash
npm run mcp:setup:claude     # Auto-configure Claude Desktop
npm run mcp:setup:cursor     # Auto-configure Cursor
npm run mcp:setup:windsurf   # Auto-configure Windsurf
```

---

## Available Tools

| Tool | Description |
|------|-------------|
| `list_components` | List all 61+ components, filter by category, featured, or new |
| `search_components` | Fuzzy search by name, description, tags, deps |
| `get_component` | Full details: props table, deps, usage example, install command |
| `get_component_source` | Read the actual TSX/JSX/CSS source code |
| `get_install_command` | Get shadcn/manual install instructions |
| `install_component` | Run the install command directly in your project |

### Tool Details

#### `list_components`
```
Input: { category?: string, featured_only?: boolean, new_only?: boolean }
Output: Components grouped by category with tags and dependencies
```

#### `search_components`
```
Input: { query: string, limit?: number }
Output: Ranked results (exact match → name → description → tags → deps)
```

#### `get_component`
```
Input: { slug: string }
Output: Props table, dependencies, install commands, usage example, file structure
```

#### `get_component_source`
```
Input: { slug: string, variant?: "tsx" | "jsx" | "css" }
Output: Full source code with line count and size
```

#### `get_install_command`
```
Input: { slug: string }
Output: shadcn CLI command + manual instructions + dependency install
```

#### `install_component`
```
Input: { slug: string, method?: "shadcn" | "jsrepo", dry_run?: boolean }
Output: Runs install, reports created files, shows import path
```

---

## Available Resources

| URI | Description |
|-----|-------------|
| `legitui://components` | Full component registry as JSON |
| `legitui://categories` | All available categories |

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LEGITUI_PROJECT_ROOT` | Project root for install commands | Current directory |
| `LEGITUI_REGISTRY_URL` | Remote registry URL (for npm usage) | Local `public/registry/index.json` |

---

## Example Prompts

These prompts work great with any MCP-connected AI:

| Prompt | What Happens |
|--------|-------------|
| *"What text animation components does LegitUI have?"* | `list_components(category: "TextAnimations")` |
| *"Search for a 3D gallery component"* | `search_components("3D gallery")` |
| *"Show me the source code for OrbitGallery"* | `get_component_source("orbit-gallery")` |
| *"Install the liquid-nebula background"* | `install_component("liquid-nebula")` |
| *"Build a hero section using CinematicText"* | `get_component` → write integration code |
| *"What props does TextReveal accept?"* | `get_component("text-reveal")` |
| *"What WebGL backgrounds are available?"* | `search_components("webgl background")` |

---

## Component Categories

| Category | Count | Examples |
|----------|-------|---------|
| **Backgrounds** | 10+ | Liquid Nebula, Space Nebula, Neon Waves, Aurora |
| **TextAnimations** | 20+ | Text Reveal, Cinematic Text, Glitch Text, Scale Blur |
| **LegitComponents** | 8+ | Orbit Gallery, Scroll Gallery, Editorial Storytelling |
| **Cards** | 5+ | Glow Card, Spotlight Card, Premium Bank Card |
| **Buttons** | 3+ | Shimmer Button, Magnetic Button, Ripple Button |
| **Animations** | 3+ | Animated Border, Stacked Card Reveal |
| **Loaders** | 2+ | Pulse Loader, Skeleton Loader |
| **Inputs** | 1+ | Floating Input |

---

## Local Development

```bash
# Build the MCP server
npm run mcp:build

# Watch mode (auto-rebuild on changes)
npm run mcp:dev

# Run directly
npm run mcp:start
```

---

## License

MIT — [SHAIK-ABDUL-REHAMAN31/LegitUI](https://github.com/SHAIK-ABDUL-REHAMAN31/LegitUI)
