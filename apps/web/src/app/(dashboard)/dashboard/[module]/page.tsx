import React from "react";
import { redirect } from "next/navigation";
import {
  getFirstAllowedDashboardPath,
  resolveModuleBySlug,
} from "@vittkly/shared";
import { resolveActiveOrganization } from "@/features/tenants/services/tenants.service";
import { getDashboardContext } from "@/features/dashboard/services/modules.service";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { ModulePlaceholderCanvas } from "@/features/dashboard/components/ModulePlaceholderCanvas";

interface ModulePageProps {
  params: Promise<{
    module: string;
  }>;
}

export default async function DynamicModulePage({ params }: ModulePageProps) {
  const { module: moduleSlug } = await params;

  const { userId, active } = await resolveActiveOrganization();
  if (!userId) redirect("/login");
  if (!active) redirect("/accesos");

  const context = await getDashboardContext(active.id);
  if (!context) redirect("/login");

  const firstAllowed =
    getFirstAllowedDashboardPath(
      context.allowedModules,
      context.canAccessConfig,
    ) ?? "/dashboard";

  const cleanSlug = moduleSlug.trim().toLowerCase();

  if (cleanSlug === "config" || cleanSlug === "configuraciones") {
    redirect(
      context.canAccessConfig ? "/dashboard/configuraciones" : firstAllowed,
    );
  }

  const moduleMeta = resolveModuleBySlug(cleanSlug);

  if (!moduleMeta || !context.allowedModules.includes(moduleMeta.code)) {
    redirect(firstAllowed);
  }

  // Canonicalizar slugs alias (ej. /dashboard/post_venta -> /dashboard/postventa)
  if (moduleMeta.code === "dashboard") {
    redirect("/dashboard");
  }
  if (cleanSlug !== moduleMeta.slug) {
    redirect(moduleMeta.href);
  }

  const backHref = context.allowedModules.includes("dashboard")
    ? "/dashboard"
    : firstAllowed;

  return (
    <div className="flex min-h-full flex-1 flex-col transition-colors">
      <DashboardHeader
        title={moduleMeta.label}
        subtitle={moduleMeta.description}
        moduleCode={moduleMeta.shortHeaderCode}
        userName={context.user.nombre}
        userRole={context.activeProfile.nombre}
        canAccessConfig={context.canAccessConfig}
        canAccessAcademy={context.allowedModules.includes(
          "biblioteca_academia",
        )}
      />

      <ModulePlaceholderCanvas
        moduleName={moduleMeta.label}
        groupName={moduleMeta.processLabel}
        description={moduleMeta.description}
        backHref={backHref}
        hideTitle
      />
    </div>
  );
}
