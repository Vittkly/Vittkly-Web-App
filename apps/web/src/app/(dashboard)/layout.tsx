import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDashboardContext } from "@/features/dashboard/services/modules.service";
import { DashboardSidebar } from "@/features/dashboard/components/DashboardSidebar";
import { NoModulesAssignedView } from "@/features/dashboard/components/NoModulesAssignedView";
import { PendingInvitationsBanner } from "@/features/dashboard/components/PendingInvitationsBanner";
import { WebMobileTabBar } from "@/features/dashboard/components/WebMobileTabBar";
import {
  getPendingInvitationsCount,
  resolveActiveOrganization,
} from "@/features/tenants/services/tenants.service";

export default async function TenantDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, organizations, active } = await resolveActiveOrganization();

  if (!userId) redirect("/login");
  if (!active) redirect("/accesos");

  const [context, pendingInvitationsCount, cookieStore] = await Promise.all([
    getDashboardContext(active.id),
    getPendingInvitationsCount(),
    cookies(),
  ]);
  if (!context) redirect("/login");

  // Caso borde (0 módulos habilitados y sin acceso a Configuraciones): vista bloqueada limpia sin bucle
  if (context.allowedModules.length === 0 && !context.canAccessConfig) {
    return (
      <NoModulesAssignedView
        companyName={
          context.activeOrganization.nombreComercial ||
          context.activeOrganization.razonSocial ||
          active.name
        }
        userName={context.user.nombre}
        profileName={context.activeProfile.nombre}
        logoUrl={context.activeOrganization.logoRuta}
        menuIconUrl={context.activeOrganization.iconoMenuRuta}
        brandColor={context.activeOrganization.colorMarca}
      />
    );
  }

  const initialCollapsed =
    cookieStore.get("vittkly_sidebar_collapsed")?.value === "true";

  return (
    <div
      id="appShell"
      className="bg-surface flex min-h-dvh flex-col transition-colors lg:flex-row"
    >
      <DashboardSidebar
        homePath="/dashboard"
        organizations={organizations}
        activeOrganizationId={active.id}
        pendingInvitationsCount={pendingInvitationsCount}
        allowedModules={context.allowedModules}
        canAccessConfig={context.canAccessConfig}
        modules={context.enabledModules}
        user={context.user}
        activeProfile={context.activeProfile}
        initialCollapsed={initialCollapsed}
        logoUrl={context.activeOrganization.logoRuta}
        menuIconUrl={context.activeOrganization.iconoMenuRuta}
        brandColor={context.activeOrganization.colorMarca}
        menuAcordeon={context.activeOrganization.menuAcordeon}
      />

      <main className="bg-surface flex min-w-0 flex-1 flex-col overflow-y-auto pb-20 lg:pb-0">
        <PendingInvitationsBanner count={pendingInvitationsCount} />
        {children}
      </main>

      <WebMobileTabBar
        allowedModules={context.allowedModules}
        canAccessConfig={context.canAccessConfig}
      />
    </div>
  );
}
