"use client";

import React, { useState } from "react";
import { VittklyLogo } from "@/components/brand/VittklyLogo";
import type { CuentaActualInfo } from "../types/tenants.types";

export type PlanCode = "inicia" | "crece" | "empresa";
export type BillingPeriod = "mensual" | "anual";
export type PlanSelectorMode =
  "additional_company" | "new_registration" | "standalone_no_trial";

type SelectedOption = "sumar_cuenta" | PlanCode;

export interface PlanSelectionPayload {
  modo: "sumar_cuenta" | "plan_propio";
  planCodigo: PlanCode;
  periodo: BillingPeriod;
}

export interface PlanSelectorStepProps {
  mode: PlanSelectorMode;
  companyName: string;
  cuentaActual?: CuentaActualInfo | null;
  stepIndicator?: React.ReactNode;
  isPending?: boolean;
  error?: string | null;
  submitButtonType?: "button" | "submit";
  onBack: () => void;
  onConfirm?: (payload: PlanSelectionPayload) => void;
}

export function resolvePlanSelectorMode(
  cuentaActual: CuentaActualInfo | null,
  pruebaUsadaEn: string | null,
): PlanSelectorMode {
  if (cuentaActual !== null) return "additional_company";
  if (pruebaUsadaEn === null) return "new_registration";
  return "standalone_no_trial";
}

const PLANS: Array<{
  codigo: PlanCode;
  nombre: string;
  bajada: string;
  precioMensual: number;
  precioAnual: number;
  recomendado?: boolean;
  bullets: string[];
}> = [
  {
    codigo: "inicia",
    nombre: "Inicia",
    bajada: "Para ordenar tu negocio desde el día uno",
    precioMensual: 89,
    precioAnual: 890,
    bullets: [
      "3 usuarios incluidos",
      "1 empresa",
      "10 módulos: clientes, agenda, cotizaciones, trabajos, app del técnico y cobros",
    ],
  },
  {
    codigo: "crece",
    nombre: "Crece",
    bajada: "Para equipos que cobran, facturan y hacen seguimiento",
    precioMensual: 189,
    precioAnual: 1890,
    recomendado: true,
    bullets: [
      "8 usuarios incluidos",
      "Empresas ilimitadas",
      "Todo lo de Inicia y además: CRM y post venta, Cobros y finanzas, Reportes avanzados, Comprobantes SUNAT y 4 más",
    ],
  },
  {
    codigo: "empresa",
    nombre: "Empresa",
    bajada: "Para varias sedes, marketing y portal de clientes",
    precioMensual: 349,
    precioAnual: 3490,
    bullets: [
      "15 usuarios incluidos",
      "Empresas ilimitadas",
      "Todo lo de Crece y además: Marketing: campañas, referidos y Meta, Caja y bancos, Portal Hub del cliente, Multiempresa y 1 más",
    ],
  },
];

function formatPEN(amount: number): string {
  return `S/ ${amount.toLocaleString("es-PE")}`;
}

function getTrialEndDateFormatted(): string {
  const end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  return end.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function PlanSelectorStep({
  mode,
  companyName,
  cuentaActual = null,
  stepIndicator,
  isPending = false,
  error = null,
  submitButtonType = "button",
  onBack,
  onConfirm,
}: PlanSelectorStepProps) {
  const isAdditional = mode === "additional_company" && cuentaActual !== null;

  const [selectedOption, setSelectedOption] = useState<SelectedOption>(
    isAdditional ? "sumar_cuenta" : "crece",
  );
  const [periodo, setPeriodo] = useState<BillingPeriod>("mensual");

  const currentAccountPlanCode = (cuentaActual?.plan_codigo?.toLowerCase() ??
    "inicia") as PlanCode;
  const isCurrentInicia = currentAccountPlanCode === "inicia";

  // Prevención de degradación silenciosa (Empresa -> Crece):
  // Si elige "sumar_cuenta", cuando es "inicia" sube a "crece"; si ya es "crece" o "empresa", conserva su plan actual.
  const effectiveModo: "sumar_cuenta" | "plan_propio" =
    selectedOption === "sumar_cuenta" ? "sumar_cuenta" : "plan_propio";

  const effectivePlanCodigo: PlanCode =
    selectedOption === "sumar_cuenta"
      ? currentAccountPlanCode === "empresa"
        ? "empresa"
        : "crece"
      : selectedOption;

  const selectedPlanObj =
    PLANS.find((p) => p.codigo === effectivePlanCodigo) ?? PLANS[1]!;

  let primaryCtaLabel = "Empezar mis 30 días gratis";
  if (selectedOption === "sumar_cuenta") {
    primaryCtaLabel = isCurrentInicia
      ? "Subir a Crece y crear empresa"
      : "Sumar a mi cuenta y crear empresa";
  } else if (mode === "additional_company" || mode === "standalone_no_trial") {
    primaryCtaLabel = `Contratar ${selectedPlanObj.nombre} y crear empresa`;
  }

  const handlePrimaryClick = () => {
    if (submitButtonType === "button" && onConfirm) {
      onConfirm({
        modo: effectiveModo,
        planCodigo: effectivePlanCodigo,
        periodo,
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Inputs ocultos cuando se usa dentro de un <form> nativo (/register) */}
      <input type="hidden" name="planCode" value={effectivePlanCodigo} />
      <input type="hidden" name="periodo" value={periodo} />

      {/* A. Cabecera */}
      <div
        className={`mb-6 flex flex-col gap-2 ${
          stepIndicator ? "items-start" : "items-center"
        }`}
      >
        <VittklyLogo variant="wordmark" height={34} priority />
        {stepIndicator}
      </div>

      <div className="mb-5">
        <h1 className="text-ink text-2xl font-bold">Elige tu plan</h1>
        <p className="text-ink-muted mt-1 text-sm break-words">
          Para{" "}
          <span className="text-ink font-semibold">
            {companyName.trim() || "tu empresa"}
          </span>
          . Puedes cambiarlo cuando quieras.
        </p>
      </div>

      {/* B. Regla Condicional de "Sumarla a mi cuenta" vs Prueba Gratis */}
      {isAdditional ? (
        <>
          <button
            type="button"
            onClick={() => setSelectedOption("sumar_cuenta")}
            className={`relative w-full cursor-pointer rounded-xl border p-5 text-left transition-all ${
              selectedOption === "sumar_cuenta"
                ? "border-primary bg-primary/5 ring-primary ring-1"
                : "border-primary/50 bg-primary/5 hover:border-primary"
            }`}
          >
            <span className="bg-primary text-on-primary absolute -top-2.5 right-4 rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
              Recomendado
            </span>
            <h2 className="text-ink text-base font-bold">
              Sumarla a mi cuenta
            </h2>
            <p className="text-ink-muted mt-1 text-xs">
              Queda junto a{" "}
              <span className="text-ink font-semibold">
                {cuentaActual.empresa_actual_nombre ||
                  cuentaActual.cuenta_nombre}
              </span>
              : mismo plan, mismos usuarios y una sola factura. Una persona que
              trabaja en las dos cuenta una sola vez.
            </p>

            {isCurrentInicia ? (
              <div>
                <p className="text-ink mt-3 font-mono text-lg font-bold tabular-nums">
                  Sube a Crece: S/ 189{" "}
                  <span className="text-ink-muted font-sans text-xs font-normal">
                    al mes · hoy pagas S/ 89 con Inicia
                  </span>
                </p>
                <p className="text-ink-muted mt-0.5 text-xs">
                  Inicia incluye 1 empresa. Con Crece tienes empresas ilimitadas
                  y 8 usuarios.
                </p>
              </div>
            ) : (
              <p className="text-primary mt-3 text-base font-bold">
                Sin costo adicional en tu plan actual
              </p>
            )}
          </button>

          <p className="text-ink-muted my-5 text-xs">
            O, si es un negocio aparte (otro dueño u otra facturación),
            contrátale un plan propio, sin prueba gratis porque ya la usaste:
          </p>
        </>
      ) : mode === "new_registration" ? (
        <div className="border-primary/30 bg-primary/10 text-ink mb-5 rounded-lg border px-3.5 py-2.5 text-xs font-medium">
          30 días gratis con todos los módulos abiertos y sin tarjeta, hasta el{" "}
          <span className="font-mono font-semibold tabular-nums">
            {getTrialEndDateFormatted()}
          </span>
          .
        </div>
      ) : (
        <div className="border-line bg-surface-raised text-ink-muted mb-5 rounded-lg border px-3.5 py-2.5 text-xs font-medium">
          Ya usaste tu prueba gratis anteriormente. Elige el plan propio para
          esta empresa:
        </div>
      )}

      {/* C. Selector de Periodicidad (Mensual / Anual) */}
      <div className="bg-surface-raised border-line mb-5 inline-flex max-w-full flex-wrap gap-1 rounded-lg border p-1">
        <button
          type="button"
          onClick={() => setPeriodo("mensual")}
          className={`min-h-[38px] cursor-pointer rounded-md px-3.5 py-1.5 text-xs transition-colors ${
            periodo === "mensual"
              ? "bg-primary text-on-primary font-semibold"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          Mensual
        </button>
        <button
          type="button"
          onClick={() => setPeriodo("anual")}
          className={`min-h-[38px] cursor-pointer rounded-md px-3.5 py-1.5 text-xs transition-colors ${
            periodo === "anual"
              ? "bg-primary text-on-primary font-semibold"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          Anual · pagas 10 meses
        </button>
      </div>

      {/* D. Grilla de 3 Tarjetas de Planes */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {PLANS.map((plan) => {
          const isSelected = selectedOption === plan.codigo;
          const amount =
            periodo === "anual" ? plan.precioAnual : plan.precioMensual;
          const periodSuffix = periodo === "anual" ? "al año" : "al mes";

          return (
            <button
              key={plan.codigo}
              type="button"
              onClick={() => setSelectedOption(plan.codigo)}
              className={`bg-surface-raised relative flex cursor-pointer flex-col justify-between rounded-xl border p-5 text-left transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 ring-primary ring-1"
                  : "border-line hover:border-primary/40"
              }`}
            >
              {plan.recomendado && (
                <span className="bg-primary text-on-primary absolute -top-2.5 right-4 rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
                  Recomendado
                </span>
              )}

              <div>
                <h3 className="text-ink text-base font-bold">{plan.nombre}</h3>
                <p className="text-ink-muted mt-1 text-xs leading-snug">
                  {plan.bajada}
                </p>

                <p className="text-ink mt-4 font-mono text-2xl font-bold tabular-nums">
                  {formatPEN(amount)}{" "}
                  <span className="text-ink-muted font-sans text-xs font-normal">
                    {periodSuffix}
                  </span>
                </p>

                <ul className="text-ink-muted mt-4 list-disc space-y-1.5 pl-4 text-xs">
                  {plan.bullets.map((bullet) => (
                    <li key={bullet} className="leading-snug">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </button>
          );
        })}
      </div>

      {/* E. Nota Legal y Botones de Confirmación */}
      <p className="text-ink-muted mt-5 text-xs">
        {mode === "new_registration"
          ? "Precios con IGV. Hoy no pagas nada; al terminar tus 30 días gratis sigues con el plan elegido."
          : "Precios con IGV. El cambio de plan se cobra desde tu próxima factura."}
      </p>

      {error && (
        <div
          role="alert"
          className="border-danger/30 bg-danger/10 text-danger mt-4 rounded-lg border px-3.5 py-2.5 text-xs font-medium"
        >
          {error}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3 sm:gap-4">
        <button
          type={submitButtonType}
          disabled={isPending}
          onClick={handlePrimaryClick}
          className="bg-primary text-on-primary min-h-[44px] cursor-pointer rounded-lg px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Procesando..." : primaryCtaLabel}
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={onBack}
          className="text-ink-muted hover:text-ink min-h-[44px] cursor-pointer px-2 text-sm disabled:opacity-50"
        >
          Volver
        </button>
      </div>
    </div>
  );
}
