'use client';

import React, { useState, useActionState, useMemo } from 'react';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  Loader2,
  Lock,
} from 'lucide-react';
import { evaluatePasswordStrength } from '@vittkly/shared';
import { resetPasswordAction } from '@/features/auth/actions/auth.actions';
import type { AuthActionState } from '@/features/auth/types/auth.types';

const initialState: AuthActionState = {
  error: null,
  message: null,
  success: false,
};

export default function RestablecerContrasenaPage() {
  const [state, formAction, isPending] = useActionState(
    resetPasswordAction,
    initialState
  );

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Evaluación interactiva en tiempo real de los 4 criterios de seguridad
  const strength = useMemo(() => evaluatePasswordStrength(password), [password]);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isFormValid = strength.isValid && passwordsMatch;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5 text-center sm:text-left">
        <h1 className="text-ink text-2xl font-bold tracking-tight">
          Nueva Contraseña
        </h1>
        <p className="text-soft text-sm">
          Crea una contraseña segura para proteger tu cuenta de Vittkly.
        </p>
      </div>

      {state.error && (
        <div
          role="alert"
          className="border-danger/30 bg-danger-soft text-danger-ink flex items-start gap-3 rounded-lg border p-3.5 text-xs font-medium"
        >
          <AlertCircle className="text-danger mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <form action={formAction} className="flex flex-col gap-4.5">
        {/* Campo Nueva Contraseña */}
        <div className="flex flex-col gap-1.5 text-left">
          <label
            htmlFor="password"
            className="text-soft text-xs font-semibold tracking-wide uppercase select-none"
          >
            Nueva contraseña
          </label>
          <div className="relative flex items-center">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              disabled={isPending}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        {/* Checklist interactivo en tiempo real de los 4 requisitos */}
        <div className="border-line bg-surface-sunken flex flex-col gap-2 rounded-lg border p-3 text-xs">
          <span className="text-soft font-semibold">
            Requisitos de seguridad:
          </span>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            <div
              className={`flex items-center gap-1.5 transition-colors ${
                strength.minLength ? 'text-success-ink font-medium' : 'text-soft'
              }`}
            >
              {strength.minLength ? (
                <Check className="text-success h-3.5 w-3.5 shrink-0" />
              ) : (
                <div className="border-line h-3.5 w-3.5 shrink-0 rounded-full border" />
              )}
              <span>Mínimo 8 caracteres</span>
            </div>

            <div
              className={`flex items-center gap-1.5 transition-colors ${
                strength.hasUppercase ? 'text-success-ink font-medium' : 'text-soft'
              }`}
            >
              {strength.hasUppercase ? (
                <Check className="text-success h-3.5 w-3.5 shrink-0" />
              ) : (
                <div className="border-line h-3.5 w-3.5 shrink-0 rounded-full border" />
              )}
              <span>Una mayúscula (A-Z)</span>
            </div>

            <div
              className={`flex items-center gap-1.5 transition-colors ${
                strength.hasNumber ? 'text-success-ink font-medium' : 'text-soft'
              }`}
            >
              {strength.hasNumber ? (
                <Check className="text-success h-3.5 w-3.5 shrink-0" />
              ) : (
                <div className="border-line h-3.5 w-3.5 shrink-0 rounded-full border" />
              )}
              <span>Un número (0-9)</span>
            </div>

            <div
              className={`flex items-center gap-1.5 transition-colors ${
                strength.hasSpecialChar ? 'text-success-ink font-medium' : 'text-soft'
              }`}
            >
              {strength.hasSpecialChar ? (
                <Check className="text-success h-3.5 w-3.5 shrink-0" />
              ) : (
                <div className="border-line h-3.5 w-3.5 shrink-0 rounded-full border" />
              )}
              <span>Un símbolo o signo</span>
            </div>
          </div>
        </div>

        {/* Campo Confirmar Contraseña */}
        <div className="flex flex-col gap-1.5 text-left">
          <label
            htmlFor="confirmPassword"
            className="text-soft text-xs font-semibold tracking-wide uppercase select-none"
          >
            Confirmar contraseña
          </label>
          <div className="relative flex items-center">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              disabled={isPending}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className={`border-line text-ink bg-surface-raised placeholder:text-soft/60 focus-visible:outline-accent h-12 w-full rounded-md border pr-11 pl-3.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${
                confirmPassword.length > 0 && !passwordsMatch
                  ? 'border-danger focus-visible:outline-danger'
                  : ''
              }`}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={
                showConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'
              }
              className="text-soft hover:text-ink absolute right-3 inline-flex p-1 transition-colors focus-visible:outline-none"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Feedback de coincidencia */}
          {confirmPassword.length > 0 && (
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              {passwordsMatch ? (
                <span className="text-success-ink flex items-center gap-1 font-medium">
                  <Check className="text-success h-3.5 w-3.5" />
                  Las contraseñas coinciden
                </span>
              ) : (
                <span className="text-danger-ink flex items-center gap-1 font-medium">
                  <X className="text-danger h-3.5 w-3.5" />
                  Las contraseñas no coinciden
                </span>
              )}
            </div>
          )}
        </div>

        {/* Botón de Actualizar Contraseña */}
        <button
          type="submit"
          disabled={isPending || !isFormValid}
          className="bg-primary hover:bg-primary-hover text-on-primary focus-visible:outline-focus mt-2 flex h-12 w-full select-none items-center justify-center gap-2 rounded-full text-[15px] font-bold shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Actualizando contraseña...</span>
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              <span>Actualizar contraseña</span>
            </>
          )}
        </button>

        <div className="mt-2 text-center">
          <Link
            href="/login"
            className="text-soft hover:text-ink text-xs font-semibold transition-colors"
          >
            Cancelar y volver al login
          </Link>
        </div>
      </form>
    </div>
  );
}
