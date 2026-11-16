import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

const mockSaveProfileAction = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/clientes",
}));

vi.mock("@/features/auth/actions/auth.actions", () => ({
  logoutAction: vi.fn(),
}));

vi.mock("@/features/tenants/actions/tenants.actions", () => ({
  selectOrganizationAction: vi.fn(),
}));

vi.mock("@/features/settings/actions/users-profiles.actions", () => ({
  saveProfileAction: (...args: unknown[]) => mockSaveProfileAction(...args),
}));

import { DashboardSidebar } from "../components/DashboardSidebar";
import { NoModulesAssignedView } from "../components/NoModulesAssignedView";
import { ProfileFormModal } from "@/features/settings/components/ProfileFormModal";
import { getPlanModuleCodes } from "@vittkly/shared";

describe("Procesos vs. Módulos (Sidebar, Plan Gating y Caso Borde 0 módulos)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSaveProfileAction.mockResolvedValue({ success: true });
  });

  it("muestra únicamente Ventas (Clientes, Cotizaciones) y Finanzas (Cobranzas) cuando el perfil solo tiene esos 3 módulos", () => {
    render(
      <DashboardSidebar
        allowedModules={["clientes", "cotizaciones", "cobranzas"]}
        canAccessConfig={false}
        activeProfile={{
          nombre: "Cobranzas Junior",
          codigo: "custom_123",
          esPropietario: false,
        }}
      />,
    );

    // Procesos visibles
    expect(screen.getByText("Ventas")).toBeInTheDocument();
    expect(screen.getByText("Finanzas")).toBeInTheDocument();

    // Contenedores vacíos y enlaces directos sin permiso ocultos
    expect(screen.queryByText("Inicio")).not.toBeInTheDocument();
    expect(screen.queryByText("Calendario")).not.toBeInTheDocument();
    expect(screen.queryByText("Operación")).not.toBeInTheDocument();
    expect(screen.queryByText("Equipo")).not.toBeInTheDocument();
    expect(screen.queryByText("Crecimiento")).not.toBeInTheDocument();
    expect(screen.queryByText("Reportes")).not.toBeInTheDocument();
    expect(screen.queryByText("Configuraciones")).not.toBeInTheDocument();
    expect(screen.queryByText("Ocurrencias")).not.toBeInTheDocument();

    // Expandir Ventas y Finanzas muestra únicamente sus hijos habilitados
    fireEvent.click(screen.getByRole("button", { name: /Ventas/i }));
    fireEvent.click(screen.getByRole("button", { name: /Finanzas/i }));

    expect(screen.getByText("Clientes")).toBeInTheDocument();
    expect(screen.getByText("Cotizaciones")).toBeInTheDocument();
    expect(screen.getByText("Cobranzas")).toBeInTheDocument();

    expect(screen.queryByText("Comprobantes")).not.toBeInTheDocument();
    expect(screen.queryByText("Liquidaciones")).not.toBeInTheDocument();
    expect(screen.queryByText("Caja y bancos")).not.toBeInTheDocument();
    expect(screen.queryByText("Rentabilidad")).not.toBeInTheDocument();
  });

  it("oculta Expandir/Plegar todo cuando solo tiene módulos raíz sin procesos contenedores", () => {
    render(
      <DashboardSidebar
        allowedModules={["dashboard"]}
        canAccessConfig={false}
        activeProfile={{
          nombre: "Solo Inicio",
          codigo: "custom_root",
          esPropietario: false,
        }}
      />,
    );

    expect(screen.getByText("Inicio")).toBeInTheDocument();
    expect(screen.queryByText("Expandir todo")).not.toBeInTheDocument();
    expect(screen.queryByText("Ventas")).not.toBeInTheDocument();
  });

  it("ProfileFormModal muestra los 19 módulos individuales sin checkboxes contenedores y deshabilita módulos fuera de plan Inicia", () => {
    const iniciaModules = getPlanModuleCodes("inicia");

    render(
      <ProfileFormModal
        isOpen
        onClose={vi.fn()}
        mode="create"
        sourceProfile={null}
        allProfiles={[]}
        activePlanCode="inicia"
        allowedPlanModules={iniciaModules}
      />,
    );

    // Los 19 checkboxes individuales deben renderizarse junto con sus badges de plan
    expect(screen.getByText("Inicio")).toBeInTheDocument();
    expect(screen.getByText("Personal")).toBeInTheDocument();
    expect(screen.getByText("Sitio web y reservas")).toBeInTheDocument();
    expect(screen.queryByText("Ocurrencias")).not.toBeInTheDocument();

    expect(screen.getAllByText("Disponible en plan Crece")).toHaveLength(6);
    expect(screen.getAllByText("Disponible en plan Empresa")).toHaveLength(3);

    const marketingLabel = screen
      .getByText("Marketing")
      .closest("label") as HTMLLabelElement;
    const marketingCheckbox = marketingLabel.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    expect(marketingCheckbox.disabled).toBe(true);
  });

  it("NoModulesAssignedView renderiza mensaje bloqueado con acciones Cambiar de empresa y Cerrar sesión", () => {
    render(
      <NoModulesAssignedView
        companyName="Servicios Vitta"
        userName="Carlos"
        profileName="Sin acceso"
      />,
    );

    expect(
      screen.getByText(
        /Tu perfil actual no tiene ningún módulo asignado\. Contacta al administrador de tu empresa para solicitar acceso\./i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Cambiar de empresa/i }),
    ).toHaveAttribute("href", "/accesos");
    expect(
      screen.getByRole("button", { name: /Cerrar sesión/i }),
    ).toBeInTheDocument();
  });
});
