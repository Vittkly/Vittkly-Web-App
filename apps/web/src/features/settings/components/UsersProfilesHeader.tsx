"use client";

import React from "react";
import { Users, User } from "lucide-react";

export interface UsersProfilesHeaderProps {
  companyName?: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const USERS_PROFILES_TABS = [
  { id: "personas", label: "Personas", hasIcon: true },
  { id: "perfiles", label: "Perfiles y permisos" },
  { id: "equipos", label: "Equipos" },
  { id: "aprobaciones", label: "Aprobaciones" },
  { id: "actividad", label: "Actividad" },
  { id: "cuentas-prueba", label: "Cuentas de prueba" },
];

export function UsersProfilesHeader({
  companyName = "Vitta Kleanly",
  activeTab,
  onTabChange,
}: UsersProfilesHeaderProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* 1. Banner superior del módulo */}
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

        {/* Pestañas secundarias tipo píldora (Personas activa con ícono) */}
        <div className="border-line border-t pt-4">
          <div
            role="tablist"
            aria-label="Pestañas de usuarios y perfiles"
            className="flex flex-wrap items-center gap-1.5"
          >
            {USERS_PROFILES_TABS.map((tab) => {
              const isSelected = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => onTabChange(tab.id)}
                  className={`rounded-pill inline-flex cursor-pointer items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-primary font-bold text-white shadow-xs"
                      : "bg-surface-sunken text-ink-muted hover:text-ink hover:bg-surface-raised border-line border"
                  }`}
                >
                  {tab.hasIcon && (
                    <User
                      className={`h-3.5 w-3.5 ${isSelected ? "text-white" : "text-ink-muted"}`}
                    />
                  )}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
