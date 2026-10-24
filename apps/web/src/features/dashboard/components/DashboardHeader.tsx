'use client';

import React from 'react';
import Link from 'next/link';
import { LogOut, Building } from 'lucide-react';
import { VittklyLogo } from '@/components/brand/VittklyLogo';
import { Badge } from '@/components/ui/Badge';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { logoutAction } from '@/features/auth/actions/auth.actions';
import type { DashboardContextResult } from '../services/modules.service';

export interface DashboardHeaderProps {
  context: DashboardContextResult;
}

export function DashboardHeader({ context }: DashboardHeaderProps) {
  const { user, activeOrganization, activePlan, activeProfile } = context;

  return (
    <header className="border-line bg-surface-raised sticky top-0 z-30 border-b shadow-xs transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Lado izquierdo: Logotipo + Organización + Plan */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <VittklyLogo variant="wordmark" height={32} priority />
          </Link>

          <div className="bg-line hidden h-6 w-px sm:block" />

          {/* Información de la Organización y Plan */}
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
              <Building className="text-soft h-3.5 w-3.5" />
              <span>{activeOrganization.nombreComercial || activeOrganization.razonSocial}</span>
            </div>

            <Badge variant="plan" size="sm" mono>
              Plan {activePlan.nombre}
            </Badge>

            {activePlan.estadoSuscripcion === 'prueba' && (
              <Badge variant="warning" size="sm">
                15 días de prueba
              </Badge>
            )}
          </div>
        </div>

        {/* Lado derecho: Área/Perfil + Usuario + Tema + Logout */}
        <div className="flex items-center gap-3">
          {/* Insignia del Área / Perfil activo */}
          <div className="hidden items-center gap-1.5 md:flex">
            <span className="text-soft text-xs">Área:</span>
            <Badge variant="role" size="sm">
              {activeProfile.nombre}
              {activeProfile.isSimulated && ' (Simulado)'}
            </Badge>
          </div>

          <div className="bg-line hidden h-5 w-px md:block" />

          {/* Datos del Usuario */}
          <div className="flex items-center gap-2">
            <div className="bg-primary-soft text-primary-ink flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold">
              {user.nombre.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden flex-col text-left lg:flex">
              <span className="text-xs font-bold text-ink leading-tight">{user.nombre}</span>
              <span className="text-soft text-[11px] leading-tight font-mono">{user.correo}</span>
            </div>
          </div>

          {/* Conmutador de Modo Oscuro / Claro */}
          <ThemeToggle />

          {/* Botón de Cerrar Sesión */}
          <form action={logoutAction}>
            <button
              type="submit"
              title="Cerrar sesión"
              className="text-soft hover:text-danger-ink hover:bg-danger-soft/60 flex h-9 w-9 items-center justify-center rounded-md border border-transparent transition-colors focus-visible:outline-2 focus-visible:outline-danger"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
