import React from "react";
import { redirect } from "next/navigation";
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
  if (!active) redirect("/select-org");

  const context = await getDashboardContext(active.id);
  if (!context) redirect("/login");

  return (
    <div className="flex min-h-full flex-1 flex-col transition-colors">
      {/* Cabecera Principal de Configuraciones */}
      <DashboardHeader
        title="Configuración"
        subtitle="Administra los parámetros de tu empresa, colaboradores, roles y operaciones"
        moduleCode="CFG-00"
        userName={context.user.nombre}
        userRole={context.activeProfile.nombre}
      />

      {/* Disposición en Dos Columnas: Subnavegación lateral y Área de trabajo */}
      <div className="flex flex-1 flex-col lg:flex-row">
        <SettingsSecondaryNav />
        <main className="bg-surface flex min-w-0 flex-1 flex-col overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
