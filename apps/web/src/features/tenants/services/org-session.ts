import "server-only";
import { cookies } from "next/headers";
import { ACTIVE_ORG_COOKIE, LAST_ORG_COOKIE } from "../types/tenants.types";
import {
  getOrganizationOptions,
  persistLastOrganization,
} from "./tenants.service";

const baseCookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

/** Fija empresa activa y última empresa. El llamador debe haber validado la membresía. */
export async function setActiveOrganizationCookies(organizationId: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_ORG_COOKIE, organizationId, baseCookie);
  cookieStore.set(LAST_ORG_COOKIE, organizationId, {
    ...baseCookie,
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function clearActiveOrganizationCookie() {
  (await cookies()).delete(ACTIVE_ORG_COOKIE);
}

/**
 * Post-autenticación: con una sola empresa entra directo; con varias limpia la selección previa
 * y exige elegir (la última usada se destaca en `/select-org`).
 */
export async function initializeOrganizationContext(): Promise<
  "ready" | "select"
> {
  const { userId, organizations } = await getOrganizationOptions();
  const only = organizations.length === 1 ? organizations[0] : undefined;

  if (userId && only) {
    await setActiveOrganizationCookies(only.id);
    await persistLastOrganization(userId, only.id);
    return "ready";
  }

  await clearActiveOrganizationCookie();
  return "select";
}
