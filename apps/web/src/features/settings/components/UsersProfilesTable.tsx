"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit2,
  Ban,
  Smartphone,
  Globe,
  Layers,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { TeamMember, MemberStatus } from "../types/settings.types";

export interface UsersProfilesTableProps {
  initialMembers: TeamMember[];
  companyName: string;
  onOpenAddModal: () => void;
}

type FilterChipKey = "all" | "active" | "pending" | "suspended";

export function UsersProfilesTable({
  initialMembers,
  companyName,
  onOpenAddModal,
}: UsersProfilesTableProps) {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChip, setActiveChip] = useState<FilterChipKey>("all");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Conteo dinámico de colaboradores por estado
  const counts = useMemo(() => {
    return {
      all: members.length,
      active: members.filter((m) => m.status === "active").length,
      pending: members.filter((m) => m.status === "pending").length,
      suspended: members.filter((m) => m.status === "suspended").length,
    };
  }, [members]);

  // Filtrado reactivo en cliente (Buscador + Chip activo)
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      // Filtro por Chip
      if (activeChip === "active" && m.status !== "active") return false;
      if (activeChip === "pending" && m.status !== "pending") return false;
      if (activeChip === "suspended" && m.status !== "suspended") return false;

      // Filtro por Buscador
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchName = m.fullName.toLowerCase().includes(q);
      const matchEmail = m.email.toLowerCase().includes(q);
      const matchPhone = m.phone ? m.phone.toLowerCase().includes(q) : false;
      const matchRole = m.role.toLowerCase().includes(q);

      return matchName || matchEmail || matchPhone || matchRole;
    });
  }, [members, activeChip, searchQuery]);

  const toggleMemberStatus = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextStatus: MemberStatus =
            m.status === "suspended" ? "active" : "suspended";
          return { ...m, status: nextStatus };
        }
        return m;
      }),
    );
    setActiveMenuId(null);
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (name.slice(0, 2) || "VK").toUpperCase();
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
            Microsoft, WhatsApp o un código de invitación, y ve solo lo que su
            perfil permite.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={onOpenAddModal}
          className="shrink-0 self-start shadow-xs sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>+ Agregar persona</span>
        </Button>
      </div>

      {/* 2. Buscador y Filtros por Chips */}
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        {/* Input con ícono de lupa */}
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
              className="text-ink-muted hover:text-ink absolute top-1/2 right-3 -translate-y-1/2 text-xs font-semibold"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Chips de conteo y filtrado rápido */}
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
            <span className="inline-flex items-center gap-1.5">
              <span className="bg-success h-1.5 w-1.5 rounded-full" />
              <span>Activas</span>
            </span>{" "}
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
            <span className="inline-flex items-center gap-1.5">
              <span className="bg-warning h-1.5 w-1.5 rounded-full" />
              <span>Pendientes</span>
            </span>{" "}
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

      {/* 3. Tabla de Colaboradores */}
      <div className="border-line bg-surface-raised overflow-hidden rounded-xl border">
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
                        No se encontraron colaboradores
                      </p>
                      <p className="text-ink-muted text-xs">
                        Intenta con otro término de búsqueda o cambia el filtro
                        seleccionado.
                      </p>
                      {(searchQuery || activeChip !== "all") && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            setActiveChip("all");
                          }}
                          className="text-primary hover:text-primary-hover mt-2 text-xs font-bold hover:underline"
                        >
                          Restablecer filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const initials = getInitials(member.fullName);

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-surface-sunken/40 transition-colors"
                    >
                      {/* PERSONA */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold select-none ${
                              member.isCurrentUser
                                ? "bg-primary text-on-primary ring-primary/20 ring-2"
                                : "bg-surface-sunken text-ink border-line border"
                            }`}
                          >
                            {initials}
                          </div>

                          <div className="flex min-w-0 flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-ink truncate text-sm font-bold">
                                {member.fullName}
                              </span>
                              {member.isCurrentUser && (
                                <span className="bg-primary-soft text-primary-ink border-primary/20 py-0.2 rounded-md border px-1.5 text-[10px] font-bold">
                                  Tú ·{" "}
                                  {member.isOwner ? "Propietario" : "Admin"}
                                </span>
                              )}
                            </div>

                            <div className="text-ink-muted flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[11px]">
                              <span className="truncate">{member.email}</span>
                              {member.phone && (
                                <>
                                  <span className="text-line-strong">·</span>
                                  <span className="tabular-nums">
                                    {member.phone}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* PERFIL */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${
                            member.role === "Administrador"
                              ? "bg-primary-soft text-primary-ink border-primary/20 border font-bold"
                              : member.role === "Ventas"
                                ? "bg-accent/10 text-primary-ink border-primary/20 border"
                                : "bg-surface-sunken text-ink border-line border"
                          }`}
                        >
                          {member.role}
                        </span>
                      </td>

                      {/* ACCESO */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="text-ink flex items-center gap-1.5 text-xs font-medium">
                            {member.accessScope === "web" ? (
                              <>
                                <Globe className="text-primary-ink h-3.5 w-3.5" />
                                <span>Panel web</span>
                              </>
                            ) : member.accessScope === "mobile" ? (
                              <>
                                <Smartphone className="text-kleanly h-3.5 w-3.5" />
                                <span>Solo app móvil</span>
                              </>
                            ) : (
                              <>
                                <Layers className="text-primary-ink h-3.5 w-3.5" />
                                <span>Panel web + Móvil</span>
                              </>
                            )}
                          </div>

                          <div className="text-ink-muted flex items-center gap-1 text-[10px]">
                            {member.accessMethods.includes("google") && (
                              <span className="bg-surface-sunken border-line rounded border px-1">
                                Google
                              </span>
                            )}
                            {member.accessMethods.includes("microsoft") && (
                              <span className="bg-surface-sunken border-line rounded border px-1">
                                MS
                              </span>
                            )}
                            {member.accessMethods.includes("whatsapp") && (
                              <span className="bg-surface-sunken border-line rounded border px-1">
                                WhatsApp
                              </span>
                            )}
                            {member.accessMethods.includes("pin") && (
                              <span className="bg-surface-sunken border-line rounded border px-1 font-mono">
                                PIN
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* ESTADO */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {member.status === "active" ? (
                          <div className="flex items-center gap-1.5">
                            <span className="bg-success-soft text-success-ink border-success/30 rounded-pill inline-flex items-center gap-1 border px-2.5 py-0.5 text-xs font-bold">
                              <span className="bg-success h-1.5 w-1.5 rounded-full" />
                              <span>Activa</span>
                            </span>
                          </div>
                        ) : member.status === "pending" ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="bg-warning-soft text-warning-ink border-warning/30 rounded-pill inline-flex items-center gap-1 border px-2.5 py-0.5 text-xs font-bold">
                              <span className="bg-warning h-1.5 w-1.5 rounded-full" />
                              <span>Pendiente</span>
                            </span>
                            <span className="text-ink-muted pl-1 text-[10px]">
                              Aún no ingresa
                            </span>
                          </div>
                        ) : (
                          <span className="bg-surface-sunken text-ink-muted border-line rounded-pill inline-flex items-center gap-1 border px-2.5 py-0.5 text-xs font-medium">
                            <Ban className="h-3 w-3" />
                            <span>Suspendida</span>
                          </span>
                        )}
                      </td>

                      {/* ACCIONES */}
                      <td className="relative px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              alert(`Editar perfil de ${member.fullName}`)
                            }
                            className="border-line bg-surface-sunken hover:bg-surface-raised hover:text-primary text-ink-muted cursor-pointer rounded-md border p-1.5 transition-colors"
                            title="Editar datos de colaborador"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveMenuId(
                                  activeMenuId === member.id ? null : member.id,
                                )
                              }
                              className="border-line bg-surface-sunken hover:bg-surface-raised hover:text-primary text-ink-muted cursor-pointer rounded-md border p-1.5 transition-colors"
                              title="Más opciones"
                            >
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </button>

                            {activeMenuId === member.id && (
                              <div className="border-line bg-surface-raised animate-sc-in absolute top-full right-0 z-30 mt-1 w-44 rounded-xl border p-1 text-left text-xs shadow-lg">
                                <button
                                  type="button"
                                  onClick={() => {
                                    alert(
                                      `Reenviando invitación a ${member.email}`,
                                    );
                                    setActiveMenuId(null);
                                  }}
                                  className="hover:bg-surface-sunken text-ink flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                                >
                                  Reenviar invitación
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleMemberStatus(member.id)}
                                  className="hover:bg-surface-sunken text-ink flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                                >
                                  {member.status === "suspended"
                                    ? "Reactivar acceso"
                                    : "Suspender acceso"}
                                </button>
                              </div>
                            )}
                          </div>
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
    </div>
  );
}
