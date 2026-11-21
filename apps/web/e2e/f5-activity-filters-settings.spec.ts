import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";
import {
  RAW_SQL_TABLE_NAMES,
  TEST_PERSONAS,
  resetMockSupabase,
} from "./helpers/fixtures";
import {
  applyTheme,
  loginAndOpenActivityTab,
  loginViaUi,
  setViewportMode,
} from "./helpers/auth";
import {
  assertNoHorizontalOverflow,
  assertNoOverlappingInteractiveControls,
  assertWcagAaContrast,
  scanFilesForTokenViolations,
} from "./helpers/a11y-layout";

const REPO_ROOT = path.resolve(process.cwd(), "../..");

test.describe("F5 — Activity Log Filters, Search, Pagination & Settings Polish (R1, R4)", () => {
  test.beforeEach(async () => {
    await resetMockSupabase();
  });

  // =========================================================================
  // Tier 1 — Feature Coverage
  // =========================================================================

  test("T1-F5-01: Settings uses single <main>, syncs ?tab=actividad in URL, and renders all 4 filter controls", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginViaUi(page, TEST_PERSONAS.admin);
    await page.goto("/dashboard/configuraciones");

    await expect(page.locator("main")).toHaveCount(1);

    await page.getByRole("tab", { name: /^Actividad$/i }).click();
    await expect(page).toHaveURL(/tab=actividad/);

    await expect(page.getByLabel(/Persona/i)).toBeVisible();
    await expect(page.getByLabel(/Dónde|Módulo|Tipo/i)).toBeVisible();
    await expect(page.getByLabel(/Rango|Periodo|Tiempo/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Buscar/i)).toBeVisible();
  });

  test("T1-F5-02: Persona filter narrows Activity records strictly to the selected actor", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenActivityTab(page, TEST_PERSONAS.admin);

    const personaSelect = page.getByLabel(/Persona/i);
    await personaSelect.selectOption({ label: "Inés Quispe" });

    const rows = page.locator("main tbody tr");
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(3);

    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText("Inés Quispe");
    }
  });

  test("T1-F5-03: Dónde/Módulo filter shows readable Spanish labels (no raw SQL table names) and filters accurately", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenActivityTab(page, TEST_PERSONAS.admin);

    const originSelect = page.getByLabel(/Dónde|Módulo|Tipo/i);
    const optionTexts = await originSelect.locator("option").allTextContents();

    for (const rawSqlName of RAW_SQL_TABLE_NAMES) {
      expect(optionTexts.join(" | ")).not.toContain(rawSqlName);
    }

    await originSelect.selectOption({ label: "Perfiles y permisos" });
    const rows = page.locator("main tbody tr");
    expect(await rows.count()).toBeGreaterThanOrEqual(2);
    await expect(rows.first()).toContainText(/Perfiles y permisos/i);
  });

  test("T1-F5-04: Time range filter supports 1d, 7d, 15d, 30d, and all (Sin límite) accurately", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenActivityTab(page, TEST_PERSONAS.admin);

    const rangeSelect = page.getByLabel(/Rango|Periodo|Tiempo/i);
    const optionValues = await rangeSelect
      .locator("option")
      .evaluateAll((opts) => opts.map((o) => (o as HTMLOptionElement).value));
    expect(optionValues).toEqual(
      expect.arrayContaining(["1d", "7d", "15d", "30d", "all"]),
    );

    // 45d historical record only visible on "all", excluded on "30d"
    await rangeSelect.selectOption("30d");
    await expect(
      page.locator("main tbody").getByText(/registro histórico 45d/i),
    ).toHaveCount(0);

    await rangeSelect.selectOption("all");
    // Expand if paginated or search to confirm 45d record is in "all"
    await page.getByPlaceholder(/Buscar/i).fill("45d");
    await expect(
      page.locator("main tbody").getByText(/registro histórico 45d/i),
    ).toBeVisible();
  });

  test("T1-F5-05: text search filters across entities/details and 'Limpiar filtros' restores full list", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenActivityTab(page, TEST_PERSONAS.admin);

    const searchInput = page.getByPlaceholder(/Buscar/i);
    await searchInput.fill("OT-2041");

    const rows = page.locator("main tbody tr");
    expect(await rows.count()).toBe(2);
    await expect(rows.first()).toContainText("OT-2041");

    const clearBtn = page.getByRole("button", { name: /Limpiar filtros/i });
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();

    await expect(searchInput).toHaveValue("");
    expect(await rows.count()).toBeGreaterThan(5);
  });

  test("T1-F5-06: pagination 'Ver más' loads additional records and CSV export triggers a download", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenActivityTab(page, TEST_PERSONAS.admin);

    const initialCount = await page.locator("main tbody tr").count();
    const verMasBtn = page.getByRole("button", { name: /Ver más/i });
    await expect(verMasBtn).toBeVisible();
    await verMasBtn.click();

    const afterCount = await page.locator("main tbody tr").count();
    expect(afterCount).toBeGreaterThan(initialCount);

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /Descargar|Exportar/i }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.csv$/i);
  });

  // =========================================================================
  // Tier 2 — Boundary & Corner Cases
  // =========================================================================

  test("T2-F5-01: exact 24h and 7d time boundaries include 23h50m/6d23h and exclude 24h10m/7d01h", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenActivityTab(page, TEST_PERSONAS.admin);

    const rangeSelect = page.getByLabel(/Rango|Periodo|Tiempo/i);

    // 23h50m (Mateo Paredes unlink) is inside 1d; 24h10m (OT-2038 evidence) is outside 1d
    await rangeSelect.selectOption("1d");
    await expect(
      page.locator("main tbody").getByText(/Desvinculó a Mateo Paredes/i),
    ).toBeVisible();
    await expect(
      page.locator("main tbody").getByText(/Evidencia.*OT-2038/i),
    ).toHaveCount(0);

    await rangeSelect.selectOption("7d");
    await expect(
      page
        .locator("main tbody")
        .getByText(/OT-2038/i)
        .first(),
    ).toBeVisible();
    await expect(
      page.locator("main tbody").getByText(/Lucía Fernández/i),
    ).toBeVisible();
    await expect(
      page.locator("main tbody").getByText(/solicitó su salida/i),
    ).toHaveCount(0);
  });

  test("T2-F5-02: text search is accent-insensitive and case-insensitive", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenActivityTab(page, TEST_PERSONAS.admin);

    await page.getByLabel(/Rango|Periodo|Tiempo/i).selectOption("all");
    const searchInput = page.getByPlaceholder(/Buscar/i);

    await searchInput.fill("tecnico");
    await expect(
      page
        .locator("main tbody")
        .getByText(/Técnico de campo/i)
        .first(),
    ).toBeVisible();

    await searchInput.fill("INES");
    await expect(
      page
        .locator("main tbody")
        .getByText(/Inés Quispe/i)
        .first(),
    ).toBeVisible();
  });

  test("T2-F5-03: adversarial search characters (%, _, ', <script>) do not crash UI or execute scripts", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenActivityTab(page, TEST_PERSONAS.admin);

    const searchInput = page.getByPlaceholder(/Buscar/i);
    for (const payload of [
      "%",
      "_",
      "' OR '1'='1",
      "<script>alert(1)</script>",
    ]) {
      await searchInput.fill(payload);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
    await expect(
      page.getByText(/No hay actividad con esos filtros|No se encontraron/i),
    ).toBeVisible();
  });

  test("T2-F5-04: impossible filter combination displays empty state and reset restores records", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenActivityTab(page, TEST_PERSONAS.admin);

    await page.getByLabel(/Persona/i).selectOption({ label: "Inés Quispe" });
    await page.getByPlaceholder(/Buscar/i).fill("zzznonexistent999");

    await expect(
      page.getByText(/No hay actividad con esos filtros|No se encontraron/i),
    ).toBeVisible();

    await page.getByRole("button", { name: /Limpiar filtros/i }).click();
    expect(await page.locator("main tbody tr").count()).toBeGreaterThan(5);
  });

  test("T2-F5-05: Settings & Activity tab passes overflow, control non-overlap, and WCAG AA contrast on desktop and mobile", async ({
    page,
  }) => {
    await loginAndOpenActivityTab(page, TEST_PERSONAS.admin);

    for (const vp of ["desktop", "mobile"] as const) {
      await setViewportMode(page, vp);
      for (const theme of ["light", "dark"] as const) {
        await applyTheme(page, theme);
        await assertNoHorizontalOverflow(page);
        await assertNoOverlappingInteractiveControls(page, "main");
        await assertWcagAaContrast(
          page,
          "main h1, main h2, main button, main [role='tab'], main select",
        );
      }
    }
  });

  test("T2-F5-06: static token audit on Settings components confirms 0 text-kleanly, 0 HEX, 0 double-+, and 0 text-white contrast traps", async () => {
    const settingsFiles = [
      "apps/web/src/features/settings/components/UsersProfilesHeader.tsx",
      "apps/web/src/features/settings/components/SettingsSecondaryNav.tsx",
      "apps/web/src/features/settings/components/UsersProfilesTable.tsx",
      "apps/web/src/features/settings/components/InvitationsExitsTab.tsx",
      "apps/web/src/features/settings/components/ProfilesPermissionsTab.tsx",
      "apps/web/src/features/settings/components/ActivityAuditTab.tsx",
      "apps/web/src/features/settings/components/EditMemberModal.tsx",
      "apps/web/src/features/settings/components/ProfileFormModal.tsx",
    ].map((rel) => path.join(REPO_ROOT, rel));

    const violations = scanFilesForTokenViolations(settingsFiles, REPO_ROOT);
    expect(violations).toEqual([]);

    for (const rel of [
      "apps/web/src/features/settings/components/UsersProfilesTable.tsx",
      "apps/web/src/features/settings/components/ProfilesPermissionsTab.tsx",
    ]) {
      const content = fs.readFileSync(path.join(REPO_ROOT, rel), "utf8");
      expect(content).not.toMatch(/>\+\s*(Agregar|Crear)/i);
    }
  });
});
