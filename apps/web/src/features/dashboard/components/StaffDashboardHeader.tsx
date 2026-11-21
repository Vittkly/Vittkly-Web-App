"use client";

import React from "react";
import Link from "next/link";
import { LogOut, ShieldCheck, Command } from "lucide-react";
import { VittklyLogo } from "@/components/brand/VittklyLogo";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { staffLogoutAction } from "@/features/auth/actions/auth.actions";
import type { StaffDashboardContextResult } from "../services/modules.service";

export interface StaffDashboardHeaderProps {
  context: StaffDashboardContextResult;
  onSearchClick?: () => void;
}

export function StaffDashboardHeader({
  context,
  onSearchClick,
}: StaffDashboardHeaderProps) {
  const { user, roleLabel, staffRole } = context;

  return (
    <header className="border-line bg-surface-raised/85 sticky top-0 z-30 border-b shadow-xs backdrop-blur-md transition-colors">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Lado izquierdo: Logotipo + Insignia de Staff Interno */}
        <div className="flex items-center gap-3">
          <Link
            href="/internal/dashboard"
            className="focus-visible:outline-focus flex items-center gap-2 transition-opacity hover:opacity-90 focus-visible:outline-2"
          >
            <VittklyLogo variant="wordmark" height={28} priority />
          </Link>

          <div className="bg-line hidden h-5 w-px sm:block" />

          <div className="hidden items-center gap-2 sm:flex">
            <Badge variant="plan" size="sm" mono>
              Staff Vittkly
            </Badge>
            <Badge
              variant={staffRole === "admin" ? "primary" : "role"}
              size="sm"
            >
              <ShieldCheck className="h-3 w-3" />
              <span>{roleLabel}</span>
            </Badge>
            <Badge variant="success" size="sm" dot pulse>
              Infraestructura Activa
            </Badge>
          </div>
        </div>

        {/* Centro / Atajo de búsqueda rápida */}
        <div className="hidden items-center md:flex">
          <button
            type="button"
            onClick={onSearchClick}
            className="border-line bg-surface-sunken/60 text-ink-muted hover:border-line-strong hover:bg-surface-sunken focus-visible:outline-focus flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-colors focus-visible:outline-2"
          >
            <span>Buscar módulo o comando</span>
            <kbd className="border-line bg-surface-raised text-ink flex items-center gap-0.5 rounded border px-1.5 py-0.5 font-mono text-[10px] shadow-xs">
              <Command className="h-2.5 w-2.5" />
              <span>K</span>
            </kbd>
          </button>
        </div>

        {/* Lado derecho: Usuario + Tema + Cerrar Sesión */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <div className="bg-primary-soft text-primary-ink ring-primary/20 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ring-1">
              {user.nombre.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden flex-col text-left xl:flex">
              <span className="text-ink max-w-[120px] truncate text-xs leading-tight font-bold">
                {user.nombre}
              </span>
              <span className="text-ink-muted max-w-[140px] truncate font-mono text-[11px] leading-tight">
                {user.correo}
              </span>
            </div>
          </div>

          <ThemeToggle />

          <form action={staffLogoutAction}>
            <button
              type="submit"
              title="Cerrar sesión de Staff"
              aria-label="Cerrar sesión de Staff"
              className="text-ink-muted hover:text-danger-ink hover:bg-danger-soft/60 focus-visible:outline-danger flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-transparent transition-colors focus-visible:outline-2"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

export default StaffDashboardHeader;
