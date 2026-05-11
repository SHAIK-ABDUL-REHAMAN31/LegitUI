// ════════════════════════════════════════════════════
// LegitUI — Centralized Registry Type Definitions
// ════════════════════════════════════════════════════

/**
 * The shape of each component prop definition.
 * Used both in the registry (metadata) and the live prop customizer UI.
 */
export interface ComponentProp {
  name: string;
  /** Broad type string — drives which control renders in the customizer */
  type: string;
  default?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ label: string; value: string }>;
  /** Optional human-readable label; falls back to `name` if omitted */
  label?: string;
  description: string;
  required?: boolean;
}

export type ComponentCategory =
  | 'Backgrounds'
  | 'TextAnimations'
  | 'Animations'
  | 'Buttons'
  | 'Cards'
  | 'Text Effects'
  | 'Loaders'
  | 'Inputs'
  | 'Navigation'
  | 'LegitComponents'
  // lowercase aliases for legacy slugs
  | 'backgrounds'
  | 'textanimations'
  | 'animations'
  | 'buttons'
  | 'cards'
  | 'text-effects'
  | 'loaders'
  | 'inputs'
  | 'navigation'
  | 'legitcomponents'
  | string; // allow any string so the registry never fails a type-check

/** Full registry entry — metadata only, no code strings */
export interface ComponentRegistryEntry {
  id: string;
  slug: string;
  name: string;
  folder: string;        // Exact folder under src/ui-components/
  fileName: string;      // Filename without extension
  category: ComponentCategory;
  description: string;
  tags: string[];
  dependencies?: string[];  // npm packages: ['three', 'ogl']
  devDependencies?: string[];
  props?: ComponentProp[];
  usageExample?: string;
  previews?: string[];
  featured?: boolean;
  isNew?: boolean;
  isUpdated?: boolean;
  createdAt: string;     // ISO date string
  updatedAt?: string;
  previewVideo?: string;
  previewImage?: string;
}

/** What the Server Component passes down to the Client Component */
export interface ComponentPageData {
  meta: ComponentRegistryEntry;
  tsxCode: string | null;
  jsxCode: string | null;
  cssCode: string | null;
}

/** Convenience aliases */
export type ComponentSlug = string;
export type ComponentMap = Record<ComponentSlug, ComponentRegistryEntry>;
