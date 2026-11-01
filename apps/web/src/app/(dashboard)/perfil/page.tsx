import React from "react";
import { ModulePlaceholderCanvas } from "@/features/dashboard/components/ModulePlaceholderCanvas";

export default function PerfilPage() {
  return (
    <ModulePlaceholderCanvas
      moduleName="Perfil"
      moduleCode="PERFIL"
      breadcrumbs={[{ label: "Perfil", isCurrent: true }]}
    />
  );
}
