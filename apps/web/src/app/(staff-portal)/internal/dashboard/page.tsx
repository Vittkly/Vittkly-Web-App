import React from "react";
import { redirect } from "next/navigation";
import { getStaffDashboardContext } from "@/features/dashboard/services/modules.service";
import { StaffBentoCommandCenter } from "@/features/dashboard/components/StaffBentoCommandCenter";

export default async function InternalDashboardHomePage() {
  const context = await getStaffDashboardContext();

  if (!context) {
    redirect("/internal/login");
  }

  return (
    <StaffBentoCommandCenter context={context} basePath="/staff/dashboard" />
  );
}
