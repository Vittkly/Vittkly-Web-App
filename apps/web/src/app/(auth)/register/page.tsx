'use client';

import React, { useState, useActionState, Suspense } from 'react';
import Link from 'next/link';
import { registerAction } from '@/features/auth/actions/auth.actions';
import type { AuthActionState } from '@/features/auth/types/auth.types';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { PasswordField } from '@/components/ui/PasswordField';
import { FeedbackBanner } from '@/components/ui/FeedbackBanner';
import { Badge } from '@/components/ui/Badge';
import { clsx } from 'clsx';

const initialState: AuthActionState = {
  error: null,
  message: null,
  success: false,
};

const PLAN_OPTIONS = [
  {
    code: 'inicia',
    name: 'Inicia',
    users: '2 usuarios',
    modulesCount: '19 módulos',
    desc: 'Ideal para pequeñas empresas de servicios por visita.',
    recommended: false,
  },
  {
    code: 'crece',
    name: 'Crece',
    users: '5 usuarios',
    modulesCount: '24 módulos',
    desc: 'Incluye Inventario, Academia y Convenios.',
    recommended: false,
  },
  {
    code: 'empresa',
    name: 'Empresa',
    users: '15 usuarios',
    modulesCount: '28 módulos',
    desc: 'Todo incluido: Licitaciones, API e integraciones.',
    recommended: true,
  },
] as const;

function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);
  const [selectedPlan, setSelectedPlan] = useState<'inicia' | 'crece' | 'empresa'>('empresa');
  const [passwordValue, setPasswordValue] = useState('');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5 text-center sm:text-left">
        <h1 className="text-ink text-2xl font-bold tracking-tight">Crear Cuenta</h1>
        <p className="text-soft text-sm">
          Registra tu empresa y comienza tu período de prueba en la Central Web.
        </p>
      </div>

      {state.error && (
        <FeedbackBanner
          variant="danger"
          message={state.error}
        />
      )}

      <form action={formAction} className="flex flex-col gap-4">
        {/* Nombre del Titular */}
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

        {/* Nombre de la Empresa */}
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

        {/* RUC Opcional */}
        <TextField
          id="ruc"
          name="ruc"
          label="RUC (Opcional)"
          placeholder="11 dígitos (ej. 20601234567)"
          maxLength={11}
          disabled={isPending}
          hint="Opcional. Puedes completarlo luego en la configuración."
          error={state.fieldErrors?.ruc}
        />

        {/* Selector de Plan Inicial (seed.sql) */}
        <div className="flex flex-col gap-2 text-left">
          <label className="text-soft text-xs font-semibold tracking-wide uppercase select-none">
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
                    'relative flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all',
                    isSelected
                      ? 'border-primary bg-primary-soft/40 shadow-xs ring-1 ring-primary'
                      : 'border-line bg-surface-raised hover:border-line-strong'
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="font-bold text-ink">{plan.name}</span>
                    {plan.recommended && (
                      <Badge variant="primary" size="sm">
                        Popular
                      </Badge>
                    )}
                  </div>
                  <span className="font-mono text-[11px] text-soft">{plan.users}</span>
                  <span className="text-[11px] font-semibold text-primary-ink">
                    {plan.modulesCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Correo Electrónico */}
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

        {/* Contraseña con Checklist */}
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

        {/* Confirmar Contraseña */}
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

      {/* Enlace para volver al login */}
      <div className="border-line border-t pt-4 text-center">
        <p className="text-soft text-xs">
          ¿Ya tienes una cuenta registrada?{' '}
          <Link
            href="/login"
            className="text-accent hover:text-primary-hover font-bold transition-colors focus-visible:underline"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="bg-line/60 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
