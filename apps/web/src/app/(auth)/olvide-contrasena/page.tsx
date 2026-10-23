'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { forgotPasswordAction } from '@/features/auth/actions/auth.actions';
import type { AuthActionState } from '@/features/auth/types/auth.types';

const initialState: AuthActionState = {
  error: null,
  message: null,
  success: false,
};

export default function OlvideContrasenaPage() {
  const [state, formAction, isPending] = useActionState(
    forgotPasswordAction,
    initialState
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5 text-center sm:text-left">
        <h1 className="text-ink text-2xl font-bold tracking-tight">
          Recuperar Contraseña
        </h1>
        <p className="text-soft text-sm">
          Ingresa tu correo electrónico registrado y te enviaremos las instrucciones de restablecimiento.
        </p>
      </div>

      {/* Estado de confirmación anti-enumeración exitoso */}
      {state.success ? (
        <div className="flex flex-col items-center gap-5 text-center sm:items-start sm:text-left">
          <div className="border-success/30 bg-success-soft text-success-ink flex w-full items-start gap-3 rounded-lg border p-4 text-sm font-medium">
            <CheckCircle2 className="text-success mt-0.5 h-5 w-5 shrink-0" />
            <div className="flex flex-col gap-1">
              <span className="font-bold text-ink">Instrucciones enviadas</span>
              <span>{state.message}</span>
              <span className="text-soft mt-1 text-xs">
                Revisa tu bandeja de entrada y la carpeta de spam o correo no deseado.
              </span>
            </div>
          </div>

          <Link
            href="/login"
            className="text-accent hover:text-primary-hover inline-flex items-center gap-2 text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al inicio de sesión</span>
          </Link>
        </div>
      ) : (
        <form action={formAction} className="flex flex-col gap-4.5">
          {state.error && (
            <div
              role="alert"
              className="border-danger/30 bg-danger-soft text-danger-ink flex items-start gap-3 rounded-lg border p-3.5 text-xs font-medium"
            >
              <AlertCircle className="text-danger mt-0.5 h-4 w-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5 text-left">
            <label
              htmlFor="email"
              className="text-soft text-xs font-semibold tracking-wide uppercase select-none"
            >
              Correo electrónico
            </label>
            <div className="relative flex items-center">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={isPending}
                placeholder="tu.correo@empresa.com"
                className="border-line text-ink bg-surface-raised placeholder:text-soft/60 focus-visible:outline-accent h-12 w-full rounded-md border pr-3.5 pl-10 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Mail className="text-soft absolute left-3.5 h-4 w-4" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="bg-primary hover:bg-primary-hover text-on-primary focus-visible:outline-focus mt-2 flex h-12 w-full select-none items-center justify-center gap-2 rounded-full text-[15px] font-bold shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Enviando enlace...</span>
              </>
            ) : (
              <span>Enviar instrucciones</span>
            )}
          </button>

          <div className="mt-2 text-center">
            <Link
              href="/login"
              className="text-soft hover:text-ink inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Regresar al login</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
