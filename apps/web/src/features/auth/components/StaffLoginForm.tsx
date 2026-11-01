"use client";

import React, { useState, useEffect, useActionState } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { staffLoginAction } from "@/features/auth/actions/auth.actions";
import type { AuthActionState } from "@/features/auth/types/auth.types";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { PasswordField } from "@/components/ui/PasswordField";
import { FeedbackBanner } from "@/components/ui/FeedbackBanner";
import { Badge } from "@/components/ui/Badge";

const initialState: AuthActionState = {
  error: null,
  message: null,
  success: false,
};

export function StaffLoginForm() {
  const [state, formAction, isPending] = useActionState(
    staffLoginAction,
    initialState,
  );
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [now, setNow] = useState<number>(() => Date.now());

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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center sm:text-left">
        <div className="flex items-center justify-center gap-2 sm:justify-start">
          <Badge variant="plan" size="sm" mono>
            Portal Interno SaaS
          </Badge>
          <Badge variant="primary" size="sm">
            Staff &amp; Superadmins
          </Badge>
        </div>
        <h1 className="text-ink text-2xl font-bold tracking-tight">
          Acceso Staff Vittkly
        </h1>
        <p className="text-ink-muted text-sm">
          Portal exclusivo para el equipo interno y administradores de la
          plataforma Vittkly.
        </p>
      </div>

      {isLocked && (
        <FeedbackBanner
          variant="danger"
          icon={
            <Clock className="text-danger mt-0.5 h-4 w-4 shrink-0 animate-pulse" />
          }
          title="Acceso bloqueado temporalmente"
          message={
            <span>
              Has superado el límite de intentos fallidos. Espera{" "}
              <span className="font-mono text-sm font-bold tabular-nums">
                {timeFormatted}
              </span>{" "}
              antes de reintentar.
            </span>
          }
        />
      )}

      {!isLocked && state.error && (
        <FeedbackBanner variant="danger" message={state.error} />
      )}

      <form action={formAction} className="flex flex-col gap-4">
        <TextField
          id="email"
          name="email"
          type="email"
          label="Correo institucional Vittkly"
          autoComplete="email"
          required
          disabled={isPending || isLocked}
          value={emailValue}
          onChange={(e) => setEmailValue(e.target.value)}
          placeholder="nombre@vittkly.com"
        />

        <PasswordField
          id="password"
          name="password"
          label="Contraseña"
          autoComplete="current-password"
          required
          disabled={isPending || isLocked}
          value={passwordValue}
          onChange={(e) => setPasswordValue(e.target.value)}
          placeholder="••••••••"
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          block
          loading={isPending}
          loadingText="Verificando credenciales de Staff..."
          disabled={isLocked}
          className="mt-2"
        >
          {isLocked
            ? `Bloqueado (${timeFormatted})`
            : "Ingresar al Portal Staff"}
        </Button>
      </form>

      <div className="border-line flex flex-col gap-2 border-t pt-4 text-center">
        <p className="text-ink-muted text-xs">
          ¿Eres una empresa cliente o invitado externo?{" "}
          <Link
            href="/login"
            className="text-accent hover:text-primary-hover font-bold transition-colors focus-visible:underline"
          >
            Ir al Portal de Empresas
          </Link>
        </p>
      </div>
    </div>
  );
}

export default StaffLoginForm;
