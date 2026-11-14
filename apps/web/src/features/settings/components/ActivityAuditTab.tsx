"use client";

import React from "react";
import { Activity, Clock } from "lucide-react";
import type { AuditLogEntry } from "../types/settings.types";

export interface ActivityAuditTabProps {
  auditLogs: AuditLogEntry[];
}

export function ActivityAuditTab({ auditLogs }: ActivityAuditTabProps) {
  const formatTimestamp = (iso: string) => {
    try {
      return new Intl.DateTimeFormat("es-PE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(iso));
    } catch {
      return iso.slice(0, 16);
    }
  };

  return (
    <div className="border-line bg-surface-raised flex flex-col gap-4 rounded-2xl border p-5 shadow-xs sm:p-6">
      <div className="border-line flex flex-col gap-1 border-b pb-4">
        <div className="flex items-center gap-2">
          <Activity className="text-primary-ink h-4 w-4" />
          <h2 className="text-ink font-sans text-base font-bold sm:text-lg">
            Actividad y auditoría de accesos
          </h2>
        </div>
        <p className="text-ink-muted text-xs">
          Registro inmutable de altas, cambios de perfil, invitaciones y bajas
          generado automáticamente por la base de datos.
        </p>
      </div>

      <div className="border-line overflow-x-auto rounded-xl border">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-line bg-surface-sunken/60 text-ink-muted border-b font-mono text-[11px] font-bold uppercase">
              <th className="px-4 py-3">FECHA Y HORA</th>
              <th className="px-4 py-3">RESPONSABLE</th>
              <th className="px-4 py-3">ACCIÓN</th>
              <th className="px-4 py-3">DETALLE REGISTRADO</th>
            </tr>
          </thead>
          <tbody className="divide-line divide-y">
            {auditLogs.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-ink-muted p-8 text-center">
                  Todavía no hay eventos de auditoría registrados para esta
                  empresa.
                </td>
              </tr>
            ) : (
              auditLogs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-surface-sunken/40 transition-colors"
                >
                  <td className="text-ink-muted px-4 py-3 font-mono text-[11px] whitespace-nowrap tabular-nums">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span>{formatTimestamp(log.creadoEn)}</span>
                    </span>
                  </td>

                  <td className="text-ink px-4 py-3 font-semibold whitespace-nowrap">
                    {log.actorNombre}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                        log.accion === "crear"
                          ? "bg-success-soft text-kleanly border-success/30"
                          : log.accion === "borrar"
                            ? "bg-danger-soft text-danger-ink border-danger/30"
                            : "bg-primary-soft text-primary-ink border-primary/20"
                      }`}
                    >
                      {log.accion}
                    </span>
                  </td>

                  <td className="text-ink px-4 py-3">{log.resumen}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
