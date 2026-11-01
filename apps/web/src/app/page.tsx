import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/services/auth.service";
import { VittklyLogo } from "@/components/brand/VittklyLogo";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CurrentYear } from "@/components/ui/CurrentYear";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ArrowRight, ShieldCheck, Layers, Building } from "lucide-react";

export const instant = false;

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/hoy");
  }

  return (
    <div className="bg-surface flex min-h-dvh flex-col justify-between p-4 transition-colors sm:p-6 lg:p-8">
      {/* Barra de navegación superior */}
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between pb-4">
        <Link
          href="/"
          className="focus-visible:outline-focus inline-flex items-center gap-2 transition-opacity hover:opacity-90 focus-visible:outline-2"
        >
          <VittklyLogo variant="wordmark" height={32} priority />
        </Link>
        <ThemeToggle />
      </header>

      {/* Hero Central */}
      <main className="mx-auto my-auto flex w-full max-w-2xl flex-col items-center gap-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <Badge variant="plan" size="md" mono>
            Central de Servicios Web &bull; SaaS B2B
          </Badge>

          <h1 className="text-ink text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            Plataforma All-in-One para Empresas de Servicios
          </h1>

          <p className="text-ink-muted max-w-xl text-sm leading-relaxed sm:text-base">
            Orquestación inteligente de operaciones en campo, cuadrillas
            técnicas, cotizaciones, agenda y finanzas con arquitectura
            Multi-Tenant y RLS estricto.
          </p>
        </div>

        {/* Botones de Acción */}
        <div className="flex w-full flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
          <Link href="/login" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full min-w-[200px] sm:w-auto"
            >
              <span>Iniciar Sesión</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          <Link href="/register" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full min-w-[200px] sm:w-auto"
            >
              <span>Registrar Empresa</span>
            </Button>
          </Link>
        </div>

        {/* Accesos a otros portales */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-1 text-xs">
          <Link
            href="/invitado"
            className="text-ink-muted hover:text-primary font-semibold underline-offset-4 transition-colors hover:underline"
          >
            Acceso Clientes / Invitados (VK-XXXX)
          </Link>
          <span className="text-line-strong select-none">&bull;</span>
          <Link
            href="/internal/login"
            className="text-ink-muted hover:text-primary font-semibold underline-offset-4 transition-colors hover:underline"
          >
            Portal Interno Staff Vittkly
          </Link>
        </div>

        {/* Bento Trust Grid */}
        <div className="border-line/70 bg-surface-sunken/60 mt-4 grid w-full grid-cols-1 gap-3 rounded-2xl border p-4 text-left text-xs sm:grid-cols-3">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary-soft text-primary-ink flex h-7 w-7 shrink-0 items-center justify-center rounded-md">
              <Building className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-ink font-bold">Multi-Tenant Aislado</span>
              <span className="text-ink-muted text-[11px]">
                Bases de datos independientes
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="bg-success-soft text-success-ink flex h-7 w-7 shrink-0 items-center justify-center rounded-md">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-ink font-bold">
                RLS &amp; AppSec Estricto
              </span>
              <span className="text-ink-muted text-[11px]">
                Políticas a nivel de fila
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="bg-primary-soft text-primary-ink flex h-7 w-7 shrink-0 items-center justify-center rounded-md">
              <Layers className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-ink font-bold">39 Módulos Maestros</span>
              <span className="text-ink-muted text-[11px]">
                Filtrado por Plan y Perfil
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-ink-muted mx-auto w-full max-w-7xl pt-6 text-center text-xs">
        <p>
          &copy; <CurrentYear /> Vittkly Inc. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
