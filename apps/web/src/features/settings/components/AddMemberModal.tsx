"use client";

import React, { useState } from "react";
import {
  addTeamMemberAction,
  type NewMemberInput,
} from "../actions/users-profiles.actions";
import type { TeamMember } from "../types/settings.types";

export interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMemberAdded: (member: TeamMember) => void;
  companyName?: string;
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  Ventas:
    "Cotiza, atiende clientes, programa trabajos y hace seguimiento. No ve Dashboard, Finanzas, Reportes ni Configuraciones.",
  Administrador:
    "Acceso total a todos los módulos, configuraciones, finanzas y reportes de la empresa.",
  Técnico:
    "Solo ve sus trabajos asignados, marcaciones de tiempo y hojas de servicio en la app móvil.",
  Supervisor:
    "Supervisa trabajos en campo, valida servicios realizados y gestiona cuadrillas operativas.",
};

const ACCESS_HINTS: Record<string, string> = {
  web: "Trabaja desde la computadora; no usa la app.",
  both: "Accede tanto a la central web como a la app móvil de campo.",
  mobile: "Accede exclusivamente desde el teléfono móvil para trabajo en ruta.",
};

export function AddMemberModal({
  isOpen,
  onClose,
  onMemberAdded,
}: AddMemberModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<
    "Ventas" | "Administrador" | "Técnico" | "Supervisor"
  >("Ventas");
  const [jobTitle, setJobTitle] = useState("");
  const [accessScope, setAccessScope] = useState<"web" | "mobile" | "both">(
    "web",
  );
  const [prepareInvite, setPrepareInvite] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    const payload: NewMemberInput = {
      fullName,
      email: email.trim(),
      phone: phone.trim(),
      role,
      accessScope,
    };

    const res = await addTeamMemberAction(payload);
    setIsSubmitting(false);

    if (res.success && res.data) {
      onMemberAdded({
        id: res.data.id,
        userId: `usr-${Date.now()}`,
        fullName: res.data.fullName,
        email: res.data.email,
        phone: res.data.phone,
        avatarUrl: null,
        role: res.data.role,
        jobTitle: jobTitle.trim() || undefined,
        isOwner: false,
        isCurrentUser: false,
        accessScope: res.data.accessScope,
        accessMethods: ["whatsapp", "google"],
        status: "pending",
        statusLabel: "Aún no ingresa",
        createdAt: new Date().toISOString(),
      });
      onClose();
    } else {
      setError(res.error || "Ocurrió un error al registrar a la persona");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="person-data-title"
      className="bg-ink/60 animate-sc-in fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
    >
      <div className="border-line bg-surface-raised flex w-full max-w-lg flex-col gap-5 rounded-2xl border p-6 shadow-2xl">
        {/* 1. Cabecera del Modal (Sin ícono junto al título, ✕ discreto) */}
        <div className="border-line flex items-center justify-between border-b pb-3.5">
          <h2
            id="person-data-title"
            className="text-ink font-sans text-base font-semibold tracking-tight sm:text-lg"
          >
            Datos de la persona
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-ink-muted hover:text-ink cursor-pointer rounded-md p-1 text-base leading-none transition-colors"
            title="Cerrar"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="border-danger/30 bg-danger-soft text-danger-ink rounded-xl border p-3 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {/* Fila 1 (2 columnas): NOMBRES / APELLIDOS */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-ink-muted text-xs font-semibold tracking-wider uppercase">
                Nombres
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ej. María Elena"
                className="border-line bg-surface-sunken text-ink placeholder:text-ink-muted focus:border-primary focus:bg-surface-raised rounded-xl border px-3.5 py-2 text-xs transition-colors outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-ink-muted text-xs font-semibold tracking-wider uppercase">
                Apellidos
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Ej. Rojas Paredes"
                className="border-line bg-surface-sunken text-ink placeholder:text-ink-muted focus:border-primary focus:bg-surface-raised rounded-xl border px-3.5 py-2 text-xs transition-colors outline-none"
              />
            </div>
          </div>

          {/* Fila 2 (2 columnas): CORREO / CELULAR (WHATSAPP) */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-ink-muted text-xs font-semibold tracking-wider uppercase">
                Correo
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@empresa.com"
                className="border-line bg-surface-sunken text-ink placeholder:text-ink-muted focus:border-primary focus:bg-surface-raised rounded-xl border px-3.5 py-2 text-xs transition-colors outline-none"
              />
              <span className="text-ink-muted text-[11px] leading-tight">
                Con este correo entra con Google o Microsoft
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-ink-muted text-xs font-semibold tracking-wider uppercase">
                Celular (WhatsApp)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9xx xxx xxx"
                className="border-line bg-surface-sunken text-ink placeholder:text-ink-muted focus:border-primary focus:bg-surface-raised rounded-xl border px-3.5 py-2 font-mono text-xs transition-colors outline-none"
              />
              <span className="text-ink-muted text-[11px] leading-tight">
                Con este número entra con WhatsApp
              </span>
            </div>
          </div>

          {/* Fila 3 (2 columnas): PERFIL / CARGO (OPCIONAL) */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-ink-muted text-xs font-semibold tracking-wider uppercase">
                Perfil
              </label>
              <select
                value={role}
                onChange={(e) =>
                  setRole(
                    e.target.value as
                      "Ventas" | "Administrador" | "Técnico" | "Supervisor",
                  )
                }
                className="border-line bg-surface-sunken text-ink focus:border-primary focus:bg-surface-raised cursor-pointer rounded-xl border px-3 py-2 text-xs transition-colors outline-none"
              >
                <option value="Ventas">Ventas</option>
                <option value="Administrador">Administrador</option>
                <option value="Técnico">Técnico</option>
                <option value="Supervisor">Supervisor</option>
              </select>
              <p className="text-ink-muted text-[11px] leading-relaxed">
                {ROLE_DESCRIPTIONS[role]}
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-ink-muted text-xs font-semibold tracking-wider uppercase">
                Cargo (opcional)
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Ej. Asesora comercial"
                className="border-line bg-surface-sunken text-ink placeholder:text-ink-muted focus:border-primary focus:bg-surface-raised rounded-xl border px-3.5 py-2 text-xs transition-colors outline-none"
              />
            </div>
          </div>

          {/* Sección Acceso */}
          <div className="border-line/60 flex flex-col gap-2.5 border-t pt-3">
            <h3 className="text-ink text-sm font-semibold">Acceso</h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-ink-muted text-xs font-semibold tracking-wider uppercase">
                Dónde puede entrar
              </label>
              <select
                value={accessScope}
                onChange={(e) =>
                  setAccessScope(e.target.value as "web" | "mobile" | "both")
                }
                className="border-line bg-surface-sunken text-ink focus:border-primary focus:bg-surface-raised cursor-pointer rounded-xl border px-3 py-2 text-xs transition-colors outline-none"
              >
                <option value="web">Solo web (recomendado)</option>
                <option value="both">App móvil y web</option>
                <option value="mobile">Solo app móvil</option>
              </select>
              <p className="text-ink-muted text-[11px] leading-tight">
                {ACCESS_HINTS[accessScope]}
              </p>
            </div>
          </div>

          {/* Opciones de Invitación */}
          <div className="border-line bg-surface-sunken/60 flex flex-col gap-1 rounded-xl border p-3">
            <label className="flex cursor-pointer items-center gap-2 select-none">
              <input
                type="checkbox"
                checked={prepareInvite}
                onChange={(e) => setPrepareInvite(e.target.checked)}
                className="text-primary focus:ring-primary border-line-strong h-4 w-4 cursor-pointer rounded"
              />
              <span className="text-ink text-xs font-semibold">
                Preparar el mensaje de invitación
              </span>
            </label>
            <p className="text-ink-muted pl-6 text-[11px]">
              Genera un código y un mensaje listo para enviar por WhatsApp o
              copiar.
            </p>
          </div>

          {/* 3. Botonera Inferior (Alineación: Botones situados a la izquierda) */}
          <div className="border-line mt-1 flex items-center justify-start gap-3 border-t pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary-hover cursor-pointer rounded-md px-4 py-2 text-xs font-semibold text-white transition-colors active:opacity-90 disabled:opacity-40"
            >
              {isSubmitting ? "Registrando..." : "Registrar persona"}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-ink-muted hover:text-ink cursor-pointer px-2 py-2 text-xs font-semibold transition-colors hover:bg-transparent"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
