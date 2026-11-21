import path from "node:path";
import { test, expect } from "@playwright/test";
import { TEST_PERSONAS, resetMockSupabase } from "./helpers/fixtures";
import {
  applyTheme,
  loginAndOpenDashboard,
  setViewportMode,
} from "./helpers/auth";
import {
  assertNoHorizontalOverflow,
  assertNoOverlappingInteractiveControls,
  assertNoUnintendedTextClipping,
  assertWcagAaContrast,
  scanFilesForTokenViolations,
} from "./helpers/a11y-layout";

const REPO_ROOT = path.resolve(process.cwd(), "../..");

test.describe("F2 — Main Dashboard Screen UI/UX & Token Compliance (R1)", () => {
  test.beforeEach(async () => {
    await resetMockSupabase();
  });

  // =========================================================================
  // Tier 1 — Feature Coverage
  // =========================================================================

  test("T1-F2-01: main dashboard renders core business sections and all 8 KPI cards", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenDashboard(page, TEST_PERSONAS.admin);

    const main = page.getByRole("main");
    for (const kpi of [
      "Monto vendido",
      "Monto cotizado",
      "Tasa de cierre",
      "Ticket promedio",
      "Cobrado",
      "Por cobrar hoy",
      "Servicios realizados",
      "NPS",
    ]) {
      await expect(main.getByText(kpi, { exact: true })).toBeVisible();
    }

    await expect(
      main.getByRole("heading", { name: /Primeros pasos en/i }),
    ).toBeVisible();
    await expect(
      main.getByRole("heading", { name: "Ventas por mes" }),
    ).toBeVisible();
    await expect(
      main.getByRole("heading", { name: "Próximos 7 días" }),
    ).toBeVisible();
  });

  test("T1-F2-02: period and channel segment buttons switch interactively", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenDashboard(page, TEST_PERSONAS.admin);

    const trimBtn = page.getByRole("button", { name: "Trimestre" });
    await trimBtn.click();
    await expect(trimBtn).toHaveClass(/text-primary-ink/);

    const a365Btn = page.getByRole("button", { name: "A365" });
    await a365Btn.click();
    await expect(a365Btn).toHaveClass(/text-primary-ink/);
  });

  test("T1-F2-03: clicking 'Rango' reveals functional custom date inputs", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenDashboard(page, TEST_PERSONAS.admin);

    await page.getByRole("button", { name: "Rango" }).click();
    const dateInputs = page.locator('main input[type="date"]');
    await expect(dateInputs).toHaveCount(2);

    await dateInputs.nth(0).fill("2026-01-01");
    await dateInputs.nth(1).fill("2026-01-31");
    await expect(dateInputs.nth(0)).toHaveValue("2026-01-01");
    await expect(dateInputs.nth(1)).toHaveValue("2026-01-31");
  });

  test("T1-F2-04: 'Ventas por mes' bars are keyboard-accessible buttons and 'Ver como tabla' toggles table view", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenDashboard(page, TEST_PERSONAS.admin);

    const chartButtons = page.locator('main button[title*="S/"]');
    const count = await chartButtons.count();
    expect(count).toBeGreaterThanOrEqual(6);

    await chartButtons.first().focus();
    await page.keyboard.press("Enter");

    const tableSummary = page.getByText("Ver como tabla");
    await tableSummary.click();
    await expect(page.locator("main details[open] table")).toBeVisible();
  });

  test("T1-F2-05: Avisos card toggles expanded list and marks item done/undone", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenDashboard(page, TEST_PERSONAS.admin);

    const expandBtn = page.getByRole("button", { name: /Ver los \d+ avisos/i });
    if (await expandBtn.isVisible()) {
      await expandBtn.click();
      await expect(
        page.getByRole("button", { name: /Mostrar \d+ avisos/i }),
      ).toBeVisible();
    }

    const checkBtn = page
      .getByRole("button", { name: /Marcar como listo/i })
      .first();
    await checkBtn.click();
    await expect(
      page.getByRole("button", { name: /Volver a mostrar/i }).first(),
    ).toBeVisible();
  });

  // =========================================================================
  // Tier 2 — Boundary & Corner Cases
  // =========================================================================

  test("T2-F2-01: desktop hides duplicate 'Con tecnología de' footer inside main while mobile renders it cleanly", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenDashboard(page, TEST_PERSONAS.admin);

    const mainFooter = page.locator("main").getByText("Con tecnología de");
    await expect(mainFooter).toBeHidden();

    await setViewportMode(page, "mobile");
    await expect(mainFooter).toBeVisible();
  });

  test("T2-F2-02: desktop (1280x800) main dashboard passes overflow, clipping, and WCAG AA contrast in light & dark", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenDashboard(page, TEST_PERSONAS.admin);

    for (const theme of ["light", "dark"] as const) {
      await applyTheme(page, theme);
      await assertNoHorizontalOverflow(page);
      await assertNoUnintendedTextClipping(page, "main h2");
      await assertWcagAaContrast(page, "main h2, main b, main button, main a");
    }
  });

  test("T2-F2-03: mobile (375x812) main dashboard passes overflow, non-overlap, and WCAG AA contrast in light & dark", async ({
    page,
  }) => {
    await setViewportMode(page, "mobile");
    await loginAndOpenDashboard(page, TEST_PERSONAS.admin);

    for (const theme of ["light", "dark"] as const) {
      await applyTheme(page, theme);
      await assertNoHorizontalOverflow(page);
      await assertNoOverlappingInteractiveControls(page, "main");
      await assertWcagAaContrast(page, "main h2, main b, main button");
    }
  });

  test("T2-F2-04: switching to dark theme updates root CSS semantic tokens and preserves contrast on badges", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenDashboard(page, TEST_PERSONAS.admin);
    await applyTheme(page, "dark");

    const tokens = await page.evaluate(() => {
      const style = window.getComputedStyle(document.documentElement);
      return {
        surface: style.getPropertyValue("--surface").trim().toLowerCase(),
        ink: style.getPropertyValue("--ink").trim().toLowerCase(),
      };
    });
    expect(tokens.surface).toBe("#0a1c27");
    expect(tokens.ink).toBe("#e7f1f6");

    await assertWcagAaContrast(page, "main span, main b, main a");
  });

  test("T2-F2-05: static token audit confirms 0 literal HEX colors, 0 py-0.2 typos, and 0 text-white contrast violations in TenantDashboardView", async () => {
    const target = path.join(
      REPO_ROOT,
      "apps/web/src/features/dashboard/components/TenantDashboardView.tsx",
    );
    const violations = scanFilesForTokenViolations([target], REPO_ROOT);
    expect(violations).toEqual([]);
  });
});
