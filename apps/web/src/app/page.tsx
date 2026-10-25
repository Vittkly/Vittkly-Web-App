import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/services/auth.service";
import { VittklyLogo } from "@/components/brand/VittklyLogo";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CurrentYear } from "@/components/ui/CurrentYear";
import { ArrowRight, ShieldCheck, Layers, Building } from "lucide-react";

export const instant = false;

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="bg-surface flex min-h-dvh flex-col items-center justify-center p-6 text-center transition-colors">
      <div className="flex max-w-lg flex-col items-center gap-6">
        <VittklyLogo variant="wordmark" height={44} priority />

        <div className="flex flex-col gap-2">
          <Badge variant="plan" size="md" className="mx-auto" mono>
            Central de Servicios Web
          </Badge>
          <h1 className="text-ink text-2xl font-extrabold tracking-tight sm:text-3xl">
            Plataforma All-in-One para Empresas de Servicios
          </h1>
          <p className="text-soft text-sm leading-relaxed sm:text-base">
            Gestión inteligente de operaciones de campo, cuadrillas,
            cotizaciones, CRM, agenda y finanzas con arquitectura Multi-Tenant y
            RLS estricto.
          </p>
        </div>

        {/* Botones de Acción Principal */}
        <div className="flex w-full flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
          <Link href="/login" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full min-w-[180px] sm:w-auto"
            >
              <span>Iniciar Sesión</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          <Link href="/register" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full min-w-[180px] sm:w-auto"
            >
              <span>Registrar Empresa</span>
            </Button>
          </Link>
        </div>

        {/* Pilares Técnicos */}
        <div className="border-line/70 bg-surface-sunken/60 grid w-full grid-cols-1 gap-2.5 rounded-xl border p-4 text-left text-xs sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <Building className="text-primary h-4 w-4 shrink-0" />
            <span className="text-ink font-semibold">Multi-Tenant Aislado</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-success h-4 w-4 shrink-0" />
            <span className="text-ink font-semibold">
              RLS & AppSec Estricto
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Layers className="text-accent h-4 w-4 shrink-0" />
            <span className="text-ink font-semibold">
              Módulos por Plan & Rol
            </span>
          </div>
        </div>

        <footer className="text-soft text-xs">
          &copy; <CurrentYear /> Vittkly Inc. Todos los derechos reservados.
        </footer>
      </div>
    </main>
  );
}
