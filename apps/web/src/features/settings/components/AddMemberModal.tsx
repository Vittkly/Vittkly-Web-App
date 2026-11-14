"use client";

import React, { useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import {
  createInvitationAction,
  lookupPersonByDocumentAction,
  type DocumentLookupResult,
  type GeneratedInvitationPayload,
} from "../actions/users-profiles.actions";
import type {
  AccessLabel,
  CompanyProfile,
  DocumentType,
} from "../types/settings.types";

export interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: CompanyProfile[];
  companyName?: string;
  onInvitationCreated: (invitation: GeneratedInvitationPayload) => void;
}

const ACCESS_HINTS: Record<AccessLabel, string> = {
  "Solo web":
    "Trabaja desde la computadora (Google, Microsoft o WhatsApp); no usa la app móvil.",
  "Web y app":
    "Accede tanto a la central web administrativa como a la app móvil de campo.",
  "Solo app":
    "Accede exclusivamente desde el teléfono móvil con WhatsApp y PIN de 4 dígitos.",
};

export function AddMemberModal({
  isOpen,
  onClose,
  profiles,
  companyName = "tu empresa",
  onInvitationCreated,
}: AddMemberModalProps) {
  const defaultProfileId =
    profiles.find((p) => p.nombre.toLowerCase() === "ventas")?.id ||
    profiles[0]?.id ||
    "";

  const [docType, setDocType] = useState<DocumentType>("DNI");
  const [docNumber, setDocNumber] = useState("");
  const [lookupState, setLookupState] = useState<DocumentLookupResult | null>(
    null,
  );
  const [isLookingUp, setIsLookingUp] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [countryPrefix, setCountryPrefix] = useState("+51");
  const [phone, setPhone] = useState("");
  const [perfilId, setPerfilId] = useState(defaultProfileId);
  const [jobTitle, setJobTitle] = useState("");
  const [accessLabel, setAccessLabel] = useState<AccessLabel>("Solo web");
  const [notifyNow, setNotifyNow] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeProfileId = perfilId || defaultProfileId;
  const selectedProfile = profiles.find((p) => p.id === activeProfileId);

  const triggerDocumentLookup = async (
    nextDocType: DocumentType,
    nextDocNumber: string,
  ) => {
    const clean = nextDocNumber.trim();
    if (clean.length < 6) {
      setLookupState(null);
      return;
    }
    setIsLookingUp(true);
    setError(null);
    const res = await lookupPersonByDocumentAction({
      docType: nextDocType,
      docNumber: clean,
    });
    setIsLookingUp(false);
    if (res.success && res.data) {
      setLookupState(res.data);
    }
  };

  const handleDocNumberChange = (val: string) => {
    setDocNumber(val);
    if (docType === "DNI" && val.trim().length === 8) {
      void triggerDocumentLookup(docType, val);
    } else if (val.trim().length < 6) {
      setLookupState(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (lookupState?.alreadyMember) {
      setError(
        "Esta persona ya forma parte activa del equipo de esta empresa.",
      );
      return;
    }

    setIsSubmitting(true);

    const isExistingAccount = Boolean(
      lookupState?.found && lookupState.usuarioId,
    );
    const formattedPhone = phone.trim()
      ? `${countryPrefix}${phone.trim().replace(/\s+/g, "")}`
      : "";

    const res = await createInvitationAction({
      tipo: isExistingAccount ? "cuenta_existente" : "nueva_cuenta",
      usuarioId: isExistingAccount ? lookupState?.usuarioId : null,
      docType,
      docNumber: docNumber.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: formattedPhone,
      perfilId: activeProfileId,
      jobTitle: jobTitle.trim(),
      accessLabel,
      notifyNow,
    });

    setIsSubmitting(false);

    if (res.success && res.data) {
      onInvitationCreated(res.data);
      onClose();
    } else {
      setError(res.error || "Ocurrió un error al registrar la invitación.");
    }
  };

  const isExistingUserFound = Boolean(
    lookupState?.found && lookupState.usuarioId,
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="person-data-title"
      className="bg-ink/60 animate-sc-in fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
    >
      <div className="border-line bg-surface-raised max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border p-6 shadow-2xl">
        <div className="border-line flex items-center justify-between border-b pb-3.5">
          <div>
            <h2
              id="person-data-title"
              className="text-ink font-sans text-base font-bold tracking-tight sm:text-lg"
            >
              Agregar persona a {companyName}
            </h2>
            <p className="text-ink-muted text-xs">
              Verifica el documento de identidad y asigna su perfil de acceso
            </p>
          </div>

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
          <div className="border-danger/30 bg-danger-soft text-danger-ink mt-4 rounded-xl border p-3 text-xs font-semibold">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-4 flex flex-col gap-4 text-xs"
        >
          {/* 1. Documento de identidad con búsqueda automática */}
          <div className="flex flex-col gap-1.5">
            <label className="text-ink-muted text-xs font-semibold tracking-wider uppercase">
              Documento de identidad
            </label>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12">
              <select
                value={docType}
                onChange={(e) => {
                  const nextType = e.target.value as DocumentType;
                  setDocType(nextType);
                  setLookupState(null);
                }}
                className="border-line bg-surface-sunken text-ink focus:border-primary focus:bg-surface-raised cursor-pointer rounded-xl border px-3 py-2 text-xs outline-none sm:col-span-5"
              >
                <option value="DNI">DNI</option>
                <option value="carné de extranjería">
                  CE (Carné extranjería)
                </option>
                <option value="pasaporte">Pasaporte</option>
              </select>

              <div className="relative flex sm:col-span-7">
                <input
                  type="text"
                  required
                  value={docNumber}
                  onChange={(e) => handleDocNumberChange(e.target.value)}
                  onBlur={() => {
                    if (docNumber.trim().length >= 6) {
                      void triggerDocumentLookup(docType, docNumber);
                    }
                  }}
                  placeholder={
                    docType === "DNI" ? "8 dígitos" : "Número de documento"
                  }
                  className="border-line bg-surface-sunken text-ink placeholder:text-ink-muted focus:border-primary focus:bg-surface-raised w-full rounded-xl border py-2 pr-20 pl-3.5 font-mono text-xs tabular-nums transition-colors outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    void triggerDocumentLookup(docType, docNumber.trim())
                  }
                  disabled={isLookingUp || docNumber.trim().length < 5}
                  className="text-primary-ink hover:bg-primary-soft absolute top-1/2 right-1.5 inline-flex -translate-y-1/2 cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition-colors disabled:opacity-40"
                >
                  <Search className="h-3 w-3" />
                  <span>{isLookingUp ? "..." : "Validar"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. Si existe cuenta en Vittkly: aviso con datos enmascarados */}
          {isExistingUserFound && lookupState && (
            <div className="border-primary/30 bg-primary-soft/50 flex flex-col gap-1.5 rounded-xl border p-3.5">
              <div className="text-primary-ink flex items-center gap-1.5 font-bold">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Ya existe un usuario registrado con ese documento</span>
              </div>
              <p className="text-ink-muted text-[11px] leading-relaxed">
                Por privacidad se muestran datos protegidos:{" "}
                <b className="text-ink font-mono">{lookupState.maskedName}</b> ·{" "}
                <b className="text-ink font-mono">{lookupState.maskedEmail}</b>
                {lookupState.maskedPhone ? (
                  <>
                    {" "}
                    ·{" "}
                    <b className="text-ink font-mono tabular-nums">
                      {lookupState.maskedPhone}
                    </b>
                  </>
                ) : null}
                . Se le enviará una invitación directa para vincularse a tu
                empresa.
              </p>
            </div>
          )}

          {/* 3. Si es cuenta nueva: Nombres, Apellidos, Correo y Celular WhatsApp */}
          {!isExistingUserFound && (
            <>
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
                  <div className="flex gap-1.5">
                    <select
                      value={countryPrefix}
                      onChange={(e) => setCountryPrefix(e.target.value)}
                      aria-label="Código de país"
                      className="border-line bg-surface-sunken text-ink focus:border-primary w-24 shrink-0 cursor-pointer rounded-xl border px-2 py-2 font-mono text-xs tabular-nums outline-none"
                    >
                      <option value="+51">+51 Perú</option>
                      <option value="+56">+56 Chile</option>
                      <option value="+57">+57 Col</option>
                      <option value="+52">+52 Méx</option>
                    </select>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="987 654 321"
                      className="border-line bg-surface-sunken text-ink placeholder:text-ink-muted focus:border-primary focus:bg-surface-raised min-w-0 flex-1 rounded-xl border px-3 py-2 font-mono text-xs tabular-nums transition-colors outline-none"
                    />
                  </div>
                  <span className="text-ink-muted text-[11px] leading-tight">
                    Con este número entra con WhatsApp
                  </span>
                </div>
              </div>
            </>
          )}

          {/* 4. Perfil y Cargo (opcional) */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-ink-muted text-xs font-semibold tracking-wider uppercase">
                Perfil
              </label>
              <select
                value={activeProfileId}
                onChange={(e) => setPerfilId(e.target.value)}
                className="border-line bg-surface-sunken text-ink focus:border-primary focus:bg-surface-raised cursor-pointer rounded-xl border px-3 py-2 text-xs transition-colors outline-none"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} {p.esBase ? "(Estándar)" : "(Personalizado)"}
                  </option>
                ))}
              </select>
              {selectedProfile && (
                <p className="text-ink-muted text-[11px] leading-relaxed">
                  {selectedProfile.descripcion}
                </p>
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
                placeholder="Ej. Asesora comercial"
                className="border-line bg-surface-sunken text-ink placeholder:text-ink-muted focus:border-primary focus:bg-surface-raised rounded-xl border px-3.5 py-2 text-xs transition-colors outline-none"
              />
            </div>
          </div>

          {/* 5. Dónde puede entrar */}
          <div className="border-line/60 flex flex-col gap-2 border-t pt-3">
            <label className="text-ink-muted text-xs font-semibold tracking-wider uppercase">
              Dónde puede entrar
            </label>
            <select
              value={accessLabel}
              onChange={(e) => setAccessLabel(e.target.value as AccessLabel)}
              className="border-line bg-surface-sunken text-ink focus:border-primary focus:bg-surface-raised cursor-pointer rounded-xl border px-3 py-2 text-xs transition-colors outline-none"
            >
              <option value="Solo web">Solo web</option>
              <option value="Solo app">Solo app</option>
              <option value="Web y app">Web y app</option>
            </select>
            <p className="text-ink-muted text-[11px] leading-tight">
              {ACCESS_HINTS[accessLabel]}
            </p>
          </div>

          {/* 6. Checkbox de notificación */}
          <div className="border-line bg-surface-sunken/60 flex flex-col gap-1 rounded-xl border p-3">
            <label className="flex cursor-pointer items-center gap-2 select-none">
              <input
                type="checkbox"
                checked={notifyNow}
                onChange={(e) => setNotifyNow(e.target.checked)}
                className="text-primary focus:ring-primary border-line-strong h-4 w-4 cursor-pointer rounded"
              />
              <span className="text-ink text-xs font-semibold">
                Preparar enlace de invitación y aviso inmediato
              </span>
            </label>
            <p className="text-ink-muted pl-6 text-[11px]">
              Genera un enlace único vigente por 7 días listo para enviar por
              WhatsApp o correo.
            </p>
          </div>

          {/* 7. Botones de acción */}
          <div className="border-line mt-1 flex items-center justify-start gap-3 border-t pt-4">
            <button
              type="submit"
              disabled={isSubmitting || Boolean(lookupState?.alreadyMember)}
              className="bg-primary hover:bg-primary-hover cursor-pointer rounded-xl px-4 py-2 text-xs font-bold text-white transition-colors active:opacity-90 disabled:opacity-40"
            >
              {isSubmitting
                ? "Enviando invitación..."
                : isExistingUserFound
                  ? "Enviar invitación"
                  : "Registrar y enviar invitación"}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-ink-muted hover:text-ink cursor-pointer px-2 py-2 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
