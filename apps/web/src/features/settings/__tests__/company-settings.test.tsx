import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

import { CompanySettingsForm } from "../components/CompanySettingsForm";
import { DashboardSidebar } from "../../dashboard/components/DashboardSidebar";
import { AccesosEmpresaView } from "../../tenants/components/AccesosEmpresaView";
import { CompanyAvatar } from "../../../components/brand/CompanyAvatar";
import type { CompanySettingsBundle } from "../types/settings.types";
import type { MisAccesosData } from "../../tenants/types/tenants.types";

const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: mockRefresh,
  }),
  usePathname: () => "/dashboard/configuraciones/empresa",
}));

const mockUpdateCompanySettingsAction = vi.fn();
const mockUploadCompanyBrandAssetAction = vi.fn();

vi.mock("../actions/company-settings.actions", () => ({
  updateCompanySettingsAction: (...args: unknown[]) =>
    mockUpdateCompanySettingsAction(...args),
  uploadCompanyBrandAssetAction: (...args: unknown[]) =>
    mockUploadCompanyBrandAssetAction(...args),
}));

const BASE_COMPANY_DATA: CompanySettingsBundle = {
  empresaId: "11111111-1111-4111-8111-111111111111",
  razonSocial: "Vitta Kleanly S.A.C.",
  nombreComercial: "Vitta Kleanly",
  ruc: "20609000008",
  direccion: "Av. Javier Prado Este 4200, Surco, Lima",
  rubro: "Saneamiento ambiental y limpieza industrial",
  ciudad: "Lima",
  whatsappTelefono: "+51 987 654 321",
  encabezadoDocumento: "Vitta Kleanly",
  piePaginaDocumento: "Gracias por confiar en nosotros • Garantía 30 días",
  logoRuta: null,
  iconoMenuRuta: null,
  colorMarca: "#2AA8DE",
  modeloOperacion: "ambos",
  menuAcordeon: false,
  canEdit: true,
};

describe("Submódulo /dashboard/configuraciones/empresa (VIT-65)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateCompanySettingsAction.mockResolvedValue({ success: true });
  });

  it("renders Card 1 (Empresa, Marca, Datos para los documentos) and Card 2 (Menú y modelo de operación)", () => {
    render(<CompanySettingsForm initialData={BASE_COMPANY_DATA} />);

    expect(
      screen.getByRole("heading", { name: "Empresa" }),
    ).toBeInTheDocument();
    expect(screen.getByText("MARCA")).toBeInTheDocument();
    expect(
      screen.getByText("LOGO DE LA EMPRESA (DOCUMENTOS)"),
    ).toBeInTheDocument();
    expect(screen.getByText("ÍCONO DEL MENÚ (CUADRADO)")).toBeInTheDocument();
    expect(screen.getByText("COLOR PRINCIPAL")).toBeInTheDocument();
    expect(screen.getByText("DATOS PARA LOS DOCUMENTOS")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Menú y modelo de operación" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Aplica a la empresa activa (Vitta Kleanly)."),
    ).toBeInTheDocument();
    expect(screen.getByText("Por visita")).toBeInTheDocument();
    expect(screen.getByText("Por contrato")).toBeInTheDocument();
    expect(screen.getByText("Ambos")).toBeInTheDocument();
    expect(
      screen.getByText("Abrir un solo grupo del menú a la vez"),
    ).toBeInTheDocument();
  });

  it("sanitizes RUC in real time, validates SUNAT Module-11, and allows empty RUC conditionally", async () => {
    render(<CompanySettingsForm initialData={BASE_COMPANY_DATA} />);

    const rucInput = screen.getByLabelText("RUC") as HTMLInputElement;
    const saveBtn = screen.getByTestId("company-save-btn") as HTMLButtonElement;

    // Initially not dirty -> save button disabled
    expect(saveBtn).toBeDisabled();

    // Enter letters, dashes, and >11 chars -> sanitized to 11 digits
    fireEvent.change(rucInput, {
      target: { value: "AB-20609000009-999" },
    });
    expect(rucInput.value).toBe("20609000009");

    // 20609000009 has an invalid check digit -> shows error and disables save
    expect(screen.getByTestId("ruc-validation-error")).toBeInTheDocument();
    expect(saveBtn).toBeDisabled();

    // Clearing RUC completely is allowed (newly created company without RUC yet)
    fireEvent.change(rucInput, { target: { value: "" } });
    expect(
      screen.queryByTestId("ruc-validation-error"),
    ).not.toBeInTheDocument();
    expect(saveBtn).not.toBeDisabled();
  });

  it("updates operation model ('visita' | 'contrato' | 'ambos') and menuAcordeon and submits via Server Action", async () => {
    render(<CompanySettingsForm initialData={BASE_COMPANY_DATA} />);

    const porVisitaCard = screen.getByTestId("operation-model-visita");
    const radioInput = porVisitaCard.querySelector(
      'input[type="radio"]',
    ) as HTMLInputElement;
    fireEvent.click(radioInput);

    const accordionCheckbox = screen.getByRole("checkbox", {
      name: /Abrir un solo grupo del menú a la vez/i,
    });
    fireEvent.click(accordionCheckbox);

    expect(screen.getByTestId("accordion-status-helper")).toHaveTextContent(
      "Activado: al abrir un grupo del menú lateral se cierran los demás.",
    );

    const saveBtn = screen.getByTestId("company-save-btn");
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockUpdateCompanySettingsAction).toHaveBeenCalledWith(
        expect.objectContaining({
          razonSocial: "Vitta Kleanly S.A.C.",
          nombreComercial: "Vitta Kleanly",
          ruc: "20609000008",
          modeloOperacion: "visita",
          menuAcordeon: true,
        }),
      );
    });
  });

  it("renders read-only banner and disables all controls when canEdit is false", () => {
    render(
      <CompanySettingsForm
        initialData={{ ...BASE_COMPANY_DATA, canEdit: false }}
      />,
    );

    expect(screen.getByTestId("company-readonly-banner")).toBeInTheDocument();
    expect(screen.getByLabelText("NOMBRE DE LA EMPRESA")).toBeDisabled();
    expect(screen.getByLabelText("RUC")).toBeDisabled();
    expect(screen.getByTestId("company-save-btn")).toBeDisabled();
  });

  it("enforces single-group accordion in DashboardSidebar when menuAcordeon is true", () => {
    render(
      <DashboardSidebar
        allowedModules={["clientes", "trabajos", "cobranzas"]}
        canAccessConfig={true}
        menuAcordeon={true}
      />,
    );

    const ventasBtn = screen.getByRole("button", { name: "Ventas" });
    const operacionBtn = screen.getByRole("button", { name: "Operación" });

    // Open Clientes y Ventas
    fireEvent.click(ventasBtn);
    expect(ventasBtn).toHaveAttribute("aria-expanded", "true");
    expect(operacionBtn).toHaveAttribute("aria-expanded", "false");

    // Open Operación -> Clientes y Ventas closes automatically
    fireEvent.click(operacionBtn);
    expect(operacionBtn).toHaveAttribute("aria-expanded", "true");
    expect(ventasBtn).toHaveAttribute("aria-expanded", "false");
  });

  it("renders uploaded company logos/icons in AccesosEmpresaView (al seleccionar empresa e invitaciones)", () => {
    const accesosData: MisAccesosData = {
      usuario: {
        id: "user-1",
        nombre: "Wilmer Abanto",
        correo: "wilmer@vittkly.com",
        ultima_empresa_id: "emp-own-1",
        prueba_usada_en: null,
      },
      cuenta_actual: {
        cuenta_id: "cta-1",
        cuenta_nombre: "Vitta Group",
        plan_codigo: "empresa",
        plan_nombre: "Empresa",
        precio_mensual_centimos: 14900,
        empresa_actual_nombre: "Vitta Kleanly",
      },
      empresas_propias: [
        {
          membresia_id: "mem-1",
          empresa_id: "emp-own-1",
          nombre: "Vitta Kleanly",
          rubro: "Saneamiento",
          ciudad: "Lima",
          logo_ruta: "https://cdn.example.com/vitta-doc-logo.png",
          icono_menu_ruta: null,
          color_marca: "#2AA8DE",
          perfil_id: "perf-1",
          perfil_nombre: "Administrador",
          perfil_codigo: "administrador",
          es_propietario: true,
          acceso_web: true,
          acceso_app: true,
        },
      ],
      empresas_miembro: [
        {
          membresia_id: "mem-2",
          empresa_id: "emp-mem-1",
          nombre: "ClimaTech Peru",
          rubro: "Climatización",
          ciudad: "Arequipa",
          logo_ruta: "https://cdn.example.com/climatech-logo.png",
          icono_menu_ruta: "https://cdn.example.com/climatech-icon.png",
          color_marca: "#157AA8",
          perfil_id: "perf-2",
          perfil_nombre: "Supervisor",
          perfil_codigo: "supervisor",
          es_propietario: false,
          acceso_web: true,
          acceso_app: true,
        },
      ],
      invitaciones: [
        {
          id: "inv-1",
          empresa_id: "emp-inv-1",
          empresa_nombre: "EcoClean SAC",
          empresa_logo_ruta: "https://cdn.example.com/ecoclean-logo.png",
          empresa_icono_menu_ruta: null,
          empresa_color_marca: "#3EC49B",
          perfil_id: "perf-3",
          perfil_nombre: "Coordinador",
          invitador_nombre: "Carlos",
          acceso_web: true,
          acceso_app: true,
          vence_en: "2026-12-01T00:00:00Z",
          creado_en: "2026-11-10T00:00:00Z",
        },
      ],
    };

    render(<AccesosEmpresaView data={accesosData} />);

    // Fallback a logo_ruta cuando icono_menu_ruta es null
    const vittaImg = screen.getByAltText("Vitta Kleanly") as HTMLImageElement;
    expect(vittaImg.src).toBe("https://cdn.example.com/vitta-doc-logo.png");
    expect(vittaImg.className).toContain("object-contain");

    // Prioriza icono_menu_ruta sobre logo_ruta
    const climatechImg = screen.getByAltText(
      "ClimaTech Peru",
    ) as HTMLImageElement;
    expect(climatechImg.src).toBe("https://cdn.example.com/climatech-icon.png");
    expect(climatechImg.className).toContain("object-cover");

    // Invitación pendiente muestra el logo de la empresa invitadora
    const ecoImg = screen.getByAltText("EcoClean SAC") as HTMLImageElement;
    expect(ecoImg.src).toBe("https://cdn.example.com/ecoclean-logo.png");
  });

  it("renders organization logos in DashboardSidebar switcher dropdown and Resumen del grupo modal", () => {
    render(
      <DashboardSidebar
        activeOrganizationId="emp-1"
        organizations={[
          {
            id: "emp-1",
            name: "Vitta Kleanly",
            roleName: "Propietario",
            isOwner: true,
            logoUrl: "https://cdn.example.com/vitta-logo.png",
            menuIconUrl: "https://cdn.example.com/vitta-icon.png",
            brandColor: "#2AA8DE",
          },
          {
            id: "emp-2",
            name: "Clean Pro",
            roleName: "Administrador",
            isOwner: false,
            logoUrl: "https://cdn.example.com/cleanpro-logo.png",
            menuIconUrl: null,
            brandColor: "#157AA8",
          },
        ]}
        allowedModules={["dashboard", "clientes"]}
        canAccessConfig={true}
        logoUrl="https://cdn.example.com/vitta-logo.png"
        menuIconUrl="https://cdn.example.com/vitta-icon.png"
      />,
    );

    // Abrir selector de empresas del sidebar
    fireEvent.click(screen.getByRole("button", { name: "Cambiar de empresa" }));
    const cleanProImagesAfterDropdown = screen.getAllByAltText(
      "Clean Pro",
    ) as HTMLImageElement[];
    expect(cleanProImagesAfterDropdown[0].src).toBe(
      "https://cdn.example.com/cleanpro-logo.png",
    );

    // Abrir modal "Resumen del grupo"
    fireEvent.click(screen.getByRole("button", { name: "Resumen del grupo" }));
    const cleanProImagesInModal = screen.getAllByAltText(
      "Clean Pro",
    ) as HTMLImageElement[];
    expect(cleanProImagesInModal.length).toBeGreaterThanOrEqual(2);
  });

  it("CompanyAvatar falls back cleanly to logoUrl and then initials if image fails to load", () => {
    render(
      <CompanyAvatar
        name="Alpha Omega"
        menuIconUrl="https://cdn.example.com/broken-icon.png"
        logoUrl="https://cdn.example.com/valid-logo.png"
        ariaHidden={false}
      />,
    );

    const img = screen.getByAltText("Alpha Omega") as HTMLImageElement;
    expect(img.src).toBe("https://cdn.example.com/broken-icon.png");

    // Simular error de carga en menuIconUrl -> cae a logoUrl
    fireEvent.error(img);
    const fallbackImg = screen.getByAltText("Alpha Omega") as HTMLImageElement;
    expect(fallbackImg.src).toBe("https://cdn.example.com/valid-logo.png");

    // Simular error de carga en logoUrl -> cae a iniciales AO
    fireEvent.error(fallbackImg);
    expect(screen.getByText("AO")).toBeInTheDocument();
  });
});
