// ════════════════════════════════════════════════════════════════
// LegitUI — User Preferences Store
// ════════════════════════════════════════════════════════════════
// Purpose-built localStorage wrapper for USER-specific preferences.
// Does NOT store component registry data (that lives in component-registry.ts).
// ════════════════════════════════════════════════════════════════

"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

/* ────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────── */
export interface UserPreferences {
  /** Preferred code tab: TypeScript or JavaScript */
  preferredLanguage: "tsx" | "jsx";
  /** Last 10 component slugs the user visited */
  recentlyViewed: string[];
  /** Whether the prop customizer panel is open */
  propCustomizerOpen: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  preferredLanguage: "tsx",
  recentlyViewed: [],
  propCustomizerOpen: true,
};

const PREFERENCES_KEY = "legitui_preferences";
const PREFERENCES_VERSION_KEY = "legitui_preferences_version";
const PREFERENCES_VERSION = 1;

/* ────────────────────────────────────────────────────
   Safe read/write helpers
   ──────────────────────────────────────────────────── */
function loadPreferences(): UserPreferences {
  try {
    if (typeof window === "undefined") return DEFAULT_PREFERENCES;

    const versionStr = localStorage.getItem(PREFERENCES_VERSION_KEY);
    const version = versionStr ? parseInt(versionStr, 10) : 0;

    // Version mismatch → reset to defaults
    if (version !== PREFERENCES_VERSION) {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(DEFAULT_PREFERENCES));
      localStorage.setItem(PREFERENCES_VERSION_KEY, String(PREFERENCES_VERSION));
      return DEFAULT_PREFERENCES;
    }

    const raw = localStorage.getItem(PREFERENCES_KEY);
    if (!raw) return DEFAULT_PREFERENCES;

    const parsed = JSON.parse(raw);
    // Merge with defaults to handle any missing fields
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function savePreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
    localStorage.setItem(PREFERENCES_VERSION_KEY, String(PREFERENCES_VERSION));
  } catch {
    // localStorage may be unavailable (SSR, private browsing, quota exceeded)
  }
}

/* ────────────────────────────────────────────────────
   Context + Provider
   ──────────────────────────────────────────────────── */
interface PreferencesContext {
  preferences: UserPreferences;
  setPreferredLanguage: (lang: "tsx" | "jsx") => void;
  addRecentlyViewed: (slug: string) => void;
  setPropCustomizerOpen: (open: boolean) => void;
}

const PreferencesCtx = createContext<PreferencesContext | null>(null);

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setPreferences(loadPreferences());
    setHydrated(true);
  }, []);

  // Persist on every change (after initial hydration)
  useEffect(() => {
    if (hydrated) {
      savePreferences(preferences);
    }
  }, [preferences, hydrated]);

  const setPreferredLanguage = useCallback((lang: "tsx" | "jsx") => {
    setPreferences((prev) => ({ ...prev, preferredLanguage: lang }));
  }, []);

  const addRecentlyViewed = useCallback((slug: string) => {
    setPreferences((prev) => {
      const filtered = prev.recentlyViewed.filter((s) => s !== slug);
      return {
        ...prev,
        recentlyViewed: [slug, ...filtered].slice(0, 10),
      };
    });
  }, []);

  const setPropCustomizerOpen = useCallback((open: boolean) => {
    setPreferences((prev) => ({ ...prev, propCustomizerOpen: open }));
  }, []);

  return (
    <PreferencesCtx.Provider
      value={{
        preferences,
        setPreferredLanguage,
        addRecentlyViewed,
        setPropCustomizerOpen,
      }}
    >
      {children}
    </PreferencesCtx.Provider>
  );
}

/* ────────────────────────────────────────────────────
   Hook
   ──────────────────────────────────────────────────── */
export function useUserPreferences() {
  const ctx = useContext(PreferencesCtx);
  if (!ctx) {
    throw new Error("useUserPreferences must be used within a UserPreferencesProvider");
  }
  return ctx;
}
