"use server";

import { createHash } from "crypto";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getInvitationByToken } from "../services/invitacion-activation.service";

export type OtpChannel = "correo" | "celular";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export function maskContact(value: string, channel: OtpChannel): string {
  if (channel === "correo") {
    const [user, domain] = value.split("@");
    if (!user || !domain) return value;
    const visible = user.slice(0, 2);
    return `${visible}••••@${domain}`;
  }
  const clean = value.trim();
  if (clean.length < 6) return clean;
  return `${clean.slice(0, 3)} ••• ••${clean.slice(-2)}`;
}

/**
 * Genera y envía un código OTP de 6 dígitos al canal seleccionado (correo o celular).
 */
export async function enviarOtpActivacionAction(params: {
  token: string;
  canal: OtpChannel;
}): Promise<ActionResult<{ destinoEnmascarado: string }>> {
  const { token, canal } = params;
  const status = await getInvitationByToken(token);

  if (status.status !== "valid" || status.tipo !== "nueva_cuenta") {
    return {
      success: false,
      error:
        "La invitación no es válida o ya se encuentra vinculada a una cuenta activa.",
    };
  }

  const { invitation } = status;
  const destino = canal === "correo" ? invitation.correo : invitation.celular;

  if (!destino) {
    return {
      success: false,
      error: `La invitación no registra un ${canal === "correo" ? "correo electrónico" : "número de celular"} válido.`,
    };
  }

  // Generar código OTP de 6 dígitos numéricos
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedCode = createHash("sha256").update(otpCode, "utf8").digest("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutos

  const adminClient = createAdminClient();

  // Registrar en public.verificaciones
  const { error: insertError } = await adminClient
    .from("verificaciones")
    .insert({
      canal,
      destino: destino.trim().toLowerCase(),
      codigo_hash: hashedCode,
      intentos: 0,
      vence_en: expiresAt,
    });

  if (insertError) {
    console.error("[Vittkly OTP] Error registrando verificación:", insertError);
    return {
      success: false,
      error: "No se pudo emitir el código de verificación. Inténtalo de nuevo.",
    };
  }

  // Registro en consola de desarrollo para pruebas ágiles
  if (process.env.NODE_ENV === "development") {
    console.log(
      `[Vittkly OTP] Código para ${destino} (${canal}) en empresa ${invitation.empresaNombre}: ${otpCode}`,
    );
  }

  // Despacho de correo transaccional si el canal es correo y Resend está configurado
  if (canal === "correo" && process.env.RESEND_API_KEY) {
    try {
      const fromEmail =
        process.env.RESEND_FROM_EMAIL || "Vittkly <notificaciones@vittkly.com>";
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [destino],
          subject: `${otpCode} es tu código de confirmación en Vittkly`,
          html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; color: #0E2A3B; background: #FFFFFF; border: 1px solid #DDE7EC; border-radius: 16px;">
              <h2 style="color: #157AA8; margin-top: 0;">Código de Confirmación</h2>
              <p>Hola,</p>
              <p>Usa este código de 6 dígitos para verificar tu identidad y activar tu cuenta en <strong>${invitation.empresaNombre}</strong>:</p>
              <div style="margin: 24px 0; text-align: center;">
                <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; background: #F0F9FF; color: #157AA8; padding: 12px 24px; border-radius: 8px; border: 1px dashed #157AA8; display: inline-block; font-family: monospace;">
                  ${otpCode}
                </span>
              </div>
              <p style="font-size: 13px; color: #52626D;">Este código expira en 15 minutos. Si no solicitaste este acceso, puedes ignorar este mensaje.</p>
            </div>
          `,
        }),
      });
    } catch (mailErr) {
      console.warn("[Vittkly OTP] Error despachando OTP con Resend:", mailErr);
    }
  }

  return {
    success: true,
    data: {
      destinoEnmascarado: maskContact(destino, canal),
    },
  };
}

/**
 * Valida el código de 6 dígitos ingresado por el usuario.
 */
export async function verificarOtpActivacionAction(params: {
  token: string;
  canal: OtpChannel;
  code: string;
}): Promise<ActionResult<void>> {
  const { token, canal, code } = params;
  const status = await getInvitationByToken(token);

  if (status.status !== "valid" || status.tipo !== "nueva_cuenta") {
    return {
      success: false,
      error: "La invitación no es válida.",
    };
  }

  const cleanCode = code.trim();
  if (!/^\d{6}$/.test(cleanCode)) {
    return {
      success: false,
      error: "Ingresa el código numérico de 6 dígitos completo.",
    };
  }

  const destino =
    canal === "correo" ? status.invitation.correo : status.invitation.celular;

  if (!destino) {
    return { success: false, error: "Destino no encontrado en la invitación." };
  }

  const adminClient = createAdminClient();
  const normalizedDestino = destino.trim().toLowerCase();

  // Buscar última verificación pendiente
  const { data: verifRow, error: fetchError } = await adminClient
    .from("verificaciones")
    .select("id, codigo_hash, intentos, vence_en, verificado_en")
    .eq("canal", canal)
    .eq("destino", normalizedDestino)
    .is("verificado_en", null)
    .gt("vence_en", new Date().toISOString())
    .order("creado_en", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError || !verifRow) {
    return {
      success: false,
      error:
        "El código ha expirado o no se encontró una solicitud activa. Solicita un nuevo código.",
    };
  }

  if (verifRow.intentos >= 5) {
    return {
      success: false,
      error:
        "Demasiados intentos incorrectos. Por seguridad, solicita un nuevo código.",
    };
  }

  const hashedInput = createHash("sha256")
    .update(cleanCode, "utf8")
    .digest("hex");

  if (hashedInput !== verifRow.codigo_hash) {
    // Incrementar intentos
    await adminClient
      .from("verificaciones")
      .update({ intentos: verifRow.intentos + 1 })
      .eq("id", verifRow.id);

    const remaining = 5 - (verifRow.intentos + 1);
    return {
      success: false,
      error: `Código de verificación incorrecto. ${remaining > 0 ? `Te quedan ${remaining} intentos.` : "Código bloqueado; solicita uno nuevo."}`,
    };
  }

  // Marcar verificación como completada
  await adminClient
    .from("verificaciones")
    .update({
      verificado_en: new Date().toISOString(),
    })
    .eq("id", verifRow.id);

  return { success: true };
}

/**
 * Crea la cuenta de Supabase Auth, asegura las filas en `usuarios` y `membresias`,
 * marca la invitación como aceptada e inicia sesión en la cookie.
 */
export async function completarActivacionAction(params: {
  token: string;
  fullName: string;
  password: string;
  confirmPassword: string;
}): Promise<ActionResult<{ redirectUrl: string }>> {
  const { token, fullName, password, confirmPassword } = params;
  const status = await getInvitationByToken(token);

  if (status.status !== "valid" || status.tipo !== "nueva_cuenta") {
    return {
      success: false,
      error: "La invitación no es válida o ya fue utilizada.",
    };
  }

  const { invitation } = status;
  const trimmedName = fullName.trim();

  if (!trimmedName || trimmedName.length < 3) {
    return {
      success: false,
      error: "Ingresa tu nombre y apellido completos.",
    };
  }

  if (password !== confirmPassword) {
    return {
      success: false,
      error: "Las contraseñas no coinciden.",
    };
  }

  // Validación de contraseña segura
  if (password.length < 8) {
    return {
      success: false,
      error: "La contraseña debe tener al menos 8 caracteres.",
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      success: false,
      error: "La contraseña debe incluir al menos una letra mayúscula.",
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      success: false,
      error: "La contraseña debe incluir al menos una letra minúscula.",
    };
  }
  if (!/\d/.test(password)) {
    return {
      success: false,
      error: "La contraseña debe incluir al menos un número.",
    };
  }

  const adminClient = createAdminClient();
  const normalizedEmail = invitation.correo.trim().toLowerCase();

  // Verificar que exista una verificación completada para este destino en los últimos 30 min
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const { data: verifOk } = await adminClient
    .from("verificaciones")
    .select("id")
    .eq("destino", normalizedEmail)
    .not("verificado_en", "is", null)
    .gt("verificado_en", thirtyMinutesAgo)
    .limit(1)
    .maybeSingle();

  if (!verifOk && process.env.NODE_ENV !== "development") {
    return {
      success: false,
      error:
        "Debes verificar tu código de seguridad antes de establecer tu contraseña.",
    };
  }

  // Separar nombres y apellidos
  const nameParts = trimmedName.split(" ").filter(Boolean);
  const parsedNombres =
    nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : trimmedName;
  const parsedApellidos =
    nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

  let authUserId: string;

  // 1. Crear el usuario en Supabase Auth
  const { data: newAuthUser, error: authError } =
    await adminClient.auth.admin.createUser({
      email: normalizedEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: trimmedName,
        nombre: trimmedName,
      },
    });

  if (authError || !newAuthUser?.user) {
    // Si ya existía el usuario en Auth, intentar actualizarlo
    if (
      authError?.message?.includes("already registered") ||
      authError?.message?.includes("unique")
    ) {
      const { data: listData } = await adminClient.auth.admin.listUsers();
      const found = listData.users.find(
        (u) => (u.email || "").toLowerCase() === normalizedEmail,
      );
      if (!found) {
        return {
          success: false,
          error:
            authError?.message || "No se pudo registrar la cuenta en Vittkly.",
        };
      }
      authUserId = found.id;
      await adminClient.auth.admin.updateUserById(authUserId, {
        password: password,
        user_metadata: {
          full_name: trimmedName,
          nombre: trimmedName,
        },
      });
    } else {
      return {
        success: false,
        error:
          authError?.message || "No se pudo registrar la cuenta en Vittkly.",
      };
    }
  } else {
    authUserId = newAuthUser.user.id;
  }

  // 2. Asegurar fila en public.usuarios
  const { error: userUpsertError } = await adminClient.from("usuarios").upsert({
    id: authUserId,
    nombre: trimmedName,
    nombres: parsedNombres,
    apellidos: parsedApellidos || null,
    correo: normalizedEmail,
    celular: invitation.celular,
    ultima_empresa_id: invitation.empresaId,
  });

  if (userUpsertError) {
    console.warn(
      "[Vittkly Auth] Advertencia al actualizar fila en public.usuarios:",
      userUpsertError,
    );
  }

  // 3. Crear/activar membresía en public.membresias
  const { error: memberError } = await adminClient.from("membresias").upsert(
    {
      empresa_id: invitation.empresaId,
      usuario_id: authUserId,
      perfil_id: invitation.perfilId,
      cargo: invitation.cargo,
      acceso_web: invitation.accesoWeb,
      acceso_app: invitation.accesoApp,
      estado: "activa",
      activo: true,
      invitacion_id: invitation.id,
      desvinculada_en: null,
    },
    { onConflict: "empresa_id,usuario_id" },
  );

  if (memberError) {
    console.error(
      "[Vittkly Auth] Error asignando membresía en public.membresias:",
      memberError,
    );
    return {
      success: false,
      error: "No se pudo vincular tu membresía a la empresa.",
    };
  }

  // 4. Marcar la invitación como aceptada
  await adminClient
    .from("invitaciones")
    .update({
      estado: "aceptada",
      usada_en: new Date().toISOString(),
      usada_por: authUserId,
      respondida_en: new Date().toISOString(),
    })
    .eq("id", invitation.id);

  // 5. Iniciar sesión automáticamente en la sesión SSR
  const supabase = await createServerClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (signInError) {
    console.warn(
      "[Vittkly Auth] Inicio de sesión automático posterior a registro:",
      signInError,
    );
    // Si no pudo firmar cookie automáticamente, redirigir al login
    return {
      success: true,
      data: {
        redirectUrl: `/login?email=${encodeURIComponent(normalizedEmail)}&activated=true`,
      },
    };
  }

  // 6. Fijar la cookie de empresa activa en la sesión
  const cookieStore = await cookies();
  cookieStore.set("vittkly_active_org_id", invitation.empresaId, {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
  });

  return {
    success: true,
    data: {
      redirectUrl: "/dashboard",
    },
  };
}
