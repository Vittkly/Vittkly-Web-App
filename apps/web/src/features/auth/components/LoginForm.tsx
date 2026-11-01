"use client";

import React, { useState, useEffect, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Clock, Users, Smartphone, AlertCircle, X } from "lucide-react";
import { loginAction } from "@/features/auth/actions/auth.actions";
import type { AuthActionState } from "@/features/auth/types/auth.types";
import { VittklyLogo } from "@/components/brand/VittklyLogo";

const initialState: AuthActionState = {
  error: null,
  message: null,
  success: false,
};

export function LoginForm() {
  const searchParams = useSearchParams();
  const wasUpdated = searchParams.get("updated") === "true";
  const urlError = searchParams.get("error");

  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [now, setNow] = useState<number>(() => Date.now());
  const [showTecModal, setShowTecModal] = useState(false);

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

  const targetTime = state.blockedUntil
    ? new Date(state.blockedUntil).getTime()
    : 0;
  const countdown = Math.max(0, Math.ceil((targetTime - now) / 1000));
  const isLocked = countdown > 0;
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const timeFormatted =
    minutes > 0
      ? `${minutes}m ${seconds.toString().padStart(2, "0")}s`
      : `${seconds}s`;

  return (
    <div className="bg-surface-raised border-line shadow-2 relative z-10 flex w-full max-w-[400px] flex-col gap-3.5 rounded-[18px] border p-6 transition-colors sm:p-7">
      {/* Cabecera del Card: Logo y Título */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="focus-visible:outline-focus inline-flex items-center transition-opacity hover:opacity-90 focus-visible:outline-2"
          >
            <VittklyLogo variant="wordmark" height={34} priority />
          </Link>
        </div>
        <h1
          id="lgT"
          className="text-ink mt-1 text-xl font-bold tracking-tight sm:text-[1.32rem]"
        >
          Te damos la bienvenida
        </h1>
      </div>

      {/* Tabs de Selección: Iniciar Sesión / Crear Cuenta */}
      <div
        className="bg-surface-sunken grid grid-cols-2 gap-1 rounded-xl p-1"
        role="tablist"
        aria-label="Acceso"
      >
        <button
          type="button"
          role="tab"
          aria-selected="true"
          className="bg-surface-raised text-primary-ink flex min-h-[38px] cursor-default items-center justify-center rounded-lg border-0 text-xs font-bold shadow-xs select-none"
        >
          Iniciar sesión
        </button>
        <Link
          href="/register"
          role="tab"
          aria-selected="false"
          className="text-ink-muted hover:text-ink flex min-h-[38px] cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-xs font-bold transition-colors select-none"
        >
          Crear cuenta
        </Link>
      </div>

      {/* Banners de Estado y Errores */}
      {wasUpdated && (
        <div className="bg-success-soft text-success-ink border-success/20 animate-sc-in flex items-center gap-2.5 rounded-xl border p-3 text-xs font-semibold">
          <span>
            Tu contraseña ha sido actualizada exitosamente. Ya puedes ingresar
            con tu nueva clave.
          </span>
        </div>
      )}

      {urlError === "enlace_expirado" && (
        <div className="bg-warning-soft text-warning-ink border-warning/20 animate-sc-in flex items-center gap-2.5 rounded-xl border p-3 text-xs font-semibold">
          <span>
            El enlace de recuperación ha expirado o ya fue utilizado. Solicita
            uno nuevo.
          </span>
        </div>
      )}

      {isLocked && (
        <div className="bg-danger-soft text-danger-ink border-danger/20 animate-sc-in flex items-start gap-2.5 rounded-xl border p-3 text-xs font-semibold">
          <Clock className="text-danger mt-0.5 h-4 w-4 shrink-0 animate-pulse" />
          <span>
            Has superado el límite de intentos fallidos. Por tu seguridad,
            espera{" "}
            <b className="text-danger font-mono tabular-nums">
              {timeFormatted}
            </b>{" "}
            antes de volver a intentar.
          </span>
        </div>
      )}

      {!isLocked && state.error && (
        <div className="bg-danger-soft text-danger-ink border-danger/20 animate-sc-in flex items-start gap-2.5 rounded-xl border p-3 text-xs font-semibold">
          <AlertCircle className="text-danger mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Formulario Principal de Autenticación */}
      <form action={formAction} className="flex flex-col gap-3">
        {/* Campo Correo */}
        <div className="flex flex-col gap-1">
          <label htmlFor="lgU" className="text-ink text-xs font-semibold">
            Correo
          </label>
          <input
            type="email"
            id="lgU"
            name="email"
            autoComplete="username"
            inputMode="email"
            required
            disabled={isPending || isLocked}
            value={emailValue}
            onChange={(e) => setEmailValue(e.target.value)}
            placeholder="nombre@empresa.com"
            className="border-line bg-surface-raised text-ink focus-visible:outline-primary focus-visible:border-primary min-h-[44px] w-full rounded-xl border px-3.5 text-sm transition-all focus-visible:outline-2 disabled:opacity-50"
          />
        </div>

        {/* Campo Contraseña */}
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between">
            <label htmlFor="lgP" className="text-ink text-xs font-semibold">
              Contraseña
            </label>
            <Link
              href="/olvide-contrasena"
              className="text-primary-ink hover:text-primary-hover text-xs font-bold transition-colors hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative flex items-center">
            <input
              type={showPassword ? "text" : "password"}
              id="lgP"
              name="password"
              autoComplete="current-password"
              required
              disabled={isPending || isLocked}
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
              placeholder="••••••••"
              className="border-line bg-surface-raised text-ink focus-visible:outline-primary focus-visible:border-primary min-h-[44px] w-full rounded-xl border pr-20 pl-3.5 text-sm transition-all focus-visible:outline-2 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              className="text-primary-ink hover:bg-primary-soft absolute right-1.5 h-8 cursor-pointer rounded-lg px-2.5 text-xs font-bold transition-colors"
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </div>

        {/* Botón de Envío */}
        <button
          type="submit"
          disabled={isPending || isLocked}
          className="bg-primary text-on-primary hover:bg-primary-hover mt-1 flex min-h-[46px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-bold tracking-wide shadow-xs transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <>
              <span className="border-on-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
              <span>Verificando...</span>
            </>
          ) : isLocked ? (
            `Bloqueado (${timeFormatted})`
          ) : (
            "Iniciar sesión"
          )}
        </button>
      </form>

      {/* Separador O continúa con */}
      <div className="text-ink-muted before:bg-line after:bg-line my-0.5 flex items-center gap-3 text-[0.66rem] font-bold tracking-widest uppercase select-none before:h-px before:flex-1 after:h-px after:flex-1">
        <span>O continúa con</span>
      </div>

      {/* Botones OAuth */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          aria-label="Continuar con Google"
          onClick={() => {}}
          className="border-line bg-surface-raised text-ink hover:border-primary hover:bg-primary-soft flex min-h-[40px] cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-2 text-xs font-bold shadow-xs transition-all duration-150 hover:-translate-y-0.5"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 48 48"
            aria-hidden="true"
            className="shrink-0"
          >
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.5 0 10.5-2.1 14.3-5.6l-6.6-5.6C29.7 34.5 27 35.5 24 35.5c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.6 39.6 16.2 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.6 5.6C41.8 35.8 44 30.3 44 24c0-1.3-.1-2.7-.4-3.5z"
            />
          </svg>
          <span className="truncate">Google</span>
        </button>

        <button
          type="button"
          aria-label="Continuar con Microsoft"
          onClick={() => {}}
          className="border-line bg-surface-raised text-ink hover:border-primary hover:bg-primary-soft flex min-h-[40px] cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-2 text-xs font-bold shadow-xs transition-all duration-150 hover:-translate-y-0.5"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 23 23"
            aria-hidden="true"
            className="shrink-0"
          >
            <rect x="1" y="1" width="10" height="10" fill="#F25022" />
            <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
            <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
            <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
          </svg>
          <span className="truncate">Microsoft</span>
        </button>

        <button
          type="button"
          aria-label="Continuar con WhatsApp"
          onClick={() => {}}
          className="border-line bg-surface-raised text-ink hover:border-primary hover:bg-primary-soft flex min-h-[40px] cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-2 text-xs font-bold shadow-xs transition-all duration-150 hover:-translate-y-0.5"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1FAF5A"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="shrink-0"
          >
            <path d="M3.5 20.5l1.2-4.2A8.5 8.5 0 1 1 8 19.4z" />
            <path d="M9 8.8c0 3.2 2.8 6 6 6l1.2-1.3-1.9-1-.9.7a4 4 0 0 1-1.7-1.7l.7-.9-1-1.9z" />
          </svg>
          <span className="truncate">WhatsApp</span>
        </button>
      </div>

      {/* Tiles de Acceso Rápido: Invitación y App Técnico */}
      <div className="mt-1 grid grid-cols-2 gap-2">
        <Link
          href="/invitado"
          className="border-line bg-surface-raised hover:border-primary hover:bg-primary-soft group flex cursor-pointer items-center gap-2 rounded-xl border p-2.5 shadow-xs transition-all duration-150 hover:-translate-y-0.5"
        >
          <span className="bg-primary-soft text-primary-ink group-hover:bg-surface-raised flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors">
            <Users className="h-4 w-4" />
          </span>
          <span className="flex min-w-0 flex-col">
            <b className="text-ink text-[0.76rem] leading-tight font-bold">
              Tengo invitación
            </b>
            <small className="text-ink-muted truncate text-[0.66rem] leading-tight">
              Únete al equipo
            </small>
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setShowTecModal(true)}
          className="border-line bg-surface-raised hover:border-primary hover:bg-primary-soft group flex cursor-pointer items-center gap-2 rounded-xl border p-2.5 text-left shadow-xs transition-all duration-150 hover:-translate-y-0.5"
        >
          <span className="bg-primary-soft text-primary-ink group-hover:bg-surface-raised flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors">
            <Smartphone className="h-4 w-4" />
          </span>
          <span className="flex min-w-0 flex-col">
            <b className="text-ink text-[0.76rem] leading-tight font-bold">
              Soy técnico
            </b>
            <small className="text-ink-muted truncate text-[0.66rem] leading-tight">
              Entra desde la app
            </small>
          </span>
        </button>
      </div>

      {/* Modal / Dialog Informativo Técnico */}
      {showTecModal && (
        <div className="animate-sc-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="bg-surface-raised border-line shadow-2 relative flex w-full max-w-sm flex-col gap-3 rounded-2xl border p-5">
            <div className="flex items-center justify-between">
              <div className="text-primary-ink flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                <h3 className="text-ink text-sm font-bold">
                  Acceso para Técnicos de Campo
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTecModal(false)}
                className="text-ink-muted hover:text-ink hover:bg-surface-sunken cursor-pointer rounded-lg p-1"
                aria-label="Cerrar modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-ink-muted text-xs leading-relaxed">
              Los técnicos y operarios acceden exclusivamente a través de la{" "}
              <b>App Móvil Vittkly</b> para gestionar órdenes de trabajo, fichas
              y asistencias sin precios.
            </p>
            <div className="bg-surface-sunken text-ink flex flex-col gap-1 rounded-xl p-3 text-xs">
              <span className="text-primary-ink font-bold">
                ¿Necesitas entrar a la Central Web?
              </span>
              <span className="text-ink-muted text-[0.72rem]">
                Solicita a tu administrador que active el permiso de
                &ldquo;Acceso Web&rdquo; en tu perfil.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowTecModal(false)}
              className="bg-primary text-on-primary hover:bg-primary-hover mt-1 min-h-[36px] cursor-pointer rounded-xl text-xs font-bold transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Términos y Privacidad */}
      <p className="text-ink-muted mt-1 text-center text-[0.72rem] leading-relaxed select-none">
        Al continuar aceptas los{" "}
        <Link
          href="/terminos"
          className="text-primary-ink hover:text-primary-hover font-bold underline underline-offset-2 transition-colors"
        >
          Términos y condiciones
        </Link>{" "}
        y la{" "}
        <Link
          href="/privacidad"
          className="text-primary-ink hover:text-primary-hover font-bold underline underline-offset-2 transition-colors"
        >
          Política de privacidad
        </Link>
        .
      </p>
    </div>
  );
}

export default LoginForm;
