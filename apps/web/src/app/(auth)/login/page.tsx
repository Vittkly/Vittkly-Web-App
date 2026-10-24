'use client';

import React, { useState, useEffect, useActionState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Clock, KeyRound, ChevronDown, ChevronUp } from 'lucide-react';
import { loginAction } from '@/features/auth/actions/auth.actions';
import type { AuthActionState } from '@/features/auth/types/auth.types';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { PasswordField } from '@/components/ui/PasswordField';
import { FeedbackBanner } from '@/components/ui/FeedbackBanner';

const initialState: AuthActionState = {
  error: null,
  message: null,
  success: false,
};

const SEED_TEST_ACCOUNTS = [
  {
    label: 'Administrador (Plan Empresa)',
    email: 'admin@vittakleanly.test',
    area: 'Administración · Acceso total',
  },
  {
    label: 'Supervisor (Plan Empresa)',
    email: 'supervisor@vittakleanly.test',
    area: 'Operaciones y Validación',
  },
  {
    label: 'Ventas (Plan Empresa)',
    email: 'ventas@vittakleanly.test',
    area: 'Cotizaciones y Clientes',
  },
  {
    label: 'Contabilidad (Plan Empresa)',
    email: 'contabilidad@vittakleanly.test',
    area: 'Finanzas, Cobros y Bancos',
  },
  {
    label: 'Administrador Prueba (Plan Crece)',
    email: 'admin@empresaprueba.test',
    area: 'Segunda Empresa · Plan Crece',
  },
  {
    label: 'Técnico de Campo (Sin Acceso Web)',
    email: 'tecnico@vittakleanly.test',
    area: 'Solo App Móvil (Prueba RLS/Permiso)',
  },
];

function LoginForm() {
  const searchParams = useSearchParams();
  const wasUpdated = searchParams.get('updated') === 'true';
  const urlError = searchParams.get('error');

  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [showSeedAccounts, setShowSeedAccounts] = useState(false);
  const [now, setNow] = useState<number>(() => Date.now());

  // Actualizar el reloj cada segundo solo si hay un bloqueo temporal activo
  useEffect(() => {
    if (!state.blockedUntil) return;
    const target = new Date(state.blockedUntil).getTime();
    if (target <= Date.now()) return;

    const interval = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= target) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.blockedUntil]);

  const targetTime = state.blockedUntil ? new Date(state.blockedUntil).getTime() : 0;
  const countdown = Math.max(0, Math.ceil((targetTime - now) / 1000));
  const isLocked = countdown > 0;
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const timeFormatted =
    minutes > 0
      ? `${minutes}m ${seconds.toString().padStart(2, '0')}s`
      : `${seconds}s`;

  const fillAccount = (email: string) => {
    setEmailValue(email);
    setPasswordValue('Prueba123!');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5 text-center sm:text-left">
        <h1 className="text-ink text-2xl font-bold tracking-tight">Iniciar Sesión</h1>
        <p className="text-soft text-sm">
          Ingresa tus credenciales para acceder a la Central Web.
        </p>
      </div>

      {/* Alerta de contraseña actualizada exitosamente */}
      {wasUpdated && (
        <FeedbackBanner
          variant="success"
          message="Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión con tu nueva clave."
        />
      )}

      {/* Alerta de enlace expirado */}
      {urlError === 'enlace_expirado' && (
        <FeedbackBanner
          variant="warning"
          message="El enlace de recuperación ha expirado o ya fue utilizado. Solicita uno nuevo."
        />
      )}

      {/* Alerta de bloqueo por fuerza bruta con cuenta regresiva en vivo */}
      {isLocked && (
        <FeedbackBanner
          variant="danger"
          icon={<Clock className="text-danger mt-0.5 h-4 w-4 shrink-0 animate-pulse" />}
          title="Acceso bloqueado temporalmente"
          message={
            <span>
              Has superado el límite de intentos fallidos. Por tu seguridad, espera{' '}
              <span className="font-mono text-sm font-bold tabular-nums">{timeFormatted}</span>{' '}
              antes de volver a intentar.
            </span>
          }
        />
      )}

      {/* Mensaje de error genérico anti-enumeración */}
      {!isLocked && state.error && (
        <FeedbackBanner variant="danger" message={state.error} />
      )}

      <form action={formAction} className="flex flex-col gap-4">
        <TextField
          id="email"
          name="email"
          type="email"
          label="Correo electrónico"
          autoComplete="email"
          required
          disabled={isPending || isLocked}
          value={emailValue}
          onChange={(e) => setEmailValue(e.target.value)}
          placeholder="tu.correo@empresa.com"
        />

        <PasswordField
          id="password"
          name="password"
          label="Contraseña"
          autoComplete="current-password"
          required
          disabled={isPending || isLocked}
          value={passwordValue}
          onChange={(e) => setPasswordValue(e.target.value)}
          placeholder="••••••••"
          forgotPasswordHref="/olvide-contrasena"
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          block
          loading={isPending}
          loadingText="Verificando credenciales..."
          disabled={isLocked}
          className="mt-2"
        >
          {isLocked ? `Bloqueado (${timeFormatted})` : 'Ingresar a la Central'}
        </Button>
      </form>

      {/* Enlace para registrar cuenta nueva */}
      <div className="border-line border-t pt-4 text-center">
        <p className="text-soft text-xs">
          ¿Aún no tienes una cuenta?{' '}
          <Link
            href="/register"
            className="text-accent hover:text-primary-hover font-bold transition-colors focus-visible:underline"
          >
            Registra tu empresa gratis
          </Link>
        </p>
      </div>

      {/* Selector rápido de cuentas de prueba de seed.sql para revisión ágil */}
      <div className="border-line/60 bg-surface-sunken/40 rounded-lg border p-3 text-left">
        <button
          type="button"
          onClick={() => setShowSeedAccounts(!showSeedAccounts)}
          className="text-soft hover:text-ink flex w-full items-center justify-between text-xs font-semibold select-none"
        >
          <span className="flex items-center gap-1.5">
            <KeyRound className="h-3.5 w-3.5 text-primary" />
            Cuentas de Prueba Staging (seed.sql)
          </span>
          {showSeedAccounts ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>

        {showSeedAccounts && (
          <div className="mt-2.5 flex flex-col gap-1.5 border-t border-line/40 pt-2">
            <p className="text-soft text-[11px]">
              Haz clic en cualquier cuenta para autocompletar credenciales (clave:{' '}
              <span className="font-mono font-bold text-ink">Prueba123!</span>):
            </p>
            <div className="flex flex-col gap-1">
              {SEED_TEST_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillAccount(acc.email)}
                  className="hover:bg-surface-raised flex items-center justify-between rounded p-1.5 text-left text-xs transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-ink">{acc.label}</span>
                    <span className="font-mono text-[11px] text-soft">{acc.email}</span>
                  </div>
                  <span className="text-[10px] text-soft italic">{acc.area}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="bg-line/60 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
