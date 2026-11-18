import { test, expect } from "@playwright/test";
import { TEST_PERSONAS, resetMockSupabase } from "./helpers/fixtures";
import {
  applyTheme,
  loginAndOpenActivityTab,
  loginAndOpenDashboard,
  setViewportMode,
} from "./helpers/auth";
import {
  assertNoHorizontalOverflow,
  assertNoOverlappingInteractiveControls,
  assertWcagAaContrast,
} from "./helpers/a11y-layout";

test.describe("Tier 4 — Real-World Operator Scenarios", () => {
  test.beforeEach(async () => {
    await resetMockSupabase();
  });

  test("T4-01: Security incident investigation on Perfiles y permisos in last 7 days", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenActivityTab(page, TEST_PERSONAS.admin);

    await page
      .getByLabel(/Dónde|Módulo|Tipo/i)
      .selectOption({ label: "Perfiles y permisos" });
    await page.getByLabel(/Rango|Periodo|Tiempo/i).selectOption("7d");
    await page.getByPlaceholder(/Buscar/i).fill("Técnico");

    const rows = page.locator("main tbody tr");
    expect(await rows.count()).toBeGreaterThanOrEqual(2);
    await expect(page.locator("main tbody")).toContainText("Andree Valencia");
    await expect(page.locator("main tbody")).toContainText(/trabajos\.editar/i);

    await page.getByRole("button", { name: /Limpiar filtros/i }).click();
    expect(await rows.count()).toBeGreaterThan(5);
  });

  test("T4-02: Ex-employee (desvinculada) audit trail review attributes historical and unlink events accurately", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenActivityTab(page, TEST_PERSONAS.admin);

    await page.getByLabel(/Rango|Periodo|Tiempo/i).selectOption("all");
    await page.getByLabel(/Persona/i).selectOption({ label: "Mateo Paredes" });

    const tbody = page.locator("main tbody");
    expect(await tbody.locator("tr").count()).toBeGreaterThanOrEqual(3);
    await expect(tbody).toContainText("OT-2038");
    await expect(tbody).not.toContainText("Sistema / Administrador");

    // Verify unlink event authored by Admin on Mateo Paredes is visible when clearing Persona
    await page.getByRole("button", { name: /Limpiar filtros/i }).click();
    await page.getByPlaceholder(/Buscar/i).fill("Desvinculó a Mateo Paredes");
    await expect(tbody.locator("tr").first()).toContainText("Andree Valencia");
  });

  test("T4-03: Field operations OT-XXXX lifecycle trace within 1d filter", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenActivityTab(page, TEST_PERSONAS.admin);

    await page.getByLabel(/Rango|Periodo|Tiempo/i).selectOption("1d");
    await page
      .getByLabel(/Dónde|Módulo|Tipo/i)
      .selectOption({ label: "Órdenes de trabajo" });

    const tbody = page.locator("main tbody");
    await expect(tbody).toContainText("OT-2041");
    await expect(tbody).toContainText("OT-2042");
    await expect(tbody).toContainText("Clínica San Gabriel");
  });

  test("T4-04: Multi-step cuenta_existente invitation privacy audit preserves masking and hides hashes", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenActivityTab(page, TEST_PERSONAS.admin);

    await page
      .getByLabel(/Dónde|Módulo|Tipo/i)
      .selectOption({ label: "Invitaciones" });

    const text = await page.locator("main tbody").innerText();
    expect(text).toContain("Ca**** Ma****");
    expect(text).toContain("co****@gmail.com");
    expect(text).not.toContain("token_hash");
    expect(text).not.toContain("codigo_hash");
  });

  test("T4-05: Mobile dark-mode manager inspection from Dashboard -> Más drawer -> Configuraciones -> Actividad", async ({
    page,
  }) => {
    await setViewportMode(page, "mobile");
    await loginAndOpenDashboard(page, TEST_PERSONAS.admin);
    await applyTheme(page, "dark");

    const mobileNav = page.locator('nav[aria-label="Navegación móvil"]');
    await mobileNav.getByRole("button", { name: /Más/i }).click();

    const drawer = page.getByRole("dialog");
    await expect(drawer).toBeVisible();
    await drawer.getByRole("link", { name: /Configuraciones/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/configuraciones/);

    await page.getByRole("tab", { name: /^Actividad$/i }).click();
    await page.getByLabel(/Rango|Periodo|Tiempo/i).selectOption("7d");
    await page.getByPlaceholder(/Buscar/i).fill("OT-2041");

    await expect(page.locator("main tbody")).toContainText("OT-2041");
    await assertNoHorizontalOverflow(page);
    await assertNoOverlappingInteractiveControls(page, "main");
    await assertWcagAaContrast(
      page,
      "main h1, main h2, main button, main tbody td",
    );
  });
});
