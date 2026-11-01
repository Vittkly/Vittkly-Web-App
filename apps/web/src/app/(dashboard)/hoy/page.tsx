import React from "react";
import { ModulePlaceholderCanvas } from "@/features/dashboard/components/ModulePlaceholderCanvas";

export default function HoyPage() {
  return (
    <ModulePlaceholderCanvas
      moduleName="Hoy"
      moduleCode="HOY"
      breadcrumbs={[{ label: "Hoy", isCurrent: true }]}
    />
  );
}
