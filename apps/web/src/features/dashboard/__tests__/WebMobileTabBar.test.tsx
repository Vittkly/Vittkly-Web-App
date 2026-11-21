import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";

const mockUsePathname = vi.fn(() => "/dashboard");

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

vi.mock("@/features/auth/actions/auth.actions", () => ({
  logoutAction: vi.fn(),
}));

vi.mock("@/features/tenants/actions/tenants.actions", () => ({
  selectOrganizationAction: vi.fn(),
}));

import { WebMobileTabBar } from "../components/WebMobileTabBar";

describe("WebMobileTabBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue("/dashboard");
  });

  it("retorna null cuando no hay módulos ni acceso a configuraciones", () => {
    const { container } = render(
      <WebMobileTabBar allowedModules={[]} canAccessConfig={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("muestra hasta 4 accesos primarios más el botón 'Más' y abre el cajón agrupado por proceso", () => {
    render(
      <WebMobileTabBar
        allowedModules={[
          "dashboard",
          "calendario",
          "trabajos",
          "clientes",
          "cotizaciones",
          "cobranzas",
          "reportes",
        ]}
        canAccessConfig
        activeOrganizationId="org-1"
        organizations={[
          {
            id: "org-1",
            name: "Vitta Norte",
            roleName: "Dueño",
            isOwner: true,
          },
          { id: "org-2", name: "Vitta Sur", roleName: "Admin", isOwner: false },
        ]}
        pendingInvitationsCount={2}
        activeProfile={{
          nombre: "Dueño",
          codigo: "owner",
          esPropietario: true,
        }}
      />,
    );

    const nav = screen.getByRole("navigation", { name: "Navegación móvil" });
    expect(
      within(nav).getByRole("link", { name: "Inicio" }),
    ).toBeInTheDocument();
    expect(
      within(nav).getByRole("link", { name: "Calendario" }),
    ).toBeInTheDocument();
    expect(
      within(nav).getByRole("link", { name: "Trabajos" }),
    ).toBeInTheDocument();
    expect(
      within(nav).getByRole("link", { name: "Clientes" }),
    ).toBeInTheDocument();

    const moreBtn = within(nav).getByRole("button", { name: "Más" });
    expect(moreBtn).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(moreBtn);
    expect(moreBtn).toHaveAttribute("aria-expanded", "true");

    const drawer = screen.getByRole("dialog", { name: "Más módulos" });
    expect(drawer).toHaveAttribute("aria-modal", "true");

    // Módulos restantes agrupados sin duplicar los 4 de la barra principal
    expect(within(drawer).getByText("Ventas")).toBeInTheDocument();
    expect(
      within(drawer).getByRole("link", { name: "Cotizaciones" }),
    ).toBeInTheDocument();
    expect(within(drawer).getByText("Finanzas")).toBeInTheDocument();
    expect(
      within(drawer).getByRole("link", { name: "Cobranzas" }),
    ).toBeInTheDocument();
    expect(within(drawer).getByText("General")).toBeInTheDocument();
    expect(
      within(drawer).getByRole("link", { name: "Reportes" }),
    ).toBeInTheDocument();
    expect(
      within(drawer).queryByRole("link", { name: "Clientes" }),
    ).not.toBeInTheDocument();

    // Cuenta y accesos
    expect(
      within(drawer).getByRole("link", { name: "Configuraciones" }),
    ).toHaveAttribute("href", "/dashboard/configuraciones");
    expect(
      within(drawer).getByRole("link", { name: /Cambiar de empresa/i }),
    ).toHaveAttribute("href", "/accesos");
    expect(
      within(drawer).getByRole("button", { name: "Cerrar sesión" }),
    ).toBeInTheDocument();

    // Cambio rápido de empresa
    expect(within(drawer).getByText("Vitta Sur")).toBeInTheDocument();

    // Cierre con Escape restaura foco al botón 'Más'
    fireEvent.keyDown(document, { key: "Escape" });
    expect(
      screen.queryByRole("dialog", { name: "Más módulos" }),
    ).not.toBeInTheDocument();
    expect(moreBtn).toHaveFocus();

    // Cierre con botón Cerrar también restaura foco al botón 'Más'
    fireEvent.click(moreBtn);
    const closeBtn = screen.getByRole("button", { name: "Cerrar menú Más" });
    fireEvent.click(closeBtn);
    expect(
      screen.queryByRole("dialog", { name: "Más módulos" }),
    ).not.toBeInTheDocument();
    expect(moreBtn).toHaveFocus();
  });

  it("oculta Configuraciones en el cajón 'Más' cuando canAccessConfig es false", () => {
    render(
      <WebMobileTabBar
        allowedModules={[
          "dashboard",
          "calendario",
          "trabajos",
          "clientes",
          "cotizaciones",
        ]}
        canAccessConfig={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Más" }));
    const drawer = screen.getByRole("dialog", { name: "Más módulos" });
    expect(
      within(drawer).queryByRole("link", { name: "Configuraciones" }),
    ).not.toBeInTheDocument();
    expect(
      within(drawer).getByRole("link", { name: "Cotizaciones" }),
    ).toBeInTheDocument();
  });
});
