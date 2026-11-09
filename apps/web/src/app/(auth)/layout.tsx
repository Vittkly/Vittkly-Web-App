import React from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AuthBentoShowcase } from "@/features/auth/components/AuthBentoShowcase";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      id="empGate"
      className="bg-surface text-ink min-h-dvh w-full transition-colors"
    >
      <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-[minmax(420px,40%)_minmax(0,1fr)]">
        {/* Columna Izquierda: Tarjeta de Acceso y Decoración de Marca */}
        <section className="from-primary-soft/50 via-surface to-surface-sunken/40 relative flex flex-col items-center justify-center overflow-hidden bg-linear-to-br p-6 sm:p-8 lg:p-10">
          {/* Fondo geométrico SVG y Orbs difuminados */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="animate-lg-drift bg-vitta absolute -top-24 -left-20 h-96 w-96 rounded-full opacity-20 blur-3xl" />
            <div className="animate-lg-drift-delayed bg-kleanly absolute -right-20 -bottom-28 h-80 w-80 rounded-full opacity-15 blur-3xl" />
            <svg
              viewBox="0 0 600 800"
              preserveAspectRatio="xMidYMid slice"
              focusable="false"
              className="pointer-events-none absolute inset-0 h-full w-full opacity-60"
            >
              <defs>
                <linearGradient id="lgS1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="var(--vitta)" stopOpacity=".22" />
                  <stop offset="1" stopColor="var(--vitta)" stopOpacity=".04" />
                </linearGradient>
                <linearGradient id="lgS2" x1="1" y1="1" x2="0" y2="0">
                  <stop
                    offset="0"
                    stopColor="var(--kleanly)"
                    stopOpacity=".24"
                  />
                  <stop
                    offset="1"
                    stopColor="var(--kleanly)"
                    stopOpacity=".04"
                  />
                </linearGradient>
              </defs>
              <g>
                <rect
                  x="-90"
                  y="-70"
                  width="270"
                  height="270"
                  rx="64"
                  transform="rotate(14 45 65)"
                  fill="url(#lgS1)"
                />
              </g>
              <g>
                <rect
                  x="420"
                  y="610"
                  width="260"
                  height="260"
                  rx="64"
                  transform="rotate(-12 550 740)"
                  fill="url(#lgS2)"
                />
              </g>
              <g>
                <circle
                  cx="520"
                  cy="120"
                  r="46"
                  fill="none"
                  stroke="var(--vitta)"
                  strokeOpacity=".28"
                  strokeWidth="1.5"
                />
              </g>
              <g
                fill="var(--primary)"
                fillOpacity=".25"
                transform="translate(40 640)"
              >
                <circle cx="0" cy="0" r="2" />
                <circle cx="0" cy="16" r="2" />
                <circle cx="0" cy="32" r="2" />
                <circle cx="0" cy="48" r="2" />
                <circle cx="0" cy="64" r="2" />
                <circle cx="16" cy="0" r="2" />
                <circle cx="16" cy="16" r="2" />
                <circle cx="16" cy="32" r="2" />
                <circle cx="16" cy="48" r="2" />
                <circle cx="16" cy="64" r="2" />
                <circle cx="32" cy="0" r="2" />
                <circle cx="32" cy="16" r="2" />
                <circle cx="32" cy="32" r="2" />
                <circle cx="32" cy="48" r="2" />
                <circle cx="32" cy="64" r="2" />
                <circle cx="48" cy="0" r="2" />
                <circle cx="48" cy="16" r="2" />
                <circle cx="48" cy="32" r="2" />
                <circle cx="48" cy="48" r="2" />
                <circle cx="48" cy="64" r="2" />
              </g>
            </svg>
          </div>

          {/* Theme Toggle flotante discreto */}
          <div className="absolute top-4 right-4 z-20">
            <ThemeToggle />
          </div>

          {/* Contenedor del Card de Autenticación */}
          <div className="relative z-10 my-auto flex w-full items-center justify-center">
            {children}
          </div>
        </section>

        {/* Columna Derecha: Showcase Bento Grid y Micro-Interacciones */}
        <section className="bg-surface-sunken/40 border-line hidden items-center justify-center overflow-y-auto border-l p-6 lg:flex lg:p-8 xl:p-12">
          <AuthBentoShowcase />
        </section>
      </div>
    </div>
  );
}
