import React from "react";
import { redirect } from "next/navigation";
import { getStaffDashboardContext } from "@/features/dashboard/services/modules.service";
import { StaffDashboardHeader } from "@/features/dashboard/components/StaffDashboardHeader";
import { ModulesSidebar } from "@/features/dashboard/components/ModulesSidebar";

export const instant = false;

export default async function StaffPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await getStaffDashboardContext();

  if (!context) {
    redirect("/internal/login");
  }

  return (
    <div className="bg-surface flex min-h-dvh flex-col transition-colors">
      <StaffDashboardHeader context={context} />

      <div className="flex flex-1 flex-col lg:flex-row">
        <ModulesSidebar
          modules={context.enabledModules}
          basePath="/staff/dashboard"
          homePath="/internal/dashboard"
          portalLabel="Staff SaaS Vittkly"
          subtitleLabel={context.roleLabel}
        />

        <main className="bg-surface flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
