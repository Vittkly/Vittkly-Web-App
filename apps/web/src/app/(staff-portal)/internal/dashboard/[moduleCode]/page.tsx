import React from "react";
import { redirect } from "next/navigation";
import { getStaffDashboardContext } from "@/features/dashboard/services/modules.service";
import { ModulePlaceholderCanvas } from "@/features/dashboard/components/ModulePlaceholderCanvas";

interface InternalModulePageProps {
  params: Promise<{
    moduleCode: string;
  }>;
}

export default async function InternalModulePage({
  params,
}: InternalModulePageProps) {
  const { moduleCode } = await params;
  const context = await getStaffDashboardContext();

  if (!context) {
    redirect("/internal/login");
  }

  const activeModule = context.enabledModules.find(
    (m) => m.codigo === moduleCode,
  );

  if (!activeModule) {
    redirect("/internal/dashboard");
  }

  return (
    <ModulePlaceholderCanvas
      moduleName={activeModule.nombre}
      moduleCode={activeModule.codigo}
      groupName={activeModule.grupo}
      permissionSummary={activeModule.permissionSummary}
      modelType={activeModule.modelo}
      stageNumber={activeModule.etapa}
      backHref="/internal/dashboard"
    />
  );
}
