import { test, expect } from "@playwright/test";

test.describe("Vittkly Web Smoke Tests", () => {
  test("la landing page carga con el título y accesos principales", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Vittkly/i);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Iniciar Sesión/i }),
    ).toBeVisible();
  });

  test("la pantalla de login carga con formulario accesible", async ({
    page,
  }) => {
    await page.goto("/login");
    await expect(page.getByLabel(/Correo Electrónico/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Ingresar/i })).toBeVisible();
  });
});
