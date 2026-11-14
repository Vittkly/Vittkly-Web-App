import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getMisAccesos,
  getOrganizationOptions,
} from "@/features/tenants/services/tenants.service";
import { ACTIVE_ORG_COOKIE } from "@/features/tenants/types/tenants.types";
import { AccesosEmpresaView } from "@/features/tenants/components/AccesosEmpresaView";

export const dynamic = "force-dynamic";

export default async function AccesosPage() {
  const [{ userId, organizations, totalActiveCount }, cookieStore] =
    await Promise.all([getOrganizationOptions(), cookies()]);

  if (!userId) redirect("/login");

  const hasActiveCookie = Boolean(cookieStore.get(ACTIVE_ORG_COOKIE)?.value);
  if (
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
