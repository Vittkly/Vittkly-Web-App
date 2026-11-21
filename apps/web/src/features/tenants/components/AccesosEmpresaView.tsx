"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Info,
  LifeBuoy,
  LogOut,
  Mail,
  Smartphone,
  X,
} from "lucide-react";
import { CompanyAvatar } from "@/components/brand/CompanyAvatar";
import { VittklyLogo } from "@/components/brand/VittklyLogo";
import { logoutAction } from "@/features/auth/actions/auth.actions";
import {
  createAdditionalCompanyAction,
  enterCompanyAction,
  requestExitAction,
  requestExitSupportAction,
  respondInvitationAction,
} from "../actions/tenants.actions";
import type {
  MisAccesosData,
  MisAccesosEmpresa,
  MisAccesosInvitacion,
} from "../types/tenants.types";
import { CreateCompanyFlow, type NuevaEmpresaDraft } from "./CreateCompanyFlow";
import { MobileOnlyAccessModal } from "./MobileOnlyAccessModal";
import {
  PlanSelectorStep,
  resolvePlanSelectorMode,
  type PlanSelectionPayload,
} from "./PlanSelectorStep";

interface AccesosEmpresaViewProps {
  data: MisAccesosData;
}

function formatDateShort(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function AccessScopeBadge({
  accesoWeb,
  accesoApp,
}: {
  accesoWeb: boolean;
  accesoApp: boolean;
}) {
  if (accesoWeb && accesoApp) {
    return (
      <span className="bg-primary-soft text-primary-ink inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold">
        Web y app
      </span>
    );
  }
  if (!accesoWeb && accesoApp) {
    return (
      <span className="bg-warning-soft text-warning-ink inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold">
        <Smartphone className="h-3 w-3" />
        Solo app
      </span>
    );
  }
  if (accesoWeb && !accesoApp) {
    return (
      <span className="bg-surface-sunken text-ink-muted inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold">
        Solo web
      </span>
    );
  }
  return (
    <span className="bg-danger-soft text-danger-ink inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold">
      Sin acceso
    </span>
  );
}

type FeedbackTone = "success" | "warning" | "neutral" | "error";

interface FeedbackState {
  tone: FeedbackTone;
  text: string;
  icon?: "smartphone";
}

const FEEDBACK_BANNER_CONFIG: Record<
  FeedbackTone,
  { containerClass: string; role: "status" | "alert" }
> = {
  success: {
    containerClass:
      "border-success/30 bg-success-soft text-success-ink font-medium",
    role: "status",
  },
  warning: {
    containerClass:
      "border-warning/30 bg-warning-soft text-warning-ink font-medium",
    role: "alert",
  },
  neutral: {
    containerClass: "border-line bg-surface-sunken text-ink-muted font-medium",
    role: "status",
  },
  error: {
    containerClass:
      "border-danger/30 bg-danger-soft text-danger-ink font-medium",
    role: "alert",
  },
};

function sanitizeClientErrorMessage(
  raw: string | undefined,
  fallback: string,
): string {
  if (!raw || raw.includes("NEXT_REDIRECT")) {
    return fallback;
  }
  return raw;
}

function renderFeedbackIcon(feedback: FeedbackState) {
  switch (feedback.tone) {
    case "success":
      return (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      );
    case "warning":
      return feedback.icon === "smartphone" ? (
        <Smartphone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      ) : (
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      );
    case "neutral":
      return <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />;
    case "error":
      return (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      );
  }
}

export function AccesosEmpresaView({ data }: AccesosEmpresaViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [enteringId, setEnteringId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [exitTarget, setExitTarget] = useState<MisAccesosEmpresa | null>(null);
  const [exitReason, setExitReason] = useState("");
  const [selectedMobileCompany, setSelectedMobileCompany] =
    useState<MisAccesosEmpresa | null>(null);

  // Estado de creación de empresa en 2 pasos (Paso 1 inline -> Paso 2 vista completa)
  const [companyDraft, setCompanyDraft] = useState<NuevaEmpresaDraft>({
    nombreEmpresa: "",
    rubro: "",
    ciudad: "",
  });
  const [step1Expanded, setStep1Expanded] = useState(false);
  const [planStepOpen, setPlanStepOpen] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  const allMemberships = [...data.empresas_propias, ...data.empresas_miembro];
  const totalEmpresas = allMemberships.length;
  const allMembershipsMobileOnly =
    totalEmpresas > 0 && allMemberships.every((e) => !e.acceso_web);
  const hasAnyAppAccess = allMemberships.some((e) => e.acceso_app);
  const firstMobileCompany =
    data.empresas_miembro.find((e) => !e.acceso_web) ??
    data.empresas_propias.find((e) => !e.acceso_web) ??
    null;

  let subtitle =
    "Elige con qué empresa quieres trabajar ahora o gestiona tus accesos.";
  if (totalEmpresas === 0) {
    subtitle =
      data.invitaciones.length > 0
        ? "Tienes invitaciones pendientes. Acepta una o crea tu propia empresa para empezar."
        : "Aún no perteneces a ninguna empresa. Crea una nueva empresa o pide a un administrador que te invite.";
  } else if (allMembershipsMobileOnly) {
    subtitle = hasAnyAppAccess
      ? "Tu acceso actual está asignado únicamente a la app móvil. Revisa tus invitaciones o crea una empresa."
      : "No tienes canales habilitados en tus empresas actuales. Revisa tus invitaciones o crea una empresa.";
  }

  const reportError = (text: string) => setFeedback({ tone: "error", text });

  const executeTenantAction = async <T,>(
    task: () => Promise<T | undefined>,
    fallbackError: string,
    onError: (msg: string) => void = reportError,
  ): Promise<T | undefined> => {
    try {
      return await task();
    } catch (err) {
      const msg = err instanceof Error ? err.message : undefined;
      if (msg?.includes("NEXT_REDIRECT")) {
        return undefined;
      }
      onError(sanitizeClientErrorMessage(msg, fallbackError));
      return undefined;
    }
  };

  const handleEnterCompany = (empresa: MisAccesosEmpresa) => {
    setFeedback(null);

    if (!empresa.acceso_web) {
      setSelectedMobileCompany(empresa);
      return;
    }

    setEnteringId(empresa.empresa_id);
    startTransition(async () => {
      try {
        const res = await executeTenantAction(
          () => enterCompanyAction(empresa.empresa_id),
          "No se pudo ingresar a la empresa.",
        );
        if (!res) return;
        if (!res.ok) {
          reportError(
            sanitizeClientErrorMessage(
              res.error,
              "No se pudo ingresar a la empresa.",
            ),
          );
        }
      } finally {
        setEnteringId(null);
      }
    });
  };

  const handleAcceptInvitation = (inv: MisAccesosInvitacion) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await executeTenantAction(
        () =>
          respondInvitationAction({
            invitacionId: inv.id,
            acepta: true,
          }),
        "No se pudo aceptar la invitación.",
      );
      if (!res) return;
      if (!res.ok) {
        reportError(
          sanitizeClientErrorMessage(
            res.error,
            "No se pudo aceptar la invitación.",
          ),
        );
        return;
      }

      const accesoWeb = res.data?.accesoWeb ?? inv.acceso_web;
      const empresaNombre = res.data?.empresaNombre || inv.empresa_nombre;
      const fallbackMessage = accesoWeb
        ? `Invitación aceptada correctamente. Ya puedes entrar a ${empresaNombre}.`
        : `Invitación aceptada. Tu acceso en ${empresaNombre} es exclusivo desde la app móvil.`;

      setFeedback({
        tone: accesoWeb ? "success" : "warning",
        icon: accesoWeb ? undefined : "smartphone",
        text: res.message || fallbackMessage,
      });
      router.replace("/accesos?stay=1");
      router.refresh();
    });
  };

  const handleConfirmReject = (invitacionId: string) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await executeTenantAction(
        () =>
          respondInvitationAction({
            invitacionId,
            acepta: false,
            motivo: rejectReason.trim() || null,
          }),
        "No se pudo rechazar la invitación.",
      );
      if (!res) return;
      if (!res.ok) {
        reportError(
          sanitizeClientErrorMessage(
            res.error,
            "No se pudo rechazar la invitación.",
          ),
        );
        return;
      }
      setRejectingId(null);
      setRejectReason("");
      setFeedback({
        tone: "neutral",
        text: res.message || "Invitación rechazada.",
      });
      router.refresh();
    });
  };

  const handleSubmitExit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exitTarget) return;
    setFeedback(null);

    startTransition(async () => {
      const res = await executeTenantAction(
        () =>
          requestExitAction({
            membresiaId: exitTarget.membresia_id,
            motivo: exitReason.trim() || null,
          }),
        "No se pudo enviar la solicitud de salida.",
      );
      if (!res) return;
      if (!res.ok) {
        reportError(
          sanitizeClientErrorMessage(
            res.error,
            "No se pudo enviar la solicitud de salida.",
          ),
        );
        return;
      }
      setExitTarget(null);
      setExitReason("");
      setFeedback({
        tone: "warning",
        text: "Solicitud de salida enviada. El administrador de la empresa revisará tu solicitud.",
      });
      router.refresh();
    });
  };

  const handleAskSupport = (solicitudId: string) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await executeTenantAction(
        () => requestExitSupportAction({ solicitudId }),
        "No se pudo derivar la solicitud a soporte.",
      );
      if (!res) return;
      if (!res.ok) {
        reportError(
          sanitizeClientErrorMessage(
            res.error,
            "No se pudo derivar la solicitud a soporte.",
          ),
        );
        return;
      }
      setFeedback({
        tone: "warning",
        text: "Derivamos tu solicitud al equipo de soporte de Vittkly para ayudarte a desvincular tu acceso.",
      });
      router.refresh();
    });
  };

  const handleConfirmPlan = (payload: PlanSelectionPayload) => {
    setPlanError(null);
    startTransition(async () => {
      const res = await executeTenantAction(
        () =>
          createAdditionalCompanyAction({
            nombreEmpresa: companyDraft.nombreEmpresa,
            rubro: companyDraft.rubro || null,
            ciudad: companyDraft.ciudad || null,
            ruc: null,
            modo: payload.modo,
            planCodigo: payload.planCodigo,
            periodo: payload.periodo,
          }),
        "No se pudo crear la empresa.",
        setPlanError,
      );
      if (!res) return;
      if (!res.ok) {
        setPlanError(
          sanitizeClientErrorMessage(res.error, "No se pudo crear la empresa."),
        );
      }
    });
  };

  // Si está en Paso 2 (Elige tu plan), reemplaza temporalmente la vista completa por max-w-4xl
  if (planStepOpen) {
    const planMode = resolvePlanSelectorMode(
      data.cuenta_actual,
      data.usuario.prueba_usada_en,
    );
    return (
      <div className="bg-surface flex min-h-screen flex-col justify-between px-4 py-10">
        <PlanSelectorStep
          mode={planMode}
          companyName={companyDraft.nombreEmpresa}
          cuentaActual={data.cuenta_actual}
          isPending={isPending}
          error={planError}
          onBack={() => {
            setPlanStepOpen(false);
            setStep1Expanded(true);
            setPlanError(null);
          }}
          onConfirm={handleConfirmPlan}
        />

        <footer className="border-line text-ink-muted mx-auto mt-10 w-full max-w-4xl space-y-4 border-t pt-6 text-center text-xs">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span>
              Sesión de{" "}
              <span className="text-ink font-semibold">
                {data.usuario.correo ?? data.usuario.nombre}
              </span>
            </span>
            <span>·</span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-ink hover:text-danger inline-flex cursor-pointer items-center gap-1 font-semibold"
              >
                <LogOut className="h-3.5 w-3.5" />
                Cerrar sesión
              </button>
            </form>
          </div>
          <div className="text-ink-muted/80 flex items-center justify-center gap-2 text-[10px] font-bold tracking-widest uppercase">
            <span>Con tecnología</span>
            <VittklyLogo variant="wordmark" height={15} />
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="bg-surface flex min-h-screen flex-col justify-between px-4 py-10">
      <div className="mx-auto w-full max-w-xl space-y-6">
        {/* Cabecera de marca */}
        <header className="space-y-3 text-center">
          <div className="flex justify-center">
            <VittklyLogo variant="wordmark" height={34} priority />
          </div>
          <div className="space-y-1">
            <h1 className="text-ink text-2xl font-extrabold tracking-tight">
              Accesos a empresa
            </h1>
            <p className="text-ink-muted text-sm">{subtitle}</p>
          </div>
        </header>

        {/* Mensajes globales */}
        {feedback && (
          <div
            role={FEEDBACK_BANNER_CONFIG[feedback.tone].role}
            data-testid="accesos-feedback-banner"
            data-tone={feedback.tone}
            className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-xs ${FEEDBACK_BANNER_CONFIG[feedback.tone].containerClass}`}
          >
            {renderFeedbackIcon(feedback)}
            <span>{feedback.text}</span>
          </div>
        )}

        {allMembershipsMobileOnly && firstMobileCompany && (
          <div
            role="status"
            data-testid="all-mobile-only-banner"
            className="border-warning/30 bg-warning-soft text-warning-ink flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="border-warning/30 bg-surface-raised text-warning-ink flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border">
                <Smartphone className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="space-y-0.5 text-xs">
                <p className="font-bold">
                  {hasAnyAppAccess
                    ? "Tu usuario fue asignado únicamente a la app móvil"
                    : "No tienes acceso web habilitado en tus empresas"}
                </p>
                <p className="opacity-90">
                  {hasAnyAppAccess
                    ? "Puedes descargar la app para comenzar a operar, revisar tus invitaciones pendientes o crear tu propia empresa aquí."
                    : "Contacta al administrador de tu empresa para habilitar tu acceso web o móvil, o crea una nueva empresa."}
                </p>
              </div>
            </div>
            {hasAnyAppAccess && (
              <button
                type="button"
                onClick={() => setSelectedMobileCompany(firstMobileCompany)}
                className="bg-primary text-on-primary hover:bg-primary-hover focus-visible:outline-focus inline-flex min-h-[38px] shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3.5 text-xs font-bold transition-colors focus-visible:outline-2"
              >
                <Smartphone className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Ver cómo entrar en la app</span>
              </button>
            )}
          </div>
        )}

        <MobileOnlyAccessModal
          isOpen={selectedMobileCompany !== null}
          mode="accesos"
          company={
            selectedMobileCompany
              ? {
                  nombre: selectedMobileCompany.nombre,
                  perfilNombre: selectedMobileCompany.perfil_nombre,
                  accesoWeb: selectedMobileCompany.acceso_web,
                  accesoApp: selectedMobileCompany.acceso_app,
                }
              : null
          }
          onClose={() => setSelectedMobileCompany(null)}
        />

        {/* Bloque 1: Invitaciones pendientes */}
        {data.invitaciones.length > 0 && (
          <section className="space-y-2.5">
            <h2 className="text-ink-muted text-xs font-bold tracking-wider uppercase">
              Invitaciones pendientes ({data.invitaciones.length})
            </h2>
            <div className="space-y-2.5">
              {data.invitaciones.map((inv) => {
                const isRejecting = rejectingId === inv.id;
                return (
                  <div
                    key={inv.id}
                    className="border-primary/30 bg-surface-raised rounded-2xl border p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <CompanyAvatar
                            name={inv.empresa_nombre}
                            menuIconUrl={inv.empresa_icono_menu_ruta}
                            logoUrl={inv.empresa_logo_ruta}
                            brandColor={inv.empresa_color_marca}
                            size="xs"
                            shape="rounded"
                            className="bg-primary/10 text-primary border-primary/20"
                            fallbackIcon={<Mail className="h-3.5 w-3.5" />}
                          />
                          <h3 className="text-ink truncate text-sm font-bold">
                            {inv.empresa_nombre}
                          </h3>
                          <span className="bg-surface-alt text-ink rounded-full px-2 py-0.5 text-[11px] font-semibold">
                            {inv.perfil_nombre}
                          </span>
                          <AccessScopeBadge
                            accesoWeb={inv.acceso_web}
                            accesoApp={inv.acceso_app}
                          />
                        </div>
                        <p className="text-ink-muted text-xs">
                          Invitado por{" "}
                          <span className="text-ink font-medium">
                            {inv.invitador_nombre}
                          </span>{" "}
                          · Vence el{" "}
                          <span className="font-mono tabular-nums">
                            {formatDateShort(inv.vence_en)}
                          </span>
                        </p>
                      </div>
                    </div>

                    {!isRejecting ? (
                      <div className="mt-3.5 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => {
                            setRejectingId(inv.id);
                            setRejectReason("");
                          }}
                          className="border-line text-ink-muted hover:bg-surface-alt hover:text-ink inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                        >
                          <X className="h-3.5 w-3.5" />
                          Rechazar
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleAcceptInvitation(inv)}
                          className="bg-primary inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Aceptar
                        </button>
                      </div>
                    ) : (
                      <div className="border-line mt-3 space-y-2.5 border-t pt-3">
                        <label className="text-ink-muted block text-xs font-medium">
                          Motivo del rechazo (opcional)
                        </label>
                        <textarea
                          rows={2}
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Ej. Ya no trabajo en esa sede o fue enviada por error"
                          className="border-line bg-surface text-ink placeholder:text-ink-muted/60 focus:border-primary w-full rounded-lg border px-3 py-2 text-xs focus:outline-none"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => setRejectingId(null)}
                            className="border-line text-ink-muted hover:bg-surface-alt rounded-lg border px-3 py-1.5 text-xs font-semibold"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleConfirmReject(inv.id)}
                            className="bg-danger rounded-lg px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
                          >
                            Confirmar rechazo
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Bloque 2: Empresas de las que es propietario */}
        {data.empresas_propias.length > 0 && (
          <section className="space-y-2.5">
            <h2 className="text-ink-muted text-xs font-bold tracking-wider uppercase">
              Empresas de las que eres propietario
            </h2>
            <div className="space-y-2.5">
              {data.empresas_propias.map((emp) => {
                const isLast =
                  data.usuario.ultima_empresa_id === emp.empresa_id;
                const isEntering = enteringId === emp.empresa_id;
                return (
                  <button
                    key={emp.membresia_id}
                    type="button"
                    disabled={isPending}
                    onClick={() => handleEnterCompany(emp)}
                    className="group border-line bg-surface-raised hover:border-primary flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-all hover:shadow-sm disabled:opacity-60"
                  >
                    <div className="flex min-w-0 items-center gap-3.5">
                      <CompanyAvatar
                        name={emp.nombre}
                        menuIconUrl={emp.icono_menu_ruta}
                        logoUrl={emp.logo_ruta}
                        brandColor={emp.color_marca}
                        size="lg"
                        shape="rounded"
                        className="bg-primary/10 text-primary"
                        fallbackIcon={<Building2 className="h-5 w-5" />}
                      />
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-ink truncate text-sm font-bold">
                            {emp.nombre}
                          </span>
                          <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase">
                            Propietario
                          </span>
                          {isLast && (
                            <span className="bg-surface-alt text-ink-muted rounded-full px-2 py-0.5 text-[10px] font-semibold">
                              La última vez
                            </span>
                          )}
                        </div>
                        <p className="text-ink-muted truncate text-xs">
                          {emp.rubro} · {emp.ciudad}
                        </p>
                      </div>
                    </div>
                    <div className="text-primary flex shrink-0 items-center gap-1 text-xs font-semibold">
                      {isEntering ? (
                        <span>Entrando...</span>
                      ) : emp.acceso_web ? (
                        <>
                          <span className="hidden sm:inline">Entrar</span>
                          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </>
                      ) : emp.acceso_app ? (
                        <Smartphone
                          className="text-warning h-4 w-4"
                          aria-label="Acceso exclusivo app móvil"
                        />
                      ) : (
                        <AlertCircle
                          className="text-danger h-4 w-4"
                          aria-label="Sin canales habilitados"
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Bloque 3: Empresas a las que pertenece */}
        {data.empresas_miembro.length > 0 && (
          <section className="space-y-2.5">
            <h2 className="text-ink-muted text-xs font-bold tracking-wider uppercase">
              Empresas a las que perteneces
            </h2>
            <div className="space-y-3">
              {data.empresas_miembro.map((emp) => {
                const isLast =
                  data.usuario.ultima_empresa_id === emp.empresa_id;
                const isEntering = enteringId === emp.empresa_id;
                const sol = emp.solicitud_salida;
                return (
                  <div
                    key={emp.membresia_id}
                    className="border-line bg-surface-raised rounded-2xl border"
                  >
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleEnterCompany(emp)}
                      className="group hover:bg-surface-alt/50 flex w-full items-center justify-between gap-3 rounded-t-2xl p-4 text-left transition-colors disabled:opacity-60"
                    >
                      <div className="flex min-w-0 items-center gap-3.5">
                        <CompanyAvatar
                          name={emp.nombre}
                          menuIconUrl={emp.icono_menu_ruta}
                          logoUrl={emp.logo_ruta}
                          brandColor={emp.color_marca}
                          size="lg"
                          shape="rounded"
                          className="bg-surface-alt text-ink-muted"
                          fallbackIcon={<Building2 className="h-5 w-5" />}
                        />
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-ink truncate text-sm font-bold">
                              {emp.nombre}
                            </span>
                            <span className="bg-surface-alt text-ink rounded-full px-2 py-0.5 text-[11px] font-semibold">
                              {emp.perfil_nombre}
                            </span>
                            <AccessScopeBadge
                              accesoWeb={emp.acceso_web}
                              accesoApp={emp.acceso_app}
                            />
                            {isLast && (
                              <span className="bg-surface-alt text-ink-muted rounded-full px-2 py-0.5 text-[10px] font-semibold">
                                La última vez
                              </span>
                            )}
                          </div>
                          <p className="text-ink-muted truncate text-xs">
                            {emp.rubro} · {emp.ciudad}
                          </p>
                        </div>
                      </div>
                      <div className="text-primary flex shrink-0 items-center gap-1 text-xs font-semibold">
                        {isEntering ? (
                          <span>Entrando...</span>
                        ) : emp.acceso_web ? (
                          <>
                            <span className="hidden sm:inline">Entrar</span>
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                          </>
                        ) : emp.acceso_app ? (
                          <Smartphone
                            className="text-warning h-4 w-4"
                            aria-label="Acceso exclusivo app móvil"
                          />
                        ) : (
                          <AlertCircle
                            className="text-danger h-4 w-4"
                            aria-label="Sin canales habilitados"
                          />
                        )}
                      </div>
                    </button>

                    <div className="border-line flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2.5 text-xs">
                      {sol ? (
                        <>
                          <span className="text-ink-muted inline-flex items-center gap-1.5">
                            <Clock className="text-warning h-3.5 w-3.5" />
                            Solicitud de salida enviada · Esperando aprobación
                            del administrador
                          </span>
                          {sol.puede_pedir_soporte ? (
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => handleAskSupport(sol.id)}
                              className="text-primary inline-flex items-center gap-1 font-semibold hover:underline disabled:opacity-50"
                            >
                              <LifeBuoy className="h-3.5 w-3.5" />
                              Pedir ayuda a soporte
                            </button>
                          ) : (
                            <span className="text-ink-muted font-mono text-[11px] tabular-nums">
                              Soporte desde {formatDateShort(sol.soporte_desde)}
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="text-ink-muted">
                            ¿Ya no trabajas en esta empresa?
                          </span>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => {
                              setExitTarget(emp);
                              setExitReason("");
                            }}
                            className="text-ink-muted hover:text-danger font-semibold disabled:opacity-50"
                          >
                            Solicitar salir de esta empresa
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Bloque 4: Crear una empresa nueva (Paso 1 inline) */}
        <section className="pt-1">
          <CreateCompanyFlow
            key={step1Expanded ? "open" : "closed"}
            initialDraft={companyDraft}
            defaultExpanded={step1Expanded}
            onContinueToPlan={(draft) => {
              setCompanyDraft(draft);
              setStep1Expanded(true);
              setPlanStepOpen(true);
            }}
            onCancel={() => {
              setStep1Expanded(false);
            }}
          />
        </section>
      </div>

      {/* Pie de página */}
      <footer className="border-line text-ink-muted mx-auto mt-10 w-full max-w-xl space-y-4 border-t pt-6 text-center text-xs">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span>
            Sesión de{" "}
            <span className="text-ink font-semibold">
              {data.usuario.correo ?? data.usuario.nombre}
            </span>
          </span>
          <span>·</span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-ink hover:text-danger inline-flex items-center gap-1 font-semibold"
            >
              <LogOut className="h-3.5 w-3.5" />
              Cerrar sesión
            </button>
          </form>
        </div>
        <div className="text-ink-muted/80 flex items-center justify-center gap-2 text-[10px] font-bold tracking-widest uppercase">
          <span>Con tecnología</span>
          <VittklyLogo variant="wordmark" height={15} />
        </div>
      </footer>

      {/* Modal de solicitud de salida */}
      {exitTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-salida-titulo"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <form
            onSubmit={handleSubmitExit}
            className="border-line bg-surface-raised w-full max-w-md space-y-4 rounded-2xl border p-5 shadow-xl"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3
                  id="modal-salida-titulo"
                  className="text-ink text-base font-bold"
                >
                  Solicitar salir de {exitTarget.nombre}
                </h3>
                <p className="text-ink-muted mt-1 text-xs">
                  El administrador recibirá tu solicitud para desvincular tu
                  acceso. Si no responde en 7 días, podrás pedir ayuda a
                  soporte.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setExitTarget(null)}
                className="text-ink-muted hover:bg-surface-alt hover:text-ink rounded-lg p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label
                htmlFor="motivo-salida"
                className="text-ink mb-1 block text-xs font-semibold"
              >
                Motivo (opcional)
              </label>
              <textarea
                id="motivo-salida"
                rows={3}
                value={exitReason}
                onChange={(e) => setExitReason(e.target.value)}
                placeholder="Ej. Culminé mis servicios en esta empresa"
                className="border-line bg-surface text-ink placeholder:text-ink-muted/60 focus:border-primary w-full rounded-lg border px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setExitTarget(null)}
                className="border-line text-ink-muted hover:bg-surface-alt rounded-lg border px-3.5 py-2 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="bg-danger rounded-lg px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {isPending ? "Enviando..." : "Enviar solicitud"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
