import React, { useRef, useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { MobileOnlyAccessModal } from "../components/MobileOnlyAccessModal";
import { AccesosEmpresaView } from "../components/AccesosEmpresaView";
import { LoginForm } from "../../auth/components/LoginForm";
import type { MisAccesosData } from "../types/tenants.types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("../../auth/actions/auth.actions", () => ({
  loginAction: vi.fn(),
  logoutAction: vi.fn(),
}));

const mockEnterCompanyAction = vi.fn();

vi.mock("../actions/tenants.actions", () => ({
  enterCompanyAction: (...args: unknown[]) => mockEnterCompanyAction(...args),
  respondInvitationAction: vi.fn(),
  requestExitAction: vi.fn(),
  requestExitSupportAction: vi.fn(),
  createAdditionalCompanyAction: vi.fn(),
}));

function FocusHarness() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        data-testid="open-mobile-modal-btn"
      >
        Abrir
      </button>
      <MobileOnlyAccessModal
        isOpen={open}
        mode="accesos"
        company={{
          nombre: "ClimaTech Peru",
          perfilNombre: "Supervisor",
          accesoWeb: false,
          accesoApp: true,
        }}
        onClose={() => setOpen(false)}
        returnFocusRef={triggerRef}
      />
    </div>
  );
}

describe("Acceso exclusivo desde la app móvil (MobileOnlyAccessModal + Accesos + Login)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders dynamic company/profile copy in mode='accesos' without coupling to técnicos, and restores focus on Escape", async () => {
    render(<FocusHarness />);

    const trigger = screen.getByTestId("open-mobile-modal-btn");
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Acceso exclusivo desde la app móvil",
      }),
    ).toBeInTheDocument();

    // Copy personalizado y agnóstico de método de login
    expect(dialog).toHaveTextContent(
      /Tu usuario en ClimaTech Peru \(perfil: Supervisor\) fue asignado únicamente para operar desde la app móvil de Vittkly/i,
    );
    expect(dialog).not.toHaveTextContent(/Los técnicos entran/i);
    expect(dialog).toHaveTextContent(/correo y contraseña/i);
    expect(dialog).toHaveTextContent(/celular registrado/i);
    expect(dialog).toHaveTextContent(/Selecciona ClimaTech Peru/i);
    expect(dialog).toHaveTextContent(/Próximamente en/i);
    expect(dialog).toHaveTextContent(/Configuraciones → Usuarios y perfiles/i);

    const closeBtn = screen.getByRole("button", { name: "Entendido" });
    expect(closeBtn).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Volver a iniciar sesión/i }),
    ).not.toBeInTheDocument();

    // Escape cierra el modal y restaura el foco al disparador
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await new Promise((r) => setTimeout(r, 20));
    expect(document.activeElement).toBe(trigger);
  });

  it("handles zero-channel edge case (accesoWeb=false & accesoApp=false) without showing mobile app download steps", () => {
    render(
      <MobileOnlyAccessModal
        isOpen={true}
        mode="accesos"
        company={{
          nombre: "EcoServicios",
          perfilNombre: "Cajero Personalizado",
          accesoWeb: false,
          accesoApp: false,
        }}
        onClose={vi.fn()}
      />,
    );

    const dialog = screen.getByRole("dialog");
    expect(
      screen.getByRole("heading", {
        name: "Sin canales de acceso habilitados",
      }),
    ).toBeInTheDocument();
    expect(dialog).toHaveTextContent(
      /Tu usuario no tiene canales de acceso habilitados en EcoServicios\. Contacta al administrador de la empresa\./i,
    );
    expect(
      screen.queryByText(/Descarga la app de Vittkly/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/App Store/i)).not.toBeInTheDocument();
  });

  it("shows multi-company mobile-only banner in AccesosEmpresaView and opens personalized modal on company click", async () => {
    const mobileOnlyData: MisAccesosData = {
      usuario: {
        id: "user-mob-1",
        nombre: "Andrea López",
        correo: "andrea@vittkly.com",
        ultima_empresa_id: "emp-1",
        prueba_usada_en: null,
      },
      cuenta_actual: null,
      empresas_propias: [],
      empresas_miembro: [
        {
          membresia_id: "mem-1",
          empresa_id: "emp-1",
          nombre: "ClimaTech Peru",
          rubro: "Climatización",
          ciudad: "Lima",
          perfil_id: "perf-1",
          perfil_nombre: "Supervisor de Ruta",
          perfil_codigo: "supervisor",
          es_propietario: false,
          acceso_web: false,
          acceso_app: true,
        },
        {
          membresia_id: "mem-2",
          empresa_id: "emp-2",
          nombre: "Vitta Norte",
          rubro: "Saneamiento",
          ciudad: "Trujillo",
          perfil_id: "perf-2",
          perfil_nombre: "Operario Senior",
          perfil_codigo: "",
          es_propietario: false,
          acceso_web: false,
          acceso_app: false,
        },
      ],
      invitaciones: [],
    };

    render(<AccesosEmpresaView data={mobileOnlyData} />);

    // Banner visible aunque pertenezca a 2 empresas (corregido frente a totalEmpresas === 1)
    const banner = screen.getByTestId("all-mobile-only-banner");
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveTextContent(
      /Tu usuario fue asignado únicamente a la app móvil/i,
    );

    // Badge correcto "Sin acceso" para (false, false) en lugar de "Solo web"
    expect(screen.getByText("Sin acceso")).toBeInTheDocument();
    expect(screen.queryByText("Solo web")).not.toBeInTheDocument();

    // Sigue disponible el flujo para crear empresa propia
    expect(screen.getByText(/Crear una empresa/i)).toBeInTheDocument();

    // Hacer clic en el botón del banner abre el modal y "Entendido" restaura el foco al botón
    const bannerButton = screen.getByRole("button", {
      name: /Ver cómo entrar en la app/i,
    });
    bannerButton.focus();
    fireEvent.click(bannerButton);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Entendido" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await new Promise((r) => setTimeout(r, 20));
    expect(document.activeElement).toBe(bannerButton);

    // Hacer clic en "ClimaTech Peru" abre el modal personalizado para esa empresa sin llamar enterCompanyAction
    const climatechBtn = screen.getByRole("button", {
      name: /ClimaTech Peru/i,
    });
    climatechBtn.focus();
    fireEvent.click(climatechBtn);
    expect(mockEnterCompanyAction).not.toHaveBeenCalled();

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent(/ClimaTech Peru/i);
    expect(dialog).toHaveTextContent(/Supervisor de Ruta/i);

    fireEvent.click(screen.getByRole("button", { name: "Entendido" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await new Promise((r) => setTimeout(r, 20));
    expect(document.activeElement).toBe(climatechBtn);

    // Hacer clic en "Vitta Norte" (false, false) abre la variante de cero canales
    fireEvent.click(screen.getByRole("button", { name: /Vitta Norte/i }));
    expect(
      screen.getByRole("heading", {
        name: "Sin canales de acceso habilitados",
      }),
    ).toBeInTheDocument();
  });

  it("renders mode='login' modal from LoginForm with '← Volver a iniciar sesión'", () => {
    render(<LoginForm />);

    const btn = screen.getByRole("button", { name: /Soy técnico/i });
    fireEvent.click(btn);

    const dialog = screen.getByRole("dialog");
    expect(
      screen.getByRole("heading", {
        name: "Acceso exclusivo desde la app móvil",
      }),
    ).toBeInTheDocument();
    expect(dialog).toHaveTextContent(/Selecciona tu empresa/i);
    expect(
      screen.getByRole("button", { name: /Volver a iniciar sesión/i }),
    ).toBeInTheDocument();
  });
});
