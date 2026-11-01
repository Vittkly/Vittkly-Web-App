import React from "react";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { resolveActiveOrganization } from "@/features/tenants/services/tenants.service";
import { getDashboardContext } from "@/features/dashboard/services/modules.service";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { DashboardBreadcrumbs } from "@/features/dashboard/components/DashboardBreadcrumbs";

export default async function DashboardHomePage() {
  const { userId, active } = await resolveActiveOrganization();
  if (!userId) redirect("/login");
  if (!active) redirect("/select-org");

  const context = await getDashboardContext(active.id);
  if (!context) redirect("/login");

  return (
    <div className="flex min-h-full flex-1 flex-col transition-colors">
      {/* Cabecera del Dashboard matching artifact */}
      <DashboardHeader
        title="Inicio"
        subtitle="Resumen del negocio: ventas, servicios, distritos y cobros"
        moduleCode="INICIO-01"
        userName={context.user.nombre}
        userRole={context.activeProfile.nombre}
      />

      {/* Área del Lienzo Central (Estructura base / Cascarón Visual) */}
      <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8">
        <div className="flex flex-col gap-2">
          <DashboardBreadcrumbs
            items={[{ label: "Inicio", isCurrent: true }]}
          />
          <div className="flex items-center gap-3">
            <h2 className="text-ink font-sans text-xl font-bold tracking-tight">
              Panel Principal
            </h2>
            <span className="border-line bg-surface-sunken text-ink-muted rounded-md border px-2.5 py-0.5 font-mono text-xs tabular-nums select-none">
              INICIO-01
            </span>
          </div>
        </div>

        {/* Contenedor minimalista en bg-surface-raised con borde 1px (border-line) */}
        <div className="border-line bg-surface-raised flex min-h-[360px] flex-1 flex-col items-center justify-center rounded-2xl border p-8 text-center shadow-xs sm:p-16">
          <div className="bg-success-soft text-success-ink border-success/20 mb-4 flex h-12 w-12 items-center justify-center rounded-xl border">
            <CheckCircle2 className="text-success h-6 w-6" />
          </div>
          <h3 className="text-ink text-base font-bold">
            Todo en orden &bull; Panel de Inicio
          </h3>
          <p className="text-ink-muted mt-1.5 max-w-md text-xs leading-relaxed">
            Cascarón visual y estructura base completados. De acuerdo con las
            directrices de alcance, el contenido funcional y la analítica de
            cada módulo se desplegarán en las fases siguientes.
          </p>
        </div>
      </div>
    </div>
  );
}
