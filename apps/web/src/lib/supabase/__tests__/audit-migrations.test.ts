// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import type { Database, Json } from "@vittkly/db-types";
import { describe, expect, it } from "vitest";

const BASELINE_MIGRATIONS = [
  "20261021000100_VIT-23_plataforma.sql",
  "20261021000200_VIT-25_usuarios.sql",
  "20261021000300_VIT-50_staff.sql",
  "20261021000400_VIT-24_cuenta.sql",
  "20261021000500_VIT-24_empresa.sql",
  "20261021000600_VIT-25_perfiles.sql",
  "20261021000700_VIT-26_membresias.sql",
  "20261021000800_VIT-26_politicas.sql",
  "20261021000900_VIT-34_ingreso.sql",
  "20261021001000_VIT-28_auditoria.sql",
  "20261113000100_VIT-60_accesos_empresa.sql",
  "20261113000200_VIT-60_accesos_rpcs.sql",
  "20261114000100_VIT-61_privilegios_service_role.sql",
  "20261114000200_saneamiento_usuarios.sql",
  "20261115000100_VIT-62_operaciones_campo_etapa1.sql",
  "20261115000200_VIT-63_buscar_persona_privacidad.sql",
  "20261116000100_VIT-64_procesos_modulos_19.sql",
] as const;

const VIT_65_FILENAME =
  "20261117000100_VIT-65_auditoria_detallada_triggers.sql";

const CANONICAL_TIPO_EVENTO = [
  "crear",
  "editar",
  "borrar",
  "invitar",
  "reenviar",
  "aceptar",
  "aprobar",
  "rechazar",
  "suspender",
  "reactivar",
  "anular",
  "desvincular",
  "vencer",
  "solicitar",
  "acceso",
] as const;

const CANONICAL_ORIGEN = [
  "equipo_accesos",
  "perfiles_permisos",
  "invitaciones",
  "solicitudes_salida",
  "empresa_configuracion",
  "operaciones_clientes",
  "operaciones_ordenes",
  "operaciones_formularios",
  "operaciones_tiempo",
  "soporte",
  "cuenta_suscripcion",
  "plataforma",
] as const;

const AUDITED_TABLES = [
  "planes",
  "modulos",
  "plan_modulos",
  "permisos",
  "staff_plataforma",
  "usuarios",
  "cuentas",
  "suscripciones",
  "empresas",
  "empresa_configuracion",
  "perfiles",
  "perfil_permisos",
  "membresias",
  "invitaciones",
  "solicitudes_salida",
  "casos_soporte",
  "clientes",
  "ordenes_trabajo",
  "plantillas_formulario",
  "respuestas_formulario",
  "evidencias_orden",
  "registros_tiempo",
  "verificaciones",
] as const;

const ALL_PUBLIC_TABLES = [
  ...AUDITED_TABLES,
  "intentos_ingreso",
  "auditoria",
] as const;

function findRepoRoot(): string {
  let current = process.cwd();
  for (let i = 0; i < 8; i++) {
    if (
      fs.existsSync(path.join(current, "turbo.json")) &&
      fs.existsSync(path.join(current, "supabase", "migrations"))
    ) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  throw new Error(
    "Could not locate monorepo root containing turbo.json and supabase/migrations",
  );
}

function stripSqlCommentsAndLiterals(sql: string): {
  unquotedSql: string;
  dollarDelimiterCount: number;
  parenBalance: number;
} {
  let i = 0;
  let dollarDelimiterCount = 0;
  let inDollarQuote = false;
  let inSingleQuote = false;
  let inLineComment = false;
  let inBlockComment = false;
  let parenBalance = 0;
  const out: string[] = [];

  while (i < sql.length) {
    const ch = sql[i];
    const next = sql[i + 1] ?? "";

    if (inLineComment) {
      if (ch === "\n") {
        inLineComment = false;
        out.push("\n");
      }
      i++;
      continue;
    }

    if (inBlockComment) {
      if (ch === "*" && next === "/") {
        inBlockComment = false;
        i += 2;
      } else {
        i++;
      }
      continue;
    }

    if (inSingleQuote) {
      if (ch === "'" && next === "'") {
        i += 2;
      } else if (ch === "'") {
        inSingleQuote = false;
        i++;
      } else {
        i++;
      }
      continue;
    }

    if (ch === "-" && next === "-") {
      inLineComment = true;
      i += 2;
      continue;
    }

    if (ch === "/" && next === "*") {
      inBlockComment = true;
      i += 2;
      continue;
    }

    if (ch === "$" && next === "$") {
      dollarDelimiterCount++;
      inDollarQuote = !inDollarQuote;
      out.push("$$");
      i += 2;
      continue;
    }

    if (ch === "'") {
      inSingleQuote = true;
      i++;
      continue;
    }

    if (ch === "(") parenBalance++;
    if (ch === ")") {
      parenBalance--;
      if (parenBalance < 0) {
        return {
          unquotedSql: out.join(""),
          dollarDelimiterCount,
          parenBalance,
        };
      }
    }

    if (!inDollarQuote) {
      out.push(ch);
    }
    i++;
  }

  return {
    unquotedSql: out.join(""),
    dollarDelimiterCount,
    parenBalance,
  };
}

function extractFunctionBody(sql: string, fnName: string): string {
  const escaped = fnName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `create\\s+or\\s+replace\\s+function\\s+${escaped}\\s*\\([\\s\\S]*?as\\s+\\$\\$([\\s\\S]*?)\\$\\$;`,
    "i",
  );
  const match = sql.match(pattern);
  if (!match) {
    throw new Error(`Function body not found for ${fnName}`);
  }
  return match[1];
}

function extractGuardedTableLoop(
  sql: string,
  bodyPattern: RegExp,
): { block: string; tables: Set<string> } {
  const blocks = [...sql.matchAll(/do\s+\$\$([\s\S]*?)end\s+\$\$;/gi)].map(
    (m) => m[1],
  );
  const block = blocks.find((candidate) => bodyPattern.test(candidate));
  if (!block) {
    throw new Error(`Guarded DO block not found for pattern ${bodyPattern}`);
  }
  if (
    !/to_regclass\(\s*format\(\s*'public\.%I',\s*v_tabla\s*\)\s*\)\s+is\s+not\s+null/i.test(
      block,
    )
  ) {
    throw new Error(
      `Guarded DO block misses to_regclass check: ${bodyPattern}`,
    );
  }
  const arrayMatch = block.match(
    /v_tablas\s+text\[\]\s*:=\s*array\[([\s\S]*?)\];/i,
  );
  if (!arrayMatch) {
    throw new Error(`v_tablas array not found in block: ${bodyPattern}`);
  }
  const tables = new Set(
    [...arrayMatch[1].matchAll(/'([a-z0-9_]+)'/gi)].map((m) =>
      m[1].toLowerCase(),
    ),
  );
  return { block, tables };
}

const repoRoot = findRepoRoot();
const migrationsDir = path.join(repoRoot, "supabase", "migrations");
const migrationFiles = fs
  .readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort();
const vit65Path = path.join(migrationsDir, VIT_65_FILENAME);
const vit65Sql = fs.readFileSync(vit65Path, "utf8");
const allMigrationsSql = migrationFiles
  .map((file) => fs.readFileSync(path.join(migrationsDir, file), "utf8"))
  .join("\n");
const dbTypesContent = fs.readFileSync(
  path.join(repoRoot, "packages", "db-types", "src", "database.types.ts"),
  "utf8",
);

describe("M1 Migration Hygiene & SQL Structural Sanity", () => {
  it("preserves all 17 baseline migrations and adds VIT-65 after VIT-64", () => {
    for (const baseline of BASELINE_MIGRATIONS) {
      expect(migrationFiles).toContain(baseline);
    }
    expect(migrationFiles).toContain(VIT_65_FILENAME);
    expect(migrationFiles.indexOf(VIT_65_FILENAME)).toBeGreaterThan(
      migrationFiles.indexOf("20261116000100_VIT-64_procesos_modulos_19.sql"),
    );
  });

  it("has balanced $$ dollar quotes and balanced parentheses outside strings/comments", () => {
    const analysis = stripSqlCommentsAndLiterals(vit65Sql);
    expect(analysis.dollarDelimiterCount).toBeGreaterThanOrEqual(8);
    expect(analysis.dollarDelimiterCount % 2).toBe(0);
    expect(analysis.parenBalance).toBe(0);
  });

  it("contains no destructive DDL statements", () => {
    const { unquotedSql } = stripSqlCommentsAndLiterals(vit65Sql);
    expect(unquotedSql).not.toMatch(/\bdrop\s+table\b/i);
    expect(unquotedSql).not.toMatch(/\btruncate\s+(table\s+)?public\./i);
  });

  it("declares explicit SET search_path on every function created or replaced in VIT-65", () => {
    const fnHeaders = [
      ...vit65Sql.matchAll(
        /create\s+or\s+replace\s+function\s+public\.([a-z0-9_]+)\s*\([\s\S]*?as\s+\$\$/gi,
      ),
    ];
    expect(fnHeaders.length).toBe(5);
    for (const match of fnHeaders) {
      expect(match[0]).toMatch(/set\s+search_path\s*=\s*public,\s*pg_temp/i);
    }
  });
});

describe("M1 public.auditoria Additive Schema, Constraints & Filter Indexes", () => {
  it("preserves all 9 original columns and adds the 8 semantic columns idempotently", () => {
    const vit28Sql = fs.readFileSync(
      path.join(migrationsDir, "20261021001000_VIT-28_auditoria.sql"),
      "utf8",
    );
    for (const col of [
      "id",
      "empresa_id",
      "usuario_id",
      "accion",
      "tabla",
      "registro_id",
      "antes",
      "despues",
      "creado_en",
    ]) {
      expect(vit28Sql).toMatch(new RegExp(`\\b${col}\\b`, "i"));
      expect(vit65Sql).not.toMatch(
        new RegExp(`drop\\s+column\\s+(if\\s+exists\\s+)?${col}\\b`, "i"),
      );
    }

    for (const col of [
      "tipo_evento",
      "origen",
      "actor_nombre",
      "actor_correo",
      "entidad_nombre",
      "campos_modificados",
      "detalle",
      "metadatos",
    ]) {
      expect(vit65Sql).toMatch(
        new RegExp(`add\\s+column\\s+if\\s+not\\s+exists\\s+${col}\\b`, "i"),
      );
    }
  });

  it("defines idempotent pg_constraint checks for canonical tipo_evento, origen, and metadatos", () => {
    expect(vit65Sql).toMatch(/conname\s*=\s*'auditoria_tipo_evento_check'/i);
    expect(vit65Sql).toMatch(/conname\s*=\s*'auditoria_origen_check'/i);
    expect(vit65Sql).toMatch(/conname\s*=\s*'auditoria_metadatos_obj_check'/i);
    expect(vit65Sql).toMatch(
      /check\s*\(\s*jsonb_typeof\(metadatos\)\s*=\s*'object'\s*\)/i,
    );

    for (const evento of CANONICAL_TIPO_EVENTO) {
      expect(vit65Sql).toContain(`'${evento}'`);
    }
    for (const origen of CANONICAL_ORIGEN) {
      expect(vit65Sql).toContain(`'${origen}'`);
    }
  });

  it("creates composite B-tree filter indexes, native Spanish FTS GIN index, and guarded pg_trgm index", () => {
    expect(vit65Sql).toMatch(
      /create\s+index\s+if\s+not\s+exists\s+auditoria_empresa_usuario_creado_idx\s+on\s+public\.auditoria\s*\(\s*empresa_id\s*,\s*usuario_id\s*,\s*creado_en\s+desc\s*\)/i,
    );
    expect(vit65Sql).toMatch(
      /create\s+index\s+if\s+not\s+exists\s+auditoria_empresa_origen_creado_idx\s+on\s+public\.auditoria\s*\(\s*empresa_id\s*,\s*origen\s*,\s*creado_en\s+desc\s*\)/i,
    );
    expect(vit65Sql).toMatch(
      /create\s+index\s+if\s+not\s+exists\s+auditoria_empresa_tipo_evento_creado_idx\s+on\s+public\.auditoria\s*\(\s*empresa_id\s*,\s*tipo_evento\s*,\s*creado_en\s+desc\s*\)/i,
    );
    expect(vit65Sql).toMatch(
      /create\s+index\s+if\s+not\s+exists\s+auditoria_empresa_accion_creado_idx\s+on\s+public\.auditoria\s*\(\s*empresa_id\s*,\s*accion\s*,\s*creado_en\s+desc\s*\)/i,
    );
    expect(vit65Sql).toMatch(
      /create\s+index\s+if\s+not\s+exists\s+auditoria_busqueda_fts_idx[\s\S]*using\s+gin\s*\([\s\S]*to_tsvector\(\s*'spanish'/i,
    );
    expect(vit65Sql).toMatch(/auditoria_busqueda_trgm_idx/i);
    expect(vit65Sql).toMatch(
      /when\s+insufficient_privilege\s+or\s+undefined_file\s+or\s+undefined_object\s+then/i,
    );
  });
});

describe("M1 RLS FORCE, Immutability & Select Policies", () => {
  it("re-enforces immutability on public.auditoria against all roles including service_role", () => {
    expect(vit65Sql).toMatch(
      /alter\s+table\s+public\.auditoria\s+enable\s+row\s+level\s+security/i,
    );
    expect(vit65Sql).toMatch(
      /alter\s+table\s+public\.auditoria\s+force\s+row\s+level\s+security/i,
    );
    expect(vit65Sql).toMatch(
      /revoke\s+all\s+on\s+table\s+public\.auditoria\s+from\s+public,\s*anon/i,
    );
    expect(vit65Sql).toMatch(
      /revoke\s+insert,\s*update,\s*delete,\s*truncate\s+on\s+table\s+public\.auditoria\s+from\s+public,\s*anon,\s*authenticated,\s*service_role/i,
    );
    expect(vit65Sql).toMatch(
      /grant\s+select\s+on\s+table\s+public\.auditoria\s+to\s+authenticated,\s*service_role/i,
    );
  });

  it("enables and forces RLS on all 25 public tables across the migration set", () => {
    const { block: forceRlsDoBlock, tables: dynamicForceRlsTables } =
      extractGuardedTableLoop(
        vit65Sql,
        /alter\s+table\s+public\.%I\s+force\s+row\s+level\s+security/i,
      );
    expect(forceRlsDoBlock).toMatch(
      /alter\s+table\s+public\.%I\s+enable\s+row\s+level\s+security/i,
    );

    for (const table of ALL_PUBLIC_TABLES) {
      expect(allMigrationsSql).toMatch(
        new RegExp(
          `alter\\s+table\\s+public\\.${table}\\s+enable\\s+row\\s+level\\s+security`,
          "i",
        ),
      );
      const hasStaticForce = new RegExp(
        `alter\\s+table\\s+public\\.${table}\\s+force\\s+row\\s+level\\s+security`,
        "i",
      ).test(allMigrationsSql);
      expect(hasStaticForce || dynamicForceRlsTables.has(table)).toBe(true);
    }
  });

  it('updates "ver auditoria de mi empresa" with es_propietario_empresa and tiene_permiso without permissive true policies', () => {
    expect(vit65Sql).toMatch(
      /create\s+or\s+replace\s+function\s+public\.es_propietario_empresa\(p_empresa_id\s+uuid\)[\s\S]*stable[\s\S]*security\s+definer[\s\S]*\(select\s+auth\.uid\(\)\)/i,
    );
    expect(vit65Sql).toMatch(
      /revoke\s+all\s+on\s+function\s+public\.es_propietario_empresa\(uuid\)\s+from\s+public,\s*anon/i,
    );
    expect(vit65Sql).toMatch(
      /grant\s+execute\s+on\s+function\s+public\.es_propietario_empresa\(uuid\)\s+to\s+authenticated,\s*service_role/i,
    );
    expect(vit65Sql).toMatch(
      /create\s+policy\s+"ver auditoria de mi empresa"\s+on\s+public\.auditoria\s+for\s+select\s+to\s+authenticated[\s\S]*empresa_id\s+is\s+not\s+null[\s\S]*public\.es_propietario_empresa\(empresa_id\)[\s\S]*public\.tiene_permiso\(empresa_id,\s*'auditoria\.ver'\)/i,
    );
    expect(vit65Sql).not.toMatch(/using\s*\(\s*true\s*\)/i);
    expect(vit65Sql).not.toMatch(/with\s+check\s*\(\s*true\s*\)/i);
  });
});

describe("M1 public.auditar(), Redaction, Noise Suppression & Trigger Coverage", () => {
  it("hardens public.auditar() with SECURITY DEFINER and revokes public/anon/authenticated execute", () => {
    expect(vit65Sql).toMatch(
      /create\s+or\s+replace\s+function\s+public\.auditar\(\)\s+returns\s+trigger[\s\S]*security\s+definer\s+set\s+search_path\s*=\s*public,\s*pg_temp/i,
    );
    expect(vit65Sql).toMatch(
      /revoke\s+execute\s+on\s+function\s+public\.auditar\(\)\s+from\s+public,\s*anon,\s*authenticated/i,
    );
  });

  it("uses JSONB-safe field access inside auditar() so tables lacking actualizado_por never fail", () => {
    const auditarBody = extractFunctionBody(vit65Sql, "public.auditar");
    expect(auditarBody).toMatch(/v_fila\s*->>\s*'actualizado_por'/);
    expect(auditarBody).toMatch(/v_fila\s*->>\s*'creado_por'/);
    expect(auditarBody).not.toMatch(/\b(new|old)\.actualizado_por\b/i);
    expect(auditarBody).not.toMatch(/\b(new|old)\.creado_por\b/i);
  });

  it("resolves v_emp and v_reg across tenant, join, account, and config tables", () => {
    const auditarBody = extractFunctionBody(vit65Sql, "public.auditar");
    const perfilPermisosBlockMatch = auditarBody.match(
      /if\s+tg_table_name\s*=\s*'perfil_permisos'\s+then([\s\S]*?)end\s+if;/i,
    );
    expect(perfilPermisosBlockMatch).not.toBeNull();
    const perfilPermisosBlock = perfilPermisosBlockMatch![1];
    expect(perfilPermisosBlock).toMatch(
      /select\s+[^;]*\bp\.empresa_id\b[^;]*\binto\s+[^;]*\bv_emp\b[^;]*\bfrom\s+public\.perfiles\s+p\b/i,
    );
    expect(auditarBody).toMatch(
      /if\s+tg_table_name\s*<>\s*'perfil_permisos'\s+then[\s\S]*?v_emp\s*:=/i,
    );
    expect(auditarBody).toMatch(/when\s+tg_table_name\s*=\s*'cuentas'/i);
    expect(auditarBody).toMatch(/when\s+tg_table_name\s*=\s*'suscripciones'/i);
    expect(auditarBody).toMatch(/when\s+tg_table_name\s*=\s*'usuarios'/i);
    expect(auditarBody).toMatch(
      /when\s+tg_table_name\s*=\s*'empresa_configuracion'\s+then\s+nullif\(v_fila\s*->>\s*'empresa_id',\s*''\)/i,
    );
  });

  it("resolves actor under service_role with scoped fallbacks and snapshots actor_nombre/actor_correo", () => {
    const auditarBody = extractFunctionBody(vit65Sql, "public.auditar");
    expect(auditarBody).toMatch(/auth\.uid\(\)/);
    expect(auditarBody).toMatch(/current_setting\('app\.actor_id',\s*true\)/);
    expect(auditarBody).toMatch(
      /tg_table_name\s*=\s*'invitaciones'[\s\S]*v_new\s*->>\s*'usada_por'/,
    );

    const actorSectionMatch = auditarBody.match(
      /v_actor_id\s*:=\s*coalesce\(([\s\S]*?)\);/i,
    );
    expect(actorSectionMatch).not.toBeNull();
    const actorSection = actorSectionMatch![1];
    const membresiasActorBranchMatch = actorSection.match(
      /when\s+tg_table_name\s*=\s*'membresias'([\s\S]*?)then\s+nullif\(v_new\s*->>\s*'usuario_id',\s*''\)::uuid/i,
    );
    expect(membresiasActorBranchMatch).not.toBeNull();
    const membresiasActorBranch = membresiasActorBranchMatch![1];
    expect(membresiasActorBranch).toMatch(
      /and\s*\(\s*tg_op\s*=\s*'INSERT'\s+or\s+v_old_estado\s*=\s*'desvinculada'\s*\)/i,
    );
    expect(membresiasActorBranch).toMatch(/and\s+v_new_estado\s*=\s*'activa'/i);
    expect(membresiasActorBranch).toMatch(
      /and\s+nullif\(v_new\s*->>\s*'invitacion_id',\s*''\)\s+is\s+not\s+null/i,
    );

    expect(auditarBody).toMatch(
      /into\s+v_actor_nombre,\s*v_actor_correo[\s\S]*from\s+public\.usuarios\s+u/i,
    );
    expect(auditarBody).toMatch(/'Sistema'/);
  });

  it("redacts secret hashes and masks identity documents / verification destinations", () => {
    const sanitizerBody = extractFunctionBody(
      vit65Sql,
      "public.auditoria_sanitizar_fila",
    );
    expect(sanitizerBody).toContain("'codigo_hash'");
    expect(sanitizerBody).toContain("'token_hash'");
    expect(sanitizerBody).toContain("'password_hash'");
    expect(sanitizerBody).toMatch(/public\.enmascarar_documento_identidad/);
    expect(sanitizerBody).toMatch(/public\.enmascarar_correo_identidad/);
    expect(sanitizerBody).toMatch(/public\.enmascarar_celular_identidad/);

    const auditarBody = extractFunctionBody(vit65Sql, "public.auditar");
    expect(auditarBody).toMatch(
      /public\.auditoria_sanitizar_fila\(tg_table_name,\s*v_old_raw\)/,
    );
    expect(auditarBody).toMatch(
      /public\.auditoria_sanitizar_fila\(tg_table_name,\s*v_new_raw\)/,
    );
  });

  it("suppresses no-op updates, login/navigation noise, OTP retry counters, and cascade profile permission deletes", () => {
    const auditarBody = extractFunctionBody(vit65Sql, "public.auditar");
    expect(auditarBody).toContain("'actualizado_en'");
    expect(auditarBody).toContain("'actualizado_por'");
    expect(auditarBody).toContain("'version'");
    expect(auditarBody).toContain("'ultimo_ingreso_en'");
    expect(auditarBody).toContain("'ultima_empresa_id'");
    expect(auditarBody).toContain("'intentos'");
    expect(auditarBody).toMatch(/app\.omitir_auditoria_perfil_permisos/);
    expect(auditarBody).toMatch(
      /if\s+tg_op\s*=\s*'DELETE'\s+and\s+not\s+found\s+then/i,
    );
  });

  it("replaces blind delete+insert in guardar_perfil_empresa with set-diffing and suppresses initial seed noise", () => {
    const guardarBody = extractFunctionBody(
      vit65Sql,
      "public.guardar_perfil_empresa",
    );
    expect(guardarBody).toMatch(
      /not\s*\(\s*v_desired_perms\s*\?\s*pp\.permiso_codigo\s*\)/i,
    );
    expect(guardarBody).toMatch(
      /on\s+conflict\s*\(\s*perfil_id,\s*permiso_codigo\s*\)\s*do\s+update[\s\S]*is\s+distinct\s+from\s+excluded\.alcance/i,
    );
    expect(guardarBody).toMatch(
      /set_config\('app\.omitir_auditoria_perfil_permisos',\s*'true',\s*true\)/i,
    );

    const copiarBody = extractFunctionBody(
      vit65Sql,
      "public.copiar_perfiles_base",
    );
    expect(copiarBody).toMatch(
      /set_config\('app\.omitir_auditoria_perfil_permisos',\s*'true',\s*true\)/i,
    );
  });

  it("ensures auditar triggers cover all 23 auditable tables while excluding intentos_ingreso and auditoria", () => {
    const { block: triggerDoBlock, tables: dynamicTriggerTables } =
      extractGuardedTableLoop(
        vit65Sql,
        /create\s+trigger\s+auditar\s+after\s+insert\s+or\s+update\s+or\s+delete\s+on\s+public\.%I\s+for\s+each\s+row\s+execute\s+function\s+public\.auditar\(\)/i,
      );
    expect(triggerDoBlock).toMatch(/t\.tgname\s*=\s*'auditar'/i);

    for (const table of AUDITED_TABLES) {
      expect(dynamicTriggerTables.has(table)).toBe(true);
    }
    expect(dynamicTriggerTables.has("intentos_ingreso")).toBe(false);
    expect(dynamicTriggerTables.has("auditoria")).toBe(false);
    expect(allMigrationsSql).not.toMatch(
      /create\s+trigger\s+auditar[^;]*on\s+public\.intentos_ingreso\b/i,
    );
    expect(allMigrationsSql).not.toMatch(
      /create\s+trigger\s+auditar[^;]*on\s+public\.auditoria\b/i,
    );
  });
});

describe("M1 @vittkly/db-types Parity Verification", () => {
  it("matches all 17 auditoria Row, Insert, Update fields and es_propietario_empresa RPC types at compile time", () => {
    type Equal<A, B> =
      (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
        ? true
        : false;

    type AuditoriaRow = Database["public"]["Tables"]["auditoria"]["Row"];
    type AuditoriaInsert = Database["public"]["Tables"]["auditoria"]["Insert"];
    type AuditoriaUpdate = Database["public"]["Tables"]["auditoria"]["Update"];
    type EsPropietarioFn =
      Database["public"]["Functions"]["es_propietario_empresa"];

    type ExpectedAuditoriaRow = {
      id: number;
      empresa_id: string | null;
      usuario_id: string | null;
      accion: string;
      tabla: string;
      registro_id: string | null;
      antes: Json | null;
      despues: Json | null;
      creado_en: string;
      tipo_evento: string | null;
      origen: string | null;
      actor_nombre: string | null;
      actor_correo: string | null;
      entidad_nombre: string | null;
      campos_modificados: string[];
      detalle: string | null;
      metadatos: Json;
    };

    type ExpectedAuditoriaInsert = {
      id?: never;
      empresa_id?: string | null;
      usuario_id?: string | null;
      accion: string;
      tabla: string;
      registro_id?: string | null;
      antes?: Json | null;
      despues?: Json | null;
      creado_en?: string;
      tipo_evento?: string | null;
      origen?: string | null;
      actor_nombre?: string | null;
      actor_correo?: string | null;
      entidad_nombre?: string | null;
      campos_modificados?: string[];
      detalle?: string | null;
      metadatos?: Json;
    };

    type ExpectedAuditoriaUpdate = {
      id?: never;
      empresa_id?: string | null;
      usuario_id?: string | null;
      accion?: string;
      tabla?: string;
      registro_id?: string | null;
      antes?: Json | null;
      despues?: Json | null;
      creado_en?: string;
      tipo_evento?: string | null;
      origen?: string | null;
      actor_nombre?: string | null;
      actor_correo?: string | null;
      entidad_nombre?: string | null;
      campos_modificados?: string[];
      detalle?: string | null;
      metadatos?: Json;
    };

    type ExpectedEsPropietarioFn = {
      Args: { p_empresa_id: string };
      Returns: boolean;
    };

    const exactRowParity: Equal<AuditoriaRow, ExpectedAuditoriaRow> = true;
    const exactInsertParity: Equal<AuditoriaInsert, ExpectedAuditoriaInsert> =
      true;
    const exactUpdateParity: Equal<AuditoriaUpdate, ExpectedAuditoriaUpdate> =
      true;
    const exactEsPropietarioParity: Equal<
      EsPropietarioFn,
      ExpectedEsPropietarioFn
    > = true;
    const camposNonNullParity: Equal<
      AuditoriaRow["campos_modificados"],
      string[]
    > = true;
    const metadatosNonNullParity: Equal<AuditoriaRow["metadatos"], Json> = true;

    const sampleRow = {
      id: 1,
      empresa_id: "00000000-0000-0000-0000-000000000000",
      usuario_id: "00000000-0000-0000-0000-000000000001",
      accion: "editar",
      tabla: "membresias",
      registro_id: "00000000-0000-0000-0000-000000000002",
      antes: null as Json | null,
      despues: { estado: "desactivada" } as Json,
      creado_en: "2026-11-17T00:00:00Z",
      tipo_evento: "suspender",
      origen: "equipo_accesos",
      actor_nombre: "Ana Admin",
      actor_correo: "ana@empresa.com",
      entidad_nombre: "Luis Técnico",
      campos_modificados: ["estado", "activo"],
      detalle: "Suspendió el acceso de «Luis Técnico» en la empresa",
      metadatos: {
        cambios: [{ campo: "estado", antes: "activa", despues: "desactivada" }],
      } as Json,
    } satisfies AuditoriaRow;

    const nullRow = {
      id: 2,
      empresa_id: null,
      usuario_id: null,
      accion: "crear",
      tabla: "verificaciones",
      registro_id: null,
      antes: null,
      despues: null,
      creado_en: "2026-11-17T00:00:00Z",
      tipo_evento: null,
      origen: null,
      actor_nombre: null,
      actor_correo: null,
      entidad_nombre: null,
      campos_modificados: [],
      detalle: null,
      metadatos: {},
    } satisfies AuditoriaRow;

    const sampleInsert = {
      accion: "crear",
      tabla: "perfiles",
      campos_modificados: [],
      metadatos: {},
    } satisfies AuditoriaInsert;

    const sampleUpdate = {
      tipo_evento: "editar",
      origen: "perfiles_permisos",
      detalle: "Actualizó el perfil",
    } satisfies AuditoriaUpdate;

    const fnSignatureCheck: EsPropietarioFn = {
      Args: { p_empresa_id: "00000000-0000-0000-0000-000000000000" },
      Returns: true,
    };

    expect(exactRowParity).toBe(true);
    expect(exactInsertParity).toBe(true);
    expect(exactUpdateParity).toBe(true);
    expect(exactEsPropietarioParity).toBe(true);
    expect(camposNonNullParity).toBe(true);
    expect(metadatosNonNullParity).toBe(true);
    expect(sampleRow.tipo_evento).toBe("suspender");
    expect(nullRow.tipo_evento).toBeNull();
    expect(sampleInsert.accion).toBe("crear");
    expect(sampleUpdate.origen).toBe("perfiles_permisos");
    expect(fnSignatureCheck.Returns).toBe(true);
  });

  it("declares every auditoria column with exact nullability and es_propietario_empresa in packages/db-types/src/database.types.ts", () => {
    const auditoriaBlockMatch = dbTypesContent.match(
      /auditoria:\s*\{[\s\S]*?Relationships:\s*\[\];\s*\};/,
    );
    expect(auditoriaBlockMatch).not.toBeNull();
    const auditoriaBlock = auditoriaBlockMatch![0];

    const rowBlockMatch = auditoriaBlock.match(/Row:\s*\{([\s\S]*?)\};/);
    expect(rowBlockMatch).not.toBeNull();
    const rowBlock = rowBlockMatch![1];

    const expectedNonNullableRowTypes: Record<string, string> = {
      id: "number",
      accion: "string",
      tabla: "string",
      creado_en: "string",
      campos_modificados: "string\\[\\]",
      metadatos: "Json",
    };

    for (const [column, expectedType] of Object.entries(
      expectedNonNullableRowTypes,
    )) {
      expect(rowBlock).toMatch(
        new RegExp(`\\b${column}:\\s*${expectedType}\\s*;`),
      );
      expect(rowBlock).not.toMatch(
        new RegExp(`\\b${column}\\??:\\s*[^;]*\\bnull\\b`),
      );
    }

    const expectedNullableRowBaseTypes: Record<string, string> = {
      empresa_id: "string",
      usuario_id: "string",
      registro_id: "string",
      antes: "Json",
      despues: "Json",
      tipo_evento: "string",
      origen: "string",
      actor_nombre: "string",
      actor_correo: "string",
      entidad_nombre: "string",
      detalle: "string",
    };

    for (const [column, baseType] of Object.entries(
      expectedNullableRowBaseTypes,
    )) {
      expect(rowBlock).toMatch(
        new RegExp(`\\b${column}:\\s*${baseType}\\s*\\|\\s*null\\s*;`),
      );
    }

    expect(dbTypesContent).toMatch(
      /es_propietario_empresa:\s*\{\s*Args:\s*\{\s*p_empresa_id:\s*string\s*\};\s*Returns:\s*boolean;\s*\}/,
    );
  });
});
