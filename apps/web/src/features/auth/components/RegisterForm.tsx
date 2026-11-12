"use client";

import React, { useState, useActionState } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { registerAction } from "@/features/auth/actions/auth.actions";
import type { AuthActionState } from "@/features/auth/types/auth.types";
import { VittklyLogo } from "@/components/brand/VittklyLogo";

const initialState: AuthActionState = {
  error: null,
  message: null,
  success: false,
};

const PW_RULES: Array<[string, string, (p: string) => boolean]> = [
  ["len", "Al menos 8 caracteres", (p) => p.length >= 8],
  ["may", "Una mayúscula", (p) => /[A-Z]/.test(p)],
  ["num", "Un número", (p) => /\d/.test(p)],
  ["sim", "Un símbolo (! # $ %)", (p) => /[^A-Za-z0-9]/.test(p)],
];

const STEP1_FIELDS = ["fullName", "email", "password", "confirmPassword"];

const inputClass =
  "border-[#1b465e] bg-surface-raised text-ink placeholder:text-ink-muted focus-visible:outline-primary focus-visible:border-primary min-h-[42px] w-full rounded-lg border px-3 text-[0.88rem] transition-all focus-visible:outline-2 disabled:opacity-50 aria-[invalid=true]:border-danger";
const labelClass =
  "text-[#9fb3be] mb-0.5 block text-[0.66rem] font-semibold tracking-wider";
const errClass = "text-danger-ink mt-0.5 block text-[0.7rem] font-semibold";
const verClass =
  "text-primary-ink hover:bg-primary-soft absolute top-[4px] right-[4px] bottom-[4px] cursor-pointer rounded-lg px-2 text-[0.75rem] font-bold transition-colors";

const oauthClass =
  "border-[#1b465e] bg-surface-raised text-ink hover:border-primary hover:bg-primary-soft flex min-h-[46px] cursor-pointer items-center justify-center gap-2 rounded-lg border px-2 text-xs font-bold shadow-xs transition-all duration-150 hover:-translate-y-px";
export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialState,
  );

  const [step, setStep] = useState<1 | 2>(1);
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [localError, setLocalError] = useState<Record<string, string>>({});
  const [terms, setTerms] = useState(false);
  const [seenState, setSeenState] = useState(state);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [rubro, setRubro] = useState("");
  const [ciudad, setCiudad] = useState("Lima, Perú");
  const [telefono, setTelefono] = useState("");

  if (state !== seenState) {
    setSeenState(state);
    if (STEP1_FIELDS.some((k) => state.fieldErrors?.[k])) setStep(1);
  }

  const passed = PW_RULES.filter(([, , test]) => test(password)).length;
  const match = password !== "" && password === confirmPassword;
  const step1Ready = passed === PW_RULES.length && match && terms;
  const mismatch = confirmPassword !== "" && !match;

  const fe = (k: string) => localError[k] || state.fieldErrors?.[k];

  const goStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (fullName.trim().length < 2)
      errs.fullName = "Ingresa tu nombre completo";
    if (!/^\S+@\S+\.\S+$/.test(email.trim()))
      errs.email = "Ingresa un correo electrónico válido";
    setLocalError(errs);
    if (Object.keys(errs).length === 0 && step1Ready) setStep(2);
  };

  return (
    <div className="flex w-full origin-center scale-[0.88] items-center justify-center transition-transform xl:scale-[0.93]">
      <div className="bg-surface-raised border-line shadow-2 relative z-10 flex w-full max-w-[400px] flex-col gap-2 rounded-[18px] border p-4 transition-colors sm:px-[22px] sm:pt-3.5 sm:pb-3.5">
        {/* Cabecera compacta */}
        <div className="flex flex-col gap-0.5">
          {step === 1 ? (
            <Link href="/" className="inline-flex items-center self-start">
              <VittklyLogo variant="wordmark" height={34} priority />
            </Link>
          ) : (
            <span
              aria-hidden="true"
              className="bg-primary-soft text-primary-ink flex h-8 w-8 items-center justify-center rounded-xl"
            >
              <Building2 className="h-4 w-4" />
            </span>
          )}
          <h1
            id="lgT"
            className="text-ink text-[1.1rem] leading-tight font-bold tracking-tight"
          >
            {step === 1 ? "Crea tu cuenta" : "Cuéntanos de tu empresa"}
          </h1>
          <p className="text-ink-muted text-[0.75rem] leading-snug">
            {step === 1
              ? "Serás el propietario: tú administras tu empresa, tu equipo y sus perfiles."
              : "Con esto armamos tu espacio. Podrás cambiarlo luego en Configuración -> Empresa."}
          </p>
        </div>

        {/* Tabs de Selección idénticos al Login */}
        {step === 1 && (
          <div
            className="grid grid-cols-2 gap-1 rounded-lg border border-[#16384d] bg-[#0b2130] p-1 shadow-xs"
            role="tablist"
            aria-label="Acceso"
          >
            <Link
              href="/login"
              role="tab"
              aria-selected="false"
              className="text-ink-muted hover:text-ink flex min-h-[34px] items-center justify-center rounded-md text-xs font-bold transition-colors select-none"
            >
              Iniciar sesión
            </Link>
            <button
              type="button"
              role="tab"
              aria-selected="true"
              className="text-primary-ink flex min-h-[34px] cursor-default items-center justify-center rounded-md border border-[#1b465e] bg-[#102d3c] text-xs font-bold shadow-xs select-none"
            >
              Crear cuenta
            </button>
          </div>
        )}

        {/* Indicador de paso */}
        <div
          className="text-ink-muted flex items-center gap-[5px] text-[0.66rem] font-bold"
          aria-label={`Paso ${step} de 2`}
        >
          <i className="bg-primary h-1 w-[18px] rounded-full" />
          <i
            className={`h-1 w-[18px] rounded-full ${step > 1 ? "bg-primary" : "bg-line"}`}
          />
          <span className="ml-[4px] tracking-wide uppercase">
            Paso {step} de 2
          </span>
        </div>

        {state.error && !Object.keys(state.fieldErrors ?? {}).length && (
          <div
            role="alert"
            className="bg-danger-soft text-danger-ink rounded-lg px-3 py-1 text-[0.72rem] leading-snug font-semibold"
          >
            {state.error}
          </div>
        )}

        <form
          action={formAction}
          noValidate
          onSubmit={step === 1 ? goStep2 : undefined}
          className="flex flex-col gap-1.5"
        >
          {/* ---------- PASO 1 ---------- */}
          <div hidden={step !== 1} className="flex flex-col gap-1.5">
            <div>
              <label htmlFor="fullName" className={labelClass}>
                NOMBRE COMPLETO
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                maxLength={60}
                autoComplete="name"
                placeholder="Nombre y apellido"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                aria-invalid={fe("fullName") ? "true" : undefined}
                className={inputClass}
              />
              {fe("fullName") && (
                <small role="alert" className={errClass}>
                  {fe("fullName")}
                </small>
              )}
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>
                CORREO
              </label>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="username"
                placeholder="nombre@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={fe("email") ? "true" : undefined}
                className={inputClass}
              />
              {fe("email") && (
                <small role="alert" className={errClass}>
                  {fe("email")}
                </small>
              )}
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>
                NUEVA CONTRASEÑA
              </label>
              <div className="relative flex items-center">
                <input
                  id="password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={fe("password") ? "true" : undefined}
                  className={`${inputClass} pr-20`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={
                    showPw ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  className={verClass}
                >
                  {showPw ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {fe("password") && (
                <small role="alert" className={errClass}>
                  {fe("password")}
                </small>
              )}
            </div>

            {/* Fuerza + reglas */}
            <div className="flex gap-1" aria-hidden="true">
              {[1, 2, 3, 4].map((n) => (
                <i
                  key={n}
                  className={`h-1 flex-1 rounded-full ${
                    password && passed >= n
                      ? passed === 4
                        ? "bg-success"
                        : passed >= 2
                          ? "bg-warning"
                          : "bg-danger"
                      : "bg-line"
                  }`}
                />
              ))}
            </div>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-0.5">
              {PW_RULES.map(([key, label, test]) => {
                const ok = test(password);
                return (
                  <li
                    key={key}
                    className={`flex items-center gap-1.5 text-[0.66rem] ${
                      ok ? "text-success-ink font-semibold" : "text-ink-muted"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 shrink-0 rounded-full border ${
                        ok ? "bg-success border-success" : "border-line-strong"
                      }`}
                    />
                    {label}
                  </li>
                );
              })}
            </ul>

            <div>
              <label htmlFor="confirmPassword" className={labelClass}>
                REPITE LA CONTRASEÑA
              </label>
              <div className="relative flex items-center">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPw2 ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  aria-invalid={
                    mismatch || fe("confirmPassword") ? "true" : undefined
                  }
                  className={`${inputClass} pr-20`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw2((v) => !v)}
                  aria-label={
                    showPw2 ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  className={verClass}
                >
                  {showPw2 ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {(mismatch || fe("confirmPassword")) && (
                <small role="alert" className={errClass}>
                  {fe("confirmPassword") || "Las contraseñas no coinciden."}
                </small>
              )}
            </div>

            {/* Checkbox de Términos con separación adecuada */}
            <label className="text-ink-muted my-2 flex cursor-pointer items-start gap-2 text-[0.72rem] leading-snug">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="accent-primary mt-0.5 h-3.5 w-3.5 shrink-0 cursor-pointer"
              />
              <span>
                Acepto los{" "}
                <Link
                  href="/terminos"
                  className="text-primary-ink font-bold underline underline-offset-2"
                >
                  Términos y condiciones
                </Link>{" "}
                y la{" "}
                <Link
                  href="/privacidad"
                  className="text-primary-ink font-bold underline underline-offset-2"
                >
                  Política de privacidad
                </Link>
                .
              </span>
            </label>

            <button
              type="submit"
              disabled={!step1Ready}
              className="bg-primary text-on-primary hover:bg-primary-hover min-h-[42px] w-full cursor-pointer rounded-lg text-[0.88rem] font-bold shadow-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continuar
            </button>
          </div>

          {/* ---------- PASO 2 ---------- */}
          <div hidden={step !== 2} className="flex flex-col gap-1.5">
            <div>
              <label htmlFor="companyName" className={labelClass}>
                NOMBRE DE LA EMPRESA
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                maxLength={60}
                autoComplete="organization"
                placeholder="Ej.: Clima Frío SAC"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isPending}
                aria-invalid={fe("companyName") ? "true" : undefined}
                className={inputClass}
              />
              {fe("companyName") && (
                <small role="alert" className={errClass}>
                  {fe("companyName")}
                </small>
              )}
            </div>

            <div>
              <label htmlFor="rubro" className={labelClass}>
                A QUÉ SE DEDICA (OPCIONAL)
              </label>
              <input
                id="rubro"
                name="rubro"
                type="text"
                maxLength={80}
                placeholder="Ej.: Mantenimiento de aire acondicionado"
                value={rubro}
                onChange={(e) => setRubro(e.target.value)}
                disabled={isPending}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="ciudad" className={labelClass}>
                CIUDAD
              </label>
              <input
                id="ciudad"
                name="ciudad"
                type="text"
                maxLength={50}
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                disabled={isPending}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="telefono" className={labelClass}>
                WHATSAPP DE LA EMPRESA (OPCIONAL)
              </label>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                inputMode="tel"
                maxLength={20}
                placeholder="9xx xxx xxx"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                disabled={isPending}
                className={`${inputClass} font-mono tabular-nums`}
              />
            </div>

            <button
              type="submit"
              disabled={isPending || companyName.trim().length < 2}
              className="bg-primary text-on-primary hover:bg-primary-hover flex min-h-[42px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg text-[0.88rem] font-bold shadow-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Creando tu espacio…" : "Crear mi cuenta y entrar"}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={isPending}
              className="text-ink-muted hover:text-ink cursor-pointer self-start text-[0.72rem] font-bold transition-colors"
            >
              ← Paso anterior
            </button>
          </div>
        </form>

        {/* Registro con proveedor (solo paso 1) */}
        {step === 1 && (
          <>
            <div
              role="separator"
              className="text-ink-muted before:bg-line after:bg-line my-0.5 flex items-center gap-2 text-[0.56rem] font-bold tracking-widest uppercase select-none before:h-px before:flex-1 after:h-px after:flex-1"
            >
              <span>O regístrate con</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                aria-label="Registrarte con Google"
                className={oauthClass}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
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
                Google
              </button>
              <button
                type="button"
                aria-label="Registrarte con Microsoft"
                className={oauthClass}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 23 23"
                  aria-hidden="true"
                >
                  <rect x="1" y="1" width="10" height="10" fill="#F25022" />
                  <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
                  <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
                  <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
                </svg>
                Microsoft
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default RegisterForm;
