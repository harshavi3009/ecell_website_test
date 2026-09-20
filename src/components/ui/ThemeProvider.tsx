"use client";

import { createContext, useContext, useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import ThemeTransitionOverlay, {
  type ThemeTransitionOverlayHandle,
} from "@/components/ui/ThemeTransitionOverlay";

// Dark is the site's default (see CLAUDE.md decision: no OS dependency).
// The toggle in the nav bar switches to light and remembers the choice in
// localStorage. Doesn't touch the nav bar itself — its pill colours are
// fixed black/white regardless of this (see PillNav.tsx).
export type Theme = "dark" | "light";

const THEME_STORAGE_KEY = "ecell-rbu-theme";
const THEME_CHANGE_EVENT = "ecell-theme-change";

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";
}

function readServerTheme(): Theme {
  return "dark";
}

// localStorage's native "storage" event only fires in *other* tabs, so we
// dispatch our own event when toggling, letting useSyncExternalStore stay in
// sync in the tab that made the change too.
function subscribeToStoredTheme(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribeToStoredTheme, readStoredTheme, readServerTheme);
  const overlayRef = useRef<ThemeTransitionOverlayHandle>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";

    // Read the colour the page is showing right now, before it changes, so
    // the overlay's tiles can cover the screen in that colour and hide the
    // actual flip underneath — see ThemeTransitionOverlay.tsx.
    const fromColor =
      getComputedStyle(document.documentElement).getPropertyValue("--background").trim() ||
      (theme === "dark" ? "#0a0a0a" : "#ffffff");
    overlayRef.current?.play(fromColor);

    window.localStorage.setItem(THEME_STORAGE_KEY, next);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
      <ThemeTransitionOverlay ref={overlayRef} />
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
