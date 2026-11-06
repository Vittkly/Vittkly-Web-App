"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  ChevronDown,
  Plus,
  ChevronsUpDown,
  FileText,
  UserCheck,
  PackageCheck,
  BookOpen,
  ArrowRightLeft,
  Settings,
  BarChart3,
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { VittklyLogo } from "@/components/brand/VittklyLogo";
import type { UserOrganization } from "@/features/tenants/types/tenants.types";
import type { EnrichedModule } from "../services/modules.service";

export interface ModulesSidebarProps {
  basePath?: string;
  homePath?: string;
  organizations?: UserOrganization[];
  activeOrganizationId?: string;
  modules?: EnrichedModule[];
  portalLabel?: string;
  subtitleLabel?: string;
  user?: { nombre: string; correo: string };
  activeProfile?: { nombre: string; codigo: string };
}

export function ModulesSidebar(props: ModulesSidebarProps) {
  const {
    homePath = "/dashboard",
    organizations = [],
    activeOrganizationId,
    portalLabel,
    subtitleLabel,
    activeProfile,
  } = props;
  const pathname = usePathname();

  // Estados de grupos colapsables (inician abiertos como en la maqueta original)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    ve: true,
    op: true,
    fi: false,
    eq: false,
    cr: false,
  });

  const [showCrearMenu, setShowCrearMenu] = useState(false);

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAll = () => {
    setOpenGroups({
      ve: true,
      op: true,
      fi: true,
      eq: true,
      cr: true,
    });
  };

  const collapseAll = () => {
    setOpenGroups({
      ve: false,
      op: false,
      fi: false,
      eq: false,
      cr: false,
    });
  };

  const activeOrg =
    organizations.find((o) => o.id === activeOrganizationId) ||
    organizations[0];
  const companyName = portalLabel || activeOrg?.name || "Vitta Kleanly";
  const roleName =
    subtitleLabel ||
    activeProfile?.nombre ||
    activeOrg?.roleName ||
    "Administrador";

  const isCurrent = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/dashboard/";
    }
    return pathname.startsWith(path);
  };

  return (
    <aside
      aria-label="Menú principal de la empresa"
      className="side bg-surface-sunken/60 border-line relative z-20 hidden min-h-dvh shrink-0 flex-col gap-2.5 border-r p-3 transition-colors sm:p-3.5 lg:flex lg:w-64"
    >
      {/* 1. Selector de Empresa / Identidad (side-brand) */}
      <div className="flex flex-col gap-2 p-1">
        <Link
          href="/select-org"
          className="group hover:bg-surface-raised flex min-h-[46px] w-full cursor-pointer items-center gap-2.5 rounded-xl p-1.5 transition-colors"
          title="Cambiar de empresa"
          aria-label="Cambiar de empresa"
        >
          <span className="bg-surface-raised border-line text-primary-ink group-hover:border-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold shadow-xs transition-colors">
            {companyName.slice(0, 2).toUpperCase()}
          </span>
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <b className="text-ink truncate text-xs font-bold">{companyName}</b>
            <small className="text-ink-muted truncate text-[11px] font-semibold">
              Perfil: {roleName}
            </small>
          </span>
          <ChevronsUpDown className="text-ink-muted group-hover:text-ink h-4 w-4 shrink-0 transition-colors" />
        </Link>

        {/* Botón "+ Crear" con Menú Dropdown Rápido */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCrearMenu((prev) => !prev)}
            aria-expanded={showCrearMenu}
            className="bg-primary text-on-primary hover:bg-primary-hover flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Crear</span>
          </button>

          {showCrearMenu && (
            <div className="border-line bg-surface-raised shadow-2 animate-sc-in absolute top-11 right-0 left-0 z-40 flex flex-col gap-0.5 rounded-xl border p-1.5">
              <Link
                href="/dashboard/cotizaciones"
                onClick={() => setShowCrearMenu(false)}
                className="text-ink hover:bg-surface-sunken flex h-8 items-center gap-2 rounded-lg px-2.5 text-xs font-semibold transition-colors"
              >
                <FileText className="text-primary-ink h-3.5 w-3.5" />
                <span>Cotización</span>
              </Link>
              <Link
                href="/dashboard/clientes"
                onClick={() => setShowCrearMenu(false)}
                className="text-ink hover:bg-surface-sunken flex h-8 items-center gap-2 rounded-lg px-2.5 text-xs font-semibold transition-colors"
              >
                <UserCheck className="text-primary-ink h-3.5 w-3.5" />
                <span>Cliente</span>
              </Link>
              <Link
                href="/dashboard/inventario"
                onClick={() => setShowCrearMenu(false)}
                className="text-ink hover:bg-surface-sunken flex h-8 items-center gap-2 rounded-lg px-2.5 text-xs font-semibold transition-colors"
              >
                <PackageCheck className="text-primary-ink h-3.5 w-3.5" />
                <span>Movimiento de inventario</span>
              </Link>
              <Link
                href="/dashboard/academia"
                onClick={() => setShowCrearMenu(false)}
                className="text-ink hover:bg-surface-sunken flex h-8 items-center gap-2 rounded-lg px-2.5 text-xs font-semibold transition-colors"
              >
                <BookOpen className="text-primary-ink h-3.5 w-3.5" />
                <span>Artículo de la Biblioteca</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 2. Herramientas de Navegación: Expandir / Plegar todo */}
      <div className="-my-1 flex justify-end gap-1 px-1">
        <button
          type="button"
          onClick={expandAll}
          className="text-primary-ink cursor-pointer rounded-sm p-1 text-[10px] font-bold hover:underline"
        >
          Expandir todo
        </button>
        <span className="text-line-strong text-[10px] select-none">•</span>
        <button
          type="button"
          onClick={collapseAll}
          className="text-primary-ink cursor-pointer rounded-sm p-1 text-[10px] font-bold hover:underline"
        >
          Plegar todo
        </button>
      </div>

      {/* 3. Menú de Secciones y Módulos */}
      <nav
        className="flex flex-1 flex-col gap-1 overflow-y-auto px-1 py-1"
        role="navigation"
        aria-label="Secciones"
      >
        {/* Top: Inicio */}
        <Link
          href={homePath}
          className={`flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-xs font-semibold transition-colors ${
            isCurrent(homePath)
              ? "bg-primary-soft text-primary-ink font-bold"
              : "text-ink hover:bg-surface-raised"
          }`}
        >
          <LayoutDashboard className="h-4 w-4 shrink-0" />
          <span className="truncate">Inicio</span>
        </Link>

        {/* Top: Calendario */}
        <Link
          href="/dashboard/calendario"
          className={`flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-xs font-semibold transition-colors ${
            isCurrent("/dashboard/calendario")
              ? "bg-primary-soft text-primary-ink font-bold"
              : "text-ink hover:bg-surface-raised"
          }`}
        >
          <CalendarDays className="h-4 w-4 shrink-0" />
          <span className="truncate">Calendario</span>
        </Link>

        {/* Grupo: Ventas */}
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => toggleGroup("ve")}
            className={`flex h-8 cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-left text-xs font-bold transition-colors ${
              openGroups.ve ? "text-ink" : "text-ink-muted hover:text-ink"
            }`}
          >
            <TrendingUp className="text-primary-ink h-4 w-4 shrink-0" />
            <span className="flex-1 truncate">Ventas</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                openGroups.ve ? "" : "-rotate-90"
              }`}
            />
          </button>
          {openGroups.ve && (
            <div className="border-line animate-sc-in my-0.5 ml-4 flex flex-col gap-0.5 border-l pl-2.5">
              <Link
                href="/dashboard/clientes"
                className={`flex h-7 items-center rounded-md px-2 text-xs transition-colors ${
                  isCurrent("/dashboard/clientes")
                    ? "bg-primary-soft text-primary-ink font-bold"
                    : "text-ink-muted hover:text-ink hover:bg-surface-raised"
                }`}
              >
                Clientes
              </Link>
              <Link
                href="/dashboard/cotizaciones"
                className={`flex h-7 items-center rounded-md px-2 text-xs transition-colors ${
                  isCurrent("/dashboard/cotizaciones")
                    ? "bg-primary-soft text-primary-ink font-bold"
                    : "text-ink-muted hover:text-ink hover:bg-surface-raised"
                }`}
              >
                Cotizaciones
              </Link>
              <div className="text-ink-muted/70 flex h-7 items-center justify-between px-2 text-xs">
                <span>Contratos</span>
                <span className="py-0.2 border-line bg-surface-raised text-ink-muted rounded-full border px-1.5 text-[9px] font-bold">
                  Pronto
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Grupo: Operación */}
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => toggleGroup("op")}
            className={`flex h-8 cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-left text-xs font-bold transition-colors ${
              openGroups.op ? "text-ink" : "text-ink-muted hover:text-ink"
            }`}
          >
            <Briefcase className="text-primary-ink h-4 w-4 shrink-0" />
            <span className="flex-1 truncate">Operación</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                openGroups.op ? "" : "-rotate-90"
              }`}
            />
          </button>
          {openGroups.op && (
            <div className="border-line animate-sc-in my-0.5 ml-4 flex flex-col gap-0.5 border-l pl-2.5">
              <Link
                href="/dashboard/inventario"
                className={`flex h-7 items-center rounded-md px-2 text-xs transition-colors ${
                  isCurrent("/dashboard/inventario")
                    ? "bg-primary-soft text-primary-ink font-bold"
                    : "text-ink-muted hover:text-ink hover:bg-surface-raised"
                }`}
              >
                Inventario
              </Link>
              <Link
                href="/dashboard/trabajos"
                className={`flex h-7 items-center rounded-md px-2 text-xs transition-colors ${
                  isCurrent("/dashboard/trabajos")
                    ? "bg-primary-soft text-primary-ink font-bold"
                    : "text-ink-muted hover:text-ink hover:bg-surface-raised"
                }`}
              >
                Trabajos
              </Link>
              <div className="text-ink-muted/70 flex h-7 items-center justify-between px-2 text-xs">
                <span>Ocurrencias</span>
                <span className="py-0.2 border-line bg-surface-raised text-ink-muted rounded-full border px-1.5 text-[9px] font-bold">
                  Pronto
                </span>
              </div>
              <Link
                href="/dashboard/tiempo"
                className={`flex h-7 items-center rounded-md px-2 text-xs transition-colors ${
                  isCurrent("/dashboard/tiempo")
                    ? "bg-primary-soft text-primary-ink font-bold"
                    : "text-ink-muted hover:text-ink hover:bg-surface-raised"
                }`}
              >
                Tiempo
              </Link>
              <div className="text-ink-muted/70 flex h-7 items-center justify-between px-2 text-xs">
                <span>Calidad</span>
                <span className="py-0.2 border-line bg-surface-raised text-ink-muted rounded-full border px-1.5 text-[9px] font-bold">
                  Pronto
                </span>
              </div>
              <Link
                href="/dashboard/postventa"
                className={`flex h-7 items-center rounded-md px-2 text-xs transition-colors ${
                  isCurrent("/dashboard/postventa")
                    ? "bg-primary-soft text-primary-ink font-bold"
                    : "text-ink-muted hover:text-ink hover:bg-surface-raised"
                }`}
              >
                Post venta
              </Link>
            </div>
          )}
        </div>

        {/* Grupo: Finanzas */}
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => toggleGroup("fi")}
            className={`flex h-8 cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-left text-xs font-bold transition-colors ${
              openGroups.fi ? "text-ink" : "text-ink-muted hover:text-ink"
            }`}
          >
            <DollarSign className="text-primary-ink h-4 w-4 shrink-0" />
            <span className="flex-1 truncate">Finanzas</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                openGroups.fi ? "" : "-rotate-90"
              }`}
            />
          </button>
          {openGroups.fi && (
            <div className="border-line animate-sc-in my-0.5 ml-4 flex flex-col gap-0.5 border-l pl-2.5">
              <Link
                href="/dashboard/cobranzas"
                className={`flex h-7 items-center rounded-md px-2 text-xs transition-colors ${
                  isCurrent("/dashboard/cobranzas")
                    ? "bg-primary-soft text-primary-ink font-bold"
                    : "text-ink-muted hover:text-ink hover:bg-surface-raised"
                }`}
              >
                Cobranzas
              </Link>
              <Link
                href="/dashboard/comprobantes"
                className={`flex h-7 items-center rounded-md px-2 text-xs transition-colors ${
                  isCurrent("/dashboard/comprobantes")
                    ? "bg-primary-soft text-primary-ink font-bold"
                    : "text-ink-muted hover:text-ink hover:bg-surface-raised"
                }`}
              >
                Comprobantes
              </Link>
              <Link
                href="/dashboard/liquidaciones"
                className={`flex h-7 items-center rounded-md px-2 text-xs transition-colors ${
                  isCurrent("/dashboard/liquidaciones")
                    ? "bg-primary-soft text-primary-ink font-bold"
                    : "text-ink-muted hover:text-ink hover:bg-surface-raised"
                }`}
              >
                Liquidaciones A365
              </Link>
              <div className="text-ink-muted/70 flex h-7 items-center justify-between px-2 text-xs">
                <span>Valorizaciones</span>
                <span className="py-0.2 border-line bg-surface-raised text-ink-muted rounded-full border px-1.5 text-[9px] font-bold">
                  Pronto
                </span>
              </div>
              <Link
                href="/dashboard/caja"
                className={`flex h-7 items-center rounded-md px-2 text-xs transition-colors ${
                  isCurrent("/dashboard/caja")
                    ? "bg-primary-soft text-primary-ink font-bold"
                    : "text-ink-muted hover:text-ink hover:bg-surface-raised"
                }`}
              >
                Caja y bancos
              </Link>
              <Link
                href="/dashboard/rentabilidad"
                className={`flex h-7 items-center rounded-md px-2 text-xs transition-colors ${
                  isCurrent("/dashboard/rentabilidad")
                    ? "bg-primary-soft text-primary-ink font-bold"
                    : "text-ink-muted hover:text-ink hover:bg-surface-raised"
                }`}
              >
                Rentabilidad
              </Link>
            </div>
          )}
        </div>

        {/* Grupo: Equipo */}
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => toggleGroup("eq")}
            className={`flex h-8 cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-left text-xs font-bold transition-colors ${
              openGroups.eq ? "text-ink" : "text-ink-muted hover:text-ink"
            }`}
          >
            <Users className="text-primary-ink h-4 w-4 shrink-0" />
            <span className="flex-1 truncate">Equipo</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                openGroups.eq ? "" : "-rotate-90"
              }`}
            />
          </button>
          {openGroups.eq && (
            <div className="border-line animate-sc-in my-0.5 ml-4 flex flex-col gap-0.5 border-l pl-2.5">
              <div className="text-ink-muted/70 flex h-7 items-center justify-between px-2 text-xs">
                <span>Personal</span>
                <span className="py-0.2 border-line bg-surface-raised text-ink-muted rounded-full border px-1.5 text-[9px] font-bold">
                  Pronto
                </span>
              </div>
              <Link
                href="/dashboard/pagos-personal"
                className={`flex h-7 items-center rounded-md px-2 text-xs transition-colors ${
                  isCurrent("/dashboard/pagos-personal")
                    ? "bg-primary-soft text-primary-ink font-bold"
                    : "text-ink-muted hover:text-ink hover:bg-surface-raised"
                }`}
              >
                Pagos al personal
              </Link>
              <Link
                href="/dashboard/academia"
                className={`flex h-7 items-center rounded-md px-2 text-xs transition-colors ${
                  isCurrent("/dashboard/academia")
                    ? "bg-primary-soft text-primary-ink font-bold"
                    : "text-ink-muted hover:text-ink hover:bg-surface-raised"
                }`}
              >
                Biblioteca y Academia
              </Link>
            </div>
          )}
        </div>

        {/* Grupo: Crecimiento */}
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => toggleGroup("cr")}
            className={`flex h-8 cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-left text-xs font-bold transition-colors ${
              openGroups.cr ? "text-ink" : "text-ink-muted hover:text-ink"
            }`}
          >
            <Sparkles className="text-primary-ink h-4 w-4 shrink-0" />
            <span className="flex-1 truncate">Crecimiento</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                openGroups.cr ? "" : "-rotate-90"
              }`}
            />
          </button>
          {openGroups.cr && (
            <div className="border-line animate-sc-in my-0.5 ml-4 flex flex-col gap-0.5 border-l pl-2.5">
              <Link
                href="/dashboard/marketing"
                className={`flex h-7 items-center rounded-md px-2 text-xs transition-colors ${
                  isCurrent("/dashboard/marketing")
                    ? "bg-primary-soft text-primary-ink font-bold"
                    : "text-ink-muted hover:text-ink hover:bg-surface-raised"
                }`}
              >
                Marketing
              </Link>
              <Link
                href="/dashboard/sitio-web"
                className={`flex h-7 items-center rounded-md px-2 text-xs transition-colors ${
                  isCurrent("/dashboard/sitio-web")
                    ? "bg-primary-soft text-primary-ink font-bold"
                    : "text-ink-muted hover:text-ink hover:bg-surface-raised"
                }`}
              >
                Sitio web y reservas
              </Link>
            </div>
          )}
        </div>

        {/* Separador */}
        <div className="bg-line my-1.5 h-px" />

        {/* Bottom items */}
        <Link
          href="/dashboard/reportes"
          className={`flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-xs font-semibold transition-colors ${
            isCurrent("/dashboard/reportes")
              ? "bg-primary-soft text-primary-ink font-bold"
              : "text-ink hover:bg-surface-raised"
          }`}
        >
          <BarChart3 className="text-ink-muted h-4 w-4 shrink-0" />
          <span className="truncate">Reportes</span>
        </Link>

        <Link
          href="/dashboard/configuraciones"
          className={`flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-xs font-semibold transition-colors ${
            isCurrent("/dashboard/configuraciones")
              ? "bg-primary-soft text-primary-ink font-bold"
              : "text-ink hover:bg-surface-raised"
          }`}
        >
          <Settings className="text-ink-muted h-4 w-4 shrink-0" />
          <span className="truncate">Configuraciones</span>
        </Link>
      </nav>

      {/* 4. Footer del Sidebar (side-foot) */}
      <div className="border-line mt-auto flex flex-col gap-2 border-t pt-2">
        <Link
          href="/select-org"
          className="bg-surface-raised border-line text-ink hover:border-primary hover:bg-primary-soft flex w-full cursor-pointer items-center justify-between rounded-xl border p-2 text-xs font-bold transition-colors"
          title="Cambiar de empresa"
        >
          <div className="flex min-w-0 flex-col text-left leading-tight">
            <span className="text-ink-muted text-[10px] font-semibold">
              Empresa activa
            </span>
            <b className="text-primary-ink truncate text-xs">{companyName}</b>
          </div>
          <ArrowRightLeft className="text-ink-muted h-3.5 w-3.5 shrink-0" />
        </Link>

        <div className="text-ink-muted flex items-center justify-center gap-1.5 py-1 text-[11px] font-semibold">
          <span>Con tecnología</span>
          <VittklyLogo variant="wordmark" height={16} />
        </div>
      </div>
    </aside>
  );
}

export default ModulesSidebar;
