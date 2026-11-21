import path from "node:path";
import { test, expect } from "@playwright/test";
import { TEST_PERSONAS, resetMockSupabase } from "./helpers/fixtures";
import {
  applyTheme,
  loginAndOpenDashboard,
  loginViaUi,
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

test.describe("F1 — Dashboard Shell UI/UX Polish (R1)", () => {
  test.beforeEach(async () => {
    await resetMockSupabase();
  });

  // =========================================================================
  // Tier 1 — Feature Coverage
  // =========================================================================

  test("T1-F1-01: unauthenticated /dashboard redirects to /login and multi-org without org cookie redirects to /accesos", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);

    await loginViaUi(page, TEST_PERSONAS.multiOrg);
    await expect(page).toHaveURL(/\/accesos/);
  });

  test("T1-F1-02: desktop sidebar renders navigation, org switcher, quick create, and collapse/pin toggle", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenDashboard(page, TEST_PERSONAS.admin);

    const sidebar = page.locator(
      'aside[aria-label="Menú principal de la empresa"]',
    );
    await expect(sidebar).toBeVisible();
    await expect(
      sidebar.getByRole("navigation", { name: "Secciones" }),
    ).toBeVisible();
    await expect(
      sidebar.getByRole("button", { name: /Cambiar de empresa/i }),
    ).toBeVisible();
    await expect(sidebar.getByRole("button", { name: "Crear" })).toBeVisible();
    await expect(
      sidebar.getByRole("link", { name: "Configuraciones" }),
    ).toBeVisible();

    const collapseBtn = sidebar.getByRole("button", { name: /Contraer menú/i });
    await expect(collapseBtn).toBeVisible();
    await collapseBtn.click();
    await expect(
      sidebar.getByRole("button", { name: /Fijar menú/i }),
    ).toBeVisible();
  });

  test("T1-F1-03: header shows real title, help modal, and Avisos without hardcoded fake '1' alert", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenDashboard(page, TEST_PERSONAS.admin);

    const header = page.locator("header.page-head");
    await expect(header.getByRole("heading", { level: 1 })).toHaveText(
      "Inicio",
    );
    await expect(header.getByText(/Resumen del negocio/i)).toBeVisible();

    const avisosBtn = header.getByRole("button", { name: /^Avisos$/i });
    await expect(avisosBtn).toBeVisible();
    // Acceptance: remove fake hardcoded "1" badge when 0 real alerts exist
    await expect(avisosBtn).not.toHaveText(/1/);

    await avisosBtn.click();
    const avisosDialog = header.getByRole("dialog", { name: /Avisos/i });
    await expect(avisosDialog).toBeVisible();
    await expect(avisosDialog.getByText("Manuel Arteaga")).toHaveCount(0);
    await expect(avisosDialog.getByText("1 urgente")).toHaveCount(0);
  });

  test("T1-F1-04: mobile viewport hides desktop sidebar and renders bottom bar with 'Más' drawer", async ({
    page,
  }) => {
    await setViewportMode(page, "mobile");
    await loginAndOpenDashboard(page, TEST_PERSONAS.admin);

    await expect(
      page.locator('aside[aria-label="Menú principal de la empresa"]'),
    ).toBeHidden();

    const mobileNav = page.locator('nav[aria-label="Navegación móvil"]');
    await expect(mobileNav).toBeVisible();

    const masBtn = mobileNav.getByRole("button", { name: /Más/i });
    await expect(masBtn).toBeVisible();
    await masBtn.click();

    const drawer = page.getByRole("dialog");
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText(/Cerrar sesión/i)).toBeVisible();
  });

  test("T1-F1-05: PendingInvitationsBanner renders pending count and persists dismissal in sessionStorage", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenDashboard(page, TEST_PERSONAS.admin);

    await expect(
      page.getByText(/Tienes 1 invitación pendiente de otra empresa/i),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Ver en Accesos a empresa/i }),
    ).toBeVisible();

    await page
      .getByRole("button", { name: /Ocultar aviso por esta sesión/i })
      .click();
    await expect(
      page.getByText(/Tienes 1 invitación pendiente de otra empresa/i),
    ).toBeHidden();

    await page.reload();
    await expect(
      page.getByText(/Tienes 1 invitación pendiente de otra empresa/i),
    ).toBeHidden();
  });

  test("T1-F1-06: non-admin operator cannot see Configuraciones and is redirected away from /dashboard/configuraciones", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenDashboard(page, TEST_PERSONAS.operator);

    const sidebar = page.locator(
      'aside[aria-label="Menú principal de la empresa"]',
    );
    await expect(
      sidebar.getByRole("link", { name: "Configuraciones" }),
    ).toHaveCount(0);

    await page.goto("/dashboard/configuraciones");
    await expect(page).not.toHaveURL(/\/dashboard\/configuraciones/);
  });

  // =========================================================================
  // Tier 2 — Boundary & Corner Cases
  // =========================================================================

  test("T2-F1-01: desktop (1280x800) shell has 0 overflow, 0 control overlaps, and WCAG AA contrast in light & dark", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenDashboard(page, TEST_PERSONAS.admin);

    for (const theme of ["light", "dark"] as const) {
      await applyTheme(page, theme);
      await assertNoHorizontalOverflow(page);
      await assertNoOverlappingInteractiveControls(page, "aside");
      await assertNoOverlappingInteractiveControls(page, "header.page-head");
      await assertWcagAaContrast(
        page,
        "aside a, aside button, header.page-head h1, header.page-head p, header.page-head button, header.page-head a",
      );
    }
  });

  test("T2-F1-02: mobile (375x812) shell has 0 overflow, 0 control overlaps, and WCAG AA contrast in light & dark", async ({
    page,
  }) => {
    await setViewportMode(page, "mobile");
    await loginAndOpenDashboard(page, TEST_PERSONAS.admin);

    for (const theme of ["light", "dark"] as const) {
      await applyTheme(page, theme);
      await assertNoHorizontalOverflow(page);
      await assertNoOverlappingInteractiveControls(
        page,
        'nav[aria-label="Navegación móvil"]',
      );
      await assertNoOverlappingInteractiveControls(page, "header.page-head");
      await assertWcagAaContrast(
        page,
        'nav[aria-label="Navegación móvil"] a, nav[aria-label="Navegación móvil"] button, header.page-head h1, header.page-head button',
      );
    }
  });

  test("T2-F1-03: header subtitle wraps cleanly without unintended ellipsis clipping on desktop", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenDashboard(page, TEST_PERSONAS.admin);
    await assertNoUnintendedTextClipping(page, "header.page-head p");
  });

  test("T2-F1-04: help modal and Resumen del grupo modal use accessible dialog semantics and close on Escape", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginAndOpenDashboard(page, TEST_PERSONAS.admin);

    await page.getByRole("button", { name: /Centro de ayuda/i }).click();
    const helpDialog = page.getByRole("dialog");
    await expect(helpDialog).toBeVisible();
    await expect(helpDialog).toHaveAttribute("aria-modal", "true");
    await page.keyboard.press("Escape");
    await expect(helpDialog).toBeHidden();

    await page.getByRole("button", { name: /Resumen del grupo/i }).click();
    const groupDialog = page.getByRole("dialog");
    await expect(groupDialog).toBeVisible();
    await expect(groupDialog).toHaveAttribute("aria-modal", "true");
    await page.keyboard.press("Escape");
    await expect(groupDialog).toBeHidden();
  });

  test("T2-F1-05: sidebar auto-opens active process group on module route and renders clean placeholder card", async ({
    page,
  }) => {
    await setViewportMode(page, "desktop");
    await loginViaUi(page, TEST_PERSONAS.admin);
    await page.goto("/dashboard/clientes");

    const sidebar = page.locator(
      'aside[aria-label="Menú principal de la empresa"]',
    );
    const ventasBtn = sidebar.getByRole("button", { name: /Ventas/i });
    await expect(ventasBtn).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("main").getByText("Pronto")).toBeVisible();
  });

  test("T2-F1-06: static token audit confirms 0 literal HEX, 0 text-kleanly, and 0 text-white contrast traps in shell components", async () => {
    const shellFiles = [
      "apps/web/src/features/dashboard/components/DashboardSidebar.tsx",
      "apps/web/src/features/dashboard/components/DashboardHeader.tsx",
      "apps/web/src/features/dashboard/components/WebMobileTabBar.tsx",
      "apps/web/src/features/dashboard/components/PendingInvitationsBanner.tsx",
      "apps/web/src/features/dashboard/components/ModulesSidebar.tsx",
      "apps/web/src/components/ui/Badge.tsx",
    ].map((rel) => path.join(REPO_ROOT, rel));

    const violations = scanFilesForTokenViolations(shellFiles, REPO_ROOT);
    expect(violations).toEqual([]);
  });
});
