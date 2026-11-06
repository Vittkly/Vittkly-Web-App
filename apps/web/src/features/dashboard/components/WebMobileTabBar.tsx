"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, Briefcase, Users, Settings } from "lucide-react";

export interface MobileNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  matchPrefix?: string;
}

const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  {
    href: "/dashboard",
    label: "Inicio",
    icon: Home,
    matchPrefix: "/dashboard",
  },
  { href: "/dashboard/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/dashboard/trabajos", label: "Trabajos", icon: Briefcase },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users },
  {
    href: "/dashboard/configuraciones",
    label: "Más",
    icon: Settings,
    matchPrefix: "/dashboard/configuraciones",
  },
];

export function WebMobileTabBar() {
  const pathname = usePathname();

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
      {MOBILE_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
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
              <Icon className="h-4 w-4" />
            </div>
            <span className="max-w-[58px] truncate text-[10px] leading-none tracking-tight">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
