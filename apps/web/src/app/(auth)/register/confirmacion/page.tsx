"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MailCheck, ArrowRight, Building, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AuthCard } from "@/features/auth/components/AuthCard";

function ConfirmacionContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "tu correo";
  const company = searchParams.get("company") || "tu empresa";
  const plan = searchParams.get("plan") || "crece";

  return (
    <AuthCard showLogo className="items-center text-center">
      <div className="bg-success-soft border-success/30 flex h-14 w-14 items-center justify-center rounded-full border">
        <MailCheck className="text-success h-7 w-7" />
      </div>

      <div className="flex w-full flex-col gap-2">
        <h1 className="text-ink text-xl font-bold tracking-tight sm:text-2xl">
          ¡Revisa tu correo electrónico!
        </h1>
        <p className="text-soft text-sm">
          Hemos enviado un enlace de confirmación a:
        </p>
        <span className="text-ink font-mono text-sm font-bold break-all">
          {email}
        </span>
      </div>

      <div className="border-line bg-surface-sunken/60 flex w-full flex-col gap-2.5 rounded-lg border p-4 text-left text-xs">
        <div className="text-ink flex items-center gap-2 font-semibold">
          <Building className="text-primary h-4 w-4 shrink-0" />
          <span>Datos de tu organización preparados:</span>
        </div>
        <div className="text-soft flex flex-col gap-1">
          <span className="break-words">
            &bull; Empresa:{" "}
            <strong className="text-ink font-semibold">{company}</strong>
          </span>
          <span>
            &bull; Plan inicial asignado:{" "}
            <strong className="text-primary-ink font-semibold uppercase">
              {plan}
            </strong>{" "}
            (30 días de prueba gratis)
          </span>
          <span>
            &bull; Tu rol asignado:{" "}
            <strong className="text-ink font-semibold">
              Administrador Propietario
            </strong>
          </span>
        </div>
      </div>

      <div className="text-soft flex w-full flex-col gap-2 text-xs">
        <div className="flex items-start gap-2 text-left">
          <CheckCircle2 className="text-success mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Abre el correo de Vittkly y haz clic en el botón de confirmación.
          </span>
        </div>
        <div className="flex items-start gap-2 text-left">
          <CheckCircle2 className="text-success mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Serás redirigido automáticamente al panel de módulos de tu empresa.
          </span>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2 pt-2">
        <Link href="/login" className="w-full">
          <Button variant="primary" size="lg" block>
            <span>Ir a Iniciar Sesión</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </AuthCard>
  );
}

export default function ConfirmacionPage() {
  return (
    <Suspense
      fallback={
        <AuthCard
          showLogo
          className="min-h-[320px] items-center justify-center"
        >
          <div className="bg-line/60 border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
        </AuthCard>
      }
    >
      <ConfirmacionContent />
    </Suspense>
  );
}
