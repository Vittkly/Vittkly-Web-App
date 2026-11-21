"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import {
  Bell,
  HelpCircle,
  Settings,
  ShieldCheck,
  X,
  ExternalLink,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const emptySubscribe = () => () => {};

export interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  userName?: string;
  userRole?: string;
  moduleCode?: string;
  notificationCount?: number;
  canAccessConfig?: boolean;
  canAccessAcademy?: boolean;
}

export function DashboardHeader({
  title = "Inicio",
  subtitle = "Resumen del negocio: ventas, servicios, distritos y cobros",
  userName = "Andree",
  userRole = "Administrador",
  notificationCount = 0,
  canAccessConfig = true,
  canAccessAcademy = true,
}: DashboardHeaderProps) {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAvisosPop, setShowAvisosPop] = useState(false);
  const avisosRef = useRef<HTMLDivElement>(null);
  const bellButtonRef = useRef<HTMLButtonElement>(null);
  const helpButtonRef = useRef<HTMLButtonElement>(null);

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const safeCount = Math.max(
    0,
    Math.floor(Number.isFinite(notificationCount) ? notificationCount : 0),
  );

  useEffect(() => {
    if (!showAvisosPop && !showHelpModal) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (
        showAvisosPop &&
        avisosRef.current &&
        !avisosRef.current.contains(e.target as Node)
      ) {
        setShowAvisosPop(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (showHelpModal) {
        setShowHelpModal(false);
        helpButtonRef.current?.focus();
        return;
      }
      if (showAvisosPop) {
        setShowAvisosPop(false);
        bellButtonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showAvisosPop, showHelpModal]);

  const firstName = userName.trim().split(" ")[0] || userName;

  let greetingText = "\u00A0";
  let dateFormatted = "\u00A0";

  if (mounted) {
    const now = new Date();
    const hour = now.getHours();
    const greeting =
      hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";
    greetingText = `${greeting}, ${firstName}`;

    const weekday = new Intl.DateTimeFormat("es-PE", {
      weekday: "long",
    }).format(now);
    const day = now.getDate();
    const month = new Intl.DateTimeFormat("es-PE", { month: "long" }).format(
      now,
    );
    const capitalizedWeekday =
      weekday.charAt(0).toUpperCase() + weekday.slice(1);
    dateFormatted = `${capitalizedWeekday}, ${day} de ${month.toLowerCase()}`;
  }

  return (
    <>
      <header className="page-head border-line bg-surface-raised flex flex-wrap items-end justify-between gap-4 border-b px-6 py-4 transition-colors">
        {/* Lado Izquierdo: Título y Subtítulo Limpios (Sin badges de depuración ni códigos) */}
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-ink font-sans text-2xl font-bold tracking-tight">
            {title}
          </h1>
          <p className="text-ink-muted max-w-xl text-xs leading-relaxed sm:text-sm">
            {subtitle}
          </p>
        </div>

        {/* Lado Derecho: Saludo, Fecha y Grupo de Íconos Circulares Discretos */}
        <div className="ml-auto flex items-center gap-3">
          {/* Bloque de texto alineado a la derecha */}
          <div className="mr-1 hidden flex-col items-end leading-tight md:flex">
            <b className="text-ink text-xs font-bold">{greetingText}</b>
            <span className="text-ink-muted text-[11px] font-semibold whitespace-nowrap">
              {dateFormatted}
            </span>
          </div>

          {/* Grupo de íconos circulares discretos en border border-line bg-surface-raised */}
          <div className="flex items-center gap-2">
            {/* 1. Ícono de ayuda "?" */}
            <button
              ref={helpButtonRef}
              type="button"
              onClick={() => {
                setShowAvisosPop(false);
                setShowHelpModal(true);
              }}
              className="border-line bg-surface-raised text-ink hover:border-primary hover:bg-primary-soft hover:text-primary-ink relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border text-sm font-extrabold shadow-2xs transition-colors"
              title="Centro de ayuda"
              aria-label="Centro de ayuda"
            >
              <HelpCircle className="h-4 w-4" />
            </button>

            {/* 2. Ícono de campana con contador real */}
            <div ref={avisosRef} className="relative">
              <button
                ref={bellButtonRef}
                type="button"
                onClick={() => setShowAvisosPop((prev) => !prev)}
                aria-expanded={showAvisosPop}
                className="border-line bg-surface-raised text-ink hover:border-primary hover:bg-primary-soft hover:text-primary-ink relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border shadow-2xs transition-colors"
                title="Avisos y notificaciones"
                aria-label={
                  safeCount > 0 ? `Avisos: ${safeCount} por atender` : "Avisos"
                }
              >
                <Bell className="h-4 w-4" />
                {safeCount > 0 && (
                  <span className="bg-danger border-surface text-on-danger absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 px-1 text-[10px] font-extrabold tabular-nums">
                    {safeCount > 99 ? "99+" : String(safeCount)}
                  </span>
                )}
              </button>

              {/* Popover de Avisos */}
              {showAvisosPop && (
                <div
                  role="dialog"
                  aria-label="Avisos"
                  className="border-line bg-surface-raised shadow-2 animate-sc-in fixed inset-x-3 top-16 z-50 flex max-w-[calc(100vw-24px)] flex-col gap-3 rounded-2xl border p-4 sm:absolute sm:inset-x-auto sm:top-12 sm:right-0 sm:w-80"
                >
                  <div className="border-line flex items-center justify-between gap-2 border-b pb-2">
                    <div className="flex flex-col">
                      <b className="text-ink text-xs font-bold">Avisos</b>
                      <span className="text-ink-muted text-[11px]">
                        {safeCount > 0
                          ? `${safeCount} por atender`
                          : "Todo en orden"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAvisosPop(false)}
                      className="text-ink-muted hover:text-ink hover:bg-surface-sunken cursor-pointer rounded-lg p-1"
                      aria-label="Cerrar avisos"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {safeCount === 0 ? (
                    <div className="bg-surface-sunken/60 border-line rounded-xl border p-3 text-center">
                      <b className="text-ink block text-xs font-bold">
                        No tienes avisos pendientes
                      </b>
                      <p className="text-ink-muted mt-1 text-[11px] leading-relaxed">
                        Cuando haya cobros vencidos, servicios sin programar,
                        seguimientos o reclamos, aparecerán aquí.
                      </p>
                    </div>
                  ) : (
                    <div className="border-l-primary bg-primary-soft/40 border-line rounded-xl border border-l-4 p-2.5 text-xs">
                      <b className="text-ink block">
                        Tienes {safeCount}{" "}
                        {safeCount === 1
                          ? "aviso por atender"
                          : "avisos por atender"}
                      </b>
                      <span className="text-ink-muted text-[11px]">
                        Revisa las alertas desde tu panel principal.
                      </span>
                    </div>
                  )}

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

            {/* 3. Ícono de perfil / accesos de usuario */}
            <Link
              href="/accesos"
              className="border-line bg-surface-raised text-ink hover:border-primary hover:bg-primary-soft hover:text-primary-ink relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border shadow-2xs transition-colors"
              title={`Perfil: ${userRole}`}
              aria-label="Accesos y perfil de usuario"
            >
              <ShieldCheck className="h-4 w-4" />
            </Link>

            {/* 4. Selector de tema claro / oscuro */}
            <ThemeToggle className="hover:border-primary! hover:bg-primary-soft! h-9! w-9! shadow-2xs" />

            {/* 5. Ícono de engranaje (configuraciones — solo dueño/admin en escritorio) */}
            {canAccessConfig && (
              <Link
                href="/dashboard/configuraciones"
                className="border-line bg-surface-raised text-ink hover:border-primary hover:bg-primary-soft hover:text-primary-ink hidden h-9 w-9 cursor-pointer items-center justify-center rounded-full border shadow-2xs transition-colors lg:inline-flex"
                title="Configuraciones"
                aria-label="Configuraciones"
              >
                <Settings className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Modal Centro de Ayuda */}
      {showHelpModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="help-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowHelpModal(false);
          }}
          className="animate-sc-in bg-ink/45 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
        >
          <div className="bg-surface-raised border-line shadow-2 relative flex w-full max-w-md flex-col gap-4 rounded-2xl border p-6">
            <div className="border-line flex items-center justify-between border-b pb-3">
              <div className="text-primary-ink flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                <h3
                  id="help-modal-title"
                  className="text-ink text-base font-bold"
                >
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
            {canAccessAcademy && (
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
            )}
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
    </>
  );
}

export default DashboardHeader;
