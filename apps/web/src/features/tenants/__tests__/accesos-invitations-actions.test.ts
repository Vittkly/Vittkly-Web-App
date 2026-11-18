import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mockRedirect = vi.fn((url: string) => {
  const err = new Error("NEXT_REDIRECT") as Error & { digest?: string };
  err.digest = `NEXT_REDIRECT;replace;${url};307;`;
  throw err;
});

const mockUnstableRethrow = vi.fn((err: unknown) => {
  if (
    err &&
    typeof err === "object" &&
    "digest" in err &&
    typeof (err as { digest?: unknown }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_REDIRECT;")
  ) {
    throw err;
  }
});

const mockRevalidatePath = vi.fn();
const mockGetUser = vi.fn();
const mockRpc = vi.fn();
const mockMembresiasSelect = vi.fn();
const mockUsuarioMaybeSingle = vi.fn();
const mockEmpresaMaybeSingle = vi.fn();
const mockCookieGet = vi.fn();
const mockSetActiveOrganizationCookies = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: (url: string) => mockRedirect(url),
  unstable_rethrow: (err: unknown) => mockUnstableRethrow(err),
}));

vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => mockCookieGet(name),
  }),
}));

vi.mock("@/features/tenants/services/org-session", () => ({
  setActiveOrganizationCookies: (...args: unknown[]) =>
    mockSetActiveOrganizationCookies(...args),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: () => mockGetUser(),
    },
    rpc: (fnName: string, params?: unknown) => mockRpc(fnName, params),
    from: (table: string) => {
      if (table === "membresias") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                eq: () => mockMembresiasSelect(),
              }),
            }),
          }),
        };
      }
      if (table === "usuarios") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => mockUsuarioMaybeSingle(),
            }),
          }),
        };
      }
      if (table === "empresas") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => mockEmpresaMaybeSingle(),
            }),
          }),
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    },
  }),
}));

import {
  requestExitAction,
  respondInvitationAction,
} from "../actions/tenants.actions";
import { respondInvitation } from "../services/tenants.service";
import AccesosPage from "@/app/accesos/page";

const INV_ID = "11111111-1111-4111-8111-111111111111";
const EMP_ID = "22222222-2222-4222-8222-222222222222";
const MEM_ID = "33333333-3333-4333-8333-333333333333";

describe("respondInvitationAction, tenants.service y AccesosPage (?stay=1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockMembresiasSelect.mockResolvedValue({ data: [], error: null });
    mockUsuarioMaybeSingle.mockResolvedValue({
      data: { ultima_empresa_id: null },
    });
    mockEmpresaMaybeSingle.mockResolvedValue({
      data: {
        nombre_comercial: "Vitta Norte",
        razon_social: "Vitta Norte SAC",
      },
      error: null,
    });
    mockCookieGet.mockReturnValue(undefined);
  });

  it("respondInvitationAction al aceptar con acceso_web no redirige ni escribe cookie activa, y devuelve mensaje positivo", async () => {
    mockRpc.mockResolvedValue({
      data: {
        aceptada: true,
        empresa_id: EMP_ID,
        acceso_web: true,
      },
      error: null,
    });

    const res = await respondInvitationAction({
      invitacionId: INV_ID,
      acepta: true,
    });

    expect(res).toEqual({
      ok: true,
      message:
        "Invitación aceptada correctamente. Ya puedes entrar a Vitta Norte.",
      data: {
        accepted: true,
        accesoWeb: true,
        empresaNombre: "Vitta Norte",
      },
    });
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(mockSetActiveOrganizationCookies).not.toHaveBeenCalled();
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it("respondInvitationAction al aceptar solo app devuelve mensaje informativo móvil", async () => {
    mockRpc.mockResolvedValue({
      data: {
        aceptada: true,
        empresa_id: EMP_ID,
        acceso_web: false,
      },
      error: null,
    });

    const res = await respondInvitationAction({
      invitacionId: INV_ID,
      acepta: true,
    });

    expect(res).toEqual({
      ok: true,
      message:
        "Invitación aceptada. Tu acceso en Vitta Norte es exclusivo desde la app móvil.",
      data: {
        accepted: true,
        accesoWeb: false,
        empresaNombre: "Vitta Norte",
      },
    });
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("respondInvitationAction al rechazar devuelve mensaje neutro sin consultar empresas", async () => {
    mockRpc.mockResolvedValue({
      data: {
        aceptada: false,
        empresa_id: EMP_ID,
      },
      error: null,
    });

    const res = await respondInvitationAction({
      invitacionId: INV_ID,
      acepta: false,
      motivo: "Ya no trabajo allí",
    });

    expect(res).toEqual({
      ok: true,
      message: "Invitación rechazada.",
      data: {
        accepted: false,
        accesoWeb: false,
        empresaNombre: "",
      },
    });
    expect(mockEmpresaMaybeSingle).not.toHaveBeenCalled();
  });

  it("respondInvitation resuelve null de forma segura si falla la lectura auxiliar de empresas", async () => {
    mockRpc.mockResolvedValue({
      data: {
        aceptada: true,
        empresa_id: EMP_ID,
        acceso_web: true,
      },
      error: null,
    });
    mockEmpresaMaybeSingle.mockResolvedValue({
      data: null,
      error: { message: "RLS denied" },
    });

    const result = await respondInvitation({
      invitacionId: INV_ID,
      acepta: true,
    });

    expect(result).toEqual({
      aceptada: true,
      empresa_id: EMP_ID,
      acceso_web: true,
      empresa_nombre: null,
    });
  });

  it("unstable_rethrow re-lanza errores de redirect y getSafeActionError jamás filtra NEXT_REDIRECT", async () => {
    const redirectErr = new Error("NEXT_REDIRECT") as Error & {
      digest?: string;
    };
    redirectErr.digest = "NEXT_REDIRECT;replace;/login;307;";
    mockRpc.mockRejectedValueOnce(redirectErr);

    await expect(requestExitAction({ membresiaId: MEM_ID })).rejects.toThrow(
      "NEXT_REDIRECT",
    );
    expect(mockUnstableRethrow).toHaveBeenCalledWith(redirectErr);

    mockRpc.mockRejectedValueOnce(new Error("NEXT_REDIRECT"));
    const sanitized = await requestExitAction({ membresiaId: MEM_ID });
    expect(sanitized).toEqual({
      ok: false,
      error: "No se pudo enviar la solicitud.",
    });
    expect(sanitized.error).not.toContain("NEXT_REDIRECT");
  });

  it("AccesosPage con stay=1 no redirige a /accesos/auto aunque el usuario tenga su primera y única empresa web", async () => {
    mockMembresiasSelect.mockResolvedValue({
      data: [
        {
          es_propietario: false,
          acceso_web: true,
          empresas: {
            id: EMP_ID,
            razon_social: "Vitta Norte SAC",
            nombre_comercial: "Vitta Norte",
            activa: true,
            eliminado_en: null,
          },
          perfiles: { nombre: "Supervisor" },
        },
      ],
      error: null,
    });
    mockRpc.mockResolvedValue({
      data: {
        usuario: {
          id: "user-1",
          nombre: "Andrea",
          correo: "andrea@vittkly.com",
          ultima_empresa_id: null,
          prueba_usada_en: null,
        },
        cuenta_actual: null,
        empresas_propias: [],
        empresas_miembro: [],
        invitaciones: [],
      },
      error: null,
    });

    const node = await AccesosPage({
      searchParams: Promise.resolve({ stay: "1" }),
    });
    expect(node).toBeTruthy();
    expect(mockRedirect).not.toHaveBeenCalledWith("/accesos/auto");

    await expect(AccesosPage({})).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/accesos/auto");
  });
});
