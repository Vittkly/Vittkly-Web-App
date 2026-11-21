import React from "react";
import { redirect } from "next/navigation";
import { resolveActiveOrganization } from "@/features/tenants/services/tenants.service";
import {
  getUsersProfilesBundle,
  parseUsersProfilesTab,
  UsersProfilesView,
} from "@/features/settings";

export default async function ConfiguracionesIndexPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const { userId, active } = await resolveActiveOrganization();
  if (!userId) redirect("/login");
  if (!active) redirect("/accesos");

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialTab = parseUsersProfilesTab(resolvedSearchParams?.tab);
  const bundle = await getUsersProfilesBundle(active.id);

  return (
    <UsersProfilesView
      bundle={bundle}
      companyName={active.name}
      initialTab={initialTab}
    />
  );
}
