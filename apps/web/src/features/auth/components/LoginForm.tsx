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

      {/* Tabs de Selección */}
      <div
        className="grid grid-cols-2 gap-1 rounded-lg border border-[#16384d] bg-[#0b2130] p-1 shadow-xs"
        role="tablist"
        aria-label="Acceso"
      >
        <button
          type="button"
          role="tab"
          aria-selected="true"
          className="text-primary-ink flex min-h-[38px] cursor-default items-center justify-center rounded-md border border-[#1b465e] bg-[#102d3c] text-xs font-bold shadow-xs select-none"
        >
          Iniciar sesión
        </button>
        <Link
          href="/register"
          role="tab"
          aria-selected="false"
          className="text-ink-muted hover:text-ink flex min-h-[38px] cursor-pointer items-center justify-center rounded-md border-0 bg-[#0b2130] text-xs font-bold transition-colors select-none"
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
        {/* Campo Correo estirado y cuadrado */}
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
            className="border-line bg-surface-raised text-ink focus-visible:outline-primary focus-visible:border-primary min-h-[46px] w-full rounded-lg border px-3.5 text-sm transition-all focus-visible:outline-2 disabled:opacity-50"
          />
        </div>

        {/* Campo Contraseña estirado y cuadrado */}
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between">
            <label
              htmlFor="lgP"
              className="text-ink-muted text-xs font-semibold"
            >
              CONTRASEÑA
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
              className="border-line bg-surface-raised text-ink focus-visible:outline-primary focus-visible:border-primary min-h-[46px] w-full rounded-lg border pr-20 pl-3.5 text-sm transition-all focus-visible:outline-2 disabled:opacity-50"
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
          className="bg-primary text-on-primary hover:bg-primary-hover mt-1 flex min-h-[46px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-bold tracking-wide shadow-xs transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50"
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
          className="border-line bg-surface-raised text-ink hover:border-primary hover:bg-primary-soft flex min-h-[46px] cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-bold shadow-xs transition-all duration-150 hover:-translate-y-0.5"
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
          className="border-line bg-surface-raised text-ink hover:border-primary hover:bg-primary-soft flex min-h-[46px] cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-bold shadow-xs transition-all duration-150 hover:-translate-y-0.5"
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
          className="border-line bg-surface-raised text-ink hover:border-primary hover:bg-primary-soft flex min-h-[46px] cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-bold shadow-xs transition-all duration-150 hover:-translate-y-0.5"
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

      {/* Tiles de Acceso Rápido */}
      <div className="mt-1 grid grid-cols-2 gap-2">
        <Link
          href="/invitado"
          className="border-line bg-surface-raised hover:border-primary hover:bg-primary-soft group flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 shadow-xs transition-all duration-150 hover:-translate-y-0.5"
        >
          <span className="bg-primary-soft text-primary-ink group-hover:bg-surface-raised flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors">
            <Users className="h-4 w-4" />
          </span>
          <span className="flex min-w-0 flex-col">
            <b className="text-ink text-[0.76rem] leading-tight font-bold">
              Tengo una invitación
            </b>
            <small className="text-ink-muted text-[0.64rem] leading-tight">
              Únete al equipo de tu empresa
            </small>
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setShowTecModal(true)}
          className="border-line bg-surface-raised hover:border-primary hover:bg-primary-soft group flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 text-left shadow-xs transition-all duration-150 hover:-translate-y-0.5"
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
        <div className="animate-sc-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="shadow-2 relative flex w-full max-w-[420px] flex-col gap-4 rounded-[24px] border border-[#16384d] bg-[#0b2130] p-7 text-left text-white">
            {/* Icono superior del celular */}
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1b465e] bg-[#102d3c] text-[#78c4d4]">
              <Smartphone className="h-6 w-6" />
            </div>

            {/* Título y descripción principal */}
            <div className="flex flex-col gap-1.5">
              <h2 className="text-[1.35rem] font-bold tracking-tight text-white">
                Los técnicos entran por la app
              </h2>
              <p className="text-[0.82rem] leading-relaxed text-[#9fb3be]">
                Si trabajas en campo, registra tus servicios desde el celular:
                agenda, ruta, fotos y cierre de cada servicio.
              </p>
            </div>

            {/* Pasos Numerados */}
            <div className="my-1 flex flex-col gap-3.5">
              <div className="flex items-start gap-3.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#16384d] text-xs font-bold text-[#78c4d4]">
                  1
                </span>
                <div className="flex flex-col text-xs leading-snug">
                  <b className="text-[0.84rem] font-bold text-white">
                    Descarga la app
                  </b>
                  <span className="text-[#9fb3be]">
                    Disponible para iOS y Android.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#16384d] text-xs font-bold text-[#78c4d4]">
                  2
                </span>
                <div className="flex flex-col text-xs leading-snug">
                  <b className="text-[0.84rem] font-bold text-white">
                    Ingresa con tu celular
                  </b>
                  <span className="text-[#9fb3be]">
                    Escribe el número que registró tu administrador.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#16384d] text-xs font-bold text-[#78c4d4]">
                  3
                </span>
                <div className="flex flex-col text-xs leading-snug">
                  <b className="text-[0.84rem] font-bold text-white">
                    Confirma el código
                  </b>
                  <span className="text-[#9fb3be]">
                    Te lo enviamos por WhatsApp.
                  </span>
                </div>
              </div>
            </div>

            {/* Contenedores de App Store y Google Play */}
            <div className="my-0.5 grid grid-cols-2 gap-2.5">
              <div className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#1b465e]/60 bg-black/30 px-3 text-white shadow-xs transition-opacity hover:opacity-95">
                <svg
                  className="h-4 w-4 shrink-0 fill-white"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.8 6.55c.55-.68.92-1.63.82-2.58-.81.03-1.79.54-2.37 1.22-.52.6-.98 1.56-.85 2.49.91.07 1.84-.48 2.4-1.13z" />
                </svg>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[0.48rem] font-medium text-[#9fb3be]">
                    Próximamente en
                  </span>
                  <span className="mt-0.5 text-[0.7rem] font-extrabold">
                    App Store
                  </span>
                </div>
              </div>

              <div className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#1b465e]/60 bg-black/30 px-3 text-white shadow-xs transition-opacity hover:opacity-95">
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
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
                  <span className="text-[0.48rem] font-medium text-[#9fb3be]">
                    Próximamente en
                  </span>
                  <span className="mt-0.5 text-[0.7rem] font-extrabold">
                    Google Play
                  </span>
                </div>
              </div>
            </div>

            {/* Texto inferior de configuración web */}
            <p className="border-t border-[#16384d] pt-3 text-[0.76rem] leading-relaxed text-[#9fb3be]">
              ¿Necesitas ver la agenda en una computadora? Pide a tu
              administrador que active tu{" "}
              <b className="text-white">Acceso web</b> en Configuración →
              Usuarios.
            </p>

            {/* Botón inferior Volver a iniciar sesión */}
            <button
              type="button"
              onClick={() => setShowTecModal(false)}
              className="mt-1 flex cursor-pointer items-center justify-center gap-2 py-1 text-xs font-bold text-[#78c4d4] transition-colors hover:text-white"
            >
              <span>← Volver a iniciar sesión</span>
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
