import React from "react";
import { redirect } from "next/navigation";
import { resolveActiveOrganization } from "@/features/tenants/services/tenants.service";
import { getTeamMembers, UsersProfilesView } from "@/features/settings";

export default async function ConfiguracionesIndexPage() {
  const { userId, active } = await resolveActiveOrganization();
  if (!userId) redirect("/login");
  if (!active) redirect("/select-org");

  const members = await getTeamMembers(active.id);

  return (
    <UsersProfilesView initialMembers={members} companyName={active.name} />
  );
}
