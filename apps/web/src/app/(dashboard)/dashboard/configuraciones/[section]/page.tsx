import React from "react";
import { redirect } from "next/navigation";
import { resolveActiveOrganization } from "@/features/tenants/services/tenants.service";
import {
  getTeamMembers,
  UsersProfilesView,
  SettingsPlaceholderCanvas,
  SETTINGS_SUBMODULES,
  type SettingsSubmodule,
} from "@/features/settings";

interface SettingsSectionPageProps {
  params: Promise<{
    section: string;
  }>;
}

export default async function SettingsSectionPage({
  params,
}: SettingsSectionPageProps) {
  const { section: sectionSlug } = await params;
  const { userId, active } = await resolveActiveOrganization();

  if (!userId) redirect("/login");
  if (!active) redirect("/select-org");

  // 1. MÓDULO ACTIVO: Usuarios y perfiles
  if (sectionSlug === "usuarios-perfiles") {
    const members = await getTeamMembers(active.id);
    return (
      <UsersProfilesView initialMembers={members} companyName={active.name} />
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
