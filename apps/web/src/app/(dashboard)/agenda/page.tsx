import React from "react";
import { ModulePlaceholderCanvas } from "@/features/dashboard/components/ModulePlaceholderCanvas";

export default function AgendaPage() {
  return (
    <ModulePlaceholderCanvas
      moduleName="Agenda"
      moduleCode="AGENDA"
      breadcrumbs={[{ label: "Agenda", isCurrent: true }]}
    />
  );
}
