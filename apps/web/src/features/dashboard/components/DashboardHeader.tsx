"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  HelpCircle,
  Lightbulb,
  Settings,
  Plus,
  LogOut,
  X,
  ExternalLink,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { logoutAction } from "@/features/auth/actions/auth.actions";

export interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  userName?: string;
  userRole?: string;
  moduleCode?: string;
  notificationCount?: number;
}

export function DashboardHeader({
  title = "Inicio",
  subtitle = "Resumen del negocio: ventas, servicios, distritos y cobros",
  userName = "Usuario",
  userRole = "Administrador",
  moduleCode,
  notificationCount = 0,
}: DashboardHeaderProps) {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAvisosPop, setShowAvisosPop] = useState(false);

  // Formato de fecha localizado en español (ej. "Viernes, 30 de octubre")
  const todayFormatted = new Intl.DateTimeFormat("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const capitalizedDate =
    todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

  return (
    <header className="page-head border-line bg-surface-raised/80 flex flex-wrap items-end justify-between gap-4 border-b px-6 py-4 backdrop-blur-md transition-colors">
      {/* Título y Subtítulo del Lienzo */}
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-ink font-sans text-2xl font-extrabold tracking-tight">
            {title}
          </h1>
          {moduleCode && (
            <span className="border-line bg-surface-sunken text-ink-muted rounded-md border px-2 py-0.5 font-mono text-xs tabular-nums select-none">
              {moduleCode}
            </span>
          )}
        </div>
        <p className="text-ink-muted max-w-xl truncate text-xs sm:text-sm">
          {subtitle}
        </p>
      </div>

      {/* Meta e Indicadores de Acción (pm-meta) */}
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {/* Saludo y Fecha */}
        <div className="mr-1 hidden flex-col items-end leading-tight md:flex">
          <b className="text-ink text-xs font-bold">Hola, {userName}</b>
          <span className="text-ink-muted text-[11px] font-semibold whitespace-nowrap">
            {capitalizedDate}
          </span>
        </div>

        {/* Botón Ayuda */}
        <button
          type="button"
          onClick={() => setShowHelpModal(true)}
          className="border-line bg-surface text-ink hover:border-primary hover:bg-primary-soft hover:text-primary-ink relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border transition-colors"
          title="Centro de ayuda"
          aria-label="Centro de ayuda"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        {/* Botón Avisos / Campana con Badge */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAvisosPop((prev) => !prev)}
            aria-expanded={showAvisosPop}
            className="border-line bg-surface text-ink hover:border-primary hover:bg-primary-soft hover:text-primary-ink relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border transition-colors"
            title="Avisos y notificaciones"
            aria-label="Avisos"
          >
            <Bell className="h-4 w-4" />
            {notificationCount > 0 && (
              <span className="bg-danger border-surface absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 px-1 text-[10px] font-extrabold text-white tabular-nums">
                {notificationCount}
              </span>
            )}
          </button>

          {/* Popover de Avisos */}
          {showAvisosPop && (
            <div className="border-line bg-surface-raised shadow-2 animate-sc-in absolute top-12 right-0 z-50 flex w-80 flex-col gap-3 rounded-2xl border p-4">
              <div className="border-line flex items-center justify-between border-b pb-2">
                <b className="text-ink text-xs font-bold">Avisos</b>
              </div>
              <p className="text-ink-muted py-2 text-center text-xs">
                No tienes avisos pendientes.
              </p>
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

        {/* Botón Comunidad */}
        <Link
          href="/dashboard/comunidad"
          className="border-line bg-surface text-ink hover:border-primary hover:bg-primary-soft hover:text-primary-ink flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border transition-colors"
          title="Comunidad: ideas y mejoras"
          aria-label="Comunidad"
        >
          <Lightbulb className="h-4 w-4" />
        </Link>

        {/* Botón Configuraciones */}
        <Link
          href="/dashboard/configuraciones"
          className="border-line bg-surface text-ink hover:border-primary hover:bg-primary-soft hover:text-primary-ink flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border transition-colors"
          title="Configuraciones"
          aria-label="Configuraciones"
        >
          <Settings className="h-4 w-4" />
        </Link>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Botón Principal + Nueva cotización */}
        <Link
          href="/dashboard/nueva"
          className="bg-primary text-on-primary hover:bg-primary-hover hidden h-9 items-center gap-1.5 rounded-xl px-3.5 text-xs font-bold shadow-xs transition-colors sm:inline-flex"
          id="pmNueva"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>Nueva cotización</span>
        </Link>

        {/* Salir */}
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-ink-muted hover:text-danger-ink hover:bg-danger-soft/60 flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-transparent transition-colors"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </form>
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
