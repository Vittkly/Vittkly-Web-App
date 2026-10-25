import React from "react";
import { redirect } from "next/navigation";
import { getDashboardContext } from "@/features/dashboard/services/modules.service";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { ContextSelectorBar } from "@/features/dashboard/components/ContextSelectorBar";
import { ModulesListView } from "@/features/dashboard/components/ModulesListView";
import { FeedbackBanner } from "@/components/ui/FeedbackBanner";

export const instant = false;

interface DashboardPageProps {
  searchParams: Promise<{
    empresa?: string;
    perfil?: string;
    welcome?: string;
  }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const context = await getDashboardContext(params.empresa, params.perfil);

  if (!context) {
    redirect("/login");
  }

  const isWelcome = params.welcome === "true";

  return (
    <div className="bg-surface flex min-h-dvh flex-col transition-colors">
      {/* Cabecera Principal */}
      <DashboardHeader context={context} />

      {/* Contenido Central */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Banner de Bienvenida Post-Registro */}
        {isWelcome && (
          <FeedbackBanner
            variant="success"
            title="¡Bienvenido a Vittkly!"
            message={
              <span>
                Tu organización{" "}
                <strong>{context.activeOrganization.razonSocial}</strong> ha
                sido creada exitosamente con el plan{" "}
                <strong className="uppercase">
                  {context.activePlan.nombre}
                </strong>
                . Tienes <strong>15 días de prueba</strong> con acceso a todos
                los módulos incluidos en tu plan.
              </span>
            }
          />
        )}

        {/* Barra de Selección de Contexto: Organización y Área/Perfil */}
        <ContextSelectorBar context={context} />

        {/* Lista Estructurada de Módulos (Solo Lista por Plan + Área + Permisos) */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1 text-left">
            <h2 className="text-ink text-lg font-bold tracking-tight sm:text-xl">
              Módulos Habilitados de la Plataforma
            </h2>
            <p className="text-soft text-xs sm:text-sm">
              Listado filtrado automáticamente según tu{" "}
              <strong className="text-ink">
                Plan ({context.activePlan.nombre})
              </strong>
              , tu{" "}
              <strong className="text-ink">
                Área ({context.activeProfile.nombre})
              </strong>{" "}
              y tus <strong className="text-ink">Permisos de Acceso</strong>{" "}
              (conforme a `seed.sql`).
            </p>
          </div>

          <ModulesListView context={context} />
        </div>
      </main>
    </div>
  );
}
