"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { CanonicalModuleCode } from "@vittkly/shared";
import { VittklyLogo } from "@/components/brand/VittklyLogo";

export interface TenantDashboardViewProps {
  companyName: string;
  allowedModules?: CanonicalModuleCode[];
  canAccessConfig?: boolean;
}

type PeriodKey = "mes" | "mesAnt" | "trim" | "anio" | "todo" | "custom";
type ChannelKey = "todos" | "directo" | "a365";

interface AvisoItem {
  id: number;
  mod: string;
  moduleCode: CanonicalModuleCode;
  nivel: "rojo" | "ambar" | "info";
  n: number;
  titulo: string;
  detalle: string;
  href: string;
  hasCheck?: boolean;
}

const AVISOS_ITEMS: AvisoItem[] = [
  {
    id: 1,
    mod: "TIEMPO",
    moduleCode: "tiempo",
    nivel: "rojo",
    n: 6,
    titulo: "6 alerta(s) del equipo en Tiempo",
    detalle:
      "Manuel Arteaga · Mantenimiento Surco — 2h 45m transcurridos (estimado: 2h 00m) · fuera de ruta · 5 más...",
    href: "/dashboard/tiempo",
    hasCheck: false,
  },
  {
    id: 2,
    mod: "COTIZACIÓN",
    moduleCode: "cotizaciones",
    nivel: "ambar",
    n: 4,
    titulo: "4 cotizaciones sin respuesta",
    detalle:
      "La más antigua lleva 6 días. Haz seguimiento por WhatsApp a Juan Pérez (S/ 450) y 3 más...",
    href: "/dashboard/cotizaciones",
    hasCheck: false,
  },
  {
    id: 3,
    mod: "AGENDA",
    moduleCode: "trabajos",
    nivel: "ambar",
    n: 2,
    titulo: "2 servicios de hoy pendientes de cierre",
    detalle:
      "Registra cobro y estado para pasar a post-venta: Mantenimiento Surco, Limpieza San Borja.",
    href: "/dashboard/trabajos",
    hasCheck: true,
  },
  {
    id: 4,
    mod: "AGENDA",
    moduleCode: "calendario",
    nivel: "ambar",
    n: 2,
    titulo: "2 recordatorios pendientes para mañana",
    detalle:
      "Envía el WhatsApp de confirmación con 24h de anticipación: Carlos Mendoza, Rosa Flores.",
    href: "/dashboard/calendario",
    hasCheck: true,
  },
  {
    id: 5,
    mod: "FINANZAS",
    moduleCode: "liquidaciones",
    nivel: "info",
    n: 1,
    titulo: "1 liquidación por facturar",
    detalle:
      "Corte al 15 de abril listo para emitir factura electrónica a Multiasistencia: S/ 1,840.00.",
    href: "/dashboard/liquidaciones",
    hasCheck: false,
  },
  {
    id: 6,
    mod: "AGENDA",
    moduleCode: "calendario",
    nivel: "info",
    n: 2,
    titulo: "2 servicios programados para mañana",
    detalle:
      "Miraflores (9:30 AM), Surco (2:00 PM). Personal asignado: Manuel Arteaga, Carlos Ruiz.",
    href: "/dashboard/calendario",
    hasCheck: false,
  },
  {
    id: 7,
    mod: "COBRANZAS",
    moduleCode: "cobranzas",
    nivel: "ambar",
    n: 3,
    titulo: "3 pagos pendientes por conciliar",
    detalle:
      "Transferencias BCP registradas ayer por verificar en cuenta bancaria.",
    href: "/dashboard/cobranzas",
    hasCheck: true,
  },
  {
    id: 8,
    mod: "CLIENTES",
    moduleCode: "clientes",
    nivel: "info",
    n: 5,
    titulo: "5 clientes nuevos sin clasificar",
    detalle: "Asigna etiqueta comercial o tipo de cliente en CRM.",
    href: "/dashboard/clientes",
    hasCheck: false,
  },
];

export function TenantDashboardView({
  companyName,
  allowedModules,
  canAccessConfig = true,
}: TenantDashboardViewProps) {
  const [period, setPeriod] = useState<PeriodKey>("mes");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [channel, setChannel] = useState<ChannelKey>("todos");
  const [showTableDetails, setShowTableDetails] = useState(false);
  const [activeChartMonth, setActiveChartMonth] = useState<number | null>(11);
  const [doneAvisos, setDoneAvisos] = useState<Record<number, boolean>>({});
  const [showAllAvisos, setShowAllAvisos] = useState(false);

  const handleSelectPeriod = (next: PeriodKey) => {
    setPeriod(next);
    if (next === "custom" && !customFrom && !customTo) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      setCustomFrom(`${year}-${month}-01`);
      setCustomTo(`${year}-${month}-${day}`);
    }
  };

  const allowedSet = allowedModules ? new Set(allowedModules) : null;
  const filteredAvisos = allowedSet
    ? AVISOS_ITEMS.filter((av) => allowedSet.has(av.moduleCode))
    : AVISOS_ITEMS;
  const pendingAvisosCount = filteredAvisos.filter(
    (av) => av.nivel !== "info" && !doneAvisos[av.id],
  ).length;
  const canQuotations = !allowedSet || allowedSet.has("cotizaciones");
  const canReports = !allowedSet || allowedSet.has("reportes");

  const toggleAvisoDone = (id: number) => {
    setDoneAvisos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const visibleAvisos = showAllAvisos
    ? filteredAvisos
    : filteredAvisos.slice(0, 6);

  const [normFrom, normTo] =
    customFrom && customTo && customFrom > customTo
      ? [customTo, customFrom]
      : [customFrom, customTo];
  const customRangeLabel = `${normFrom || "inicio"} al ${normTo || "hoy"}`;

  // Período etiqueta
  const periodDateLabel =
    period === "mes"
      ? "Noviembre 2026"
      : period === "mesAnt"
        ? "Octubre 2026"
        : period === "trim"
          ? "4to Trimestre 2026"
          : period === "anio"
            ? "Año 2026"
            : period === "todo"
              ? "Histórico completo"
              : customRangeLabel;

  // Serie de 12 meses para el gráfico "Ventas por mes"
  const monthlySeries = [
    { ym: "2025-05", label: "May", part: 8900, a365: 2400, sales: 18 },
    { ym: "2025-06", label: "Jun", part: 9400, a365: 3100, sales: 21 },
    { ym: "2025-07", label: "Jul", part: 11200, a365: 4200, sales: 26 },
    { ym: "2025-08", label: "Ago", part: 10500, a365: 3800, sales: 23 },
    { ym: "2025-09", label: "Set", part: 12100, a365: 4500, sales: 28 },
    { ym: "2025-10", label: "Oct", part: 11800, a365: 4100, sales: 25 },
    { ym: "2025-11", label: "Nov", part: 13400, a365: 5200, sales: 30 },
    { ym: "2025-12", label: "Dic", part: 15800, a365: 6100, sales: 35 },
    { ym: "2026-01", label: "Ene", part: 10200, a365: 3600, sales: 22 },
    { ym: "2026-02", label: "Feb", part: 11400, a365: 4200, sales: 24 },
    { ym: "2026-03", label: "Mar", part: 13900, a365: 5400, sales: 29 },
    { ym: "2026-04", label: "Abr", part: 14850, a365: 5900, sales: 31 },
  ];

  const showParticular = channel !== "a365";
  const showA365 = channel !== "directo";

  const maxMonthTotal = Math.max(
    1,
    ...monthlySeries.map(
      (s) => (showParticular ? s.part : 0) + (showA365 ? s.a365 : 0),
    ),
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 p-4 transition-colors sm:p-6 lg:p-7">
      {/* ========================================================
          A. SECCIÓN: AVISOS (av-dash del artefacto)
         ======================================================== */}
      <div className="border-line bg-surface-raised flex flex-col gap-3.5 rounded-2xl border p-5 shadow-xs">
        <div className="border-line flex flex-col justify-between gap-2 border-b pb-3 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-ink font-sans text-base font-bold tracking-tight sm:text-lg">
              Avisos
            </h2>
            <p className="text-ink-muted text-xs">
              {pendingAvisosCount > 0
                ? `${pendingAvisosCount} por atender`
                : "Sin pendientes urgentes"}{" "}
              · toca un aviso para ir directo al problema.
            </p>
          </div>
          {filteredAvisos.length > 6 && (
            <button
              type="button"
              onClick={() => setShowAllAvisos((prev) => !prev)}
              className="border-line bg-surface-sunken hover:bg-surface-raised text-ink shrink-0 cursor-pointer self-start rounded-xl border px-3 py-1.5 text-xs font-bold shadow-2xs transition-colors sm:self-auto"
            >
              {showAllAvisos
                ? "Mostrar 6 avisos"
                : `Ver los ${filteredAvisos.length} avisos`}
            </button>
          )}
        </div>

        {/* Grid Bento de tarjetas de avisos (av-dg) */}
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3">
          {visibleAvisos.map((av) => {
            const isDone = !!doneAvisos[av.id];
            const borderClass =
              av.nivel === "rojo"
                ? "border-l-danger"
                : av.nivel === "ambar"
                  ? "border-l-warning"
                  : "border-l-primary";
            const badgeClass =
              av.nivel === "rojo"
                ? "bg-danger-soft text-danger-ink font-bold"
                : av.nivel === "ambar"
                  ? "bg-warning-soft text-warning-ink font-bold"
                  : "bg-primary-soft text-primary-ink font-bold";

            return (
              <div key={av.id} className="flex items-stretch gap-1.5">
                <Link
                  href={av.href}
                  className={`border-line bg-surface hover:bg-surface-sunken flex min-w-0 flex-1 items-start gap-3 rounded-xl border border-l-4 p-3 transition-all sm:items-center ${borderClass} ${
                    isDone ? "opacity-55" : ""
                  }`}
                >
                  <span
                    className={`grid h-7 min-w-[28px] flex-none place-items-center rounded-full px-1.5 font-mono text-xs tabular-nums ${badgeClass}`}
                  >
                    {av.n}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <em className="text-ink-muted text-[10px] font-extrabold tracking-wider uppercase not-italic">
                      {av.mod}
                    </em>
                    <b
                      className={`text-ink text-xs leading-snug font-bold sm:text-sm ${
                        isDone ? "text-ink-muted line-through" : ""
                      }`}
                    >
                      {av.titulo}
                    </b>
                    <small className="text-ink-muted text-[11px] leading-snug">
                      {av.detalle}
                    </small>
                  </div>
                  <span className="text-ink-muted shrink-0 text-base font-bold">
                    ›
                  </span>
                </Link>

                {av.hasCheck && (
                  <button
                    type="button"
                    onClick={() => toggleAvisoDone(av.id)}
                    className={`border-line flex w-10 flex-none cursor-pointer items-center justify-center rounded-xl border font-mono text-sm font-extrabold transition-colors ${
                      isDone
                        ? "bg-primary-soft text-primary-ink border-primary/40 shadow-xs"
                        : "bg-surface hover:bg-primary-soft hover:text-primary-ink hover:border-primary text-ink-muted"
                    }`}
                    title={
                      isDone
                        ? "Volver a mostrar este aviso"
                        : "Marcar como listo"
                    }
                    aria-label={
                      isDone ? "Volver a mostrar" : "Marcar como listo"
                    }
                  >
                    {isDone ? "↺" : "✓"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Onboarding Card: Primeros pasos en tu empresa */}
      <div className="border-line bg-surface-raised rounded-2xl border p-5 shadow-xs">
        <div className="border-line mb-3.5 flex flex-col justify-between gap-2 border-b pb-3.5 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-ink font-sans text-base font-bold tracking-tight sm:text-lg">
              Primeros pasos en {companyName}
            </h2>
            <p className="text-ink-muted text-xs">
              Tu empresa empieza en blanco. Sigue estos pasos para dejarla
              lista.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {/* Paso 1 */}
          <div className="border-line bg-surface flex flex-wrap items-start gap-3 rounded-xl border p-3 transition-colors min-[520px]:flex-nowrap min-[520px]:items-center sm:p-3.5">
            <span className="bg-success text-on-success flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold">
              ✓
            </span>
            <div className="flex min-w-0 flex-1 basis-[160px] flex-col">
              <b className="text-ink text-xs font-bold sm:text-sm">
                Completa los datos de tu empresa
              </b>
              <small className="text-ink-muted text-[11px] leading-snug">
                Logo, WhatsApp, RUC y cuenta bancaria para los documentos.
              </small>
            </div>
            {canAccessConfig && (
              <Link
                href="/dashboard/configuraciones/empresa"
                className="border-line bg-surface-raised hover:bg-surface-sunken text-ink ml-10 shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-2xs transition-colors min-[520px]:ml-0"
              >
                Configurar empresa
              </Link>
            )}
          </div>

          {/* Paso 2 */}
          <div className="border-line bg-surface flex flex-wrap items-start gap-3 rounded-xl border p-3 transition-colors min-[520px]:flex-nowrap min-[520px]:items-center sm:p-3.5">
            <span className="border-line bg-surface-sunken text-ink-muted flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-bold">
              2
            </span>
            <div className="flex min-w-0 flex-1 basis-[160px] flex-col">
              <b className="text-ink text-xs font-bold sm:text-sm">
                Registra tu tarifario o servicios
              </b>
              <small className="text-ink-muted text-[11px] leading-snug">
                Crea tus ítems, precios base y unidades para cotizar rápido.
              </small>
            </div>
            {canAccessConfig && (
              <Link
                href="/dashboard/configuraciones/mix-tarifarios"
                className="border-line bg-surface-raised hover:bg-surface-sunken text-ink ml-10 shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-2xs transition-colors min-[520px]:ml-0"
              >
                Ver tarifarios
              </Link>
            )}
          </div>

          {/* Paso 3 */}
          <div className="border-line bg-surface flex flex-wrap items-start gap-3 rounded-xl border p-3 transition-colors min-[520px]:flex-nowrap min-[520px]:items-center sm:p-3.5">
            <span className="border-line bg-surface-sunken text-ink-muted flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-bold">
              3
            </span>
            <div className="flex min-w-0 flex-1 basis-[160px] flex-col">
              <b className="text-ink text-xs font-bold sm:text-sm">
                Crea tu primera cotización
              </b>
              <small className="text-ink-muted text-[11px] leading-snug">
                Elige un cliente, agrega servicios y envíala por WhatsApp.
              </small>
            </div>
            {canQuotations && (
              <Link
                href="/dashboard/cotizaciones"
                className="bg-primary hover:bg-primary-hover text-on-primary ml-10 shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold shadow-xs transition-colors min-[520px]:ml-0"
              >
                Nueva cotización
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          B. SECCIÓN: DASHBOARD (rp-filters + rp-kpis del artefacto)
         ======================================================== */}
      <div className="border-line bg-surface-raised flex flex-col gap-3 rounded-2xl border p-5 shadow-xs">
        <div className="border-line flex flex-col justify-between gap-3 border-b pb-3 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-ink font-sans text-base font-bold tracking-tight sm:text-lg">
              Dashboard
            </h2>
            <p className="text-ink-muted text-xs">
              Resumen del negocio para el período elegido · las flechas comparan
              con el período anterior. Montos con IGV.
            </p>
          </div>
          {canReports && (
            <Link
              href="/dashboard/reportes"
              className="border-line bg-surface-sunken hover:bg-surface-raised text-ink inline-flex shrink-0 items-center gap-1.5 self-start rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors sm:self-auto"
            >
              <span>📥 Ir a descargar reportes</span>
            </Link>
          )}
        </div>

        {/* Fila de Segmentos y Fecha */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="bg-surface-sunken border-line flex flex-wrap items-center gap-1 rounded-xl border p-1">
            {[
              { id: "mes", label: "Este mes" },
              { id: "mesAnt", label: "Mes anterior" },
              { id: "trim", label: "Trimestre" },
              { id: "anio", label: "Año" },
              { id: "todo", label: "Todo" },
              { id: "custom", label: "Rango" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={period === p.id}
                onClick={() => handleSelectPeriod(p.id as PeriodKey)}
                className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  period === p.id
                    ? "bg-surface-raised text-primary-ink font-bold shadow-xs"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {period === "custom" && (
            <div className="flex flex-wrap items-center gap-1.5">
              <input
                type="date"
                aria-label="Fecha desde"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="border-line-strong bg-surface text-ink focus-visible:outline-focus rounded-lg border px-2 py-1 text-xs"
              />
              <span className="text-ink-muted">a</span>
              <input
                type="date"
                aria-label="Fecha hasta"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="border-line-strong bg-surface text-ink focus-visible:outline-focus rounded-lg border px-2 py-1 text-xs"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-surface-sunken border-line flex items-center gap-1 rounded-xl border p-1">
              {[
                { id: "todos", label: "Todos" },
                { id: "directo", label: "Directo" },
                { id: "a365", label: "A365" },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={channel === c.id}
                  onClick={() => setChannel(c.id as ChannelKey)}
                  className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    channel === c.id
                      ? "bg-surface-raised text-primary-ink font-bold shadow-xs"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <span className="text-ink-muted text-xs font-medium whitespace-nowrap">
              📅 {periodDateLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Tarjetas KPI Principales (pv-kpis rp-kpis: 8 métricas oficiales en 4 cols x 2 rows) */}
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {/* KPI 1 */}
        <div className="border-line bg-surface-raised/80 hover:bg-surface-raised flex flex-col gap-1 rounded-xl border p-3.5 transition-colors">
          <span className="text-ink-muted text-[10px] font-bold tracking-wider uppercase">
            Monto vendido
          </span>
          <b className="text-ink font-mono text-xl leading-tight font-extrabold tabular-nums">
            S/ 424.20
          </b>
          <small className="text-ink-muted flex flex-wrap items-center gap-1.5 text-[11px]">
            <span>4 venta(s)</span>
            <span className="text-line-strong select-none">•</span>
            <span className="text-danger-ink font-mono font-bold">↓ -89%</span>
          </small>
        </div>

        {/* KPI 2 */}
        <div className="border-line bg-surface-raised/80 hover:bg-surface-raised flex flex-col gap-1 rounded-xl border p-3.5 transition-colors">
          <span className="text-ink-muted text-[10px] font-bold tracking-wider uppercase">
            Monto cotizado
          </span>
          <b className="text-ink font-mono text-xl leading-tight font-extrabold tabular-nums">
            S/ 1,309.20
          </b>
          <small className="text-ink-muted flex flex-wrap items-center gap-1.5 text-[11px]">
            <span>13 cotizacion(es)</span>
            <span className="text-line-strong select-none">•</span>
            <span className="text-danger-ink font-mono font-bold">↓ -71%</span>
          </small>
        </div>

        {/* KPI 3 */}
        <div className="border-line bg-surface-raised/80 hover:bg-surface-raised flex flex-col gap-1 rounded-xl border p-3.5 transition-colors">
          <span className="text-ink-muted text-[10px] font-bold tracking-wider uppercase">
            Tasa de cierre
          </span>
          <b className="text-warning-ink font-mono text-xl leading-tight font-extrabold tabular-nums">
            31%
          </b>
          <small className="text-ink-muted flex flex-wrap items-center gap-1.5 text-[11px]">
            <span>ventas / cotizaciones</span>
            <span className="text-line-strong select-none">•</span>
            <span className="text-danger-ink font-mono font-bold">↓ -59%</span>
          </small>
        </div>

        {/* KPI 4 */}
        <div className="border-line bg-surface-raised/80 hover:bg-surface-raised flex flex-col gap-1 rounded-xl border p-3.5 transition-colors">
          <span className="text-ink-muted text-[10px] font-bold tracking-wider uppercase">
            Ticket promedio
          </span>
          <b className="text-ink font-mono text-xl leading-tight font-extrabold tabular-nums">
            S/ 106.05
          </b>
          <small className="text-ink-muted flex flex-wrap items-center gap-1.5 text-[11px]">
            <span>por venta</span>
            <span className="text-line-strong select-none">•</span>
            <span className="text-danger-ink font-mono font-bold">↓ -32%</span>
          </small>
        </div>

        {/* KPI 5 */}
        <div className="border-line bg-surface-raised/80 hover:bg-surface-raised flex flex-col gap-1 rounded-xl border p-3.5 transition-colors">
          <span className="text-ink-muted text-[10px] font-bold tracking-wider uppercase">
            Cobrado
          </span>
          <b className="text-success-ink font-mono text-xl leading-tight font-extrabold tabular-nums">
            S/ 291.00
          </b>
          <small className="text-ink-muted flex flex-wrap items-center gap-1.5 text-[11px]">
            <span>en el período</span>
            <span className="text-line-strong select-none">•</span>
            <span className="text-danger-ink font-mono font-bold">↓ -86%</span>
          </small>
        </div>

        {/* KPI 6 */}
        <div className="border-line bg-surface-raised/80 hover:bg-surface-raised flex flex-col gap-1 rounded-xl border p-3.5 transition-colors">
          <span className="text-ink-muted text-[10px] font-bold tracking-wider uppercase">
            Por cobrar hoy
          </span>
          <b className="text-warning-ink font-mono text-xl leading-tight font-extrabold tabular-nums">
            S/ 2,159.90
          </b>
          <small className="text-ink-muted flex flex-wrap items-center gap-1.5 text-[11px]">
            <span>17 cliente(s) con saldo</span>
          </small>
        </div>

        {/* KPI 7 */}
        <div className="border-line bg-surface-raised/80 hover:bg-surface-raised flex flex-col gap-1 rounded-xl border p-3.5 transition-colors">
          <span className="text-ink-muted text-[10px] font-bold tracking-wider uppercase">
            Servicios realizados
          </span>
          <b className="text-ink font-mono text-xl leading-tight font-extrabold tabular-nums">
            9
          </b>
          <small className="text-ink-muted flex flex-wrap items-center gap-1.5 text-[11px]">
            <span>prom 1 h 25 min por visita</span>
            <span className="text-line-strong select-none">•</span>
            <span className="text-danger-ink font-mono font-bold">↓ -53%</span>
          </small>
        </div>

        {/* KPI 8 */}
        <div className="border-line bg-surface-raised/80 hover:bg-surface-raised flex flex-col gap-1 rounded-xl border p-3.5 transition-colors">
          <span className="text-ink-muted text-[10px] font-bold tracking-wider uppercase">
            NPS
          </span>
          <b className="text-success-ink font-mono text-xl leading-tight font-extrabold tabular-nums">
            +100
          </b>
          <small className="text-ink-muted flex flex-wrap items-center gap-1.5 text-[11px]">
            <span>2 encuesta(s)</span>
          </small>
        </div>
      </div>

      {/* ========================================================
          4. SECCIÓN: VENTAS (Ventas por mes y Embudo comercial)
         ======================================================== */}
      <div className="my-1 flex items-center gap-3">
        <span className="text-ink-muted text-xs font-extrabold tracking-widest uppercase">
          Ventas
        </span>
        <div className="bg-line h-px flex-1" />
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        {/* Card: Ventas por mes con Gráfico de Barras Columnas */}
        <div className="border-line bg-surface-raised flex flex-col gap-3 rounded-2xl border p-5 shadow-xs">
          <div className="border-line flex items-baseline justify-between gap-2 border-b pb-2.5">
            <div>
              <h2 className="text-ink font-sans text-base font-bold tracking-tight">
                Ventas por mes
              </h2>
              <p className="text-ink-muted text-xs">
                Monto vendido por mes de emisión, últimos 12 meses.
              </p>
            </div>
            <div className="text-ink-muted flex flex-wrap items-center gap-3 text-xs">
              {showParticular && (
                <span className="inline-flex items-center gap-1.5">
                  <i className="bg-primary inline-block h-2.5 w-2.5 rounded-xs" />
                  <span>Particular</span>
                </span>
              )}
              {showA365 && (
                <span className="inline-flex items-center gap-1.5">
                  <i className="bg-warning ring-warning-ink/30 inline-block h-2.5 w-2.5 rounded-xs ring-1 ring-inset" />
                  <span>A365</span>
                </span>
              )}
            </div>
          </div>

          {/* Gráfico de Barras Columnas */}
          <div className="relative pt-2">
            <div className="border-line flex h-44 items-end gap-1.5 border-b px-1 pb-1 sm:gap-2">
              {monthlySeries.map((s, idx) => {
                const partHeight = Math.round((s.part / maxMonthTotal) * 100);
                const a365Height = Math.round((s.a365 / maxMonthTotal) * 100);
                const isSelected = activeChartMonth === idx;
                const monthTotal =
                  (showParticular ? s.part : 0) + (showA365 ? s.a365 : 0);

                return (
                  <button
                    type="button"
                    key={s.ym}
                    onClick={() => setActiveChartMonth(idx)}
                    aria-pressed={isSelected}
                    aria-label={`${s.label} ${s.ym.slice(0, 4)}: S/ ${monthTotal.toLocaleString()}`}
                    className={`focus-visible:outline-focus flex h-full flex-1 cursor-pointer flex-col items-center justify-end rounded-lg p-1 transition-colors focus-visible:outline-2 ${
                      isSelected
                        ? "bg-surface-sunken"
                        : "hover:bg-surface-sunken/60"
                    }`}
                    title={`${s.label} ${s.ym.slice(0, 4)}: S/ ${monthTotal.toLocaleString()}`}
                  >
                    <span className="flex h-36 w-full items-end justify-center gap-0.5">
                      {showParticular && (
                        <span
                          style={{ height: `${partHeight}%` }}
                          className="bg-primary block w-full max-w-[14px] rounded-t-sm transition-all"
                        />
                      )}
                      {showA365 && (
                        <span
                          style={{ height: `${a365Height}%` }}
                          className="bg-warning ring-warning-ink/30 block w-full max-w-[14px] rounded-t-sm ring-1 transition-all ring-inset"
                        />
                      )}
                    </span>
                    <span
                      className={`text-ink-muted mt-1 font-mono text-[10px] ${
                        idx % 2 === 1 ? "invisible sm:visible" : ""
                      }`}
                    >
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tooltip de mes seleccionado */}
            {activeChartMonth !== null && (
              <div className="bg-surface-sunken border-line mt-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-xl border p-2 text-xs">
                <span className="text-ink font-bold">
                  {monthlySeries[activeChartMonth].label}{" "}
                  {monthlySeries[activeChartMonth].ym.slice(0, 4)}:
                </span>
                <span className="text-ink-muted flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                  {showParticular && (
                    <span>
                      Particular:{" "}
                      <b className="text-ink font-mono tabular-nums">
                        S/{" "}
                        {monthlySeries[activeChartMonth].part.toLocaleString()}
                      </b>
                    </span>
                  )}
                  {showA365 && (
                    <span>
                      {showParticular ? "· " : ""}A365:{" "}
                      <b className="text-ink font-mono tabular-nums">
                        S/{" "}
                        {monthlySeries[activeChartMonth].a365.toLocaleString()}
                      </b>
                    </span>
                  )}
                  <span>
                    · Total:{" "}
                    <b className="text-primary-ink font-mono tabular-nums">
                      S/{" "}
                      {(
                        (showParticular
                          ? monthlySeries[activeChartMonth].part
                          : 0) +
                        (showA365 ? monthlySeries[activeChartMonth].a365 : 0)
                      ).toLocaleString()}
                    </b>
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* Toggle ver como tabla */}
          <details
            open={showTableDetails}
            onToggle={(e) => setShowTableDetails(e.currentTarget.open)}
            className="mt-1 text-xs"
          >
            <summary className="text-primary-ink cursor-pointer font-semibold select-none hover:underline">
              Ver como tabla
            </summary>
            <div className="border-line mt-2 overflow-x-auto rounded-xl border">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-surface-sunken border-line text-ink-muted border-b font-mono text-[10px] uppercase">
                    <th className="p-2">Mes</th>
                    <th className="p-2 text-right">Particular</th>
                    <th className="p-2 text-right">A365</th>
                    <th className="p-2 text-right">Ventas</th>
                  </tr>
                </thead>
                <tbody className="divide-line divide-y">
                  {monthlySeries.map((s) => (
                    <tr key={s.ym} className="hover:bg-surface-sunken/40">
                      <td className="text-ink p-2 font-medium">{s.label}</td>
                      <td className="text-ink p-2 text-right font-mono tabular-nums">
                        S/ {s.part.toLocaleString()}
                      </td>
                      <td className="text-ink p-2 text-right font-mono tabular-nums">
                        S/ {s.a365.toLocaleString()}
                      </td>
                      <td className="text-ink p-2 text-right font-mono font-bold tabular-nums">
                        {s.sales}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>

        {/* Card: Embudo comercial */}
        <div className="border-line bg-surface-raised flex flex-col gap-3.5 rounded-2xl border p-5 shadow-xs">
          <div className="border-line border-b pb-2.5">
            <h2 className="text-ink font-sans text-base font-bold tracking-tight">
              Embudo comercial
            </h2>
            <p className="text-ink-muted text-xs">
              De la cotización al cobro, en el período.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {[
              {
                label: "Emitidas",
                count: 46,
                amount: "S/ 28,420",
                width: "100%",
                pct: "100%",
              },
              {
                label: "En negociación",
                count: 32,
                amount: "S/ 19,800",
                width: "70%",
                pct: "70%",
              },
              {
                label: "Aprobadas",
                count: 24,
                amount: "S/ 14,850",
                width: "52%",
                pct: "52%",
              },
              {
                label: "Cobradas",
                count: 20,
                amount: "S/ 12,300",
                width: "43%",
                pct: "43%",
              },
            ].map((f) => (
              <div key={f.label} className="flex flex-col gap-1">
                <div
                  style={{ width: f.width }}
                  className="bg-primary text-on-primary flex h-7 min-w-[40px] items-center rounded-md px-2.5 font-mono text-xs font-bold transition-all"
                >
                  {f.count}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink font-semibold">{f.label}</span>
                  <small className="text-ink-muted font-mono tabular-nums">
                    {f.amount} · {f.pct}
                  </small>
                </div>
              </div>
            ))}
          </div>

          <div className="border-line text-ink-muted flex items-center gap-4 border-t pt-3 text-xs">
            <span>
              ⏳ Pendientes <b className="text-ink font-mono">8</b>
            </span>
            <span>
              ✖ Rechazadas <b className="text-ink font-mono">6</b>
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================
          5. SECCIÓN: RENTABILIDAD
         ======================================================== */}
      <div className="my-1 flex items-center gap-3">
        <span className="text-ink-muted text-xs font-extrabold tracking-widest uppercase">
          Rentabilidad
        </span>
        <div className="bg-line h-px flex-1" />
      </div>

      <div className="mb-1 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <div className="border-line bg-surface-sunken/80 flex flex-col gap-1 rounded-xl border p-3">
          <span className="text-ink-muted text-[10px] font-bold tracking-wider uppercase">
            Margen bruto promedio
          </span>
          <b className="text-success-ink font-mono text-xl font-extrabold tabular-nums">
            44.2%
          </b>
          <small className="text-ink-muted text-[10px]">Objetivo: 40%</small>
        </div>
        <div className="border-line bg-surface-sunken/80 flex flex-col gap-1 rounded-xl border p-3">
          <span className="text-ink-muted text-[10px] font-bold tracking-wider uppercase">
            Utilidad estimada
          </span>
          <b className="text-ink font-mono text-xl font-extrabold tabular-nums">
            S/ 6,563.70
          </b>
          <small className="text-ink-muted text-[10px]">En el período</small>
        </div>
        <div className="border-line bg-surface-sunken/80 flex flex-col gap-1 rounded-xl border p-3">
          <span className="text-ink-muted text-[10px] font-bold tracking-wider uppercase">
            Costo directo total
          </span>
          <b className="text-ink font-mono text-xl font-extrabold tabular-nums">
            S/ 8,286.30
          </b>
          <small className="text-ink-muted text-[10px]">
            Mano de obra e insumos
          </small>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        {/* Margen por servicio */}
        <div className="border-line bg-surface-raised flex flex-col gap-3 rounded-2xl border p-5 shadow-xs">
          <div className="border-line flex items-baseline justify-between gap-2 border-b pb-2.5">
            <div>
              <h2 className="text-ink font-sans text-base font-bold tracking-tight">
                Margen por servicio
              </h2>
              <p className="text-ink-muted text-xs">
                Qué servicios dejan utilidad. Objetivo: 40% · ordenado por
                ingreso.
              </p>
            </div>
            <Link
              href="/dashboard/rentabilidad"
              className="text-primary-ink shrink-0 text-xs font-bold hover:underline"
            >
              Ver análisis completo ›
            </Link>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            {[
              {
                name: "Limpieza profunda de tapiz",
                margin: "56%",
                width: "56%",
                sub: "Ingreso S/ 4,200 · utilidad S/ 2,352 · 8 trabajos",
              },
              {
                name: "Lavado y desinfección de colchones",
                margin: "48%",
                width: "48%",
                sub: "Ingreso S/ 3,150 · utilidad S/ 1,512 · 6 trabajos",
              },
              {
                name: "Tratamiento y lavado de alfombras",
                margin: "42%",
                width: "42%",
                sub: "Ingreso S/ 2,800 · utilidad S/ 1,176 · 5 trabajos",
              },
              {
                name: "Lavado de muebles en cuero",
                margin: "38%",
                width: "38%",
                sub: "Ingreso S/ 2,100 · utilidad S/ 798 · 3 trabajos",
              },
              {
                name: "Desinfección y nebulización",
                margin: "35%",
                width: "35%",
                sub: "Ingreso S/ 1,600 · utilidad S/ 560 · 2 trabajos",
              },
            ].map((s) => (
              <div key={s.name} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-ink truncate font-semibold">
                    {s.name}
                  </span>
                  <b className="text-ink font-mono tabular-nums">{s.margin}</b>
                </div>
                <div className="bg-surface-sunken h-2 w-full overflow-hidden rounded-full">
                  <div
                    style={{ width: s.width }}
                    className="bg-primary h-full rounded-full transition-all"
                  />
                </div>
                <small className="text-ink-muted text-[11px]">{s.sub}</small>
              </div>
            ))}
          </div>
        </div>

        {/* Menor margen */}
        <div className="border-line bg-surface-raised flex flex-col gap-3 rounded-2xl border p-5 shadow-xs">
          <div className="border-line border-b pb-2.5">
            <h2 className="text-ink font-sans text-base font-bold tracking-tight">
              Menor margen
            </h2>
            <p className="text-ink-muted text-xs">
              Los trabajos que menos dejaron.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 text-xs">
            {[
              {
                client: "Mantenimiento industrial Surco",
                date: "14 abr · OT-1039",
                margin: "28%",
                profit: "S/ 320",
              },
              {
                client: "Limpieza post-obra Miraflores",
                date: "08 abr · OT-1034",
                margin: "31%",
                profit: "S/ 410",
              },
              {
                client: "Lavado tapicería San Borja",
                date: "02 abr · OT-1029",
                margin: "33%",
                profit: "S/ 290",
              },
            ].map((t) => (
              <div
                key={t.client}
                className="bg-surface-sunken border-line flex items-center justify-between gap-2 rounded-xl border p-2.5"
              >
                <div className="flex min-w-0 flex-col">
                  <b className="text-ink truncate font-semibold">{t.client}</b>
                  <small className="text-ink-muted text-[11px]">{t.date}</small>
                </div>
                <div className="flex shrink-0 flex-col items-end">
                  <span className="bg-warning-soft text-warning-ink border-warning/30 rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-bold">
                    {t.margin}
                  </span>
                  <small className="text-ink-muted font-mono text-[10px] tabular-nums">
                    {t.profit}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================
          6. SECCIÓN: SERVICIOS Y PRECIOS
         ======================================================== */}
      <div className="my-1 flex items-center gap-3">
        <span className="text-ink-muted text-xs font-extrabold tracking-widest uppercase">
          Servicios y precios
        </span>
        <div className="bg-line h-px flex-1" />
      </div>

      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Card: Ventas por categoría */}
        <div className="border-line bg-surface-raised flex flex-col gap-3 rounded-2xl border p-5 shadow-xs">
          <div className="border-line border-b pb-2.5">
            <h2 className="text-ink font-sans text-base font-bold tracking-tight">
              Ventas por categoría
            </h2>
            <p className="text-ink-muted text-xs">
              Monto vendido por tipo de servicio.
            </p>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            {[
              {
                cat: "Tapicería y muebles",
                amount: "S/ 6,300",
                width: "100%",
                count: "14 unidades · 11 ventas",
              },
              {
                cat: "Colchones y dormitorios",
                amount: "S/ 4,150",
                width: "66%",
                count: "9 unidades · 8 ventas",
              },
              {
                cat: "Alfombras y pisos",
                amount: "S/ 2,800",
                width: "44%",
                count: "6 unidades · 5 ventas",
              },
              {
                cat: "Desinfección ambiental",
                amount: "S/ 1,600",
                width: "25%",
                count: "3 unidades · 3 ventas",
              },
            ].map((c) => (
              <div key={c.cat} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-ink truncate font-semibold">
                    {c.cat}
                  </span>
                  <b className="text-ink font-mono tabular-nums">{c.amount}</b>
                </div>
                <div className="bg-surface-sunken h-2 w-full overflow-hidden rounded-full">
                  <div
                    style={{ width: c.width }}
                    className="bg-primary h-full rounded-full transition-all"
                  />
                </div>
                <small className="text-ink-muted text-[11px]">{c.count}</small>
              </div>
            ))}
          </div>
        </div>

        {/* Card: Servicios más vendidos */}
        <div className="border-line bg-surface-raised flex flex-col gap-3 rounded-2xl border p-5 shadow-xs">
          <div className="border-line border-b pb-2.5">
            <h2 className="text-ink font-sans text-base font-bold tracking-tight">
              Servicios más vendidos
            </h2>
            <p className="text-ink-muted text-xs">Top 8 por monto.</p>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            {[
              {
                name: "Limpieza sofá 3 cuerpos",
                amount: "S/ 3,200",
                width: "100%",
                sub: "8 unidades",
              },
              {
                name: "Lavado colchón Queen",
                amount: "S/ 2,400",
                width: "75%",
                sub: "6 unidades",
              },
              {
                name: "Lavado alfombra por m²",
                amount: "S/ 1,950",
                width: "61%",
                sub: "5 unidades",
              },
              {
                name: "Desinfección integral",
                amount: "S/ 1,600",
                width: "50%",
                sub: "3 unidades",
              },
            ].map((s) => (
              <div key={s.name} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-ink truncate font-semibold">
                    {s.name}
                  </span>
                  <b className="text-ink font-mono tabular-nums">{s.amount}</b>
                </div>
                <div className="bg-surface-sunken h-2 w-full overflow-hidden rounded-full">
                  <div
                    style={{ width: s.width }}
                    className="bg-primary h-full rounded-full transition-all"
                  />
                </div>
                <small className="text-ink-muted text-[11px]">{s.sub}</small>
              </div>
            ))}
          </div>
        </div>

        {/* Card: Modalidad */}
        <div className="border-line bg-surface-raised flex flex-col gap-3 rounded-2xl border p-5 shadow-xs">
          <div className="border-line border-b pb-2.5">
            <h2 className="text-ink font-sans text-base font-bold tracking-tight">
              Modalidad
            </h2>
            <p className="text-ink-muted text-xs">
              Participación en el monto vendido.
            </p>
          </div>

          {/* Split bar */}
          <div className="flex h-3.5 w-full gap-0.5 overflow-hidden rounded-full">
            <div
              style={{ flex: 65 }}
              className="bg-primary"
              title="Standard: 65%"
            />
            <div
              style={{ flex: 25 }}
              className="bg-vitta ring-primary/25 ring-1 ring-inset"
              title="Deluxe: 25%"
            />
            <div
              style={{ flex: 10 }}
              className="bg-line-strong"
              title="Precio único: 10%"
            />
          </div>

          <div className="text-ink-muted border-line flex flex-col gap-1 border-b pb-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5">
                <i className="bg-primary inline-block h-2.5 w-2.5 rounded-xs" />
                <span>Standard / Basic</span>
              </span>
              <b className="text-ink font-mono">
                65% <small className="text-ink-muted">S/ 9,650</small>
              </b>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5">
                <i className="bg-vitta ring-primary/25 inline-block h-2.5 w-2.5 rounded-xs ring-1 ring-inset" />
                <span>Deluxe</span>
              </span>
              <b className="text-ink font-mono">
                25% <small className="text-ink-muted">S/ 3,700</small>
              </b>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5">
                <i className="bg-line-strong inline-block h-2.5 w-2.5 rounded-xs" />
                <span>Precio único</span>
              </span>
              <b className="text-ink font-mono">
                10% <small className="text-ink-muted">S/ 1,500</small>
              </b>
            </div>
          </div>

          <div>
            <span className="text-ink-muted mb-2 block text-[11px] font-bold tracking-wider uppercase">
              Tipo de precio aplicado
            </span>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-ink">Precio de lista</span>
                <b className="text-ink font-mono">14 venta(s)</b>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink">Con descuento comercial</span>
                <b className="text-ink font-mono">7 venta(s)</b>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink">Tarifa convenio A365</span>
                <b className="text-ink font-mono">3 venta(s)</b>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla Precios: lista vs cobrado */}
      <div className="border-line bg-surface-raised flex flex-col gap-3 rounded-2xl border p-5 shadow-xs">
        <div className="border-line flex flex-col justify-between gap-2 border-b pb-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-ink font-sans text-base font-bold tracking-tight">
              Precios: lista vs cobrado
            </h2>
            <p className="text-ink-muted text-xs">
              Los servicios con más unidades vendidas. En A365 los precios son
              de su tarifario (sin IGV).
            </p>
          </div>
          <div className="bg-surface-sunken border-line rounded-pill text-ink-muted border px-3 py-1 text-xs">
            Descuento otorgado:{" "}
            <b className="text-ink font-mono">S/ 1,240.00</b> · 7.7% del precio
            de lista
          </div>
        </div>

        <div className="border-line overflow-x-auto rounded-xl border">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-surface-sunken border-line text-ink-muted border-b font-mono text-[10px] uppercase">
                <th className="p-2.5">Servicio</th>
                <th className="p-2.5">Modalidad</th>
                <th className="p-2.5 text-right">Unidades</th>
                <th className="p-2.5 text-right">Precio de lista</th>
                <th className="p-2.5 text-right">Precio prom. cobrado</th>
                <th className="p-2.5 text-right">Descuento efectivo</th>
              </tr>
            </thead>
            <tbody className="divide-line divide-y">
              {[
                {
                  srv: "Limpieza sofá 3 cuerpos",
                  mod: "Standard",
                  u: 8,
                  lista: "S/ 420.00",
                  prom: "S/ 400.00",
                  desc: "−4.8%",
                },
                {
                  srv: "Lavado colchón Queen",
                  mod: "Deluxe",
                  u: 6,
                  lista: "S/ 420.00",
                  prom: "S/ 400.00",
                  desc: "−4.8%",
                },
                {
                  srv: "Lavado alfombra m²",
                  mod: "Precio único",
                  u: 5,
                  lista: "S/ 400.00",
                  prom: "S/ 390.00",
                  desc: "−2.5%",
                },
                {
                  srv: "Desinfección integral",
                  mod: "Standard",
                  u: 3,
                  lista: "S/ 550.00",
                  prom: "S/ 533.33",
                  desc: "−3.0%",
                },
                {
                  srv: "Asistencia gasfitería",
                  mod: "A365",
                  u: 2,
                  lista: "S/ 180.00",
                  prom: "S/ 180.00",
                  desc: "0%",
                  isA365: true,
                },
              ].map((row) => (
                <tr key={row.srv} className="hover:bg-surface-sunken/40">
                  <td className="text-ink p-2.5 font-medium">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span>{row.srv}</span>
                      {row.isA365 && (
                        <span className="border-primary/20 bg-primary-soft text-primary-ink rounded border px-1.5 py-0.5 text-[9px] font-bold">
                          A365
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-ink-muted p-2.5">{row.mod}</td>
                  <td className="text-ink p-2.5 text-right font-mono tabular-nums">
                    {row.u}
                  </td>
                  <td className="text-ink-muted p-2.5 text-right font-mono tabular-nums">
                    {row.lista}
                  </td>
                  <td className="text-ink p-2.5 text-right font-mono font-bold tabular-nums">
                    {row.prom}
                  </td>
                  <td className="text-warning-ink p-2.5 text-right font-mono font-bold tabular-nums">
                    {row.desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          7. SECCIÓN: ZONAS Y COBRANZA
         ======================================================== */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        {/* ZONAS */}
        <div className="flex flex-col gap-3">
          <div className="my-1 flex items-center gap-3">
            <span className="text-ink-muted text-xs font-extrabold tracking-widest uppercase">
              Zonas
            </span>
            <div className="bg-line h-px flex-1" />
          </div>

          <div className="border-line bg-surface-raised flex flex-col gap-3 rounded-2xl border p-5 shadow-xs">
            <div className="border-line border-b pb-2.5">
              <h2 className="text-ink font-sans text-base font-bold tracking-tight">
                Ventas por distrito
              </h2>
              <p className="text-ink-muted text-xs">
                Monto vendido y ticket promedio por distrito.
              </p>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              {[
                {
                  dist: "Santiago de Surco",
                  amount: "S/ 4,120",
                  width: "100%",
                  sub: "7 ventas · ticket S/ 588.57",
                },
                {
                  dist: "Miraflores",
                  amount: "S/ 3,450",
                  width: "84%",
                  sub: "5 ventas · ticket S/ 690.00",
                },
                {
                  dist: "San Isidro",
                  amount: "S/ 2,980",
                  width: "72%",
                  sub: "4 ventas · ticket S/ 745.00",
                },
                {
                  dist: "La Molina",
                  amount: "S/ 2,200",
                  width: "53%",
                  sub: "3 ventas · ticket S/ 733.33",
                },
                {
                  dist: "San Borja",
                  amount: "S/ 1,420",
                  width: "34%",
                  sub: "3 ventas · ticket S/ 473.33",
                },
              ].map((d) => (
                <div key={d.dist} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-ink truncate font-semibold">
                      {d.dist}
                    </span>
                    <b className="text-ink font-mono tabular-nums">
                      {d.amount}
                    </b>
                  </div>
                  <div className="bg-surface-sunken h-2 w-full overflow-hidden rounded-full">
                    <div
                      style={{ width: d.width }}
                      className="bg-primary h-full rounded-full transition-all"
                    />
                  </div>
                  <small className="text-ink-muted text-[11px]">{d.sub}</small>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COBRANZA */}
        <div className="flex flex-col gap-3">
          <div className="my-1 flex items-center gap-3">
            <span className="text-ink-muted text-xs font-extrabold tracking-widest uppercase">
              Cobranza
            </span>
            <div className="bg-line h-px flex-1" />
          </div>

          <div className="border-line bg-surface-raised flex flex-col gap-3 rounded-2xl border p-5 shadow-xs">
            <div className="border-line border-b pb-2.5">
              <h2 className="text-ink font-sans text-base font-bold tracking-tight">
                Saldos por cobrar
              </h2>
              <p className="text-ink-muted text-xs">
                Antigüedad desde la fecha del servicio (hoy).
              </p>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              {[
                {
                  label: "Al día (dentro de plazo)",
                  amount: "S/ 1,850",
                  width: "72%",
                },
                {
                  label: "1 a 7 días de vencido",
                  amount: "S/ 450",
                  width: "18%",
                },
                {
                  label: "8 a 15 días de vencido",
                  amount: "S/ 250",
                  width: "10%",
                },
                { label: "16 a 30 días", amount: "S/ 0", width: "0%" },
                { label: "Más de 30 días", amount: "S/ 0", width: "0%" },
              ].map((c) => (
                <div key={c.label} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-ink truncate font-semibold">
                      {c.label}
                    </span>
                    <b className="text-ink font-mono tabular-nums">
                      {c.amount}
                    </b>
                  </div>
                  <div className="bg-surface-sunken h-2 w-full overflow-hidden rounded-full">
                    <div
                      style={{ width: c.width }}
                      className="bg-primary h-full rounded-full transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          8. SECCIÓN: OPERACIÓN (Próximos 7 días)
         ======================================================== */}
      <div className="my-1 flex items-center gap-3">
        <span className="text-ink-muted text-xs font-extrabold tracking-widest uppercase">
          Operación
        </span>
        <div className="bg-line h-px flex-1" />
      </div>

      <div className="border-line bg-surface-raised flex flex-col gap-3 rounded-2xl border p-5 shadow-xs">
        <div className="border-line flex items-center justify-between gap-2 border-b pb-2.5">
          <div>
            <h2 className="text-ink font-sans text-base font-bold tracking-tight">
              Próximos 7 días
            </h2>
            <p className="text-ink-muted text-xs">
              4 servicio(s) programado(s).
            </p>
          </div>
          <Link
            href="/dashboard/calendario"
            className="border-line bg-surface-sunken hover:bg-surface-raised text-ink shrink-0 rounded-xl border px-3 py-1.5 text-xs font-bold shadow-2xs transition-colors"
          >
            Ver calendario
          </Link>
        </div>

        <div className="divide-line flex flex-col divide-y text-xs">
          {[
            {
              date: "Mañana",
              time: "9:30 AM",
              client: "Rosa Flores",
              district: "Miraflores",
              service: "Limpieza sofá 3 cuerpos + colchón",
              status: "Programada",
              statusClass: "bg-primary-soft text-primary-ink border-primary/20",
            },
            {
              date: "Mañana",
              time: "2:00 PM",
              client: "Carlos Mendoza",
              district: "Surco",
              service: "Desinfección y sanitización integral",
              status: "Programada",
              statusClass: "bg-primary-soft text-primary-ink border-primary/20",
            },
            {
              date: "Jue 09 abr",
              time: "10:00 AM",
              client: "Andrea Morales",
              district: "San Isidro",
              service: "Tratamiento de alfombra en lana",
              status: "Programada",
              statusClass: "bg-primary-soft text-primary-ink border-primary/20",
            },
            {
              date: "Vie 10 abr",
              time: "11:30 AM",
              client: "Inmobiliaria Altavista",
              district: "San Borja",
              service: "Mantenimiento post-entrega departamentos",
              status: "Programada",
              statusClass: "bg-primary-soft text-primary-ink border-primary/20",
            },
          ].map((item) => (
            <div
              key={`${item.client}-${item.time}`}
              className="flex flex-col justify-between gap-2 py-3 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex min-w-[70px] flex-col">
                  <b className="text-ink font-semibold">{item.date}</b>
                  <small className="text-ink-muted font-mono">
                    {item.time}
                  </small>
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="text-ink truncate font-bold">
                    {item.client}
                  </span>
                  <small className="text-ink-muted truncate">
                    {item.district} · {item.service}
                  </small>
                </div>
              </div>

              <span
                className={`rounded-pill self-start border px-2.5 py-0.5 font-mono text-[10px] font-bold sm:self-center ${item.statusClass}`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Tecnológico Oficial (solo móvil; desktop ya lo renderiza el sidebar) */}
      <div className="border-line text-ink-muted mt-4 flex items-center justify-center gap-1.5 border-t py-4 text-xs font-semibold lg:hidden">
        <span>Con tecnología de</span>
        <VittklyLogo variant="wordmark" height={18} />
      </div>
    </div>
  );
}

export default TenantDashboardView;
