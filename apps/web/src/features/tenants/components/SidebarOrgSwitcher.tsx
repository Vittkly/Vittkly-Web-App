"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { clsx } from "clsx";
import { selectOrganizationAction } from "../actions/tenants.actions";
import type { UserOrganization } from "../types/tenants.types";
import { getOrganizationInitials } from "../utils/initials";

export interface SidebarOrgSwitcherProps {
  organizations: UserOrganization[];
  activeOrganizationId: string;
  collapsed?: boolean;
}

export function SidebarOrgSwitcher({
  organizations,
  activeOrganizationId,
  collapsed = false,
}: SidebarOrgSwitcherProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const active = organizations.find((o) => o.id === activeOrganizationId);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!active) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Empresa activa: ${active.name}. Cambiar de empresa`}
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "hover:bg-surface-sunken/60 focus-visible:outline-focus flex w-full cursor-pointer items-center gap-2.5 rounded-xl p-1.5 text-left transition-colors focus-visible:outline-2",
          collapsed && "justify-center",
        )}
      >
        <span
          aria-hidden="true"
          className="bg-primary-soft text-primary-ink ring-primary/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-mono text-sm font-bold ring-1"
        >
          {getOrganizationInitials(active.name)}
        </span>
        {!collapsed && (
          <>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-ink truncate text-xs font-bold">
                {active.name}
              </span>
              <span className="text-ink-muted truncate text-[11px]">
                {active.roleName}
              </span>
            </span>
            <ChevronsUpDown
              className="text-ink-muted h-4 w-4 shrink-0"
              aria-hidden="true"
            />
          </>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Cambiar de empresa"
          className="bg-surface-raised border-line shadow-2 absolute top-full left-0 z-50 mt-2 flex w-64 flex-col gap-0.5 rounded-xl border p-1.5"
        >
          <p className="text-ink-muted px-2.5 py-1.5 text-[11px] font-semibold tracking-wider uppercase">
            Tus empresas
          </p>
          {organizations.map((org) => {
            const isActive = org.id === active.id;
            return (
              <form key={org.id} action={selectOrganizationAction}>
                <input type="hidden" name="organizationId" value={org.id} />
                <button
                  type="submit"
                  role="menuitemradio"
                  aria-checked={isActive}
                  onClick={
                    isActive
                      ? (e) => {
                          e.preventDefault();
                          setOpen(false);
                        }
                      : undefined
                  }
                  className="hover:bg-surface-sunken/60 focus-visible:outline-focus flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors focus-visible:outline-2"
                >
                  <span
                    aria-hidden="true"
                    className="bg-primary-soft text-primary-ink flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold"
                  >
                    {getOrganizationInitials(org.name)}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-ink truncate text-xs font-semibold">
                      {org.name}
                    </span>
                    <span className="text-ink-muted truncate text-[11px]">
                      {org.roleName}
                    </span>
                  </span>
                  {isActive && (
                    <Check
                      className="text-primary h-4 w-4 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </form>
            );
          })}
        </div>
      )}
    </div>
  );
}
