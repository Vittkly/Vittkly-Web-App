import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

const mockUsePathname = vi.fn(() => "/dashboard/trabajos");

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

vi.mock("@/features/auth/actions/auth.actions", () => ({
  logoutAction: vi.fn(),
}));

vi.mock("@/features/tenants/actions/tenants.actions", () => ({
  selectOrganizationAction: vi.fn(),
}));

import { DashboardSidebar } from "../components/DashboardSidebar";

describe("DashboardSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue("/dashboard/trabajos");
  });

  it("usa superficie bg-surface-sunken y ancho de 240px tanto en el espaciador como en el aside", () => {
    const { container } = render(
      <DashboardSidebar
        allowedModules={["dashboard", "clientes", "trabajos"]}
        canAccessConfig
      />,
    );

    const aside = screen.getByRole("complementary", {
      name: "Menú principal de la empresa",
    });
    expect(aside.className).toContain("bg-surface-sunken");
    expect(aside.className).toContain("w-[240px]");

    const spacer = container.querySelector('[aria-hidden="true"]');
    expect(spacer?.className).toContain("w-[240px]");
  });

  it("auto-abre el proceso activo para el pathname actual y se adapta al navegar", () => {
    const { rerender } = render(
      <DashboardSidebar
        allowedModules={["clientes", "trabajos", "cobranzas"]}
        canAccessConfig={false}
      />,
    );

    expect(screen.getByRole("button", { name: /Operación/i })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("button", { name: /Ventas/i })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.getByText("Trabajos")).toBeInTheDocument();

    mockUsePathname.mockReturnValue("/dashboard/cobranzas");
    rerender(
      <DashboardSidebar
        allowedModules={["clientes", "trabajos", "cobranzas"]}
        canAccessConfig={false}
      />,
    );

    expect(screen.getByRole("button", { name: /Finanzas/i })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByText("Cobranzas")).toBeInTheDocument();
  });

  it("expande el riel colapsado al recibir foco de teclado y cierra menús con Escape o clic fuera", () => {
    render(
      <DashboardSidebar
        initialCollapsed
        allowedModules={["dashboard", "cotizaciones", "clientes"]}
        organizations={[
          {
            id: "org-1",
            name: "Empresa Uno",
            roleName: "Dueño",
            isOwner: true,
          },
        ]}
        activeOrganizationId="org-1"
      />,
    );

    const aside = screen.getByRole("complementary", {
      name: "Menú principal de la empresa",
    });
    expect(aside.className).toContain("w-[64px]");

    fireEvent.focus(aside);
    expect(aside.className).toContain("w-[240px]");
    expect(aside.className).toContain("bg-surface-raised");
    expect(aside.className).toContain("shadow-2");

    const inicioLink = screen.getByRole("link", { name: "Inicio" });
    expect(inicioLink.className).toContain("hover:bg-surface-sunken");
    expect(inicioLink.className).not.toContain("hover:bg-surface-raised");

    const orgBtn = screen.getByRole("button", { name: "Cambiar de empresa" });
    fireEvent.click(orgBtn);
    expect(orgBtn).toHaveAttribute("aria-expanded", "true");

    // Abrir menú Crear cierra menú Empresa
    const crearBtn = screen.getByRole("button", { name: "Crear" });
    fireEvent.click(crearBtn);
    expect(orgBtn).toHaveAttribute("aria-expanded", "false");
    expect(crearBtn).toHaveAttribute("aria-expanded", "true");

    // Escape cierra menú Crear
    fireEvent.keyDown(document, { key: "Escape" });
    expect(crearBtn).toHaveAttribute("aria-expanded", "false");

    // Clic fuera cierra menú Empresa
    fireEvent.click(orgBtn);
    expect(orgBtn).toHaveAttribute("aria-expanded", "true");
    fireEvent.pointerDown(document.body);
    expect(orgBtn).toHaveAttribute("aria-expanded", "false");
  });

  it("abre 'Resumen del grupo' como diálogo accesible, lo cierra con Escape y restaura el foco", () => {
    render(
      <DashboardSidebar
        allowedModules={["dashboard", "reportes"]}
        canAccessConfig
        organizations={[
          {
            id: "org-1",
            name: "Empresa Uno",
            roleName: "Dueño",
            isOwner: true,
          },
        ]}
        activeOrganizationId="org-1"
      />,
    );

    const grupoBtn = screen.getByRole("button", { name: "Resumen del grupo" });
    fireEvent.click(grupoBtn);
    const dialog = screen.getByRole("dialog", { name: /Resumen del grupo/i });
    expect(dialog).toHaveAttribute("aria-modal", "true");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(
      screen.queryByRole("dialog", { name: /Resumen del grupo/i }),
    ).not.toBeInTheDocument();
    expect(grupoBtn).toHaveFocus();
  });

  it("aplica text-primary-ink a los íconos de Reportes y Configuraciones cuando están activos", () => {
    mockUsePathname.mockReturnValue("/dashboard/reportes");
    const { rerender } = render(
      <DashboardSidebar allowedModules={["reportes"]} canAccessConfig />,
    );
    const reportesLink = screen.getByRole("link", { name: "Reportes" });
    expect(reportesLink.querySelector("svg")?.getAttribute("class")).toContain(
      "text-primary-ink",
    );

    mockUsePathname.mockReturnValue("/dashboard/configuraciones");
    rerender(
      <DashboardSidebar allowedModules={["reportes"]} canAccessConfig />,
    );
    const configLink = screen.getByRole("link", { name: "Configuraciones" });
    expect(configLink.querySelector("svg")?.getAttribute("class")).toContain(
      "text-primary-ink",
    );
  });
});
