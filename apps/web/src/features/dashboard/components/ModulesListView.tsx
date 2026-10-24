'use client';

import React, { useState } from 'react';
import {
  Search,
  Lock,
  Layers,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Construction,
  ShieldAlert,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { DashboardContextResult, EnrichedModule } from '../services/modules.service';

export interface ModulesListViewProps {
  context: DashboardContextResult;
}

const GROUP_LABELS: Record<string, { label: string; iconClass: string }> = {
  configuracion: { label: 'Configuración y Empresa', iconClass: 'text-primary' },
  ventas: { label: 'Ventas y CRM', iconClass: 'text-vitta' },
  operacion: { label: 'Operaciones de Campo', iconClass: 'text-kleanly' },
  equipo: { label: 'Equipo y Capacitación', iconClass: 'text-warning' },
  finanzas: { label: 'Finanzas y Tesorería', iconClass: 'text-success' },
  reportes: { label: 'Reportes y Analítica', iconClass: 'text-primary-ink' },
  plataforma: { label: 'Plataforma y Soporte', iconClass: 'text-soft' },
  crecimiento: { label: 'Crecimiento y Marketing', iconClass: 'text-accent' },
  sin_grupo: { label: 'General', iconClass: 'text-soft' },
};

export function ModulesListView({ context }: ModulesListViewProps) {
  const { enabledModules, planLockedModules, roleRestrictedModules, activePlan, activeProfile } =
    context;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('todos');
  const [showRestrictedSection, setShowRestrictedSection] = useState(false);

  // Filtrado reactivo por texto y grupo
  const filteredModules = enabledModules.filter((m) => {
    const matchesSearch =
      m.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.codigo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = selectedGroup === 'todos' || m.grupo === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  // Agrupar los módulos habilitados por área funcional
  const groupedModules = filteredModules.reduce<Record<string, EnrichedModule[]>>((acc, mod) => {
    const groupKey = mod.grupo || 'sin_grupo';
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(mod);
    return acc;
  }, {});

  const availableGroups = Array.from(new Set(enabledModules.map((m) => m.grupo)));

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="text-soft absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar módulo por nombre o código..."
            className="border-line text-ink bg-surface-raised focus-visible:outline-accent h-10 w-full rounded-md border pl-9 pr-3 text-xs transition-colors focus-visible:outline-2"
          />
        </div>

        {/* Selector de Grupo */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="text-soft h-3.5 w-3.5" />
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="border-line text-ink bg-surface-raised focus-visible:outline-accent h-10 rounded-md border px-3 text-xs font-semibold shadow-xs"
          >
            <option value="todos">Todas las áreas ({enabledModules.length})</option>
            {availableGroups.map((g) => (
              <option key={g} value={g}>
                {GROUP_LABELS[g]?.label || g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista Estructurada de Módulos Habilitados */}
      {filteredModules.length === 0 ? (
        <div className="border-line bg-surface-raised flex flex-col items-center justify-center rounded-xl border p-12 text-center">
          <Layers className="text-soft mb-2 h-8 w-8" />
          <h3 className="font-bold text-ink text-sm">No se encontraron módulos</h3>
          <p className="text-soft text-xs">
            Intenta con otro término de búsqueda o selecciona otra área funcional.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {Object.entries(groupedModules).map(([groupKey, modules]) => {
            const groupInfo = GROUP_LABELS[groupKey] || { label: groupKey, iconClass: 'text-primary' };

            return (
              <div
                key={groupKey}
                className="border-line bg-surface-raised overflow-hidden rounded-xl border shadow-xs"
              >
                {/* Cabecera del Grupo */}
                <div className="border-line bg-surface-sunken/40 flex items-center justify-between border-b px-4 py-2.5 sm:px-5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink text-xs uppercase tracking-wide">
                      {groupInfo.label}
                    </span>
                    <span className="text-soft font-mono text-[11px]">({modules.length})</span>
                  </div>
                  <Badge variant="outline" size="sm">
                    Área Operativa
                  </Badge>
                </div>

                {/* Filas de la Lista de Módulos */}
                <div className="divide-line divide-y">
                  {modules.map((mod) => (
                    <div
                      key={mod.codigo}
                      className="hover:bg-surface-sunken/30 flex flex-col gap-3 p-4 transition-colors sm:flex-row sm:items-center sm:justify-between sm:px-5"
                    >
                      {/* Información Principal del Módulo */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-ink text-sm leading-snug">
                            {mod.nombre}
                          </span>
                          <span className="text-soft font-mono text-xs">
                            `{mod.codigo}`
                          </span>
                        </div>

                        {/* Etiquetas descriptivas de modelo y etapa */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-soft">
                          <span>
                            Modelo:{' '}
                            <strong className="text-ink font-semibold capitalize">
                              {mod.modelo === 'comun'
                                ? 'Común'
                                : mod.modelo === 'visita'
                                  ? 'Por Visita'
                                  : mod.modelo === 'contrato'
                                    ? 'Por Contrato'
                                    : mod.modelo === 'publico'
                                      ? 'Sector Público'
                                      : 'Crecimiento'}
                            </strong>
                          </span>
                          <span>&bull;</span>
                          <span>
                            Etapa de desarrollo:{' '}
                            <strong className="text-ink font-semibold">Etapa {mod.etapa}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Nivel de Permiso y Estado de Construcción */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Insignia del Nivel de Permiso del Usuario en este Módulo */}
                        <Badge
                          variant={
                            mod.permissionSummary.includes('Total')
                              ? 'primary'
                              : mod.permissionSummary.includes('Edición')
                                ? 'success'
                                : 'neutral'
                          }
                          size="sm"
                        >
                          {mod.permissionSummary}
                        </Badge>

                        {/* Insignias de Permisos Específicos */}
                        {mod.permissions.length > 1 && (
                          <div className="hidden sm:flex items-center gap-1">
                            {mod.permissions.slice(1).map((p) => (
                              <Badge key={p.code} variant="outline" size="sm" mono>
                                {p.code.split('.')[1]}
                                {p.scope ? ` (${p.scope})` : ''}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Estado de Construcción */}
                        <div className="inline-flex items-center gap-1 rounded-full bg-warning-soft/70 border border-warning/30 px-2.5 py-0.5 text-[11px] font-bold text-warning-ink">
                          <Construction className="h-3 w-3 shrink-0" />
                          <span>Próximamente</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sección Informativa: Módulos no disponibles por Plan o Restringidos por Rol */}
      <div className="border-line/70 bg-surface-sunken/40 rounded-xl border p-4 text-xs transition-colors">
        <button
          type="button"
          onClick={() => setShowRestrictedSection(!showRestrictedSection)}
          className="text-soft hover:text-ink flex w-full items-center justify-between font-bold select-none"
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-primary h-4 w-4" />
            <span>
              Auditoría del Filtrado Triple: Módulos fuera del Plan o Restringidos para {activeProfile.nombre}
            </span>
          </div>
          {showRestrictedSection ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {showRestrictedSection && (
          <div className="mt-4 flex flex-col gap-4 border-t border-line/60 pt-4">
            {/* Bloqueados por el Plan */}
            <div className="flex flex-col gap-1.5">
              <span className="font-bold text-ink">
                No incluidos en tu suscripción actual ({activePlan.nombre}):
              </span>
              {planLockedModules.length === 0 ? (
                <p className="text-soft italic">
                  Tu plan tiene acceso a todos los módulos comunes del catálogo.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {planLockedModules.map((m) => (
                    <div
                      key={m.codigo}
                      className="border-line bg-surface-raised flex items-center justify-between rounded-lg border p-2 text-xs"
                    >
                      <div className="flex items-center gap-1.5">
                        <Lock className="text-soft h-3 w-3" />
                        <span className="font-semibold text-ink">{m.nombre}</span>
                      </div>
                      <Badge variant="outline" size="sm">
                        {m.requiredPlan}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Restringidos para el Área/Perfil actual */}
            <div className="flex flex-col gap-1.5">
              <span className="font-bold text-ink">
                Incluidos en el plan pero restringidos para el perfil {activeProfile.nombre}:
              </span>
              {roleRestrictedModules.length === 0 ? (
                <p className="text-soft italic">
                  El perfil actual tiene permiso de lectura en todos los módulos incluidos en el plan.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {roleRestrictedModules.map((m) => (
                    <div
                      key={m.codigo}
                      className="border-line bg-surface-raised flex items-center justify-between rounded-lg border p-2 text-xs"
                    >
                      <span className="font-semibold text-ink">{m.nombre}</span>
                      <span className="text-soft font-mono text-[10px]">Sin permiso .ver</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ModulesListView;
