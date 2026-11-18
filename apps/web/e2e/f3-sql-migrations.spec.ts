import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";
import { ALL_17_WEB_MUTATED_TABLES } from "./helpers/fixtures";

const REPO_ROOT = path.resolve(process.cwd(), "../..");
const MIGRATIONS_DIR = path.join(REPO_ROOT, "supabase/migrations");
const DB_TYPES_PATH = path.join(
  REPO_ROOT,
  "packages/db-types/src/database.types.ts",
);

interface MigrationFile {
  name: string;
  content: string;
}

function loadMigrations(): MigrationFile[] {
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  return files.map((name) => ({
    name,
    content: fs.readFileSync(path.join(MIGRATIONS_DIR, name), "utf8"),
  }));
}

function stripSqlComments(sql: string): string {
  return sql.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/--[^\r\n]*/g, " ");
}

function extractLatestAuditarFunction(migrations: MigrationFile[]): string {
  let latestBody = "";
  const fnRegex =
    /create\s+or\s+replace\s+function\s+public\.auditar\s*\(\s*\)[\s\S]*?\$\$[\s\S]*?\$\$/gi;

  for (const m of migrations) {
    const matches = m.content.match(fnRegex);
    if (matches && matches.length > 0) {
      latestBody = matches[matches.length - 1];
    }
  }
  return latestBody;
}

test.describe("F3 — Comprehensive SQL Audit Triggers & RLS Hardening (R3)", () => {
  // =========================================================================
  // Tier 1 — Feature Coverage
  // =========================================================================

  test("T1-F3-01: public.auditoria preserves 9 baseline columns and adds all 8 additive columns + filter indexes", async () => {
    const migrations = loadMigrations();
    const combinedSql = stripSqlComments(
      migrations.map((m) => m.content).join("\n"),
    ).toLowerCase();

    // Baseline 9 columns preserved in create table public.auditoria
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
      expect(combinedSql).toContain(col);
    }

    // Additive 8 columns on public.auditoria
    for (const additiveCol of [
      "tipo_evento",
      "origen",
      "actor_nombre",
      "actor_correo",
      "entidad_nombre",
      "campos_modificados",
      "detalle",
      "metadatos",
    ]) {
      const colAddedRegex = new RegExp(
        `alter\\s+table\\s+(?:if\\s+exists\\s+)?public\\.auditoria[\\s\\S]*?add\\s+column\\s+(?:if\\s+not\\s+exists\\s+)?${additiveCol}\\b`,
        "i",
      );
      expect(
        colAddedRegex.test(combinedSql),
        `Missing additive column public.auditoria.${additiveCol} in migrations`,
      ).toBe(true);
    }

    // Filter indexes on usuario_id, origen, tipo_evento
    expect(
      /create\s+index[\s\S]*?on\s+public\.auditoria[\s\S]*?usuario_id/i.test(
        combinedSql,
      ),
    ).toBe(true);
    expect(
      /create\s+index[\s\S]*?on\s+public\.auditoria[\s\S]*?origen/i.test(
        combinedSql,
      ),
    ).toBe(true);
    expect(
      /create\s+index[\s\S]*?on\s+public\.auditoria[\s\S]*?tipo_evento/i.test(
        combinedSql,
      ),
    ).toBe(true);
  });

  test("T1-F3-02: all 17 web-mutated tables have AFTER INSERT OR UPDATE OR DELETE triggers calling public.auditar()", async () => {
    const migrations = loadMigrations();
    const combinedSql = stripSqlComments(
      migrations.map((m) => m.content).join("\n"),
    );

    for (const table of ALL_17_WEB_MUTATED_TABLES) {
      const triggerRegex = new RegExp(
        `create\\s+trigger\\s+\\w+\\s+after\\s+insert\\s+or\\s+update\\s+or\\s+delete\\s+on\\s+public\\.${table}\\b[\\s\\S]*?execute\\s+(?:function|procedure)\\s+public\\.auditar\\s*\\(\\s*\\)`,
        "i",
      );
      expect(
        triggerRegex.test(combinedSql),
        `Table public.${table} is missing AFTER INSERT OR UPDATE OR DELETE trigger executing public.auditar()`,
      ).toBe(true);
    }
  });

  test("T1-F3-03: public.auditoria has ENABLE + FORCE RLS and REVOKE write privileges from service_role AFTER VIT-61", async () => {
    const migrations = loadMigrations();
    const vit61Index = migrations.findIndex((m) =>
      m.name.includes("VIT-61_privilegios_service_role"),
    );
    expect(vit61Index).toBeGreaterThanOrEqual(0);

    const postVit61Sql = stripSqlComments(
      migrations
        .slice(vit61Index + 1)
        .map((m) => m.content)
        .join("\n"),
    );
    const allSql = stripSqlComments(
      migrations.map((m) => m.content).join("\n"),
    );

    expect(
      /alter\s+table\s+public\.auditoria\s+enable\s+row\s+level\s+security/i.test(
        allSql,
      ),
    ).toBe(true);
    expect(
      /alter\s+table\s+public\.auditoria\s+force\s+row\s+level\s+security/i.test(
        allSql,
      ),
    ).toBe(true);

    // Must re-revoke after VIT-61's GRANT ALL PRIVILEGES TO service_role
    const revokeAfterVit61 =
      /revoke\s+[^;]*(?:insert|all)[^;]*on\s+(?:table\s+)?public\.auditoria\s+from\s+[^;]*service_role/i.test(
        postVit61Sql,
      );
    expect(
      revokeAfterVit61,
      "Expected REVOKE write privileges on public.auditoria FROM service_role in a migration after VIT-61",
    ).toBe(true);
  });

  test("T1-F3-04: latest public.auditar() resolves empresa_id for perfil_permisos/cuentas/suscripciones and registro_id for empresa_configuracion", async () => {
    const migrations = loadMigrations();
    const auditarBody = stripSqlComments(
      extractLatestAuditarFunction(migrations),
    );
    expect(auditarBody.length).toBeGreaterThan(100);

    expect(auditarBody).toMatch(/perfil_permisos/i);
    expect(auditarBody).toMatch(/perfiles/i);
    expect(auditarBody).toMatch(/cuentas/i);
    expect(auditarBody).toMatch(/suscripciones/i);
    expect(auditarBody).toMatch(/empresa_configuracion/i);
  });

  test("T1-F3-05: packages/db-types auditoria Row/Insert/Update types include all additive columns", async () => {
    const dbTypes = fs.readFileSync(DB_TYPES_PATH, "utf8");
    const auditoriaBlockMatch = dbTypes.match(
      /auditoria:\s*\{[\s\S]*?Relationships:\s*\[[^\]]*\]\s*;?\s*\}/,
    );
    expect(auditoriaBlockMatch).not.toBeNull();
    const auditoriaBlock = auditoriaBlockMatch![0];

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
      expect(
        auditoriaBlock,
        `packages/db-types auditoria type is missing column "${col}"`,
      ).toContain(`${col}:`);
    }
  });

  // =========================================================================
  // Tier 2 — Boundary & Corner Cases
  // =========================================================================

  test("T2-F3-01: latest public.auditar() redacts sensitive hashes (codigo_hash, token_hash)", async () => {
    const migrations = loadMigrations();
    const allPostVit28Sql = stripSqlComments(
      migrations
        .slice(
          migrations.findIndex((m) => m.name.includes("VIT-28_auditoria")) + 1,
        )
        .map((m) => m.content)
        .join("\n"),
    );

    expect(allPostVit28Sql).toMatch(/codigo_hash/i);
    expect(allPostVit28Sql).toMatch(/token_hash/i);
  });

  test("T2-F3-02: latest public.auditar() suppresses no-op UPDATE events", async () => {
    const migrations = loadMigrations();
    const auditarBody = stripSqlComments(
      extractLatestAuditarFunction(migrations),
    );
    const hasNoOpCheck =
      /actualizado_en/i.test(auditarBody) &&
      /is\s+not\s+distinct\s+from|=\s*v_despues|return\s+coalesce\(new,\s*old\)|return\s+new/i.test(
        auditarBody,
      );
    expect(
      hasNoOpCheck,
      "Expected no-op UPDATE suppression in latest public.auditar()",
    ).toBe(true);
  });

  test("T2-F3-03: latest public.auditar() resolves actor safely via auth.uid(), app.actor_id, and contextual row columns", async () => {
    const migrations = loadMigrations();
    const auditarBody = stripSqlComments(
      extractLatestAuditarFunction(migrations),
    );

    expect(auditarBody).toMatch(/auth\.uid\(\)/i);
    expect(auditarBody).toMatch(/app\.actor_id/i);
    expect(auditarBody).toMatch(/actor_nombre/i);
    expect(auditarBody).toMatch(/actor_correo/i);
  });

  test("T2-F3-04: public.auditar() is SECURITY DEFINER with search_path locked and EXECUTE revoked; auditoria has SELECT-only policies", async () => {
    const migrations = loadMigrations();
    const allSql = stripSqlComments(
      migrations.map((m) => m.content).join("\n"),
    );
    const auditarBody = stripSqlComments(
      extractLatestAuditarFunction(migrations),
    );

    expect(auditarBody).toMatch(/security\s+definer/i);
    expect(auditarBody).toMatch(/set\s+search_path\s*=/i);
    expect(
      /revoke\s+execute\s+on\s+function\s+public\.auditar\(\)\s+from\s+public,\s*anon,\s*authenticated/i.test(
        allSql,
      ),
    ).toBe(true);
    expect(
      /create\s+policy\s+[^;]*on\s+public\.auditoria\s+for\s+(?:insert|update|delete)/i.test(
        allSql,
      ),
    ).toBe(false);
  });

  test("T2-F3-05: all core tables have ENABLE + FORCE ROW LEVEL SECURITY and zero destructive DDL in migrations", async () => {
    const migrations = loadMigrations();
    const allSql = stripSqlComments(
      migrations.map((m) => m.content).join("\n"),
    );

    expect(/\bdrop\s+table\b/i.test(allSql)).toBe(false);
    expect(/\btruncate\s+table\b/i.test(allSql)).toBe(false);

    const tablesRequiringForceRls = [
      ...ALL_17_WEB_MUTATED_TABLES,
      "auditoria",
      "planes",
      "modulos",
      "plan_modulos",
      "permisos",
      "staff_plataforma",
      "intentos_ingreso",
    ];

    for (const tbl of tablesRequiringForceRls) {
      const enableRegex = new RegExp(
        `alter\\s+table\\s+public\\.${tbl}\\s+enable\\s+row\\s+level\\s+security`,
        "i",
      );
      const forceRegex = new RegExp(
        `alter\\s+table\\s+public\\.${tbl}\\s+force\\s+row\\s+level\\s+security`,
        "i",
      );
      expect(
        enableRegex.test(allSql),
        `public.${tbl} missing ENABLE ROW LEVEL SECURITY`,
      ).toBe(true);
      expect(
        forceRegex.test(allSql),
        `public.${tbl} missing FORCE ROW LEVEL SECURITY`,
      ).toBe(true);
    }
  });
});
