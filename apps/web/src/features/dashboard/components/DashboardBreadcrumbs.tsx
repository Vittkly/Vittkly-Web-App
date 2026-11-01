import React from "react";
import Link from "next/link";
import { Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

export interface DashboardBreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function DashboardBreadcrumbs({ items }: DashboardBreadcrumbsProps) {
  const homeHref = items[0]?.href || "/dashboard";

  return (
    <nav
      aria-label="Ruta de navegación"
      className="flex items-center gap-2 text-xs"
    >
      <Link
        href={homeHref}
        className="text-ink-muted hover:text-ink focus-visible:outline-focus flex items-center gap-1.5 transition-colors focus-visible:outline-2"
        title="Inicio"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1 || item.isCurrent;

        return (
          <React.Fragment key={`${item.label}-${index}`}>
            <span className="text-line-strong select-none">/</span>
            {isLast || !item.href ? (
              <span
                aria-current="page"
                className="text-ink max-w-[200px] truncate font-bold sm:max-w-xs"
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-ink-muted hover:text-ink focus-visible:outline-focus max-w-[160px] truncate transition-colors focus-visible:outline-2"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export default DashboardBreadcrumbs;
