"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart2,
  Box,
  Calendar,
  Check,
  ChevronDown,
  ChevronsUpDown,
  FilePlus2,
  GraduationCap,
  LayoutGrid,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import {
  CANONICAL_MODULES,
  CANONICAL_PROCESSES,
  isTenantAdminRole,
  normalizeModuleCodesToCanonical,
  type CanonicalModuleCode,
  type ProcessKey,
} from "@vittkly/shared";
import { CompanyAvatar } from "@/components/brand/CompanyAvatar";
import { VittklyLogo } from "@/components/brand/VittklyLogo";
import { logoutAction } from "@/features/auth/actions/auth.actions";
import { selectOrganizationAction } from "@/features/tenants/actions/tenants.actions";
import type { UserOrganization } from "@/features/tenants/types/tenants.types";
import type { EnrichedModule } from "../services/modules.service";
import { DashboardModuleIcon } from "./module-icons";

const SIDEBAR_STORAGE_KEY = "vittkly_sidebar_collapsed";

export interface DashboardSidebarProps {
  basePath?: string;
  homePath?: string;
  organizations?: UserOrganization[];
  activeOrganizationId?: string;
  allowedModules?: CanonicalModuleCode[];
  modules?: EnrichedModule[];
  canAccessConfig?: boolean;
  portalLabel?: string;
  subtitleLabel?: string;
  user?: { nombre: string; correo: string };
  activeProfile?: {
    nombre: string;
    codigo: string;
    esPropietario?: boolean;
  };
  initialCollapsed?: boolean;
  pendingInvitationsCount?: number;
  logoUrl?: string | null;
  menuIconUrl?: string | null;
  brandColor?: string | null;
  menuAcordeon?: boolean;
}

export function DashboardSidebar(props: DashboardSidebarProps) {
  const {
    homePath = "/dashboard",
    organizations = [],
    activeOrganizationId,
    allowedModules,
    modules,
    canAccessConfig: explicitCanAccessConfig,
    portalLabel,
    subtitleLabel,
    activeProfile,
    initialCollapsed = false,
    pendingInvitationsCount = 0,
    logoUrl = null,
    menuIconUrl = null,
    brandColor = null,
    menuAcordeon = false,
  } = props;
  const pathname = usePathname() ?? "";

  const [openGroups, setOpenGroups] = useState<
    Record<Exclude<ProcessKey, "root">, boolean>
  >({
    ventas: false,
    operacion: false,
    finanzas: false,
    equipo: false,
    crecimiento: false,
  });

  const [isCollapsed, setIsCollapsed] = useState<boolean>(initialCollapsed);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [showOrgMenu, setShowOrgMenu] = useState<boolean>(false);
  const [showCrearMenu, setShowCrearMenu] = useState<boolean>(false);
  const [showGrupoModal, setShowGrupoModal] = useState<boolean>(false);

  const isExpanded = !isCollapsed || isHovered || showGrupoModal;

  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isCollapsed));
      document.cookie = `${SIDEBAR_STORAGE_KEY}=${String(isCollapsed)}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // Ignorar errores en modo privado restringido
    }
  }, [isCollapsed]);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
    setIsHovered(false);
    setShowOrgMenu(false);
    setShowCrearMenu(false);
  };

  const toggleGroup = (key: Exclude<ProcessKey, "root">) => {
    setOpenGroups((prev) => {
      const nextOpen = !prev[key];
      if (menuAcordeon && nextOpen) {
        return {
          ventas: false,
          operacion: false,
          finanzas: false,
          equipo: false,
          crecimiento: false,
          [key]: true,
        };
      }
      return { ...prev, [key]: nextOpen };
    });
  };

  const expandAll = () => {
    setOpenGroups({
      ventas: true,
      operacion: true,
      finanzas: true,
      equipo: true,
      crecimiento: true,
    });
  };

  const collapseAll = () => {
    setOpenGroups({
      ventas: false,
      operacion: false,
      finanzas: false,
      equipo: false,
      crecimiento: false,
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
    "Personalizado";

  // Calcular conjunto exacto de módulos permitidos
  const allowedSet = useMemo(() => {
    if (allowedModules) {
      return new Set<CanonicalModuleCode>(allowedModules);
    }
    if (modules) {
      return new Set<CanonicalModuleCode>(
        normalizeModuleCodesToCanonical(modules.map((m) => m.codigo)),
      );
    }
    return new Set<CanonicalModuleCode>();
  }, [allowedModules, modules]);

  const hasModule = (code: CanonicalModuleCode) => allowedSet.has(code);

  const canAccessConfig =
    explicitCanAccessConfig ??
    isTenantAdminRole(
      activeProfile?.esPropietario || activeOrg?.isOwner,
      activeProfile?.codigo,
    );

  // Construir procesos visibles: únicamente los que tienen >= 1 módulo hijo habilitado
  const visibleProcessSections = useMemo(() => {
    return CANONICAL_PROCESSES.map((proc) => ({
      ...proc,
      children: CANONICAL_MODULES.filter(
        (m) => m.process === proc.key && allowedSet.has(m.code),
      ),
    })).filter((proc) => proc.children.length > 0);
  }, [allowedSet]);

  const hasDashboard = hasModule("dashboard");
  const hasCalendario = hasModule("calendario");
  const hasReportes = hasModule("reportes");

  const hasAnyCrear =
    hasModule("cotizaciones") ||
    hasModule("clientes") ||
    hasModule("inventario") ||
    hasModule("biblioteca_academia");

  const isCurrent = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/dashboard/";
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const isProcessActive = (processKey: Exclude<ProcessKey, "root">) => {
    const children = CANONICAL_MODULES.filter((m) => m.process === processKey);
    return children.some((child) => isCurrent(child.href));
  };

  const dashboardMeta = CANONICAL_MODULES.find((m) => m.code === "dashboard")!;
  const calendarioMeta = CANONICAL_MODULES.find(
    (m) => m.code === "calendario",
  )!;
  const reportesMeta = CANONICAL_MODULES.find((m) => m.code === "reportes")!;

  return (
    <>
      {/* Espaciador en flujo para reservar el ancho fijo sin modificar <main> en hover */}
      <div
        aria-hidden="true"
        className={`hidden shrink-0 transition-all duration-200 lg:block ${
          isCollapsed ? "w-[64px]" : "w-[260px]"
        }`}
      />

      <aside
        aria-label="Menú principal de la empresa"
        onMouseEnter={() => {
          if (isCollapsed) setIsHovered(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          setShowCrearMenu(false);
          if (isCollapsed) setShowOrgMenu(false);
        }}
        className={`side bg-surface border-line fixed inset-y-0 left-0 z-40 hidden h-screen flex-col border-r transition-all duration-200 lg:flex ${
          isExpanded ? "w-[260px] p-3" : "w-[64px] px-2 py-3"
        } ${isCollapsed && isExpanded ? "bg-surface-raised shadow-2xl" : ""}`}
      >
        {/* 1. Header fijo (shrink-0) */}
        <div className="flex shrink-0 flex-col gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowOrgMenu((prev) => !prev)}
              aria-expanded={showOrgMenu}
              title="Cambiar de empresa"
              aria-label="Cambiar de empresa"
              className={`group hover:bg-surface-raised flex min-h-[46px] w-full cursor-pointer items-center rounded-xl text-left transition-colors ${
                isExpanded ? "gap-2.5 p-1.5" : "justify-center p-1"
              }`}
            >
              <CompanyAvatar
                name={companyName}
                menuIconUrl={menuIconUrl || activeOrg?.menuIconUrl}
                logoUrl={logoUrl || activeOrg?.logoUrl}
                brandColor={brandColor || activeOrg?.brandColor}
                size="md"
                shape="circle"
                className="group-hover:border-primary"
              >
                {pendingInvitationsCount > 0 && !isExpanded && (
                  <span className="bg-primary border-surface absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2" />
                )}
              </CompanyAvatar>
              <span
                className={
                  isExpanded
                    ? "flex min-w-0 flex-1 flex-col leading-tight"
                    : "hidden"
                }
              >
                <b className="text-ink truncate text-xs font-bold">
                  {companyName}
                </b>
                <small className="text-ink-muted truncate text-[11px] font-semibold">
                  Perfil: {roleName}
                </small>
              </span>
              <ChevronsUpDown
                className={
                  isExpanded
                    ? "text-ink-muted group-hover:text-ink h-4 w-4 shrink-0 transition-colors"
                    : "hidden"
                }
              />
            </button>

            {showOrgMenu && isExpanded && (
              <div className="bg-surface-raised border-line absolute top-full right-0 left-0 z-50 mt-1.5 rounded-xl border p-1.5 shadow-xl">
                {organizations.length > 0 && (
                  <div className="max-h-48 space-y-0.5 overflow-y-auto">
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
                            onClick={() => setShowOrgMenu(false)}
                            className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
                              isCurrentOrg
                                ? "bg-primary-soft/60 text-ink font-semibold"
                                : "text-ink hover:bg-surface-sunken"
                            }`}
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              <CompanyAvatar
                                name={org.name}
                                menuIconUrl={org.menuIconUrl}
                                logoUrl={org.logoUrl}
                                brandColor={org.brandColor}
                                size="xs"
                                shape="circle"
                              />
                              <span className="truncate">{org.name}</span>
                            </span>
                            {isCurrentOrg && (
                              <Check className="text-primary h-3.5 w-3.5 shrink-0" />
                            )}
                          </button>
                        </form>
                      );
                    })}
                  </div>
                )}
                <div className="border-line my-1 border-t" />
                <Link
                  href="/accesos"
                  onClick={() => setShowOrgMenu(false)}
                  className="text-ink hover:bg-surface-sunken flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors"
                >
                  <span>Accesos a empresa</span>
                  {pendingInvitationsCount > 0 && (
                    <span className="bg-primary rounded-full px-1.5 py-0.5 font-mono text-[10px] font-bold text-white tabular-nums">
                      {pendingInvitationsCount}
                    </span>
                  )}
                </Link>
              </div>
            )}
          </div>

          {/* Botón "+ Crear" con Menú Dropdown Rápido (filtrado por módulos reales) */}
          {hasAnyCrear && (
            <div className="relative flex justify-center">
              <button
                type="button"
                onClick={() => setShowCrearMenu((prev) => !prev)}
                aria-expanded={showCrearMenu}
                aria-label="Crear"
                title="Crear"
                className={`bg-primary text-on-primary hover:bg-primary-hover flex h-9 cursor-pointer items-center justify-center rounded-xl text-xs font-bold shadow-xs transition-colors ${
                  isExpanded ? "w-full gap-1.5 px-3" : "w-9"
                }`}
              >
                <Plus className="h-4 w-4 shrink-0 stroke-[2.5]" />
                <span className={isExpanded ? "inline" : "hidden"}>Crear</span>
              </button>

              {showCrearMenu && isExpanded && (
                <div className="border-line bg-surface-raised shadow-2 animate-sc-in absolute top-11 right-0 left-0 z-40 flex flex-col gap-0.5 rounded-xl border p-1.5">
                  {hasModule("cotizaciones") && (
                    <Link
                      href="/dashboard/cotizaciones"
                      onClick={() => setShowCrearMenu(false)}
                      className="text-ink hover:bg-surface-sunken flex h-8 items-center gap-2 rounded-lg px-2.5 text-xs font-semibold transition-colors"
                    >
                      <FilePlus2
                        className="text-primary-ink h-3.5 w-3.5"
                        strokeWidth={1.75}
                      />
                      <span>Cotización</span>
                    </Link>
                  )}
                  {hasModule("clientes") && (
                    <Link
                      href="/dashboard/clientes"
                      onClick={() => setShowCrearMenu(false)}
                      className="text-ink hover:bg-surface-sunken flex h-8 items-center gap-2 rounded-lg px-2.5 text-xs font-semibold transition-colors"
                    >
                      <Users
                        className="text-primary-ink h-3.5 w-3.5"
                        strokeWidth={1.75}
                      />
                      <span>Cliente</span>
                    </Link>
                  )}
                  {hasModule("inventario") && (
                    <Link
                      href="/dashboard/inventario"
                      onClick={() => setShowCrearMenu(false)}
                      className="text-ink hover:bg-surface-sunken flex h-8 items-center gap-2 rounded-lg px-2.5 text-xs font-semibold transition-colors"
                    >
                      <Box
                        className="text-primary-ink h-3.5 w-3.5"
                        strokeWidth={1.75}
                      />
                      <span>Movimiento de inventario</span>
                    </Link>
                  )}
                  {hasModule("biblioteca_academia") && (
                    <Link
                      href="/dashboard/academia"
                      onClick={() => setShowCrearMenu(false)}
                      className="text-ink hover:bg-surface-sunken flex h-8 items-center gap-2 rounded-lg px-2.5 text-xs font-semibold transition-colors"
                    >
                      <GraduationCap
                        className="text-primary-ink h-3.5 w-3.5"
                        strokeWidth={1.75}
                      />
                      <span>Artículo de la Biblioteca</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Acciones Expandir todo / Plegar todo (solo si hay al menos 1 proceso visible) */}
          {visibleProcessSections.length > 0 && (
            <div
              className={
                isExpanded ? "flex justify-end gap-1 px-1 pt-0.5" : "hidden"
              }
            >
              <button
                type="button"
                onClick={expandAll}
                className="text-primary-ink cursor-pointer rounded-sm p-1 text-[10px] font-bold hover:underline"
              >
                Expandir todo
              </button>
              <span className="text-line-strong text-[10px] select-none">
                •
              </span>
              <button
                type="button"
                onClick={collapseAll}
                className="text-primary-ink cursor-pointer rounded-sm p-1 text-[10px] font-bold hover:underline"
              >
                Plegar todo
              </button>
            </div>
          )}
        </div>

        {/* 2. Navegación (Procesos contenedores + 19 módulos canónicos filtrados) */}
        <nav
          className="my-2 flex flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto px-0.5 py-1"
          role="navigation"
          aria-label="Secciones"
        >
          {/* Raíz superior: Inicio */}
          {hasDashboard && (
            <Link
              href={homePath}
              title={dashboardMeta.label}
              className={`flex h-9 items-center rounded-lg text-xs font-semibold transition-colors ${
                isExpanded ? "gap-2.5 px-2.5" : "justify-center px-0"
              } ${
                isCurrent(homePath)
                  ? "bg-primary-soft text-primary-ink font-bold"
                  : "text-ink hover:bg-surface-raised"
              }`}
            >
              <LayoutGrid className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              <span className={isExpanded ? "truncate" : "hidden"}>
                {dashboardMeta.label}
              </span>
            </Link>
          )}

          {/* Raíz superior: Calendario */}
          {hasCalendario && (
            <Link
              href={calendarioMeta.href}
              title={calendarioMeta.label}
              className={`flex h-9 items-center rounded-lg text-xs font-semibold transition-colors ${
                isExpanded ? "gap-2.5 px-2.5" : "justify-center px-0"
              } ${
                isCurrent(calendarioMeta.href)
                  ? "bg-primary-soft text-primary-ink font-bold"
                  : "text-ink hover:bg-surface-raised"
              }`}
            >
              <Calendar className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              <span className={isExpanded ? "truncate" : "hidden"}>
                {calendarioMeta.label}
              </span>
            </Link>
          )}

          {/* Contenedores de Proceso (ocultos automáticamente si visibleChildren === 0) */}
          {visibleProcessSections.map((section) => {
            const isOpen = openGroups[section.key];
            const active = isProcessActive(section.key);

            return (
              <div key={section.key} className="flex flex-col">
                <button
                  type="button"
                  onClick={() => toggleGroup(section.key)}
                  aria-expanded={isOpen}
                  title={section.label}
                  className={`flex h-9 cursor-pointer items-center rounded-lg text-left text-xs font-bold transition-colors ${
                    isExpanded ? "gap-2.5 px-2.5" : "justify-center px-0"
                  } ${
                    active
                      ? "bg-primary-soft text-primary-ink"
                      : isOpen
                        ? "text-ink hover:bg-surface-raised"
                        : "text-ink-muted hover:text-ink hover:bg-surface-raised"
                  }`}
                >
                  <DashboardModuleIcon
                    iconKey={section.iconKey}
                    className="text-primary-ink h-4 w-4 shrink-0"
                    strokeWidth={1.75}
                  />
                  <span className={isExpanded ? "flex-1 truncate" : "hidden"}>
                    {section.label}
                  </span>
                  <ChevronDown
                    className={
                      isExpanded
                        ? `h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                            isOpen ? "" : "-rotate-90"
                          }`
                        : "hidden"
                    }
                  />
                </button>

                {isExpanded && isOpen && (
                  <div className="border-line animate-sc-in my-0.5 ml-4 flex flex-col gap-0.5 border-l pl-2.5">
                    {section.children.map((mod) => {
                      const modActive = isCurrent(mod.href);
                      return (
                        <Link
                          key={mod.code}
                          href={mod.href}
                          className={`flex h-7 items-center justify-between gap-2 rounded-md px-2 text-xs transition-colors ${
                            modActive
                              ? "bg-primary-soft text-primary-ink font-bold"
                              : "text-ink-muted hover:text-ink hover:bg-surface-raised"
                          }`}
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <DashboardModuleIcon
                              iconKey={mod.iconKey}
                              className="h-3.5 w-3.5 shrink-0"
                              strokeWidth={1.75}
                            />
                            <span className="truncate">{mod.label}</span>
                          </span>
                          {mod.isPronto && (
                            <span className="border-line bg-surface-raised text-ink-muted shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-bold">
                              Pronto
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Separador */}
          {(hasReportes || canAccessConfig) && (
            <div className="bg-line my-1.5 h-px shrink-0" />
          )}

          {/* Raíz inferior: Reportes */}
          {hasReportes && (
            <Link
              href={reportesMeta.href}
              title={reportesMeta.label}
              className={`flex h-9 items-center rounded-lg text-xs font-semibold transition-colors ${
                isExpanded ? "gap-2.5 px-2.5" : "justify-center px-0"
              } ${
                isCurrent(reportesMeta.href)
                  ? "bg-primary-soft text-primary-ink font-bold"
                  : "text-ink hover:bg-surface-raised"
              }`}
            >
              <BarChart2
                className="text-ink-muted h-4 w-4 shrink-0"
                strokeWidth={1.75}
              />
              <span className={isExpanded ? "truncate" : "hidden"}>
                {reportesMeta.label}
              </span>
            </Link>
          )}

          {/* Configuraciones (exclusivo para Dueño o Administrador) */}
          {canAccessConfig && (
            <Link
              href="/dashboard/configuraciones"
              title="Configuraciones"
              className={`flex h-9 items-center rounded-lg text-xs font-semibold transition-colors ${
                isExpanded ? "gap-2.5 px-2.5" : "justify-center px-0"
              } ${
                isCurrent("/dashboard/configuraciones")
                  ? "bg-primary-soft text-primary-ink font-bold"
                  : "text-ink hover:bg-surface-raised"
              }`}
            >
              <Settings
                className="text-ink-muted h-4 w-4 shrink-0"
                strokeWidth={1.75}
              />
              <span className={isExpanded ? "truncate" : "hidden"}>
                Configuraciones
              </span>
            </Link>
          )}
        </nav>

        {/* 3. Footer fijo en la parte inferior (shrink-0 mt-auto) */}
        <div className="side-foot border-line mt-auto flex shrink-0 flex-col gap-2 border-t pt-2.5">
          <div
            className={
              isExpanded
                ? "flex items-center justify-between px-1 text-xs"
                : "hidden"
            }
          >
            <span className="text-ink-muted truncate text-[11px] font-semibold">
              Perfil: <b className="text-ink font-bold">{roleName}</b>
            </span>
            <form action={logoutAction} className="shrink-0">
              <button
                type="submit"
                className="text-primary-ink cursor-pointer text-[11px] font-bold hover:underline"
                title="Cerrar sesión en Vittkly"
              >
                Cerrar sesión
              </button>
            </form>
          </div>

          <button
            type="button"
            onClick={() => setShowGrupoModal(true)}
            className={
              isExpanded
                ? "border-line bg-surface-raised hover:bg-surface-sunken text-ink flex w-full cursor-pointer items-center justify-center rounded-xl border px-2 py-1.5 text-xs font-semibold shadow-2xs transition-colors"
                : "hidden"
            }
          >
            <span>Resumen del grupo</span>
          </button>

          <div className="text-ink-muted flex items-center justify-center gap-1.5 py-1 text-[11px] font-semibold">
            <span className={isExpanded ? "inline" : "hidden"}>
              Con tecnología
            </span>
            {isExpanded ? (
              <VittklyLogo variant="wordmark" height={16} />
            ) : (
              <VittklyLogo variant="monogram" height={18} />
            )}
          </div>

          <button
            type="button"
            onClick={handleToggleCollapse}
            title={isCollapsed ? "Fijar menú" : "Contraer menú"}
            aria-label={isCollapsed ? "Fijar menú" : "Contraer menú"}
            className="hover:bg-surface-raised text-ink-muted hover:text-ink flex h-8 w-full cursor-pointer items-center justify-center gap-2 rounded-lg text-xs font-medium transition-colors"
          >
            {isExpanded ? (
              <span>{isCollapsed ? "» Fijar menú" : "« Contraer menú"}</span>
            ) : (
              <span className="font-bold">»</span>
            )}
          </button>
        </div>
      </aside>

      {/* Modal Resumen del Grupo */}
      {showGrupoModal && (
        <div className="animate-sc-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="bg-surface-raised border-line shadow-2 relative flex w-full max-w-md flex-col gap-4 rounded-2xl border p-6">
            <div className="border-line flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-ink text-base font-bold">
                  Resumen del grupo
                </h3>
                <p className="text-ink-muted text-xs">
                  Empresas vinculadas a tu cuenta de usuario
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowGrupoModal(false)}
                className="text-ink-muted hover:text-ink hover:bg-surface-sunken cursor-pointer rounded-lg p-1 text-sm font-bold"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            <div className="flex max-h-60 flex-col gap-2 overflow-y-auto">
              {organizations.map((org) => {
                const isAct = org.id === activeOrganizationId;
                return (
                  <Link
                    key={org.id}
                    href="/accesos"
                    onClick={() => setShowGrupoModal(false)}
                    className={`flex items-center justify-between rounded-xl border p-3 transition-colors ${
                      isAct
                        ? "border-primary bg-primary-soft/50 text-ink"
                        : "border-line bg-surface hover:bg-surface-sunken text-ink"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CompanyAvatar
                        name={org.name}
                        menuIconUrl={org.menuIconUrl}
                        logoUrl={org.logoUrl}
                        brandColor={org.brandColor}
                        size="sm"
                        shape="circle"
                      />
                      <div className="flex flex-col">
                        <b className="text-xs font-bold">{org.name}</b>
                        <small className="text-ink-muted text-[11px]">
                          Rol: {org.roleName || "Colaborador"}
                        </small>
                      </div>
                    </div>
                    {isAct ? (
                      <span className="bg-primary text-on-primary rounded-full px-2 py-0.5 text-[10px] font-bold">
                        Activa
                      </span>
                    ) : (
                      <span className="text-primary-ink text-xs font-semibold hover:underline">
                        Conmutar ›
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowGrupoModal(false)}
              className="bg-primary text-on-primary hover:bg-primary-hover min-h-[36px] cursor-pointer rounded-xl text-xs font-bold transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default DashboardSidebar;
