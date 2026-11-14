"use client";

import { useState, useTransition } from "react";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Check,
  ChevronRight,
  Clock,
  LifeBuoy,
  LogOut,
  Mail,
  Smartphone,
  X,
} from "lucide-react";
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
      <span className="bg-kleanly/15 text-kleanly inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold">
        Web y app
      </span>
    );
  }
  if (!accesoWeb && accesoApp) {
    return (
      <span className="bg-warning/15 text-warning inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold">
        <Smartphone className="h-3 w-3" />
        Solo app
      </span>
    );
  }
  return (
    <span className="bg-surface-alt text-ink-muted inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold">
      Solo web
    </span>
  );
}

export function AccesosEmpresaView({ data }: AccesosEmpresaViewProps) {
  const [isPending, startTransition] = useTransition();
  const [enteringId, setEnteringId] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackInfo, setFeedbackInfo] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [exitTarget, setExitTarget] = useState<MisAccesosEmpresa | null>(null);
  const [exitReason, setExitReason] = useState("");

  // Estado de creación de empresa en 2 pasos (Paso 1 inline -> Paso 2 vista completa)
  const [companyDraft, setCompanyDraft] = useState<NuevaEmpresaDraft>({
    nombreEmpresa: "",
    rubro: "",
    ciudad: "",
  });
  const [step1Expanded, setStep1Expanded] = useState(false);
  const [planStepOpen, setPlanStepOpen] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  const totalEmpresas =
    data.empresas_propias.length + data.empresas_miembro.length;
  const onlyAppOnly =
    totalEmpresas === 1 &&
    data.empresas_propias.length === 0 &&
    data.empresas_miembro[0]?.acceso_web === false;

  let subtitle =
    "Elige con qué empresa quieres trabajar ahora o gestiona tus accesos.";
  if (totalEmpresas === 0) {
    subtitle =
      data.invitaciones.length > 0
        ? "Tienes invitaciones pendientes. Acepta una o crea tu propia empresa para empezar."
        : "Aún no perteneces a ninguna empresa. Crea una nueva empresa o pide a un administrador que te invite.";
  } else if (onlyAppOnly) {
    subtitle =
      "Tu acceso actual es solo desde la app móvil. Revisa tus invitaciones o crea una empresa.";
  }

  const handleEnterCompany = (empresa: MisAccesosEmpresa) => {
    setFeedbackError(null);
    setFeedbackInfo(null);

    if (!empresa.acceso_web) {
      setFeedbackInfo(
        `Esta empresa (${empresa.nombre}) solo te habilitó acceso desde la app móvil de Vittkly.`,
      );
      return;
    }

    setEnteringId(empresa.empresa_id);
    startTransition(async () => {
      const res = await enterCompanyAction(empresa.empresa_id);
      setEnteringId(null);
      if (!res.ok && res.error) {
        setFeedbackError(res.error);
      }
    });
  };

  const handleAcceptInvitation = (inv: MisAccesosInvitacion) => {
    setFeedbackError(null);
    setFeedbackInfo(null);
    startTransition(async () => {
      const res = await respondInvitationAction({
        invitacionId: inv.id,
        acepta: true,
      });
      if (!res.ok && res.error) {
        setFeedbackError(res.error);
      } else if (res.ok && res.data && !res.data.accesoWeb) {
        setFeedbackInfo(
          `Aceptaste la invitación a ${inv.empresa_nombre}. Tu acceso es desde la app móvil de Vittkly.`,
        );
      }
    });
  };

  const handleConfirmReject = (invitacionId: string) => {
    setFeedbackError(null);
    startTransition(async () => {
      const res = await respondInvitationAction({
        invitacionId,
        acepta: false,
        motivo: rejectReason.trim() || null,
      });
      if (!res.ok && res.error) {
        setFeedbackError(res.error);
        return;
      }
      setRejectingId(null);
      setRejectReason("");
    });
  };

  const handleSubmitExit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exitTarget) return;
    setFeedbackError(null);

    startTransition(async () => {
      const res = await requestExitAction({
        membresiaId: exitTarget.membresia_id,
        motivo: exitReason.trim() || null,
      });
      if (!res.ok && res.error) {
        setFeedbackError(res.error);
        return;
      }
      setExitTarget(null);
      setExitReason("");
      setFeedbackInfo(
        "Solicitud de salida enviada. El administrador de la empresa revisará tu solicitud.",
      );
    });
  };

  const handleAskSupport = (solicitudId: string) => {
    setFeedbackError(null);
    startTransition(async () => {
      const res = await requestExitSupportAction({ solicitudId });
      if (!res.ok && res.error) {
        setFeedbackError(res.error);
        return;
      }
      setFeedbackInfo(
        "Derivamos tu solicitud al equipo de soporte de Vittkly para ayudarte a desvincular tu acceso.",
      );
    });
  };

  const handleConfirmPlan = (payload: PlanSelectionPayload) => {
    setPlanError(null);
    startTransition(async () => {
      const res = await createAdditionalCompanyAction({
        nombreEmpresa: companyDraft.nombreEmpresa,
        rubro: companyDraft.rubro || null,
        ciudad: companyDraft.ciudad || null,
        ruc: null,
        modo: payload.modo,
        planCodigo: payload.planCodigo,
        periodo: payload.periodo,
      });
      if (!res.ok && res.error) {
        setPlanError(res.error);
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
        {feedbackError && (
          <div className="border-danger/30 bg-danger/10 text-danger flex items-start gap-2.5 rounded-xl border px-4 py-3 text-xs">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{feedbackError}</span>
          </div>
        )}

        {feedbackInfo && (
          <div className="border-warning/30 bg-warning/10 text-ink flex items-start gap-2.5 rounded-xl border px-4 py-3 text-xs">
            <Smartphone className="text-warning mt-0.5 h-4 w-4 shrink-0" />
            <span>{feedbackInfo}</span>
          </div>
        )}

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
                          <span className="bg-primary/10 text-primary inline-flex h-6 w-6 items-center justify-center rounded-md">
                            <Mail className="h-3.5 w-3.5" />
                          </span>
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
                      <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                        <Building2 className="h-5 w-5" />
                      </div>
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
                      ) : (
                        <>
                          <span className="hidden sm:inline">Entrar</span>
                          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </>
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
                        <div className="bg-surface-alt text-ink-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                          <Building2 className="h-5 w-5" />
                        </div>
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
                        ) : (
                          <Smartphone className="text-warning h-4 w-4" />
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
