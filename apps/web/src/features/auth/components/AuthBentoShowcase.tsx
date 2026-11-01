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
    const duration = 900;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
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

export function AuthBentoShowcase() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedFaq, setSelectedFaq] = useState(0);
  const [activeTip, setActiveTip] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 50, y: 0 });

  // Auto-rotación sutil de slides si el usuario no interactúa
  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % LG_SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 7000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div className="grid w-full max-w-[1080px] grid-cols-1 gap-3.5 select-none md:grid-cols-6">
      {/* 1. Tarjeta Showcase Heroica */}
      <div className="shadow-2 relative col-span-1 grid grid-cols-1 items-center gap-6 overflow-hidden rounded-[20px] bg-linear-to-br from-[#0E2A3B] via-[#12475F] to-[#157AA8] p-5 text-white sm:p-7 md:col-span-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {/* Glow orbs animados */}
        <div
          aria-hidden="true"
          className="animate-lg-drift pointer-events-none absolute -top-20 -right-12 h-64 w-64 rounded-full bg-[#2AA8DE] opacity-40 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="animate-lg-drift-delayed pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-[#3EC49B] opacity-35 blur-3xl"
        />

        {/* Columna Izquierda: Información y Selector de Tabs */}
        <div className="relative z-10 flex min-w-0 flex-col gap-3">
          <p className="text-[0.68rem] font-extrabold tracking-widest text-[#7FD9BE] uppercase">
            Así trabaja Vittkly
          </p>
          <h2 className="text-xl leading-tight font-bold tracking-tight text-white sm:text-2xl">
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
                  className={`group relative cursor-pointer overflow-hidden rounded-xl border p-3 text-left transition-all duration-200 ${
                    isSelected
                      ? "border-white/40 bg-white/15 text-white shadow-sm"
                      : "border-white/15 bg-white/5 text-[#C9DDE8] hover:bg-white/10"
                  }`}
                >
                  <span className="block text-xs font-bold sm:text-sm">
                    {slide.t}
                  </span>
                  <span
                    className={`mt-0.5 block text-[0.72rem] leading-relaxed text-[#C9DDE8] transition-opacity duration-200 ${
                      isSelected
                        ? "opacity-100"
                        : "opacity-60 group-hover:opacity-85"
                    }`}
                  >
                    {slide.d}
                  </span>
                  {isSelected && (
                    <span
                      aria-hidden="true"
                      className="animate-sc-fill absolute bottom-0 left-0 h-[3px] w-full bg-[#3EC49B]"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-1 flex items-center justify-between gap-3 border-t border-white/10 pt-2 text-xs text-[#9DB2BE]">
            <button
              type="button"
              onClick={nextSlide}
              className="inline-flex min-h-[32px] cursor-pointer items-center rounded-full border border-white/40 bg-white/10 px-3.5 text-xs font-bold text-white transition-colors hover:bg-white/20"
            >
              Ver siguiente flujo &rarr;
            </button>
            <span className="text-[0.68rem] text-[#C9DDE8]/80 italic">
              Ejemplo con datos ficticios.
            </span>
          </div>
        </div>

        {/* Columna Derecha: Escenario Dinámico (Stage) */}
        <div className="relative z-10 flex min-h-[220px] items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
          {activeSlide === 0 && (
            <div className="shadow-2 animate-sc-in w-full overflow-hidden rounded-xl bg-white text-[#0E2A3B]">
              <div className="flex items-center gap-1.5 border-b border-[#DDE7EC] bg-[#EAF2F6] px-3 py-2 text-[0.7rem] font-bold text-[#52626D]">
                <span className="h-2 w-2 rounded-full bg-[#C5D4DC]" />
                <span className="h-2 w-2 rounded-full bg-[#C5D4DC]" />
                <span className="h-2 w-2 rounded-full bg-[#C5D4DC]" />
                <span className="ml-2 font-mono text-[0.68rem]">
                  Cotización · Limpieza de muebles
                </span>
              </div>
              <div className="flex flex-col gap-2 p-3 sm:p-4">
                <div className="flex items-center justify-between border-b border-dashed border-[#DDE7EC] py-1 text-xs">
                  <span>Sofá 3 cuerpos</span>
                  <b className="font-mono tabular-nums">S/ 120</b>
                </div>
                <div className="flex items-center justify-between border-b border-dashed border-[#DDE7EC] py-1 text-xs">
                  <span>Colchón 2 plazas</span>
                  <b className="font-mono tabular-nums">S/ 90</b>
                </div>
                <div className="flex items-center justify-between border-b border-dashed border-[#DDE7EC] py-1 text-xs">
                  <span>Alfombra 2 &times; 3 m</span>
                  <b className="font-mono tabular-nums">S/ 60</b>
                </div>
                <div className="flex items-center justify-between pt-2 text-sm font-extrabold text-[#0E2A3B]">
                  <span>Total cotizado</span>
                  <b className="font-mono text-base text-[#157AA8] tabular-nums">
                    S/ <AnimatedTotal target={270} />
                  </b>
                </div>
                <div className="mt-1 inline-flex items-center gap-1.5 self-start rounded-full bg-[#E2F6EF] px-2.5 py-1 text-[0.68rem] font-bold text-[#146F55]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#3EC49B]" />
                  Enviada por WhatsApp
                </div>
              </div>
            </div>
          )}

          {activeSlide === 1 && (
            <div className="shadow-2 animate-sc-in w-full overflow-hidden rounded-xl bg-white text-[#0E2A3B]">
              <div className="flex items-center gap-1.5 border-b border-[#DDE7EC] bg-[#EAF2F6] px-3 py-2 text-[0.7rem] font-bold text-[#52626D]">
                <span className="h-2 w-2 rounded-full bg-[#C5D4DC]" />
                <span className="h-2 w-2 rounded-full bg-[#C5D4DC]" />
                <span className="h-2 w-2 rounded-full bg-[#C5D4DC]" />
                <span className="ml-2 font-mono text-[0.68rem]">
                  Semana 42 · Cuadrilla Norte
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 p-3 sm:p-4">
                <div className="flex flex-col gap-1 rounded-lg bg-[#157AA8] p-2.5 text-white">
                  <span className="font-mono text-[0.65rem] font-bold tracking-wider uppercase opacity-90">
                    LUN · OT-1042
                  </span>
                  <b className="text-xs leading-tight">Lavado alfombra</b>
                  <span className="text-[0.68rem] opacity-80">
                    San Isidro · 09:00
                  </span>
                </div>
                <div className="flex flex-col gap-1 rounded-lg bg-[#2FA886] p-2.5 text-white">
                  <span className="font-mono text-[0.65rem] font-bold tracking-wider uppercase opacity-90">
                    MAR · OT-1045
                  </span>
                  <b className="text-xs leading-tight">Desinfección clínica</b>
                  <span className="text-[0.68rem] opacity-80">
                    Miraflores · 11:30
                  </span>
                </div>
                <div className="flex flex-col gap-1 rounded-lg bg-[#B97A14] p-2.5 text-white">
                  <span className="font-mono text-[0.65rem] font-bold tracking-wider uppercase opacity-90">
                    MIÉ · OT-1048
                  </span>
                  <b className="text-xs leading-tight">Limpieza tapiz</b>
                  <span className="text-[0.68rem] opacity-80">
                    Surco · 15:00
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeSlide === 2 && (
            <div className="shadow-2 animate-sc-in w-full overflow-hidden rounded-xl bg-white text-[#0E2A3B]">
              <div className="flex items-center gap-1.5 border-b border-[#DDE7EC] bg-[#EAF2F6] px-3 py-2 text-[0.7rem] font-bold text-[#52626D]">
                <span className="h-2 w-2 rounded-full bg-[#C5D4DC]" />
                <span className="h-2 w-2 rounded-full bg-[#C5D4DC]" />
                <span className="h-2 w-2 rounded-full bg-[#C5D4DC]" />
                <span className="ml-2 font-mono text-[0.68rem]">
                  Liquidación · OT-1042
                </span>
              </div>
              <div className="flex flex-col gap-2.5 p-3 sm:p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#52626D]">Monto cobrado:</span>
                  <b className="font-mono text-base text-[#157AA8] tabular-nums">
                    S/ 270.00
                  </b>
                </div>
                <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-[#E2F6EF] px-3 py-1 text-xs font-bold text-[#146F55]">
                  <span className="h-2 w-2 rounded-full bg-[#3EC49B]" />
                  Pagada (Yape / Transferencia)
                </div>
                <div className="rounded-xl border border-[#3EC49B]/30 bg-[#DCF8E7] p-2.5 text-xs leading-relaxed text-[#14402B]">
                  <b className="mb-0.5 block font-semibold">
                    Mensaje automático de confirmación:
                  </b>
                  &ldquo;¡Hola Juan! Confirmamos el cobro de S/ 270 por tu
                  servicio de limpieza. Gracias por confiar en nosotros.&rdquo;
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Tarjeta FAQ de Acceso */}
      <div
        onMouseMove={handleMouseMove}
        style={
          {
            "--mx": `${mousePos.x}px`,
            "--my": `${mousePos.y}px`,
          } as React.CSSProperties
        }
        className="bg-surface-raised border-line hover:shadow-2 hover:border-primary relative col-span-1 flex flex-col gap-3 overflow-hidden rounded-[18px] border p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 md:col-span-4"
      >
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
                className={`min-h-[32px] cursor-pointer rounded-full px-3 text-xs font-bold transition-all ${
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
          className="text-ink-muted bg-surface-sunken/60 border-line/60 animate-sc-in min-h-[5em] rounded-xl border p-3 text-xs leading-relaxed"
          aria-live="polite"
        >
          {LG_FAQ[selectedFaq][1]}
        </p>
      </div>

      {/* 3. Tarjeta Vittkly en tu Bolsillo (Mobile App) */}
      <div className="bg-surface-raised border-line hover:shadow-2 hover:border-primary relative col-span-1 flex flex-col items-center justify-between gap-3 overflow-hidden rounded-[18px] border p-5 text-center shadow-xs transition-all duration-200 hover:-translate-y-0.5 md:col-span-2">
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
          <div className="flex h-9 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0E2A3B] px-3 text-xs font-bold text-white shadow-xs transition-opacity hover:opacity-95">
            <Apple className="h-4 w-4" />
            <div className="flex flex-col text-left leading-none">
              <span className="text-[0.55rem] font-medium opacity-80">
                Consíguelo en el
              </span>
              <span className="text-[0.72rem] font-extrabold">App Store</span>
            </div>
          </div>
          <div className="flex h-9 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0E2A3B] px-3 text-xs font-bold text-white shadow-xs transition-opacity hover:opacity-95">
            <Play className="h-3.5 w-3.5 fill-white" />
            <div className="flex flex-col text-left leading-none">
              <span className="text-[0.55rem] font-medium opacity-80">
                Disponible en
              </span>
              <span className="text-[0.72rem] font-extrabold">Google Play</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Tarjeta Tip del Día */}
      <div className="bg-surface-raised border-line relative col-span-1 flex items-center justify-between gap-4 overflow-hidden rounded-[18px] border p-4 shadow-xs md:col-span-6">
        <p
          className="text-ink animate-sc-in flex-1 text-xs leading-snug font-medium sm:text-sm"
          aria-live="polite"
        >
          <b className="text-primary-ink mr-2 font-bold">Tip de operación:</b>
          {LG_TIPS[activeTip]}
        </p>

        <div
          className="flex shrink-0 items-center gap-1.5"
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
              className={`h-2 cursor-pointer rounded-full transition-all ${
                i === activeTip
                  ? "bg-primary w-5"
                  : "bg-line hover:bg-line-strong w-2"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default AuthBentoShowcase;
