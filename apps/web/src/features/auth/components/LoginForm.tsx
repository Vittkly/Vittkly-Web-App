"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useActionState,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Clock, Users, Smartphone, AlertCircle } from "lucide-react";
import { loginAction } from "@/features/auth/actions/auth.actions";
import type { AuthActionState } from "@/features/auth/types/auth.types";
import { AuthCard } from "./AuthCard";

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
  const tecTriggerRef = useRef<HTMLButtonElement>(null);
  const tecCloseRef = useRef<HTMLButtonElement>(null);

  const handleCloseTecModal = useCallback(() => {
    setShowTecModal(false);
    requestAnimationFrame(() => {
      tecTriggerRef.current?.focus();
    });
  }, []);

  useEffect(() => {
    if (!showTecModal) return;
    tecCloseRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleCloseTecModal();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showTecModal, handleCloseTecModal]);

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

      {!isLocked && state.error && (
        <div
          role="alert"
          className="bg-danger-soft text-danger-ink border-danger/20 animate-sc-in flex items-start gap-2.5 rounded-xl border p-3 text-xs font-semibold"
        >
          <AlertCircle className="text-danger mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Formulario Principal de Autenticación */}
      <form action={formAction} className="flex flex-col gap-3">
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
          onClick={() => {}}
          className="border-line bg-surface-raised text-ink hover:border-primary hover:bg-primary-soft focus-visible:outline-focus flex min-h-[56px] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border px-1 py-2 text-[11px] leading-tight font-bold shadow-xs transition-all duration-150 hover:-translate-y-0.5 focus-visible:outline-2 sm:min-h-[46px] sm:flex-row sm:gap-1.5 sm:px-2 sm:py-0 sm:text-xs"
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
          <span className="text-center">Google</span>
        </button>

        <button
          type="button"
          aria-label="Continuar con Microsoft"
          onClick={() => {}}
          className="border-line bg-surface-raised text-ink hover:border-primary hover:bg-primary-soft focus-visible:outline-focus flex min-h-[56px] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border px-1 py-2 text-[11px] leading-tight font-bold shadow-xs transition-all duration-150 hover:-translate-y-0.5 focus-visible:outline-2 sm:min-h-[46px] sm:flex-row sm:gap-1.5 sm:px-2 sm:py-0 sm:text-xs"
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

      {/* Modal / Dialog Informativo Técnico */}
      {showTecModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseTecModal();
          }}
          className="animate-sc-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="tecModalTitle"
            className="from-hero-from to-hero-to border-hero-ink/15 text-hero-ink shadow-2 relative flex max-h-[calc(100dvh-2rem)] w-full max-w-[420px] flex-col gap-4 overflow-y-auto overscroll-contain rounded-[24px] border bg-gradient-to-br p-5 text-left sm:p-7"
          >
            {/* Icono superior del celular */}
            <div className="border-hero-ink/20 bg-hero-ink/10 text-hero-ink flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border">
              <Smartphone className="h-6 w-6" aria-hidden="true" />
            </div>

            {/* Título y descripción principal */}
            <div className="flex flex-col gap-1.5">
              <h2
                id="tecModalTitle"
                className="text-hero-ink text-[1.25rem] font-bold tracking-tight sm:text-[1.35rem]"
              >
                Los técnicos entran por la app
              </h2>
              <p className="text-hero-ink/80 text-[0.82rem] leading-relaxed">
                Si trabajas en campo, registra tus servicios desde el celular:
                agenda, ruta, fotos y cierre de cada servicio.
              </p>
            </div>

            {/* Pasos Numerados */}
            <div className="my-1 flex flex-col gap-3.5">
              <div className="flex items-start gap-3.5">
                <span className="bg-hero-ink/15 text-hero-ink flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                  1
                </span>
                <div className="flex flex-col text-xs leading-snug">
                  <b className="text-hero-ink text-[0.84rem] font-bold">
                    Descarga la app
                  </b>
                  <span className="text-hero-ink/80">
                    Disponible para iOS y Android.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="bg-hero-ink/15 text-hero-ink flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                  2
                </span>
                <div className="flex flex-col text-xs leading-snug">
                  <b className="text-hero-ink text-[0.84rem] font-bold">
                    Ingresa con tu celular
                  </b>
                  <span className="text-hero-ink/80">
                    Escribe el número que registró tu administrador.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="bg-hero-ink/15 text-hero-ink flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                  3
                </span>
                <div className="flex flex-col text-xs leading-snug">
                  <b className="text-hero-ink text-[0.84rem] font-bold">
                    Confirma el código
                  </b>
                  <span className="text-hero-ink/80">
                    Te lo enviamos por WhatsApp.
                  </span>
                </div>
              </div>
            </div>

            {/* Contenedores informativos de App Store y Google Play */}
            <div className="my-0.5 grid grid-cols-1 gap-2.5 min-[360px]:grid-cols-2">
              <div className="border-hero-ink/20 bg-hero-ink/10 text-hero-ink flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border px-3 py-2 shadow-xs">
                <svg
                  className="h-4 w-4 shrink-0 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.8 6.55c.55-.68.92-1.63.82-2.58-.81.03-1.79.54-2.37 1.22-.52.6-.98 1.56-.85 2.49.91.07 1.84-.48 2.4-1.13z" />
                </svg>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-hero-ink/75 text-[10px] font-medium">
                    Próximamente en
                  </span>
                  <span className="mt-0.5 text-xs font-extrabold">
                    App Store
                  </span>
                </div>
              </div>

              <div className="border-hero-ink/20 bg-hero-ink/10 text-hero-ink flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border px-3 py-2 shadow-xs">
                <svg
                  className="h-4 w-4 shrink-0"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="#EA4335"
                    d="M3.609 1.814L13.792 12 3.61 22.186a1.458 1.458 0 0 1-.21-.81V2.624c0-.315.075-.589.21-.81z"
                  />
                  <path
                    fill="#FBBC04"
                    d="M17.33 11.286l-3.538-2.044L13.792 12l3.538 2.758 2.935-1.696c.717-.414.717-1.09 0-1.504l-2.935-1.696z"
                  />
                  <path
                    fill="#4285F4"
                    d="M3.61 22.186l11.6-10.772 2.122 2.122-11.45 6.612a1.45 1.45 0 0 1-.772.282c-.2 0-.38-.052-.5-.144z"
                  />
                  <path
                    fill="#34A853"
                    d="M3.609 1.814c.12-.092.3-.144.5-.144a1.45 1.45 0 0 1 .772.282l11.45 6.612-2.122 2.122L3.61 1.814z"
                  />
                </svg>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-hero-ink/75 text-[10px] font-medium">
                    Próximamente en
                  </span>
                  <span className="mt-0.5 text-xs font-extrabold">
                    Google Play
                  </span>
                </div>
              </div>
            </div>

            {/* Texto inferior de configuración web */}
            <p className="border-hero-ink/15 text-hero-ink/80 border-t pt-3 text-[0.76rem] leading-relaxed">
              ¿Necesitas ver la agenda en una computadora? Pide a tu
              administrador que active tu{" "}
              <b className="text-hero-ink">Acceso web</b> en Configuración →
              Usuarios.
            </p>

            {/* Botón inferior Volver a iniciar sesión */}
            <button
              ref={tecCloseRef}
              type="button"
              onClick={handleCloseTecModal}
              className="text-hero-ink/90 hover:bg-hero-ink/10 hover:text-hero-ink focus-visible:outline-hero-ink mt-1 flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold transition-colors focus-visible:outline-2"
            >
              <span>← Volver a iniciar sesión</span>
            </button>
          </div>
        </div>
      )}

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
