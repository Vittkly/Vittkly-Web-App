import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDashboardContext } from "@/features/dashboard/services/modules.service";
import { DashboardSidebar } from "@/features/dashboard/components/DashboardSidebar";
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

  // Todo el contexto (plan, perfil, módulos) se resuelve con la empresa activa validada.
  const [context, pendingInvitationsCount, cookieStore] = await Promise.all([
    getDashboardContext(active.id),
    getPendingInvitationsCount(),
    cookies(),
  ]);
  if (!context) redirect("/login");

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
        modules={context.enabledModules}
        user={context.user}
        activeProfile={context.activeProfile}
        initialCollapsed={initialCollapsed}
      />

      <main className="bg-surface flex min-w-0 flex-1 flex-col overflow-y-auto pb-20 lg:pb-0">
        <PendingInvitationsBanner count={pendingInvitationsCount} />
        {children}
      </main>

      {/* Barra de navegación inferior móvil (< lg) con backdrop blur */}
      <WebMobileTabBar />
    </div>
  );
}
