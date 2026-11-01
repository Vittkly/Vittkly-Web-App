"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { organizationIdSchema } from "@vittkly/shared";
import {
  getOrganizationOptions,
  persistLastOrganization,
} from "../services/tenants.service";
import { setActiveOrganizationCookies } from "../services/org-session";

/** Cambia la empresa activa (selector inicial y menú lateral). Valida pertenencia en servidor. */
export async function selectOrganizationAction(
  formData: FormData,
): Promise<void> {
  const parsed = organizationIdSchema.safeParse(formData.get("organizationId"));
  if (!parsed.success) redirect("/select-org");

  const { userId, organizations } = await getOrganizationOptions();
  if (!userId) redirect("/login");
  if (!organizations.some((o) => o.id === parsed.data)) redirect("/select-org");

  await setActiveOrganizationCookies(parsed.data);
  await persistLastOrganization(userId, parsed.data);

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
