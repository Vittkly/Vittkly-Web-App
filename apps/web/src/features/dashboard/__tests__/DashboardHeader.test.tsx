import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

const mockSetTheme = vi.fn();

vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: "light",
    setTheme: mockSetTheme,
  }),
}));

import { DashboardHeader } from "../components/DashboardHeader";

describe("DashboardHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no muestra badge falso '1' ni alertas ficticias cuando notificationCount es 0 o se omite", () => {
    render(
      <DashboardHeader
        title="Inicio"
        subtitle="Resumen del negocio: ventas, servicios, distritos y cobros"
        userName="Carlos Pérez"
        userRole="Propietario"
      />,
    );

    expect(screen.queryByText("Manuel Arteaga")).not.toBeInTheDocument();
    expect(screen.queryByText(/Mantenimiento Surco/i)).not.toBeInTheDocument();
    expect(screen.queryByText("1 urgente")).not.toBeInTheDocument();

    const bell = screen.getByRole("button", { name: /^Avisos$/i });
    expect(bell).toBeInTheDocument();
    expect(bell.textContent?.trim()).toBe("");

    fireEvent.click(bell);
    const dialog = screen.getByRole("dialog", { name: "Avisos" });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("No tienes avisos pendientes")).toBeInTheDocument();
    expect(dialog.className).toContain("max-w-[calc(100vw-24px)]");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(
      screen.queryByRole("dialog", { name: "Avisos" }),
    ).not.toBeInTheDocument();
  });

  it("muestra el contador real de notificaciones y '99+' cuando supera 99", () => {
    const { rerender } = render(<DashboardHeader notificationCount={4} />);

    const bell = screen.getByRole("button", { name: /Avisos: 4 por atender/i });
    expect(bell).toHaveTextContent("4");
    fireEvent.click(bell);
    expect(screen.getByText("Tienes 4 avisos por atender")).toBeInTheDocument();

    rerender(<DashboardHeader notificationCount={120} />);
    expect(
      screen.getByRole("button", { name: /Avisos: 120/i }),
    ).toHaveTextContent("99+");
  });

  it("no trunca el subtítulo y oculta el enlace de Configuraciones en móvil", () => {
    const longSubtitle =
      "Resumen completo del negocio sin recorte involuntario en pantallas pequeñas";
    render(<DashboardHeader subtitle={longSubtitle} canAccessConfig />);

    const sub = screen.getByText(longSubtitle);
    expect(sub.className).not.toContain("truncate");

    const configLink = screen.getByRole("link", { name: "Configuraciones" });
    expect(configLink).toHaveAttribute("href", "/dashboard/configuraciones");
    expect(configLink.className).toContain("hidden");
    expect(configLink.className).toContain("lg:inline-flex");
  });

  it("abre el modal de ayuda accesible fuera del banner (sin backdrop-blur-md) y lo cierra con Escape o clic en el fondo", () => {
    render(
      <DashboardHeader
        userRole="Administrador"
        canAccessConfig={false}
        canAccessAcademy
      />,
    );

    const banner = screen.getByRole("banner");
    expect(banner.className).toContain("bg-surface-raised");
    expect(banner.className).not.toContain("backdrop-blur-md");

    expect(
      screen.queryByRole("link", { name: "Configuraciones" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Centro de ayuda" }));
    const dialog = screen.getByRole("dialog", {
      name: /Centro de Ayuda Vittkly/i,
    });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(banner).not.toContainElement(dialog);
    expect(
      screen.getByRole("link", { name: /Manuales del perfil y Academy/i }),
    ).toHaveAttribute("href", "/dashboard/academia");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(
      screen.queryByRole("dialog", { name: /Centro de Ayuda Vittkly/i }),
    ).not.toBeInTheDocument();
  });

  it("incluye el selector de tema claro/oscuro en la cabecera", () => {
    render(<DashboardHeader />);
    const toggle = screen.getByRole("button", {
      name: /Cambiar a modo oscuro/i,
    });
    fireEvent.click(toggle);
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });
});
