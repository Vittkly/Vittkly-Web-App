"use client";

import React, { useState } from "react";
import { Copy, Check, RefreshCw, MessageCircle } from "lucide-react";
import {
  resendInvitationAction,
  type GeneratedInvitationPayload,
} from "../actions/users-profiles.actions";

export interface InvitationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  invitation: GeneratedInvitationPayload | null;
  onInvitationUpdated?: (next: GeneratedInvitationPayload) => void;
}

export function InvitationDetailsModal({
  isOpen,
  onClose,
  companyName,
  invitation,
  onInvitationUpdated,
}: InvitationDetailsModalProps) {
  const [copied, setCopied] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !invitation) return null;

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://app.vittkly.com";

  const fullInviteUrl = invitation.invitationPath.startsWith("http")
    ? invitation.invitationPath
    : `${origin}${invitation.invitationPath}`;

  const formattedExpires = (() => {
    try {
      return new Intl.DateTimeFormat("es-PE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(invitation.expiresAt));
    } catch {
      return "7 días";
    }
  })();

  const shareMessage = `Hola ${invitation.recipientName}, te invitamos a unirte al equipo de ${companyName} en Vittkly con el perfil de ${invitation.perfilNombre} (${invitation.accessLabel}). Ingresa con este enlace de un solo uso (vigente hasta el ${formattedExpires}): ${fullInviteUrl}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError("No se pudo copiar al portapapeles.");
    }
  };

  const handleResend = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsResending(true);
    const res = await resendInvitationAction(invitation.invitationId);
    setIsResending(false);

    if (res.success && res.data) {
      setSuccessMsg(
        "Se anuló la invitación anterior y se generó un nuevo enlace vigente por 7 días.",
      );
      onInvitationUpdated?.(res.data);
    } else {
      setError(res.error || "No se pudo reenviar la invitación.");
    }
  };

  const whatsappDigits = (invitation.recipientPhone ?? "").replace(/\D+/g, "");
  const whatsappUrl = whatsappDigits
    ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(shareMessage)}`
    : `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-modal-title"
      className="bg-ink/60 animate-sc-in fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
    >
      <div className="border-line bg-surface-raised flex w-full max-w-lg flex-col gap-4 rounded-2xl border p-6 shadow-2xl">
        <div className="border-line flex items-center justify-between border-b pb-3.5">
          <div>
            <h2
              id="invite-modal-title"
              className="text-ink font-sans text-base font-bold tracking-tight sm:text-lg"
            >
              Invitación de acceso a {companyName}
            </h2>
            <p className="text-ink-muted text-xs">
              Enlace de un solo uso · Vigencia de 7 días
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
          <div className="border-danger/30 bg-danger-soft text-danger-ink rounded-xl border p-3 text-xs font-semibold">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="border-success/30 bg-success-soft text-success-ink rounded-xl border p-3 text-xs font-semibold">
            {successMsg}
          </div>
        )}

        <div className="border-line bg-surface-sunken/70 grid grid-cols-2 gap-3 rounded-xl border p-3.5 text-xs">
          <div className="flex flex-col gap-0.5">
            <span className="text-ink-muted text-[10px] font-bold uppercase">
              Destinatario
            </span>
            <span className="text-ink font-bold">
              {invitation.recipientName}
            </span>
            <span className="text-ink-muted font-mono text-[11px]">
              {invitation.recipientEmail ||
                invitation.recipientPhone ||
                "Cuenta existente"}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-ink-muted text-[10px] font-bold uppercase">
              Perfil y acceso
            </span>
            <span className="text-primary-ink font-bold">
              {invitation.perfilNombre}
            </span>
            <span className="text-ink-muted text-[11px]">
              {invitation.accessLabel} · Vence:{" "}
              <b className="font-mono tabular-nums">{formattedExpires}</b>
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-ink-muted text-[11px] font-bold tracking-wider uppercase">
            Mensaje listo para compartir
          </label>
          <textarea
            readOnly
            rows={4}
            value={shareMessage}
            className="border-line bg-surface-sunken text-ink w-full rounded-xl border p-3 font-mono text-xs leading-relaxed outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="border-line bg-surface-sunken hover:bg-surface-raised text-ink inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-colors"
            >
              {copied ? (
                <>
                  <Check className="text-kleanly h-3.5 w-3.5" />
                  <span>Mensaje copiado</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copiar mensaje</span>
                </>
              )}
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-on-primary hover:bg-primary-hover inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>Enviar por WhatsApp</span>
            </a>
          </div>

          <button
            type="button"
            disabled={isResending}
            onClick={handleResend}
            className="text-primary-ink hover:bg-primary-soft inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors disabled:opacity-50"
            title="Anula el enlace anterior y genera uno nuevo por 7 días"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isResending ? "animate-spin" : ""}`}
            />
            <span>
              {isResending ? "Generando enlace..." : "Reenviar invitación"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
