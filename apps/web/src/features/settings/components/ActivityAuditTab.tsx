"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertCircle,
  Clock,
  Download,
  Filter,
  Loader2,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { queryAuditLogsAction } from "../actions/users-profiles.actions";
import {
  getAuditActionPresentation,
  getAuditOriginLabel,
  normalizeAuditOrigin,
} from "../services/audit-formatter";
import {
  SYSTEM_AUDIT_ACTOR_ID,
  AuditActorOption,
  AuditLogEntry,
  AuditLogsQueryResult,
  AuditOriginOption,
  AuditTimeRange,
} from "../types/settings.types";

const AUDIT_PAGE_SIZE = 25;
const SEARCH_DEBOUNCE_MS = 250;

const TIME_RANGE_OPTIONS: ReadonlyArray<{
  value: AuditTimeRange;
  label: string;
}> = [
  { value: "1d", label: "1 día" },
  { value: "7d", label: "7 días" },
  { value: "15d", label: "15 días" },
  { value: "30d", label: "30 días" },
  { value: "all", label: "Sin límite" },
];

export interface ActivityAuditTabProps {
  auditLogs: AuditLogEntry[];
  initialTotal?: number;
  initialHasMore?: boolean;
  actorOptions?: AuditActorOption[];
  originOptions?: AuditOriginOption[];
}

function formatTimestamp(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Lima",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 16);
  }
}

function formatDateParts(iso: string): {
  dateLabel: string;
  timeLabel: string;
} {
  try {
    const d = new Date(iso);
    const dateLabel = new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "America/Lima",
    }).format(d);
    const timeLabel = new Intl.DateTimeFormat("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Lima",
    }).format(d);
    return { dateLabel, timeLabel };
  } catch {
    return { dateLabel: iso.slice(0, 10), timeLabel: iso.slice(11, 16) };
  }
}

function escapeCsvCell(rawValue: string): string {
  const normalized = rawValue.replace(/\r?\n/g, " ");
  const formulaSafe = /^[=+\-@\t\r]/.test(normalized)
    ? `'${normalized}`
    : normalized;
  if (
    formulaSafe.includes('"') ||
    formulaSafe.includes(",") ||
    formulaSafe.includes(";")
  ) {
    return `"${formulaSafe.replace(/"/g, '""')}"`;
  }
  return `"${formulaSafe}"`;
}

function buildAuditCsv(entries: AuditLogEntry[]): string {
  const headers = [
    "Fecha y hora",
    "Responsable",
    "Correo",
    "Dónde",
    "Acción",
    "Entidad",
    "Detalle",
    "Cambios",
  ];

  const rows = entries.map((entry) => {
    const presentation = getAuditActionPresentation(
      entry.tipoEvento,
      entry.accion,
    );
    return [
      formatTimestamp(entry.creadoEn),
      entry.actorNombre,
      entry.actorCorreo ?? "",
      entry.origenLabel,
      presentation.label,
      entry.entidadNombre ?? "",
      entry.resumen,
      entry.cambios.join(" | "),
    ]
      .map(escapeCsvCell)
      .join(",");
  });

  return `\uFEFF${[headers.map(escapeCsvCell).join(","), ...rows].join("\r\n")}`;
}

function deriveActorsFromLogs(entries: AuditLogEntry[]): AuditActorOption[] {
  const map = new Map<string, AuditActorOption>();
  for (const entry of entries) {
    const key = entry.actorId ?? SYSTEM_AUDIT_ACTOR_ID;
    if (!map.has(key)) {
      map.set(key, {
        id: key,
        nombre: entry.actorId ? entry.actorNombre : "Sistema",
        correo: entry.actorCorreo ?? null,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }),
  );
}

function deriveOriginsFromLogs(entries: AuditLogEntry[]): AuditOriginOption[] {
  const map = new Map<string, AuditOriginOption>();
  for (const entry of entries) {
    const canonical = normalizeAuditOrigin(entry.origen, entry.tabla, "tenant");
    if (!map.has(canonical)) {
      map.set(canonical, {
        value: canonical,
        label:
          entry.origenLabel ||
          getAuditOriginLabel(canonical, entry.tabla, "tenant"),
      });
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    a.label.localeCompare(b.label, "es", { sensitivity: "base" }),
  );
}

function mergeEntriesById(
  current: AuditLogEntry[],
  incoming: AuditLogEntry[],
): AuditLogEntry[] {
  const seen = new Set(current.map((item) => item.id));
  const merged = [...current];
  for (const item of incoming) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      merged.push(item);
    }
  }
  return merged;
}

export function ActivityAuditTab({
  auditLogs,
  initialTotal,
  initialHasMore = false,
  actorOptions,
  originOptions,
}: ActivityAuditTabProps) {
  const [queryResult, setQueryResult] = useState<AuditLogsQueryResult | null>(
    null,
  );

  const initialActors = useMemo(
    () =>
      actorOptions && actorOptions.length > 0
        ? actorOptions
        : deriveActorsFromLogs(auditLogs),
    [actorOptions, auditLogs],
  );
  const initialOrigins = useMemo(
    () =>
      originOptions && originOptions.length > 0
        ? originOptions
        : deriveOriginsFromLogs(auditLogs),
    [originOptions, auditLogs],
  );

  const entries = queryResult ? queryResult.entries : auditLogs;
  const totalCount = queryResult
    ? queryResult.totalCount
    : (initialTotal ?? auditLogs.length);
  const hasMore = queryResult ? queryResult.hasMore : initialHasMore;
  const actors =
    queryResult && queryResult.actors.length > 0
      ? queryResult.actors
      : initialActors;
  const origins =
    queryResult && queryResult.origins.length > 0
      ? queryResult.origins
      : initialOrigins;

  const [actorId, setActorId] = useState<string>("");
  const [origen, setOrigen] = useState<string>("");
  const [timeRange, setTimeRange] = useState<AuditTimeRange>("all");
  const [searchInput, setSearchInput] = useState<string>("");
  const [appliedSearch, setAppliedSearch] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const requestIdRef = useRef<number>(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const hasActiveFilters = useMemo(
    () =>
      Boolean(actorId || origen || timeRange !== "all" || appliedSearch.trim()),
    [actorId, origen, timeRange, appliedSearch],
  );

  const executeQuery = async (params: {
    actorId: string;
    origen: string;
    timeRange: AuditTimeRange;
    search: string;
    offset: number;
    append: boolean;
  }) => {
    const reqId = requestIdRef.current + 1;
    requestIdRef.current = reqId;

    setErrorMsg(null);
    if (params.append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await queryAuditLogsAction({
        actorId: params.actorId || undefined,
        origen: params.origen || undefined,
        timeRange: params.timeRange,
        search: params.search.trim() || undefined,
        limit: AUDIT_PAGE_SIZE,
        offset: params.offset,
      });

      if (requestIdRef.current !== reqId) {
        return;
      }

      if (response.success && response.data) {
        const data = response.data;
        setQueryResult((prev) => {
          const baseEntries = prev ? prev.entries : auditLogs;
          return {
            entries: params.append
              ? mergeEntriesById(baseEntries, data.entries)
              : data.entries,
            totalCount: data.totalCount,
            hasMore: data.hasMore,
            actors:
              data.actors.length > 0
                ? data.actors
                : (prev?.actors ?? initialActors),
            origins:
              data.origins.length > 0
                ? data.origins
                : (prev?.origins ?? initialOrigins),
          };
        });
      } else {
        setErrorMsg(
          response.error || "No se pudo consultar el registro de actividad.",
        );
      }
    } catch {
      if (requestIdRef.current === reqId) {
        setErrorMsg("Ocurrió un error al consultar el registro de actividad.");
      }
    } finally {
      if (requestIdRef.current === reqId) {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  };

  const handleActorChange = (nextActorId: string) => {
    setActorId(nextActorId);
    void executeQuery({
      actorId: nextActorId,
      origen,
      timeRange,
      search: appliedSearch,
      offset: 0,
      append: false,
    });
  };

  const handleOriginChange = (nextOrigen: string) => {
    setOrigen(nextOrigen);
    void executeQuery({
      actorId,
      origen: nextOrigen,
      timeRange,
      search: appliedSearch,
      offset: 0,
      append: false,
    });
  };

  const handleTimeRangeChange = (nextTimeRange: AuditTimeRange) => {
    setTimeRange(nextTimeRange);
    void executeQuery({
      actorId,
      origen,
      timeRange: nextTimeRange,
      search: appliedSearch,
      offset: 0,
      append: false,
    });
  };

  const handleSearchInputChange = (nextValue: string) => {
    setSearchInput(nextValue);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setAppliedSearch(nextValue);
      void executeQuery({
        actorId,
        origen,
        timeRange,
        search: nextValue,
        offset: 0,
        append: false,
      });
    }, SEARCH_DEBOUNCE_MS);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setAppliedSearch(searchInput);
    void executeQuery({
      actorId,
      origen,
      timeRange,
      search: searchInput,
      offset: 0,
      append: false,
    });
  };

  const handleClearSearch = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setSearchInput("");
    setAppliedSearch("");
    void executeQuery({
      actorId,
      origen,
      timeRange,
      search: "",
      offset: 0,
      append: false,
    });
  };

  const handleClearAllFilters = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setActorId("");
    setOrigen("");
    setTimeRange("all");
    setSearchInput("");
    setAppliedSearch("");
    void executeQuery({
      actorId: "",
      origen: "",
      timeRange: "all",
      search: "",
      offset: 0,
      append: false,
    });
  };

  const handleRetry = () => {
    void executeQuery({
      actorId,
      origen,
      timeRange,
      search: appliedSearch,
      offset: 0,
      append: false,
    });
  };

  const handleLoadMore = () => {
    if (isLoading || isLoadingMore || !hasMore) return;
    void executeQuery({
      actorId,
      origen,
      timeRange,
      search: appliedSearch,
      offset: entries.length,
      append: true,
    });
  };

  const handleExportCsv = () => {
    if (entries.length === 0 || typeof window === "undefined") return;
    const csvContent = buildAuditCsv(entries);
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `actividad-auditoria-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section
      aria-label="Registro detallado de actividad y auditoría"
      aria-busy={isLoading || isLoadingMore}
      className="border-line bg-surface-raised flex min-w-0 flex-col gap-4 rounded-2xl border p-4 shadow-xs sm:p-6"
    >
      {/* Cabecera */}
      <div className="border-line flex flex-col justify-between gap-3 border-b pb-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2">
            <Activity className="text-primary-ink h-4 w-4 shrink-0" />
            <h2 className="text-ink font-sans text-base font-bold sm:text-lg">
              Actividad y auditoría de accesos
            </h2>
          </div>
          <p className="text-ink-muted text-xs leading-relaxed">
            Registro inmutable y detallado de cambios en accesos, permisos,
            operaciones y configuración generado por la base de datos.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          disabled={entries.length === 0}
          className="border-line bg-surface-sunken text-ink hover:bg-surface hover:border-line-strong inline-flex shrink-0 cursor-pointer items-center gap-1.5 self-start rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
        >
          <Download className="h-3.5 w-3.5 shrink-0" />
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* Barra de filtros combinables y búsqueda */}
      <div className="border-line bg-surface-sunken/50 flex flex-col gap-3 rounded-xl border p-3.5 sm:p-4">
        <form
          onSubmit={handleSearchSubmit}
          className="grid grid-cols-1 gap-2.5 md:grid-cols-12"
        >
          {/* Búsqueda de texto */}
          <div className="relative min-w-0 md:col-span-5">
            <Search className="text-ink-muted pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="search"
              aria-label="Buscar en actividad"
              value={searchInput}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              placeholder="Buscar por persona, acción, entidad o detalle..."
              className="border-line bg-surface-raised text-ink placeholder:text-ink-muted focus:border-primary w-full rounded-xl border py-2 pr-9 pl-9 text-xs transition-colors outline-none"
            />
            {searchInput && (
              <button
                type="button"
                aria-label="Limpiar búsqueda"
                onClick={handleClearSearch}
                className="text-ink-muted hover:text-ink absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer rounded-md p-1 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filtro por persona */}
          <div className="min-w-0 md:col-span-3">
            <select
              aria-label="Filtrar por persona"
              value={actorId}
              onChange={(e) => handleActorChange(e.target.value)}
              className="border-line bg-surface-raised text-ink focus:border-primary w-full cursor-pointer rounded-xl border px-3 py-2 text-xs font-medium transition-colors outline-none"
            >
              <option value="">Todas las personas</option>
              {actors.map((actor) => (
                <option key={actor.id} value={actor.id}>
                  {actor.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por dónde se realizó el cambio */}
          <div className="min-w-0 md:col-span-4">
            <select
              aria-label="Filtrar por módulo o entidad"
              value={origen}
              onChange={(e) => handleOriginChange(e.target.value)}
              className="border-line bg-surface-raised text-ink focus:border-primary w-full cursor-pointer rounded-xl border px-3 py-2 text-xs font-medium transition-colors outline-none"
            >
              <option value="">Todos los módulos</option>
              {origins.map((originOption) => (
                <option key={originOption.value} value={originOption.value}>
                  {originOption.label}
                </option>
              ))}
            </select>
          </div>
        </form>

        {/* Rango de tiempo + Limpiar + Conteo */}
        <div className="flex flex-col justify-between gap-2.5 pt-0.5 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-ink-muted inline-flex items-center gap-1 text-[11px] font-semibold">
              <Filter className="h-3.5 w-3.5 shrink-0" />
              <span>Período:</span>
            </span>

            <div
              role="group"
              aria-label="Rango de tiempo"
              className="flex flex-wrap items-center gap-1.5"
            >
              {TIME_RANGE_OPTIONS.map((option) => {
                const isSelected = timeRange === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => handleTimeRangeChange(option.value)}
                    className={`rounded-pill cursor-pointer border px-3 py-1 text-xs font-semibold transition-colors ${
                      isSelected
                        ? "bg-primary text-on-primary border-primary font-bold shadow-xs"
                        : "border-line bg-surface-raised text-ink-muted hover:text-ink hover:border-line-strong"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
            <span
              aria-live="polite"
              className="text-ink-muted inline-flex items-center gap-1.5 font-mono text-[11px] tabular-nums"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Actualizando registros...</span>
                </>
              ) : (
                <span>
                  Mostrando {entries.length} de {totalCount}{" "}
                  {totalCount === 1 ? "registro" : "registros"}
                </span>
              )}
            </span>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="border-line bg-surface-raised text-ink hover:bg-surface hover:border-line-strong inline-flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors"
              >
                <RotateCcw className="h-3 w-3 shrink-0" />
                <span>Limpiar filtros</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Estado de error */}
      {errorMsg && (
        <div
          role="alert"
          className="border-danger/30 bg-danger-soft text-danger-ink flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs font-semibold"
        >
          <span className="inline-flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </span>
          <button
            type="button"
            onClick={handleRetry}
            className="border-danger/30 bg-surface-raised text-danger-ink hover:bg-surface cursor-pointer rounded-lg border px-3 py-1 text-xs font-bold transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Vista móvil (< md): tarjetas apiladas sin desbordamiento horizontal */}
      <div className="flex flex-col gap-3 md:hidden">
        {entries.length === 0 ? (
          <div className="border-line text-ink-muted rounded-xl border p-8 text-center text-xs">
            {hasActiveFilters
              ? "No hay eventos que coincidan con los filtros o la búsqueda actual."
              : "Todavía no hay eventos de auditoría registrados para esta empresa."}
          </div>
        ) : (
          entries.map((log) => {
            const presentation = getAuditActionPresentation(
              log.tipoEvento,
              log.accion,
            );
            const showEntityLabel =
              Boolean(log.entidadNombre) &&
              !log.resumen
                .toLowerCase()
                .includes((log.entidadNombre ?? "").toLowerCase());

            return (
              <article
                key={`mobile-${log.id}`}
                className="border-line bg-surface flex min-w-0 flex-col gap-2.5 rounded-xl border p-3.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${presentation.badgeClassName}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${presentation.dotClassName}`}
                    />
                    <span>{presentation.label}</span>
                  </span>

                  <span className="text-ink-muted inline-flex items-center gap-1 font-mono text-[11px] tabular-nums">
                    <Clock className="h-3 w-3 shrink-0" />
                    <span>{formatTimestamp(log.creadoEn)}</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-ink text-xs font-bold break-words">
                      {log.actorNombre}
                    </div>
                    {log.actorCorreo && (
                      <div className="text-ink-muted font-mono text-[11px] break-all">
                        {log.actorCorreo}
                      </div>
                    )}
                  </div>

                  <span className="border-line bg-surface-sunken text-ink inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold">
                    {log.origenLabel}
                  </span>
                </div>

                <p className="text-ink text-xs leading-relaxed font-medium break-words">
                  {log.resumen}
                </p>

                {showEntityLabel && (
                  <span className="text-ink-muted text-[11px] break-words">
                    Entidad: {log.entidadNombre}
                  </span>
                )}

                {log.cambios.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {log.cambios.map((cambio, idx) => (
                      <span
                        key={`mobile-${log.id}-cambio-${idx}`}
                        className="border-line bg-surface-raised text-ink-muted rounded-md border px-2 py-0.5 font-mono text-[10px] leading-snug break-words"
                      >
                        {cambio}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* Vista escritorio (>= md): tabla de 5 columnas ajustada sin desbordamiento */}
      <div className="border-line hidden overflow-x-auto rounded-xl border md:block">
        <table className="w-full table-fixed border-collapse text-left text-xs">
          <colgroup>
            <col className="w-[14%]" />
            <col className="w-[17%]" />
            <col className="w-[16%]" />
            <col className="w-[18%]" />
            <col className="w-[35%]" />
          </colgroup>
          <thead>
            <tr className="border-line bg-surface-sunken/60 text-ink-muted border-b font-mono text-[11px] font-bold uppercase">
              <th className="px-2.5 py-3">FECHA Y HORA</th>
              <th className="px-2.5 py-3">RESPONSABLE</th>
              <th className="px-2.5 py-3">DÓNDE</th>
              <th className="px-2.5 py-3">ACCIÓN</th>
              <th className="px-3 py-3">DETALLE REGISTRADO</th>
            </tr>
          </thead>
          <tbody className="divide-line divide-y">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-ink-muted p-8 text-center">
                  {hasActiveFilters
                    ? "No hay eventos que coincidan con los filtros o la búsqueda actual."
                    : "Todavía no hay eventos de auditoría registrados para esta empresa."}
                </td>
              </tr>
            ) : (
              entries.map((log) => {
                const presentation = getAuditActionPresentation(
                  log.tipoEvento,
                  log.accion,
                );
                const { dateLabel, timeLabel } = formatDateParts(log.creadoEn);
                const showEntityLabel =
                  Boolean(log.entidadNombre) &&
                  !log.resumen
                    .toLowerCase()
                    .includes((log.entidadNombre ?? "").toLowerCase());

                return (
                  <tr
                    key={log.id}
                    className="hover:bg-surface-sunken/40 align-top transition-colors"
                  >
                    <td className="text-ink-muted px-2.5 py-3 font-mono text-[11px] tabular-nums">
                      <div className="flex flex-col gap-0.5">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3 shrink-0" />
                          <span className="leading-tight">{dateLabel}</span>
                        </span>
                        <span className="pl-4 text-[10px] leading-tight">
                          {timeLabel}
                        </span>
                      </div>
                    </td>

                    <td className="min-w-0 px-2.5 py-3">
                      <div className="text-ink font-semibold break-words">
                        {log.actorNombre}
                      </div>
                      {log.actorCorreo && (
                        <div className="text-ink-muted font-mono text-[10px] break-all">
                          {log.actorCorreo}
                        </div>
                      )}
                    </td>

                    <td className="min-w-0 px-2.5 py-3">
                      <span className="border-line bg-surface-sunken text-ink inline-flex max-w-full items-center rounded-md border px-2 py-0.5 text-left text-[11px] leading-tight font-semibold break-words whitespace-normal">
                        {log.origenLabel}
                      </span>
                    </td>

                    <td className="min-w-0 px-2.5 py-3">
                      <span
                        className={`inline-flex max-w-full items-center gap-1.5 rounded-md border px-1.5 py-0.5 font-mono text-[10px] leading-tight font-bold uppercase ${presentation.badgeClassName}`}
                      >
                        <span
                          aria-hidden="true"
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${presentation.dotClassName}`}
                        />
                        <span className="break-words">
                          {presentation.label}
                        </span>
                      </span>
                    </td>

                    <td className="min-w-0 px-3 py-3">
                      <div className="flex min-w-0 flex-col gap-1">
                        <p className="text-ink leading-relaxed font-medium break-words">
                          {log.resumen}
                        </p>
                        {showEntityLabel && (
                          <span className="text-ink-muted text-[11px] break-words">
                            Entidad: {log.entidadNombre}
                          </span>
                        )}
                        {log.cambios.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {log.cambios.map((cambio, idx) => (
                              <span
                                key={`${log.id}-cambio-${idx}`}
                                className="border-line bg-surface-sunken text-ink-muted max-w-full rounded-md border px-2 py-0.5 font-mono text-[10px] leading-snug break-words"
                              >
                                {cambio}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {hasMore && (
        <div className="flex justify-center pt-1">
          <button
            type="button"
            disabled={isLoading || isLoadingMore}
            onClick={handleLoadMore}
            className="border-line bg-surface-sunken text-ink hover:bg-surface hover:border-line-strong inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoadingMore && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{isLoadingMore ? "Cargando..." : "Ver más"}</span>
          </button>
        </div>
      )}
    </section>
  );
}
