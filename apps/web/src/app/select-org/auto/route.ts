import { NextResponse, type NextRequest } from "next/server";
import {
  getOrganizationOptions,
  persistLastOrganization,
} from "@/features/tenants/services/tenants.service";
import { setActiveOrganizationCookies } from "@/features/tenants/services/org-session";

/** Entrada directa: solo actúa si el usuario pertenece a exactamente una empresa. */
export async function GET(request: NextRequest) {
  const { userId, organizations } = await getOrganizationOptions();
  const only = organizations.length === 1 ? organizations[0] : undefined;

  if (!userId) return NextResponse.redirect(new URL("/login", request.url));
  if (!only) return NextResponse.redirect(new URL("/select-org", request.url));

  await setActiveOrganizationCookies(only.id);
  await persistLastOrganization(userId, only.id);
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
