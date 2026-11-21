"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Apple, Play } from "lucide-react";

interface Slide {
  k: string;
  t: string;
  d: string;
}

const LG_SLIDES: Slide[] = [
  {
    k: "Cotiza",
    t: "Cotiza en minutos",
    d: "Elige del tarifario, suma ítems y envía la cotización por WhatsApp.",
  },
  {
    k: "Programa",
    t: "Programa sin cruces",
    d: "Asigna técnico y horario en el calendario y avisa al cliente.",
  },
  {
    k: "Cobra",
    t: "Cobra con orden",
    d: "Registra adelantos y pagos, y deja cada trabajo liquidado.",
  },
];

const LG_FAQ: Array<[string, string]> = [
  [
    "¿Cómo ingreso a mi cuenta?",
    "Escribe tu correo y tu contraseña, o continúa con Google, Microsoft o WhatsApp (con el correo o celular que registró tu administrador). Después eliges la empresa con la que trabajas hoy: cada una tiene sus propios clientes, cotizaciones y configuración. Si eres nuevo, usa «Crear cuenta»: serás el propietario de tu empresa.",
  ],
  [
    "¿Cómo cambio mi contraseña?",
    "Desde «¿Olvidaste tu contraseña?» recibirás un enlace para crear una nueva. Pide mínimo 8 caracteres, una mayúscula, un número y un símbolo.",
  ],
  [
    "¿Qué pasa si me equivoco varias veces?",
    "A los 3 intentos fallidos esperas 30 segundos; a los 5, el acceso se bloquea 15 minutos. Puedes recuperar tu contraseña cuando quieras desde «¿Olvidaste tu contraseña?». Si sigues sin entrar, escribe a soporte@vittkly.com.",
  ],
  [
    "¿Dónde descargo la app de campo?",
    "La app de campo para técnicos y supervisores está disponible en App Store (iOS) y Google Play (Android). Entras con el mismo correo y contraseña de tu empresa.",
  ],
];

const LG_TIPS = [
  "Cada empresa tiene sus propios clientes, cotizaciones y tarifarios.",
  "Los técnicos ven su agenda y sus trabajos, sin precios.",
  "Cotiza desde el celular y envía el resumen por WhatsApp.",
  "Después de ingresar eliges la empresa con la que trabajas hoy.",
];

function AnimatedTotal({ target }: { target: number }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const duration = prefersReducedMotion ? 0 : 900;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = duration === 0 ? 1 : Math.min(1, elapsed / duration);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * easeOut));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    const rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target]);

  return <>{value}</>;
}

function ShowcaseMockWindow({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-theme="light"
      className="shadow-2 animate-sc-in bg-surface-raised text-ink w-full overflow-hidden rounded-xl"
    >
      <div className="border-line bg-surface-sunken text-ink-muted flex min-w-0 items-center gap-1.5 border-b px-3 py-2 text-[0.7rem] font-bold">
        <span className="bg-line-strong/40 h-2 w-2 shrink-0 rounded-full" />
        <span className="bg-line-strong/40 h-2 w-2 shrink-0 rounded-full" />
        <span className="bg-line-strong/40 h-2 w-2 shrink-0 rounded-full" />
        <span className="ml-2 min-w-0 truncate font-mono text-[0.68rem]">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

export function AuthBentoShowcase() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedFaq, setSelectedFaq] = useState(0);
  const [activeTip, setActiveTip] = useState(0);

  // Auto-rotación sutil de slides respetando preferencia de movimiento reducido
  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % LG_SLIDES.length);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const timer = setInterval(nextSlide, 5500);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="grid w-full max-w-[1080px] grid-cols-1 gap-3.5 md:grid-cols-6">
      {/* 1. Tarjeta Showcase Heroica */}
      <div className="shadow-2 from-hero-from to-hero-to text-hero-ink relative col-span-1 grid grid-cols-1 items-center gap-5 overflow-hidden rounded-[20px] bg-linear-to-br p-4 sm:gap-6 sm:p-7 md:col-span-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {/* Glow orbs animados */}
        <div
          aria-hidden="true"
          className="animate-lg-drift bg-vitta pointer-events-none absolute -top-20 -right-12 h-64 w-64 rounded-full opacity-40 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="animate-lg-drift-delayed bg-kleanly pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full opacity-35 blur-3xl"
        />

        {/* Columna Izquierda: Información y Selector de Tabs */}
        <div className="relative z-10 flex min-w-0 flex-col gap-3">
          <p className="text-hero-ink/90 text-[0.68rem] font-extrabold tracking-widest uppercase">
            Así trabaja Vittkly
          </p>
          <h2 className="text-hero-ink text-xl leading-tight font-bold tracking-tight sm:text-2xl">
            Cotiza, programa y cobra desde un solo lugar
          </h2>

          <div
            className="mt-1 flex flex-col gap-2"
            role="tablist"
            aria-label="Flujos de Vittkly"
          >
            {LG_SLIDES.map((slide, idx) => {
              const isSelected = idx === activeSlide;
              return (
                <button
                  key={slide.k}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveSlide(idx)}
                  className={`group focus-visible:outline-hero-ink relative cursor-pointer overflow-hidden rounded-xl border p-3 text-left transition-all duration-200 focus-visible:outline-2 ${
                    isSelected
                      ? "border-hero-ink/40 bg-hero-ink/15 text-hero-ink shadow-sm"
                      : "border-hero-ink/15 bg-hero-ink/5 text-hero-ink/85 hover:bg-hero-ink/10"
                  }`}
                >
                  <span className="block text-xs font-bold sm:text-sm">
                    {slide.t}
                  </span>
                  <span
                    className={`text-hero-ink/80 mt-0.5 block text-[0.72rem] leading-relaxed transition-opacity duration-200 ${
                      isSelected
                        ? "opacity-100"
                        : "opacity-75 group-hover:opacity-95"
                    }`}
                  >
                    {slide.d}
                  </span>
                  {isSelected && (
                    <span
                      aria-hidden="true"
                      className="animate-sc-fill bg-kleanly absolute bottom-0 left-0 h-[3px] w-full"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="border-hero-ink/15 text-hero-ink/80 mt-1 flex flex-wrap items-center justify-between gap-2.5 border-t pt-2.5 text-xs">
            <button
              type="button"
              onClick={nextSlide}
              className="border-hero-ink/40 bg-hero-ink/10 text-hero-ink hover:bg-hero-ink/20 focus-visible:outline-hero-ink inline-flex min-h-[40px] cursor-pointer items-center rounded-full border px-3.5 text-xs font-bold transition-colors focus-visible:outline-2 sm:min-h-[34px]"
            >
              Ver siguiente flujo &rarr;
            </button>
            <span className="text-hero-ink/75 text-[0.68rem] italic">
              Ejemplo con datos ficticios.
            </span>
          </div>
        </div>

        {/* Columna Derecha: Escenario Dinámico (primero arriba en móvil al hacer scroll) */}
        <div className="border-hero-ink/20 bg-hero-ink/10 relative z-10 order-first flex min-h-[210px] min-w-0 items-center justify-center overflow-hidden rounded-2xl border p-3 backdrop-blur-md sm:min-h-[220px] sm:p-4 lg:order-none">
          {activeSlide === 0 && (
            <ShowcaseMockWindow title="Cotización · Limpieza de muebles">
              <div className="flex flex-col gap-2 p-3 sm:p-4">
                <div className="border-line flex items-center justify-between gap-2 border-b border-dashed py-1 text-xs">
                  <span>Sofá 3 cuerpos</span>
                  <b className="font-mono whitespace-nowrap tabular-nums">
                    S/ 120
                  </b>
                </div>
                <div className="border-line flex items-center justify-between gap-2 border-b border-dashed py-1 text-xs">
                  <span>Colchón 2 plazas</span>
                  <b className="font-mono whitespace-nowrap tabular-nums">
                    S/ 90
                  </b>
                </div>
                <div className="border-line flex items-center justify-between gap-2 border-b border-dashed py-1 text-xs">
                  <span>Alfombra 2 &times; 3 m</span>
                  <b className="font-mono whitespace-nowrap tabular-nums">
                    S/ 60
                  </b>
                </div>
                <div className="text-ink flex items-center justify-between gap-2 pt-2 text-sm font-extrabold">
                  <span>Total cotizado</span>
                  <b className="text-primary-ink font-mono text-base whitespace-nowrap tabular-nums">
                    S/ <AnimatedTotal target={270} />
                  </b>
                </div>
                <div className="bg-success-soft text-success-ink mt-1 inline-flex items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-[0.68rem] font-bold">
                  <span className="bg-kleanly h-1.5 w-1.5 shrink-0 rounded-full" />
                  Enviada por WhatsApp
                </div>
              </div>
            </ShowcaseMockWindow>
          )}

          {activeSlide === 1 && (
            <ShowcaseMockWindow title="Semana 42 · Cuadrilla Norte">
              <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-3 sm:p-4">
                <div className="bg-primary text-on-primary flex flex-col gap-1 rounded-lg p-2.5">
                  <span className="font-mono text-[0.65rem] font-bold tracking-wider uppercase opacity-95">
                    LUN · OT-1042
                  </span>
                  <b className="text-xs leading-tight">Lavado alfombra</b>
                  <span className="text-[0.68rem] opacity-90">
                    San Isidro · 09:00
                  </span>
                </div>
                <div className="bg-success-ink text-on-primary flex flex-col gap-1 rounded-lg p-2.5">
                  <span className="font-mono text-[0.65rem] font-bold tracking-wider uppercase opacity-95">
                    MAR · OT-1045
                  </span>
                  <b className="text-xs leading-tight">Desinfección clínica</b>
                  <span className="text-[0.68rem] opacity-90">
                    Miraflores · 11:30
                  </span>
                </div>
                <div className="bg-warning-ink text-on-primary flex flex-col gap-1 rounded-lg p-2.5">
                  <span className="font-mono text-[0.65rem] font-bold tracking-wider uppercase opacity-95">
                    MIÉ · OT-1048
                  </span>
                  <b className="text-xs leading-tight">Limpieza tapiz</b>
                  <span className="text-[0.68rem] opacity-90">
                    Surco · 15:00
                  </span>
                </div>
              </div>
            </ShowcaseMockWindow>
          )}

          {activeSlide === 2 && (
            <ShowcaseMockWindow title="Liquidación · OT-1042">
              <div className="flex flex-col gap-2.5 p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-ink-muted">Monto cobrado:</span>
                  <b className="text-primary-ink font-mono text-base whitespace-nowrap tabular-nums">
                    S/ 270.00
                  </b>
                </div>
                <div className="bg-success-soft text-success-ink inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1 text-xs font-bold">
                  <span className="bg-kleanly h-2 w-2 shrink-0 rounded-full" />
                  Pagada (Yape / Transferencia)
                </div>
                <div className="border-kleanly/30 bg-success-soft text-success-ink rounded-xl border p-2.5 text-xs leading-relaxed">
                  <b className="mb-0.5 block font-semibold">
                    Mensaje automático de confirmación:
                  </b>
                  &ldquo;¡Hola Juan! Confirmamos el cobro de S/ 270 por tu
                  servicio de limpieza. Gracias por confiar en nosotros.&rdquo;
                </div>
              </div>
            </ShowcaseMockWindow>
          )}
        </div>
      </div>

      {/* 2. Tarjeta FAQ de Acceso */}
      <div className="bg-surface-raised border-line hover:shadow-2 hover:border-primary relative col-span-1 flex flex-col gap-3 overflow-hidden rounded-[18px] border p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 sm:p-5 md:col-span-4">
        <h3 className="text-ink text-sm font-bold tracking-tight">
          Preguntas frecuentes de acceso
        </h3>
        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-label="Preguntas frecuentes"
        >
          {LG_FAQ.map(([q], idx) => {
            const isSelected = idx === selectedFaq;
            return (
              <button
                key={q}
                type="button"
                onClick={() => setSelectedFaq(idx)}
                aria-pressed={isSelected}
                className={`focus-visible:outline-focus min-h-[40px] cursor-pointer rounded-xl px-3 py-1.5 text-left text-xs leading-snug font-bold transition-all focus-visible:outline-2 sm:min-h-[34px] sm:rounded-full sm:text-center ${
                  isSelected
                    ? "bg-primary text-on-primary shadow-xs"
                    : "bg-surface border-line text-ink hover:bg-primary-soft hover:text-primary-ink border"
                }`}
              >
                {q}
              </button>
            );
          })}
        </div>
        <p
          key={selectedFaq}
          className="text-ink-muted bg-surface-sunken/60 border-line/60 animate-sc-in min-h-[5em] rounded-xl border p-3 text-xs leading-relaxed"
          aria-live="polite"
        >
          {LG_FAQ[selectedFaq][1]}
        </p>
      </div>

      {/* 3. Tarjeta Vittkly en tu Bolsillo (Mobile App) */}
      <div className="bg-surface-raised border-line hover:shadow-2 hover:border-primary relative col-span-1 flex flex-col items-center justify-between gap-3 overflow-hidden rounded-[18px] border p-4 text-center shadow-xs transition-all duration-200 hover:-translate-y-0.5 sm:p-5 md:col-span-2">
        {/* Smartphone CSS mockup */}
        <div
          aria-hidden="true"
          className="border-ink bg-surface-sunken relative h-16 w-10 rounded-lg border-2 transition-transform duration-300 hover:-translate-y-1 hover:-rotate-6"
        >
          <div className="bg-primary absolute top-1.5 right-1.5 left-1.5 h-1.5 rounded-xs" />
          <div className="bg-line absolute top-4 right-1.5 left-1.5 h-6 rounded-xs" />
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="text-ink text-sm font-bold">Vittkly en tu bolsillo</h3>
          <p className="text-ink-muted text-xs leading-tight">
            Tus servicios, jornadas y cobros desde el celular.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2">
          <div className="from-hero-from to-hero-to border-hero-ink/15 text-hero-ink flex min-h-[44px] items-center justify-center gap-2 rounded-xl border bg-linear-to-r px-3 py-1.5 text-xs font-bold shadow-xs">
            <Apple className="h-4 w-4 shrink-0" aria-hidden="true" />
            <div className="flex flex-col text-left leading-none">
              <span className="text-hero-ink/75 text-[10px] font-medium">
                Próximamente en
              </span>
              <span className="text-xs font-extrabold">App Store</span>
            </div>
          </div>
          <div className="from-hero-from to-hero-to border-hero-ink/15 text-hero-ink flex min-h-[44px] items-center justify-center gap-2 rounded-xl border bg-linear-to-r px-3 py-1.5 text-xs font-bold shadow-xs">
            <Play
              className="h-3.5 w-3.5 shrink-0 fill-current"
              aria-hidden="true"
            />
            <div className="flex flex-col text-left leading-none">
              <span className="text-hero-ink/75 text-[10px] font-medium">
                Próximamente en
              </span>
              <span className="text-xs font-extrabold">Google Play</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Tarjeta Tip del Día */}
      <div className="bg-surface-raised border-line relative col-span-1 flex flex-wrap items-center justify-between gap-3 overflow-hidden rounded-[18px] border p-4 shadow-xs sm:flex-nowrap sm:gap-4 md:col-span-6">
        <p
          key={activeTip}
          className="text-ink animate-sc-in min-w-0 flex-1 text-xs leading-snug font-medium sm:text-sm"
          aria-live="polite"
        >
          <b className="text-primary-ink mr-2 font-bold">Tip de operación:</b>
          {LG_TIPS[activeTip]}
        </p>

        <div
          className="flex shrink-0 items-center"
          role="group"
          aria-label="Consejos"
        >
          {LG_TIPS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveTip(i)}
              aria-label={`Consejo ${i + 1}`}
              aria-current={i === activeTip}
              className="focus-visible:outline-focus flex min-h-[36px] min-w-[24px] cursor-pointer items-center justify-center rounded-full focus-visible:outline-2"
            >
              <span
                className={`h-2 rounded-full transition-all ${
                  i === activeTip
                    ? "bg-primary w-5"
                    : "bg-line hover:bg-line-strong w-2"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AuthBentoShowcase;
