import React from "react";
import { redirect } from "next/navigation";
import { resolveActiveOrganization } from "@/features/tenants/services/tenants.service";
import {
  CompanySettingsForm,
  getCompanySettingsBundle,
  getUsersProfilesBundle,
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
  if (!active) redirect("/accesos");

  // 1. MÓDULO ACTIVO: Empresa (CFG-EMP)
  if (sectionSlug === "empresa") {
    const companySettings = await getCompanySettingsBundle(active.id);
    if (!companySettings) redirect("/accesos");
    return (
      <div className="flex flex-1 flex-col p-5 sm:p-7">
        <CompanySettingsForm initialData={companySettings} />
      </div>
    );
  }

  // 2. MÓDULO ACTIVO: Usuarios y perfiles (CFG-USR)
  if (sectionSlug === "usuarios-perfiles") {
    const bundle = await getUsersProfilesBundle(active.id);
    return <UsersProfilesView bundle={bundle} companyName={active.name} />;
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
