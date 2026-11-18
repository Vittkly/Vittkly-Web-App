"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRightLeft,
  Check,
  LayoutGrid,
  LogOut,
  Settings,
  X,
} from "lucide-react";
import {
  CANONICAL_MODULES,
  CANONICAL_PROCESSES,
  type CanonicalModuleCode,
  type CanonicalModuleMeta,
  type ProcessKey,
} from "@vittkly/shared";
import { logoutAction } from "@/features/auth/actions/auth.actions";
import { selectOrganizationAction } from "@/features/tenants/actions/tenants.actions";
import type { UserOrganization } from "@/features/tenants/types/tenants.types";
import { DashboardModuleIcon } from "./module-icons";

export interface WebMobileTabBarProps {
  allowedModules?: CanonicalModuleCode[];
  canAccessConfig?: boolean;
  organizations?: UserOrganization[];
  activeOrganizationId?: string;
  pendingInvitationsCount?: number;
  activeProfile?: {
    nombre: string;
    codigo: string;
    esPropietario?: boolean;
  };
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
  organizations = [],
  activeOrganizationId,
  pendingInvitationsCount = 0,
  activeProfile,
}: WebMobileTabBarProps) {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  const closeMoreDrawer = (restoreFocus = false) => {
    setShowMore(false);
    if (restoreFocus) {
      moreButtonRef.current?.focus();
    }
  };

  useEffect(() => {
    if (!showMore) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowMore(false);
        moreButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showMore]);

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

  if (selectedModules.length === 0 && !canAccessConfig) {
    return null;
  }

  const primaryModules = selectedModules.slice(0, 4);
  const primaryCodeSet = new Set(primaryModules.map((m) => m.code));
  const remainingModules = selectedModules.filter(
    (m) => !primaryCodeSet.has(m.code),
  );

  const isModuleActive = (mod: CanonicalModuleMeta) => {
    if (mod.href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/dashboard/";
    }
    return pathname === mod.href || pathname.startsWith(`${mod.href}/`);
  };

  const isConfigActive = pathname.startsWith("/dashboard/configuraciones");
  const isAnyPrimaryActive = primaryModules.some((m) => isModuleActive(m));
  const isMoreActive =
    showMore ||
    (!isAnyPrimaryActive &&
      (isConfigActive || remainingModules.some((m) => isModuleActive(m))));

  const remainingRootModules = remainingModules.filter(
    (m) => m.process === "root",
  );
  const remainingProcessGroups: Array<{
    key: Exclude<ProcessKey, "root"> | "general";
    label: string;
    items: CanonicalModuleMeta[];
  }> = CANONICAL_PROCESSES.map((proc) => ({
    key: proc.key,
    label: proc.label,
    items: remainingModules.filter((m) => m.process === proc.key),
  })).filter((g) => g.items.length > 0);

  if (remainingRootModules.length > 0) {
    remainingProcessGroups.push({
      key: "general",
      label: "General",
      items: remainingRootModules,
    });
  }

  const activeOrg =
    organizations.find((o) => o.id === activeOrganizationId) ||
    organizations[0];
  const activeCompanyName = activeOrg?.name || "Mi empresa";
  const activeRoleName =
    activeProfile?.nombre || activeOrg?.roleName || "Colaborador";

  return (
    <>
      <nav
        aria-label="Navegación móvil"
        className="border-line bg-surface-raised/95 fixed right-0 bottom-0 left-0 z-40 flex min-h-16 w-full items-center justify-around border-t pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] shadow-lg backdrop-blur-lg transition-colors lg:hidden"
      >
        {primaryModules.map((mod) => {
          const active = isModuleActive(mod) && !showMore;

          return (
            <Link
              key={mod.code}
              href={mod.href}
              onClick={() => setShowMore(false)}
              aria-current={active ? "page" : undefined}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-1 text-center transition-all ${
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
                <DashboardModuleIcon
                  iconKey={mod.iconKey}
                  className="h-4 w-4"
                  strokeWidth={1.75}
                />
              </div>
              <span className="max-w-[64px] truncate text-[10px] leading-none tracking-tight">
                {mod.label}
              </span>
            </Link>
          );
        })}

        <button
          ref={moreButtonRef}
          type="button"
          onClick={() => setShowMore((prev) => !prev)}
          aria-expanded={showMore}
          aria-controls="mobile-more-drawer"
          aria-current={isMoreActive ? "page" : undefined}
          className={`flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-1 py-1 text-center transition-all ${
            isMoreActive
              ? "text-primary-ink font-bold"
              : "text-ink-muted hover:text-ink font-medium"
          }`}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
              isMoreActive
                ? "bg-primary-soft text-primary-ink"
                : "text-ink-muted"
            }`}
          >
            <LayoutGrid className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <span className="max-w-[64px] truncate text-[10px] leading-none tracking-tight">
            Más
          </span>
        </button>
      </nav>

      {showMore && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) closeMoreDrawer(true);
          }}
          className="nv-mas bg-ink/45 fixed inset-0 z-50 flex flex-col justify-end backdrop-blur-xs lg:hidden"
        >
          <div
            id="mobile-more-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Más módulos"
            className="nv-mas-c border-line bg-surface-raised shadow-2 flex max-h-[82dvh] flex-col gap-4 overflow-y-auto overscroll-contain rounded-t-3xl border-t px-4 pt-3 pb-[calc(2rem+env(safe-area-inset-bottom))]"
          >
            {/* Drag handle */}
            <div
              aria-hidden="true"
              className="bg-line-strong/40 mx-auto h-1 w-10 shrink-0 rounded-full"
            />

            {/* Header */}
            <div className="border-line flex items-center justify-between gap-3 border-b pb-2.5">
              <div className="min-w-0">
                <b className="text-ink block truncate text-sm font-bold">
                  {activeCompanyName}
                </b>
                <span className="text-ink-muted block truncate text-[11px] font-semibold">
                  Perfil: {activeRoleName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => closeMoreDrawer(true)}
                aria-label="Cerrar menú Más"
                className="text-ink-muted hover:bg-surface-sunken hover:text-ink flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Módulos restantes agrupados por proceso */}
            {remainingProcessGroups.map((group) => (
              <div key={group.label} className="flex flex-col gap-2">
                <p className="text-ink-muted text-[11px] font-bold tracking-wider uppercase">
                  {group.label}
                </p>
                <div className="nv-mas-grid grid grid-cols-3 gap-2">
                  {group.items.map((mod) => {
                    const active = isModuleActive(mod);
                    return (
                      <Link
                        key={mod.code}
                        href={mod.href}
                        onClick={() => setShowMore(false)}
                        className={`flex min-h-[76px] flex-col items-center justify-center gap-1.5 rounded-2xl border px-1.5 py-2 text-center text-xs leading-tight font-semibold transition-colors ${
                          active
                            ? "border-primary bg-primary-soft text-primary-ink font-bold"
                            : "border-line bg-surface text-ink hover:bg-surface-sunken"
                        }`}
                      >
                        <DashboardModuleIcon
                          iconKey={mod.iconKey}
                          className="h-5 w-5 shrink-0"
                          strokeWidth={1.75}
                        />
                        <span className="line-clamp-2 wrap-break-word">
                          {mod.label}
                        </span>
                        {mod.isPronto && (
                          <span className="border-line bg-surface-raised text-ink-muted rounded-full border px-1.5 py-0.5 text-[9px] font-bold">
                            Pronto
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Cuenta y accesos */}
            <div className="flex flex-col gap-2">
              <p className="text-ink-muted text-[11px] font-bold tracking-wider uppercase">
                Cuenta y accesos
              </p>

              <div className="nv-mas-grid grid grid-cols-3 gap-2">
                {canAccessConfig && (
                  <Link
                    href="/dashboard/configuraciones"
                    onClick={() => setShowMore(false)}
                    className={`flex min-h-[76px] flex-col items-center justify-center gap-1.5 rounded-2xl border px-1.5 py-2 text-center text-xs leading-tight font-semibold transition-colors ${
                      isConfigActive
                        ? "border-primary bg-primary-soft text-primary-ink font-bold"
                        : "border-line bg-surface text-ink hover:bg-surface-sunken"
                    }`}
                  >
                    <Settings className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                    <span className="line-clamp-2 wrap-break-word">
                      Configuraciones
                    </span>
                  </Link>
                )}

                <Link
                  href="/accesos"
                  onClick={() => setShowMore(false)}
                  className="border-line bg-surface text-ink hover:bg-surface-sunken relative flex min-h-[76px] flex-col items-center justify-center gap-1.5 rounded-2xl border px-1.5 py-2 text-center text-xs leading-tight font-semibold transition-colors"
                >
                  <ArrowRightLeft
                    className="h-5 w-5 shrink-0"
                    strokeWidth={1.75}
                  />
                  <span className="line-clamp-2 wrap-break-word">
                    Cambiar de empresa
                  </span>
                  {pendingInvitationsCount > 0 && (
                    <span className="bg-primary text-on-primary absolute top-1.5 right-1.5 rounded-full px-1.5 py-0.5 font-mono text-[9px] font-bold tabular-nums">
                      {pendingInvitationsCount}
                    </span>
                  )}
                </Link>

                <form action={logoutAction} className="contents">
                  <button
                    type="submit"
                    className="border-line bg-surface text-danger-ink hover:bg-danger-soft/40 flex min-h-[76px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border px-1.5 py-2 text-center text-xs leading-tight font-semibold transition-colors"
                  >
                    <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                    <span className="line-clamp-2 wrap-break-word">
                      Cerrar sesión
                    </span>
                  </button>
                </form>
              </div>

              {organizations.length > 1 && (
                <div className="border-line bg-surface mt-1 flex flex-col gap-1 rounded-2xl border p-2">
                  <span className="text-ink-muted px-1 text-[10px] font-bold tracking-wider uppercase">
                    Cambio rápido de empresa
                  </span>
                  <div className="flex max-h-36 flex-col gap-1 overflow-y-auto">
                    {organizations.map((org) => {
                      const isCurrentOrg = org.id === activeOrganizationId;
                      return (
                        <form key={org.id} action={selectOrganizationAction}>
                          <input
                            type="hidden"
                            name="organizationId"
                            value={org.id}
                          />
                          <button
                            type="submit"
                            onClick={() => setShowMore(false)}
                            className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left text-xs transition-colors ${
                              isCurrentOrg
                                ? "bg-primary-soft text-primary-ink font-bold"
                                : "text-ink hover:bg-surface-sunken font-medium"
                            }`}
                          >
                            <span className="truncate">{org.name}</span>
                            {isCurrentOrg && (
                              <Check className="text-primary-ink h-3.5 w-3.5 shrink-0" />
                            )}
                          </button>
                        </form>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default WebMobileTabBar;
