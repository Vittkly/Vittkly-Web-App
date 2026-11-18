"use client";

import React, { useState } from "react";
import { Plus, Copy, Edit2, Trash2 } from "lucide-react";
import {
  CANONICAL_MODULE_CODES,
  type CanonicalModuleCode,
  type PlanCode,
} from "@vittkly/shared";
import { DashboardModuleIcon } from "@/features/dashboard/components/module-icons";
import { deleteProfileAction } from "../actions/users-profiles.actions";
import {
  PROFILE_MODULES_CATALOG,
  RESTRICTION_FIELDS_META,
  type CompanyProfile,
  type RestrictionScope,
} from "../types/settings.types";
import { ProfileFormModal } from "./ProfileFormModal";

export interface ProfilesPermissionsTabProps {
  profiles: CompanyProfile[];
  activePlanCode?: PlanCode;
  allowedPlanModules?: CanonicalModuleCode[];
}

export function ProfilesPermissionsTab({
  profiles,
  activePlanCode = "empresa",
  allowedPlanModules = [...CANONICAL_MODULE_CODES],
}: ProfilesPermissionsTabProps) {
  const [modalState, setModalState] = useState<{
    mode: "create" | "duplicate" | "edit";
    sourceProfile: CompanyProfile | null;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (profile: CompanyProfile) => {
    setError(null);
    if (profile.usageCount > 0) {
      setError(
        `No puedes eliminar el perfil «${profile.nombre}» porque tiene ${profile.usageCount} persona(s) asignada(s).`,
      );
      return;
    }
    setDeletingId(profile.id);
    const res = await deleteProfileAction(profile.id);
    setDeletingId(null);
    if (!res.success) {
      setError(res.error || "No se pudo eliminar el perfil.");
    }
  };

  const renderScopeCell = (scope: RestrictionScope) => {
    if (scope === "todas") {
      return (
        <span
          className="text-primary-ink font-mono text-sm font-bold"
          title="Todo"
        >
          ✓
        </span>
      );
    }
    if (scope === "equipo") {
      return (
        <span className="bg-primary-soft text-primary-ink border-primary/20 rounded-md border px-2 py-0.5 text-[10px] font-bold">
          Equipo
        </span>
      );
    }
    if (scope === "propias") {
      return (
        <span className="bg-warning-soft text-warning-ink border-warning/30 rounded-md border px-2 py-0.5 text-[10px] font-bold">
          Suyas
        </span>
      );
    }
    return (
      <span
        className="text-danger-ink font-mono text-sm font-bold"
        title="No puede"
      >
        ✗
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Cabecera y botón + Crear perfil */}
      <div className="border-line bg-surface-raised flex flex-col gap-5 rounded-2xl border p-5 shadow-xs sm:p-6">
        <div className="border-line flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-center">
          <div className="flex max-w-2xl flex-col gap-1">
            <h2 className="text-ink font-sans text-lg font-bold tracking-tight">
              Perfiles y permisos de la empresa
            </h2>
            <p className="text-ink-muted text-xs leading-relaxed">
              Los perfiles estándar vienen listos para usar. Si necesitas reglas
              especiales para tu operación, duplica cualquiera de ellos o crea
              un perfil personalizado desde cero.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setModalState({ mode: "create", sourceProfile: null })
            }
            className="bg-primary text-on-primary hover:bg-primary-hover inline-flex shrink-0 cursor-pointer items-center gap-1.5 self-start rounded-xl px-4 py-2.5 text-xs font-bold shadow-xs transition-colors sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Crear perfil</span>
          </button>
        </div>

        {error && (
          <div className="border-danger/30 bg-danger-soft text-danger-ink rounded-xl border p-3 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* 2. Grilla de Tarjetas de Perfiles */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile) => {
            const cfg = profile.configuracion;
            const allowedPlanSet = new Set(allowedPlanModules);
            const isFullAccess =
              allowedPlanModules.length > 0 &&
              allowedPlanModules.every((code) => cfg.modulos.includes(code));

            // Pills de capacidades activas en azul/cian
            const capabilityPills: string[] = [];
            if (isFullAccess) capabilityPills.push("Acceso total");
            if (cfg.opciones.ve_precios_montos) {
              capabilityPills.push("Ve precios y montos");
            }
            if (cfg.opciones.valida_servicios) {
              capabilityPills.push("Valida servicios");
            }
            if (cfg.opciones.es_personal_campo) {
              capabilityPills.push("Personal de campo");
            }

            // Pills de restricciones parciales en ámbar
            const restrictionPills: string[] = [];
            for (const field of RESTRICTION_FIELDS_META) {
              const scope = cfg.restricciones[field.key];
              if (scope === "propias") {
                restrictionPills.push(`${field.label}: solo las suyas`);
              } else if (scope === "equipo") {
                restrictionPills.push(`${field.label}: su equipo`);
              }
            }

            return (
              <div
                key={profile.id}
                className="border-line bg-surface flex flex-col justify-between gap-4 rounded-2xl border p-4 shadow-2xs transition-colors"
              >
                <div className="flex flex-col gap-3">
                  {/* Título + Badge ESTÁNDAR / PERSONALIZADO */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-ink font-sans text-base font-bold">
                      {profile.nombre}
                    </h3>
                    <span
                      className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                        profile.esBase
                          ? "bg-surface-sunken text-ink-muted border-line"
                          : "bg-primary-soft text-primary-ink border-primary/20"
                      }`}
                    >
                      {profile.esBase ? "ESTÁNDAR" : "PERSONALIZADO"}
                    </span>
                  </div>

                  {/* Descripción y Recomendado para */}
                  <div className="flex flex-col gap-1">
                    <p className="text-ink-muted text-xs leading-relaxed">
                      {profile.descripcion}
                    </p>
                    <p className="text-ink text-[11px]">
                      <span className="text-ink-muted font-semibold">
                        Recomendado para:{" "}
                      </span>
                      <span className="font-semibold">
                        {profile.recomendadoPara}
                      </span>
                    </p>
                  </div>

                  {/* Badges con íconos de módulos individuales habilitados (sin procesos contenedores) */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {PROFILE_MODULES_CATALOG.filter(
                      (m) =>
                        cfg.modulos.includes(m.code) &&
                        allowedPlanSet.has(m.code),
                    ).map((m) => (
                      <span
                        key={m.code}
                        className="border-line bg-surface-raised text-ink inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-semibold"
                      >
                        <DashboardModuleIcon
                          iconKey={m.iconKey}
                          className="text-primary-ink h-3 w-3 shrink-0"
                          strokeWidth={1.75}
                        />
                        <span>{m.label}</span>
                      </span>
                    ))}
                  </div>

                  {/* Pills de capacidades (azul/cian) y restricciones (ámbar) */}
                  {(capabilityPills.length > 0 ||
                    restrictionPills.length > 0) && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {capabilityPills.map((cap) => (
                        <span
                          key={cap}
                          className="bg-primary-soft text-primary-ink border-primary/20 rounded-pill border px-2.5 py-0.5 text-[10px] font-bold"
                        >
                          {cap}
                        </span>
                      ))}
                      {restrictionPills.slice(0, 3).map((rest) => (
                        <span
                          key={rest}
                          className="bg-warning-soft text-warning-ink border-warning/30 rounded-pill border px-2.5 py-0.5 text-[10px] font-bold"
                        >
                          {rest}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pie de la tarjeta: Conteo de uso + Botones de acción */}
                <div className="border-line flex flex-col gap-3 border-t pt-3">
                  <span className="text-ink-muted font-mono text-[11px] font-semibold tabular-nums">
                    {profile.usageCount > 0
                      ? `${profile.usageCount} persona(s) con este perfil`
                      : "Nadie lo usa todavía"}
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    {profile.esBase ? (
                      <button
                        type="button"
                        onClick={() =>
                          setModalState({
                            mode: "duplicate",
                            sourceProfile: profile,
                          })
                        }
                        className="border-line bg-surface-raised hover:bg-surface-sunken text-ink inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-colors"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        <span>Duplicar y personalizar</span>
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setModalState({
                              mode: "edit",
                              sourceProfile: profile,
                            })
                          }
                          className="bg-primary-soft text-primary-ink hover:bg-primary hover:text-on-primary inline-flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>Editar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setModalState({
                              mode: "duplicate",
                              sourceProfile: profile,
                            })
                          }
                          className="border-line bg-surface-raised hover:bg-surface-sunken text-ink inline-flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          <span>Duplicar</span>
                        </button>

                        <button
                          type="button"
                          disabled={
                            deletingId === profile.id || profile.usageCount > 0
                          }
                          onClick={() => void handleDelete(profile)}
                          title={
                            profile.usageCount > 0
                              ? "No se puede eliminar mientras tenga miembros activos"
                              : "Eliminar perfil personalizado"
                          }
                          className="border-line bg-surface-raised hover:bg-danger-soft text-danger-ink inline-flex cursor-pointer items-center justify-center rounded-xl border p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Eliminar</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Matriz de Restricciones (Parte Inferior) */}
      <div className="border-line bg-surface-raised flex flex-col gap-4 rounded-2xl border p-5 shadow-xs sm:p-6">
        <div className="flex flex-col gap-1">
          <h3 className="text-ink font-sans text-base font-bold sm:text-lg">
            Matriz comparativa de restricciones por perfil
          </h3>
          <p className="text-ink-muted text-xs">
            Alcance detallado de qué puede ver y hacer cada perfil dentro de la
            empresa.
          </p>
        </div>

        <div className="border-line overflow-x-auto rounded-xl border">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-line bg-surface-sunken/60 text-ink-muted border-b font-mono text-[10px] font-bold tracking-wider uppercase">
                <th className="px-3.5 py-3">PERFIL</th>
                {RESTRICTION_FIELDS_META.map((col) => (
                  <th key={col.key} className="px-3 py-3 text-center">
                    {col.shortHeader}
                  </th>
                ))}
                <th className="px-3 py-3 text-center">DESCARGAR EXCEL / PDF</th>
                <th className="px-3 py-3 text-center">APRUEBA SOLICITUDES</th>
              </tr>
            </thead>
            <tbody className="divide-line divide-y">
              {profiles.map((profile) => {
                const cfg = profile.configuracion;
                return (
                  <tr
                    key={`matrix-${profile.id}`}
                    className="hover:bg-surface-sunken/40 transition-colors"
                  >
                    <td className="px-3.5 py-3 font-bold whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-ink">{profile.nombre}</span>
                        {!profile.esBase && (
                          <span className="bg-primary-soft text-primary-ink rounded px-1.5 py-0.5 font-mono text-[9px] font-bold">
                            PERSONALIZADO
                          </span>
                        )}
                      </div>
                    </td>

                    {RESTRICTION_FIELDS_META.map((col) => (
                      <td
                        key={`${profile.id}-${col.key}`}
                        className="px-3 py-3 text-center whitespace-nowrap"
                      >
                        {renderScopeCell(cfg.restricciones[col.key])}
                      </td>
                    ))}

                    <td className="px-3 py-3 text-center">
                      {cfg.descargar_archivos ? (
                        <span className="text-success-ink font-mono text-sm font-bold">
                          ✓
                        </span>
                      ) : (
                        <span className="text-danger-ink font-mono text-sm font-bold">
                          ✗
                        </span>
                      )}
                    </td>

                    <td className="px-3 py-3 text-center">
                      {cfg.aprueba_solicitudes ? (
                        <span className="text-success-ink font-mono text-sm font-bold">
                          ✓
                        </span>
                      ) : (
                        <span className="text-danger-ink font-mono text-sm font-bold">
                          ✗
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Leyenda explicativa al pie de la tabla */}
        <div className="text-ink-muted flex flex-wrap items-center gap-4 pt-1 text-[11px]">
          <span className="inline-flex items-center gap-1.5">
            <b className="text-success-ink font-mono text-xs">✓</b>
            <span>Todos los registros de la empresa</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="bg-primary-soft text-primary-ink border-primary/20 rounded border px-1.5 py-0.5 text-[10px] font-bold">
              Equipo
            </span>
            <span>Solo los asignados a su cuadrilla o equipo</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="bg-warning-soft text-warning-ink border-warning/30 rounded border px-1.5 py-0.5 text-[10px] font-bold">
              Suyas
            </span>
            <span>Solo las creadas o atendidas por esa persona</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <b className="text-danger-ink font-mono text-xs">✗</b>
            <span>No tiene permiso</span>
          </span>
        </div>
      </div>

      {/* Modal Nuevo / Duplicar / Editar Perfil */}
      {modalState && (
        <ProfileFormModal
          key={`${modalState.mode}-${modalState.sourceProfile?.id ?? "new"}`}
          isOpen={Boolean(modalState)}
          onClose={() => setModalState(null)}
          mode={modalState.mode}
          sourceProfile={modalState.sourceProfile}
          allProfiles={profiles}
          activePlanCode={activePlanCode}
          allowedPlanModules={allowedPlanModules}
        />
      )}
    </div>
  );
}
