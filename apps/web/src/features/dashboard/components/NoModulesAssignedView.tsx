import React from "react";
import Link from "next/link";
import { Building2, LockKeyhole, LogOut } from "lucide-react";
import { VittklyLogo } from "@/components/brand/VittklyLogo";
import { logoutAction } from "@/features/auth/actions/auth.actions";

export interface NoModulesAssignedViewProps {
  companyName: string;
  userName: string;
  profileName: string;
}

export function NoModulesAssignedView({
  companyName,
  userName,
  profileName,
}: NoModulesAssignedViewProps) {
  return (
    <div className="bg-surface flex min-h-dvh flex-col items-center justify-center p-6 transition-colors">
      <div className="border-line bg-surface-raised flex w-full max-w-md flex-col items-center gap-5 rounded-2xl border p-8 text-center shadow-lg">
        <VittklyLogo variant="wordmark" height={28} />

        <div className="bg-warning-soft border-warning/30 text-warning-ink flex h-12 w-12 items-center justify-center rounded-2xl border">
          <LockKeyhole className="h-6 w-6" strokeWidth={1.75} />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-ink-muted text-[11px] font-bold tracking-wider uppercase">
            {companyName} · Perfil: {profileName}
          </span>
          <h1 className="text-ink font-sans text-lg font-bold tracking-tight">
            Sin módulos asignados, {userName}
          </h1>
          <p className="text-ink-muted text-xs leading-relaxed">
            Tu perfil actual no tiene ningún módulo asignado. Contacta al
            administrador de tu empresa para solicitar acceso.
          </p>
        </div>

        <div className="border-line flex w-full flex-col gap-2.5 border-t pt-4 sm:flex-row">
          <Link
            href="/accesos"
            className="border-line bg-surface-sunken hover:bg-surface text-ink inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-bold transition-colors"
          >
            <Building2 className="h-4 w-4 shrink-0" />
            <span>Cambiar de empresa</span>
          </Link>

          <form action={logoutAction} className="flex-1">
            <button
              type="submit"
              className="bg-primary text-on-primary hover:bg-primary-hover inline-flex min-h-[40px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-xs transition-colors"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Cerrar sesión</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default NoModulesAssignedView;
