import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

const mockResolveActiveOrganization = vi.fn();
const mockLookupPersonByDocumentInDb = vi.fn();
const mockCreateCompanyInvitationInDb = vi.fn();
const mockResendCompanyInvitationInDb = vi.fn();
const mockGetExistingAccountEmailTargetInDb = vi.fn();
const mockSendInvitationEmail = vi.fn();
const mockRevalidatePath = vi.fn();
const mockInvUpdate = vi.fn();
const mockInvSelectMaybeSingle = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

vi.mock("@/features/tenants/services/tenants.service", () => ({
  resolveActiveOrganization: () => mockResolveActiveOrganization(),
}));

vi.mock("../services/users-profiles.repository", () => ({
  lookupPersonByDocumentInDb: (...args: unknown[]) =>
    mockLookupPersonByDocumentInDb(...args),
  createCompanyInvitationInDb: (...args: unknown[]) =>
    mockCreateCompanyInvitationInDb(...args),
  resendCompanyInvitationInDb: (...args: unknown[]) =>
    mockResendCompanyInvitationInDb(...args),
  getExistingAccountEmailTargetInDb: (...args: unknown[]) =>
    mockGetExistingAccountEmailTargetInDb(...args),
}));

vi.mock("../services/invitation-mailer", () => ({
  sendInvitationEmail: (...args: unknown[]) => mockSendInvitationEmail(...args),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: () => mockInvSelectMaybeSingle(),
          }),
        }),
      }),
      update: (payload: unknown) => ({
        eq: () => ({
          eq: () => mockInvUpdate(payload),
        }),
      }),
    }),
  }),
}));

import {
  createInvitationAction,
  lookupPersonByDocumentAction,
  resendInvitationAction,
  updateMemberDetailsAction,
} from "../actions/users-profiles.actions";
import { AddMemberModal } from "../components/AddMemberModal";
import { InvitationDetailsModal } from "../components/InvitationDetailsModal";
import type { CompanyProfile } from "../types/settings.types";

const MOCK_ORG = {
  userId: "11111111-1111-4111-8111-111111111111",
  active: {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Servicios Vitta",
    roleName: "Administrador",
  },
};

const MOCK_PROFILES: CompanyProfile[] = [
  {
    id: "33333333-3333-4333-8333-333333333333",
    codigo: "operador",
    nombre: "Técnico de campo",
    descripcion: "Operación en ruta",
    recomendadoPara: "Técnicos",
    esBase: true,
    usageCount: 2,
    configuracion: {
      modulos: ["trabajos", "tiempo"],
      opciones: {
        ve_precios_montos: false,
        valida_servicios: false,
        es_personal_campo: true,
      },
      restricciones: {
        ver_montos_cotizaciones: "ninguna",
        editar_cotizaciones: "ninguna",
        eliminar_cotizaciones: "ninguna",
        programar_reprogramar: "propias",
        pagos_clientes: "ninguna",
        costeo_margenes: "ninguna",
        cancelar_servicios: "ninguna",
      },
      descargar_archivos: false,
      aprueba_solicitudes: false,
      ocultar_datos_cliente: {
        telefonos: false,
        correos: false,
        documento: false,
        direccion: false,
      },
      horario_acceso: {
        restringido: false,
        inicio: "08:00",
        fin: "18:00",
      },
      dispositivo_acceso: "solo_app",
    },
  },
];

describe("Agregar persona — Privacidad E2E y Validación", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResolveActiveOrganization.mockResolvedValue(MOCK_ORG);
    mockSendInvitationEmail.mockResolvedValue({ success: true });
    mockInvUpdate.mockResolvedValue({ error: null });
  });

  it("rechaza DNI inválido sin consultar base de datos", async () => {
    const res = await lookupPersonByDocumentAction({
      docType: "DNI",
      docNumber: "1234AB",
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain("8 dígitos");
    expect(mockLookupPersonByDocumentInDb).not.toHaveBeenCalled();
  });

  it("retorna exclusivamente datos enmascarados en lookup cuenta_existente", async () => {
    mockLookupPersonByDocumentInDb.mockResolvedValue({
      status: "cuenta_existente",
      docType: "DNI",
      maskedName: "Ca**** Ma****",
      maskedEmail: "co****@gmail.com",
      maskedDocNumber: "1020**40",
      maskedPhone: "999****43",
    });

    const res = await lookupPersonByDocumentAction({
      docType: "DNI",
      docNumber: "10203040",
    });

    expect(res.success).toBe(true);
    expect(res.data).toEqual({
      status: "cuenta_existente",
      docType: "DNI",
      maskedName: "Ca**** Ma****",
      maskedEmail: "co****@gmail.com",
      maskedDocNumber: "1020**40",
      maskedPhone: "999****43",
    });
    expect(JSON.stringify(res.data)).not.toContain("coordinador@gmail.com");
    expect(JSON.stringify(res.data)).not.toContain("10203040");
  });

  it("crea invitación cuenta_existente enviando correo solo en servidor y sin filtrar PII ni link al navegador", async () => {
    mockLookupPersonByDocumentInDb.mockResolvedValue({
      status: "cuenta_existente",
      docType: "DNI",
      maskedName: "Ca**** Ma****",
      maskedEmail: "co****@gmail.com",
      maskedDocNumber: "1020**40",
      maskedPhone: "999****43",
    });
    mockCreateCompanyInvitationInDb.mockResolvedValue({
      invitationId: "44444444-4444-4444-8444-444444444444",
      tipo: "cuenta_existente",
      perfilId: "33333333-3333-4333-8333-333333333333",
      perfilNombre: "Técnico de campo",
      cargo: "Operador Senior",
      accesoWeb: false,
      accesoApp: true,
      accessLabel: "Solo app",
      expiresAt: "2026-11-22T00:00:00Z",
      createdAt: "2026-11-15T00:00:00Z",
      displayName: "Ca**** Ma****",
      displayEmail: "co****@gmail.com",
      displayPhone: "999****43",
      maskedDocument: "1020**40",
    });
    mockGetExistingAccountEmailTargetInDb.mockResolvedValue({
      email: "coordinador@gmail.com",
      recipientName: "Carlos Mateo",
    });

    const res = await createInvitationAction({
      docType: "DNI",
      docNumber: "10203040",
      perfilId: "33333333-3333-4333-8333-333333333333",
      accessLabel: "Solo app",
      jobTitle: "Operador Senior",
      // Incluso si el cliente intentara inyectar PII falsa, debe ignorarse:
      firstName: "Hacker",
      email: "attacker@evil.com",
    });

    expect(res.success).toBe(true);
    expect(mockCreateCompanyInvitationInDb).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: null,
        lastName: null,
        email: null,
        phoneE164: null,
      }),
    );
    expect(mockSendInvitationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "coordinador@gmail.com",
        recipientName: "Carlos Mateo",
        tipoInvitacion: "cuenta_existente",
      }),
    );
    expect(res.data?.invitationPath).toBeNull();
    expect(res.data?.recipientEmail).toBe("co****@gmail.com");
    expect(res.data?.recipientPhone).toBe("999****43");
    expect(JSON.stringify(res.data)).not.toContain("coordinador@gmail.com");
    expect(JSON.stringify(res.data)).not.toContain("activar-invitacion");
  });

  it("exige celular E.164 obligatorio en nueva_cuenta incluso con acceso Solo web", async () => {
    mockLookupPersonByDocumentInDb.mockResolvedValue({
      status: "no_encontrado",
      docType: "DNI",
      normalizedDocNumber: "70809010",
    });

    const res = await createInvitationAction({
      docType: "DNI",
      docNumber: "70809010",
      perfilId: "33333333-3333-4333-8333-333333333333",
      accessLabel: "Solo web",
      firstName: "Lucía",
      lastName: "Torres",
      email: "lucia@vittkly.com",
      countryPrefix: "+51",
      phone: "",
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain("celular");
    expect(mockCreateCompanyInvitationInDb).not.toHaveBeenCalled();
  });

  it("mantiene privacidad end-to-end en resendInvitationAction para cuenta_existente", async () => {
    mockResendCompanyInvitationInDb.mockResolvedValue({
      invitationId: "55555555-5555-4555-8555-555555555555",
      tipo: "cuenta_existente",
      perfilId: "33333333-3333-4333-8333-333333333333",
      perfilNombre: "Técnico de campo",
      cargo: null,
      accesoWeb: true,
      accesoApp: true,
      accessLabel: "Web y app",
      expiresAt: "2026-11-22T00:00:00Z",
      createdAt: "2026-11-15T00:00:00Z",
      displayName: "Ca**** Ma****",
      displayEmail: "co****@gmail.com",
      displayPhone: "999****43",
      maskedDocument: "1020**40",
    });
    mockGetExistingAccountEmailTargetInDb.mockResolvedValue({
      email: "coordinador@gmail.com",
      recipientName: "Carlos Mateo",
    });

    const res = await resendInvitationAction(
      "44444444-4444-4444-8444-444444444444",
    );

    expect(res.success).toBe(true);
    expect(res.data?.invitationPath).toBeNull();
    expect(res.data?.recipientEmail).toBe("co****@gmail.com");
    expect(mockSendInvitationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "coordinador@gmail.com",
        tipoInvitacion: "cuenta_existente",
      }),
    );
  });

  it("impide mutar nombres o celular de una invitación pendiente cuenta_existente", async () => {
    mockInvSelectMaybeSingle.mockResolvedValue({
      data: {
        id: "44444444-4444-4444-8444-444444444444",
        tipo: "cuenta_existente",
        correo: null,
        tipo_documento: "DNI",
        numero_documento: null,
      },
    });

    const res = await updateMemberDetailsAction({
      id: "inv-44444444-4444-4444-8444-444444444444",
      sourceType: "invitacion",
      userId: "99999999-9999-4999-8999-999999999999",
      invitationId: "44444444-4444-4444-8444-444444444444",
      firstName: "Modificado",
      lastName: "Intento",
      phone: "999111222",
      perfilId: "33333333-3333-4333-8333-333333333333",
      jobTitle: "Supervisor",
      accessLabel: "Web y app",
    });

    expect(res.success).toBe(true);
    expect(mockInvUpdate).toHaveBeenCalledWith({
      perfil_id: "33333333-3333-4333-8333-333333333333",
      cargo: "Supervisor",
      acceso_web: true,
      acceso_app: true,
    });
  });

  it("AddMemberModal sanitiza DNI en tiempo real bloqueando letras, símbolos y >8 dígitos", () => {
    render(
      <AddMemberModal
        isOpen
        onClose={vi.fn()}
        profiles={MOCK_PROFILES}
        companyName="Servicios Vitta"
        onInvitationCreated={vi.fn()}
      />,
    );

    const input = screen.getByLabelText(/Número de DNI/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "10ab-2030.4099" } });

    expect(input.value).toBe("10203040");
    expect(screen.getByText("8/8 dígitos")).toBeInTheDocument();
  });

  it("InvitationDetailsModal oculta wa.me y enlace activable para cuenta_existente", () => {
    render(
      <InvitationDetailsModal
        isOpen
        onClose={vi.fn()}
        companyName="Servicios Vitta"
        invitation={{
          invitationId: "44444444-4444-4444-8444-444444444444",
          tipo: "cuenta_existente",
          recipientName: "Ca**** Ma****",
          recipientEmail: "co****@gmail.com",
          recipientPhone: "999****43",
          recipientDocumentMasked: "1020**40",
          perfilNombre: "Técnico de campo",
          accessLabel: "Solo app",
          expiresAt: "2026-11-22T00:00:00Z",
          invitationPath: null,
          emailSent: true,
          emailError: null,
        }}
      />,
    );

    expect(screen.queryByText(/Enviar por WhatsApp/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Copiar mensaje/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Ca\*\*\*\* Ma\*\*\*\*/)).toBeInTheDocument();
    expect(screen.getByText(/co\*\*\*\*@gmail\.com/)).toBeInTheDocument();
  });
});
