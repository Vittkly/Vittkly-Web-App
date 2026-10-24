'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { DashboardContextResult } from '../services/modules.service';

export interface ContextSelectorBarProps {
  context: DashboardContextResult;
}

export function ContextSelectorBar({ context }: ContextSelectorBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    activeOrganization,
    activeProfile,
    globalCapabilities,
    availableOrganizations,
    availableProfilesForPreview,
    enabledModules,
  } = context;

  const handleEmpresaChange = (newEmpresaId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('empresa', newEmpresaId);
    params.delete('perfil'); // reset profile preview on company change
    router.push(`/dashboard?${params.toString()}`);
  };

  const handlePerfilChange = (newPerfilCodigo: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPerfilCodigo === 'default') {
      params.delete('perfil');
    } else {
      params.set('perfil', newPerfilCodigo);
    }
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <div className="border-line bg-surface-sunken/60 flex flex-col gap-4 rounded-xl border p-4 sm:p-5">
      {/* Fila Superior: Selectores de Organización y Área */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Selector de Organización */}
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
          <label
            htmlFor="org-select"
            className="text-soft flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase select-none"
          >
            <Building2 className="text-primary h-4 w-4" />
            <span>Organización:</span>
          </label>

          {availableOrganizations.length > 1 ? (
            <select
              id="org-select"
              value={activeOrganization.id}
              onChange={(e) => handleEmpresaChange(e.target.value)}
              className="border-line text-ink bg-surface-raised focus-visible:outline-accent h-9 rounded-md border px-3 text-xs font-semibold shadow-xs"
            >
              {availableOrganizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.nombre} ({org.rol})
                </option>
              ))}
            </select>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-bold text-ink text-sm">
                {activeOrganization.nombreComercial || activeOrganization.razonSocial}
              </span>
              {activeOrganization.ruc && (
                <span className="text-soft font-mono text-xs">RUC: {activeOrganization.ruc}</span>
              )}
            </div>
          )}
        </div>

        {/* Selector / Simulador de Área y Perfil (seed.sql) */}
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
          <label
            htmlFor="profile-select"
            className="text-soft flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase select-none"
          >
            <ShieldCheck className="text-primary h-4 w-4" />
            <span>Área / Perfil Activo:</span>
          </label>

          <select
            id="profile-select"
            value={activeProfile.isSimulated ? activeProfile.codigo : 'default'}
            onChange={(e) => handlePerfilChange(e.target.value)}
            className="border-line text-ink bg-surface-raised focus-visible:outline-accent h-9 rounded-md border px-3 text-xs font-semibold shadow-xs"
          >
            <option value="default">
              {activeProfile.isSimulated
                ? 'Perfil Asignado por Defecto'
                : `${activeProfile.nombre} (Asignado)`}
            </option>
            {availableProfilesForPreview.map((p) => (
              <option key={p.codigo} value={p.codigo}>
                Simular Área: {p.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fila Intermedia: Explicación del Perfil y Permisos Globales */}
      <div className="border-line/60 flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-ink">
              {activeProfile.nombre}
            </span>
            <Badge variant="primary" size="sm">
              {enabledModules.length} módulos habilitados
            </Badge>
            {activeProfile.isSimulated && (
              <Badge variant="warning" size="sm">
                Modo Simulación
              </Badge>
            )}
          </div>
          {activeProfile.descripcion && (
            <p className="text-soft text-xs italic">
              «{activeProfile.descripcion}»
            </p>
          )}
        </div>

        {/* Indicadores de Permisos Globales del Perfil */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-medium ${
              globalCapabilities.canViewPrices
                ? 'bg-success-soft text-success-ink border border-success/30'
                : 'bg-surface-sunken text-soft/70 border border-line'
            }`}
          >
            {globalCapabilities.canViewPrices ? (
              <Check className="h-3 w-3 text-success" />
            ) : (
              <AlertCircle className="h-3 w-3 text-soft/60" />
            )}
            Ve precios
          </span>

          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-medium ${
              globalCapabilities.canValidateServices
                ? 'bg-success-soft text-success-ink border border-success/30'
                : 'bg-surface-sunken text-soft/70 border border-line'
            }`}
          >
            {globalCapabilities.canValidateServices ? (
              <Check className="h-3 w-3 text-success" />
            ) : (
              <AlertCircle className="h-3 w-3 text-soft/60" />
            )}
            Valida servicios
          </span>

          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-medium ${
              globalCapabilities.canEditConfig
                ? 'bg-success-soft text-success-ink border border-success/30'
                : 'bg-surface-sunken text-soft/70 border border-line'
            }`}
          >
            {globalCapabilities.canEditConfig ? (
              <Check className="h-3 w-3 text-success" />
            ) : (
              <AlertCircle className="h-3 w-3 text-soft/60" />
            )}
            Configuración
          </span>
        </div>
      </div>
    </div>
  );
}

export default ContextSelectorBar;
