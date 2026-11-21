import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getMisAccesos,
  getOrganizationOptions,
} from "@/features/tenants/services/tenants.service";
import { ACTIVE_ORG_COOKIE } from "@/features/tenants/types/tenants.types";
import { AccesosEmpresaView } from "@/features/tenants/components/AccesosEmpresaView";

export const dynamic = "force-dynamic";

interface AccesosPageProps {
  searchParams?: Promise<{ stay?: string | string[] }>;
}

export default async function AccesosPage({ searchParams }: AccesosPageProps) {
  const [
    { userId, organizations, totalActiveCount },
    cookieStore,
    resolvedSearchParams,
  ] = await Promise.all([
    getOrganizationOptions(),
    cookies(),
    searchParams ?? Promise.resolve<{ stay?: string | string[] }>({}),
  ]);

  if (!userId) redirect("/login");

  const stayParam = resolvedSearchParams.stay;
  const shouldStay = Array.isArray(stayParam)
    ? stayParam.includes("1")
    : stayParam === "1";

  const hasActiveCookie = Boolean(cookieStore.get(ACTIVE_ORG_COOKIE)?.value);
  if (
    !shouldStay &&
    !hasActiveCookie &&
    totalActiveCount === 1 &&
    organizations.length === 1
  ) {
    redirect("/accesos/auto");
  }

  const data = await getMisAccesos();
  if (!data) redirect("/login");

  return <AccesosEmpresaView data={data} />;
}
