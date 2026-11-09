"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  FileSpreadsheet,
  Layers,
  Receipt,
  Handshake,
  ClipboardCheck,
  Briefcase,
  Clock,
  Navigation,
  CalendarDays,
  UserCheck,
  Zap,
  HeartHandshake,
  MessageSquare,
  Users,
  Sparkles,
} from "lucide-react";
import {
  SETTINGS_CATEGORIES,
  SETTINGS_SUBMODULES,
} from "../types/settings.types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  empresa: Building2,
  "plantillas-cotizacion": FileSpreadsheet,
  "mix-tarifarios": Layers,
  "cotizaciones-cobros": Receipt,
  convenios: Handshake,
  "formularios-terminos": ClipboardCheck,
  "equipos-funciones": Briefcase,
  "marcaciones-tiempo": Clock,
  "rutas-kilometros": Navigation,
  "trabajos-agenda": CalendarDays,
  "crm-clientes": UserCheck,
  activaciones: Zap,
  "post-venta": HeartHandshake,
  "mensajes-avisos": MessageSquare,
  "usuarios-perfiles": Users,
  "mi-plan": Sparkles,
};

export function SettingsSecondaryNav() {
  const pathname = usePathname();

  const isCurrent = (slug: string) => {
    if (slug === "usuarios-perfiles") {
      return (
        pathname === "/dashboard/configuraciones" ||
        pathname === "/dashboard/configuraciones/" ||
        pathname === "/dashboard/configuraciones/usuarios-perfiles"
      );
    }
    return pathname === `/dashboard/configuraciones/${slug}`;
  };

  return (
    <>
      {/* 1. VISTA MÓVIL / REDUCIDA (< lg): Barra horizontal deslizable sin scrollbar visible */}
      <div className="border-line bg-surface-raised/90 sticky top-0 z-30 flex w-full border-b backdrop-blur-md lg:hidden">
        <div
          role="tablist"
          aria-label="Submódulos de configuración"
          className="flex w-full [scrollbar-width:none] items-center gap-2 overflow-x-auto px-4 py-2.5 whitespace-nowrap [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {SETTINGS_SUBMODULES.map((sub) => {
            const active = isCurrent(sub.slug);
            const Icon = ICON_MAP[sub.slug] || Users;

            return (
              <Link
                key={`mobile-${sub.slug}`}
                href={`/dashboard/configuraciones/${sub.slug}`}
                role="tab"
                aria-selected={active}
                className={`rounded-pill inline-flex shrink-0 items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? "bg-primary font-bold text-white shadow-xs"
                    : "bg-surface-sunken text-ink-muted hover:text-ink hover:bg-surface-raised border-line border"
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 shrink-0 ${active ? "text-white" : "text-ink-muted"}`}
                />
                <span>{sub.name}</span>
                {sub.isActiveModule && !active && (
                  <span className="bg-success h-1.5 w-1.5 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* 2. VISTA ESCRITORIO (>= lg): Menú lateral izquierdo estándar colapsable por categorías */}
      <aside
        aria-label="Navegación de configuración"
        className="border-line bg-surface-raised/40 hidden w-64 shrink-0 flex-col border-r lg:flex"
      >
        <div className="border-line flex flex-col gap-1 border-b px-4 py-3.5">
          <span className="text-ink font-sans text-xs font-bold tracking-tight uppercase">
            Configuración
          </span>
          <span className="text-ink-muted text-[11px]">
            Parámetros de empresa y equipo
          </span>
        </div>

        <nav className="flex flex-col gap-4 overflow-y-auto p-3 text-xs">
          {SETTINGS_CATEGORIES.map((cat) => {
            const submodules = SETTINGS_SUBMODULES.filter(
              (s) => s.category === cat.key,
            );

            return (
              <div key={cat.key} className="flex flex-col gap-1">
                {/* Encabezado de Categoría */}
                <div className="text-ink-muted px-2.5 py-1 text-[10px] font-extrabold tracking-wider uppercase">
                  {cat.label}
                </div>

                {/* Submódulos */}
                <div className="flex flex-col gap-0.5">
                  {submodules.map((sub) => {
                    const active = isCurrent(sub.slug);
                    const Icon = ICON_MAP[sub.slug] || Users;

                    return (
                      <Link
                        key={sub.slug}
                        href={`/dashboard/configuraciones/${sub.slug}`}
                        className={`group flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-semibold transition-all ${
                          active
                            ? "bg-primary-soft text-primary-ink font-bold shadow-2xs"
                            : "text-ink hover:bg-surface-raised hover:text-primary-ink"
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <Icon
                            className={`h-4 w-4 shrink-0 transition-colors ${
                              active
                                ? "text-primary-ink"
                                : "text-ink-muted group-hover:text-primary-ink"
                            }`}
                          />
                          <span className="truncate">{sub.name}</span>
                        </div>

                        {sub.isActiveModule ? (
                          <span
                            className="bg-success text-on-success h-2 w-2 rounded-full"
                            title="Módulo activo y conectado a base de datos"
                          />
                        ) : (
                          <span className="text-ink-muted/60 font-mono text-[9px] uppercase">
                            {sub.code.split("-")[1]}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
