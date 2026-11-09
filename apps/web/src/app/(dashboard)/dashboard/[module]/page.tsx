import React from "react";
import { redirect } from "next/navigation";
import { resolveActiveOrganization } from "@/features/tenants/services/tenants.service";
import { getDashboardContext } from "@/features/dashboard/services/modules.service";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { ModulePlaceholderCanvas } from "@/features/dashboard/components/ModulePlaceholderCanvas";

interface ModulePageProps {
  params: Promise<{
    module: string;
  }>;
}

const MODULE_REGISTRY: Record<
  string,
  { name: string; code: string; group: string; subtitle: string }
> = {
  calendario: {
    name: "Calendario",
    code: "CAL-01",
    group: "Operación",
    subtitle: "Agenda de servicios, visitas y cuadrillas en ruta",
  },
  clientes: {
    name: "Clientes",
    code: "VE-CLI",
    group: "Ventas",
    subtitle: "Directorio y gestión de relaciones con clientes (CRM)",
  },
  cotizaciones: {
    name: "Cotizaciones",
    code: "VE-COT",
    group: "Ventas",
    subtitle: "Presupuestos, envíos por WhatsApp y seguimiento comercial",
  },
  nueva: {
    name: "Nueva Cotización",
    code: "VE-NEW",
    group: "Ventas",
    subtitle: "Creador paso a paso de cotizaciones comerciales",
  },
  contratos: {
    name: "Contratos",
    code: "VE-CON",
    group: "Ventas",
    subtitle: "Acuerdos de servicio recurrente y garantías",
  },
  inventario: {
    name: "Inventario y repuestos",
    code: "OP-INV",
    group: "Operación",
    subtitle: "Stock de insumos, materiales y trazabilidad de activos",
  },
  trabajos: {
    name: "Trabajos y órdenes",
    code: "OP-TRAB",
    group: "Operación",
    subtitle: "Control de órdenes de trabajo (OT) y cuadrillas de campo",
  },
  ocurrencias: {
    name: "Ocurrencias e incidencias",
    code: "OP-OCU",
    group: "Operación",
    subtitle: "Reportes y resolución de imprevistos en campo",
  },
  tiempo: {
    name: "Tiempo y asistencia",
    code: "OP-TIME",
    group: "Operación",
    subtitle: "Registro de jornadas, horas hombre y asistencias",
  },
  calidad: {
    name: "Control de calidad",
    code: "OP-CAL",
    group: "Operación",
    subtitle: "Auditorías, actas de conformidad y estándares técnicos",
  },
  postventa: {
    name: "Post venta y fidelización",
    code: "OP-POST",
    group: "Operación",
    subtitle: "Encuestas de satisfacción, reseñas y retención de clientes",
  },
  cobranzas: {
    name: "Cobranzas y estados de cuenta",
    code: "FI-COB",
    group: "Finanzas",
    subtitle: "Gestión de cobranza, cuentas por cobrar y alertas de pago",
  },
  comprobantes: {
    name: "Comprobantes y facturación",
    code: "FI-COMP",
    group: "Finanzas",
    subtitle: "Emisión de facturas y boletas electrónicas SUNAT",
  },
  liquidaciones: {
    name: "Liquidaciones A365",
    code: "FI-LIQ",
    group: "Finanzas",
    subtitle: "Cuadre y liquidación de servicios realizados",
  },
  valorizaciones: {
    name: "Valorizaciones",
    code: "FI-VAL",
    group: "Finanzas",
    subtitle: "Avance de obra y valorizaciones periódicas por proyecto",
  },
  caja: {
    name: "Caja y bancos",
    code: "FI-CAJA",
    group: "Finanzas",
    subtitle: "Flujo de efectivo, ingresos y egresos diarios",
  },
  rentabilidad: {
    name: "Rentabilidad de servicios",
    code: "FI-RENT",
    group: "Finanzas",
    subtitle: "Márgenes de ganancia y costeo real por servicio",
  },
  finanzas: {
    name: "Finanzas generales",
    code: "FI-GEN",
    group: "Finanzas",
    subtitle: "Resumen financiero consolidado y métricas monetarias",
  },
  personal: {
    name: "Personal y cuadrillas",
    code: "EQ-PERS",
    group: "Equipo",
    subtitle: "Fichas de técnicos, operarios y habilidades técnicas",
  },
  "pagos-personal": {
    name: "Pagos al personal",
    code: "EQ-PAG",
    group: "Equipo",
    subtitle: "Cálculo de honorarios, comisiones y salarios de técnicos",
  },
  academia: {
    name: "Biblioteca y Academia",
    code: "EQ-ACAD",
    group: "Equipo",
    subtitle: "Manuales de procedimiento, fichas de producto y capacitaciones",
  },
  marketing: {
    name: "Marketing y campañas",
    code: "CR-MKT",
    group: "Crecimiento",
    subtitle: "Campañas promocionales y captación de prospectos",
  },
  "sitio-web": {
    name: "Sitio web y reservas",
    code: "CR-WEB",
    group: "Crecimiento",
    subtitle: "Portal público para clientes y reservas online",
  },
  reportes: {
    name: "Reportes y exportaciones",
    code: "REP-01",
    group: "Reportes",
    subtitle: "Exportaciones en Excel y reportes consolidados",
  },
  configuraciones: {
    name: "Configuraciones de empresa",
    code: "CFG-01",
    group: "Configuraciones",
    subtitle: "Parámetros del tenant, datos fiscales y perfiles de acceso",
  },
  config: {
    name: "Configuraciones",
    code: "CFG-01",
    group: "Configuraciones",
    subtitle: "Parámetros del tenant, datos fiscales y perfiles de acceso",
  },
  comunidad: {
    name: "Comunidad Vittkly",
    code: "COM-01",
    group: "Comunidad",
    subtitle: "Ideas, mejoras y sugerencias compartidas de la red de empresas",
  },
};

export default async function DynamicModulePage({ params }: ModulePageProps) {
  const { module: moduleSlug } = await params;

  const { userId, active } = await resolveActiveOrganization();
  if (!userId) redirect("/login");
  if (!active) redirect("/select-org");

  const context = await getDashboardContext(active.id);
  if (!context) redirect("/login");

  const moduleInfo = MODULE_REGISTRY[moduleSlug] || {
    name:
      moduleSlug.charAt(0).toUpperCase() +
      moduleSlug.slice(1).replace(/-/g, " "),
    code: `MOD-${moduleSlug.toUpperCase().slice(0, 4)}`,
    group: "Módulos",
    subtitle: "Cascarón visual y estructura base del módulo",
  };

  return (
    <div className="flex min-h-full flex-1 flex-col transition-colors">
      {/* Cabecera del Header */}
      <DashboardHeader
        title={moduleInfo.name}
        subtitle={moduleInfo.subtitle}
        userName={context.user.nombre}
        userRole={context.activeProfile.nombre}
      />

      {/* Cascarón del Módulo (Lienzo Central) */}
      <ModulePlaceholderCanvas
        moduleName={moduleInfo.name}
        groupName={moduleInfo.group}
        description={moduleInfo.subtitle}
        backHref="/dashboard"
      />
    </div>
  );
}
