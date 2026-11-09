"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  HelpCircle,
  Settings,
  ShieldCheck,
  X,
  ExternalLink,
} from "lucide-react";

export interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  userName?: string;
  userRole?: string;
  moduleCode?: string;
}

export function DashboardHeader({
  title = "Inicio",
  subtitle = "Resumen del negocio: ventas, servicios, distritos y cobros",
  userName = "Andree",
  userRole = "Administrador",
}: DashboardHeaderProps) {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAvisosPop, setShowAvisosPop] = useState(false);

  // Determinar saludo según la hora del día
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  const firstName = userName.trim().split(" ")[0] || userName;

  // Fecha localizada: "Viernes, 6 de noviembre"
  const weekday = new Intl.DateTimeFormat("es-PE", { weekday: "long" }).format(
    now,
  );
  const day = now.getDate();
  const month = new Intl.DateTimeFormat("es-PE", { month: "long" }).format(now);
  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  const dateFormatted = `${capitalizedWeekday}, ${day} de ${month.toLowerCase()}`;

  return (
    <header className="page-head border-line bg-surface-raised/80 flex flex-wrap items-end justify-between gap-4 border-b px-6 py-4 backdrop-blur-md transition-colors">
      {/* Lado Izquierdo: Título y Subtítulo Limpios (Sin badges de depuración ni códigos) */}
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-ink font-sans text-2xl font-bold tracking-tight">
          {title}
        </h1>
        <p className="text-ink-muted max-w-xl truncate text-xs sm:text-sm">
          {subtitle}
        </p>
      </div>

      {/* Lado Derecho: Saludo, Fecha y Grupo de 4 Íconos Circulares Discretos */}
      <div className="ml-auto flex items-center gap-3">
        {/* Bloque de texto alineado a la derecha */}
        <div className="mr-1 hidden flex-col items-end leading-tight md:flex">
          <b className="text-ink text-xs font-bold">
            {greeting}, {firstName}
          </b>
          <span className="text-ink-muted text-[11px] font-semibold whitespace-nowrap">
            {dateFormatted}
          </span>
        </div>

        {/* Grupo de 4 íconos circulares discretos en border border-line bg-surface-raised */}
        <div className="flex items-center gap-2">
          {/* 1. Ícono de ayuda "?" */}
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="border-line bg-surface-raised text-ink hover:border-primary hover:bg-primary-soft hover:text-primary-ink relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border text-sm font-extrabold shadow-2xs transition-colors"
            title="Centro de ayuda"
            aria-label="Centro de ayuda"
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          {/* 2. Ícono de campana con contador/badge rojo "1" */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAvisosPop((prev) => !prev)}
              aria-expanded={showAvisosPop}
              className="border-line bg-surface-raised text-ink hover:border-primary hover:bg-primary-soft hover:text-primary-ink relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border shadow-2xs transition-colors"
              title="Avisos y notificaciones"
              aria-label="Avisos"
            >
              <Bell className="h-4 w-4" />
              <span className="bg-danger border-surface absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 px-1 text-[10px] font-extrabold text-white tabular-nums">
                1
              </span>
            </button>

            {/* Popover de Avisos */}
            {showAvisosPop && (
              <div className="border-line bg-surface-raised shadow-2 animate-sc-in absolute top-12 right-0 z-50 flex w-80 flex-col gap-3 rounded-2xl border p-4">
                <div className="border-line flex items-center justify-between border-b pb-2">
                  <b className="text-ink text-xs font-bold">
                    Avisos pendientes
                  </b>
                  <span className="bg-danger py-0.2 rounded-full px-1.5 font-mono text-[9px] font-bold text-white">
                    1 urgente
                  </span>
                </div>
                <div className="flex flex-col gap-2 text-xs">
                  <div className="border-l-danger bg-danger-soft/40 border-line rounded-xl border border-l-4 p-2.5">
                    <b className="text-ink block">Alerta en Tiempo</b>
                    <span className="text-ink-muted text-[11px]">
                      Manuel Arteaga · Mantenimiento Surco — 2h 45m
                      transcurridos
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAvisosPop(false)}
                  className="text-primary-ink cursor-pointer pt-1 text-center text-[11px] font-bold hover:underline"
                >
                  Cerrar avisos
                </button>
              </div>
            )}
          </div>

          {/* 3. Ícono de perfil / usuario (círculo con candado) */}
          <Link
            href="/perfil"
            className="border-line bg-surface-raised text-ink hover:border-primary hover:bg-primary-soft hover:text-primary-ink relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border shadow-2xs transition-colors"
            title={`Perfil: ${userRole}`}
            aria-label="Perfil de usuario"
          >
            <ShieldCheck className="h-4 w-4" />
          </Link>

          {/* 4. Ícono de engranaje (configuraciones) */}
          <Link
            href="/dashboard/configuraciones"
            className="border-line bg-surface-raised text-ink hover:border-primary hover:bg-primary-soft hover:text-primary-ink flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border shadow-2xs transition-colors"
            title="Configuraciones"
            aria-label="Configuraciones"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Modal Centro de Ayuda */}
      {showHelpModal && (
        <div className="animate-sc-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="bg-surface-raised border-line shadow-2 relative flex w-full max-w-md flex-col gap-4 rounded-2xl border p-6">
            <div className="border-line flex items-center justify-between border-b pb-3">
              <div className="text-primary-ink flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                <h3 className="text-ink text-base font-bold">
                  Centro de Ayuda Vittkly
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-ink-muted hover:text-ink hover:bg-surface-sunken cursor-pointer rounded-lg p-1"
                aria-label="Cerrar modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-ink-muted text-xs leading-relaxed">
              Consulta las guías de uso de tu perfil (<b>{userRole}</b>),
              aprende a configurar tarifarios y resuelve dudas operativas.
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/dashboard/academia"
                onClick={() => setShowHelpModal(false)}
                className="border-line bg-surface hover:bg-primary-soft hover:border-primary text-ink group flex items-center justify-between rounded-xl border p-3 text-xs font-semibold transition-colors"
              >
                <span>Manuales del perfil y Academy</span>
                <ExternalLink className="text-primary-ink h-3.5 w-3.5" />
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="bg-primary text-on-primary hover:bg-primary-hover mt-2 min-h-[36px] cursor-pointer rounded-xl text-xs font-bold transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default DashboardHeader;
