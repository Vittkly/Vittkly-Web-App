import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mockBrowserSignInWithOAuth = vi.fn();
const mockExchangeCodeForSession = vi.fn();
const mockVerifyOtp = vi.fn();
const mockUpdateEq = vi.fn();
const mockSelectLimit = vi.fn();
const mockRpc = vi.fn();
const mockInitializeOrganizationContext = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithOAuth: (...args: unknown[]) =>
        mockBrowserSignInWithOAuth(...args),
    },
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      exchangeCodeForSession: (...args: unknown[]) =>
        mockExchangeCodeForSession(...args),
      verifyOtp: (...args: unknown[]) => mockVerifyOtp(...args),
    },
    from: () => ({
      update: () => ({
        eq: (...args: unknown[]) => mockUpdateEq(...args),
      }),
      select: () => ({
        eq: () => ({
          eq: () => ({
            limit: (...args: unknown[]) => mockSelectLimit(...args),
          }),
        }),
      }),
    }),
    rpc: (...args: unknown[]) => mockRpc(...args),
  }),
}));

vi.mock("@/features/tenants/services/org-session", () => ({
  initializeOrganizationContext: () => mockInitializeOrganizationContext(),
}));

vi.mock("@/features/auth/actions/auth.actions", () => ({
  loginAction: vi.fn(),
  registerAction: vi.fn(),
}));

import { signInWithOAuthProvider } from "../services/oauth.client";
import { resolveAuthCallbackRedirect } from "../services/auth-callback.service";
import { LoginForm } from "../components/LoginForm";
import { RegisterForm } from "../components/RegisterForm";

describe("OAuth Google y Microsoft en Vittkly Web", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    mockUpdateEq.mockResolvedValue({ error: null });
    mockSelectLimit.mockResolvedValue({ data: [] });
  });

  it("signInWithOAuthProvider mapea Google y Microsoft (azure con scope email) y construye redirectTo seguro", async () => {
    mockBrowserSignInWithOAuth.mockResolvedValue({
      data: { url: "https://accounts.google.com/o/oauth2/v2/auth" },
      error: null,
    });

    const googleRes = await signInWithOAuthProvider("google", {
      from: "login",
    });
    expect(googleRes).toEqual({ ok: true });
    expect(mockBrowserSignInWithOAuth).toHaveBeenNthCalledWith(1, {
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=%2Faccesos%2Fauto&from=login`,
        queryParams: { prompt: "select_account" },
      },
    });

    const msRes = await signInWithOAuthProvider("microsoft", {
      from: "register",
      next: "//evil.example",
    });
    expect(msRes).toEqual({ ok: true });
    expect(mockBrowserSignInWithOAuth).toHaveBeenNthCalledWith(2, {
      provider: "azure",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=%2Faccesos%2Fauto&from=register`,
        scopes: "email",
        queryParams: { prompt: "select_account" },
      },
    });
  });

  it("LoginForm dispara OAuth para Google y Microsoft y muestra error si falla", async () => {
    mockBrowserSignInWithOAuth.mockResolvedValueOnce({
      data: null,
      error: { message: "Provider disabled" },
    });

    render(<LoginForm />);

    const googleBtn = screen.getByRole("button", {
      name: "Continuar con Google",
    });
    const msBtn = screen.getByRole("button", {
      name: "Continuar con Microsoft",
    });

    fireEvent.click(googleBtn);

    await waitFor(() => {
      expect(mockBrowserSignInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({ provider: "google" }),
      );
      expect(screen.getByRole("alert")).toHaveTextContent(
        /No se pudo conectar con Google/i,
      );
    });

    mockBrowserSignInWithOAuth.mockResolvedValueOnce({
      data: {
        url: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
      },
      error: null,
    });

    fireEvent.click(msBtn);

    await waitFor(() => {
      expect(mockBrowserSignInWithOAuth).toHaveBeenLastCalledWith(
        expect.objectContaining({
          provider: "azure",
          options: expect.objectContaining({ scopes: "email" }),
        }),
      );
      expect(msBtn).toHaveAttribute("aria-busy", "true");
    });
  });

  it("RegisterForm paso 1 habilita botones de Google y Microsoft y muestra cancelación desde URL", async () => {
    mockSearchParams = new URLSearchParams("error=oauth_cancelado");
    mockBrowserSignInWithOAuth.mockResolvedValue({
      data: { url: "https://accounts.google.com/o/oauth2/v2/auth" },
      error: null,
    });

    render(<RegisterForm />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      /Cancelaste el acceso con tu cuenta externa/i,
    );

    const googleBtn = screen.getByRole("button", {
      name: "Registrarte con Google",
    });
    const msBtn = screen.getByRole("button", {
      name: "Registrarte con Microsoft",
    });

    expect(googleBtn).toBeEnabled();
    expect(msBtn).toBeEnabled();

    fireEvent.click(msBtn);

    await waitFor(() => {
      expect(mockBrowserSignInWithOAuth).toHaveBeenCalledWith({
        provider: "azure",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=%2Faccesos%2Fauto&from=register`,
          scopes: "email",
          queryParams: { prompt: "select_account" },
        },
      });
    });
  });

  it("resolveAuthCallbackRedirect intercambia code PKCE y resuelve /dashboard o /accesos", async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      data: { user: { id: "user-1", user_metadata: {} } },
      error: null,
    });
    mockInitializeOrganizationContext.mockResolvedValueOnce("ready");

    const readyTarget = await resolveAuthCallbackRedirect(
      new URL(
        "https://app.vittkly.com/auth/callback?code=pkce-123&next=/accesos/auto",
      ),
    );
    expect(readyTarget).toBe("/dashboard");

    mockInitializeOrganizationContext.mockResolvedValueOnce("select");
    const selectTarget = await resolveAuthCallbackRedirect(
      new URL("https://app.vittkly.com/auth/callback?code=pkce-456"),
    );
    expect(selectTarget).toBe("/accesos");
  });

  it("resolveAuthCallbackRedirect redirige al origen correcto cuando el usuario cancela OAuth", async () => {
    const fromRegister = await resolveAuthCallbackRedirect(
      new URL(
        "https://app.vittkly.com/auth/callback?error=access_denied&from=register",
      ),
    );
    expect(fromRegister).toBe("/register?error=oauth_cancelado");

    const fromLogin = await resolveAuthCallbackRedirect(
      new URL("https://app.vittkly.com/auth/callback?error=server_error"),
    );
    expect(fromLogin).toBe("/login?error=oauth_error");
  });
});
