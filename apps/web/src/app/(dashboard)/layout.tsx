import React from "react";
import { redirect } from "next/navigation";
import { getDashboardContext } from "@/features/dashboard/services/modules.service";
import { ModulesSidebar } from "@/features/dashboard/components/ModulesSidebar";
import { resolveActiveOrganization } from "@/features/tenants/services/tenants.service";

export default async function TenantDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, organizations, active } = await resolveActiveOrganization();

  if (!userId) redirect("/login");
  if (!active) redirect("/select-org");

  // Todo el contexto (plan, perfil, módulos) se resuelve con la empresa activa validada.
  const context = await getDashboardContext(active.id);
  if (!context) redirect("/login");

  return (
    <div
      id="appShell"
      className="bg-surface flex min-h-dvh flex-col transition-colors lg:flex-row"
    >
      <ModulesSidebar
        homePath="/dashboard"
        organizations={organizations}
        activeOrganizationId={active.id}
        modules={context.enabledModules}
        user={context.user}
        activeProfile={context.activeProfile}
      />

      <main className="bg-surface flex min-w-0 flex-1 flex-col overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
