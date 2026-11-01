"use client";

import React, { useState, useActionState } from "react";
import Link from "next/link";
import { redeemInvitationAction } from "@/features/auth/actions/auth.actions";
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

export function GuestAccessForm() {
  const [state, formAction, isPending] = useActionState(
    redeemInvitationAction,
    initialState,
  );
  const [invitationCode, setInvitationCode] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center sm:text-left">
        <div className="flex items-center justify-center gap-2 sm:justify-start">
          <Badge variant="outline" size="sm" mono>
            Portal Clientes &amp; Invitados
          </Badge>
        </div>
        <h1 className="text-ink text-2xl font-bold tracking-tight">
          Acceso con Invitación
        </h1>
        <p className="text-ink-muted text-sm">
          Únete al equipo de tu empresa ingresando tu código de invitación o tus
          credenciales de colaborador invitado.
        </p>
      </div>

      {state.error && <FeedbackBanner variant="danger" message={state.error} />}

      <form action={formAction} className="flex flex-col gap-4">
        <TextField
          id="fullName"
          name="fullName"
          label="Nombre completo"
          placeholder="Ej. María Gómez"
          autoComplete="name"
          required
          disabled={isPending}
          error={state.fieldErrors?.fullName}
        />

        <TextField
          id="email"
          name="email"
          type="email"
          label="Correo electrónico"
          placeholder="tu.correo@ejemplo.com"
          autoComplete="email"
          required
          disabled={isPending}
          error={state.fieldErrors?.email}
        />

        <PasswordField
          id="password"
          name="password"
          label="Contraseña"
          autoComplete="current-password"
          required
          disabled={isPending}
          placeholder="••••••••"
          error={state.fieldErrors?.password}
        />

        <TextField
          id="invitationCode"
          name="invitationCode"
          label="Código de invitación (Opcional si fue enviado a tu correo)"
          placeholder="VK-XXXX-XXXX"
          value={invitationCode}
          onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
          disabled={isPending}
          hint="Formato oficial: VK-XXXX-XXXX"
          error={state.fieldErrors?.invitationCode}
          className="font-mono uppercase tabular-nums"
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          block
          loading={isPending}
          loadingText="Validando invitación..."
          className="mt-2"
        >
          Unirme y Entrar
        </Button>
      </form>

      <div className="border-line flex flex-col gap-2 border-t pt-4 text-center">
        <p className="text-ink-muted text-xs">
          ¿Ya eres miembro activo?{" "}
          <Link
            href="/login"
            className="text-accent hover:text-primary-hover font-bold transition-colors focus-visible:underline"
          >
            Inicia sesión aquí
          </Link>
        </p>
        <p className="text-ink-muted text-xs">
          ¿Deseas contratar Vittkly para tu propia empresa?{" "}
          <Link
            href="/register"
            className="text-accent hover:text-primary-hover font-bold transition-colors focus-visible:underline"
          >
            Registrar nueva empresa (Tenant B2B)
          </Link>
        </p>
      </div>
    </div>
  );
}

export default GuestAccessForm;
