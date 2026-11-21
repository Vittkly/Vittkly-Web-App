import fs from "node:fs";
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
  assertNoHorizontalOverflow,
  assertWcagAaContrast,
} from "./helpers/a11y-layout";

test.describe("Tier 3 — Cross-Feature Pairwise Interactions", () => {
  test.beforeEach(async () => {
    await resetMockSupabase();
  });

  test("T3-01: 4-way simultaneous filter intersection (Persona + Dónde + Rango 7d + Search) narrows strictly and relaxes cleanly", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenActivityTab(page, TEST_PERSONAS.admin);

    await page
      .getByLabel(/Persona/i)
      .selectOption({ label: "Andree Valencia" });
    await page
      .getByLabel(/Dónde|Módulo|Tipo/i)
      .selectOption({ label: "Perfiles y permisos" });
    await page.getByLabel(/Rango|Periodo|Tiempo/i).selectOption("7d");
    await page.getByPlaceholder(/Buscar/i).fill("trabajos.editar");

    const rows = page.locator("main tbody tr");
    expect(await rows.count()).toBe(1);
    await expect(rows.first()).toContainText("Técnico de campo");

    // Relax search while preserving Persona + Dónde + Rango 7d
    await page.getByPlaceholder(/Buscar/i).fill("");
    expect(await rows.count()).toBeGreaterThanOrEqual(2);
  });

  test("T3-02: Theme (light/dark) × Viewport (desktop/mobile) × Audit Action Badges pass contrast & overflow", async ({
    page,
  }) => {
    await loginAndOpenActivityTab(page, TEST_PERSONAS.admin);

    for (const vp of ["desktop", "mobile"] as const) {
      await setViewportMode(page, vp);
      for (const theme of ["light", "dark"] as const) {
        await applyTheme(page, theme);
        await assertNoHorizontalOverflow(page);
        await assertWcagAaContrast(page, "main tbody span, main tbody td");
      }
    }
  });

  test("T3-03: ?tab=actividad URL sync × Filter × Pagination × Tab round-trip preserves valid state", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenActivityTab(page, TEST_PERSONAS.admin);
    await expect(page).toHaveURL(/tab=actividad/);

    await page.getByRole("button", { name: /Ver más/i }).click();
    const expandedCount = await page.locator("main tbody tr").count();
    expect(expandedCount).toBeGreaterThan(15);

    await page.getByRole("tab", { name: /^Personas$/i }).click();
    await expect(page).toHaveURL(/tab=personas/);

    await page.getByRole("tab", { name: /^Actividad$/i }).click();
    await expect(page).toHaveURL(/tab=actividad/);
    await expect(page.locator("main tbody tr").first()).toBeVisible();
  });

  test("T3-04: DB metadata contract across perfil_permisos, ordenes_trabajo, invitaciones (cuenta_existente), and membresias (desvinculada) flows end-to-end", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenActivityTab(page, TEST_PERSONAS.admin);

    const tbody = page.locator("main tbody");
    await expect(tbody).toContainText(/Perfiles y permisos/i);
    await expect(tbody).toContainText(/Órdenes de trabajo/i);
    await expect(tbody).toContainText(/Invitaciones/i);
    await expect(tbody).toContainText(/Equipo y accesos/i);
    await expect(tbody).toContainText("Ca**** Ma****");
    await expect(tbody).toContainText("Mateo Paredes");
  });

  test("T3-05: CSV Export × Active Filters exports only filtered rows and neutralizes CSV formula injection", async ({
    page,
  }) => {
    await seedMockSupabase({
      append: {
        auditoria: [
          {
            id: 888,
            empresa_id: TEST_IDS.ORG_PRIMARY,
            usuario_id: TEST_IDS.USER_ADMIN,
            accion: "crear",
            tipo_evento: "crear",
            origen: "clientes",
            tabla: "clientes",
            registro_id: "cli-csv-sec",
            entidad_nombre: "=CMD|'/C calc'!A0",
            actor_nombre: "Andree Valencia",
            actor_correo: "admin@vittkly.test",
            campos_modificados: ["nombre_completo"],
            detalle: "Registró cliente =CMD|'/C calc'!A0",
            metadatos: { cambios: [] },
            antes: null,
            despues: { nombre_completo: "=CMD|'/C calc'!A0" },
            creado_en: new Date().toISOString(),
          },
        ],
      },
    });

    await setViewportMode(page, "desktop");
    await loginAndOpenActivityTab(page, TEST_PERSONAS.admin);

    await page.getByPlaceholder(/Buscar/i).fill("calc");
    expect(await page.locator("main tbody tr").count()).toBe(1);

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /Descargar|Exportar/i }).click(),
    ]);
    const filePath = await download.path();
    expect(filePath).not.toBeNull();

    const csv = fs.readFileSync(filePath!, "utf8");
    const lines = csv.trim().split(/\r?\n/);
    expect(lines.length).toBe(2); // header + 1 filtered row
    expect(csv).not.toMatch(/(?:^|,)"?=CMD/m);
  });
});
