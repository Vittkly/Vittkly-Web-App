import React from "react";
import { redirect } from "next/navigation";
import { resolveActiveOrganization } from "@/features/tenants/services/tenants.service";
import { getUsersProfilesBundle, UsersProfilesView } from "@/features/settings";

export default async function ConfiguracionesIndexPage() {
  const { userId, active } = await resolveActiveOrganization();
  if (!userId) redirect("/login");
  if (!active) redirect("/accesos");

  const bundle = await getUsersProfilesBundle(active.id);

  return <UsersProfilesView bundle={bundle} companyName={active.name} />;
}
