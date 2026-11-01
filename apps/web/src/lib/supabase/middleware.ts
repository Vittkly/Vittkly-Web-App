import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";
import { ACTIVE_ORG_COOKIE } from "@/features/tenants/types/tenants.types";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT: Do not run between createServerClient and supabase.auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const startsWithAny = (prefixes: string[]) =>
    prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  const isStaffDashboardRoute = startsWithAny([
    "/internal/dashboard",
    "/staff/dashboard",
  ]);
  const isWorkspaceRoute = startsWithAny([
    "/hoy",
    "/agenda",
    "/perfil",
    "/dashboard",
  ]);
  const isTenantProtectedRoute =
    isWorkspaceRoute || startsWithAny(["/select-org"]);

  if (!user && isStaffDashboardRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/internal/login";
    return NextResponse.redirect(loginUrl);
  }

  if (!user && isTenantProtectedRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // Sin empresa activa seleccionada: elegir primero (la pertenencia real se valida en el layout).
  if (
    user &&
    isWorkspaceRoute &&
    !request.cookies.get(ACTIVE_ORG_COOKIE)?.value
  ) {
    const selectUrl = request.nextUrl.clone();
    selectUrl.pathname = "/select-org";
    selectUrl.search = "";
    const redirectResponse = NextResponse.redirect(selectUrl);
    supabaseResponse.cookies
      .getAll()
      .forEach((c) => redirectResponse.cookies.set(c));
    return redirectResponse;
  }

  return supabaseResponse;
}
