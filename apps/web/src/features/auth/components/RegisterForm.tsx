"use client";

import React, { useState, useActionState } from "react";
import Link from "next/link";
import { registerAction } from "@/features/auth/actions/auth.actions";
import type { AuthActionState } from "@/features/auth/types/auth.types";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { PasswordField } from "@/components/ui/PasswordField";
import { FeedbackBanner } from "@/components/ui/FeedbackBanner";
import { Badge } from "@/components/ui/Badge";
import { clsx } from "clsx";

const initialState: AuthActionState = {
  error: null,
  message: null,
  success: false,
};

const PLAN_OPTIONS = [
  {
    code: "inicia",
    name: "Inicia",
    users: "2 usuarios",
    modulesCount: "19 módulos",
    desc: "Ideal para pequeñas empresas de servicios por visita.",
    recommended: false,
  },
  {
    code: "crece",
    name: "Crece",
    users: "5 usuarios",
    modulesCount: "24 módulos",
    desc: "Incluye Inventario, Academia y Convenios.",
    recommended: false,
  },
  {
    code: "empresa",
    name: "Empresa",
    users: "15 usuarios",
    modulesCount: "28 módulos",
    desc: "Todo incluido: Licitaciones, API e integraciones.",
    recommended: true,
  },
] as const;

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialState,
  );
  const [selectedPlan, setSelectedPlan] = useState<
    "inicia" | "crece" | "empresa"
  >("empresa");
  const [passwordValue, setPasswordValue] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start">
          <Badge variant="plan" size="sm" mono>
            Portal Empresas (Tenants B2B)
          </Badge>
        </div>
        <h1 className="text-ink text-2xl font-extrabold tracking-tight">
          Crear Cuenta
        </h1>
        <p className="text-ink-muted text-xs sm:text-sm">
          Registra tu empresa y comienza tu período de prueba de 15 días en la
          Central Web.
        </p>
      </div>

      {state.error && <FeedbackBanner variant="danger" message={state.error} />}

      <form action={formAction} className="flex flex-col gap-4">
        <TextField
          id="fullName"
          name="fullName"
          label="Nombre completo del titular"
          placeholder="Ej. Juan Pérez"
          autoComplete="name"
          required
          disabled={isPending}
          error={state.fieldErrors?.fullName}
        />

        <TextField
          id="companyName"
          name="companyName"
          label="Empresa o Razón Social"
          placeholder="Ej. Servicios Generales SAC"
          autoComplete="organization"
          required
          disabled={isPending}
          error={state.fieldErrors?.companyName}
        />

        <TextField
          id="ruc"
          name="ruc"
          label="RUC (Opcional)"
          placeholder="11 dígitos (ej. 20601234567)"
          maxLength={11}
          disabled={isPending}
          hint="Opcional. Puedes completarlo luego en la configuración."
          error={state.fieldErrors?.ruc}
          className="font-mono tabular-nums"
        />

        <div className="flex flex-col gap-2 text-left">
          <label className="text-ink-muted text-xs font-bold tracking-wide uppercase select-none">
            Plan inicial de prueba (15 días gratis)
          </label>
          <input type="hidden" name="planCode" value={selectedPlan} />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {PLAN_OPTIONS.map((plan) => {
              const isSelected = selectedPlan === plan.code;
              return (
                <button
                  key={plan.code}
                  type="button"
                  onClick={() => setSelectedPlan(plan.code)}
                  className={clsx(
                    "relative flex cursor-pointer flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all duration-150",
                    isSelected
                      ? "border-primary bg-primary-soft/40 ring-primary/25 shadow-xs ring-2"
                      : "border-line bg-surface-raised hover:border-line-strong",
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-ink font-bold">{plan.name}</span>
                    {plan.recommended && (
                      <Badge variant="primary" size="sm">
                        Popular
                      </Badge>
                    )}
                  </div>
                  <span className="text-ink-muted font-mono text-[11px] tabular-nums">
                    {plan.users}
                  </span>
                  <span className="text-primary-ink text-[11px] font-semibold tabular-nums">
                    {plan.modulesCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <TextField
          id="email"
          name="email"
          type="email"
          label="Correo corporativo"
          placeholder="tu.correo@empresa.com"
          autoComplete="email"
          required
          disabled={isPending}
          error={state.fieldErrors?.email}
        />

        <PasswordField
          id="password"
          name="password"
          label="Contraseña"
          autoComplete="new-password"
          required
          disabled={isPending}
          value={passwordValue}
          onChange={(e) => setPasswordValue(e.target.value)}
          placeholder="••••••••"
          showStrengthChecklist
          error={state.fieldErrors?.password}
        />

        <PasswordField
          id="confirmPassword"
          name="confirmPassword"
          label="Confirmar contraseña"
          autoComplete="new-password"
          required
          disabled={isPending}
          placeholder="••••••••"
          error={state.fieldErrors?.confirmPassword}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          block
          loading={isPending}
          loadingText="Aprovisionando empresa y módulos..."
          className="mt-2"
        >
          Crear cuenta y comenzar
        </Button>
      </form>

      <div className="border-line flex flex-col gap-1.5 border-t pt-4 text-center">
        <p className="text-ink-muted text-xs">
          ¿Ya tienes una cuenta registrada?{" "}
          <Link
            href="/login"
            className="text-accent hover:text-primary-hover font-bold transition-colors focus-visible:underline"
          >
            Inicia sesión
          </Link>
        </p>
        <p className="text-ink-muted text-xs">
          ¿Fuiste invitado por una empresa?{" "}
          <Link
            href="/invitado"
            className="text-accent hover:text-primary-hover font-bold transition-colors focus-visible:underline"
          >
            Acceder con invitación
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterForm;
