"use client";

import React, { useState, useEffect, useRef, useActionState } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { registerAction } from "@/features/auth/actions/auth.actions";
import { useOAuthSignIn } from "@/features/auth/hooks/useOAuthSignIn";
import type { AuthActionState } from "@/features/auth/types/auth.types";
import { VittklyLogo } from "@/components/brand/VittklyLogo";
import { PlanSelectorStep } from "@/features/tenants/components/PlanSelectorStep";
import { OAuthProviderIcon } from "./OAuthProviderIcon";

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

const STEP1_FIELDS = [
  "fullName",
  "email",
  "tipoDocumento",
  "numeroDocumento",
  "password",
  "confirmPassword",
];
const STEP2_FIELDS = ["companyName", "rubro", "ciudad"];

const inputClass =
  "border-line bg-surface-sunken text-ink placeholder:text-ink-muted focus-visible:outline-primary focus-visible:border-primary min-h-[44px] w-full rounded-lg border px-3 text-base transition-all focus-visible:outline-2 disabled:opacity-50 aria-[invalid=true]:border-danger sm:min-h-[40px] sm:text-[0.86rem]";
const labelClass =
  "text-ink-muted mb-0.5 block text-[0.66rem] font-semibold tracking-wider uppercase";
const errClass = "text-danger-ink mt-0.5 block text-[0.7rem] font-semibold";
const verClass =
  "text-primary-ink hover:bg-primary-soft focus-visible:outline-focus absolute top-[4px] right-[4px] bottom-[4px] min-w-[44px] cursor-pointer rounded-lg px-2 text-[0.75rem] font-bold transition-colors focus-visible:outline-2";

const oauthClass =
  "border-line bg-surface-raised text-ink hover:border-primary hover:bg-primary-soft focus-visible:outline-focus flex min-h-[54px] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 text-[11px] leading-tight font-bold shadow-xs transition-all duration-150 hover:-translate-y-px focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:min-h-[42px] sm:flex-row sm:gap-2 sm:py-0 sm:text-xs";

type DocType = "DNI" | "carné de extranjería" | "pasaporte";

function StepProgressIndicator({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div
      className="text-ink-muted flex items-center gap-[5px] text-[0.66rem] font-bold"
      aria-label={`Paso ${step} de 3`}
    >
      <i className="bg-primary h-1 w-[18px] rounded-full" />
      <i
        className={`h-1 w-[18px] rounded-full ${
          step >= 2 ? "bg-primary" : "bg-line"
        }`}
      />
      <i
        className={`h-1 w-[18px] rounded-full ${
          step >= 3 ? "bg-primary" : "bg-line"
        }`}
      />
      <span className="ml-[4px] tracking-wide uppercase">Paso {step} de 3</span>
    </div>
  );
}

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialState,
  );
  const { oauthProvider, oauthError, clearOAuthError, handleOAuthSignIn } =
    useOAuthSignIn({ from: "register" });

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [localError, setLocalError] = useState<Record<string, string>>({});
  const [terms, setTerms] = useState(false);
  const [seenState, setSeenState] = useState(state);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState<DocType>("DNI");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [rubro, setRubro] = useState("");
  const [ciudad, setCiudad] = useState("Lima, Perú");

  if (state !== seenState) {
    setSeenState(state);
    if (STEP1_FIELDS.some((k) => state.fieldErrors?.[k])) {
      setStep(1);
    } else if (STEP2_FIELDS.some((k) => state.fieldErrors?.[k])) {
      setStep(2);
    }
  }

  const prevStepRef = useRef(step);
  useEffect(() => {
    if (prevStepRef.current !== step) {
      prevStepRef.current = step;
      document
        .getElementById("empGate")
        ?.scrollTo({ top: 0, behavior: "smooth" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [step]);

  const passed = PW_RULES.filter(([, , test]) => test(password)).length;
  const match = password !== "" && password === confirmPassword;
  const docValid =
    tipoDocumento === "DNI"
      ? /^\d{8}$/.test(numeroDocumento.trim())
      : numeroDocumento.trim().length >= 6;
  const step1Ready = passed === PW_RULES.length && match && terms && docValid;
  const mismatch = confirmPassword !== "" && !match;

  const fe = (k: string) => localError[k] || state.fieldErrors?.[k];

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    clearOAuthError();
    if (step === 1) {
      e.preventDefault();
      const errs: Record<string, string> = {};
      if (fullName.trim().length < 2)
        errs.fullName = "Ingresa tu nombre completo";
      if (!/^\S+@\S+\.\S+$/.test(email.trim()))
        errs.email = "Ingresa un correo electrónico válido";
      if (!docValid) {
        errs.numeroDocumento =
          tipoDocumento === "DNI"
            ? "El DNI debe tener 8 dígitos"
            : "Ingresa un documento válido (mín. 6 caracteres)";
      }
      setLocalError(errs);
      if (Object.keys(errs).length === 0 && step1Ready) setStep(2);
      return;
    }

    if (step === 2) {
      e.preventDefault();
      const errs: Record<string, string> = {};
      if (companyName.trim().length < 2) {
        errs.companyName = "Ingresa el nombre de tu empresa";
      }
      setLocalError(errs);
      if (Object.keys(errs).length === 0) setStep(3);
    }
  };

  return (
    <div
      data-register-step={step}
      className={
        step === 3
          ? "flex w-full items-center justify-center py-4"
          : "flex w-full items-center justify-center transition-transform lg:origin-center lg:scale-[0.88] xl:scale-[0.93]"
      }
    >
      <form
        action={formAction}
        noValidate
        onSubmit={handleFormSubmit}
        className={step === 3 ? "w-full max-w-4xl" : "w-full max-w-[400px]"}
      >
        {/* ---------- TARJETA COMPACTA PARA PASOS 1 Y 2 ---------- */}
        <div
          hidden={step === 3}
          className="bg-surface-raised border-line shadow-2 relative z-10 flex w-full flex-col gap-2 rounded-[18px] border p-4 transition-colors sm:px-[22px] sm:py-4"
        >
          {/* Cabecera compacta */}
          <div className="flex flex-col gap-0.5">
            {step === 1 ? (
              <Link
                href="/"
                className="focus-visible:outline-focus inline-flex items-center self-start focus-visible:outline-2"
              >
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
                : "Con esto armamos tu espacio. En el siguiente paso eliges tu plan."}
            </p>
          </div>

          {/* Navegación entre Iniciar sesión y Crear cuenta */}
          <nav
            aria-label="Modo de acceso"
            className="bg-surface-sunken border-line grid grid-cols-2 gap-1 rounded-lg border p-1 shadow-xs"
          >
            <Link
              href="/login"
              className="text-ink-muted hover:text-ink focus-visible:outline-focus flex min-h-[36px] cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-xs font-bold transition-colors select-none focus-visible:outline-2"
            >
              Iniciar sesión
            </Link>
            <span
              aria-current="page"
              className="bg-surface-raised text-primary-ink border-line flex min-h-[36px] cursor-default items-center justify-center rounded-md border text-xs font-bold shadow-xs select-none"
            >
              Crear cuenta
            </span>
          </nav>

          {/* Indicador de paso (1 o 2 de 3) */}
          <StepProgressIndicator step={step} />

          {(oauthError ||
            (state.error && !Object.keys(state.fieldErrors ?? {}).length)) && (
            <div
              role="alert"
              className="bg-danger-soft text-danger-ink rounded-lg px-3 py-1 text-[0.72rem] leading-snug font-semibold"
            >
              {oauthError || state.error}
            </div>
          )}

          {/* ---------- PASO 1 DE 3 ---------- */}
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
              <label htmlFor="numeroDocumento" className={labelClass}>
                DOCUMENTO DE IDENTIDAD
              </label>
              <div className="grid grid-cols-1 gap-1.5 min-[360px]:grid-cols-[135px_minmax(0,1fr)]">
                <select
                  id="tipoDocumento"
                  name="tipoDocumento"
                  aria-label="Tipo de documento"
                  value={tipoDocumento}
                  onChange={(e) => {
                    const nextType = e.target.value as DocType;
                    setTipoDocumento(nextType);
                    if (nextType === "DNI") {
                      setNumeroDocumento((prev) =>
                        prev.replace(/\D/g, "").slice(0, 8),
                      );
                    }
                  }}
                  className={`${inputClass} px-2 sm:text-xs`}
                >
                  <option value="DNI">DNI</option>
                  <option value="carné de extranjería">
                    Carné de extranjería
                  </option>
                  <option value="pasaporte">Pasaporte</option>
                </select>
                <input
                  id="numeroDocumento"
                  name="numeroDocumento"
                  type="text"
                  inputMode={tipoDocumento === "DNI" ? "numeric" : "text"}
                  maxLength={tipoDocumento === "DNI" ? 8 : 20}
                  placeholder={
                    tipoDocumento === "DNI" ? "8 dígitos" : "N.º de documento"
                  }
                  value={numeroDocumento}
                  onChange={(e) => {
                    const val =
                      tipoDocumento === "DNI"
                        ? e.target.value.replace(/\D/g, "").slice(0, 8)
                        : e.target.value;
                    setNumeroDocumento(val);
                  }}
                  aria-invalid={fe("numeroDocumento") ? "true" : undefined}
                  className={`${inputClass} font-mono tabular-nums`}
                />
              </div>
              {fe("numeroDocumento") && (
                <small role="alert" className={errClass}>
                  {fe("numeroDocumento")}
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
                  aria-pressed={showPw}
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
            <ul className="grid grid-cols-1 gap-x-3 gap-y-0.5 min-[380px]:grid-cols-2">
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
                  aria-pressed={showPw2}
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

            {/* Checkbox de Términos */}
            <label className="text-ink-muted my-1 flex cursor-pointer items-start gap-2 text-[0.72rem] leading-snug">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="accent-primary mt-0.5 h-4 w-4 shrink-0 cursor-pointer"
              />
              <span>
                Acepto los{" "}
                <Link
                  href="/terminos"
                  className="text-primary-ink focus-visible:outline-focus font-bold underline underline-offset-2 focus-visible:outline-2"
                >
                  Términos y condiciones
                </Link>{" "}
                y la{" "}
                <Link
                  href="/privacidad"
                  className="text-primary-ink focus-visible:outline-focus font-bold underline underline-offset-2 focus-visible:outline-2"
                >
                  Política de privacidad
                </Link>
                .
              </span>
            </label>

            <button
              type="submit"
              disabled={!step1Ready}
              className="bg-primary text-on-primary hover:bg-primary-hover focus-visible:outline-focus min-h-[44px] w-full cursor-pointer rounded-lg text-[0.86rem] font-bold shadow-xs transition-colors focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[40px]"
            >
              Continuar
            </button>
          </div>

          {/* ---------- PASO 2 DE 3 ---------- */}
          <div hidden={step !== 2} className="flex flex-col gap-2.5 pt-1">
            <div>
              <label htmlFor="companyName" className={labelClass}>
                NOMBRE DE LA EMPRESA
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                maxLength={120}
                autoComplete="organization"
                placeholder="Ej. Tienda SAC"
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
                placeholder="Ej. Limpieza, mantenimiento, ventas..."
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
                placeholder="Ej. Lima, Perú"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                disabled={isPending}
                className={inputClass}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={isPending || companyName.trim().length < 2}
                className="bg-primary text-on-primary hover:bg-primary-hover focus-visible:outline-focus min-h-[44px] cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[40px]"
              >
                Continuar: elegir plan
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={isPending}
                className="text-ink-muted hover:text-ink focus-visible:outline-focus min-h-[44px] cursor-pointer rounded-lg px-2 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 sm:min-h-[40px]"
              >
                Volver
              </button>
            </div>
          </div>

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
                  aria-busy={oauthProvider === "google"}
                  disabled={isPending || oauthProvider !== null}
                  onClick={() => void handleOAuthSignIn("google")}
                  className={oauthClass}
                >
                  <OAuthProviderIcon
                    provider="google"
                    loading={oauthProvider === "google"}
                    size={15}
                  />
                  Google
                </button>
                <button
                  type="button"
                  aria-label="Registrarte con Microsoft"
                  aria-busy={oauthProvider === "microsoft"}
                  disabled={isPending || oauthProvider !== null}
                  onClick={() => void handleOAuthSignIn("microsoft")}
                  className={oauthClass}
                >
                  <OAuthProviderIcon
                    provider="microsoft"
                    loading={oauthProvider === "microsoft"}
                    size={14}
                  />
                  Microsoft
                </button>
              </div>
            </>
          )}
        </div>

        {/* ---------- PASO 3 DE 3: ELIGE TU PLAN (MAX-W-4XL) ---------- */}
        <div hidden={step !== 3}>
          <PlanSelectorStep
            mode="new_registration"
            companyName={companyName}
            stepIndicator={<StepProgressIndicator step={3} />}
            isPending={isPending}
            error={
              state.error && !Object.keys(state.fieldErrors ?? {}).length
                ? state.error
                : null
            }
            submitButtonType="submit"
            onBack={() => setStep(2)}
          />
        </div>
      </form>
    </div>
  );
}

export default RegisterForm;
