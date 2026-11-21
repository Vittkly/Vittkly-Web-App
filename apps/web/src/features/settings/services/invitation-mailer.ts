import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export interface InvitationEmailPayload {
  email: string;
  recipientName: string;
  empresaNombre: string;
  perfilNombre: string;
  invitadorNombre: string;
  rawToken: string;
  tipoInvitacion: "nueva_cuenta" | "cuenta_existente";
}

export interface MailerResult {
  success: boolean;
  provider: "resend" | "supabase_smtp" | "console_dev";
  activationUrl: string;
  error?: string;
}

function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}

/**
 * Despacha el correo de invitación utilizando Resend (si existe RESEND_API_KEY)
 * o el proveedor SMTP ya configurado en Supabase Auth Admin.
 */
export async function sendInvitationEmail(
  payload: InvitationEmailPayload,
): Promise<MailerResult> {
  const siteUrl = resolveSiteUrl();
  const activationUrl =
    payload.tipoInvitacion === "cuenta_existente"
      ? `${siteUrl}/accesos`
      : `${siteUrl}/activar-invitacion?token=${encodeURIComponent(payload.rawToken)}`;

  // Registro en consola en modo desarrollo
  if (process.env.NODE_ENV === "development") {
    console.log(
      `[MAILER] Enlace de invitación generado para ${payload.email} (${payload.empresaNombre}): ${activationUrl}`,
    );
  }

  // 1. Enviar vía Resend REST API si está configurado
  if (process.env.RESEND_API_KEY) {
    try {
      const fromEmail =
        process.env.RESEND_FROM_EMAIL || "Vittkly <notificaciones@vittkly.com>";
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [payload.email],
          subject: `${payload.invitadorNombre} te invitó a unirte a ${payload.empresaNombre} en Vittkly`,
          html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #0E2A3B; background: #FFFFFF; border: 1px solid #DDE7EC; border-radius: 16px;">
              <h2 style="color: #157AA8; margin-top: 0;">Te han invitado a Vittkly</h2>
              <p>Hola <strong>${payload.recipientName}</strong>,</p>
              <p><strong>${payload.invitadorNombre}</strong> te ha invitado a formar parte de <strong>${payload.empresaNombre}</strong> con el rol de <strong>${payload.perfilNombre}</strong>.</p>
              
              <div style="margin: 28px 0; text-align: center;">
                <a href="${activationUrl}" style="background-color: #157AA8; color: #FFFFFF; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                  ${payload.tipoInvitacion === "cuenta_existente" ? "Ver invitación en Accesos" : "Activar mi cuenta y entrar"}
                </a>
              </div>

              <p style="font-size: 13px; color: #52626D; line-height: 1.5;">
                Este enlace es personal y tiene una vigencia de 7 días. Si no reconoces esta invitación, puedes ignorar este mensaje de forma segura.
              </p>
              <hr style="border: 0; border-top: 1px solid #DDE7EC; margin: 20px 0;" />
              <p style="font-size: 11px; color: #52626D; text-align: center;">Vittkly SaaS · Central Operativa para Servicios en Campo</p>
            </div>
          `,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("[MAILER] Falló el despacho con Resend:", errorData);
        // Continuamos al fallback de Supabase SMTP si Resend falla
      } else {
        return {
          success: true,
          provider: "resend",
          activationUrl,
        };
      }
    } catch (resendErr) {
      console.error("[MAILER] Excepción al invocar Resend:", resendErr);
    }
  }

  // 2. Motor principal: Supabase Auth Admin con el SMTP conectado
  try {
    const supabaseAdmin = createAdminClient();

    // Invitar usuario mediante Supabase Auth para disparar la plantilla SMTP del proyecto
    const { error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(payload.email, {
        redirectTo: activationUrl,
        data: {
          nombres: payload.recipientName,
          empresa_nombre: payload.empresaNombre,
          perfil_nombre: payload.perfilNombre,
          invitador_nombre: payload.invitadorNombre,
          tipo: payload.tipoInvitacion,
        },
      });

    if (inviteError) {
      // Si el usuario ya existe en Auth (cuenta_existente o duplicado), Supabase Auth puede rechazar inviteUserByEmail.
      // En ese caso generamos el enlace de recuperación/invitación para que el SMTP lo gestione o como respaldo.
      const { data: linkData, error: linkError } =
        await supabaseAdmin.auth.admin.generateLink({
          type: "invite",
          email: payload.email,
          options: {
            redirectTo: activationUrl,
            data: {
              empresa_nombre: payload.empresaNombre,
              perfil_nombre: payload.perfilNombre,
            },
          },
        });

      if (linkError) {
        console.warn(
          "[MAILER] Supabase Auth no pudo despachar el correo:",
          inviteError.message,
          linkError.message,
        );
        return {
          success: false,
          provider: "supabase_smtp",
          activationUrl,
          error: `El servidor de correo de Supabase reportó: ${inviteError.message || linkError.message}`,
        };
      }

      return {
        success: true,
        provider: "supabase_smtp",
        activationUrl: linkData?.properties?.action_link || activationUrl,
      };
    }

    return {
      success: true,
      provider: "supabase_smtp",
      activationUrl,
    };
  } catch (supabaseErr: unknown) {
    const errorMsg =
      supabaseErr instanceof Error
        ? supabaseErr.message
        : "Error desconocido en el servidor de correo";
    console.error(
      "[MAILER] Error crítico en el despachador de correo:",
      errorMsg,
    );
    return {
      success: false,
      provider: "supabase_smtp",
      activationUrl,
      error: errorMsg,
    };
  }
}
