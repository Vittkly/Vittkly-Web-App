"use client";

import React, { useState, useEffect, useRef, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Clock, Users, Smartphone, AlertCircle } from "lucide-react";
import { loginAction } from "@/features/auth/actions/auth.actions";
import { useOAuthSignIn } from "@/features/auth/hooks/useOAuthSignIn";
import type { AuthActionState } from "@/features/auth/types/auth.types";
import { MobileOnlyAccessModal } from "@/features/tenants/components/MobileOnlyAccessModal";
import { AuthCard } from "./AuthCard";
import { OAuthProviderIcon } from "./OAuthProviderIcon";

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
  const { oauthProvider, oauthError, clearOAuthError, handleOAuthSignIn } =
    useOAuthSignIn({ from: "login" });
  const [showPassword, setShowPassword] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [now, setNow] = useState<number>(() => Date.now());
  const [showTecModal, setShowTecModal] = useState(false);
  const tecTriggerRef = useRef<HTMLButtonElement>(null);

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
    <AuthCard showLogo className="gap-3.5">
      {/* Título de bienvenida */}
      <h1
        id="lgT"
        className="text-ink -mt-0.5 text-xl font-bold tracking-tight sm:text-[1.32rem]"
      >
        Te damos la bienvenida
      </h1>

      {/* Navegación entre Iniciar sesión y Crear cuenta */}
      <nav
        aria-label="Modo de acceso"
        className="bg-surface-sunken border-line grid grid-cols-2 gap-1 rounded-lg border p-1 shadow-xs"
      >
        <span
          aria-current="page"
          className="bg-surface-raised text-primary-ink border-line flex min-h-[38px] cursor-default items-center justify-center rounded-md border text-xs font-bold shadow-xs select-none"
        >
          Iniciar sesión
        </span>
        <Link
          href="/register"
          className="text-ink-muted hover:text-ink focus-visible:outline-focus flex min-h-[38px] cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-xs font-bold transition-colors select-none focus-visible:outline-2"
        >
          Crear cuenta
        </Link>
      </nav>

      {/* Banners de Estado y Errores */}
      {wasUpdated && (
        <div
          role="status"
          className="bg-success-soft text-success-ink border-success/20 animate-sc-in flex items-center gap-2.5 rounded-xl border p-3 text-xs font-semibold"
        >
          <span>
            Tu contraseña ha sido actualizada exitosamente. Ya puedes ingresar
            con tu nueva clave.
          </span>
        </div>
      )}

      {urlError === "enlace_expirado" && (
        <div
          role="alert"
          className="bg-warning-soft text-warning-ink border-warning/20 animate-sc-in flex items-center gap-2.5 rounded-xl border p-3 text-xs font-semibold"
        >
          <span>
            El enlace de recuperación ha expirado o ya fue utilizado. Solicita
            uno nuevo.
          </span>
        </div>
      )}

      {isLocked && (
        <div
          role="alert"
          className="bg-danger-soft text-danger-ink border-danger/20 animate-sc-in flex items-start gap-2.5 rounded-xl border p-3 text-xs font-semibold"
        >
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

      {!isLocked && (oauthError || state.error) && (
        <div
          role="alert"
          className="bg-danger-soft text-danger-ink border-danger/20 animate-sc-in flex items-start gap-2.5 rounded-xl border p-3 text-xs font-semibold"
        >
          <AlertCircle className="text-danger mt-0.5 h-4 w-4 shrink-0" />
          <span>{oauthError || state.error}</span>
        </div>
      )}

      {/* Formulario Principal de Autenticación */}
      <form
        action={formAction}
        onSubmit={() => clearOAuthError()}
        className="flex flex-col gap-3"
      >
        {/* Campo Correo */}
        <div className="flex flex-col gap-1">
          <label htmlFor="lgU" className="text-ink-muted text-xs font-semibold">
            CORREO
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
            className="border-line bg-surface-raised text-ink focus-visible:outline-primary focus-visible:border-primary min-h-[46px] w-full rounded-lg border px-3.5 text-base transition-all focus-visible:outline-2 disabled:opacity-50 sm:text-sm"
          />
        </div>

        {/* Campo Contraseña */}
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
            <label
              htmlFor="lgP"
              className="text-ink-muted text-xs font-semibold"
            >
              CONTRASEÑA
            </label>
            <Link
              href="/olvide-contrasena"
              className="text-primary-ink hover:text-primary-hover focus-visible:outline-focus rounded text-xs font-bold transition-colors hover:underline focus-visible:outline-2"
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
              className="border-line bg-surface-raised text-ink focus-visible:outline-primary focus-visible:border-primary min-h-[46px] w-full rounded-lg border pr-20 pl-3.5 text-base transition-all focus-visible:outline-2 disabled:opacity-50 sm:text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-pressed={showPassword}
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              className="text-primary-ink hover:bg-primary-soft focus-visible:outline-focus absolute right-1.5 min-h-[38px] cursor-pointer rounded-lg px-2.5 text-xs font-bold transition-colors focus-visible:outline-2"
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </div>

        {/* Botón de Envío */}
        <button
          type="submit"
          disabled={isPending || isLocked}
          className="bg-primary text-on-primary hover:bg-primary-hover focus-visible:outline-focus mt-1 flex min-h-[46px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-bold tracking-wide shadow-xs transition-all duration-150 focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50"
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

      {/* Botones OAuth: apilado vertical en móvil (< 640px) y horizontal en desktop */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          aria-label="Continuar con Google"
          aria-busy={oauthProvider === "google"}
          disabled={isPending || isLocked || oauthProvider !== null}
          onClick={() => void handleOAuthSignIn("google")}
          className="border-line bg-surface-raised text-ink hover:border-primary hover:bg-primary-soft focus-visible:outline-focus flex min-h-[56px] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border px-1 py-2 text-[11px] leading-tight font-bold shadow-xs transition-all duration-150 hover:-translate-y-0.5 focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:min-h-[46px] sm:flex-row sm:gap-1.5 sm:px-2 sm:py-0 sm:text-xs"
        >
          <OAuthProviderIcon
            provider="google"
            loading={oauthProvider === "google"}
            size={17}
          />
          <span className="text-center">Google</span>
        </button>

        <button
          type="button"
          aria-label="Continuar con Microsoft"
          aria-busy={oauthProvider === "microsoft"}
          disabled={isPending || isLocked || oauthProvider !== null}
          onClick={() => void handleOAuthSignIn("microsoft")}
          className="border-line bg-surface-raised text-ink hover:border-primary hover:bg-primary-soft focus-visible:outline-focus flex min-h-[56px] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border px-1 py-2 text-[11px] leading-tight font-bold shadow-xs transition-all duration-150 hover:-translate-y-0.5 focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:min-h-[46px] sm:flex-row sm:gap-1.5 sm:px-2 sm:py-0 sm:text-xs"
        >
          <OAuthProviderIcon
            provider="microsoft"
            loading={oauthProvider === "microsoft"}
            size={15}
          />
          <span className="text-center">Microsoft</span>
        </button>

        <button
          type="button"
          aria-label="Continuar con WhatsApp"
          onClick={() => {}}
          className="border-line bg-surface-raised text-ink hover:border-primary hover:bg-primary-soft focus-visible:outline-focus flex min-h-[56px] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border px-1 py-2 text-[11px] leading-tight font-bold shadow-xs transition-all duration-150 hover:-translate-y-0.5 focus-visible:outline-2 sm:min-h-[46px] sm:flex-row sm:gap-1.5 sm:px-2 sm:py-0 sm:text-xs"
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
          <span className="text-center">WhatsApp</span>
        </button>
      </div>

      {/* Tiles de Acceso Rápido: 2 columnas lado a lado; icono arriba + texto centrado en móvil */}
      <div className="mt-1 grid grid-cols-2 gap-2">
        <Link
          href="/invitado"
          className="border-line bg-surface-raised hover:border-primary hover:bg-primary-soft focus-visible:outline-focus group flex min-h-[48px] cursor-pointer flex-col items-center justify-start gap-2 rounded-lg border px-2.5 py-3 text-center shadow-xs transition-all duration-150 hover:-translate-y-0.5 focus-visible:outline-2 sm:flex-row sm:items-center sm:justify-start sm:gap-2.5 sm:p-3 sm:text-left"
        >
          <span className="bg-primary-soft text-primary-ink group-hover:bg-surface-raised flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors">
            <Users className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="flex min-w-0 flex-col items-center sm:items-start">
            <b className="text-ink text-[0.76rem] leading-tight font-bold">
              Tengo una invitación
            </b>
            <small className="text-ink-muted text-[0.65rem] leading-tight">
              Únete al equipo de tu empresa
            </small>
          </span>
        </Link>

        <button
          ref={tecTriggerRef}
          type="button"
          onClick={() => setShowTecModal(true)}
          className="border-line bg-surface-raised hover:border-primary hover:bg-primary-soft focus-visible:outline-focus group flex min-h-[48px] cursor-pointer flex-col items-center justify-start gap-2 rounded-lg border px-2.5 py-3 text-center shadow-xs transition-all duration-150 hover:-translate-y-0.5 focus-visible:outline-2 sm:flex-row sm:items-center sm:justify-start sm:gap-2.5 sm:p-3 sm:text-left"
        >
          <span className="bg-primary-soft text-primary-ink group-hover:bg-surface-raised flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors">
            <Smartphone className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="flex min-w-0 flex-col items-center sm:items-start">
            <b className="text-ink text-[0.76rem] leading-tight font-bold">
              Soy técnico
            </b>
            <small className="text-ink-muted text-[0.65rem] leading-tight">
              Entra desde la app
            </small>
          </span>
        </button>
      </div>

      {/* Modal informativo de acceso exclusivo móvil */}
      <MobileOnlyAccessModal
        isOpen={showTecModal}
        mode="login"
        onClose={() => setShowTecModal(false)}
        returnFocusRef={tecTriggerRef}
      />

      {/* Términos y Privacidad */}
      <p className="text-ink-muted mt-1 text-center text-[0.72rem] leading-relaxed">
        Al continuar aceptas los{" "}
        <Link
          href="/terminos"
          className="text-primary-ink hover:text-primary-hover focus-visible:outline-focus rounded font-bold underline underline-offset-2 transition-colors focus-visible:outline-2"
        >
          Términos y condiciones
        </Link>{" "}
        y la{" "}
        <Link
          href="/privacidad"
          className="text-primary-ink hover:text-primary-hover focus-visible:outline-focus rounded font-bold underline underline-offset-2 transition-colors focus-visible:outline-2"
        >
          Política de privacidad
        </Link>
        .
      </p>
    </AuthCard>
  );
}

export default LoginForm;
