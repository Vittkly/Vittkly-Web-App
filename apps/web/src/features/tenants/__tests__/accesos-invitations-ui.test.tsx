import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AccesosEmpresaView } from "../components/AccesosEmpresaView";
import type { MisAccesosData } from "../types/tenants.types";

const mockReplace = vi.fn();
const mockRefresh = vi.fn();
const mockRespondInvitationAction = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: (...args: unknown[]) => mockReplace(...args),
    refresh: () => mockRefresh(),
  }),
}));

vi.mock("@/features/auth/actions/auth.actions", () => ({
  logoutAction: vi.fn(),
}));

vi.mock("../actions/tenants.actions", () => ({
  enterCompanyAction: vi.fn(),
  respondInvitationAction: (...args: unknown[]) =>
    mockRespondInvitationAction(...args),
  requestExitAction: vi.fn(),
  requestExitSupportAction: vi.fn(),
  createAdditionalCompanyAction: vi.fn(),
}));

function buildMockData(accesoWeb: boolean): MisAccesosData {
  return {
    usuario: {
      id: "user-1",
      nombre: "Andrea López",
      correo: "andrea@vittkly.com",
      ultima_empresa_id: null,
      prueba_usada_en: null,
    },
    cuenta_actual: null,
    empresas_propias: [],
    empresas_miembro: [],
    invitaciones: [
      {
        id: "11111111-1111-4111-8111-111111111111",
        empresa_id: "22222222-2222-4222-8222-222222222222",
        empresa_nombre: "Vitta Norte",
        perfil_id: "33333333-3333-4333-8333-333333333333",
        perfil_nombre: "Supervisor de Ruta",
        acceso_web: accesoWeb,
        acceso_app: true,
        invitador_nombre: "Carlos Mateo",
        vence_en: "2026-12-01T00:00:00Z",
        creado_en: "2026-11-16T00:00:00Z",
      },
    ],
  };
}

describe("AccesosEmpresaView — flujo de invitaciones y banner tipado sin NEXT_REDIRECT", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra banner verde (success-soft/success-ink) y navega con ?stay=1 + router.refresh() al aceptar acceso web", async () => {
    mockRespondInvitationAction.mockResolvedValue({
      ok: true,
      message:
        "Invitación aceptada correctamente. Ya puedes entrar a Vitta Norte.",
      data: {
        accepted: true,
        accesoWeb: true,
        empresaNombre: "Vitta Norte",
      },
    });

    render(<AccesosEmpresaView data={buildMockData(true)} />);

    fireEvent.click(screen.getByRole("button", { name: /Aceptar/i }));

    const banner = await screen.findByTestId("accesos-feedback-banner");
    expect(banner).toHaveAttribute("data-tone", "success");
    expect(banner.className).toContain("bg-success-soft");
    expect(banner.className).toContain("text-success-ink");
    expect(banner).toHaveTextContent(
      "Invitación aceptada correctamente. Ya puedes entrar a Vitta Norte.",
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/accesos?stay=1");
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });

  it("muestra banner warning cuando la invitación aceptada es exclusiva de app móvil", async () => {
    mockRespondInvitationAction.mockResolvedValue({
      ok: true,
      message:
        "Invitación aceptada. Tu acceso en Vitta Norte es exclusivo desde la app móvil.",
      data: {
        accepted: true,
        accesoWeb: false,
        empresaNombre: "Vitta Norte",
      },
    });

    render(<AccesosEmpresaView data={buildMockData(false)} />);

    fireEvent.click(screen.getByRole("button", { name: /Aceptar/i }));

    const banner = await screen.findByTestId("accesos-feedback-banner");
    expect(banner).toHaveAttribute("data-tone", "warning");
    expect(banner.className).toContain("bg-warning-soft");
    expect(banner).toHaveTextContent(
      "Invitación aceptada. Tu acceso en Vitta Norte es exclusivo desde la app móvil.",
    );
    expect(mockReplace).toHaveBeenCalledWith("/accesos?stay=1");
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it("muestra banner neutro al rechazar invitación y refresca la vista sin cambiar query", async () => {
    mockRespondInvitationAction.mockResolvedValue({
      ok: true,
      message: "Invitación rechazada.",
      data: {
        accepted: false,
        accesoWeb: false,
        empresaNombre: "",
      },
    });

    render(<AccesosEmpresaView data={buildMockData(true)} />);

    fireEvent.click(screen.getByRole("button", { name: /Rechazar/i }));
    fireEvent.click(screen.getByRole("button", { name: /Confirmar rechazo/i }));

    const banner = await screen.findByTestId("accesos-feedback-banner");
    expect(banner).toHaveAttribute("data-tone", "neutral");
    expect(banner).toHaveTextContent("Invitación rechazada.");
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it("sanitiza errores evitando imprimir literalmente NEXT_REDIRECT en la interfaz", async () => {
    mockRespondInvitationAction.mockResolvedValue({
      ok: false,
      error: "NEXT_REDIRECT",
    });

    render(<AccesosEmpresaView data={buildMockData(true)} />);

    fireEvent.click(screen.getByRole("button", { name: /Aceptar/i }));

    const banner = await screen.findByTestId("accesos-feedback-banner");
    expect(banner).toHaveAttribute("data-tone", "error");
    expect(banner).toHaveTextContent("No se pudo aceptar la invitación.");
    expect(banner.textContent).not.toContain("NEXT_REDIRECT");
  });
});
