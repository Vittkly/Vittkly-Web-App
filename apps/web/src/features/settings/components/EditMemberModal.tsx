"use client";

import React, { useState } from "react";
import { sanitizeDocumentInput } from "@vittkly/shared";
import { updateMemberDetailsAction } from "../actions/users-profiles.actions";
import type {
  AccessLabel,
  CompanyProfile,
  DocumentType,
  TeamMember,
} from "../types/settings.types";

export interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMember | null;
  profiles: CompanyProfile[];
}

export function EditMemberModal({
  isOpen,
  onClose,
  member,
  profiles,
}: EditMemberModalProps) {
  const [firstName, setFirstName] = useState(member?.firstName ?? "");
  const [lastName, setLastName] = useState(member?.lastName ?? "");
  const [phone, setPhone] = useState(member?.phone ?? "");
  const [docType, setDocType] = useState<DocumentType>(
    member?.docType ?? "DNI",
  );
  const [docNumber, setDocNumber] = useState("");
  const [perfilId, setPerfilId] = useState(
    member?.perfilId ?? profiles[0]?.id ?? "",
  );
  const [jobTitle, setJobTitle] = useState(member?.jobTitle ?? "");
  const [accessLabel, setAccessLabel] = useState<AccessLabel>(
    member?.accessLabel ?? "Web y app",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !member) return null;

  const isMemberActive = member.sourceType === "membresia";
  const isExistingAccountPending =
    member.sourceType === "invitacion" &&
    member.invitationType === "cuenta_existente";
  const isIdentityLocked = isMemberActive || isExistingAccountPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    const res = await updateMemberDetailsAction({
      id: member.id,
      sourceType: member.sourceType,
      userId: member.userId,
      invitationId: member.invitationId ?? null,
      firstName: isIdentityLocked ? "" : firstName.trim(),
      lastName: isIdentityLocked ? "" : lastName.trim() || firstName.trim(),
      phone: isIdentityLocked ? "" : phone.trim(),
      docType: isIdentityLocked ? null : docType,
      docNumber: isIdentityLocked ? "" : docNumber.trim(),
      perfilId: member.isOwner ? member.perfilId : perfilId,
      jobTitle: jobTitle.trim(),
      accessLabel: member.isOwner ? "Web y app" : accessLabel,
    });

    setIsSaving(false);

    if (res.success) {
      onClose();
    } else {
      setError(res.error || "No se pudieron guardar los cambios.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-member-title"
      className="bg-ink/60 animate-sc-in fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
    >
      <div className="border-line bg-surface-raised max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border p-6 shadow-2xl">
        <div className="border-line flex items-center justify-between border-b pb-3.5">
          <div>
            <h2
              id="edit-member-title"
              className="text-ink font-sans text-base font-bold tracking-tight sm:text-lg"
            >
              {isMemberActive
                ? "Editar miembro del equipo"
                : "Editar invitación pendiente"}
            </h2>
            <p className="text-ink-muted text-xs">
              {isMemberActive
                ? "Administra el perfil, cargo y accesos de este miembro en la empresa"
                : "Actualiza los datos preliminares de la invitación antes de su activación"}
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

        {isIdentityLocked && (
          <div className="border-primary/20 bg-primary-soft/50 text-ink mt-3.5 rounded-xl border p-3 text-xs leading-relaxed">
            <span className="text-primary-ink font-bold">
              {isExistingAccountPending
                ? "Cuenta existente protegida:"
                : "Cuenta personal Vittkly:"}
            </span>{" "}
            Los datos personales (nombres, correo, celular y documento)
            pertenecen a la cuenta global del colaborador y permanecen ocultos y
            bloqueados por privacidad. Aquí defines únicamente su rol, cargo y
            accesos en tu empresa.
          </div>
        )}

        {error && (
          <div className="border-danger/30 bg-danger-soft text-danger-ink mt-4 rounded-xl border p-3 text-xs font-semibold">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-4 flex flex-col gap-4 text-xs"
        >
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-ink-muted text-xs font-semibold tracking-wider uppercase">
                Nombres {isIdentityLocked && "(Protegido)"}
              </label>
              <input
                type="text"
                required={!isIdentityLocked}
                disabled={isIdentityLocked}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={`border-line rounded-xl border px-3.5 py-2 text-xs outline-none ${
                  isIdentityLocked
                    ? "bg-surface-sunken/60 text-ink-muted cursor-not-allowed"
                    : "bg-surface-sunken text-ink focus:border-primary focus:bg-surface-raised"
                }`}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-ink-muted text-xs font-semibold tracking-wider uppercase">
                Apellidos {isIdentityLocked && "(Protegido)"}
              </label>
              <input
                type="text"
                required={!isIdentityLocked}
                disabled={isIdentityLocked}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={`border-line rounded-xl border px-3.5 py-2 text-xs outline-none ${
                  isIdentityLocked
                    ? "bg-surface-sunken/60 text-ink-muted cursor-not-allowed"
                    : "bg-surface-sunken text-ink focus:border-primary focus:bg-surface-raised"
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-ink-muted text-xs font-semibold tracking-wider uppercase">
                Correo (Fijado)
              </label>
              <input
                type="text"
                value={member.email}
                disabled
                className="border-line bg-surface-sunken/50 text-ink-muted cursor-not-allowed rounded-xl border px-3.5 py-2 font-mono text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-ink-muted text-xs font-semibold tracking-wider uppercase">
                Celular {isIdentityLocked && "(Protegido)"}
              </label>
              <input
                type="tel"
                disabled={isIdentityLocked}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+51 987 654 321"
                className={`border-line rounded-xl border px-3.5 py-2 font-mono text-xs tabular-nums outline-none ${
                  isIdentityLocked
                    ? "bg-surface-sunken/60 text-ink-muted cursor-not-allowed"
                    : "bg-surface-sunken text-ink focus:border-primary focus:bg-surface-raised"
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-ink-muted text-xs font-semibold tracking-wider uppercase">
                Tipo de documento {isIdentityLocked && "(Fijo)"}
              </label>
              <select
                disabled={isIdentityLocked}
                value={docType}
                onChange={(e) => {
                  const next = e.target.value as DocumentType;
                  setDocType(next);
                  setDocNumber((prev) => sanitizeDocumentInput(next, prev));
                }}
                className={`border-line rounded-xl border px-3 py-2 text-xs outline-none ${
                  isIdentityLocked
                    ? "bg-surface-sunken/60 text-ink-muted cursor-not-allowed"
                    : "bg-surface-sunken text-ink focus:border-primary"
                }`}
              >
                <option value="DNI">DNI</option>
                <option value="carné de extranjería">
                  CE (Carné extranjería)
                </option>
                <option value="pasaporte">Pasaporte</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-ink-muted text-xs font-semibold tracking-wider uppercase">
                Documento{" "}
                {member.docNumberMasked ? `(${member.docNumberMasked})` : ""}
              </label>
              <input
                type="text"
                disabled={isIdentityLocked}
                value={docNumber}
                onChange={(e) =>
                  setDocNumber(sanitizeDocumentInput(docType, e.target.value))
                }
                placeholder={
                  isIdentityLocked
                    ? member.docNumberMasked || "Protegido por privacidad"
                    : "Número de documento"
                }
                className={`border-line rounded-xl border px-3.5 py-2 font-mono text-xs tabular-nums outline-none ${
                  isIdentityLocked
                    ? "bg-surface-sunken/60 text-ink-muted cursor-not-allowed"
                    : "bg-surface-sunken text-ink focus:border-primary"
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-ink-muted text-xs font-semibold tracking-wider uppercase">
                Perfil
              </label>
              {member.isOwner ? (
                <div className="border-line bg-surface-sunken/60 text-ink rounded-xl border px-3.5 py-2 text-xs font-bold">
                  Administrador (Propietario)
                </div>
              ) : (
                <select
                  value={perfilId}
                  onChange={(e) => setPerfilId(e.target.value)}
                  className="border-line bg-surface-sunken text-ink focus:border-primary rounded-xl border px-3 py-2 text-xs outline-none"
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-ink-muted text-xs font-semibold tracking-wider uppercase">
                Cargo (opcional)
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Ej. Supervisor operativo"
                className="border-line bg-surface-sunken text-ink focus:border-primary rounded-xl border px-3.5 py-2 text-xs outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-ink-muted text-xs font-semibold tracking-wider uppercase">
              Dónde puede entrar
            </label>
            {member.isOwner ? (
              <div className="border-line bg-surface-sunken/60 text-ink rounded-xl border px-3.5 py-2 text-xs font-bold">
                Web y app
              </div>
            ) : (
              <select
                value={accessLabel}
                onChange={(e) => setAccessLabel(e.target.value as AccessLabel)}
                className="border-line bg-surface-sunken text-ink focus:border-primary rounded-xl border px-3 py-2 text-xs outline-none"
              >
                <option value="Solo web">Solo web</option>
                <option value="Solo app">Solo app</option>
                <option value="Web y app">Web y app</option>
              </select>
            )}
          </div>

          <div className="border-line mt-1 flex items-center justify-start gap-3 border-t pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-primary hover:bg-primary-hover cursor-pointer rounded-xl px-4 py-2 text-xs font-bold text-white transition-colors disabled:opacity-50"
            >
              {isSaving ? "Guardando..." : "Guardar cambios"}
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
