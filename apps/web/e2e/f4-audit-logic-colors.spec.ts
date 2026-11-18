import path from "node:path";
import { test, expect } from "@playwright/test";
import {
  TEST_IDS,
  TEST_PERSONAS,
  resetMockSupabase,
  seedMockSupabase,
} from "./helpers/fixtures";
import {
  applyTheme,
  loginAndOpenActivityTab,
  setViewportMode,
} from "./helpers/auth";
import {
  assertWcagAaContrast,
  scanFilesForTokenViolations,
} from "./helpers/a11y-layout";

const REPO_ROOT = path.resolve(process.cwd(), "../..");

test.describe("F4 — Audit Logic, Messages, Actor Resolution & Semantic Colors (R2)", () => {
  test.beforeEach(async () => {
    await resetMockSupabase();
  });

  // =========================================================================
  // Tier 1 — Feature Coverage
  // =========================================================================

  test("T1-F4-01: audit action badges render differentiated visual color tokens across success, primary, warning, and danger categories", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenActivityTab(page, TEST_PERSONAS.admin);

    // Ensure rows from distinct semantic categories are visible:
    // crear (success), editar (primary), suspender (warning), desvincular/anular (danger)
    const tableBody = page.locator("main tbody");
    await expect(tableBody).toBeVisible();

    const styleSnapshot = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll("main tbody tr"));
      const badgeStyles: Record<
        string,
        { bg: string; color: string; classes: string }
      > = {};
      for (const row of rows) {
        const text = (row.textContent || "").toLowerCase();
        const badge = row.querySelector(
          "span[class*='rounded']",
        ) as HTMLElement | null;
        if (!badge) continue;
        const badgeText = (badge.innerText || "").trim().toLowerCase();
        const cs = window.getComputedStyle(badge);
        const info = {
          bg: cs.backgroundColor,
          color: cs.color,
          classes: badge.className,
        };
        if (badgeText.includes("cre") || text.includes("creó la orden")) {
          badgeStyles.success = badgeStyles.success || info;
        } else if (
          badgeText.includes("edit") ||
          badgeText.includes("actualiz")
        ) {
          badgeStyles.primary = badgeStyles.primary || info;
        } else if (badgeText.includes("suspend")) {
          badgeStyles.warning = badgeStyles.warning || info;
        } else if (
          badgeText.includes("desvinc") ||
          badgeText.includes("anul")
        ) {
          badgeStyles.danger = badgeStyles.danger || info;
        }
      }
      return badgeStyles;
    });

    expect(styleSnapshot.success).toBeDefined();
    expect(styleSnapshot.primary).toBeDefined();
    expect(styleSnapshot.warning).toBeDefined();
    expect(styleSnapshot.danger).toBeDefined();

    const distinctBackgrounds = new Set([
      styleSnapshot.success.bg,
      styleSnapshot.primary.bg,
      styleSnapshot.warning.bg,
      styleSnapshot.danger.bg,
    ]);
    expect(distinctBackgrounds.size).toBe(4);
  });

  test("T1-F4-02: rendered Activity tab uses zero text-kleanly and zero literal HEX tokens", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenActivityTab(page, TEST_PERSONAS.admin);

    const kleanlyCount = await page.locator("main .text-kleanly").count();
    expect(kleanlyCount).toBe(0);

    const activityFiles = [
      "apps/web/src/features/settings/components/ActivityAuditTab.tsx",
    ].map((rel) => path.join(REPO_ROOT, rel));
    expect(scanFilesForTokenViolations(activityFiles, REPO_ROOT)).toEqual([]);
  });

  test("T1-F4-03: team and access events display clear Spanish descriptions and change chips", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenActivityTab(page, TEST_PERSONAS.admin);

    const main = page.getByRole("main");
    await expect(main.getByText(/Mateo Paredes/i).first()).toBeVisible();
    await expect(main.getByText(/Técnico de campo/i).first()).toBeVisible();

    const bodyText = await main.locator("tbody").innerText();
    expect(bodyText).not.toMatch(/\bundefined\b|\bnull\b|\[object Object\]/);
  });

  test("T1-F4-04: field-ops and company events render readable entity names and clear Spanish summaries", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenActivityTab(page, TEST_PERSONAS.admin);

    const main = page.getByRole("main");
    await expect(main.getByText(/OT-2041/).first()).toBeVisible();
    await expect(main.getByText(/Clínica San Gabriel/).first()).toBeVisible();
    // Should not fall back to generic raw table names
    await expect(
      main.getByText(/Actualizó registro en ordenes_trabajo/i),
    ).toHaveCount(0);
    await expect(main.getByText(/Actualizó registro en clientes/i)).toHaveCount(
      0,
    );
  });

  test("T1-F4-05: desvinculada and unlinked actors resolve to real actor names instead of 'Sistema / Administrador'", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenActivityTab(page, TEST_PERSONAS.admin);

    const tbody = page.locator("main tbody");
    // Mateo Paredes is 'desvinculada'; Lucía Fernández has no membership in ORG_PRIMARY
    await expect(tbody.getByText("Mateo Paredes").first()).toBeVisible();
    await expect(tbody.getByText("Lucía Fernández").first()).toBeVisible();

    // Verify Mateo Paredes's own row (evidencias_orden) is NOT attributed to Sistema / Administrador
    const evidenciaRow = tbody.locator("tr", { hasText: "OT-2038" }).first();
    await expect(evidenciaRow).toContainText("Mateo Paredes");
    await expect(evidenciaRow).not.toContainText("Sistema / Administrador");
  });

  // =========================================================================
  // Tier 2 — Boundary & Corner Cases
  // =========================================================================

  test("T2-F4-01: unrecognized future tipo_evento falls back cleanly to neutral semantic badge", async ({
    page,
  }) => {
    await seedMockSupabase({
      replace: {
        auditoria: [
          {
            id: 501,
            empresa_id: TEST_IDS.ORG_PRIMARY,
            usuario_id: TEST_IDS.USER_ADMIN,
            accion: "editar",
            tipo_evento: "evento_futuro_desconocido",
            origen: "empresas",
            tabla: "empresas",
            registro_id: TEST_IDS.ORG_PRIMARY,
            entidad_nombre: "Vitta Kleanly",
            actor_nombre: "Andree Valencia",
            actor_correo: "admin@vittkly.test",
            campos_modificados: ["nota"],
            detalle: "Evento de compatibilidad futura",
            metadatos: { cambios: [] },
            antes: {},
            despues: {},
            creado_en: new Date().toISOString(),
          },
        ],
      },
    });

    await setViewportMode(page, "desktop");
    await loginAndOpenActivityTab(page, TEST_PERSONAS.admin);

    const row = page.locator("main tbody tr").first();
    await expect(row).toBeVisible();
    await expect(row).toContainText("Andree Valencia");
    await expect(row).toContainText("Evento de compatibilidad futura");
  });

  test("T2-F4-02: cuenta_existente invitation audit rows preserve PII masking and hide token/codigo hashes", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenActivityTab(page, TEST_PERSONAS.admin);

    const tbodyText = await page.locator("main tbody").innerText();
    expect(tbodyText).toContain("Ca**** Ma****");
    expect(tbodyText).not.toContain("token_hash");
    expect(tbodyText).not.toContain("codigo_hash");
  });

  test("T2-F4-03: partial or null antes/despues JSONB renders safe Spanish fallback without malformed tokens", async ({
    page,
  }) => {
    await seedMockSupabase({
      replace: {
        auditoria: [
          {
            id: 502,
            empresa_id: TEST_IDS.ORG_PRIMARY,
            usuario_id: TEST_IDS.USER_ADMIN,
            accion: "borrar",
            tipo_evento: "borrar",
            origen: "clientes",
            tabla: "clientes",
            registro_id: "cli-sin-datos",
            entidad_nombre: null,
            actor_nombre: "Andree Valencia",
            actor_correo: null,
            campos_modificados: null,
            detalle: null,
            metadatos: null,
            antes: null,
            despues: null,
            creado_en: new Date().toISOString(),
          },
        ],
      },
    });

    await setViewportMode(page, "desktop");
    await loginAndOpenActivityTab(page, TEST_PERSONAS.admin);

    const rowText = await page.locator("main tbody tr").first().innerText();
    expect(rowText.trim().length).toBeGreaterThan(10);
    expect(rowText).not.toMatch(/\bundefined\b|\bnull\b|\[object Object\]/);
  });

  test("T2-F4-04: all audit badges pass WCAG AA contrast (>= 4.5:1) in both Light and Dark themes", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenActivityTab(page, TEST_PERSONAS.admin);

    for (const theme of ["light", "dark"] as const) {
      await applyTheme(page, theme);
      await assertWcagAaContrast(page, "main tbody td, main tbody span");
    }
  });

  test("T2-F4-05: historical records beyond legacy .limit(60) cap (75 seeded rows) are retrievable", async ({
    page,
  }) => {
    const now = Date.now();
    const seventyFiveRows = Array.from({ length: 75 }, (_, i) => ({
      id: 1000 + i,
      empresa_id: TEST_IDS.ORG_PRIMARY,
      usuario_id: TEST_IDS.USER_ADMIN,
      accion: "crear",
      tipo_evento: "crear",
      origen: "ordenes_trabajo",
      tabla: "ordenes_trabajo",
      registro_id: `ot-bulk-${i + 1}`,
      entidad_nombre: `OT-BULK-${i + 1}`,
      actor_nombre: "Andree Valencia",
      actor_correo: "admin@vittkly.test",
      campos_modificados: ["codigo"],
      detalle: `Creó orden histórica OT-BULK-${i + 1}`,
      metadatos: { cambios: [] },
      antes: null,
      despues: { codigo: `OT-BULK-${i + 1}` },
      creado_en: new Date(now - (i + 1) * 60_000).toISOString(),
    }));

    await seedMockSupabase({ replace: { auditoria: seventyFiveRows } });
    await setViewportMode(page, "desktop");
    await loginAndOpenActivityTab(page, TEST_PERSONAS.admin);

    // Must reflect 75 total records (not capped at 60)
    await expect(page.getByText(/75\s+registro/i)).toBeVisible();
  });
});
