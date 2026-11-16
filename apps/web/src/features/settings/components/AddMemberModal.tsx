"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Lock,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  UserPlus,
} from "lucide-react";
import {
  ACCESS_LABELS,
  CANONICAL_DOCUMENT_TYPES,
  DOCUMENT_RULES,
  SUPPORTED_COUNTRY_DIAL_CODES,
  isValidDocumentNumber,
  isValidE164Phone,
  newAccountPersonDetailsSchema,
  normalizePhoneToE164,
  sanitizeDocumentInput,
  type CanonicalDocumentType,
} from "@vittkly/shared";
import {
  createInvitationAction,
  lookupPersonByDocumentAction,
  resendInvitationAction,
} from "../actions/users-profiles.actions";
import type {
  AccessLabel,
  CompanyProfile,
  DocumentLookupResult,
  GeneratedInvitationPayload,
} from "../types/settings.types";

export interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: CompanyProfile[];
  companyName: string;
  onInvitationCreated: (invitation: GeneratedInvitationPayload) => void;
}

type ModalStep = "lookup" | "blocked" | "existing_user" | "new_user";

function formatEsPeDateTime(iso: string): string {
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
}

function formatEsPeDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

function formatRelativeDays(days: number): string {
  if (days <= 0) return "hoy";
  if (days === 1) return "hace 1 día";
  return `hace ${days} días`;
}

function formatRelativeHoursOrDays(hours: number, days: number): string {
  if (days >= 1) {
    return days === 1 ? "hace 1 día" : `hace ${days} días`;
  }
  if (hours <= 0) return "hace unos minutos";
  return hours === 1 ? "hace 1 hora" : `hace ${hours} horas`;
}

export function AddMemberModal({
  isOpen,
  onClose,
  profiles,
  companyName,
  onInvitationCreated,
}: AddMemberModalProps) {
  const [step, setStep] = useState<ModalStep>("lookup");
  const [docType, setDocType] = useState<CanonicalDocumentType>("DNI");
  const [docNumber, setDocNumber] = useState("");
  const [lookupResult, setLookupResult] = useState<DocumentLookupResult | null>(
    null,
  );

  // Campos para nueva_cuenta
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [countryPrefix, setCountryPrefix] = useState("+51");
  const [phone, setPhone] = useState("");

  // Campos de membresía / acceso en la empresa
  const [perfilId, setPerfilId] = useState(
    profiles.find((p) => p.codigo === "operador")?.id ?? profiles[0]?.id ?? "",
  );
  const [accessLabel, setAccessLabel] = useState<AccessLabel>("Web y app");
  const [jobTitle, setJobTitle] = useState("");

  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResendingExisting, setIsResendingExisting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentRule = DOCUMENT_RULES[docType];
  const isDocValid = isValidDocumentNumber(docType, docNumber);

  const resetToLookup = () => {
    setStep("lookup");
    setLookupResult(null);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setError(null);
  };

  const handleSelectDocType = (nextType: CanonicalDocumentType) => {
    setDocType(nextType);
    setDocNumber((prev) => sanitizeDocumentInput(nextType, prev));
    setError(null);
    if (step !== "lookup") {
      resetToLookup();
    }
  };

  const handleDocNumberChange = (rawValue: string) => {
    const sanitized = sanitizeDocumentInput(docType, rawValue);
    setDocNumber(sanitized);
    setError(null);
  };

  const handleLookup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);

    if (!isDocValid) {
      setError(currentRule.invalidMessage);
      return;
    }

    setIsLookingUp(true);
    const res = await lookupPersonByDocumentAction({
      docType,
      docNumber,
    });
    setIsLookingUp(false);

    if (!res.success || !res.data) {
      setError(
        res.error || "No se pudo verificar el documento en este momento.",
      );
      return;
    }

    setLookupResult(res.data);

    if (
      res.data.status === "ya_es_miembro" ||
      res.data.status === "invitacion_pendiente"
    ) {
      setStep("blocked");
      return;
    }

    if (res.data.status === "cuenta_existente") {
      setStep("existing_user");
      return;
    }

    setStep("new_user");
  };

  const handleResendPending = async (invitationId: string) => {
    setError(null);
    setIsResendingExisting(true);
    const res = await resendInvitationAction(invitationId);
    setIsResendingExisting(false);

    if (res.success && res.data) {
      onClose();
      onInvitationCreated(res.data);
      return;
    }

    setError(res.error || "No se pudo reenviar la invitación pendiente.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!perfilId) {
      setError("Selecciona un perfil de acceso para esta empresa.");
      return;
    }

    if (step === "new_user") {
      const parsedDetails = newAccountPersonDetailsSchema.safeParse({
        firstName,
        lastName,
        email,
        countryPrefix,
        phone,
      });

      if (!parsedDetails.success) {
        setError(
          parsedDetails.error.issues[0]?.message ||
            "Verifica los datos personales de la persona.",
        );
        return;
      }

      const normalizedE164 = normalizePhoneToE164(countryPrefix, phone);
      if (!isValidE164Phone(normalizedE164)) {
        setError(
          countryPrefix === "+51"
            ? "Ingresa un celular válido de Perú (9 dígitos iniciando en 9)."
            : "Ingresa un número de celular válido según el código de país.",
        );
        return;
      }
    }

    setIsSubmitting(true);
    const res = await createInvitationAction({
      docType,
      docNumber,
      perfilId,
      accessLabel,
      jobTitle: jobTitle.trim(),
      ...(step === "new_user"
        ? {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim().toLowerCase(),
            countryPrefix,
            phone: phone.trim(),
          }
        : {}),
    });
    setIsSubmitting(false);

    if (res.success && res.data) {
      onClose();
      onInvitationCreated(res.data);
    } else {
      setError(res.error || "No se pudo completar el registro e invitación.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-member-title"
      className="bg-ink/60 animate-sc-in fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
    >
      <div className="border-line bg-surface-raised max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border p-6 shadow-2xl">
        {/* Cabecera */}
        <div className="border-line flex items-center justify-between border-b pb-3.5">
          <div>
            <h2
              id="add-member-title"
              className="text-ink font-sans text-base font-bold tracking-tight sm:text-lg"
            >
              Agregar persona a {companyName}
            </h2>
            <p className="text-ink-muted text-xs">
              {step === "lookup"
                ? "Paso 1 de 2 · Verifica primero el documento de identidad"
                : step === "blocked"
                  ? "Verificación completada · Acceso ya registrado en la empresa"
                  : step === "existing_user"
                    ? "Paso 2 de 2 · Cuenta existente detectada (identidad protegida)"
                    : "Paso 2 de 2 · Registra los datos de la nueva persona"}
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

        {/* Paso 1: Consulta obligatoria por Documento de Identidad */}
        {step === "lookup" && (
          <form
            onSubmit={handleLookup}
            className="mt-5 flex flex-col gap-4 text-xs"
          >
            <div className="flex flex-col gap-2">
              <label className="text-ink-muted text-xs font-semibold tracking-wider uppercase">
                Tipo de documento de identidad *
              </label>

              <div className="grid grid-cols-3 gap-2">
                {CANONICAL_DOCUMENT_TYPES.map((typeOption) => {
                  const cfg = DOCUMENT_RULES[typeOption];
                  const isSelected = docType === typeOption;
                  return (
                    <button
                      key={typeOption}
                      type="button"
                      onClick={() => handleSelectDocType(typeOption)}
                      className={`cursor-pointer rounded-xl border px-3 py-2 text-center text-xs font-semibold transition-all ${
                        isSelected
                          ? "border-primary bg-primary-soft text-primary-ink shadow-xs"
                          : "border-line bg-surface-sunken text-ink-muted hover:text-ink"
                      }`}
                    >
                      {cfg.shortLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="lookup-doc-number"
                  className="text-ink-muted text-xs font-semibold tracking-wider uppercase"
                >
                  Número de {currentRule.label} *
                </label>
                <span
                  className={`font-mono text-[11px] font-semibold tabular-nums ${
                    isDocValid ? "text-primary-ink" : "text-ink-muted"
                  }`}
                >
                  {currentRule.counterLabel(docNumber.length)}
                </span>
              </div>

              <div className="relative flex items-center">
                <input
                  id="lookup-doc-number"
                  type="text"
                  autoFocus
                  inputMode={docType === "DNI" ? "numeric" : "text"}
                  autoComplete="off"
                  value={docNumber}
                  onChange={(e) => handleDocNumberChange(e.target.value)}
                  onPaste={(e) => {
                    e.preventDefault();
                    handleDocNumberChange(e.clipboardData.getData("text"));
                  }}
                  placeholder={
                    docType === "DNI"
                      ? "Ej. 10203040 (solo 8 dígitos)"
                      : docType === "carné de extranjería"
                        ? "Ej. CE00123456 (9 a 12 caracteres)"
                        : "Ej. PE1234567 (6 a 16 caracteres)"
                  }
                  className="border-line bg-surface-sunken text-ink focus:border-primary focus:bg-surface-raised w-full rounded-xl border px-3.5 py-2.5 pr-10 font-mono text-sm tracking-wide tabular-nums transition-colors outline-none"
                />
                {isDocValid && (
                  <CheckCircle2 className="text-primary-ink pointer-events-none absolute right-3 h-4 w-4" />
                )}
              </div>

              <p className="text-ink-muted text-[11px]">
                {docType === "DNI"
                  ? "Solo se aceptan 8 dígitos numéricos. Si la persona ya tiene cuenta en Vittkly, sus datos personales se mostrarán enmascarados."
                  : `${currentRule.invalidMessage} Si ya tiene cuenta en Vittkly, protegeremos sus datos personales.`}
              </p>
            </div>

            {error && (
              <div className="border-danger/30 bg-danger-soft text-danger-ink rounded-xl border p-3 text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="border-line mt-1 flex items-center justify-end gap-2.5 border-t pt-4">
              <button
                type="button"
                onClick={onClose}
                className="border-line bg-surface-sunken hover:bg-surface-raised text-ink-muted hover:text-ink cursor-pointer rounded-xl border px-4 py-2 text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={!isDocValid || isLookingUp}
                className="bg-primary text-on-primary hover:bg-primary-hover inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold shadow-xs transition-all disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLookingUp ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Verificando identidad...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-3.5 w-3.5" />
                    <span>Verificar documento</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Estado Bloqueado: ya_es_miembro o invitacion_pendiente con fechas reales de BD */}
        {step === "blocked" &&
          lookupResult &&
          (lookupResult.status === "ya_es_miembro" ||
            lookupResult.status === "invitacion_pendiente") && (
            <div className="mt-5 flex flex-col gap-4 text-xs">
              <div className="border-warning/30 bg-warning-soft/70 flex flex-col gap-3 rounded-2xl border p-4">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="text-warning-ink mt-0.5 h-5 w-5 shrink-0" />
                  <div className="flex flex-col gap-1">
                    <h3 className="text-ink text-sm font-bold">
                      {lookupResult.status === "ya_es_miembro"
                        ? lookupResult.membershipStatus === "desactivada"
                          ? "Esta persona tiene un acceso suspendido en la empresa"
                          : "Esta persona ya forma parte de la empresa"
                        : "Ya existe una invitación pendiente vigente"}
                    </h3>
                    <p className="text-ink text-xs">
                      Identidad verificada:{" "}
                      <strong className="font-semibold">
                        {lookupResult.maskedName}
                      </strong>{" "}
                      · Perfil:{" "}
                      <strong className="text-primary-ink font-semibold">
                        {lookupResult.roleName}
                      </strong>
                    </p>
                  </div>
                </div>

                {lookupResult.status === "ya_es_miembro" ? (
                  <div className="border-line bg-surface-raised/90 text-ink-muted flex flex-col gap-1 rounded-xl border p-3 text-[11px] leading-relaxed">
                    <span>
                      Registrado en esta empresa desde el{" "}
                      <strong className="text-ink font-mono tabular-nums">
                        {formatEsPeDate(lookupResult.registeredAt)}
                      </strong>{" "}
                      (
                      <strong className="text-ink tabular-nums">
                        {formatRelativeDays(lookupResult.daysSinceRegistration)}
                      </strong>
                      ).
                    </span>
                    <span>
                      {lookupResult.membershipStatus === "desactivada"
                        ? "Puedes reactivar su acceso directamente desde la tabla Personas."
                        : "No es necesario enviar una nueva invitación; puedes editar su perfil o canales en la tabla Personas."}
                    </span>
                  </div>
                ) : (
                  lookupResult.status === "invitacion_pendiente" && (
                    <div className="border-line bg-surface-raised/90 text-ink-muted flex flex-col gap-1 rounded-xl border p-3 text-[11px] leading-relaxed">
                      <span>
                        Invitación enviada el{" "}
                        <strong className="text-ink font-mono tabular-nums">
                          {formatEsPeDateTime(lookupResult.sentAt)}
                        </strong>{" "}
                        (
                        <strong className="text-ink tabular-nums">
                          {formatRelativeHoursOrDays(
                            lookupResult.hoursSinceSent,
                            lookupResult.daysSinceSent,
                          )}
                        </strong>
                        ).
                      </span>
                      <span>
                        Vigencia activa hasta el{" "}
                        <strong className="text-ink font-mono tabular-nums">
                          {formatEsPeDate(lookupResult.expiresAt)}
                        </strong>
                        .
                      </span>
                    </div>
                  )
                )}
              </div>

              {error && (
                <div className="border-danger/30 bg-danger-soft text-danger-ink rounded-xl border p-3 text-xs font-semibold">
                  {error}
                </div>
              )}

              <div className="border-line flex flex-wrap items-center justify-between gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={resetToLookup}
                  className="border-line bg-surface-sunken hover:bg-surface-raised text-ink inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-semibold transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Consultar otro documento</span>
                </button>

                <div className="flex items-center gap-2">
                  {lookupResult.status === "invitacion_pendiente" && (
                    <button
                      type="button"
                      disabled={isResendingExisting}
                      onClick={() =>
                        void handleResendPending(lookupResult.invitationId)
                      }
                      className="bg-primary text-on-primary hover:bg-primary-hover inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`h-3.5 w-3.5 ${
                          isResendingExisting ? "animate-spin" : ""
                        }`}
                      />
                      <span>
                        {isResendingExisting
                          ? "Reenviando..."
                          : "Reenviar invitación"}
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={onClose}
                    className="border-line bg-surface-raised hover:bg-surface-sunken text-ink-muted cursor-pointer rounded-xl border px-4 py-2 text-xs font-semibold transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}

        {/* Paso 2A / 2B: Formulario para cuenta_existente o nueva_cuenta */}
        {(step === "existing_user" || step === "new_user") && lookupResult && (
          <form
            onSubmit={handleSubmit}
            className="mt-4 flex flex-col gap-4 text-xs"
          >
            {/* Cabecera contextual con botón "Cambiar documento" */}
            <div className="border-line bg-surface-sunken/70 flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5">
              <div className="flex items-center gap-2">
                {step === "existing_user" ? (
                  <ShieldCheck className="text-primary-ink h-4 w-4 shrink-0" />
                ) : (
                  <UserPlus className="text-primary-ink h-4 w-4 shrink-0" />
                )}
                <div className="flex flex-col">
                  <span className="text-ink font-semibold">
                    {DOCUMENT_RULES[docType].shortLabel} ·{" "}
                    <span className="font-mono tabular-nums">
                      {lookupResult.status === "cuenta_existente"
                        ? lookupResult.maskedDocNumber
                        : docNumber}
                    </span>
                  </span>
                  <span className="text-ink-muted text-[11px]">
                    {step === "existing_user"
                      ? "Cuenta verificada existente en Vittkly"
                      : "Documento disponible para registro e invitación"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={resetToLookup}
                className="text-primary-ink hover:bg-primary-soft inline-flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>Cambiar documento</span>
              </button>
            </div>

            {/* Panel de identidad bloqueada (enmascarada desde Postgres) para cuenta_existente */}
            {step === "existing_user" &&
              lookupResult.status === "cuenta_existente" && (
                <div className="border-primary/25 bg-primary-soft/45 flex flex-col gap-3 rounded-xl border p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-primary-ink flex items-center gap-1.5 text-xs font-bold">
                      <UserCheck className="h-4 w-4" />
                      <span>Identidad protegida (Solo lectura)</span>
                    </div>
                    <span className="bg-surface-raised text-ink-muted border-line inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold">
                      <Lock className="h-2.5 w-2.5" />
                      <span>Privacidad blindada</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="border-line bg-surface-raised/90 rounded-lg border px-3 py-2">
                      <span className="text-ink-muted block text-[10px] font-semibold uppercase">
                        Nombre enmascarado
                      </span>
                      <span className="text-ink font-mono text-xs font-bold">
                        {lookupResult.maskedName}
                      </span>
                    </div>

                    <div className="border-line bg-surface-raised/90 rounded-lg border px-3 py-2">
                      <span className="text-ink-muted block text-[10px] font-semibold uppercase">
                        Documento ({lookupResult.docType})
                      </span>
                      <span className="text-ink font-mono text-xs font-bold tabular-nums">
                        {lookupResult.maskedDocNumber}
                      </span>
                    </div>

                    <div className="border-line bg-surface-raised/90 rounded-lg border px-3 py-2">
                      <span className="text-ink-muted block text-[10px] font-semibold uppercase">
                        Correo enmascarado
                      </span>
                      <span className="text-ink font-mono text-xs font-bold">
                        {lookupResult.maskedEmail}
                      </span>
                    </div>

                    <div className="border-line bg-surface-raised/90 rounded-lg border px-3 py-2">
                      <span className="text-ink-muted block text-[10px] font-semibold uppercase">
                        Celular enmascarado
                      </span>
                      <span className="text-ink font-mono text-xs font-bold tabular-nums">
                        {lookupResult.maskedPhone}
                      </span>
                    </div>
                  </div>

                  <p className="text-ink-muted text-[11px] leading-relaxed">
                    Para proteger los datos personales de esta cuenta global,
                    los datos completos nunca se muestran ni se pueden editar
                    aquí. La invitación llegará directamente a su bandeja{" "}
                    <strong className="text-ink">Accesos a empresa</strong>.
                  </p>
                </div>
              )}

            {/* Campos personales completos para nueva_cuenta */}
            {step === "new_user" && (
              <>
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="new-member-first-name"
                      className="text-ink-muted text-xs font-semibold tracking-wider uppercase"
                    >
                      Nombres *
                    </label>
                    <input
                      id="new-member-first-name"
                      type="text"
                      required
                      minLength={2}
                      maxLength={80}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Ej. María Elena"
                      className="border-line bg-surface-sunken text-ink focus:border-primary focus:bg-surface-raised rounded-xl border px-3.5 py-2 text-xs outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="new-member-last-name"
                      className="text-ink-muted text-xs font-semibold tracking-wider uppercase"
                    >
                      Apellidos *
                    </label>
                    <input
                      id="new-member-last-name"
                      type="text"
                      required
                      minLength={2}
                      maxLength={80}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Ej. Fernández Paredes"
                      className="border-line bg-surface-sunken text-ink focus:border-primary focus:bg-surface-raised rounded-xl border px-3.5 py-2 text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="new-member-email"
                      className="text-ink-muted text-xs font-semibold tracking-wider uppercase"
                    >
                      Correo electrónico *
                    </label>
                    <input
                      id="new-member-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="persona@empresa.com"
                      className="border-line bg-surface-sunken text-ink focus:border-primary focus:bg-surface-raised rounded-xl border px-3.5 py-2 font-mono text-xs outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="new-member-phone"
                      className="text-ink-muted text-xs font-semibold tracking-wider uppercase"
                    >
                      Celular (E.164 obligatorio) *
                    </label>
                    <div className="flex items-center gap-1.5">
                      <select
                        aria-label="Código de país"
                        value={countryPrefix}
                        onChange={(e) => setCountryPrefix(e.target.value)}
                        className="border-line bg-surface-sunken text-ink focus:border-primary rounded-xl border px-2 py-2 font-mono text-xs tabular-nums outline-none"
                      >
                        {SUPPORTED_COUNTRY_DIAL_CODES.map((dial) => (
                          <option key={dial.code} value={dial.code}>
                            {dial.code}
                          </option>
                        ))}
                      </select>
                      <input
                        id="new-member-phone"
                        type="tel"
                        required
                        inputMode="tel"
                        value={phone}
                        onChange={(e) =>
                          setPhone(e.target.value.replace(/[^\d\s+-]/g, ""))
                        }
                        placeholder="999 888 777"
                        className="border-line bg-surface-sunken text-ink focus:border-primary focus:bg-surface-raised w-full rounded-xl border px-3 py-2 font-mono text-xs tabular-nums outline-none"
                      />
                    </div>
                    <span className="text-ink-muted text-[10px]">
                      Obligatorio para verificación incluso si el acceso es
                      «Solo web».
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Atributos propios de la membresía en esta empresa */}
            <div className="border-line grid grid-cols-1 gap-3.5 border-t pt-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="invite-profile"
                  className="text-ink-muted text-xs font-semibold tracking-wider uppercase"
                >
                  Perfil en la empresa *
                </label>
                <select
                  id="invite-profile"
                  value={perfilId}
                  onChange={(e) => setPerfilId(e.target.value)}
                  className="border-line bg-surface-sunken text-ink focus:border-primary rounded-xl border px-3 py-2 text-xs font-semibold outline-none"
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="invite-access-label"
                  className="text-ink-muted text-xs font-semibold tracking-wider uppercase"
                >
                  Acceso a plataforma *
                </label>
                <select
                  id="invite-access-label"
                  value={accessLabel}
                  onChange={(e) =>
                    setAccessLabel(e.target.value as AccessLabel)
                  }
                  className="border-line bg-surface-sunken text-ink focus:border-primary rounded-xl border px-3 py-2 text-xs font-semibold outline-none"
                >
                  {ACCESS_LABELS.map((lbl) => (
                    <option key={lbl} value={lbl}>
                      {lbl}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="invite-job-title"
                className="text-ink-muted text-xs font-semibold tracking-wider uppercase"
              >
                Cargo interno (opcional)
              </label>
              <input
                id="invite-job-title"
                type="text"
                maxLength={80}
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Ej. Técnico líder · Zona Sur"
                className="border-line bg-surface-sunken text-ink focus:border-primary focus:bg-surface-raised rounded-xl border px-3.5 py-2 text-xs outline-none"
              />
            </div>

            {error && (
              <div className="border-danger/30 bg-danger-soft text-danger-ink rounded-xl border p-3 text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="border-line mt-1 flex items-center justify-end gap-2.5 border-t pt-4">
              <button
                type="button"
                onClick={onClose}
                className="border-line bg-surface-sunken hover:bg-surface-raised text-ink-muted hover:text-ink cursor-pointer rounded-xl border px-4 py-2 text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-on-primary hover:bg-primary-hover inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold shadow-xs transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Registrando invitación...</span>
                  </>
                ) : step === "existing_user" ? (
                  <span>Enviar invitación a cuenta existente</span>
                ) : (
                  <span>Crear y enviar invitación</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
