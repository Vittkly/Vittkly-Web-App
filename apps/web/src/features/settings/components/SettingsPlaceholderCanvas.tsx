import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import type { SettingsSubmodule } from "../types/settings.types";

export interface SettingsPlaceholderCanvasProps {
  submodule: SettingsSubmodule;
}

export function SettingsPlaceholderCanvas({
  submodule,
}: SettingsPlaceholderCanvasProps) {
  return (
    <div className="flex flex-1 flex-col p-6 sm:p-8">
      {/* Contenedor central minimalista en bg-surface-raised con borde de 1px border-line */}
      <div className="border-line bg-surface-raised flex flex-1 flex-col items-center justify-center rounded-2xl border p-8 text-center sm:p-12">
        <div className="flex max-w-md flex-col items-center gap-4">
          {/* Badge con código del módulo en JetBrains Mono */}
          <div className="flex items-center gap-2">
            <span className="border-line bg-surface-sunken text-ink-muted rounded-md border px-2.5 py-1 font-mono text-xs font-semibold tabular-nums select-none">
              {submodule.code}
            </span>
            <span className="text-ink-muted text-xs font-bold tracking-wider uppercase">
              {submodule.categoryLabel}
            </span>
          </div>

          {/* Ícono de soporte */}
          <div className="bg-surface-sunken border-line flex h-14 w-14 items-center justify-center rounded-2xl border">
            <Sparkles className="text-primary-ink h-7 w-7" />
          </div>

          {/* Título en Manrope Bold */}
          <h2 className="text-ink font-sans text-2xl font-extrabold tracking-tight">
            {submodule.name}
          </h2>

          <p className="text-ink-muted text-sm leading-relaxed">
            {submodule.description}
          </p>

          {/* Mensaje oficial requerido */}
          <div className="border-line bg-surface-sunken/60 my-2 rounded-xl border px-4 py-3 text-xs">
            <p className="text-ink font-medium">
              Esta sección estará disponible próximamente en las siguientes
              fases de desarrollo.
            </p>
          </div>

          <Link
            href="/dashboard/configuraciones/usuarios-perfiles"
            className="text-primary hover:text-primary-hover inline-flex items-center gap-1.5 text-xs font-bold transition-colors hover:underline"
          >
            <span>Ir al módulo activo: Usuarios y perfiles</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
