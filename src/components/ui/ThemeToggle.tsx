"use client";

import { Moon, Sun } from "lucide-react";
import PixelSwap from "@/components/reactbits/PixelSwap";
import { useTheme } from "@/components/ui/ThemeProvider";

// Nav bar theme toggle. The nav bar's own pill colours stay fixed
// black/white on purpose (see PillNav.tsx) — this only switches the rest of
// the site (see ThemeProvider.tsx) — so the button itself is styled to match
// that same black/white look rather than reacting to the theme it sets.
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <PixelSwap
      className="rounded-full"
      style={{ width: "var(--nav-h, 42px)", background: "var(--base, #000)" }}
      aspectRatio="1 / 1"
      trigger="click"
      active={theme === "light"}
      onActiveChange={toggleTheme}
      pixelSize={10}
      gap={1}
      pixelRadius={50}
      pixelScale={0.4}
      duration={500}
      pixelDuration={220}
      pattern="random"
      fade
      firstContent={
        <div className="flex h-full w-full items-center justify-center text-white">
          <Moon size={18} aria-hidden="true" />
          <span className="sr-only">Switch to light theme</span>
        </div>
      }
      secondContent={
        <div className="flex h-full w-full items-center justify-center text-white">
          <Sun size={18} aria-hidden="true" />
          <span className="sr-only">Switch to dark theme</span>
        </div>
      }
    />
  );
}
