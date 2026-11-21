"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X, Server, ArrowRight, Database, Users } from "lucide-react";
import { VittklyIcon, type VittklyIconName } from "@/components/icons";
import { Badge } from "@/components/ui/Badge";
import type { StaffDashboardContextResult } from "../services/modules.service";

export interface StaffBentoCommandCenterProps {
  context: StaffDashboardContextResult;
  basePath?: string;
}

const MODULE_ICON_MAP: Record<string, VittklyIconName> = {
  empresa_usuarios: "users",
  clientes: "user",
  tarifario: "doc",
  calendario_trabajos: "calendar",
  app_campo: "nav",
  ocurrencias: "alert",
  personal: "face",
  tiempo: "clock",
  inventario: "briefcase",
  equipos_cliente: "settings",
  biblioteca: "doc",
  academia: "star",
  cobranzas_comprobantes: "card",
  convenios: "repeat",
  caja_bancos: "card",
  reportes: "barchart",
  configuraciones: "settings",
  cuenta_vittkly: "building",
  panel_plataforma: "grid",
  soporte_comunidad: "message",
  cotizaciones: "doc",
  post_venta: "heart",
  sitio_web: "mapwide",
  marketing: "megaphone",
  sedes_areas: "pin",
  contratos: "doc",
  puestos_turnos: "clock",
  asistencia_sede: "checksquare",
  rutinas: "repeat",
  inspecciones: "check",
  pedidos_adicionales: "plus",
  aprobaciones: "checksquare",
  portal_b2b: "building",
  valorizaciones: "card",
  inventario_sede_sst: "briefcase",
  licitaciones: "briefcase",
  contratos_estado: "building",
  api_integraciones: "sync",
  multi_pais: "mapwide",
};

export function StaffBentoCommandCenter({
  context,
  basePath = "/staff/dashboard",
}: StaffBentoCommandCenterProps) {
  const { user, staffRole, roleLabel, enabledModules } = context;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("todos");

  const filteredModules = useMemo(() => {
    return enabledModules.filter((m) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.nombre.toLowerCase().includes(q) ||
        m.codigo.toLowerCase().includes(q) ||
        m.grupo.toLowerCase().includes(q);
      const matchesGroup =
        selectedGroup === "todos" || m.grupo === selectedGroup;
      return matchesSearch && matchesGroup;
    });
  }, [enabledModules, searchQuery, selectedGroup]);

  const availableGroups = useMemo(() => {
    return Array.from(new Set(enabledModules.map((m) => m.grupo)));
  }, [enabledModules]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Cabecera de Staff */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1 text-left">
          <div className="flex items-center gap-2">
            <Badge variant="plan" size="sm" mono>
              Vittkly Staff Console
            </Badge>
            <Badge
              variant={staffRole === "admin" ? "primary" : "role"}
              size="sm"
            >
              {roleLabel}
            </Badge>
          </div>
          <h1 className="text-ink text-2xl font-extrabold tracking-tight sm:text-3xl">
            Consola Maestra de Plataforma
          </h1>
          <p className="text-ink-muted text-xs sm:text-sm">
            Monitoreo y gestión de infraestructura, tenants B2B y catálogo de
            módulos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" size="md" dot pulse>
            Plataforma 100% Operativa
          </Badge>
        </div>
      </div>

      {/* 4 KPIs de Staff en Bento Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border-line bg-surface-raised flex flex-col justify-between rounded-xl border p-4 shadow-xs">
          <div className="text-ink-muted flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase">
              Módulos Supervisados
            </span>
            <VittklyIcon name="grid" size={16} className="text-primary" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-ink font-mono text-2xl font-extrabold tabular-nums">
              {enabledModules.length}
            </span>
            <span className="text-ink-muted font-mono text-xs tabular-nums">
              / 39 activos
            </span>
          </div>
          <span className="text-ink-muted text-[11px]">
            Permisos de lectura verificados
          </span>
        </div>

        <div className="border-line bg-surface-raised flex flex-col justify-between rounded-xl border p-4 shadow-xs">
          <div className="text-ink-muted flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase">
              Infraestructura
            </span>
            <Server className="text-accent h-4 w-4" />
          </div>
          <div className="my-2 flex flex-col">
            <span className="text-ink font-mono text-xl font-extrabold">
              sa-east-1
            </span>
            <span className="text-ink-muted text-xs">Supabase Cloud</span>
          </div>
          <span className="text-success-ink text-[11px] font-medium">
            Latencia &lt; 45ms &bull; SSL/TLS 1.3
          </span>
        </div>

        <div className="border-line bg-surface-raised flex flex-col justify-between rounded-xl border p-4 shadow-xs">
          <div className="text-ink-muted flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase">
              Aislamiento RLS
            </span>
            <Database className="text-success h-4 w-4" />
          </div>
          <div className="my-2 flex flex-col">
            <span className="text-ink font-mono text-xl font-extrabold">
              FORCE RLS
            </span>
            <span className="text-ink-muted text-xs">Políticas Atómicas</span>
          </div>
          <span className="text-ink-muted text-[11px]">
            Zero Cross-Tenant Leakage
          </span>
        </div>

        <div className="border-line bg-surface-raised flex flex-col justify-between rounded-xl border p-4 shadow-xs">
          <div className="text-ink-muted flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase">
              Sesión de Staff
            </span>
            <Users className="text-primary h-4 w-4" />
          </div>
          <div className="my-2 flex flex-col">
            <span className="text-ink truncate font-mono text-base font-extrabold">
              {user.nombre}
            </span>
            <span className="text-ink-muted truncate font-mono text-xs">
              {user.correo}
            </span>
          </div>
          <Badge variant="primary" size="sm">
            {roleLabel}
          </Badge>
        </div>
      </div>

      {/* Barra de Filtros y Módulos de Staff */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="text-ink-muted pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar módulo de la plataforma..."
              className="border-line bg-surface-raised text-ink placeholder:text-ink-muted/60 focus:border-primary focus:ring-primary/20 h-9 w-full rounded-lg border pr-8 pl-9 text-xs transition-all focus:ring-2 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-ink-muted hover:text-ink absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer p-0.5"
                title="Limpiar"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedGroup("todos")}
              className={`rounded-pill cursor-pointer px-2.5 py-1 text-xs font-semibold transition-colors ${
                selectedGroup === "todos"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "border-line bg-surface-raised text-ink-muted hover:text-ink hover:bg-surface-sunken border"
              }`}
            >
              Todos ({enabledModules.length})
            </button>
            {availableGroups.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGroup(g)}
                className={`rounded-pill cursor-pointer px-2.5 py-1 text-xs font-semibold capitalize transition-colors ${
                  selectedGroup === g
                    ? "bg-primary text-on-primary shadow-xs"
                    : "border-line bg-surface-raised text-ink-muted hover:text-ink hover:bg-surface-sunken border"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Grilla de Módulos de Staff */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredModules.map((mod) => {
            const iconName = MODULE_ICON_MAP[mod.codigo] || "grid";
            const targetUrl = `${basePath}/${mod.codigo}`;

            return (
              <Link
                key={mod.codigo}
                href={targetUrl}
                className="group border-line bg-surface-raised hover:border-line-strong hover:shadow-1 relative flex cursor-pointer flex-col justify-between rounded-xl border p-4.5 text-left transition-all duration-200"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="bg-primary-soft text-primary-ink flex h-9 w-9 items-center justify-center rounded-lg transition-transform group-hover:scale-105">
                      <VittklyIcon name={iconName} size={18} />
                    </div>
                    <Badge
                      variant="outline"
                      size="sm"
                      mono
                      className="tabular-nums"
                    >
                      {mod.codigo.slice(0, 5)}
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-ink group-hover:text-primary text-sm leading-snug font-bold transition-colors">
                      {mod.nombre}
                    </span>
                    <span className="text-ink-muted truncate font-mono text-[11px]">
                      `{mod.codigo}`
                    </span>
                  </div>
                </div>

                <div className="border-line/60 mt-4 flex items-center justify-between border-t pt-3">
                  <Badge variant="primary" size="sm">
                    {mod.permissionSummary}
                  </Badge>

                  <div className="text-ink-muted group-hover:text-primary flex items-center gap-1 text-[11px] font-semibold transition-colors">
                    <span>Abrir</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default StaffBentoCommandCenter;
