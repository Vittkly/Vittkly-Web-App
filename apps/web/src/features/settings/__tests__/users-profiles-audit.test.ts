import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockResolveActiveOrganization,
  mockCreateClient,
  mockRevalidatePath,
  mockAuthGetUser,
} = vi.hoisted(() => ({
  mockResolveActiveOrganization: vi.fn(),
  mockCreateClient: vi.fn(),
  mockRevalidatePath: vi.fn(),
  mockAuthGetUser: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
  };
});
vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));
vi.mock("@/features/tenants/services/tenants.service", () => ({
  resolveActiveOrganization: () => mockResolveActiveOrganization(),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: () => mockCreateClient(),
}));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

import {
  DEFAULT_AUDIT_PAGE_SIZE,
  getUsersProfilesBundle,
  queryAuditLogs,
} from "../services/users-profiles.repository";
import { queryAuditLogsAction } from "../actions/users-profiles.actions";
import { SYSTEM_AUDIT_ACTOR_ID } from "../types/settings.types";

const ORG_ID = "22222222-2222-4222-8222-222222222222";
const USER_ADMIN = "11111111-1111-4111-8111-111111111111";
const USER_EX_MEMBER = "33333333-3333-4333-8333-333333333333";
const USER_OPERATOR = "44444444-4444-4444-8444-444444444444";
const PERFIL_ADMIN = "55555555-5555-4555-8555-555555555555";
const PERFIL_OPERADOR = "66666666-6666-4666-8666-666666666666";

type TableRow = Record<string, unknown>;

interface MockDbTables {
  empresas: TableRow[];
  suscripciones: TableRow[];
  plan_modulos: TableRow[];
  perfiles: TableRow[];
  perfil_permisos: TableRow[];
  membresias: TableRow[];
  invitaciones: TableRow[];
  solicitudes_salida: TableRow[];
  auditoria: TableRow[];
}

function splitTopLevelMock(input: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of input) {
    if (ch === "(") depth++;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === "," && depth === 0) {
      if (current.trim()) parts.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function evaluateLogicalFilterMock(row: TableRow, expr: string): boolean {
  const trimmed = expr.trim();
  if (trimmed.startsWith("or(") && trimmed.endsWith(")")) {
    return splitTopLevelMock(trimmed.slice(3, -1)).some((p) =>
      evaluateLogicalFilterMock(row, p),
    );
  }
  if (trimmed.startsWith("and(") && trimmed.endsWith(")")) {
    return splitTopLevelMock(trimmed.slice(4, -1)).every((p) =>
      evaluateLogicalFilterMock(row, p),
    );
  }
  const dotIdx = trimmed.indexOf(".");
  if (dotIdx === -1) return true;
  const col = trimmed.slice(0, dotIdx);
  const rest = trimmed.slice(dotIdx + 1);
  if (rest === "is.null") {
    return (row[col] ?? null) === null;
  }
  if (rest.startsWith("in.(") && rest.endsWith(")")) {
    const items = splitTopLevelMock(rest.slice(4, -1)).map((s) =>
      s.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1"),
    );
    return items.includes(String(row[col] ?? ""));
  }
  if (rest.startsWith("eq.")) {
    return String(row[col] ?? "") === rest.slice(3);
  }
  return true;
}

function createQueryableSupabaseMock(
  tables: MockDbTables,
  options?: {
    directorioRpcRows?: Array<{ usuario_id: string; nombre: string }> | null;
    rpcError?: { message: string } | null;
    disableRpc?: boolean;
    auditoriaError?: { message: string; code?: string } | null;
    onAuditQuery?: (ops: Array<{ method: string; args: unknown[] }>) => void;
  },
) {
  const client: Record<string, unknown> = {
    auth: {
      getUser: () => mockAuthGetUser(),
    },
    from: (tableName: keyof MockDbTables) => {
      const ops: Array<{ method: string; args: unknown[] }> = [];
      let selectOptions: { count?: string; head?: boolean } | undefined;
      let wantSingle = false;

      const execute = () => {
        if (tableName === "auditoria" && options?.onAuditQuery) {
          options.onAuditQuery(ops);
        }

        if (tableName === "auditoria" && options?.auditoriaError) {
          return {
            data: null,
            error: options.auditoriaError,
            count: null,
          };
        }

        let rows = [...(tables[tableName] ?? [])];

        for (const op of ops) {
          if (op.method === "eq") {
            const [col, val] = op.args as [string, unknown];
            rows = rows.filter((r) => r[col] === val);
          } else if (op.method === "neq") {
            const [col, val] = op.args as [string, unknown];
            rows = rows.filter((r) => r[col] !== val);
          } else if (op.method === "is") {
            const [col, val] = op.args as [string, unknown];
            rows = rows.filter((r) => (r[col] ?? null) === val);
          } else if (op.method === "in") {
            const [col, values] = op.args as [string, unknown[]];
            rows = rows.filter((r) => values.includes(r[col]));
          } else if (op.method === "or") {
            const [expr] = op.args as [string];
            const parts = splitTopLevelMock(expr);
            rows = rows.filter((r) =>
              parts.some((p) => evaluateLogicalFilterMock(r, p)),
            );
          } else if (op.method === "gte") {
            const [col, val] = op.args as [string, string];
            rows = rows.filter(
              (r) => typeof r[col] === "string" && String(r[col]) >= val,
            );
          } else if (op.method === "order") {
            const [col, cfg] = op.args as [
              string,
              { ascending?: boolean } | undefined,
            ];
            const asc = cfg?.ascending ?? true;
            rows.sort((a, b) => {
              const av = String(a[col] ?? "");
              const bv = String(b[col] ?? "");
              return asc ? av.localeCompare(bv) : bv.localeCompare(av);
            });
          }
        }

        const totalCount = rows.length;

        for (const op of ops) {
          if (op.method === "limit") {
            const [n] = op.args as [number];
            rows = rows.slice(0, n);
          } else if (op.method === "range") {
            const [from, to] = op.args as [number, number];
            rows = rows.slice(from, to + 1);
          }
        }

        if (wantSingle) {
          return {
            data: rows[0] ?? null,
            error: null,
            count: selectOptions?.count === "exact" ? totalCount : null,
          };
        }

        return {
          data: rows,
          error: null,
          count: selectOptions?.count === "exact" ? totalCount : null,
        };
      };

      const builder: Record<string, unknown> = {
        select: (_cols?: string, opts?: { count?: string; head?: boolean }) => {
          selectOptions = opts;
          return builder;
        },
        eq: (...args: unknown[]) => {
          ops.push({ method: "eq", args });
          return builder;
        },
        neq: (...args: unknown[]) => {
          ops.push({ method: "neq", args });
          return builder;
        },
        is: (...args: unknown[]) => {
          ops.push({ method: "is", args });
          return builder;
        },
        in: (...args: unknown[]) => {
          ops.push({ method: "in", args });
          return builder;
        },
        or: (...args: unknown[]) => {
          ops.push({ method: "or", args });
          return builder;
        },
        gte: (...args: unknown[]) => {
          ops.push({ method: "gte", args });
          return builder;
        },
        order: (...args: unknown[]) => {
          ops.push({ method: "order", args });
          return builder;
        },
        limit: (...args: unknown[]) => {
          ops.push({ method: "limit", args });
          return builder;
        },
        range: (...args: unknown[]) => {
          ops.push({ method: "range", args });
          return builder;
        },
        maybeSingle: () => {
          wantSingle = true;
          return Promise.resolve(execute());
        },
        then: (
          resolve: (value: unknown) => unknown,
          reject?: (reason: unknown) => unknown,
        ) => Promise.resolve(execute()).then(resolve, reject),
      };

      return builder;
    },
  };

  if (!options?.disableRpc) {
    client.rpc = vi.fn(async (name: string) => {
      if (name === "directorio_empresa") {
        if (options?.rpcError) {
          return { data: null, error: options.rpcError };
        }
        return { data: options?.directorioRpcRows ?? null, error: null };
      }
      return { data: null, error: null };
    });
  }

  return client;
}

function buildBaseTables(auditRows: TableRow[]): MockDbTables {
  return {
    empresas: [
      {
        id: ORG_ID,
        cuenta_id: "cuenta-1",
        nombre_comercial: "Vitta Kleanly",
        razon_social: "Vitta Kleanly SAC",
      },
    ],
    suscripciones: [
      {
        cuenta_id: "cuenta-1",
        plan_id: "plan-emp",
        planes: { codigo: "empresa" },
        creado_en: "2026-01-01T00:00:00Z",
      },
    ],
    plan_modulos: [{ plan_id: "plan-emp", modulo_codigo: "trabajos" }],
    perfiles: [
      {
        id: PERFIL_ADMIN,
        empresa_id: ORG_ID,
        codigo: "admin",
        nombre: "Administrador",
        descripcion: "Admin",
        recomendado_para: "Dueños",
        configuracion: null,
        es_base: true,
      },
      {
        id: PERFIL_OPERADOR,
        empresa_id: ORG_ID,
        codigo: "operador",
        nombre: "Técnico de campo",
        descripcion: "Campo",
        recomendado_para: "Técnicos",
        configuracion: null,
        es_base: false,
      },
    ],
    perfil_permisos: [
      {
        perfil_id: PERFIL_OPERADOR,
        permiso_codigo: "auditoria.ver",
        alcance: "todas",
      },
    ],
    membresias: [
      {
        id: "mem-admin",
        empresa_id: ORG_ID,
        usuario_id: USER_ADMIN,
        perfil_id: PERFIL_ADMIN,
        es_propietario: true,
        acceso_web: true,
        acceso_app: true,
        cargo: "Gerente",
        estado: "activa",
        activo: true,
        creado_en: "2026-01-01T00:00:00Z",
        usuarios: {
          id: USER_ADMIN,
          nombre: "Andree Valencia",
          nombres: "Andree",
          apellidos: "Valencia",
          correo: "admin@vittkly.test",
        },
        perfiles: {
          id: PERFIL_ADMIN,
          nombre: "Administrador",
          codigo: "admin",
          es_base: true,
        },
      },
      {
        id: "mem-ex",
        empresa_id: ORG_ID,
        usuario_id: USER_EX_MEMBER,
        perfil_id: PERFIL_OPERADOR,
        es_propietario: false,
        acceso_web: false,
        acceso_app: true,
        cargo: "Técnico",
        estado: "desvinculada",
        activo: false,
        creado_en: "2026-02-01T00:00:00Z",
        // Simula RLS de Postgres: usuarios retorna null para membresía desvinculada
        usuarios: null,
        perfiles: {
          id: PERFIL_OPERADOR,
          nombre: "Técnico de campo",
          codigo: "operador",
          es_base: false,
        },
      },
    ],
    invitaciones: [],
    solicitudes_salida: [
      {
        id: "exit-1",
        empresa_id: ORG_ID,
        membresia_id: "mem-ex",
        usuario_id: USER_EX_MEMBER,
        motivo: "Traslado",
        estado: "aprobada",
        comentario_resolucion: null,
        servicios_futuros: 0,
        creado_en: "2026-11-10T00:00:00Z",
        resuelto_en: "2026-11-11T00:00:00Z",
      },
    ],
    auditoria: auditRows,
  };
}

describe("users-profiles.repository & actions — Auditoría M2", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthGetUser.mockResolvedValue({
      data: { user: { id: USER_ADMIN, email: "admin@vittkly.test" } },
    });
    mockResolveActiveOrganization.mockResolvedValue({
      userId: USER_ADMIN,
      active: {
        id: ORG_ID,
        name: "Vitta Kleanly",
        roleName: "Administrador",
        isOwner: true,
      },
    });
  });

  it("resuelve miembros desvinculados (sin incluirlos en members), prioriza actor_nombre y elimina el límite fijo de 60", async () => {
    const nowMs = Date.now();
    const seventyFiveRows: TableRow[] = Array.from({ length: 75 }, (_, idx) => {
      const id = 1000 + idx;
      const isEx = idx === 0;
      const isSystem = idx === 1;
      const isUnlinked = idx === 2;
      return {
        id,
        empresa_id: ORG_ID,
        usuario_id: isEx
          ? USER_EX_MEMBER
          : isSystem
            ? null
            : isUnlinked
              ? "77777777-7777-4777-8777-777777777777"
              : USER_ADMIN,
        accion: "editar",
        tipo_evento: isEx ? "editar" : isSystem ? "vencer" : "editar",
        origen: isEx ? "operaciones_ordenes" : "equipo_accesos",
        actor_nombre: isUnlinked
          ? "Lucía Fernández"
          : isSystem
            ? "Sistema"
            : isEx
              ? null // fuerza resolución vía directorio_empresa / membresías
              : "Andree Valencia",
        actor_correo: isUnlinked ? "lucia@vittkly.test" : null,
        entidad_nombre: `OT-${id}`,
        campos_modificados: ["estado"],
        detalle: `Actualizó registro ${id}`,
        metadatos: {
          cambios: [
            { campo: "estado", antes: "pendiente", despues: "completada" },
          ],
        },
        tabla: isEx ? "evidencias_orden" : "membresias",
        registro_id: `reg-${id}`,
        creado_en: new Date(nowMs - idx * 60_000).toISOString(),
      };
    });

    const tables = buildBaseTables(seventyFiveRows);
    const mockClient = createQueryableSupabaseMock(tables, {
      directorioRpcRows: [
        { usuario_id: USER_EX_MEMBER, nombre: "Mateo Paredes" },
        { usuario_id: USER_ADMIN, nombre: "Andree Valencia" },
      ],
    });
    mockCreateClient.mockResolvedValue(mockClient);

    const bundle = await getUsersProfilesBundle(ORG_ID);

    // Ex-miembro desvinculado permanece excluido de la tabla activa de personas
    expect(bundle.members.map((m) => m.userId)).toEqual([USER_ADMIN]);
    // Pero su nombre real se resuelve en solicitudes de salida y auditoría
    expect(bundle.exitRequests[0]?.fullName).toBe("Mateo Paredes");
    expect(bundle.auditLogs[0]?.actorNombre).toBe("Mateo Paredes");
    expect(bundle.auditLogs[1]?.actorNombre).toBe("Sistema");
    expect(bundle.auditLogs[1]?.actorId).toBeNull();
    expect(bundle.auditLogs[2]?.actorNombre).toBe("Lucía Fernández");

    // Paginación exacta > 60
    expect(bundle.auditLogs).toHaveLength(DEFAULT_AUDIT_PAGE_SIZE);
    expect(bundle.auditTotalCount).toBe(75);
    expect(bundle.auditHasMore).toBe(true);
    expect(bundle.auditActors?.length).toBeGreaterThanOrEqual(4);
    expect(bundle.auditOrigins?.map((o) => o.value)).toEqual(
      expect.arrayContaining(["equipo_accesos", "operaciones_ordenes"]),
    );
  });

  it("queryAuditLogs aplica filtros DB estructurados, paginación y búsqueda sin tildes ni límite 60", async () => {
    const nowMs = Date.now();
    const auditRows: TableRow[] = [
      {
        id: 1,
        empresa_id: ORG_ID,
        usuario_id: USER_ADMIN,
        accion: "crear",
        tipo_evento: "crear",
        origen: "perfiles",
        actor_nombre: "Andree Valencia",
        entidad_nombre: "Técnico de campo",
        detalle: "Creó el perfil «Técnico de campo»",
        metadatos: { cambios: [] },
        tabla: "perfiles",
        registro_id: PERFIL_OPERADOR,
        creado_en: new Date(nowMs - 2 * 3_600_000).toISOString(),
      },
      {
        id: 2,
        empresa_id: ORG_ID,
        usuario_id: null,
        accion: "editar",
        tipo_evento: "vencer",
        origen: "invitaciones",
        actor_nombre: "Sistema",
        entidad_nombre: "Invitación vieja",
        detalle: "Venció la invitación",
        metadatos: { cambios: [] },
        tabla: "invitaciones",
        registro_id: "inv-1",
        creado_en: new Date(nowMs - 10 * 86_400_000).toISOString(),
      },
      ...Array.from({ length: 70 }, (_, idx) => ({
        id: 10 + idx,
        empresa_id: ORG_ID,
        usuario_id: USER_OPERATOR,
        accion: "editar",
        tipo_evento: "editar",
        origen: "operaciones_ordenes",
        actor_nombre: "Inés Quispe",
        entidad_nombre: `OT-${3000 + idx}`,
        detalle: `Actualizó orden OT-${3000 + idx}`,
        metadatos: { cambios: [] },
        tabla: "ordenes_trabajo",
        registro_id: `ot-${3000 + idx}`,
        creado_en: new Date(nowMs - (idx + 1) * 3_600_000).toISOString(),
      })),
    ];

    const recordedOps: Array<{ method: string; args: unknown[] }> = [];
    const tables = buildBaseTables(auditRows);
    mockCreateClient.mockResolvedValue(
      createQueryableSupabaseMock(tables, {
        rpcError: { message: "PGRST202" }, // Verifica tolerancia cuando RPC no existe en mock
        onAuditQuery: (ops) => recordedOps.push(...ops),
      }),
    );

    // 1. Filtro por origen + tiempo 7d + búsqueda sin tilde "tecnico"
    const searchRes = await queryAuditLogs(ORG_ID, {
      origen: "perfiles_permisos",
      timeRange: "7d",
      search: "tecnico",
      limit: 25,
      offset: 0,
    });
    expect(searchRes.entries).toHaveLength(1);
    expect(searchRes.entries[0]?.entidadNombre).toBe("Técnico de campo");
    expect(searchRes.totalCount).toBe(1);
    expect(searchRes.hasMore).toBe(false);
    expect(recordedOps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          method: "or",
          args: [
            "origen.in.(perfiles_permisos,perfiles,perfil_permisos),and(origen.is.null,tabla.in.(perfiles_permisos,perfiles,perfil_permisos))",
          ],
        }),
      ]),
    );

    // 2. Filtro por actor Sistema
    const sysRes = await queryAuditLogs(ORG_ID, {
      actorId: SYSTEM_AUDIT_ACTOR_ID,
      timeRange: "all",
    });
    expect(sysRes.entries).toHaveLength(1);
    expect(sysRes.entries[0]?.actorNombre).toBe("Sistema");

    // 3. Paginación más allá del límite 60 (offset 60, limit 25 -> 12 restantes)
    const page3 = await queryAuditLogs(ORG_ID, {
      timeRange: "all",
      limit: 25,
      offset: 60,
    });
    expect(page3.totalCount).toBe(72);
    expect(page3.entries).toHaveLength(12);
    expect(page3.hasMore).toBe(false);
  });

  it("queryAuditLogsAction exige sesión activa, valida Zod y exige propietario o auditoria.ver", async () => {
    // 1. Sin sesión activa
    mockResolveActiveOrganization.mockResolvedValueOnce({
      userId: null,
      active: null,
    });
    const noSession = await queryAuditLogsAction({ timeRange: "7d" });
    expect(noSession.success).toBe(false);
    expect(noSession.error).toContain("sesión");

    // 2. Zod inválido
    const badZod = await queryAuditLogsAction({
      actorId: "not-a-uuid",
      timeRange: "7d",
    });
    expect(badZod.success).toBe(false);
    expect(badZod.error).toContain("inválido");

    const badLimit = await queryAuditLogsAction({
      timeRange: "all",
      limit: 500,
    });
    expect(badLimit.success).toBe(false);

    // 3. No propietario sin permiso auditoria.ver -> rechazado
    mockResolveActiveOrganization.mockResolvedValueOnce({
      userId: USER_OPERATOR,
      active: {
        id: ORG_ID,
        name: "Vitta Kleanly",
        roleName: "Operador",
        isOwner: false,
      },
    });
    const deniedTables = buildBaseTables([]);
    deniedTables.membresias.push({
      id: "mem-op",
      empresa_id: ORG_ID,
      usuario_id: USER_OPERATOR,
      perfil_id: PERFIL_OPERADOR,
      es_propietario: false,
      activo: true,
      estado: "activa",
    });
    deniedTables.perfil_permisos = [
      {
        perfil_id: PERFIL_OPERADOR,
        permiso_codigo: "auditoria.ver",
        alcance: "ninguna",
      },
    ];
    mockCreateClient.mockResolvedValueOnce(
      createQueryableSupabaseMock(deniedTables),
    );
    const deniedRes = await queryAuditLogsAction({ timeRange: "all" });
    expect(deniedRes.success).toBe(false);
    expect(deniedRes.error).toContain("permisos");

    // 4. No propietario CON permiso auditoria.ver (alcance: todas) -> permitido
    mockResolveActiveOrganization.mockResolvedValueOnce({
      userId: USER_OPERATOR,
      active: {
        id: ORG_ID,
        name: "Vitta Kleanly",
        roleName: "Supervisor",
        isOwner: false,
      },
    });
    const allowedTables = buildBaseTables([
      {
        id: 99,
        empresa_id: ORG_ID,
        usuario_id: USER_ADMIN,
        accion: "crear",
        tipo_evento: "crear",
        origen: "clientes",
        actor_nombre: "Andree Valencia",
        entidad_nombre: "Clínica San Gabriel",
        detalle: "Registró al cliente «Clínica San Gabriel»",
        metadatos: { cambios: [] },
        tabla: "clientes",
        registro_id: "cli-1",
        creado_en: "2026-11-17T10:00:00Z",
      },
    ]);
    allowedTables.membresias.push({
      id: "mem-op",
      empresa_id: ORG_ID,
      usuario_id: USER_OPERATOR,
      perfil_id: PERFIL_OPERADOR,
      es_propietario: false,
      activo: true,
      estado: "activa",
    });
    mockCreateClient.mockResolvedValue(
      createQueryableSupabaseMock(allowedTables),
    );

    const allowedRes = await queryAuditLogsAction({
      timeRange: "all",
      search: "gabriel",
    });
    expect(allowedRes.success).toBe(true);
    expect(allowedRes.data?.entries).toHaveLength(1);
    expect(allowedRes.data?.entries[0]?.entidadNombre).toBe(
      "Clínica San Gabriel",
    );
  });

  it("propaga errores de BD en queryAuditLogs y queryAuditLogsAction manteniendo resiliencia del bundle", async () => {
    const tables = buildBaseTables([]);
    mockCreateClient.mockResolvedValue(
      createQueryableSupabaseMock(tables, {
        auditoriaError: {
          message: "permission denied for table auditoria",
          code: "42501",
        },
      }),
    );

    await expect(queryAuditLogs(ORG_ID, { timeRange: "all" })).rejects.toThrow(
      "permission denied for table auditoria",
    );

    const actionErr = await queryAuditLogsAction({ timeRange: "all" });
    expect(actionErr.success).toBe(false);
    expect(actionErr.error).toContain("permission denied");
    expect(actionErr.data).toBeUndefined();

    // getUsersProfilesBundle sigue cargando miembros/perfiles sin colapsar si auditoria falla
    const bundle = await getUsersProfilesBundle(ORG_ID);
    expect(bundle.members.map((m) => m.userId)).toEqual([USER_ADMIN]);
    expect(bundle.auditLogs).toEqual([]);
    expect(bundle.auditTotalCount).toBe(0);
  });

  it("resuelve actor_nombre = 'Usuario' en múltiples niveles y actualiza el filtro actors desde filas antiguas", async () => {
    const USER_UNLINKED = "77777777-7777-4777-8777-777777777777";
    const USER_UNKNOWN = "88888888-8888-4888-8888-888888888888";
    const nowMs = Date.now();

    const auditRows: TableRow[] = [
      {
        id: 1,
        empresa_id: ORG_ID,
        usuario_id: USER_EX_MEMBER,
        accion: "editar",
        tipo_evento: "editar",
        origen: "equipo_accesos",
        actor_nombre: "Usuario",
        entidad_nombre: "Acceso",
        detalle: "Actualizó acceso",
        metadatos: { cambios: [] },
        tabla: "membresias",
        creado_en: new Date(nowMs - 10_000).toISOString(),
      },
      {
        id: 2,
        empresa_id: ORG_ID,
        usuario_id: USER_ADMIN,
        accion: "editar",
        tipo_evento: "editar",
        origen: "equipo_accesos",
        actor_nombre: "Usuario",
        entidad_nombre: "Perfil",
        detalle: "Actualizó perfil",
        metadatos: { cambios: [] },
        tabla: "membresias",
        creado_en: new Date(nowMs - 20_000).toISOString(),
      },
      {
        id: 3,
        empresa_id: ORG_ID,
        usuario_id: USER_UNLINKED,
        accion: "editar",
        tipo_evento: "editar",
        origen: "clientes",
        actor_nombre: "Usuario",
        actor_correo: null,
        entidad_nombre: "Cliente A",
        detalle: "Actualizó cliente",
        metadatos: { cambios: [] },
        tabla: "clientes",
        creado_en: new Date(nowMs - 30_000).toISOString(),
      },
      {
        id: 4,
        empresa_id: ORG_ID,
        usuario_id: USER_UNLINKED,
        accion: "crear",
        tipo_evento: "crear",
        origen: "clientes",
        actor_nombre: "Lucía Real",
        actor_correo: "lucia.real@vittkly.test",
        entidad_nombre: "Cliente B",
        detalle: "Registró cliente",
        metadatos: { cambios: [] },
        tabla: "clientes",
        creado_en: new Date(nowMs - 40_000).toISOString(),
      },
      {
        id: 5,
        empresa_id: ORG_ID,
        usuario_id: USER_UNKNOWN,
        accion: "crear",
        tipo_evento: "crear",
        origen: "clientes",
        actor_nombre: "Usuario",
        entidad_nombre: "Cliente C",
        detalle: "Registró cliente C",
        metadatos: { cambios: [] },
        tabla: "clientes",
        creado_en: new Date(nowMs - 50_000).toISOString(),
      },
    ];

    // 1. Con supabase.rpc undefined y membresías sin nombre para USER_ADMIN/USER_EX_MEMBER en escenario aislado
    const tablesNoRpc = buildBaseTables(auditRows);
    mockCreateClient.mockResolvedValueOnce(
      createQueryableSupabaseMock(tablesNoRpc, { disableRpc: true }),
    );
    const bundleNoRpc = await getUsersProfilesBundle(ORG_ID);
    expect(bundleNoRpc.members).toHaveLength(1);
    expect(bundleNoRpc.auditLogs.find((e) => e.id === 2)?.actorNombre).toBe(
      "Andree Valencia",
    );
    expect(bundleNoRpc.auditLogs.find((e) => e.id === 5)?.actorNombre).toBe(
      "Usuario",
    );
    expect(
      bundleNoRpc.auditActors?.find((a) => a.id === USER_UNLINKED),
    ).toEqual({
      id: USER_UNLINKED,
      nombre: "Lucía Real",
      correo: "lucia.real@vittkly.test",
    });

    // 2. Con directorio_empresa retornando error y currentUserId sin membresía -> "Tú (Administrador)"
    const tablesErrorRpc = buildBaseTables([
      {
        id: 10,
        empresa_id: ORG_ID,
        usuario_id: USER_ADMIN,
        accion: "crear",
        tipo_evento: "crear",
        origen: "clientes",
        actor_nombre: "Usuario",
        entidad_nombre: "Cliente X",
        detalle: "Creó cliente",
        metadatos: { cambios: [] },
        tabla: "clientes",
        creado_en: new Date(nowMs - 10_000).toISOString(),
      },
      {
        id: 11,
        empresa_id: ORG_ID,
        usuario_id: USER_EX_MEMBER,
        accion: "editar",
        tipo_evento: "editar",
        origen: "clientes",
        actor_nombre: "Usuario",
        entidad_nombre: "Cliente Y",
        detalle: "Editó cliente",
        metadatos: { cambios: [] },
        tabla: "clientes",
        creado_en: new Date(nowMs - 20_000).toISOString(),
      },
    ]);
    tablesErrorRpc.membresias = [];
    mockCreateClient.mockResolvedValueOnce(
      createQueryableSupabaseMock(tablesErrorRpc, {
        rpcError: { message: "directorio_empresa unavailable" },
      }),
    );
    const bundleErrRpc = await getUsersProfilesBundle(ORG_ID);
    expect(bundleErrRpc.auditLogs.find((e) => e.id === 10)?.actorNombre).toBe(
      "Tú (Administrador)",
    );
    expect(bundleErrRpc.auditLogs.find((e) => e.id === 11)?.actorNombre).toBe(
      "Usuario",
    );

    // 3. Con directorio_empresa resolviendo actor_nombre = "Usuario" para ex-miembro
    const tablesWithRpc = buildBaseTables(auditRows);
    mockCreateClient.mockResolvedValueOnce(
      createQueryableSupabaseMock(tablesWithRpc, {
        directorioRpcRows: [
          { usuario_id: USER_EX_MEMBER, nombre: "Mateo Paredes" },
        ],
      }),
    );
    const resRpc = await queryAuditLogs(ORG_ID, { timeRange: "all" });
    expect(resRpc.entries.find((e) => e.id === 1)?.actorNombre).toBe(
      "Mateo Paredes",
    );
  });

  it("queryAuditLogs cubre paginación multi-página, clamping, comodines %, _, rangos 1d/15d/30d, actorId UUID y origen null + tabla", async () => {
    const nowMs = Date.now();
    const rows: TableRow[] = [
      // 30 filas con "fumigacion" dentro de las últimas 12 horas (1d)
      ...Array.from({ length: 30 }, (_, idx) => ({
        id: 100 + idx,
        empresa_id: ORG_ID,
        usuario_id: idx % 2 === 0 ? USER_ADMIN : USER_OPERATOR,
        accion: "editar",
        tipo_evento: "editar",
        origen: "operaciones_ordenes",
        actor_nombre: idx % 2 === 0 ? "Andree Valencia" : "Inés Quispe",
        entidad_nombre: `OT-${4000 + idx} · Fumigación`,
        detalle: `Actualizó orden OT-${4000 + idx}`,
        metadatos: { cambios: [] },
        tabla: "ordenes_trabajo",
        creado_en: new Date(nowMs - (idx + 1) * 60_000).toISOString(),
      })),
      // 5 filas hace 10 días (fuera de 1d/7d, dentro de 15d/30d)
      ...Array.from({ length: 5 }, (_, idx) => ({
        id: 200 + idx,
        empresa_id: ORG_ID,
        usuario_id: USER_OPERATOR,
        accion: "crear",
        tipo_evento: "crear",
        origen: "clientes",
        actor_nombre: "Inés Quispe",
        entidad_nombre: `Cliente ${idx}`,
        detalle: `Registró cliente ${idx}`,
        metadatos: { cambios: [] },
        tabla: "clientes",
        creado_en: new Date(
          nowMs - 10 * 86_400_000 - idx * 60_000,
        ).toISOString(),
      })),
      // 3 filas hace 20 días (fuera de 15d, dentro de 30d)
      ...Array.from({ length: 3 }, (_, idx) => ({
        id: 300 + idx,
        empresa_id: ORG_ID,
        usuario_id: USER_ADMIN,
        accion: "crear",
        tipo_evento: "crear",
        origen: null, // fila legacy sin origen
        actor_nombre: "Andree Valencia",
        entidad_nombre: `Perfil legacy ${idx}`,
        detalle: `Creó perfil legacy ${idx}`,
        metadatos: { cambios: [] },
        tabla: "perfiles",
        creado_en: new Date(
          nowMs - 20 * 86_400_000 - idx * 60_000,
        ).toISOString(),
      })),
      // 2 filas hace 45 días (fuera de 30d, dentro de all)
      ...Array.from({ length: 2 }, (_, idx) => ({
        id: 400 + idx,
        empresa_id: ORG_ID,
        usuario_id: USER_ADMIN,
        accion: "editar",
        tipo_evento: "editar",
        origen: "empresa_configuracion",
        actor_nombre: "Andree Valencia",
        entidad_nombre: "Configuración",
        detalle: "Actualizó configuración",
        metadatos: { cambios: [] },
        tabla: "empresa_configuracion",
        creado_en: new Date(
          nowMs - 45 * 86_400_000 - idx * 60_000,
        ).toISOString(),
      })),
    ];

    const tables = buildBaseTables(rows);
    mockCreateClient.mockResolvedValue(createQueryableSupabaseMock(tables));

    // Page 2 normal (total 40)
    const page2 = await queryAuditLogs(ORG_ID, {
      timeRange: "all",
      limit: 25,
      offset: 25,
    });
    expect(page2.entries).toHaveLength(15);
    expect(page2.totalCount).toBe(40);
    expect(page2.hasMore).toBe(false);

    const page1 = await queryAuditLogs(ORG_ID, {
      timeRange: "all",
      limit: 25,
      offset: 0,
    });
    expect(page1.entries).toHaveLength(25);
    expect(page1.hasMore).toBe(true);

    // Offset más allá del total
    const pastEnd = await queryAuditLogs(ORG_ID, {
      timeRange: "all",
      limit: 25,
      offset: 100,
    });
    expect(pastEnd.entries).toHaveLength(0);
    expect(pastEnd.totalCount).toBe(40);
    expect(pastEnd.hasMore).toBe(false);

    // Clamping de limit y offset
    const clampedMin = await queryAuditLogs(ORG_ID, {
      timeRange: "all",
      limit: 0,
      offset: -10,
    });
    expect(clampedMin.entries).toHaveLength(1);
    const clampedMax = await queryAuditLogs(ORG_ID, {
      timeRange: "all",
      limit: 500,
      offset: 0,
    });
    expect(clampedMax.entries).toHaveLength(40);

    // Search wildcards literales y sin coincidencias
    const wildcardPct = await queryAuditLogs(ORG_ID, {
      timeRange: "all",
      search: "%",
    });
    expect(wildcardPct.entries).toHaveLength(0);
    expect(wildcardPct.totalCount).toBe(0);

    const wildcardUnderscore = await queryAuditLogs(ORG_ID, {
      timeRange: "all",
      search: "_",
    });
    expect(wildcardUnderscore.entries).toHaveLength(0);

    const noMatch = await queryAuditLogs(ORG_ID, {
      timeRange: "all",
      search: "texto-que-no-existe-xyz",
    });
    expect(noMatch.entries).toHaveLength(0);
    expect(noMatch.totalCount).toBe(0);
    expect(noMatch.hasMore).toBe(false);

    // Búsqueda paginada multi-página (30 coincidencias de 40)
    const searchP1 = await queryAuditLogs(ORG_ID, {
      timeRange: "all",
      search: "fumigacion",
      limit: 25,
      offset: 0,
    });
    expect(searchP1.entries).toHaveLength(25);
    expect(searchP1.totalCount).toBe(30);
    expect(searchP1.hasMore).toBe(true);

    const searchP2 = await queryAuditLogs(ORG_ID, {
      timeRange: "all",
      search: "fumigacion",
      limit: 25,
      offset: 25,
    });
    expect(searchP2.entries).toHaveLength(5);
    expect(searchP2.totalCount).toBe(30);
    expect(searchP2.hasMore).toBe(false);

    // Filtro por actorId UUID (no sistema)
    const byOperator = await queryAuditLogs(ORG_ID, {
      timeRange: "all",
      actorId: USER_OPERATOR,
      limit: 50,
    });
    expect(byOperator.totalCount).toBe(20); // 15 ordenes + 5 clientes
    expect(byOperator.entries.every((e) => e.actorId === USER_OPERATOR)).toBe(
      true,
    );

    // Filtro por origen cuando origen === null y tabla === "perfiles"
    const nullOriginMatched = await queryAuditLogs(ORG_ID, {
      timeRange: "all",
      origen: "perfiles_permisos",
    });
    expect(nullOriginMatched.totalCount).toBe(3);
    expect(nullOriginMatched.entries.map((e) => e.origen)).toEqual([
      "perfiles_permisos",
      "perfiles_permisos",
      "perfiles_permisos",
    ]);

    // Rangos 1d, 15d, 30d
    const res1d = await queryAuditLogs(ORG_ID, { timeRange: "1d", limit: 100 });
    expect(res1d.totalCount).toBe(30);
    const res15d = await queryAuditLogs(ORG_ID, {
      timeRange: "15d",
      limit: 100,
    });
    expect(res15d.totalCount).toBe(35);
    const res30d = await queryAuditLogs(ORG_ID, {
      timeRange: "30d",
      limit: 100,
    });
    expect(res30d.totalCount).toBe(38);
  });

  it("queryAuditLogsAction valida matriz completa de autorización y límites Zod", async () => {
    const sampleAudit = [
      {
        id: 1,
        empresa_id: ORG_ID,
        usuario_id: null,
        accion: "editar",
        tipo_evento: "vencer",
        origen: "invitaciones",
        actor_nombre: "Sistema",
        entidad_nombre: "Invitación expirada",
        detalle: "Venció la invitación automáticamente",
        metadatos: { cambios: [] },
        tabla: "invitaciones",
        creado_en: "2026-11-17T10:00:00Z",
      },
    ];

    // 1. userId presente + active: null -> rechazado
    mockResolveActiveOrganization.mockResolvedValueOnce({
      userId: USER_ADMIN,
      active: null,
    });
    const noActiveOrg = await queryAuditLogsAction({ timeRange: "all" });
    expect(noActiveOrg.success).toBe(false);

    // 2. Propietario vía active.isOwner: true -> permitido directo
    mockResolveActiveOrganization.mockResolvedValueOnce({
      userId: USER_ADMIN,
      active: {
        id: ORG_ID,
        name: "Vitta Kleanly",
        roleName: "Administrador",
        isOwner: true,
      },
    });
    mockCreateClient.mockResolvedValueOnce(
      createQueryableSupabaseMock(buildBaseTables(sampleAudit)),
    );
    const ownerRes = await queryAuditLogsAction({
      actorId: SYSTEM_AUDIT_ACTOR_ID,
      timeRange: "all",
    });
    expect(ownerRes.success).toBe(true);
    expect(ownerRes.data?.entries).toHaveLength(1);

    // 3. Propietario vía membresias.es_propietario: true cuando active.isOwner: false
    mockResolveActiveOrganization.mockResolvedValueOnce({
      userId: USER_ADMIN,
      active: {
        id: ORG_ID,
        name: "Vitta Kleanly",
        roleName: "Administrador",
        isOwner: false,
      },
    });
    mockCreateClient.mockResolvedValueOnce(
      createQueryableSupabaseMock(buildBaseTables(sampleAudit)),
    );
    const dbOwnerRes = await queryAuditLogsAction({ timeRange: "all" });
    expect(dbOwnerRes.success).toBe(true);

    // 4. Sin fila auditoria.ver en perfil_permisos -> rechazado
    mockResolveActiveOrganization.mockResolvedValueOnce({
      userId: USER_OPERATOR,
      active: {
        id: ORG_ID,
        name: "Vitta Kleanly",
        roleName: "Operador",
        isOwner: false,
      },
    });
    const noPermTables = buildBaseTables(sampleAudit);
    noPermTables.membresias.push({
      id: "mem-op",
      empresa_id: ORG_ID,
      usuario_id: USER_OPERATOR,
      perfil_id: PERFIL_OPERADOR,
      es_propietario: false,
      activo: true,
      estado: "activa",
    });
    noPermTables.perfil_permisos = [];
    mockCreateClient.mockResolvedValueOnce(
      createQueryableSupabaseMock(noPermTables),
    );
    const missingPermRes = await queryAuditLogsAction({ timeRange: "all" });
    expect(missingPermRes.success).toBe(false);

    // 5. Sin fila en membresias -> rechazado
    mockResolveActiveOrganization.mockResolvedValueOnce({
      userId: USER_OPERATOR,
      active: {
        id: ORG_ID,
        name: "Vitta Kleanly",
        roleName: "Operador",
        isOwner: false,
      },
    });
    const noMembershipTables = buildBaseTables(sampleAudit);
    mockCreateClient.mockResolvedValueOnce(
      createQueryableSupabaseMock(noMembershipTables),
    );
    const missingMembershipRes = await queryAuditLogsAction({
      timeRange: "all",
    });
    expect(missingMembershipRes.success).toBe(false);

    // 6. No propietario con alcance: "empresa" -> permitido
    mockResolveActiveOrganization.mockResolvedValueOnce({
      userId: USER_OPERATOR,
      active: {
        id: ORG_ID,
        name: "Vitta Kleanly",
        roleName: "Supervisor",
        isOwner: false,
      },
    });
    const empresaAlcanceTables = buildBaseTables(sampleAudit);
    empresaAlcanceTables.membresias.push({
      id: "mem-op",
      empresa_id: ORG_ID,
      usuario_id: USER_OPERATOR,
      perfil_id: PERFIL_OPERADOR,
      es_propietario: false,
      activo: true,
      estado: "activa",
    });
    empresaAlcanceTables.perfil_permisos = [
      {
        perfil_id: PERFIL_OPERADOR,
        permiso_codigo: "auditoria.ver",
        alcance: "empresa",
      },
    ];
    mockCreateClient.mockResolvedValueOnce(
      createQueryableSupabaseMock(empresaAlcanceTables),
    );
    const empresaScopeRes = await queryAuditLogsAction({ timeRange: "all" });
    expect(empresaScopeRes.success).toBe(true);

    // 7. Rechazos por límites Zod
    const zodInvalidCases = [
      { timeRange: "all", limit: 0 },
      { timeRange: "all", limit: 201 },
      { timeRange: "all", offset: -1 },
      { timeRange: "all", offset: 50_001 },
      { timeRange: "90d" },
      { timeRange: "all", search: "x".repeat(201) },
      { timeRange: "all", origen: "a".repeat(65) },
    ];
    for (const badInput of zodInvalidCases) {
      const res = await queryAuditLogsAction(badInput);
      expect(res.success).toBe(false);
    }
  });
});
