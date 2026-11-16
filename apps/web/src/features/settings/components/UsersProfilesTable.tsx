"use client";

import React, { useMemo, useState } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit2,
  Ban,
  Check,
  ShieldAlert,
  Send,
  Eye,
  UserMinus,
  Power,
} from "lucide-react";
import {
  resendInvitationAction,
  toggleMemberStatusAction,
  unlinkMemberAction,
  updateMemberInlineAction,
  type GeneratedInvitationPayload,
} from "../actions/users-profiles.actions";
import type {
  AccessLabel,
  CompanyProfile,
  TeamMember,
} from "../types/settings.types";
import { EditMemberModal } from "./EditMemberModal";

export interface UsersProfilesTableProps {
  members: TeamMember[];
  profiles: CompanyProfile[];
  companyName: string;
  onOpenAddModal: () => void;
  onOpenInvitationModal: (payload: GeneratedInvitationPayload) => void;
}

type FilterChipKey = "all" | "active" | "pending" | "suspended";

interface RowDraft {
  perfilId?: string;
  accessLabel?: AccessLabel;
}

export function UsersProfilesTable({
  members,
  profiles,
  companyName,
  onOpenAddModal,
  onOpenInvitationModal,
}: UsersProfilesTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChip, setActiveChip] = useState<FilterChipKey>("all");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Estado local solo para los cambios pendientes en los comboboxes inline (Perfil y Acceso)
  const [rowDrafts, setRowDrafts] = useState<Record<string, RowDraft>>({});
  const [savingRowId, setSavingRowId] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // Confirmación limpia sin alert() para Suspender o Quitar de la empresa
  const [confirmDialog, setConfirmDialog] = useState<{
    type: "suspend" | "unlink";
    member: TeamMember;
  } | null>(null);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const counts = useMemo(() => {
    return {
      all: members.length,
      active: members.filter((m) => m.status === "active").length,
      pending: members.filter((m) => m.status === "pending").length,
      suspended: members.filter((m) => m.status === "suspended").length,
    };
  }, [members]);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (activeChip === "active" && m.status !== "active") return false;
      if (activeChip === "pending" && m.status !== "pending") return false;
      if (activeChip === "suspended" && m.status !== "suspended") return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchName = m.fullName.toLowerCase().includes(q);
      const matchEmail = m.email.toLowerCase().includes(q);
      const matchPhone = m.phone ? m.phone.toLowerCase().includes(q) : false;
      const matchRole = m.role.toLowerCase().includes(q);

      return matchName || matchEmail || matchPhone || matchRole;
    });
  }, [members, activeChip, searchQuery]);

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (name.slice(0, 2) || "VK").toUpperCase();
  };

  const handleDraftChange = (
    member: TeamMember,
    field: "perfilId" | "accessLabel",
    value: string,
  ) => {
    setRowDrafts((prev) => {
      const currentDraft = prev[member.id] ?? {};
      const nextDraft: RowDraft = {
        ...currentDraft,
        [field]: value,
      };

      const effectivePerfilId = nextDraft.perfilId ?? member.perfilId;
      const effectiveAccess = nextDraft.accessLabel ?? member.accessLabel;

      if (
        effectivePerfilId === member.perfilId &&
        effectiveAccess === member.accessLabel
      ) {
        const clone = { ...prev };
        delete clone[member.id];
        return clone;
      }

      return {
        ...prev,
        [member.id]: nextDraft,
      };
    });
  };

  const handleSaveInlineRow = async (member: TeamMember) => {
    const draft = rowDrafts[member.id];
    if (!draft) return;

    setFeedbackError(null);
    setSavingRowId(member.id);

    const res = await updateMemberInlineAction({
      id: member.id,
      sourceType: member.sourceType,
      invitationId: member.invitationId ?? null,
      perfilId: draft.perfilId ?? member.perfilId,
      accessLabel: draft.accessLabel ?? member.accessLabel,
    });

    setSavingRowId(null);

    if (res.success) {
      setRowDrafts((prev) => {
        const clone = { ...prev };
        delete clone[member.id];
        return clone;
      });
    } else {
      setFeedbackError(
        res.error || "No se pudo guardar el cambio en la fila seleccionada.",
      );
    }
  };

  const handleViewInvitation = (member: TeamMember) => {
    setActiveMenuId(null);
    setFeedbackError(null);

    if (!member.invitationId) return;

    onOpenInvitationModal({
      invitationId: member.invitationId,
      tipo: member.invitationType ?? "nueva_cuenta",
      recipientName: member.fullName,
      recipientEmail: member.email || null,
      recipientPhone: member.phone,
      recipientDocumentMasked: member.docNumberMasked ?? null,
      perfilNombre: member.role,
      accessLabel: member.accessLabel,
      expiresAt:
        member.invitationExpiresAt ??
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      invitationPath: null,
      canResend: true,
    });
  };

  const handleResendInvitation = async (member: TeamMember) => {
    setActiveMenuId(null);
    setFeedbackError(null);

    if (!member.invitationId) return;

    const res = await resendInvitationAction(member.invitationId);
    if (res.success && res.data) {
      onOpenInvitationModal(res.data);
      return;
    }

    setFeedbackError(res.error || "No se pudo reenviar la invitación.");
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog) return;
    setFeedbackError(null);
    setIsConfirmLoading(true);

    if (confirmDialog.type === "suspend") {
      const shouldSuspend = confirmDialog.member.status !== "suspended";
      const res = await toggleMemberStatusAction({
        membershipId: confirmDialog.member.id,
        suspend: shouldSuspend,
      });
      setIsConfirmLoading(false);
      if (!res.success) {
        setFeedbackError(
          res.error || "No se pudo cambiar el estado de acceso.",
        );
      }
      setConfirmDialog(null);
      return;
    }

    const res = await unlinkMemberAction({
      id: confirmDialog.member.id,
      sourceType: confirmDialog.member.sourceType,
      invitationId: confirmDialog.member.invitationId,
    });
    setIsConfirmLoading(false);
    if (!res.success) {
      setFeedbackError(
        res.error || "No se pudo desvincular a la persona de la empresa.",
      );
    }
    setConfirmDialog(null);
  };

  return (
    <div className="border-line bg-surface-raised flex flex-col gap-5 rounded-2xl border p-5 shadow-xs sm:p-6">
      {/* 1. Barra Superior de Acciones */}
      <div className="border-line flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-center">
        <div className="flex max-w-2xl flex-col gap-1">
          <h2 className="text-ink font-sans text-lg font-bold tracking-tight">
            Personas de tu equipo
          </h2>
          <p className="text-ink-muted text-xs leading-relaxed">
            Registra a cada persona con sus datos y asígnale un perfil. Entra a{" "}
            <b className="text-ink font-semibold">{companyName}</b> con Google,
            Microsoft, WhatsApp o un enlace de invitación, y ve solo lo que su
            perfil permite.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="bg-primary text-on-primary hover:bg-primary-hover inline-flex shrink-0 cursor-pointer items-center gap-1.5 self-start rounded-xl px-4 py-2.5 text-xs font-bold shadow-xs transition-colors sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>+ Agregar persona</span>
        </button>
      </div>

      {feedbackError && (
        <div className="border-danger/30 bg-danger-soft text-danger-ink rounded-xl border p-3 text-xs font-semibold">
          {feedbackError}
        </div>
      )}

      {/* 2. Buscador y Filtros por Chips */}
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div className="relative w-full lg:max-w-md">
          <Search className="text-ink-muted pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, correo, celular o perfil..."
            className="border-line bg-surface-sunken text-ink placeholder:text-ink-muted focus:border-primary focus:bg-surface-raised w-full rounded-xl border py-2 pr-4 pl-10 text-xs transition-colors outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-ink-muted hover:text-ink absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-xs font-semibold"
            >
              Limpiar
            </button>
          )}
        </div>

        <div
          className="flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label="Filtros por estado"
        >
          <button
            type="button"
            onClick={() => setActiveChip("all")}
            className={`rounded-pill cursor-pointer px-3 py-1.5 text-xs font-semibold transition-all ${
              activeChip === "all"
                ? "bg-primary-soft text-primary-ink border-primary/30 border font-bold"
                : "bg-surface-sunken text-ink-muted hover:text-ink border-line border"
            }`}
          >
            <span>Todas</span>{" "}
            <span className="font-mono text-[11px] tabular-nums">
              ({counts.all})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveChip("active")}
            className={`rounded-pill cursor-pointer px-3 py-1.5 text-xs font-semibold transition-all ${
              activeChip === "active"
                ? "bg-success-soft text-success-ink border-success/30 border font-bold"
                : "bg-surface-sunken text-ink-muted hover:text-ink border-line border"
            }`}
          >
            <span>Activas</span>{" "}
            <span className="font-mono text-[11px] tabular-nums">
              ({counts.active})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveChip("pending")}
            className={`rounded-pill cursor-pointer px-3 py-1.5 text-xs font-semibold transition-all ${
              activeChip === "pending"
                ? "bg-warning-soft text-warning-ink border-warning/30 border font-bold"
                : "bg-surface-sunken text-ink-muted hover:text-ink border-line border"
            }`}
          >
            <span>Pendientes</span>{" "}
            <span className="font-mono text-[11px] tabular-nums">
              ({counts.pending})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveChip("suspended")}
            className={`rounded-pill cursor-pointer px-3 py-1.5 text-xs font-semibold transition-all ${
              activeChip === "suspended"
                ? "bg-surface-sunken text-ink border-line-strong border font-bold"
                : "bg-surface-sunken text-ink-muted hover:text-ink border-line border"
            }`}
          >
            <span>Suspendidas</span>{" "}
            <span className="font-mono text-[11px] tabular-nums">
              ({counts.suspended})
            </span>
          </button>
        </div>
      </div>

      {/* 3. Tabla de Personas */}
      <div className="border-line bg-surface-raised overflow-visible rounded-xl border">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-line bg-surface-sunken/60 text-ink-muted border-b font-mono text-[11px] font-bold tracking-wider uppercase">
                <th scope="col" className="px-4 py-3">
                  PERSONA
                </th>
                <th scope="col" className="px-4 py-3">
                  PERFIL
                </th>
                <th scope="col" className="px-4 py-3">
                  ACCESO
                </th>
                <th scope="col" className="px-4 py-3">
                  ESTADO
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  ACCIONES
                </th>
              </tr>
            </thead>
            <tbody className="divide-line divide-y">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-ink font-semibold">
                        No se encontraron personas en este filtro
                      </p>
                      <p className="text-ink-muted text-xs">
                        Prueba con otro término de búsqueda o agrega a una nueva
                        persona.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const initials = getInitials(member.fullName);
                  const draft = rowDrafts[member.id];
                  const selectedPerfilId = draft?.perfilId ?? member.perfilId;
                  const selectedAccessLabel =
                    draft?.accessLabel ?? member.accessLabel;
                  const isRowDirty = Boolean(
                    draft &&
                    (selectedPerfilId !== member.perfilId ||
                      selectedAccessLabel !== member.accessLabel),
                  );
                  const isSavingThisRow = savingRowId === member.id;

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-surface-sunken/40 transition-colors"
                    >
                      {/* 1. PERSONA */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold select-none ${
                              member.isOwner
                                ? "bg-primary text-on-primary ring-primary/20 ring-2"
                                : "bg-surface-sunken text-ink border-line border"
                            }`}
                          >
                            {initials}
                          </div>

                          <div className="flex min-w-0 flex-col gap-0.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-ink truncate text-sm font-bold">
                                {member.fullName}
                              </span>
                              {member.isOwner && (
                                <span className="bg-primary-soft text-primary-ink border-primary/20 py-0.2 rounded-md border px-1.5 text-[10px] font-bold">
                                  Tú · Propietario de la cuenta
                                </span>
                              )}
                            </div>

                            <div className="text-ink-muted flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[11px]">
                              {member.email && (
                                <span className="truncate">{member.email}</span>
                              )}
                              {member.phone && (
                                <>
                                  {member.email && (
                                    <span className="text-line-strong">·</span>
                                  )}
                                  <span className="tabular-nums">
                                    {member.phone}
                                  </span>
                                </>
                              )}
                              {member.jobTitle && (
                                <>
                                  <span className="text-line-strong">·</span>
                                  <span className="font-sans">
                                    {member.jobTitle}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. PERFIL (Combobox individual) */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {member.isOwner ? (
                          <span className="bg-primary-soft text-primary-ink border-primary/20 inline-flex items-center rounded-lg border px-2.5 py-1.5 text-xs font-bold">
                            Administrador
                          </span>
                        ) : (
                          <select
                            aria-label={`Perfil de ${member.fullName}`}
                            value={selectedPerfilId}
                            onChange={(e) =>
                              handleDraftChange(
                                member,
                                "perfilId",
                                e.target.value,
                              )
                            }
                            className="border-line bg-surface-sunken text-ink focus:border-primary focus:bg-surface-raised cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors outline-none"
                          >
                            {profiles.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.nombre}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>

                      {/* 3. ACCESO (Combobox individual) */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {member.isOwner ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-ink text-xs font-bold">
                              Web y app
                            </span>
                            <span className="text-ink-muted text-[10px]">
                              Google · Microsoft · WhatsApp
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <select
                              aria-label={`Acceso de ${member.fullName}`}
                              value={selectedAccessLabel}
                              onChange={(e) =>
                                handleDraftChange(
                                  member,
                                  "accessLabel",
                                  e.target.value as AccessLabel,
                                )
                              }
                              className="border-line bg-surface-sunken text-ink focus:border-primary focus:bg-surface-raised cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors outline-none"
                            >
                              <option value="Solo web">Solo web</option>
                              <option value="Solo app">Solo app</option>
                              <option value="Web y app">Web y app</option>
                            </select>

                            <span className="text-ink-muted text-[10px]">
                              {selectedAccessLabel === "Solo app"
                                ? "WhatsApp · PIN"
                                : "Google · Microsoft · WhatsApp"}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* 4. ESTADO */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {member.status === "active" ? (
                          <span className="bg-success-soft text-kleanly border-success/30 rounded-pill inline-flex items-center gap-1.5 border px-2.5 py-0.5 text-xs font-bold">
                            <span className="bg-success h-1.5 w-1.5 rounded-full" />
                            <span>Activa</span>
                          </span>
                        ) : member.status === "pending" ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="bg-warning-soft text-warning-ink border-warning/30 rounded-pill inline-flex w-fit items-center gap-1 border px-2.5 py-0.5 text-xs font-bold">
                              <span className="bg-warning h-1.5 w-1.5 rounded-full" />
                              <span>Pendiente</span>
                            </span>
                            <span className="text-ink-muted pl-1 text-[10px]">
                              Aún no ingresa
                            </span>
                          </div>
                        ) : (
                          <span className="bg-danger-soft/60 text-danger-ink border-danger/20 rounded-pill inline-flex items-center gap-1 border px-2.5 py-0.5 text-xs font-semibold">
                            <Ban className="h-3 w-3" />
                            <span>Suspendida</span>
                          </span>
                        )}
                      </td>

                      {/* 5. ACCIONES (Guardar dinámico, Editar, ...) */}
                      <td className="relative px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {/* Botón Guardar: oculto por defecto, solo visible cuando hay cambio en Perfil o Acceso */}
                          {isRowDirty && (
                            <button
                              type="button"
                              disabled={isSavingThisRow}
                              onClick={() => void handleSaveInlineRow(member)}
                              className="bg-primary text-on-primary hover:bg-primary-hover animate-sc-in inline-flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>
                                {isSavingThisRow ? "Guardando..." : "Guardar"}
                              </span>
                            </button>
                          )}

                          {/* Botón Editar */}
                          <button
                            type="button"
                            onClick={() => setEditingMember(member)}
                            className="border-line bg-surface-sunken hover:bg-surface-raised hover:text-primary text-ink inline-flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors"
                            title="Editar datos de la persona"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>Editar</span>
                          </button>

                          {/* Menú contextual ... */}
                          {!member.isOwner && (
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveMenuId(
                                    activeMenuId === member.id
                                      ? null
                                      : member.id,
                                  )
                                }
                                className="border-line bg-surface-sunken hover:bg-surface-raised hover:text-primary text-ink-muted cursor-pointer rounded-lg border p-1.5 transition-colors"
                                title="Más opciones"
                                aria-label="Más opciones"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </button>

                              {activeMenuId === member.id && (
                                <div className="border-line bg-surface-raised animate-sc-in absolute top-full right-0 z-30 mt-1 w-52 rounded-xl border p-1.5 text-left text-xs shadow-xl">
                                  {member.sourceType === "invitacion" &&
                                    member.invitationId && (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleViewInvitation(member)
                                          }
                                          className="hover:bg-surface-sunken text-ink flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold"
                                        >
                                          <Eye className="text-primary-ink h-3.5 w-3.5" />
                                          <span>Ver invitación</span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            void handleResendInvitation(member)
                                          }
                                          className="hover:bg-surface-sunken text-ink flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold"
                                        >
                                          <Send className="text-primary-ink h-3.5 w-3.5" />
                                          <span>Reenviar invitación</span>
                                        </button>
                                      </>
                                    )}

                                  {member.sourceType === "membresia" && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        setConfirmDialog({
                                          type: "suspend",
                                          member,
                                        });
                                      }}
                                      className="hover:bg-surface-sunken text-ink flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold"
                                    >
                                      <Power className="text-warning-ink h-3.5 w-3.5" />
                                      <span>
                                        {member.status === "suspended"
                                          ? "Reactivar acceso"
                                          : "Suspender acceso"}
                                      </span>
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      setConfirmDialog({
                                        type: "unlink",
                                        member,
                                      });
                                    }}
                                    className="hover:bg-danger-soft text-danger-ink flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold"
                                  >
                                    <UserMinus className="h-3.5 w-3.5" />
                                    <span>Quitar de la empresa</span>
                                  </button>
                                </div>
                              )}
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
      </div>

      {/* 4. Leyenda Inferior de Seguridad */}
      <div className="border-line text-ink-muted flex items-start gap-2 border-t pt-3 text-[11px] leading-relaxed sm:text-xs">
        <ShieldAlert className="text-ink-muted mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Solo entran las personas registradas aquí. Los perfiles ocultan
          módulos y precios en la pantalla; no cifran los datos. Si cambias el
          perfil de alguien, se aplica la próxima vez que ingrese. Suspender
          bloquea el acceso sin borrar a la persona.
        </p>
      </div>

      {/* Modal Editar Persona */}
      {editingMember && (
        <EditMemberModal
          key={editingMember.id}
          isOpen={Boolean(editingMember)}
          onClose={() => setEditingMember(null)}
          member={editingMember}
          profiles={profiles}
        />
      )}

      {/* Modal de Confirmación para Suspender o Quitar de la empresa */}
      {confirmDialog && (
        <div
          role="dialog"
          aria-modal="true"
          className="bg-ink/60 animate-sc-in fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
        >
          <div className="border-line bg-surface-raised flex w-full max-w-md flex-col gap-4 rounded-2xl border p-6 shadow-2xl">
            <h3 className="text-ink text-base font-bold">
              {confirmDialog.type === "suspend"
                ? confirmDialog.member.status === "suspended"
                  ? `¿Reactivar el acceso de ${confirmDialog.member.fullName}?`
                  : `¿Suspender el acceso de ${confirmDialog.member.fullName}?`
                : `¿Quitar a ${confirmDialog.member.fullName} de ${companyName}?`}
            </h3>
            <p className="text-ink-muted text-xs leading-relaxed">
              {confirmDialog.type === "suspend"
                ? confirmDialog.member.status === "suspended"
                  ? "La persona volverá a ingresar a la central web y/o aplicación móvil según su perfil asignado."
                  : "Se bloqueará inmediatamente su ingreso a la empresa conservando intacto su historial."
                : "Su membresía pasará a estado desvinculada conservando el historial de auditoría y servicios pasados, sin eliminar su cuenta personal en Vittkly."}
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isConfirmLoading}
                onClick={() => setConfirmDialog(null)}
                className="text-ink-muted hover:text-ink cursor-pointer px-3 py-2 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isConfirmLoading}
                onClick={() => void handleConfirmAction()}
                className={`cursor-pointer rounded-xl px-4 py-2 text-xs font-bold text-white transition-colors disabled:opacity-50 ${
                  confirmDialog.type === "unlink"
                    ? "bg-danger hover:opacity-90"
                    : "bg-primary hover:bg-primary-hover"
                }`}
              >
                {isConfirmLoading
                  ? "Procesando..."
                  : confirmDialog.type === "suspend"
                    ? confirmDialog.member.status === "suspended"
                      ? "Sí, reactivar acceso"
                      : "Sí, suspender acceso"
                    : "Sí, quitar de la empresa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
