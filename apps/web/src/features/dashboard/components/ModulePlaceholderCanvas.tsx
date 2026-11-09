"use client";

import React from "react";
import Link from "next/link";

export interface ModulePlaceholderCanvasProps {
  moduleName: string;
  moduleCode?: string;
  groupName?: string;
  description?: string;
  permissionSummary?: string;
  modelType?: string;
  stageNumber?: number;
  backHref?: string;
  breadcrumbs?: unknown;
}

export function ModulePlaceholderCanvas({
  moduleName,
  description,
}: ModulePlaceholderCanvasProps) {
  return (
    <div className="flex max-w-5xl flex-1 flex-col gap-6 p-4 transition-colors sm:p-6 lg:p-8">
      {/* Tarjeta idéntica a renderPronto del artefacto */}
      <div className="border-line bg-surface-raised flex max-w-3xl flex-col gap-4 rounded-2xl border p-6 shadow-xs sm:p-8">
        <div className="border-line flex flex-col gap-2 border-b pb-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-ink font-sans text-xl font-extrabold tracking-tight sm:text-2xl">
              {moduleName}
            </h2>
            <span className="bg-primary-soft text-primary-ink border-primary/20 rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase">
              Pronto
            </span>
          </div>

          <p className="text-ink-muted text-xs leading-relaxed sm:text-sm">
            {description ||
              "Servicios, parámetros y gestión operativa especializada para este módulo de la plataforma."}
          </p>
        </div>

        <p className="text-ink-muted text-xs leading-relaxed">
          Este módulo está en el plan de desarrollo. Si tu empresa lo necesita,
          cuéntanos cómo lo usarías: las ideas con más votos se construyen
          primero.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/dashboard/comunidad"
            className="bg-primary hover:bg-primary-hover text-on-primary rounded-xl px-4 py-2 text-xs font-bold shadow-xs transition-colors"
          >
            Sugerir cómo debería funcionar
          </Link>
          <Link
            href="/dashboard/comunidad"
            className="border-line bg-surface-sunken hover:bg-surface-raised text-ink rounded-xl border px-4 py-2 text-xs font-bold shadow-2xs transition-colors"
          >
            Ver ideas y votos
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ModulePlaceholderCanvas;
