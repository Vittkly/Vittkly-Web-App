import { expect, type Page } from "@playwright/test";
import type { TestPersona } from "./fixtures";

export const VIEWPORTS = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 375, height: 812 },
} as const;

export type ThemeMode = "light" | "dark";

export async function setViewportMode(
  page: Page,
  mode: keyof typeof VIEWPORTS,
): Promise<void> {
  await page.setViewportSize(VIEWPORTS[mode]);
}

export async function applyTheme(page: Page, theme: ThemeMode): Promise<void> {
  await page.emulateMedia({ colorScheme: theme });
  await page.evaluate((targetTheme) => {
    try {
      window.localStorage.setItem("theme", targetTheme);
    } catch {
      // Ignore storage access restrictions
    }
    const root = document.documentElement;
    root.setAttribute("data-theme", targetTheme);
    if (targetTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, theme);
  await page.waitForTimeout(100);
}

export async function loginViaUi(
  page: Page,
  persona: TestPersona,
): Promise<void> {
  await page.goto("/login");
  await page.locator("#lgU").fill(persona.email);
  await page.locator("#lgP").fill(persona.password);
  await page.getByRole("button", { name: /^Iniciar sesión$/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
    timeout: 30_000,
  });
}

export async function loginAndOpenDashboard(
  page: Page,
  persona: TestPersona,
): Promise<void> {
  await loginViaUi(page, persona);
  if (!page.url().includes("/dashboard")) {
    await page.goto("/dashboard");
  }
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
    timeout: 15_000,
  });
}

export async function loginAndOpenActivityTab(
  page: Page,
  persona: TestPersona,
): Promise<void> {
  await loginViaUi(page, persona);
  await page.goto("/dashboard/configuraciones?tab=actividad");
  const activityTab = page.getByRole("tab", { name: /^Actividad$/i });
  await expect(activityTab).toBeVisible({ timeout: 15_000 });
  await expect(async () => {
    if ((await activityTab.getAttribute("aria-selected")) !== "true") {
      await activityTab.click();
    }
    await expect(activityTab).toHaveAttribute("aria-selected", "true", {
      timeout: 1_000,
    });
  }).toPass({ timeout: 15_000 });
}
