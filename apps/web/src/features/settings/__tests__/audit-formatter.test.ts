import { describe, expect, it } from "vitest";
import {
  AUDIT_ACTION_EVENTS,
  AUDIT_ORIGIN_KEYS,
  SYSTEM_AUDIT_ACTOR_ID,
  type AuditLogEntry,
} from "../types/settings.types";
import {
  filterAuditLogEntries,
  formatAuditChanges,
  formatAuditLogEntry,
  getAuditActionPresentation,
  getAuditOriginFilterValues,
  getAuditOriginLabel,
  inferAuditTipoEvento,
  matchesAuditSearch,
  normalizeAuditOrigin,
  resolveEntityName,
  type RawAuditLogRow,
} from "../services/audit-formatter";

const RAW_SQL_TABLE_NAMES = [
  "membresias",
  "perfiles",
  "perfil_permisos",
  "invitaciones",
  "solicitudes_salida",
  "empresas",
  "empresa_configuracion",
  "clientes",
  "ordenes_trabajo",
  "evidencias_orden",
  "plantillas_formulario",
  "respuestas_formulario",
  "registros_tiempo",
  "casos_soporte",
  "cuentas",
  "suscripciones",
  "usuarios",
  "verificaciones",
  "planes",
  "modulos",
  "plan_modulos",
  "permisos",
  "staff_plataforma",
] as const;

describe("audit-formatter — Taxonomía de colores de acciones (R2)", () => {
  it("asigna etiquetas, variantes y estilos semánticos diferenciados a los 15 tipo_evento canónicos sin HEX ni text-kleanly", () => {
    const labels = new Set<string>();
    const badgeStyles = new Set<string>();

    for (const evento of AUDIT_ACTION_EVENTS) {
      const pres = getAuditActionPresentation(evento);
      expect(pres.tipoEvento).toBe(evento);
      expect(pres.label.length).toBeGreaterThan(2);
      expect(pres.badgeClassName).not.toContain("text-kleanly");
      expect(pres.badgeClassName).not.toContain("text-white");
      expect(pres.badgeClassName).not.toMatch(/#[0-9a-fA-F]{3,8}/);
      expect(pres.badgeClassName).not.toMatch(/\bbg-success(?!-)\b/);
      expect(pres.dotClassName).not.toMatch(/#[0-9a-fA-F]{3,8}/);

      labels.add(pres.label);
      badgeStyles.add(pres.badgeClassName);
    }

    expect(labels.size).toBe(AUDIT_ACTION_EVENTS.length);
    expect(badgeStyles.size).toBe(AUDIT_ACTION_EVENTS.length);
  });

  it("soporta alias activar y actualizar, mayúsculas/espacios y fallbacks a accion y neutral", () => {
    const activar = getAuditActionPresentation("  Activar  ", "editar");
    expect(activar.tipoEvento).toBe("reactivar");
    expect(activar.variant).toBe("success");
    expect(activar.label).toBe("Activación");

    const actualizar = getAuditActionPresentation("ACTUALIZAR", "editar");
    expect(actualizar.tipoEvento).toBe("editar");
    expect(actualizar.variant).toBe("primary");
    expect(actualizar.label).toBe("Actualización");

    expect(getAuditActionPresentation(null, "crear").variant).toBe("success");
    expect(getAuditActionPresentation(undefined, "editar").variant).toBe(
      "primary",
    );
    expect(getAuditActionPresentation("", "borrar").variant).toBe("danger");

    const futuro = getAuditActionPresentation(
      "evento_futuro_desconocido",
      "editar",
    );
    expect(futuro.variant).toBe("neutral");
    expect(futuro.badgeClassName).toBe(
      "bg-surface-sunken text-ink-muted border-line",
    );
    expect(futuro.label).toBe("Evento futuro desconocido");

    const unknownBoth = getAuditActionPresentation(null, "otro");
    expect(unknownBoth.variant).toBe("neutral");
  });
});

describe("audit-formatter — Mapeo de orígenes legibles y 23 tablas", () => {
  it("traduce las 12 claves canónicas de origen a etiquetas legibles en español sin guiones bajos", () => {
    const labels = new Set<string>();
    for (const key of AUDIT_ORIGIN_KEYS) {
      const label = getAuditOriginLabel(key);
      expect(label).not.toContain("_");
      expect(label.length).toBeGreaterThan(3);
      labels.add(label);
    }
    expect(labels.size).toBe(AUDIT_ORIGIN_KEYS.length);
  });

  it("resuelve las 23 tablas auditadas cuando origen es null y diferencia usuarios con/sin empresa", () => {
    for (const tabla of RAW_SQL_TABLE_NAMES) {
      const empresaId = tabla === "usuarios" ? "org-1" : null;
      const originKey = normalizeAuditOrigin(null, tabla, empresaId);
      const label = getAuditOriginLabel(originKey, tabla, empresaId);

      expect(AUDIT_ORIGIN_KEYS).toContain(originKey);
      expect(label).not.toContain("_");
    }

    expect(normalizeAuditOrigin(null, "usuarios", "org-1")).toBe(
      "equipo_accesos",
    );
    expect(normalizeAuditOrigin(null, "usuarios", null)).toBe("plataforma");
    expect(getAuditOriginLabel("tabla_nueva_custom")).toBe(
      "Tabla nueva custom",
    );
  });

  it("expande claves canónicas en getAuditOriginFilterValues para incluir alias heredados", () => {
    expect(getAuditOriginFilterValues("perfiles_permisos")).toEqual(
      expect.arrayContaining([
        "perfiles_permisos",
        "perfiles",
        "perfil_permisos",
      ]),
    );
    expect(getAuditOriginFilterValues("operaciones_ordenes")).toEqual(
      expect.arrayContaining([
        "operaciones_ordenes",
        "ordenes_trabajo",
        "evidencias_orden",
      ]),
    );
    expect(getAuditOriginFilterValues("perfiles")).toEqual(
      expect.arrayContaining([
        "perfiles_permisos",
        "perfiles",
        "perfil_permisos",
      ]),
    );
  });
});

describe("audit-formatter — Consumo M1, pulido de detalle genérico y tablas heredadas", () => {
  it("consume columnas M1, respeta snapshot actor_nombre y resuelve perfil_id con metadatos", () => {
    const row: RawAuditLogRow = {
      id: 101,
      empresa_id: "org-1",
      usuario_id: "user-1",
      accion: "editar",
      tipo_evento: "editar",
      origen: "equipo_accesos",
      actor_nombre: "Andree Valencia",
      actor_correo: "admin@vittkly.test",
      entidad_nombre: "Inés Quispe",
      campos_modificados: ["perfil_id", "acceso_app"],
      detalle: "Actualizó perfil o accesos de «Inés Quispe»",
      metadatos: {
        perfil_anterior_nombre: "Técnico",
        perfil_nombre: "Supervisor",
        cambios: [
          { campo: "perfil_id", antes: "p-1", despues: "p-2" },
          { campo: "acceso_app", antes: false, despues: true },
        ],
      },
      tabla: "membresias",
      registro_id: "mem-1",
      creado_en: "2026-11-17T10:00:00Z",
    };

    const entry = formatAuditLogEntry(row);
    expect(entry.tipoEvento).toBe("editar");
    expect(entry.origen).toBe("equipo_accesos");
    expect(entry.origenLabel).toBe("Equipo y accesos");
    expect(entry.actorNombre).toBe("Andree Valencia");
    expect(entry.actorCorreo).toBe("admin@vittkly.test");
    expect(entry.entidadNombre).toBe("Inés Quispe");
    expect(entry.resumen).toBe("Actualizó perfil o accesos de «Inés Quispe»");
    expect(entry.cambios).toEqual([
      "Perfil: Técnico → Supervisor",
      "Acceso app: No → Sí",
    ]);
    expect(entry.camposModificados).toEqual(["perfil_id", "acceso_app"]);
  });

  it("detecta y pule mensajes genéricos 'Creó/Actualizó/Eliminó registro en <tabla>' sin filtrar nombres SQL", () => {
    const genericCases: RawAuditLogRow[] = [
      {
        id: 201,
        empresa_id: "org-1",
        usuario_id: null,
        accion: "crear",
        tipo_evento: "crear",
        origen: "plataforma",
        actor_nombre: "Sistema",
        entidad_nombre: "Pro",
        detalle: "Creó registro en planes",
        tabla: "planes",
        registro_id: "plan-pro",
        creado_en: "2026-11-17T10:00:00Z",
      },
      {
        id: 202,
        empresa_id: "org-1",
        usuario_id: "user-admin",
        accion: "editar",
        tipo_evento: "editar",
        origen: "plataforma",
        actor_nombre: "Admin",
        entidad_nombre: "Ana Ruiz",
        detalle: "Actualizó registro en staff_plataforma",
        tabla: "staff_plataforma",
        registro_id: "staff-1",
        creado_en: "2026-11-17T10:00:00Z",
      },
      {
        id: 203,
        empresa_id: "org-1",
        usuario_id: "user-admin",
        accion: "editar",
        tipo_evento: "editar",
        origen: "operaciones_ordenes",
        actor_nombre: "Admin",
        entidad_nombre: "OT-2041 · Mantenimiento",
        detalle: "Actualizó registro en ordenes_trabajo",
        tabla: "ordenes_trabajo",
        registro_id: "ot-2041",
        creado_en: "2026-11-17T10:00:00Z",
      },
      {
        id: 204,
        empresa_id: "org-1",
        usuario_id: null,
        accion: "borrar",
        tipo_evento: "borrar",
        origen: "plataforma",
        actor_nombre: "Sistema",
        entidad_nombre: "reportes",
        detalle: "Eliminó registro en plan_modulos",
        tabla: "plan_modulos",
        registro_id: "pm-1",
        creado_en: "2026-11-17T10:00:00Z",
      },
    ];

    for (const raw of genericCases) {
      const formatted = formatAuditLogEntry(raw);
      expect(formatted.resumen).not.toMatch(/registro en [a-z_]+/i);
      for (const sqlTable of RAW_SQL_TABLE_NAMES) {
        expect(formatted.resumen).not.toContain(sqlTable);
        expect(formatted.origenLabel).not.toContain(sqlTable);
      }
    }
  });

  it("formatea filas heredadas sin columnas M1 en las 23 tablas auditadas sin undefined/null/[object Object]", () => {
    const context = {
      userNamesById: new Map([
        [
          "u-1",
          { fullName: "Mateo Paredes", email: "mateo.paredes@vittkly.test" },
        ],
      ]),
      profileNamesById: new Map([["prof-1", "Supervisor"]]),
      companyName: "Vitta Kleanly",
    };

    const legacyFixtures: RawAuditLogRow[] = [
      {
        id: 1,
        empresa_id: "org-1",
        usuario_id: "u-1",
        accion: "editar",
        tabla: "membresias",
        antes: { estado: "activa" },
        despues: { estado: "desactivada", usuario_id: "u-1" },
        creado_en: "2026-11-10T10:00:00Z",
      },
      {
        id: 2,
        empresa_id: "org-1",
        usuario_id: "u-1",
        accion: "crear",
        tabla: "invitaciones",
        despues: {
          tipo: "nueva_cuenta",
          nombres: "Sofía",
          apellidos: "Ramírez",
          correo: "sofia@vittkly.test",
          perfil_id: "prof-1",
        },
        creado_en: "2026-11-10T10:00:00Z",
      },
      {
        id: 3,
        empresa_id: "org-1",
        usuario_id: "u-1",
        accion: "crear",
        tabla: "perfiles",
        despues: { nombre: "Técnico Senior" },
        creado_en: "2026-11-10T10:00:00Z",
      },
      {
        id: 4,
        empresa_id: "org-1",
        usuario_id: "u-1",
        accion: "crear",
        tabla: "perfil_permisos",
        despues: { perfil_id: "prof-1", permiso_codigo: "ordenes.ver" },
        creado_en: "2026-11-10T10:00:00Z",
      },
      {
        id: 5,
        empresa_id: "org-1",
        usuario_id: "u-1",
        accion: "editar",
        tabla: "solicitudes_salida",
        antes: { estado: "pendiente" },
        despues: { estado: "aprobada", usuario_id: "u-1" },
        creado_en: "2026-11-10T10:00:00Z",
      },
      {
        id: 6,
        empresa_id: "org-1",
        usuario_id: "u-1",
        accion: "editar",
        tabla: "empresas",
        antes: { nombre_comercial: "Vitta" },
        despues: { nombre_comercial: "Vitta Kleanly" },
        creado_en: "2026-11-10T10:00:00Z",
      },
      {
        id: 7,
        empresa_id: "org-1",
        usuario_id: "u-1",
        accion: "editar",
        tabla: "empresa_configuracion",
        antes: {
          version: 1,
          actualizado_en: "2026-11-09T00:00:00Z",
          ajustes: { a: 1 },
        },
        despues: {
          version: 2,
          actualizado_en: "2026-11-10T00:00:00Z",
          ajustes: { a: 2 },
        },
        creado_en: "2026-11-10T10:00:00Z",
      },
      {
        id: 8,
        empresa_id: "org-1",
        usuario_id: "u-1",
        accion: "editar",
        tabla: "clientes",
        antes: { nombre_completo: "Clínica Norte", activo: true },
        despues: { nombre_completo: "Clínica Norte", activo: false },
        creado_en: "2026-11-10T10:00:00Z",
      },
      {
        id: 9,
        empresa_id: "org-1",
        usuario_id: "u-1",
        accion: "editar",
        tabla: "ordenes_trabajo",
        antes: {
          codigo: "OT-100",
          titulo: "Lavado",
          estado_validacion: "pendiente",
        },
        despues: {
          codigo: "OT-100",
          titulo: "Lavado",
          estado_validacion: "aprobado",
        },
        creado_en: "2026-11-10T10:00:00Z",
      },
      {
        id: 10,
        empresa_id: "org-1",
        usuario_id: "u-1",
        accion: "crear",
        tabla: "evidencias_orden",
        despues: { orden_trabajo_id: "OT-100", tipo: "foto" },
        creado_en: "2026-11-10T10:00:00Z",
      },
      {
        id: 11,
        empresa_id: "org-1",
        usuario_id: "u-1",
        accion: "editar",
        tabla: "plantillas_formulario",
        antes: { nombre: "Checklist", activa: false },
        despues: { nombre: "Checklist", activa: true },
        creado_en: "2026-11-10T10:00:00Z",
      },
      {
        id: 12,
        empresa_id: "org-1",
        usuario_id: "u-1",
        accion: "crear",
        tabla: "respuestas_formulario",
        despues: { orden_trabajo_id: "OT-100", respuestas: { ok: true } },
        creado_en: "2026-11-10T10:00:00Z",
      },
      {
        id: 13,
        empresa_id: "org-1",
        usuario_id: "u-1",
        accion: "editar",
        tabla: "registros_tiempo",
        antes: { usuario_id: "u-1", tipo: "jornada", finalizado_en: null },
        despues: {
          usuario_id: "u-1",
          tipo: "jornada",
          finalizado_en: "2026-11-10T18:00:00Z",
        },
        creado_en: "2026-11-10T10:00:00Z",
      },
      {
        id: 14,
        empresa_id: "org-1",
        usuario_id: "u-1",
        accion: "crear",
        tabla: "casos_soporte",
        despues: { usuario_id: "u-1", correo_contacto: "soporte@vittkly.test" },
        creado_en: "2026-11-10T10:00:00Z",
      },
      {
        id: 15,
        empresa_id: "org-1",
        usuario_id: "u-1",
        accion: "crear",
        tabla: "cuentas",
        despues: { nombre: "Cuenta Corporativa" },
        creado_en: "2026-11-10T10:00:00Z",
      },
      {
        id: 16,
        empresa_id: "org-1",
        usuario_id: "u-1",
        accion: "editar",
        tabla: "suscripciones",
        antes: { estado: "activa" },
        despues: { estado: "suspendida", periodo: "mensual" },
        creado_en: "2026-11-10T10:00:00Z",
      },
      {
        id: 17,
        empresa_id: "org-1",
        usuario_id: "u-1",
        accion: "editar",
        tabla: "usuarios",
        antes: { cargo: "Técnico" },
        despues: { nombre: "Mateo Paredes", cargo: "Supervisor" },
        creado_en: "2026-11-10T10:00:00Z",
      },
      {
        id: 18,
        empresa_id: null,
        usuario_id: "u-1",
        accion: "editar",
        tabla: "verificaciones",
        antes: {
          canal: "correo",
          destino: "mateo@vittkly.test",
          verificado_en: null,
        },
        despues: {
          canal: "correo",
          destino: "mateo@vittkly.test",
          verificado_en: "2026-11-10T10:00:00Z",
        },
        creado_en: "2026-11-10T10:00:00Z",
      },
      {
        id: 19,
        empresa_id: null,
        usuario_id: null,
        accion: "crear",
        tabla: "planes",
        despues: { nombre: "Empresa" },
        creado_en: "2026-11-10T10:00:00Z",
      },
      {
        id: 20,
        empresa_id: null,
        usuario_id: null,
        accion: "crear",
        tabla: "modulos",
        despues: { nombre: "Trabajos" },
        creado_en: "2026-11-10T10:00:00Z",
      },
      {
        id: 21,
        empresa_id: null,
        usuario_id: null,
        accion: "crear",
        tabla: "plan_modulos",
        despues: { modulo_codigo: "trabajos" },
        creado_en: "2026-11-10T10:00:00Z",
      },
      {
        id: 22,
        empresa_id: null,
        usuario_id: null,
        accion: "crear",
        tabla: "permisos",
        despues: { codigo: "auditoria.ver" },
        creado_en: "2026-11-10T10:00:00Z",
      },
      {
        id: 23,
        empresa_id: null,
        usuario_id: null,
        accion: "crear",
        tabla: "staff_plataforma",
        despues: { rol: "soporte_n1" },
        creado_en: "2026-11-10T10:00:00Z",
      },
    ];

    expect(legacyFixtures).toHaveLength(23);

    for (const raw of legacyFixtures) {
      const entry = formatAuditLogEntry(raw, context);
      expect(entry.resumen.trim().length).toBeGreaterThan(8);
      expect(entry.resumen).not.toMatch(
        /\[object Object\]|\bundefined\b|\bnull\b/,
      );
      expect(entry.origenLabel).not.toContain("_");
      for (const chip of entry.cambios) {
        expect(chip).not.toContain("[object Object]");
        expect(chip).not.toContain("actualizado_en");
      }
    }

    // Validar empresa_configuracion: ignora version y resume objeto sin [object Object]
    const cfgEntry = formatAuditLogEntry(legacyFixtures[6], context);
    expect(cfgEntry.cambios).toEqual(["Ajustes: actualizado"]);

    // Validar inferencias de tipoEvento clave
    expect(inferAuditTipoEvento(legacyFixtures[0])).toBe("suspender");
    expect(inferAuditTipoEvento(legacyFixtures[1])).toBe("invitar");
    expect(inferAuditTipoEvento(legacyFixtures[4])).toBe("aprobar");
    expect(inferAuditTipoEvento(legacyFixtures[7])).toBe("suspender");
    expect(inferAuditTipoEvento(legacyFixtures[8])).toBe("aprobar");
    expect(inferAuditTipoEvento(legacyFixtures[10])).toBe("reactivar");
    expect(inferAuditTipoEvento(legacyFixtures[15])).toBe("suspender");
    expect(inferAuditTipoEvento(legacyFixtures[17])).toBe("acceso");

    // Validar que UUID en entidad_nombre se reemplaza por nombre resuelto
    expect(
      resolveEntityName(
        {
          tabla: "perfiles",
          registro_id: "11111111-1111-4111-8111-111111111111",
          entidad_nombre: "11111111-1111-4111-8111-111111111111",
          despues: { nombre: "Supervisor" },
        },
        context,
      ),
    ).toBe("Supervisor");
  });
});

describe("audit-formatter — Redacción defensiva de secretos y PII", () => {
  it("redacta hashes/secretos y enmascara documentos, destinos OTP y datos de cuenta_existente", () => {
    const secretChanges = formatAuditChanges({
      accion: "editar",
      tabla: "invitaciones",
      campos_modificados: ["token_hash", "codigo_hash", "password_hash"],
      metadatos: {
        cambios: [
          {
            campo: "token_hash",
            antes: "abc-secret-1",
            despues: "xyz-secret-2",
          },
          { campo: "api_key", antes: "sk_live_111", despues: "sk_live_222" },
          { campo: "numero_documento", antes: "10203040", despues: "45678901" },
        ],
      },
      antes: {
        tipo: "cuenta_existente",
        correo: "privado@empresa.com",
        secret: "top_secret_val",
      },
      despues: {
        tipo: "cuenta_existente",
        correo: "privado@empresa.com",
        secret: "top_secret_val_2",
      },
    });

    const joined = secretChanges.join(" | ");
    expect(joined).not.toContain("abc-secret-1");
    expect(joined).not.toContain("xyz-secret-2");
    expect(joined).not.toContain("sk_live_111");
    expect(joined).not.toContain("sk_live_222");
    expect(joined).not.toContain("top_secret_val");
    expect(joined).not.toContain("10203040");
    expect(joined).not.toContain("45678901");
    expect(joined).toContain("[protegido]");
    expect(joined).toContain("1020**40");
    expect(joined).toContain("4567**01");

    const invEntry = formatAuditLogEntry({
      id: 301,
      empresa_id: "org-1",
      usuario_id: "u-admin",
      accion: "crear",
      tipo_evento: "invitar",
      origen: "invitaciones",
      actor_nombre: "Andree",
      detalle: "Envió invitación a privado@empresa.com (DNI 10203040)",
      tabla: "invitaciones",
      despues: {
        tipo: "cuenta_existente",
        nombres: "Carlos",
        apellidos: "Mateo",
        correo: "privado@empresa.com",
        numero_documento: "10203040",
        token_hash: "super_secret_hash",
      },
      creado_en: "2026-11-17T10:00:00Z",
    });

    expect(invEntry.entidadNombre).toBe("Ca**** Ma****");
    expect(invEntry.resumen).not.toContain("privado@empresa.com");
    expect(invEntry.resumen).not.toContain("10203040");
    expect(invEntry.resumen).not.toContain("super_secret_hash");
    expect(invEntry.resumen).toContain("pr****@empresa.com");

    const otpEntry = formatAuditLogEntry({
      id: 302,
      empresa_id: null,
      usuario_id: "u-1",
      accion: "crear",
      tabla: "verificaciones",
      despues: { canal: "correo", destino: "tecnico@vittkly.test" },
      creado_en: "2026-11-17T10:00:00Z",
    });
    expect(otpEntry.entidadNombre).not.toContain("tecnico@vittkly.test");
    expect(otpEntry.entidadNombre).toContain("te****@vittkly.test");
  });

  it("enmascara teléfonos en snapshot entidad_nombre y destino de verificaciones, y PII mixta en detalle de cuenta_existente", () => {
    const whatsappCompact = formatAuditLogEntry({
      id: 901,
      empresa_id: null,
      usuario_id: "u-1",
      accion: "crear",
      tipo_evento: "solicitar",
      tabla: "verificaciones",
      entidad_nombre: "whatsapp · +51987654321",
      detalle: "Solicitó verificación por whatsapp a +51987654321",
      despues: { canal: "whatsapp", destino: "+51987654321" },
      creado_en: "2026-11-17T10:00:00Z",
    });
    expect(whatsappCompact.entidadNombre).toBe("whatsapp · 987****21");
    expect(whatsappCompact.entidadNombre).not.toContain("987654321");
    expect(whatsappCompact.resumen).toBe(
      "Solicitó verificación por whatsapp a 987****21",
    );
    expect(whatsappCompact.resumen).not.toContain("987654321");

    const whatsappSpaced = formatAuditLogEntry({
      id: 902,
      empresa_id: null,
      usuario_id: "u-1",
      accion: "crear",
      tipo_evento: "solicitar",
      tabla: "verificaciones",
      entidad_nombre: "whatsapp · +51 987 654 321",
      detalle: "Solicitó código a +51 987 654 321",
      despues: { canal: "whatsapp", destino: "+51987654321" },
      creado_en: "2026-11-17T10:00:00Z",
    });
    expect(whatsappSpaced.entidadNombre).toBe("whatsapp · 987****21");
    expect(whatsappSpaced.resumen).toBe("Solicitó código a 987****21");

    const verifEmailDetalle = formatAuditLogEntry({
      id: 903,
      empresa_id: null,
      usuario_id: "u-1",
      accion: "editar",
      tipo_evento: "acceso",
      tabla: "verificaciones",
      entidad_nombre: "correo · TECNICO@VITTKLY.TEST",
      detalle: "Verificó correo TECNICO@VITTKLY.TEST exitosamente",
      despues: {
        canal: "correo",
        destino: "tecnico@vittkly.test",
        verificado_en: "2026-11-17T10:05:00Z",
      },
      creado_en: "2026-11-17T10:05:00Z",
    });
    expect(verifEmailDetalle.entidadNombre).toBe(
      "correo · te****@vittkly.test",
    );
    expect(verifEmailDetalle.resumen).toBe(
      "Verificó correo te****@vittkly.test exitosamente",
    );

    const existingAccDetalle = formatAuditLogEntry({
      id: 904,
      empresa_id: "org-1",
      usuario_id: "u-admin",
      accion: "crear",
      tipo_evento: "invitar",
      origen: "invitaciones",
      entidad_nombre: "Carlos Mateo",
      detalle:
        "Invitó a Carlos Mateo (PRIVADO@EMPRESA.COM, +51987654321, DNI 10203040)",
      tabla: "invitaciones",
      despues: {
        tipo: "cuenta_existente",
        nombres: "Carlos",
        apellidos: "Mateo",
        correo: "privado@empresa.com",
        celular: "+51987654321",
        numero_documento: "10203040",
      },
      creado_en: "2026-11-17T10:00:00Z",
    });
    expect(existingAccDetalle.entidadNombre).toBe("Ca**** Ma****");
    expect(existingAccDetalle.resumen).toBe(
      "Invitó a Ca**** Ma**** (pr****@empresa.com, 987****21, DNI 1020**40)",
    );
    expect(existingAccDetalle.resumen).not.toContain("PRIVADO@EMPRESA.COM");
    expect(existingAccDetalle.resumen).not.toContain("987654321");
    expect(existingAccDetalle.resumen).not.toContain("Carlos");
    expect(existingAccDetalle.resumen).not.toContain("Mateo");
    expect(existingAccDetalle.resumen).not.toContain("10203040");

    const extraSecrets = formatAuditChanges({
      accion: "editar",
      tabla: "cuentas",
      metadatos: {
        cambios: [
          { campo: "apikey", antes: "k1", despues: "k2" },
          { campo: "contrasena", antes: "clave1", despues: "clave2" },
          { campo: "passcode", antes: "1111", despues: "2222" },
        ],
      },
    });
    const secretsJoined = extraSecrets.join(" | ");
    expect(secretsJoined).not.toContain("clave1");
    expect(secretsJoined).not.toContain("clave2");
    expect(secretsJoined).not.toContain("k1");
    expect(secretsJoined).not.toContain("k2");
    expect(secretsJoined).not.toContain("2222");
    expect(secretsJoined).toContain("[protegido]");

    const trailingDotGeneric = formatAuditLogEntry({
      id: 905,
      empresa_id: null,
      usuario_id: null,
      accion: "crear",
      tabla: "staff_plataforma",
      entidad_nombre: "Ana Ruiz",
      detalle: "Creó registro en staff_plataforma.",
      creado_en: "2026-11-17T10:00:00Z",
    });
    expect(trailingDotGeneric.resumen).not.toContain("staff_plataforma");
    expect(trailingDotGeneric.resumen).toBe(
      "Incorporó a «Ana Ruiz» al equipo de plataforma",
    );
  });
});

describe("audit-formatter — filterAuditLogEntries y búsqueda combinada (R4)", () => {
  const NOW = new Date("2026-11-17T12:00:00Z");
  const hAgo = (hours: number) =>
    new Date(NOW.getTime() - hours * 3_600_000).toISOString();

  const sampleEntries: AuditLogEntry[] = [
    {
      id: 1,
      accion: "editar",
      tipoEvento: "editar",
      tabla: "ordenes_trabajo",
      origen: "operaciones_ordenes",
      origenLabel: "Órdenes de trabajo",
      registroId: "ot-2041",
      entidadNombre: "OT-2041 · Fumigación",
      actorId: "u-ines",
      actorNombre: "Inés Quispe",
      actorCorreo: "operador@vittkly.test",
      resumen: "Actualizó orden de trabajo OT-2041",
      cambios: ["Estado: en curso → completada"],
      creadoEn: hAgo(2),
    },
    {
      id: 2,
      accion: "editar",
      tipoEvento: "desvincular",
      tabla: "membresias",
      origen: "equipo_accesos",
      origenLabel: "Equipo y accesos",
      registroId: "mem-mateo",
      entidadNombre: "Mateo Paredes",
      actorId: "u-admin",
      actorNombre: "Andree Valencia",
      actorCorreo: "admin@vittkly.test",
      resumen: "Desvinculó a Mateo Paredes",
      cambios: ["Perfil: Técnico de campo"],
      creadoEn: hAgo(23.83), // 23h50m -> dentro de 1d
    },
    {
      id: 3,
      accion: "crear",
      tipoEvento: "crear",
      tabla: "evidencias_orden",
      origen: "operaciones_ordenes",
      origenLabel: "Órdenes de trabajo",
      registroId: "ev-1",
      entidadNombre: "OT-2038 · foto",
      actorId: "u-mateo",
      actorNombre: "Mateo Paredes",
      actorCorreo: "mateo@vittkly.test",
      resumen: "Adjuntó evidencia en orden OT-2038",
      cambios: [],
      creadoEn: hAgo(24.16), // 24h10m -> fuera de 1d, dentro de 7d
    },
    {
      id: 4,
      accion: "editar",
      tipoEvento: "vencer",
      tabla: "invitaciones",
      origen: "invitaciones",
      origenLabel: "Invitaciones",
      registroId: "inv-exp",
      entidadNombre: "Sofía Ramírez",
      actorId: null,
      actorNombre: "Sistema",
      actorCorreo: null,
      resumen: "Venció invitación automática",
      cambios: ["Estado: pendiente → vencida"],
      creadoEn: hAgo(24 * 6 + 23), // 6d23h -> dentro de 7d
    },
    {
      id: 5,
      accion: "crear",
      tipoEvento: "solicitar",
      tabla: "solicitudes_salida",
      origen: "solicitudes_salida",
      origenLabel: "Solicitudes de salida",
      registroId: "exit-1",
      entidadNombre: "Mateo Paredes",
      actorId: "u-mateo",
      actorNombre: "Mateo Paredes",
      actorCorreo: "mateo@vittkly.test",
      resumen: "Mateo Paredes solicitó su salida",
      cambios: [],
      creadoEn: hAgo(24 * 7 + 1), // 7d01h -> fuera de 7d, dentro de 15d
    },
    {
      id: 6,
      accion: "crear",
      tipoEvento: "crear",
      tabla: "perfiles",
      origen: "perfiles_permisos",
      origenLabel: "Perfiles y permisos",
      registroId: "prof-45d",
      entidadNombre: "Técnico de campo",
      actorId: "u-admin",
      actorNombre: "Andree Valencia",
      actorCorreo: "admin@vittkly.test",
      resumen: "Creó perfil histórico 45d",
      cambios: [],
      creadoEn: hAgo(24 * 45), // fuera de 30d, visible en all
    },
  ];

  it("filtra exactamente por rangos de tiempo (1d, 7d, 15d, 30d, all)", () => {
    expect(
      filterAuditLogEntries(sampleEntries, { timeRange: "1d" }, NOW).map(
        (e) => e.id,
      ),
    ).toEqual([1, 2]);
    expect(
      filterAuditLogEntries(sampleEntries, { timeRange: "7d" }, NOW).map(
        (e) => e.id,
      ),
    ).toEqual([1, 2, 3, 4]);
    expect(
      filterAuditLogEntries(sampleEntries, { timeRange: "15d" }, NOW).map(
        (e) => e.id,
      ),
    ).toEqual([1, 2, 3, 4, 5]);
    expect(
      filterAuditLogEntries(sampleEntries, { timeRange: "30d" }, NOW).map(
        (e) => e.id,
      ),
    ).toEqual([1, 2, 3, 4, 5]);
    expect(
      filterAuditLogEntries(sampleEntries, { timeRange: "all" }, NOW).map(
        (e) => e.id,
      ),
    ).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("filtra por actorId (incluyendo __sistema__), origen y combinación simultánea", () => {
    expect(
      filterAuditLogEntries(
        sampleEntries,
        { actorId: SYSTEM_AUDIT_ACTOR_ID, timeRange: "all" },
        NOW,
      ).map((e) => e.id),
    ).toEqual([4]);

    expect(
      filterAuditLogEntries(
        sampleEntries,
        {
          actorId: "u-ines",
          origen: "operaciones_ordenes",
          timeRange: "1d",
          search: "fumigacion completada",
        },
        NOW,
      ).map((e) => e.id),
    ).toEqual([1]);

    // Limpiar filtros restaura todos
    expect(
      filterAuditLogEntries(sampleEntries, { timeRange: "all" }, NOW),
    ).toHaveLength(6);
  });

  it("busca sin distinguir tildes ni mayúsculas en los 8 campos e ignora payloads hostiles", () => {
    // actorNombre, actorCorreo, origenLabel, entidadNombre, registroId, resumen, actionLabel, cambios
    expect(matchesAuditSearch(sampleEntries[0], "INES")).toBe(true);
    expect(matchesAuditSearch(sampleEntries[0], "operador@vittkly")).toBe(true);
    expect(matchesAuditSearch(sampleEntries[0], "ordenes de trabajo")).toBe(
      true,
    );
    expect(matchesAuditSearch(sampleEntries[0], "fumigacion")).toBe(true);
    expect(matchesAuditSearch(sampleEntries[0], "ot-2041")).toBe(true);
    expect(matchesAuditSearch(sampleEntries[0], "actualizo")).toBe(true);
    expect(matchesAuditSearch(sampleEntries[0], "edicion")).toBe(true);
    expect(matchesAuditSearch(sampleEntries[0], "completada")).toBe(true);
    expect(matchesAuditSearch(sampleEntries[1], "tecnico")).toBe(true);

    // Caracteres especiales literales no hacen match universal como SQL LIKE
    expect(matchesAuditSearch(sampleEntries[0], "%")).toBe(false);
    expect(matchesAuditSearch(sampleEntries[0], "_")).toBe(false);
    expect(
      matchesAuditSearch(sampleEntries[0], "<script>alert(1)</script>"),
    ).toBe(false);
  });
});
