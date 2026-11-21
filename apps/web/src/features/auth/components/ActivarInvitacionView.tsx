"use client";

import React, { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Mail,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  Building2,
  RefreshCw,
  KeyRound,
  UserCheck,
} from "lucide-react";
import { CompanyAvatar } from "@/components/brand/CompanyAvatar";
import { AuthCard } from "./AuthCard";
import type { InvitationVerificationStatus } from "../services/invitacion-activation.service";
import {
  enviarOtpActivacionAction,
  verificarOtpActivacionAction,
  completarActivacionAction,
} from "../actions/activar-invitacion.actions";
import { maskContact, type OtpChannel } from "../utils/contact-mask";

interface ActivarInvitacionViewProps {
  initialStatus: InvitationVerificationStatus;
  token: string;
}

export function ActivarInvitacionView({
  initialStatus,
  token,
}: ActivarInvitacionViewProps) {
  const router = useRouter();

  // Estados del wizard para 'nueva_cuenta'
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedChannel, setSelectedChannel] = useState<OtpChannel>("correo");
  const [maskedDestination, setMaskedDestination] = useState<string>("");
  const [otpCode, setOtpCode] = useState<string>("");
  const [fullName, setFullName] = useState<string>(
    initialStatus.status === "valid"
      ? `${initialStatus.invitation.nombres ?? ""} ${initialStatus.invitation.apellidos ?? ""}`.trim()
      : "",
  );
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [isPending, startTransition] = useTransition();

  // Temporizador para el reenvío de OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Manejo de Caso 1: Invitación Inválida o Expirada
  if (initialStatus.status === "invalid_or_expired") {
    const isExpired = initialStatus.reason === "expired";
    const isUsed = initialStatus.reason === "already_used";

    return (
      <AuthCard showLogo>
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <div className="bg-warning/15 text-warning border-warning/30 flex h-12 w-12 items-center justify-center rounded-full border">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-ink text-lg font-bold">
            {isExpired
              ? "Esta invitación ha vencido"
              : isUsed
                ? "Esta invitación ya fue utilizada"
                : "Enlace de invitación no disponible"}
          </h2>
          <p className="text-ink-muted text-xs leading-relaxed">
            {isExpired
              ? "Los enlaces de invitación tienen una validez máxima de 7 días. Solicita al administrador de la empresa que te reenvíe una nueva invitación."
              : isUsed
                ? "Este acceso ya fue activado previamente. Si ya tienes tu contraseña, puedes iniciar sesión directamente."
                : "El token proporcionado no existe o no se encuentra activo en el sistema."}
          </p>

          <div className="mt-4 w-full">
            <Link
              href="/login"
              className="bg-primary flex min-h-[44px] w-full items-center justify-center rounded-xl px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-95"
            >
              Ir a Iniciar Sesión
            </Link>
          </div>
        </div>
      </AuthCard>
    );
  }

  const { invitation, tipo } = initialStatus;

  // Manejo de Caso 2: El usuario ya tiene una cuenta activa en Vittkly
  if (tipo === "cuenta_existente") {
    const userName =
      initialStatus.existingUserName ||
      `${invitation.nombres ?? ""} ${invitation.apellidos ?? ""}`.trim() ||
      "Colaborador";

    return (
      <AuthCard showLogo>
        <div className="flex flex-col gap-4">
          <div className="border-line flex items-center gap-2.5 border-b pb-2">
            <CompanyAvatar
              name={invitation.empresaNombre}
              menuIconUrl={invitation.empresaMenuIconUrl}
              logoUrl={invitation.empresaLogoUrl}
              brandColor={invitation.empresaBrandColor}
              size="lg"
              shape="rounded"
              className="bg-primary/10 text-primary border-primary/20"
              fallbackIcon={<Building2 className="h-5 w-5" />}
            />
            <div>
              <p className="text-ink-muted text-[11px] font-semibold tracking-wider uppercase">
                Invitación recibida
              </p>
              <h2 className="text-ink text-sm font-bold">
                {invitation.empresaNombre}
              </h2>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-ink text-base font-bold">¡Hola, {userName}!</h1>
            <p className="text-ink-muted text-xs">
              Has sido invitado a formar parte del equipo con el perfil de{" "}
              <strong className="text-ink font-semibold">
                {invitation.perfilNombre}
              </strong>
              {invitation.cargo ? ` (${invitation.cargo})` : ""}.
            </p>
          </div>

          <div className="border-line bg-surface-sunken space-y-1.5 rounded-xl border p-3.5">
            <div className="text-ink flex items-center gap-2 text-xs font-bold">
              <UserCheck className="text-primary h-4 w-4 shrink-0" />
              <span>Ya tienes una cuenta registrada en Vittkly</span>
            </div>
            <p className="text-ink-muted text-[11px] leading-relaxed">
              {invitation.correo ? (
                <>
                  Detectamos que el correo{" "}
                  <strong className="text-ink font-mono">
                    {invitation.correo}
                  </strong>{" "}
                  ya cuenta con un usuario en la plataforma. Para responder a
                  esta invitación de manera segura, ingresa a tu pantalla de{" "}
                  <strong className="text-ink">Accesos a empresa</strong>.
                </>
              ) : (
                <>
                  Detectamos que tu documento ya cuenta con un usuario
                  registrado en la plataforma. Para responder a esta invitación
                  de manera segura, ingresa a tu pantalla de{" "}
                  <strong className="text-ink">Accesos a empresa</strong>.
                </>
              )}
            </p>
          </div>

          <div className="pt-2">
            {initialStatus.isAuthenticated ? (
              <Link
                href="/accesos"
                className="bg-primary flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-95"
              >
                <span>Ir a Accesos a empresa</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href={`/login?redirectTo=/accesos&email=${encodeURIComponent(invitation.correo)}`}
                className="bg-primary flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-95"
              >
                <span>Iniciar sesión para responder</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </AuthCard>
    );
  }

  // Manejo de Caso 3: Usuario nuevo (Flujo de 3 pasos)
  const handleSendOtp = () => {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await enviarOtpActivacionAction({
        token,
        canal: selectedChannel,
      });

      if (!res.success || !res.data) {
        setErrorMessage(
          res.error || "No se pudo enviar el código. Inténtalo nuevamente.",
        );
        return;
      }

      setMaskedDestination(res.data.destinoEnmascarado);
      setResendCooldown(60);
      setStep(2);
    });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!otpCode || otpCode.trim().length !== 6) {
      setErrorMessage("Ingresa el código numérico completo de 6 dígitos.");
      return;
    }

    startTransition(async () => {
      const res = await verificarOtpActivacionAction({
        token,
        canal: selectedChannel,
        code: otpCode,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Código incorrecto.");
        return;
      }

      setStep(3);
    });
  };

  const handleCompleteActivation = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage("Ingresa tu nombre completo.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    startTransition(async () => {
      const res = await completarActivacionAction({
        token,
        fullName,
        password,
        confirmPassword,
      });

      if (!res.success || !res.data) {
        setErrorMessage(
          res.error || "No se pudo completar la activación. Revisa los datos.",
        );
        return;
      }

      router.push(res.data.redirectUrl);
    });
  };

  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasNumber;

  return (
    <AuthCard showLogo>
      <div className="flex flex-col gap-4">
        {/* Cabecera de la empresa */}
        <div className="border-line flex items-center gap-2.5 border-b pb-2">
          <CompanyAvatar
            name={invitation.empresaNombre}
            menuIconUrl={invitation.empresaMenuIconUrl}
            logoUrl={invitation.empresaLogoUrl}
            brandColor={invitation.empresaBrandColor}
            size="lg"
            shape="rounded"
            className="bg-primary/10 text-primary border-primary/20"
            fallbackIcon={<Building2 className="h-5 w-5" />}
          />
          <div className="min-w-0 flex-1">
            <p className="text-ink-muted text-[10px] font-bold tracking-wider uppercase">
              Invitación de equipo
            </p>
            <h2 className="text-ink truncate text-xs font-bold">
              {invitation.empresaNombre}
            </h2>
          </div>
          <span className="bg-primary/10 border-primary/20 text-primary shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold">
            {invitation.perfilNombre}
          </span>
        </div>

        {/* Barra de progreso de 3 pasos */}
        <div className="flex flex-col gap-1.5">
          <div className="text-ink-muted flex items-center justify-between text-[10px] font-bold tracking-wider uppercase">
            <span>
              {step === 1 && "Paso 1 de 3 · Canal de verificación"}
              {step === 2 && "Paso 2 de 3 · Código de seguridad"}
              {step === 3 && "Paso 3 de 3 · Tu contraseña"}
            </span>
            <span className="text-primary font-mono">{step}/3</span>
          </div>
          <div className="grid h-1 grid-cols-3 gap-1.5">
            <div
              className={`rounded-full transition-colors ${
                step >= 1 ? "bg-primary" : "bg-line"
              }`}
            />
            <div
              className={`rounded-full transition-colors ${
                step >= 2 ? "bg-primary" : "bg-line"
              }`}
            />
            <div
              className={`rounded-full transition-colors ${
                step >= 3 ? "bg-primary" : "bg-line"
              }`}
            />
          </div>
        </div>

        {/* Mensaje de Error Global */}
        {errorMessage && (
          <div className="border-danger/30 bg-danger/10 text-danger flex items-start gap-2 rounded-xl border p-3 text-xs font-medium">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="leading-tight">{errorMessage}</span>
          </div>
        )}

        {/* PASO 1: Selección de canal de verificación */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div className="space-y-1">
              <h1 className="text-ink text-base font-bold">
                Te damos la bienvenida a Vittkly
              </h1>
              <p className="text-ink-muted text-xs leading-relaxed">
                Para confirmar tu acceso a{" "}
                <strong className="text-ink font-semibold">
                  {invitation.empresaNombre}
                </strong>
                , te enviaremos un código de seguridad de 6 dígitos.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-ink-muted text-[11px] font-bold tracking-wider uppercase">
                Elige dónde recibir tu código:
              </label>

              {/* Opción Correo */}
              <button
                type="button"
                onClick={() => setSelectedChannel("correo")}
                className={`flex w-full cursor-pointer items-center justify-between rounded-xl border p-3 text-left transition-colors ${
                  selectedChannel === "correo"
                    ? "border-primary bg-primary/5 text-ink"
                    : "border-line bg-surface hover:bg-surface-sunken text-ink-muted"
                }`}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <Mail
                    className={`h-4 w-4 shrink-0 ${
                      selectedChannel === "correo"
                        ? "text-primary"
                        : "text-ink-muted"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-ink text-xs font-bold">
                      Correo electrónico
                    </p>
                    <p className="text-ink-muted truncate font-mono text-[11px]">
                      {maskContact(invitation.correo, "correo")}
                    </p>
                  </div>
                </div>
                <div
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    selectedChannel === "correo"
                      ? "border-primary bg-primary text-white"
                      : "border-line"
                  }`}
                >
                  {selectedChannel === "correo" && (
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </div>
              </button>

              {/* Opción Celular (si está registrado) */}
              {invitation.celular && (
                <button
                  type="button"
                  onClick={() => setSelectedChannel("celular")}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-xl border p-3 text-left transition-colors ${
                    selectedChannel === "celular"
                      ? "border-primary bg-primary/5 text-ink"
                      : "border-line bg-surface hover:bg-surface-sunken text-ink-muted"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Smartphone
                      className={`h-4 w-4 shrink-0 ${
                        selectedChannel === "celular"
                          ? "text-primary"
                          : "text-ink-muted"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-ink text-xs font-bold">
                        Celular (WhatsApp / SMS)
                      </p>
                      <p className="text-ink-muted truncate font-mono text-[11px]">
                        {maskContact(invitation.celular, "celular")}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                      selectedChannel === "celular"
                        ? "border-primary bg-primary text-white"
                        : "border-line"
                    }`}
                  >
                    {selectedChannel === "celular" && (
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleSendOtp}
              disabled={isPending}
              className="bg-primary flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-95 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Enviando código...</span>
                </>
              ) : (
                <>
                  <span>Enviar código de confirmación</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* PASO 2: Ingreso y verificación de código OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div className="space-y-1">
              <h1 className="text-ink text-base font-bold">
                Ingresa tu código de 6 dígitos
              </h1>
              <p className="text-ink-muted text-xs leading-relaxed">
                Enviamos un código de seguridad a tu{" "}
                <span className="text-ink font-semibold">
                  {selectedChannel === "correo" ? "correo" : "celular"}
                </span>
                :{" "}
                <strong className="text-ink font-mono">
                  {maskedDestination ||
                    maskContact(
                      selectedChannel === "correo"
                        ? invitation.correo
                        : invitation.celular || "",
                      selectedChannel,
                    )}
                </strong>
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-ink-muted text-[11px] font-bold tracking-wider uppercase">
                Código de verificación (OTP)
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otpCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setOtpCode(val);
                }}
                autoFocus
                placeholder="••••••"
                className="border-line bg-surface-sunken text-ink focus:border-primary focus:ring-primary w-full rounded-xl border px-4 py-3 text-center font-mono text-2xl font-bold tracking-widest tabular-nums focus:ring-1 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isPending || otpCode.length !== 6}
              className="bg-primary flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-95 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Verificar código</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-ink-muted hover:text-ink cursor-pointer text-[11px] hover:underline"
              >
                ← Cambiar canal
              </button>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={resendCooldown > 0 || isPending}
                className="text-primary cursor-pointer text-[11px] font-bold hover:underline disabled:no-underline disabled:opacity-50"
              >
                {resendCooldown > 0
                  ? `Reenviar en ${resendCooldown}s`
                  : "Reenviar código"}
              </button>
            </div>
          </form>
        )}

        {/* PASO 3: Creación de Contraseña */}
        {step === 3 && (
          <form
            onSubmit={handleCompleteActivation}
            className="flex flex-col gap-4"
          >
            <div className="space-y-1">
              <h1 className="text-ink text-base font-bold">
                Configura tu contraseña
              </h1>
              <p className="text-ink-muted text-xs">
                Tu identidad ha sido verificada con éxito. Define tu clave para
                iniciar sesión en Vittkly.
              </p>
            </div>

            {/* Correo bloqueado/solo lectura */}
            <div className="space-y-1">
              <label className="text-ink-muted text-[11px] font-bold tracking-wider uppercase">
                Correo de acceso
              </label>
              <div className="border-line bg-surface-sunken/80 text-ink-muted flex cursor-not-allowed items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium">
                <Lock className="text-ink-muted h-3.5 w-3.5 shrink-0" />
                <span className="truncate font-mono">{invitation.correo}</span>
              </div>
            </div>

            {/* Nombre completo */}
            <div className="space-y-1">
              <label className="text-ink-muted text-[11px] font-bold tracking-wider uppercase">
                Tu nombre completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Nombre y Apellido"
                className="border-line bg-surface-sunken text-ink focus:border-primary focus:ring-primary w-full rounded-xl border px-3 py-2 text-xs focus:ring-1 focus:outline-none"
              />
            </div>

            {/* Nueva contraseña */}
            <div className="space-y-1">
              <label className="text-ink-muted text-[11px] font-bold tracking-wider uppercase">
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Mínimo 8 caracteres"
                  className="border-line bg-surface-sunken text-ink focus:border-primary focus:ring-primary w-full rounded-xl border px-3 py-2 pr-9 font-mono text-xs focus:ring-1 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-ink-muted hover:text-ink absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer"
                  aria-label="Ver u ocultar contraseña"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div className="space-y-1">
              <label className="text-ink-muted text-[11px] font-bold tracking-wider uppercase">
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repite la contraseña"
                  className="border-line bg-surface-sunken text-ink focus:border-primary focus:ring-primary w-full rounded-xl border px-3 py-2 pr-9 font-mono text-xs focus:ring-1 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="text-ink-muted hover:text-ink absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer"
                  aria-label="Ver u ocultar confirmación de contraseña"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Checklist de requisitos de seguridad */}
            <div className="border-line bg-surface-sunken space-y-1 rounded-xl border p-2.5 text-[11px]">
              <div
                className={`flex items-center gap-1.5 ${
                  hasMinLength ? "text-success font-semibold" : "text-ink-muted"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Mínimo 8 caracteres</span>
              </div>
              <div
                className={`flex items-center gap-1.5 ${
                  hasUpperCase ? "text-success font-semibold" : "text-ink-muted"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Al menos una letra mayúscula</span>
              </div>
              <div
                className={`flex items-center gap-1.5 ${
                  hasNumber ? "text-success font-semibold" : "text-ink-muted"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Al menos un número</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={
                isPending ||
                !isPasswordValid ||
                password !== confirmPassword ||
                !fullName.trim()
              }
              className="bg-primary flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-95 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Activando tu cuenta...</span>
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  <span>Activar mi cuenta y entrar</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </AuthCard>
  );
}
