import React from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";

import { TenantDashboardView } from "../components/TenantDashboardView";
import { Badge } from "@/components/ui/Badge";
import { PendingInvitationsBanner } from "../components/PendingInvitationsBanner";

describe("TenantDashboardView, Badge y PendingInvitationsBanner", () => {
  it("renderiza campos de fecha 'desde' y 'hasta' al elegir 'Rango' y normaliza rangos invertidos", () => {
    render(<TenantDashboardView companyName="Vitta Kleanly" />);

    const rangoBtn = screen.getByRole("button", { name: "Rango" });
    fireEvent.click(rangoBtn);
    expect(rangoBtn).toHaveAttribute("aria-pressed", "true");

    const fromInput = screen.getByLabelText("Fecha desde") as HTMLInputElement;
    const toInput = screen.getByLabelText("Fecha hasta") as HTMLInputElement;
    expect(fromInput).toHaveAttribute("type", "date");
    expect(toInput).toHaveAttribute("type", "date");

    fireEvent.change(fromInput, { target: { value: "2026-04-20" } });
    fireEvent.change(toInput, { target: { value: "2026-04-05" } });

    expect(screen.getByText(/2026-04-05 al 2026-04-20/)).toBeInTheDocument();
  });

  it("usa botones accesibles en el gráfico de 12 meses, oculta etiquetas impares en móvil y calcula el total según canal", () => {
    render(<TenantDashboardView companyName="Vitta Kleanly" />);

    const mayBar = screen.getByRole("button", { name: /May 2025:/i });
    const junBar = screen.getByRole("button", { name: /Jun 2025:/i });
    expect(mayBar).toHaveAttribute("aria-pressed", "false");
    expect(within(junBar).getByText("Jun").className).toContain(
      "invisible sm:visible",
    );

    fireEvent.click(mayBar);
    expect(mayBar).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("May 2025:")).toBeInTheDocument();

    // Cambiar canal a Directo oculta A365 del tooltip
    fireEvent.click(screen.getByRole("button", { name: "Directo" }));
    expect(screen.queryByText(/· A365:/)).not.toBeInTheDocument();

    // Cambiar canal a A365 oculta Particular de la leyenda y del tooltip y totaliza solo A365
    fireEvent.click(screen.getByRole("button", { name: "A365" }));
    const chartHeader = screen.getByRole("heading", {
      name: "Ventas por mes",
    }).parentElement!.parentElement!;
    expect(
      within(chartHeader).queryByText("Particular"),
    ).not.toBeInTheDocument();
    expect(within(chartHeader).getByText("A365")).toBeInTheDocument();
    expect(screen.queryByText(/Particular:/)).not.toBeInTheDocument();
    expect(mayBar.getAttribute("aria-label")).toMatch(
      /^May 2025:\s*S\/\s*2[.,]?400$/,
    );
    const tooltipContainer = screen.getByText("May 2025:").parentElement!;
    expect(within(tooltipContainer).getByText(/Total:/).textContent).toMatch(
      /S\/\s*2[.,]?400/,
    );
  });

  it("muestra el botón para expandir avisos solo cuando hay más de 6 avisos filtrados", () => {
    const { rerender } = render(
      <TenantDashboardView companyName="Vitta Kleanly" />,
    );
    expect(
      screen.getByRole("button", { name: "Ver los 8 avisos" }),
    ).toBeInTheDocument();

    rerender(
      <TenantDashboardView
        companyName="Vitta Kleanly"
        allowedModules={["dashboard", "tiempo"]}
      />,
    );
    expect(
      screen.queryByRole("button", {
        name: /Ver los .* avisos|Mostrar 6 avisos/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("oculta el footer duplicado en escritorio con lg:hidden", () => {
    render(<TenantDashboardView companyName="Vitta Kleanly" />);
    const footerText = screen.getByText("Con tecnología de");
    expect(footerText.parentElement?.className).toContain("lg:hidden");
  });

  it("Badge usa tokens de contraste semánticos sin text-white ni text-on-tenant-accent", () => {
    const { rerender } = render(<Badge variant="plan">Empresa</Badge>);
    const planEl = screen.getByText("Empresa").parentElement!;
    expect(planEl.className).toContain("text-on-primary");
    expect(planEl.className).not.toContain("text-white");

    rerender(<Badge variant="tenant">Activo</Badge>);
    const tenantEl = screen.getByText("Activo").parentElement!;
    expect(tenantEl.className).toContain("text-success-ink");
    expect(tenantEl.className).not.toContain("text-on-tenant-accent");
  });

  it("PendingInvitationsBanner envuelve texto y usa hover:bg-surface-sunken", () => {
    render(<PendingInvitationsBanner count={2} />);
    expect(
      screen.getByText("Tienes 2 invitaciones pendientes de otra empresa"),
    ).toBeInTheDocument();
    const dismissBtn = screen.getByRole("button", {
      name: "Ocultar aviso por esta sesión",
    });
    expect(dismissBtn.className).toContain("hover:bg-surface-sunken");
    expect(dismissBtn.className).not.toContain("hover:bg-surface-alt");
  });
});
