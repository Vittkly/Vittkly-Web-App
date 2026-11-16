"use client";

import React, { useMemo, useState } from "react";
import { Lock } from "lucide-react";
import {
  CANONICAL_MODULE_CODES,
  getRequiredPlanBadgeLabel,
  normalizeModuleCodesToCanonical,
  type CanonicalModuleCode,
  type PlanCode,
} from "@vittkly/shared";
import { DashboardModuleIcon } from "@/features/dashboard/components/module-icons";
import { saveProfileAction } from "../actions/users-profiles.actions";
import {
  PROFILE_MODULES_CATALOG,
  RESTRICTION_FIELDS_META,
  type CompanyProfile,
  type ProfileConfiguration,
  type RestrictionKey,
  type RestrictionScope,
} from "../types/settings.types";

const BLANK_CONFIGURATION: ProfileConfiguration = {
  modulos: ["calendario", "trabajos"],
  opciones: {
    ve_precios_montos: false,
    valida_servicios: false,
    es_personal_campo: false,
  },
  restricciones: {
    ver_montos_cotizaciones: "ninguna",
    editar_cotizaciones: "ninguna",
    eliminar_cotizaciones: "ninguna",
    programar_reprogramar: "ninguna",
    pagos_clientes: "ninguna",
    costeo_margenes: "ninguna",
    cancelar_servicios: "ninguna",
  },
  descargar_archivos: false,
  aprueba_solicitudes: false,
  ocultar_datos_cliente: {
    telefonos: false,
    correos: false,
    documento: false,
    direccion: false,
  },
  horario_acceso: {
    restringido: false,
    inicio: "08:00",
    fin: "18:00",
  },
  dispositivo_acceso: "cualquiera",
};

export interface ProfileFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "duplicate" | "edit";
  sourceProfile: CompanyProfile | null;
  allProfiles: CompanyProfile[];
  activePlanCode?: PlanCode;
  allowedPlanModules?: CanonicalModuleCode[];
}

export function ProfileFormModal({
  isOpen,
  onClose,
  mode,
  sourceProfile,
  allProfiles,
  activePlanCode = "empresa",
  allowedPlanModules = [...CANONICAL_MODULE_CODES],
}: ProfileFormModalProps) {
  const allowedPlanSet = useMemo(
    () => new Set<CanonicalModuleCode>(allowedPlanModules),
    [allowedPlanModules],
  );

  const sanitizeModulesForPlan = (rawModulos: string[]) =>
    normalizeModuleCodesToCanonical(rawModulos).filter((code) =>
      allowedPlanSet.has(code),
    );

  const rawInitialConfig: ProfileConfiguration = sourceProfile
    ? JSON.parse(JSON.stringify(sourceProfile.configuracion))
    : JSON.parse(JSON.stringify(BLANK_CONFIGURATION));
  const initialConfig: ProfileConfiguration = {
    ...rawInitialConfig,
    modulos: sanitizeModulesForPlan(rawInitialConfig.modulos ?? []),
  };

  const [nombre, setNombre] = useState(
    mode === "edit" && sourceProfile
      ? sourceProfile.nombre
      : mode === "duplicate" && sourceProfile
        ? `${sourceProfile.nombre} (copia)`
        : "",
  );
  const [descripcion, setDescripcion] = useState(
    sourceProfile?.descripcion ?? "",
  );
  const [recomendadoPara, setRecomendadoPara] = useState(
    sourceProfile?.recomendadoPara ?? "",
  );
  const [copyFromId, setCopyFromId] = useState<string>(
    mode === "duplicate" && sourceProfile ? sourceProfile.id : "",
  );
  const [config, setConfig] = useState<ProfileConfiguration>(initialConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyFromChange = (selectedId: string) => {
    setCopyFromId(selectedId);
    if (!selectedId) {
      const blank = JSON.parse(
        JSON.stringify(BLANK_CONFIGURATION),
      ) as ProfileConfiguration;
      blank.modulos = sanitizeModulesForPlan(blank.modulos);
      setConfig(blank);
      return;
    }
    const found = allProfiles.find((p) => p.id === selectedId);
    if (found) {
      const cloned = JSON.parse(
        JSON.stringify(found.configuracion),
      ) as ProfileConfiguration;
      cloned.modulos = sanitizeModulesForPlan(cloned.modulos ?? []);
      setConfig(cloned);
      if (!descripcion.trim()) setDescripcion(found.descripcion);
      if (!recomendadoPara.trim()) setRecomendadoPara(found.recomendadoPara);
    }
  };

  const toggleModulo = (code: CanonicalModuleCode) => {
    if (!allowedPlanSet.has(code)) return;
    setConfig((prev) => {
      const exists = prev.modulos.includes(code);
      return {
        ...prev,
        modulos: exists
          ? prev.modulos.filter((m) => m !== code)
          : [...prev.modulos, code],
      };
    });
  };

  const updateRestriction = (key: RestrictionKey, scope: RestrictionScope) => {
    setConfig((prev) => ({
      ...prev,
      restricciones: {
        ...prev.restricciones,
        [key]: scope,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    const payloadConfig: ProfileConfiguration = {
      ...config,
      modulos: sanitizeModulesForPlan(config.modulos),
    };

    const res = await saveProfileAction({
      profileId: mode === "edit" && sourceProfile ? sourceProfile.id : null,
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      recomendadoPara: recomendadoPara.trim(),
      configuracion: payloadConfig,
    });

    setIsSaving(false);

    if (res.success) {
      onClose();
    } else {
      setError(res.error || "No se pudo guardar el perfil.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      className="bg-ink/60 animate-sc-in fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
    >
      <div className="border-line bg-surface-raised max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border p-6 shadow-2xl">
        <div className="border-line flex items-center justify-between border-b pb-3.5">
          <div>
            <h2
              id="profile-modal-title"
              className="text-ink font-sans text-base font-bold tracking-tight sm:text-lg"
            >
              {mode === "edit"
                ? `Editar perfil: ${sourceProfile?.nombre ?? ""}`
                : mode === "duplicate"
                  ? `Duplicar y personalizar: ${sourceProfile?.nombre ?? ""}`
                  : "Nuevo perfil personalizado"}
            </h2>
            <p className="text-ink-muted text-xs">
              Define qué módulos ve, qué acciones puede ejecutar y qué datos se
              ocultan
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-ink-muted hover:text-ink cursor-pointer rounded-md p-1 text-base leading-none transition-colors"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="border-danger/30 bg-danger-soft text-danger-ink mt-4 rounded-xl border p-3 text-xs font-semibold">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-4 flex flex-col gap-6 text-xs"
        >
          {/* 1. Datos generales y selector Copiar permisos de */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-ink-muted text-xs font-semibold tracking-wider uppercase">
                Nombre del perfil
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Supervisor Senior Zona Norte"
                className="border-line bg-surface-sunken text-ink focus:border-primary focus:bg-surface-raised rounded-xl border px-3.5 py-2 text-xs outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-ink-muted text-xs font-semibold tracking-wider uppercase">
                Copiar permisos de
              </label>
              <select
                value={copyFromId}
                onChange={(e) => handleCopyFromChange(e.target.value)}
                className="border-line bg-surface-sunken text-ink focus:border-primary rounded-xl border px-3 py-2 text-xs outline-none"
              >
                <option value="">— Empezar en blanco —</option>
                {allProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} {p.esBase ? "(Estándar)" : "(Personalizado)"}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-ink-muted text-xs font-semibold tracking-wider uppercase">
                Descripción (opcional)
              </label>
              <input
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Breve resumen de lo que hace este perfil"
                className="border-line bg-surface-sunken text-ink focus:border-primary rounded-xl border px-3.5 py-2 text-xs outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-ink-muted text-xs font-semibold tracking-wider uppercase">
                Recomendado para (opcional)
              </label>
              <input
                type="text"
                value={recomendadoPara}
                onChange={(e) => setRecomendadoPara(e.target.value)}
                placeholder="Ej. Coordinadores zonales y líderes de cuadrilla"
                className="border-line bg-surface-sunken text-ink focus:border-primary rounded-xl border px-3.5 py-2 text-xs outline-none"
              />
            </div>
          </div>

          {/* 2. Módulos que puede ver (19 módulos granulares individuales) */}
          <div className="border-line flex flex-col gap-3 border-t pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-ink text-sm font-bold">
                  Módulos que puede ver
                </h3>
                <p className="text-ink-muted text-[11px]">
                  Selecciona individualmente los módulos habilitados. Los
                  procesos del menú lateral se mostrarán automáticamente según
                  tus selecciones.
                </p>
              </div>
              <span className="border-line bg-surface-sunken text-ink-muted rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase">
                Plan {activePlanCode} · {allowedPlanModules.length}/19
                disponibles
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {PROFILE_MODULES_CATALOG.map((mod) => {
                const isPlanAllowed = allowedPlanSet.has(mod.code);
                const checked =
                  isPlanAllowed && config.modulos.includes(mod.code);
                const planBadge = !isPlanAllowed
                  ? getRequiredPlanBadgeLabel(mod.minPlan)
                  : null;

                return (
                  <label
                    key={mod.code}
                    aria-disabled={!isPlanAllowed}
                    className={`flex items-start gap-2.5 rounded-xl border p-3 transition-colors select-none ${
                      !isPlanAllowed
                        ? "border-line bg-surface-sunken/35 text-ink-muted cursor-not-allowed opacity-65"
                        : checked
                          ? "border-primary bg-primary-soft/40 text-ink cursor-pointer"
                          : "border-line bg-surface-sunken/50 text-ink-muted hover:text-ink cursor-pointer"
                    }`}
                  >
                    <input
                      type="checkbox"
                      disabled={!isPlanAllowed}
                      checked={checked}
                      onChange={() => toggleModulo(mod.code)}
                      className="text-primary focus:ring-primary mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded disabled:cursor-not-allowed"
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex min-w-0 items-center gap-1.5 font-bold">
                          <DashboardModuleIcon
                            iconKey={mod.iconKey}
                            className="text-primary-ink h-3.5 w-3.5 shrink-0"
                            strokeWidth={1.75}
                          />
                          <span className="truncate">{mod.label}</span>
                        </div>
                        <span className="border-line bg-surface-raised text-ink-muted shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-semibold">
                          {mod.processLabel}
                        </span>
                      </div>

                      <span className="text-ink-muted text-[10px] leading-snug">
                        {mod.description}
                      </span>

                      {planBadge && (
                        <span className="border-line bg-surface-raised text-ink-muted mt-0.5 inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold">
                          <Lock className="h-2.5 w-2.5 shrink-0" />
                          <span>{planBadge}</span>
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 3. Opciones */}
          <div className="border-line flex flex-col gap-2.5 border-t pt-4">
            <h3 className="text-ink text-sm font-bold">Opciones</h3>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <label className="border-line bg-surface-sunken/50 flex cursor-pointer items-center gap-2 rounded-xl border p-3 select-none">
                <input
                  type="checkbox"
                  checked={config.opciones.ve_precios_montos}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      opciones: {
                        ...prev.opciones,
                        ve_precios_montos: e.target.checked,
                      },
                    }))
                  }
                  className="text-primary h-4 w-4 rounded"
                />
                <span className="text-ink font-semibold">
                  Ve precios, montos y totales
                </span>
              </label>

              <label className="border-line bg-surface-sunken/50 flex cursor-pointer items-center gap-2 rounded-xl border p-3 select-none">
                <input
                  type="checkbox"
                  checked={config.opciones.valida_servicios}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      opciones: {
                        ...prev.opciones,
                        valida_servicios: e.target.checked,
                      },
                    }))
                  }
                  className="text-primary h-4 w-4 rounded"
                />
                <span className="text-ink font-semibold">
                  Valida los servicios que cierran los técnicos
                </span>
              </label>

              <label className="border-line bg-surface-sunken/50 flex cursor-pointer items-center gap-2 rounded-xl border p-3 select-none">
                <input
                  type="checkbox"
                  checked={config.opciones.es_personal_campo}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      opciones: {
                        ...prev.opciones,
                        es_personal_campo: e.target.checked,
                      },
                    }))
                  }
                  className="text-primary h-4 w-4 rounded"
                />
                <span className="text-ink font-semibold">
                  Es personal de campo
                </span>
              </label>
            </div>
          </div>

          {/* 4. Restricciones: qué puede ver y hacer */}
          <div className="border-line flex flex-col gap-3 border-t pt-4">
            <h3 className="text-ink text-sm font-bold">
              Restricciones: qué puede ver y hacer
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {RESTRICTION_FIELDS_META.map((field) => (
                <div
                  key={field.key}
                  className="border-line bg-surface-sunken/40 flex items-center justify-between gap-2 rounded-xl border px-3 py-2"
                >
                  <span className="text-ink font-semibold">{field.label}</span>
                  <select
                    value={config.restricciones[field.key]}
                    onChange={(e) =>
                      updateRestriction(
                        field.key,
                        e.target.value as RestrictionScope,
                      )
                    }
                    className="border-line bg-surface-raised text-ink focus:border-primary cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-semibold outline-none"
                  >
                    <option value="todas">Todos</option>
                    <option value="equipo">Su equipo</option>
                    <option value="propias">Solo las suyas</option>
                    <option value="ninguna">No puede</option>
                  </select>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-2.5 pt-1 sm:grid-cols-2">
              <label className="border-line bg-surface-sunken/50 flex cursor-pointer items-center gap-2 rounded-xl border p-3 select-none">
                <input
                  type="checkbox"
                  checked={config.descargar_archivos}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      descargar_archivos: e.target.checked,
                    }))
                  }
                  className="text-primary h-4 w-4 rounded"
                />
                <span className="text-ink font-semibold">
                  Puede descargar archivos (Excel y PDF)
                </span>
              </label>

              <label className="border-line bg-surface-sunken/50 flex cursor-pointer items-center gap-2 rounded-xl border p-3 select-none">
                <input
                  type="checkbox"
                  checked={config.aprueba_solicitudes}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      aprueba_solicitudes: e.target.checked,
                    }))
                  }
                  className="text-primary h-4 w-4 rounded"
                />
                <span className="text-ink font-semibold">
                  Aprueba solicitudes
                </span>
              </label>
            </div>
          </div>

          {/* 5. Datos del cliente que no ve */}
          <div className="border-line flex flex-col gap-2.5 border-t pt-4">
            <h3 className="text-ink text-sm font-bold">
              Datos del cliente que no ve
            </h3>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              <label className="border-line bg-surface-sunken/50 flex cursor-pointer items-center gap-2 rounded-xl border p-2.5 select-none">
                <input
                  type="checkbox"
                  checked={config.ocultar_datos_cliente.telefonos}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      ocultar_datos_cliente: {
                        ...prev.ocultar_datos_cliente,
                        telefonos: e.target.checked,
                      },
                    }))
                  }
                  className="text-primary h-4 w-4 rounded"
                />
                <span className="text-ink font-medium">
                  Ocultar teléfonos del cliente
                </span>
              </label>

              <label className="border-line bg-surface-sunken/50 flex cursor-pointer items-center gap-2 rounded-xl border p-2.5 select-none">
                <input
                  type="checkbox"
                  checked={config.ocultar_datos_cliente.correos}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      ocultar_datos_cliente: {
                        ...prev.ocultar_datos_cliente,
                        correos: e.target.checked,
                      },
                    }))
                  }
                  className="text-primary h-4 w-4 rounded"
                />
                <span className="text-ink font-medium">
                  Ocultar correos del cliente
                </span>
              </label>

              <label className="border-line bg-surface-sunken/50 flex cursor-pointer items-center gap-2 rounded-xl border p-2.5 select-none">
                <input
                  type="checkbox"
                  checked={config.ocultar_datos_cliente.documento}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      ocultar_datos_cliente: {
                        ...prev.ocultar_datos_cliente,
                        documento: e.target.checked,
                      },
                    }))
                  }
                  className="text-primary h-4 w-4 rounded"
                />
                <span className="text-ink font-medium">Ocultar DNI / RUC</span>
              </label>

              <label className="border-line bg-surface-sunken/50 flex cursor-pointer items-center gap-2 rounded-xl border p-2.5 select-none">
                <input
                  type="checkbox"
                  checked={config.ocultar_datos_cliente.direccion}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      ocultar_datos_cliente: {
                        ...prev.ocultar_datos_cliente,
                        direccion: e.target.checked,
                      },
                    }))
                  }
                  className="text-primary h-4 w-4 rounded"
                />
                <span className="text-ink font-medium">
                  Ocultar dirección exacta
                </span>
              </label>
            </div>
          </div>

          {/* 6. Horario y dispositivo de acceso */}
          <div className="border-line flex flex-col gap-3 border-t pt-4">
            <h3 className="text-ink text-sm font-bold">
              Horario y dispositivo de acceso
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="border-line bg-surface-sunken/40 flex flex-col gap-2.5 rounded-xl border p-3">
                <label className="flex cursor-pointer items-center gap-2 select-none">
                  <input
                    type="checkbox"
                    checked={config.horario_acceso.restringido}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        horario_acceso: {
                          ...prev.horario_acceso,
                          restringido: e.target.checked,
                        },
                      }))
                    }
                    className="text-primary h-4 w-4 rounded"
                  />
                  <span className="text-ink font-semibold">
                    Solo puede entrar en un horario
                  </span>
                </label>

                {config.horario_acceso.restringido && (
                  <div className="flex items-center gap-2 pt-1 font-mono text-xs tabular-nums">
                    <input
                      type="time"
                      value={config.horario_acceso.inicio}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          horario_acceso: {
                            ...prev.horario_acceso,
                            inicio: e.target.value,
                          },
                        }))
                      }
                      className="border-line bg-surface-raised text-ink rounded-lg border px-2 py-1"
                    />
                    <span className="text-ink-muted">a</span>
                    <input
                      type="time"
                      value={config.horario_acceso.fin}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          horario_acceso: {
                            ...prev.horario_acceso,
                            fin: e.target.value,
                          },
                        }))
                      }
                      className="border-line bg-surface-raised text-ink rounded-lg border px-2 py-1"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-ink-muted text-xs font-semibold tracking-wider uppercase">
                  Dispositivo
                </label>
                <select
                  value={config.dispositivo_acceso}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      dispositivo_acceso: e.target
                        .value as ProfileConfiguration["dispositivo_acceso"],
                    }))
                  }
                  className="border-line bg-surface-sunken text-ink focus:border-primary rounded-xl border px-3 py-2 text-xs outline-none"
                >
                  <option value="cualquiera">Cualquier dispositivo</option>
                  <option value="solo_web">Solo computadora (web)</option>
                  <option value="solo_app">Solo celular (app)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 7. Botones Guardar perfil y Cancelar */}
          <div className="border-line mt-1 flex items-center justify-start gap-3 border-t pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-primary hover:bg-primary-hover cursor-pointer rounded-xl px-4 py-2 text-xs font-bold text-white transition-colors disabled:opacity-50"
            >
              {isSaving ? "Guardando perfil..." : "Guardar perfil"}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="text-ink-muted hover:text-ink cursor-pointer px-2 py-2 text-xs font-semibold"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
