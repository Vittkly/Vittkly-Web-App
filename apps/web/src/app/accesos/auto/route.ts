import { NextResponse, type NextRequest } from "next/server";
import { getOrganizationOptions } from "@/features/tenants/services/tenants.service";
import { initializeOrganizationContext } from "@/features/tenants/services/org-session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { userId } = await getOrganizationOptions();
  if (!userId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const status = await initializeOrganizationContext();
  const target = status === "ready" ? "/dashboard" : "/accesos";
  return NextResponse.redirect(new URL(target, request.url));
}
