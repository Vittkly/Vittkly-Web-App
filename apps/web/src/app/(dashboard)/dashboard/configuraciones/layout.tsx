import React from "react";
import { redirect } from "next/navigation";
import { getFirstAllowedDashboardPath } from "@vittkly/shared";
import { resolveActiveOrganization } from "@/features/tenants/services/tenants.service";
import { getDashboardContext } from "@/features/dashboard/services/modules.service";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { SettingsSecondaryNav } from "@/features/settings";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, active } = await resolveActiveOrganization();
  if (!userId) redirect("/login");
  if (!active) redirect("/accesos");

  const context = await getDashboardContext(active.id);
  if (!context) redirect("/login");

  // Blindaje estricto: Configuraciones es exclusivo para propietario o administrador
  if (!context.canAccessConfig) {
    const firstAllowed =
      getFirstAllowedDashboardPath(context.allowedModules, false) ??
      "/dashboard";
    redirect(firstAllowed);
  }

  return (
    <div className="flex min-h-full flex-1 flex-col transition-colors">
      {/* Cabecera Principal de Configuraciones */}
      <DashboardHeader
        title="Configuraciones"
        subtitle="Parámetros de cada módulo en un solo lugar"
        moduleCode="CFG-00"
        userName={context.user.nombre}
        userRole={context.activeProfile.nombre}
        canAccessConfig={context.canAccessConfig}
        canAccessAcademy={context.allowedModules.includes(
          "biblioteca_academia",
        )}
      />

      {/* Disposición Adaptativa: 
          - En escritorio (>= lg): Sidebar lateral izquierdo con categorías.
          - En móvil (< lg): Barra horizontal deslizable sin scrollbar visible.
      */}
      <div className="flex flex-1 flex-col lg:flex-row">
        <SettingsSecondaryNav />
        <div className="bg-surface flex min-w-0 flex-1 flex-col overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
