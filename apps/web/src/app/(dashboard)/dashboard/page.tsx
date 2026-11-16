import React from "react";
import { redirect } from "next/navigation";
import { getFirstAllowedDashboardPath } from "@vittkly/shared";
import { resolveActiveOrganization } from "@/features/tenants/services/tenants.service";
import { getDashboardContext } from "@/features/dashboard/services/modules.service";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { NoModulesAssignedView } from "@/features/dashboard/components/NoModulesAssignedView";
import { TenantDashboardView } from "@/features/dashboard/components/TenantDashboardView";

export default async function DashboardHomePage() {
  const { userId, active } = await resolveActiveOrganization();
  if (!userId) redirect("/login");
  if (!active) redirect("/accesos");

  const context = await getDashboardContext(active.id);
  if (!context) redirect("/login");

  if (!context.allowedModules.includes("dashboard")) {
    const firstAllowed = getFirstAllowedDashboardPath(
      context.allowedModules,
      context.canAccessConfig,
    );
    if (firstAllowed && firstAllowed !== "/dashboard") {
      redirect(firstAllowed);
    }

    return (
      <NoModulesAssignedView
        companyName={active.name}
        userName={context.user.nombre}
        profileName={context.activeProfile.nombre}
      />
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col transition-colors">
      <DashboardHeader
        title="Inicio"
        subtitle="Resumen del negocio: ventas, servicios, distritos y cobros"
        userName={context.user.nombre}
        userRole={context.activeProfile.nombre}
        canAccessConfig={context.canAccessConfig}
        canAccessAcademy={context.allowedModules.includes(
          "biblioteca_academia",
        )}
      />
      <TenantDashboardView
        companyName={active.name}
        allowedModules={context.allowedModules}
        canAccessConfig={context.canAccessConfig}
      />
    </div>
  );
}
