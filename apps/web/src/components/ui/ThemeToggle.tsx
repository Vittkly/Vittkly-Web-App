"use client";

import React, { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { VittklyIcon } from "@/components/icons/VittklyIcons";

function emptySubscribe() {
  return () => {};
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <div
        className={`rounded-pill bg-surface-sunken h-11 w-11 animate-pulse lg:h-9 lg:w-9 ${className}`}
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`rounded-pill border-line bg-surface-raised text-ink hover:text-primary-ink hover:border-vitta focus-visible:outline-focus inline-flex h-11 w-11 cursor-pointer items-center justify-center border transition-colors focus-visible:outline-2 lg:h-9 lg:w-9 ${className}`}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      <VittklyIcon
        name="moon"
        size={18}
        className={isDark ? "text-primary" : "text-ink-muted"}
      />
    </button>
  );
}

export default ThemeToggle;
