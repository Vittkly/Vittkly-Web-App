'use client';

import React, { useState, useEffect, useActionState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, AlertCircle, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { loginAction } from '@/features/auth/actions/auth.actions';
import type { AuthActionState } from '@/features/auth/types/auth.types';

const initialState: AuthActionState = {
  error: null,
  message: null,
  success: false,
};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const wasUpdated = searchParams.get('updated') === 'true';
  const urlError = searchParams.get('error');

  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);
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

  // Cálculo derivado en tiempo real sin estados redundantes
  const targetTime = state.blockedUntil ? new Date(state.blockedUntil).getTime() : 0;
  const countdown = Math.max(0, Math.ceil((targetTime - now) / 1000));
  const isLocked = countdown > 0;
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const timeFormatted =
    minutes > 0
      ? `${minutes}m ${seconds.toString().padStart(2, '0')}s`
      : `${seconds}s`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5 text-center sm:text-left">
        <h1 className="text-ink text-2xl font-bold tracking-tight">
          Iniciar Sesión
        </h1>
        <p className="text-soft text-sm">
          Ingresa tus credenciales para acceder a la Central Web.
        </p>
      </div>

      {/* Alerta de contraseña actualizada exitosamente */}
      {wasUpdated && (
        <div
          role="status"
          className="border-success/30 bg-success-soft text-success-ink flex items-start gap-3 rounded-lg border p-3.5 text-xs font-medium"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          <span>
            Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión con tu nueva clave.
          </span>
        </div>
      )}

      {/* Alerta de enlace expirado */}
      {urlError === 'enlace_expirado' && (
        <div
          role="alert"
          className="border-warning/30 bg-warning-soft text-warning-ink flex items-start gap-3 rounded-lg border p-3.5 text-xs font-medium"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <span>
            El enlace de recuperación ha expirado o ya fue utilizado. Solicita uno nuevo.
          </span>
        </div>
      )}

      {/* Alerta de bloqueo por fuerza bruta con cuenta regresiva en vivo */}
      {isLocked && (
        <div
          role="alert"
          className="border-danger/30 bg-danger-soft text-danger-ink flex items-start gap-3 rounded-lg border p-3.5 text-xs font-medium"
        >
          <Clock className="text-danger mt-0.5 h-4 w-4 shrink-0 animate-pulse" />
          <div className="flex flex-col gap-1">
            <span className="font-semibold">Acceso bloqueado temporalmente</span>
            <span>
              Has superado el límite de intentos fallidos. Por tu seguridad, espera{' '}
              <span className="font-mono text-sm font-bold tabular-nums">
                {timeFormatted}
              </span>{' '}
              antes de volver a intentar.
            </span>
          </div>
        </div>
      )}

      {/* Mensaje de error genérico anti-enumeración */}
      {!isLocked && state.error && (
        <div
          role="alert"
          className="border-danger/30 bg-danger-soft text-danger-ink flex items-start gap-3 rounded-lg border p-3.5 text-xs font-medium"
        >
          <AlertCircle className="text-danger mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <form action={formAction} className="flex flex-col gap-4.5">
        {/* Campo Correo Electrónico */}
        <div className="flex flex-col gap-1.5 text-left">
          <label
            htmlFor="email"
            className="text-soft text-xs font-semibold tracking-wide uppercase select-none"
          >
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={isPending || isLocked}
            placeholder="tu.correo@empresa.com"
            className="border-line text-ink bg-surface-raised placeholder:text-soft/60 focus-visible:outline-accent h-12 w-full rounded-md border px-3.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Campo Contraseña con Toggle de Visibilidad */}
        <div className="flex flex-col gap-1.5 text-left">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-soft text-xs font-semibold tracking-wide uppercase select-none"
            >
              Contraseña
            </label>
            <Link
              href="/olvide-contrasena"
              tabIndex={isPending ? -1 : 0}
              className="text-accent hover:text-primary-hover text-xs font-semibold transition-colors focus-visible:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative flex items-center">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              disabled={isPending || isLocked}
              placeholder="••••••••"
              className="border-line text-ink bg-surface-raised placeholder:text-soft/60 focus-visible:outline-accent h-12 w-full rounded-md border pr-11 pl-3.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              className="text-soft hover:text-ink absolute right-3 inline-flex p-1 transition-colors focus-visible:outline-none"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Botón Primario de Envío */}
        <button
          type="submit"
          disabled={isPending || isLocked}
          className="bg-primary hover:bg-primary-hover text-on-primary focus-visible:outline-focus mt-2 flex h-12 w-full select-none items-center justify-center gap-2 rounded-full text-[15px] font-bold shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Verificando...</span>
            </>
          ) : isLocked ? (
            <span>Bloqueado ({timeFormatted})</span>
          ) : (
            <span>Ingresar a la Central</span>
          )}
        </button>
      </form>
    </div>
  );
}
