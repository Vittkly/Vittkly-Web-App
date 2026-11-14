import React from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AuthBackdrop } from "@/features/auth/components/AuthBackdrop";
import { AuthBentoShowcase } from "@/features/auth/components/AuthBentoShowcase";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      id="empGate"
      className="group/gate bg-surface text-ink min-h-dvh w-full overflow-x-clip transition-colors lg:h-screen lg:overflow-hidden has-[[data-register-step=3]]:lg:h-auto has-[[data-register-step=3]]:lg:min-h-screen has-[[data-register-step=3]]:lg:overflow-y-auto"
    >
      <div className="grid min-h-dvh w-full grid-cols-1 group-has-[[data-register-step=3]]/gate:h-auto group-has-[[data-register-step=3]]/gate:min-h-screen lg:h-full lg:grid-cols-[minmax(440px,42%)_minmax(0,1fr)] group-has-[[data-register-step=3]]/gate:lg:grid-cols-1">
        {/* Columna Izquierda: Tarjeta de Acceso y Decoración de Marca */}
        <main className="from-primary-soft/50 via-surface to-surface-sunken/40 relative flex flex-col items-center justify-center bg-linear-to-br px-4 py-5 group-has-[[data-register-step=3]]/gate:h-auto group-has-[[data-register-step=3]]/gate:min-h-screen sm:p-8 lg:h-full lg:p-8 xl:p-10 [@media(max-height:700px)]:lg:pt-16">
          <AuthBackdrop />

          {/* Toggle de tema en flujo en móvil / paso 3, flotante en escritorio */}
          <div className="relative z-20 mb-2 flex w-full max-w-[400px] justify-end group-has-[[data-register-step=3]]/gate:max-w-4xl lg:absolute lg:top-4 lg:right-4 lg:mb-0 lg:w-auto lg:max-w-none group-has-[[data-register-step=3]]/gate:lg:static group-has-[[data-register-step=3]]/gate:lg:mb-3 group-has-[[data-register-step=3]]/gate:lg:w-full">
            <ThemeToggle />
          </div>

          {/* Contenedor del Card de Autenticación */}
          <div className="relative z-10 flex w-full items-center justify-center lg:my-auto">
            {children}
          </div>
        </main>

        {/* Columna Derecha: Showcase B2B visible debajo en móvil con scroll vertical */}
        <section className="bg-surface-sunken/40 border-line flex w-full items-center justify-center border-t px-4 py-6 group-has-[[data-register-step=3]]/gate:hidden sm:p-8 lg:min-h-screen lg:border-t-0 lg:border-l lg:p-8 xl:p-12">
          <div className="flex w-full max-w-4xl flex-col items-center justify-center transition-transform lg:max-h-full lg:origin-center lg:scale-[0.80] xl:scale-[0.86]">
            <AuthBentoShowcase />
          </div>
        </section>
      </div>
    </div>
  );
}
