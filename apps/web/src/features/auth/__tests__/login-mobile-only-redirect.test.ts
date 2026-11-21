import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRedirect = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT:${url}`);
});
const mockRevalidatePath = vi.fn();
const mockInitializeOrganizationContext = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();
const mockLimit = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: (url: string) => mockRedirect(url),
}));

vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => null,
}));

vi.mock("@/lib/site-url", () => ({
  getTrustedSiteUrl: vi.fn().mockResolvedValue("https://app.vittkly.com"),
}));

vi.mock("@/features/tenants/services/org-session", () => ({
  clearActiveOrganizationCookie: vi.fn(),
  initializeOrganizationContext: () => mockInitializeOrganizationContext(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      signInWithPassword: (...args: unknown[]) =>
        mockSignInWithPassword(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            limit: (...args: unknown[]) => mockLimit(...args),
          }),
        }),
      }),
    }),
  }),
}));

import { loginAction } from "../actions/auth.actions";

describe("loginAction — consistencia entre /login y /accesos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: "user-mob-1",
          email: "operador@vittkly.com",
          user_metadata: {},
        },
      },
      error: null,
    });
    mockLimit.mockResolvedValue({
      data: [{ id: "mem-mob-1" }],
    });
  });

  it("no cierra sesión y redirige a /accesos cuando solo existen membresías sin acceso_web", async () => {
    mockInitializeOrganizationContext.mockResolvedValue("select");

    const formData = new FormData();
    formData.set("email", "operador@vittkly.com");
    formData.set("password", "SecretPass123!");

    await expect(loginAction({}, formData)).rejects.toThrow(
      "NEXT_REDIRECT:/accesos",
    );

    expect(mockSignOut).not.toHaveBeenCalled();
    expect(mockInitializeOrganizationContext).toHaveBeenCalledTimes(1);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/", "layout");
    expect(mockRedirect).toHaveBeenCalledWith("/accesos");
  });

  it("redirige a /dashboard cuando initializeOrganizationContext devuelve 'ready'", async () => {
    mockInitializeOrganizationContext.mockResolvedValue("ready");

    const formData = new FormData();
    formData.set("email", "admin@vittkly.com");
    formData.set("password", "SecretPass123!");

    await expect(loginAction({}, formData)).rejects.toThrow(
      "NEXT_REDIRECT:/dashboard",
    );

    expect(mockSignOut).not.toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
  });
});
