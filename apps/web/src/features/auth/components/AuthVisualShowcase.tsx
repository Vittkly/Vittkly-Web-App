import React from "react";
import { VittklyLogo } from "@/components/brand/VittklyLogo";
import { VittklyIcon, type VittklyIconName } from "@/components/icons";

export type AuthPortalType = "tenant" | "staff" | "guest";

export interface AuthVisualShowcaseProps {
  portal: AuthPortalType;
}

interface ShowcaseData {
  badge: string;
  badgeVariant: "primary" | "plan" | "role" | "tenant";
  headline: string;
  description: string;
  metrics: Array<{
    label: string;
    value: string;
    detail: string;
    icon: VittklyIconName;
  }>;
  trustPillars: Array<{
    title: string;
    subtitle: string;
    icon: VittklyIconName;
  }>;
}

const SHOWCASE_CONTENT: Record<AuthPortalType, ShowcaseData> = {
  tenant: {
    badge: "SaaS B2B Multi-Tenant",
    badgeVariant: "tenant",
    headline: "Control total de operaciones y servicios en campo",
    description:
      "Orquesta cuadrillas, despachos en ruta, cotizaciones automáticas, finanzas y facturación electrónica con arquitectura de datos aislada.",
    metrics: [
      {
        label: "Eficiencia en Campo",
        value: "99.4%",
        detail: "Cumplimiento de órdenes OT",
        icon: "check",
      },
      {
        label: "Módulos Integrados",
        value: "39",
        detail: "Desde cotización hasta cobro",
        icon: "grid",
      },
    ],
    trustPillars: [
      {
        title: "Aislamiento Multi-Tenant",
        subtitle: "Políticas RLS estrictas por empresa",
        icon: "building",
      },
      {
        title: "Cifrado TLS 1.3 & Zero-Trust",
        subtitle: "Auditoría inmutable de transacciones",
        icon: "card",
      },
      {
        title: "App de Campo Offline-First",
        subtitle: "Sincronización segura con SQLite",
        icon: "sync",
      },
    ],
  },
  staff: {
    badge: "Consola Interna Staff & Superadmins",
    badgeVariant: "primary",
    headline: "Centro de comando global de la plataforma Vittkly",
    description:
      "Gestión de tenants, monitoreo de cuotas de planes, catálogo de módulos maestros y gobierno de infraestructura en la nube.",
    metrics: [
      {
        label: "Uptime Plataforma",
        value: "99.98%",
        detail: "Supabase Cloud sa-east-1",
        icon: "check",
      },
      {
        label: "Gobernanza RLS",
        value: "100%",
        detail: "FORCE RLS en todas las tablas",
        icon: "building",
      },
    ],
    trustPillars: [
      {
        title: "Privilegios de Plataforma",
        subtitle: "Verificación estricta con public.es_staff()",
        icon: "user",
      },
      {
        title: "Gestión Central de Catálogo",
        subtitle: "39 módulos maestros y planes SaaS",
        icon: "grid",
      },
      {
        title: "Registro de Auditoría",
        subtitle: "Trazabilidad de cambios de infraestructura",
        icon: "barchart",
      },
    ],
  },
  guest: {
    badge: "Colaborador Invitado",
    badgeVariant: "role",
    headline: "Únete a la cuadrilla de tu empresa en Vittkly",
    description:
      "Activa tu perfil con el código VK-XXXX-XXXX asignado por tu administrador y accede a tus trabajos, cronogramas y reportes.",
    metrics: [
      {
        label: "Activación Inmediata",
        value: "< 1 min",
        detail: "Canje seguro de invitación",
        icon: "clock",
      },
      {
        label: "Acceso Unificado",
        value: "Web & Móvil",
        detail: "Según permisos de tu rol",
        icon: "nav",
      },
    ],
    trustPillars: [
      {
        title: "Invitación con Hash Criptográfico",
        subtitle: "Código de un solo uso sin reexposición",
        icon: "card",
      },
      {
        title: "Asignación Dinámica de Perfil",
        subtitle: "Módulos configurados por tu empleador",
        icon: "users",
      },
      {
        title: "Trazabilidad de Operaciones",
        subtitle: "Registro seguro de horas y firmas",
        icon: "pen",
      },
    ],
  },
};

export function AuthVisualShowcase({ portal }: AuthVisualShowcaseProps) {
  const content = SHOWCASE_CONTENT[portal];

  return (
    <div className="from-hero-from to-hero-to shadow-2 relative hidden w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br p-8 lg:flex lg:flex-col lg:justify-between lg:p-12">
      {/* Elementos ambientales de fondo */}
      <div className="bg-primary/20 pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full blur-3xl" />
      <div className="bg-vitta/15 pointer-events-none absolute -right-24 -bottom-24 h-96 w-96 rounded-full blur-3xl" />

      {/* Cabecera del showcase */}
      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <VittklyLogo variant="wordmark" tone="white" height={34} priority />
          <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-semibold text-white select-none">
            {content.badge}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-2xl leading-snug font-bold tracking-tight text-white sm:text-3xl">
            {content.headline}
          </h2>
          <p className="max-w-lg text-sm leading-relaxed text-slate-300">
            {content.description}
          </p>
        </div>
      </div>

      {/* Tarjetas de métricas Bento flotantes */}
      <div className="relative z-10 my-8 grid grid-cols-2 gap-3.5">
        {content.metrics.map((m) => (
          <div
            key={m.label}
            className="flex flex-col gap-1 rounded-xl border border-white/10 bg-white/5 p-4 shadow-xs backdrop-blur-md"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                {m.label}
              </span>
              <VittklyIcon name={m.icon} size={15} className="text-primary" />
            </div>
            <span className="font-mono text-2xl font-bold text-white tabular-nums">
              {m.value}
            </span>
            <span className="text-[11px] text-slate-400">{m.detail}</span>
          </div>
        ))}
      </div>

      {/* Pilares de confianza y seguridad */}
      <div className="relative z-10 flex flex-col gap-3 border-t border-white/10 pt-6">
        <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Garantías de Plataforma
        </span>
        <div className="grid grid-cols-1 gap-2.5">
          {content.trustPillars.map((p) => (
            <div
              key={p.title}
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-xs transition-colors hover:bg-white/10"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/10 text-white">
                <VittklyIcon name={p.icon} size={15} className="text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">
                  {p.title}
                </span>
                <span className="text-[11px] text-slate-300">{p.subtitle}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AuthVisualShowcase;
