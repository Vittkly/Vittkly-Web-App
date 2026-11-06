import React from "react";
import { redirect } from "next/navigation";
import { resolveActiveOrganization } from "@/features/tenants/services/tenants.service";
import { getDashboardContext } from "@/features/dashboard/services/modules.service";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { ModulePlaceholderCanvas } from "@/features/dashboard/components/ModulePlaceholderCanvas";

export default async function DashboardHomePage() {
  const { userId, active } = await resolveActiveOrganization();
  if (!userId) redirect("/login");
  if (!active) redirect("/select-org");

  const context = await getDashboardContext(active.id);
  if (!context) redirect("/login");

  return (
    <div className="flex min-h-full flex-1 flex-col transition-colors">
      <DashboardHeader
        title="Inicio"
        subtitle="Resumen del negocio: ventas, servicios, distritos y cobros"
        moduleCode="INICIO-01"
        userName={context.user.nombre}
        userRole={context.activeProfile.nombre}
      />
      <ModulePlaceholderCanvas
        moduleName="Inicio"
        moduleCode="INICIO-01"
        breadcrumbs={[{ label: "Inicio", isCurrent: true }]}
        hideTitle
      />
    </div>
  );
}
