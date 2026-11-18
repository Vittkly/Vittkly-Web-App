"use client";

import React, { useState } from "react";
import {
  Mail,
  RefreshCw,
  XCircle,
  LogOut,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  cancelInvitationAction,
  resendInvitationAction,
  resolveExitRequestAction,
  type GeneratedInvitationPayload,
} from "../actions/users-profiles.actions";
import type {
  ExitRequestRecord,
  InvitationRecord,
} from "../types/settings.types";

export interface InvitationsExitsTabProps {
  invitations: InvitationRecord[];
  exitRequests: ExitRequestRecord[];
  onOpenInvitationModal: (payload: GeneratedInvitationPayload) => void;
}

export function InvitationsExitsTab({
  invitations,
  exitRequests,
  onOpenInvitationModal,
}: InvitationsExitsTabProps) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async (inv: InvitationRecord) => {
    setError(null);
    setBusyId(inv.id);
    const res = await resendInvitationAction(inv.id);
    setBusyId(null);

    if (res.success && res.data) {
      onOpenInvitationModal(res.data);
    } else {
      setError(res.error || "No se pudo reenviar la invitación.");
    }
  };

  const handleCancel = async (invId: string) => {
    setError(null);
    setBusyId(invId);
    const res = await cancelInvitationAction(invId);
    setBusyId(null);
    if (!res.success) {
      setError(res.error || "No se pudo anular la invitación.");
    }
  };

  const handleResolveExit = async (
    req: ExitRequestRecord,
    decision: "aprobada" | "rechazada",
  ) => {
    setError(null);
    setBusyId(req.id);
    const res = await resolveExitRequestAction({
      requestId: req.id,
      membresiaId: req.membresiaId,
      decision,
    });
    setBusyId(null);
    if (!res.success) {
      setError(res.error || "No se pudo procesar la solicitud de salida.");
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat("es-PE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(iso));
    } catch {
      return iso.slice(0, 10);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="border-danger/30 bg-danger-soft text-danger-ink rounded-xl border p-3 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Sección 1: Invitaciones enviadas */}
      <div className="border-line bg-surface-raised flex flex-col gap-4 rounded-2xl border p-5 shadow-xs sm:p-6">
        <div className="border-line flex flex-col gap-1 border-b pb-4">
          <div className="flex items-center gap-2">
            <Mail className="text-primary-ink h-4 w-4" />
            <h2 className="text-ink font-sans text-base font-bold sm:text-lg">
              Invitaciones enviadas
            </h2>
          </div>
          <p className="text-ink-muted text-xs">
            Seguimiento de invitaciones pendientes, rechazadas o anuladas. Al
            reenviar una invitación se anula el enlace anterior y se emite uno
            nuevo por 7 días.
          </p>
        </div>

        <div className="border-line overflow-x-auto rounded-xl border">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-line bg-surface-sunken/60 text-ink-muted border-b font-mono text-[11px] font-bold uppercase">
                <th className="px-4 py-3">PERSONA / CONTACTO</th>
                <th className="px-4 py-3">PERFIL / ACCESO</th>
                <th className="px-4 py-3">ESTADO</th>
                <th className="px-4 py-3">VENCIMIENTO</th>
                <th className="px-4 py-3 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-line divide-y">
              {invitations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-ink-muted p-8 text-center">
                    No hay invitaciones registradas en esta empresa.
                  </td>
                </tr>
              ) : (
                invitations.map((inv) => {
                  const isBusy = busyId === inv.id;
                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-surface-sunken/40 transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-ink font-bold">
                            {inv.fullName}
                          </span>
                          <span className="text-ink-muted font-mono text-[11px]">
                            {inv.email || inv.phone || "Cuenta existente"}
                            {inv.docType && inv.docNumberMasked
                              ? ` · ${inv.docType} ${inv.docNumberMasked}`
                              : ""}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-ink font-semibold">
                            {inv.perfilNombre}
                          </span>
                          <span className="text-ink-muted text-[11px]">
                            {inv.accessLabel}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1">
                          {inv.estado === "pendiente" ? (
                            <span className="bg-warning-soft text-warning-ink border-warning/30 rounded-pill inline-flex w-fit items-center gap-1 border px-2.5 py-0.5 text-[11px] font-bold">
                              Pendiente
                            </span>
                          ) : inv.estado === "rechazada" ? (
                            <span className="bg-danger-soft text-danger-ink border-danger/30 rounded-pill inline-flex w-fit items-center gap-1 border px-2.5 py-0.5 text-[11px] font-bold">
                              Rechazada
                            </span>
                          ) : inv.estado === "aceptada" ||
                            inv.estado === "usada" ? (
                            <span className="bg-success-soft text-success-ink border-success/30 rounded-pill inline-flex w-fit items-center gap-1 border px-2.5 py-0.5 text-[11px] font-bold">
                              Aceptada
                            </span>
                          ) : (
                            <span className="bg-surface-sunken text-ink-muted border-line rounded-pill inline-flex w-fit items-center gap-1 border px-2.5 py-0.5 text-[11px] font-semibold">
                              {inv.estado === "anulada" ? "Anulada" : "Vencida"}
                            </span>
                          )}
                          {inv.motivoRechazo && (
                            <span className="text-danger-ink text-[11px]">
                              Motivo: {inv.motivoRechazo}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="text-ink-muted px-4 py-3.5 font-mono text-[11px] tabular-nums">
                        {formatDate(inv.venceEn)}
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        {(inv.estado === "pendiente" ||
                          inv.estado === "vencida") && (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => void handleResend(inv)}
                              className="bg-primary-soft text-primary-ink hover:bg-primary hover:text-on-primary inline-flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors disabled:opacity-50"
                            >
                              <RefreshCw
                                className={`h-3.5 w-3.5 ${
                                  isBusy ? "animate-spin" : ""
                                }`}
                              />
                              <span>Reenviar invitación</span>
                            </button>

                            {inv.estado === "pendiente" && (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => void handleCancel(inv.id)}
                                className="border-line bg-surface-sunken hover:bg-danger-soft hover:text-danger-ink text-ink-muted inline-flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                <span>Anular</span>
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sección 2: Solicitudes de salida */}
      <div className="border-line bg-surface-raised flex flex-col gap-4 rounded-2xl border p-5 shadow-xs sm:p-6">
        <div className="border-line flex flex-col gap-1 border-b pb-4">
          <div className="flex items-center gap-2">
            <LogOut className="text-primary-ink h-4 w-4" />
            <h2 className="text-ink font-sans text-base font-bold sm:text-lg">
              Solicitudes de salida e historial de bajas
            </h2>
          </div>
          <p className="text-ink-muted text-xs">
            Cuando un miembro solicita retirarse de la empresa, puedes aprobar o
            rechazar su salida. Al aprobarla, su membresía pasa a estado
            desvinculada conservando el historial.
          </p>
        </div>

        <div className="border-line overflow-x-auto rounded-xl border">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-line bg-surface-sunken/60 text-ink-muted border-b font-mono text-[11px] font-bold uppercase">
                <th className="px-4 py-3">COLABORADOR</th>
                <th className="px-4 py-3">MOTIVO / AVISOS</th>
                <th className="px-4 py-3">FECHA</th>
                <th className="px-4 py-3">ESTADO</th>
                <th className="px-4 py-3 text-right">DECISIÓN</th>
              </tr>
            </thead>
            <tbody className="divide-line divide-y">
              {exitRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-ink-muted p-8 text-center">
                    No hay solicitudes de salida pendientes ni registradas.
                  </td>
                </tr>
              ) : (
                exitRequests.map((req) => {
                  const isBusy = busyId === req.id;
                  return (
                    <tr
                      key={req.id}
                      className="hover:bg-surface-sunken/40 transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-ink font-bold">
                            {req.fullName}
                          </span>
                          <span className="text-ink-muted text-[11px]">
                            {req.perfilNombre}
                            {req.email ? ` · ${req.email}` : ""}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1">
                          <span className="text-ink">
                            {req.motivo || "Solicitud voluntaria de retiro"}
                          </span>
                          {req.serviciosFuturos > 0 && (
                            <span className="text-warning-ink inline-flex items-center gap-1 text-[11px] font-bold">
                              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                              <span className="tabular-nums">
                                Atención: tiene {req.serviciosFuturos}{" "}
                                servicio(s) futuro(s) asignado(s)
                              </span>
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="text-ink-muted px-4 py-3.5 font-mono text-[11px] tabular-nums">
                        {formatDate(req.creadoEn)}
                      </td>

                      <td className="px-4 py-3.5">
                        {req.estado === "pendiente" ? (
                          <span className="bg-warning-soft text-warning-ink border-warning/30 rounded-pill inline-flex items-center border px-2.5 py-0.5 text-[11px] font-bold">
                            Pendiente
                          </span>
                        ) : req.estado === "aprobada" ? (
                          <span className="bg-success-soft text-success-ink border-success/30 rounded-pill inline-flex items-center border px-2.5 py-0.5 text-[11px] font-bold">
                            Aprobada · Desvinculada
                          </span>
                        ) : (
                          <span className="bg-surface-sunken text-ink-muted border-line rounded-pill inline-flex items-center border px-2.5 py-0.5 text-[11px] font-semibold">
                            Rechazada
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        {req.estado === "pendiente" && (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() =>
                                void handleResolveExit(req, "aprobada")
                              }
                              className="bg-primary text-on-primary hover:bg-primary-hover inline-flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors disabled:opacity-50"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Aprobar</span>
                            </button>

                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() =>
                                void handleResolveExit(req, "rechazada")
                              }
                              className="border-line bg-surface-sunken hover:bg-danger-soft hover:text-danger-ink text-ink-muted inline-flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50"
                            >
                              <span>Rechazar</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
