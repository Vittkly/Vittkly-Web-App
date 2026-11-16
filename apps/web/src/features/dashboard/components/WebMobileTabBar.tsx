"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import {
  CANONICAL_MODULES,
  type CanonicalModuleCode,
  type ModuleIconKey,
} from "@vittkly/shared";
import { DashboardModuleIcon } from "./module-icons";

export interface WebMobileTabBarProps {
  allowedModules?: CanonicalModuleCode[];
  canAccessConfig?: boolean;
}

interface MobileNavItem {
  href: string;
  label: string;
  iconKey?: ModuleIconKey;
  isSettings?: boolean;
  matchPrefix?: string;
}

const PREFERRED_MOBILE_ORDER: CanonicalModuleCode[] = [
  "dashboard",
  "calendario",
  "trabajos",
  "clientes",
];

export function WebMobileTabBar({
  allowedModules = [],
  canAccessConfig = false,
}: WebMobileTabBarProps) {
  const pathname = usePathname();
  const allowedSet = new Set(allowedModules);

  const selectedModules = CANONICAL_MODULES.filter((m) =>
    allowedSet.has(m.code),
  ).sort((a, b) => {
    const idxA = PREFERRED_MOBILE_ORDER.indexOf(a.code);
    const idxB = PREFERRED_MOBILE_ORDER.indexOf(b.code);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.orden - b.orden;
  });

  const maxModuleSlots = canAccessConfig ? 4 : 5;
  const navItems: MobileNavItem[] = selectedModules
    .slice(0, maxModuleSlots)
    .map((mod) => ({
      href: mod.href,
      label: mod.label,
      iconKey: mod.iconKey,
      matchPrefix: mod.code === "dashboard" ? "/dashboard" : mod.href,
    }));

  if (canAccessConfig) {
    navItems.push({
      href: "/dashboard/configuraciones",
      label: "Config",
      isSettings: true,
      matchPrefix: "/dashboard/configuraciones",
    });
  }

  if (navItems.length === 0) {
    return null;
  }

  const isItemActive = (item: MobileNavItem) => {
    if (item.href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/dashboard/";
    }
    if (item.matchPrefix) {
      return pathname.startsWith(item.matchPrefix);
    }
    return pathname === item.href || pathname.startsWith(item.href);
  };

  return (
    <nav
      aria-label="Navegación móvil"
      className="border-line bg-surface-raised/95 fixed right-0 bottom-0 left-0 z-40 flex h-16 w-full items-center justify-around border-t pb-[env(safe-area-inset-bottom)] shadow-lg backdrop-blur-lg transition-colors lg:hidden"
    >
      {navItems.map((item) => {
        const active = isItemActive(item);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-1 text-center transition-all ${
              active
                ? "text-primary-ink font-bold"
                : "text-ink-muted hover:text-ink font-medium"
            }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                active ? "bg-primary-soft text-primary-ink" : "text-ink-muted"
              }`}
            >
              {item.isSettings ? (
                <Settings className="h-4 w-4" strokeWidth={1.75} />
              ) : (
                <DashboardModuleIcon
                  iconKey={item.iconKey ?? "LayoutGrid"}
                  className="h-4 w-4"
                  strokeWidth={1.75}
                />
              )}
            </div>
            <span className="max-w-[64px] truncate text-[10px] leading-none tracking-tight">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export default WebMobileTabBar;
