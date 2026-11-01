"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTrustedSiteUrl } from "@/lib/site-url";
import {
  clearActiveOrganizationCookie,
  initializeOrganizationContext,
} from "@/features/tenants/services/org-session";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  guestAccessSchema,
} from "@vittkly/shared";
import type { AuthActionState } from "../types/auth.types";

/**
 * Server Action: Iniciar sesión con correo y contraseña.
 *
 * AppSec y Control de Fuerza Bruta:
 * 1. Valida payload con `loginSchema`.
 * 2. Consulta `public.ingreso_bloqueado_hasta(identificador)` con service_role.
 *    Si está bloqueado, rechaza inmediatamente y retorna tiempo restante.
 * 3. Ejecuta `supabase.auth.signInWithPassword`.
 * 4. Si falla: invoca `registrar_intento(identificador, false)`. Al 3.er fallo bloquea 30s;
 *    al 5.º fallo bloquea 15m. Retorna mensaje genérico o aviso de bloqueo temporal.
 * 5. Si tiene éxito: invoca `registrar_intento(identificador, true)`.
 * 6. Verifica que el usuario tenga permiso de acceso a la Central Web (`acceso_web = true`).
 *    Si es un perfil exclusivamente móvil (ej. Técnico de Campo sin acceso web), lo informa y cierra sesión.
 * 7. Invalida la caché de sesión y inicializa la empresa activa y redirige a `/hoy` (o `/select-org` si tiene varias).
 */
export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const rawEmail = formData.get("email")?.toString() || "";
  const rawPassword = formData.get("password")?.toString() || "";

  const validation = loginSchema.safeParse({
    email: rawEmail,
    password: rawPassword,
  });

  if (!validation.success) {
    const firstIssue = validation.error.issues[0];
    return {
      error: firstIssue?.message || "Credenciales inválidas",
    };
  }

  const identificador = validation.data.email.toLowerCase();
  const password = validation.data.password;

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch (err) {
    console.error("[Vittkly Auth] Error inicializando admin client:", err);
  }
  if (!adminClient && process.env.NODE_ENV === "production") {
    // Fail-closed: sin control de fuerza bruta no se permite autenticar.
    return {
      error:
        "Servicio temporalmente no disponible. Intenta nuevamente en unos minutos.",
    };
  }

  // 1. Verificación previa de bloqueo temporal
  if (adminClient) {
    try {
      const { data: blockedUntil } = await adminClient.rpc(
        "ingreso_bloqueado_hasta",
        {
          identificador,
        },
      );

      if (blockedUntil) {
        const remainingSeconds = Math.ceil(
          (new Date(blockedUntil).getTime() - Date.now()) / 1000,
        );

        if (remainingSeconds > 0) {
          const minutes = Math.floor(remainingSeconds / 60);
          const seconds = remainingSeconds % 60;
          const timeLabel =
            minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

          return {
            error: `Demasiados intentos fallidos. Espera ${timeLabel} antes de reintentar.`,
            blockedUntil,
            remainingSeconds,
          };
        }
      }
    } catch (err) {
      console.warn("[Vittkly AppSec] No se pudo evaluar bloqueo previo:", err);
    }
  }

  // 2. Intento de autenticación en Supabase Auth
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: identificador,
    password,
  });

  // 3. Manejo de error de credenciales
  if (error || !data.user) {
    if (adminClient) {
      try {
        await adminClient.rpc("registrar_intento", {
          identificador,
          exito: false,
        });

        // Verificar si este fallo activó un nuevo bloqueo (30s al 3.º o 15m al 5.º)
        const { data: newBlock } = await adminClient.rpc(
          "ingreso_bloqueado_hasta",
          {
            identificador,
          },
        );

        if (newBlock) {
          const remainingSeconds = Math.ceil(
            (new Date(newBlock).getTime() - Date.now()) / 1000,
          );

          if (remainingSeconds > 0) {
            const minutes = Math.floor(remainingSeconds / 60);
            const seconds = remainingSeconds % 60;
            const timeLabel =
              minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

            return {
              error: `Demasiados intentos fallidos. Cuenta bloqueada temporalmente por ${timeLabel}.`,
              blockedUntil: newBlock,
              remainingSeconds,
            };
          }
        }
      } catch (rpcErr) {
        console.warn(
          "[Vittkly AppSec] Error registrando intento fallido:",
          rpcErr,
        );
      }
    }

    // Zero User-Enumeration: mensaje indistinguible
    return {
      error: "Correo o contraseña incorrectos",
    };
  }

  // 4. Autenticación exitosa
  if (adminClient) {
    try {
      await adminClient.rpc("registrar_intento", {
        identificador,
        exito: true,
      });

      // Actualizar último ingreso en usuarios si la tabla está disponible
      await adminClient
        .from("usuarios")
        .update({ ultimo_ingreso_en: new Date().toISOString() })
        .eq("id", data.user.id);
    } catch (err) {
      console.warn(
        "[Vittkly AppSec] Error reseteando intentos en login exitoso:",
        err,
      );
    }
  }

  // 5. Validación de Acceso Web según Membresías y Roles de seed.sql
  try {
    const { data: userMemberships } = await supabase
      .from("membresias")
      .select("id, empresa_id, perfil_id, acceso_web, activo")
      .eq("usuario_id", data.user.id)
      .eq("activo", true);

    // Si tiene membresías y NINGUNA tiene acceso web (ej. Técnico de Campo en seed.sql)
    if (
      userMemberships &&
      userMemberships.length > 0 &&
      !userMemberships.some((m) => m.acceso_web)
    ) {
      await supabase.auth.signOut();
      return {
        error:
          "Tu cuenta tiene asignado un perfil exclusivo para la App Móvil de Campo. Para acceder a la Central Web contacta a tu administrador.",
      };
    }

    // Si el usuario aún no tiene membresías (ej. cuenta creada pero pendiente de provisión)
    if (!userMemberships || userMemberships.length === 0) {
      const meta = data.user.user_metadata || {};
      if (meta.company_name) {
        try {
          await supabase.rpc("crear_cuenta_y_empresa", {
            p_nombre_empresa: meta.company_name,
            p_ruc: meta.ruc || null,
            p_plan_codigo: meta.plan_code || "empresa",
          });
        } catch (provErr) {
          console.warn(
            "[Vittkly Auth] Auto-aprovisionamiento al iniciar sesión:",
            provErr,
          );
        }
      }
    }
  } catch (memErr) {
    console.warn("[Vittkly Auth] Advertencia verificando membresías:", memErr);
  }

  revalidatePath("/", "layout");
  redirect(
    (await initializeOrganizationContext()) === "ready"
      ? "/dashboard"
      : "/select-org",
  );
}

/**
 * Server Action: Registro de nueva cuenta y aprovisionamiento inicial.
 *
 * CORRECCIÓN CRÍTICA DE REDIRECCIÓN Y RETROALIMENTACIÓN:
 * 1. Valida el payload con `registerSchema` (@vittkly/shared).
 * 2. Registra el usuario en Supabase Auth (`signUp`).
 * 3. Si se obtiene sesión activa en el servidor:
 *    - Invoca `public.crear_cuenta_y_empresa` para crear cuenta, suscripción, empresa y rol admin.
 *    - Invalida caché y REDIRIGE a `/hoy` (o `/select-org`).
 * 4. Si Supabase requiere confirmación de correo:
 *    - REDIRIGE inmediatamente a `/register/confirmacion` con instrucciones claras.
 *    El usuario NUNCA se queda estancado en el formulario sin respuesta.
 */
export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const rawData = {
    fullName: formData.get("fullName")?.toString() || "",
    companyName: formData.get("companyName")?.toString() || "",
    ruc: formData.get("ruc")?.toString() || undefined,
    planCode: formData.get("planCode")?.toString() || "empresa",
    email: formData.get("email")?.toString() || "",
    password: formData.get("password")?.toString() || "",
    confirmPassword: formData.get("confirmPassword")?.toString() || "",
  };

  const validation = registerSchema.safeParse(rawData);

  if (!validation.success) {
    const fieldErrors: Record<string, string> = {};
    validation.error.issues.forEach((issue) => {
      const field = issue.path[0];
      if (field && typeof field === "string" && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    });

    return {
      error:
        validation.error.issues[0]?.message ||
        "Por favor completa los campos correctamente",
      fieldErrors,
    };
  }

  const { fullName, companyName, ruc, planCode, email, password } =
    validation.data;
  const cleanEmail = email.toLowerCase();
  const supabase = await createServerClient();

  const origin = await getTrustedSiteUrl();

  // 1. Registro en Supabase Auth
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/hoy`,
      data: {
        full_name: fullName,
        company_name: companyName,
        ruc: ruc || null,
        plan_code: planCode,
      },
    },
  });

  if (signUpError) {
    if (
      signUpError.message?.toLowerCase().includes("already registered") ||
      signUpError.message?.toLowerCase().includes("user already exists")
    ) {
      return {
        error:
          "Ya existe una cuenta registrada con este correo electrónico. Por favor inicia sesión.",
      };
    }

    return {
      error: "No se pudo crear la cuenta. Intenta nuevamente.",
    };
  }

  // 2. Si se estableció sesión activa inmediata
  if (signUpData.session && signUpData.user) {
    try {
      // Aprovisionar cuenta, suscripción, empresa y membresía admin
      await supabase.rpc("crear_cuenta_y_empresa", {
        p_nombre_empresa: companyName,
        p_ruc: ruc || null,
        p_plan_codigo: planCode,
      });

      // Asegurar datos en public.usuarios
      await supabase.from("usuarios").upsert({
        id: signUpData.user.id,
        nombre: fullName,
        correo: cleanEmail,
      });
    } catch (provErr) {
      console.warn(
        "[Vittkly Register] Advertencia aprovisionando empresa:",
        provErr,
      );
    }

    revalidatePath("/", "layout");
    redirect(
      (await initializeOrganizationContext()) === "ready"
        ? "/hoy"
        : "/select-org",
    );
  }

  // 3. Si el entorno requiere confirmación de correo electrónico
  const confirmUrl = `/register/confirmacion?email=${encodeURIComponent(cleanEmail)}&company=${encodeURIComponent(companyName)}&plan=${encodeURIComponent(planCode)}`;
  redirect(confirmUrl);
}

/**
 * Server Action: Cerrar sesión activa en la Central Web.
 */
export async function logoutAction(): Promise<void> {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  await clearActiveOrganizationCookie();
  revalidatePath("/", "layout");
  redirect("/login");
}

/**
 * Server Action: Solicitar enlace de recuperación de contraseña vía correo.
 *
 * AppSec y Anti-Enumeración (Zero User-Enumeration):
 * - Sin importar si el correo existe o no en la plataforma, la respuesta visual siempre
 *   es idéntica y exitosa para evitar el reconocimiento de correos válidos por atacantes.
 */
export async function forgotPasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const rawEmail = formData.get("email")?.toString() || "";

  const validation = forgotPasswordSchema.safeParse({ email: rawEmail });
  if (!validation.success) {
    const firstIssue = validation.error.issues[0];
    return {
      error: firstIssue?.message || "Ingresa un correo electrónico válido",
    };
  }

  const email = validation.data.email.toLowerCase();

  const origin = await getTrustedSiteUrl();

  const supabase = await createServerClient();
  try {
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/restablecer-contrasena`,
    });
  } catch (err) {
    console.warn("[Vittkly Auth] Error enviando correo de recuperación:", err);
  }

  // Respuesta idéntica garantizada
  return {
    success: true,
    message:
      "Si este correo está registrado en la plataforma, hemos enviado un enlace para restablecer tu contraseña.",
  };
}

/**
 * Server Action: Restablecer contraseña con validación estricta de requisitos.
 */
export async function resetPasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const rawPassword = formData.get("password")?.toString() || "";
  const rawConfirmPassword = formData.get("confirmPassword")?.toString() || "";

  const validation = resetPasswordSchema.safeParse({
    password: rawPassword,
    confirmPassword: rawConfirmPassword,
  });

  if (!validation.success) {
    const firstIssue = validation.error.issues[0];
    return {
      error:
        firstIssue?.message ||
        "La contraseña no cumple con los requisitos mínimos de seguridad",
    };
  }

  const { password } = validation.data;
  const supabase = await createServerClient();

  // Validar que exista una sesión de recuperación activa
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error:
        "El enlace de recuperación ha expirado o es inválido. Por favor solicita uno nuevo.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return {
      error: "No se pudo actualizar la contraseña. Intenta nuevamente.",
    };
  }

  redirect("/login?updated=true");
}

/**
 * Server Action: Inicio de sesión exclusivo para el Portal Interno de Trabajadores / Staff
 * del SaaS Vittkly (`/internal/login`).
 *
 * Verifica en el servidor que el usuario autenticado pertenezca a `public.staff_plataforma`
 * (vía RPC `public.es_staff` / tabla `staff_plataforma`) o posea membresía activa autorizada.
 * Si un usuario sin privilegios de staff intenta ingresar por esta ruta, se deniega el acceso.
 */
export async function staffLoginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const rawEmail = formData.get("email")?.toString() || "";
  const rawPassword = formData.get("password")?.toString() || "";

  const validation = loginSchema.safeParse({
    email: rawEmail,
    password: rawPassword,
  });

  if (!validation.success) {
    const firstIssue = validation.error.issues[0];
    return {
      error: firstIssue?.message || "Credenciales inválidas",
    };
  }

  const identificador = validation.data.email.toLowerCase();
  const password = validation.data.password;

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch (err) {
    console.error(
      "[Vittkly Staff Auth] Error inicializando admin client:",
      err,
    );
  }
  if (!adminClient && process.env.NODE_ENV === "production") {
    // Fail-closed: sin control de fuerza bruta no se permite autenticar.
    return {
      error:
        "Servicio temporalmente no disponible. Intenta nuevamente en unos minutos.",
    };
  }

  // 1. Verificación previa de bloqueo temporal
  if (adminClient) {
    try {
      const { data: blockedUntil } = await adminClient.rpc(
        "ingreso_bloqueado_hasta",
        {
          identificador,
        },
      );

      if (blockedUntil) {
        const remainingSeconds = Math.ceil(
          (new Date(blockedUntil).getTime() - Date.now()) / 1000,
        );

        if (remainingSeconds > 0) {
          const minutes = Math.floor(remainingSeconds / 60);
          const seconds = remainingSeconds % 60;
          const timeLabel =
            minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

          return {
            error: `Demasiados intentos fallidos. Espera ${timeLabel} antes de reintentar.`,
            blockedUntil,
            remainingSeconds,
          };
        }
      }
    } catch (err) {
      console.warn(
        "[Vittkly Staff AppSec] No se pudo evaluar bloqueo previo:",
        err,
      );
    }
  }

  // 2. Autenticación en Supabase Auth
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: identificador,
    password,
  });

  if (error || !data.user) {
    if (adminClient) {
      try {
        await adminClient.rpc("registrar_intento", {
          identificador,
          exito: false,
        });

        const { data: newBlock } = await adminClient.rpc(
          "ingreso_bloqueado_hasta",
          {
            identificador,
          },
        );

        if (newBlock) {
          const remainingSeconds = Math.ceil(
            (new Date(newBlock).getTime() - Date.now()) / 1000,
          );

          if (remainingSeconds > 0) {
            const minutes = Math.floor(remainingSeconds / 60);
            const seconds = remainingSeconds % 60;
            const timeLabel =
              minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

            return {
              error: `Demasiados intentos fallidos. Cuenta bloqueada temporalmente por ${timeLabel}.`,
              blockedUntil: newBlock,
              remainingSeconds,
            };
          }
        }
      } catch (rpcErr) {
        console.warn(
          "[Vittkly Staff AppSec] Error registrando intento fallido:",
          rpcErr,
        );
      }
    }

    return {
      error: "Correo o contraseña incorrectos",
    };
  }

  // 3. Autenticación exitosa: resetear contador de intentos
  if (adminClient) {
    try {
      await adminClient.rpc("registrar_intento", {
        identificador,
        exito: true,
      });

      await adminClient
        .from("usuarios")
        .update({ ultimo_ingreso_en: new Date().toISOString() })
        .eq("id", data.user.id);
    } catch (err) {
      console.warn("[Vittkly Staff AppSec] Error reseteando intentos:", err);
    }
  }

  // 4. Verificar privilegios de Staff de la Plataforma Vittkly en el servidor
  let isStaff = false;

  try {
    const { data: rpcIsStaff } = await supabase.rpc("es_staff");
    if (rpcIsStaff === true) {
      isStaff = true;
    }
  } catch (err) {
    console.warn("[Vittkly Staff Auth] Error verificando es_staff RPC:", err);
  }

  if (!isStaff) {
    try {
      const { data: staffRow } = await supabase
        .from("staff_plataforma")
        .select("usuario_id, rol, activo")
        .eq("usuario_id", data.user.id)
        .eq("activo", true)
        .maybeSingle();

      if (staffRow) {
        isStaff = true;
      }
    } catch (err) {
      console.warn(
        "[Vittkly Staff Auth] Error consultando staff_plataforma:",
        err,
      );
    }
  }

  if (!isStaff) {
    await supabase.auth.signOut();
    return {
      error:
        "Acceso denegado: Tu cuenta no pertenece al equipo interno / Staff de Vittkly. Si eres una empresa o colaborador invitado, ingresa por el portal de clientes (/login).",
    };
  }

  revalidatePath("/", "layout");
  redirect("/internal/dashboard");
}

/**
 * Server Action: Cerrar sesión del Portal Interno de Staff Vittkly.
 */
export async function staffLogoutAction(): Promise<void> {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  await clearActiveOrganizationCookie();
  revalidatePath("/", "layout");
  redirect("/internal/login");
}

/**
 * Server Action: Acceso y canje de invitación para Clientes / Invitados externos (`/invitado`).
 */
export async function redeemInvitationAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const rawData = {
    fullName: formData.get("fullName")?.toString() || "",
    email: formData.get("email")?.toString() || "",
    password: formData.get("password")?.toString() || "",
    invitationCode:
      formData.get("invitationCode")?.toString().toUpperCase() || undefined,
  };

  const validation = guestAccessSchema.safeParse(rawData);
  if (!validation.success) {
    const fieldErrors: Record<string, string> = {};
    validation.error.issues.forEach((issue) => {
      const field = issue.path[0];
      if (field && typeof field === "string" && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    });

    return {
      error:
        validation.error.issues[0]?.message || "Verifica los datos ingresados",
      fieldErrors,
    };
  }

  const { fullName, email, password, invitationCode } = validation.data;
  const cleanEmail = email.toLowerCase();
  const supabase = await createServerClient();

  // Intentar iniciar sesión o crear cuenta para el invitado
  let authUserId: string | null = null;

  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

  if (!signInError && signInData.user) {
    authUserId = signInData.user.id;
  } else {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      },
    );

    if (signUpError || !signUpData.user) {
      return {
        error:
          signUpError?.message ||
          "No se pudo autenticar ni registrar tu cuenta de invitado. Verifica tu correo y contraseña.",
      };
    }

    authUserId = signUpData.user.id;
  }

  if (authUserId) {
    try {
      if (invitationCode) {
        await supabase.rpc("canjear_invitacion", {
          p_codigo: invitationCode,
        });
      } else {
        await supabase.rpc("unir_invitaciones_pendientes");
      }
    } catch (rpcErr) {
      return {
        error:
          rpcErr instanceof Error
            ? rpcErr.message
            : "No se pudo validar el código de invitación VK-XXXX-XXXX.",
      };
    }
  }

  revalidatePath("/", "layout");
  redirect(
    (await initializeOrganizationContext()) === "ready"
      ? "/dashboard"
      : "/select-org",
  );
}
