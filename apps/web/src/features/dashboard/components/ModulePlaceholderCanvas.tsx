import React from "react";
import { Clock } from "lucide-react";
import {
  DashboardBreadcrumbs,
  type BreadcrumbItem,
} from "./DashboardBreadcrumbs";

export interface ModulePlaceholderCanvasProps {
  moduleName: string;
  moduleCode: string;
  groupName?: string;
  permissionSummary?: string;
  modelType?: string;
  stageNumber?: number;
  backHref?: string;
  breadcrumbs?: BreadcrumbItem[];
  /** El título y código ya los muestra DashboardHeader; evita duplicarlos. */
  hideTitle?: boolean;
}

export function ModulePlaceholderCanvas({
  moduleName,
  moduleCode,
  groupName,
  backHref = "/dashboard",
  breadcrumbs,
  hideTitle = false,
}: ModulePlaceholderCanvasProps) {
  const dynamicBreadcrumbs: BreadcrumbItem[] = breadcrumbs || [
    { label: "Inicio", href: backHref },
    ...(groupName ? [{ label: groupName }] : []),
    { label: moduleName, isCurrent: true },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 transition-colors lg:p-8">
      {/* Cabecera con Breadcrumb dinámico */}
      <div className="flex flex-col gap-2.5">
        <DashboardBreadcrumbs items={dynamicBreadcrumbs} />
        {!hideTitle && (
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-ink font-sans text-2xl font-bold tracking-tight">
              {moduleName}
            </h1>
            <span className="border-line bg-surface-sunken text-ink-muted rounded-md border px-2.5 py-0.5 font-mono text-xs tabular-nums select-none">
              {moduleCode}
            </span>
          </div>
        )}
      </div>

      {/* Un único contenedor central en bg-surface-raised con borde de 1px (border-line) */}
      <div className="border-line bg-surface-raised flex min-h-[380px] flex-1 flex-col items-center justify-center rounded-2xl border p-8 text-center shadow-xs sm:p-16">
        <div className="bg-surface-sunken border-line text-primary mb-4 flex h-12 w-12 items-center justify-center rounded-xl border">
          <Clock className="h-5 w-5" />
        </div>
        <p className="text-ink text-sm font-semibold">
          Módulo en preparación &bull; Próximamente disponible
        </p>
      </div>
    </div>
  );
}

export default ModulePlaceholderCanvas;
