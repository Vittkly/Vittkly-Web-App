import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { VittklyLogo } from "@/components/brand/VittklyLogo";
import { logoutAction } from "@/features/auth/actions/auth.actions";
import { OrganizationPicker } from "@/features/tenants/components/OrganizationPicker";
import { getOrganizationOptions } from "@/features/tenants/services/tenants.service";

async function OrganizationSelection() {
  const { userId, organizations, lastOrganizationId } =
    await getOrganizationOptions();

  if (!userId) redirect("/login");
  if (organizations.length === 1) redirect("/select-org/auto");

  if (organizations.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-ink-muted text-sm">
          Tu cuenta no tiene empresas activas con acceso a la Central Web.
          Contacta a tu administrador.
        </p>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-primary cursor-pointer text-sm font-semibold hover:underline"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    );
  }

  return (
    <OrganizationPicker
      organizations={organizations}
      lastOrganizationId={lastOrganizationId}
    />
  );
}

export default function SelectOrganizationPage() {
  return (
    <main className="bg-surface flex min-h-dvh flex-col items-center justify-center gap-8 p-4">
      <VittklyLogo variant="wordmark" height={32} priority />
      <section className="bg-surface-raised border-line w-full max-w-md rounded-2xl border p-6 sm:p-8">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-ink text-2xl font-bold tracking-tight">
            Elige una empresa
          </h1>
          <p className="text-ink-muted text-sm">
            Selecciona con cuál vas a trabajar hoy.
          </p>
        </div>
        <Suspense
          fallback={
            <div className="bg-surface-sunken h-24 animate-pulse rounded-xl" />
          }
        >
          <OrganizationSelection />
        </Suspense>
      </section>
    </main>
  );
}
