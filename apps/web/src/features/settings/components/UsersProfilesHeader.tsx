"use client";

import React from "react";
import { Users } from "lucide-react";

export interface UsersProfilesHeaderProps {
  companyName: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const USERS_PROFILES_TABS = [
  { id: "personas", label: "Personas", active: true },
  { id: "perfiles", label: "Perfiles y permisos", active: false },
  { id: "equipos", label: "Equipos", active: false },
  { id: "aprobaciones", label: "Aprobaciones", active: false },
  { id: "actividad", label: "Actividad", active: false },
  { id: "cuentas-prueba", label: "Cuentas de prueba", active: false },
];

export function UsersProfilesHeader({
  companyName,
  activeTab,
  onTabChange,
}: UsersProfilesHeaderProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* Tarjeta de Presentación Principal */}
      <div className="border-line bg-surface-raised flex flex-col gap-4 rounded-2xl border p-5 shadow-xs sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="bg-primary-soft text-primary-ink border-primary/20 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border">
            <Users className="h-6 w-6" />
          </div>

          <div className="flex flex-col gap-1">
            <h1 className="text-ink font-sans text-xl font-extrabold tracking-tight sm:text-2xl">
              Usuarios y perfiles
            </h1>
            <p className="text-ink-muted max-w-3xl text-xs leading-relaxed sm:text-sm">
              Tú, como administrador, decides quién entra a{" "}
              <b className="text-ink font-bold">{companyName}</b>, qué módulos
              ve y qué puede hacer. Usa los perfiles estándar o crea los tuyos.
            </p>
          </div>
        </div>

        {/* Barra de pestañas secundarias tipo píldora */}
        <div className="border-line border-t pt-4">
          <div className="flex flex-wrap items-center gap-1.5" role="tablist">
            {USERS_PROFILES_TABS.map((tab) => {
              const isSelected = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => onTabChange(tab.id)}
                  className={`rounded-pill cursor-pointer px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-primary text-on-primary font-bold shadow-xs"
                      : "bg-surface-sunken text-ink-muted hover:text-ink hover:bg-surface-raised border-line border"
                  }`}
                >
                  <span>{tab.label}</span>
                  {!tab.active && !isSelected && (
                    <span className="text-ink-muted/70 ml-1.5 text-[10px] font-normal">
                      · Próx.
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
