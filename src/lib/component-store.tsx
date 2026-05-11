// ════════════════════════════════════════════════════════════════
// LegitUI — Component Store (Read-Only)
// ════════════════════════════════════════════════════════════════
// Provides the component registry to the UI via React Context.
// Read-only — no CRUD operations needed (use CLI or edit registry directly).
// ════════════════════════════════════════════════════════════════

"use client";

import { createContext, useContext, useCallback, ReactNode } from "react";
import { ComponentMeta, defaultComponents, categories, Category } from "@/lib/component-registry";

interface ComponentStore {
  components: ComponentMeta[];
  categories: Category[];
  getComponentBySlug: (slug: string) => ComponentMeta | undefined;
  getComponentsByCategory: (category: string) => ComponentMeta[];
  searchComponents: (query: string) => ComponentMeta[];
}

const ComponentContext = createContext<ComponentStore | null>(null);

export function ComponentProvider({ children }: { children: ReactNode }) {
  const components = defaultComponents;

  const getComponentBySlug = useCallback(
    (slug: string) => components.find((c) => c.slug === slug),
    [components]
  );

  const getComponentsByCategory = useCallback(
    (category: string) =>
      components.filter(
        (c) => c.category.toLowerCase() === category.toLowerCase()
      ),
    [components]
  );

  const searchComponents = useCallback(
    (query: string) => {
      const q = query.toLowerCase();
      return components.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q)) ||
          c.category.toLowerCase().includes(q)
      );
    },
    [components]
  );

  return (
    <ComponentContext.Provider
      value={{
        components,
        categories,
        getComponentBySlug,
        getComponentsByCategory,
        searchComponents,
      }}
    >
      {children}
    </ComponentContext.Provider>
  );
}

export function useComponentStore() {
  const ctx = useContext(ComponentContext);
  if (!ctx) {
    throw new Error("useComponentStore must be used within a ComponentProvider");
  }
  return ctx;
}
