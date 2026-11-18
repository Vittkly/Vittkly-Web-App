import React from "react";
import { redirect } from "next/navigation";
import { resolveActiveOrganization } from "@/features/tenants/services/tenants.service";
import {
  getUsersProfilesBundle,
  parseUsersProfilesTab,
  UsersProfilesView,
  SettingsPlaceholderCanvas,
  SETTINGS_SUBMODULES,
  type SettingsSubmodule,
} from "@/features/settings";

interface SettingsSectionPageProps {
  params: Promise<{
    section: string;
  }>;
  searchParams?: Promise<{
    tab?: string;
  }>;
}

export default async function SettingsSectionPage({
  params,
  searchParams,
}: SettingsSectionPageProps) {
  const { section: sectionSlug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const { userId, active } = await resolveActiveOrganization();

  if (!userId) redirect("/login");
  if (!active) redirect("/accesos");

  // 1. MÓDULO ACTIVO: Usuarios y perfiles
  if (sectionSlug === "usuarios-perfiles") {
    const bundle = await getUsersProfilesBundle(active.id);
    return (
      <UsersProfilesView
        bundle={bundle}
        companyName={active.name}
        initialTab={parseUsersProfilesTab(resolvedSearchParams?.tab)}
      />
    );
  }

  // 2. RESTO DE MÓDULOS: Cascarones limpios "Próximamente disponible"
  const submodule: SettingsSubmodule = SETTINGS_SUBMODULES.find(
    (s) => s.slug === sectionSlug,
  ) || {
    slug: sectionSlug,
    name:
      sectionSlug.charAt(0).toUpperCase() +
      sectionSlug.slice(1).replace(/-/g, " "),
    code: `CFG-${sectionSlug.toUpperCase().slice(0, 3)}`,
    category: "negocio",
    categoryLabel: "CONFIGURACIÓN",
    description: "Parámetros y reglas de configuración de la plataforma.",
  };

  return <SettingsPlaceholderCanvas submodule={submodule} />;
}
