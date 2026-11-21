import "server-only";

import {
  isTenantAdminRole,
  OPERATION_MODELS,
  type OperationModelCode,
  type UpdateCompanySettingsPayload,
} from "@vittkly/shared";
import { createClient as createServerClient } from "@/lib/supabase/server";
import type { Database, Json } from "@/types/database.types";
import type { CompanySettingsBundle } from "../types/settings.types";

const BRAND_ASSETS_BUCKET = "brand-assets";

function normalizeOperationModel(raw?: string | null): OperationModelCode {
  const clean = (raw ?? "").trim().toLowerCase();
  if (OPERATION_MODELS.includes(clean as OperationModelCode)) {
    return clean as OperationModelCode;
  }
  return "ambos";
}

function normalizeColorHex(raw?: string | null): string {
  const clean = (raw ?? "").trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(clean)) {
    return clean.toUpperCase();
  }
  return "#2AA8DE";
}

function extractAjustesRecord(
  raw: Json | null | undefined,
): Record<string, unknown> {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

export async function canUserEditCompanySettings(
  empresaId: string,
): Promise<boolean> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  // 1. Intentar validación vía RPC en PostgreSQL si ya está desplegada
  const { data: rpcAllowed, error: rpcError } = await supabase.rpc(
    "puede_editar_configuracion_empresa",
    {
      p_empresa_id: empresaId,
    },
  );

  if (!rpcError && typeof rpcAllowed === "boolean") {
    return rpcAllowed;
  }

  // 2. Fallback determinístico sobre membresías + perfil_permisos
  const { data: membership } = await supabase
    .from("membresias")
    .select("id, es_propietario, perfil_id, perfiles(codigo)")
    .eq("empresa_id", empresaId)
    .eq("usuario_id", user.id)
    .eq("activo", true)
    .maybeSingle();

  if (!membership) return false;

  const perfilRow = membership.perfiles as unknown as {
    codigo: string | null;
  } | null;

  if (isTenantAdminRole(membership.es_propietario, perfilRow?.codigo)) {
    return true;
  }

  if (!membership.perfil_id) return false;

  const { data: editPermRow } = await supabase
    .from("perfil_permisos")
    .select("permiso_codigo, alcance")
    .eq("perfil_id", membership.perfil_id)
    .eq("permiso_codigo", "configuracion.editar")
    .maybeSingle();

  return Boolean(editPermRow && editPermRow.alcance !== "ninguna");
}

export async function getCompanySettingsBundle(
  empresaId: string,
): Promise<CompanySettingsBundle | null> {
  const supabase = await createServerClient();

  const [empresaResult, configResult, canEdit] = await Promise.all([
    supabase.from("empresas").select("*").eq("id", empresaId).maybeSingle(),
    supabase
      .from("empresa_configuracion")
      .select("empresa_id, menu_acordeon, ajustes")
      .eq("empresa_id", empresaId)
      .maybeSingle(),
    canUserEditCompanySettings(empresaId),
  ]);

  if (empresaResult.error || !empresaResult.data) {
    return null;
  }

  const emp =
    empresaResult.data as Database["public"]["Tables"]["empresas"]["Row"];
  const cfg = configResult.data;
  const ajustes = extractAjustesRecord(cfg?.ajustes);

  const nombreComercial =
    (emp.nombre_comercial ?? "").trim() || (emp.razon_social ?? "").trim();

  const encabezadoFromAjustes =
    typeof ajustes.encabezado_documento === "string"
      ? ajustes.encabezado_documento
      : "";

  const pieFromAjustes =
    typeof ajustes.pie_pagina_documento === "string"
      ? ajustes.pie_pagina_documento
      : "";

  const whatsappFromAjustes =
    typeof ajustes.whatsapp_telefono === "string"
      ? ajustes.whatsapp_telefono
      : "";

  return {
    empresaId: emp.id,
    razonSocial: emp.razon_social || "",
    nombreComercial,
    ruc: emp.ruc || "",
    direccion: emp.direccion || "",
    rubro: emp.rubro || "",
    ciudad: emp.ciudad || "",
    whatsappTelefono: whatsappFromAjustes,
    encabezadoDocumento: encabezadoFromAjustes || nombreComercial,
    piePaginaDocumento: pieFromAjustes,
    logoRuta: emp.logo_ruta || null,
    iconoMenuRuta: emp.icono_menu_ruta || null,
    colorMarca: normalizeColorHex(emp.color_marca),
    modeloOperacion: normalizeOperationModel(emp.modelo_operacion),
    menuAcordeon: Boolean(cfg?.menu_acordeon),
    canEdit,
  };
}

export async function updateCompanySettingsInDb(
  empresaId: string,
  payload: UpdateCompanySettingsPayload,
): Promise<{ success: boolean; error?: string }> {
  const canEdit = await canUserEditCompanySettings(empresaId);
  if (!canEdit) {
    return {
      success: false,
      error: "No tienes permisos para editar la configuración de esta empresa.",
    };
  }

  const supabase = await createServerClient();

  const { error: rpcError } = await supabase.rpc(
    "actualizar_configuracion_empresa",
    {
      p_empresa_id: empresaId,
      p_razon_social: payload.razonSocial,
      p_nombre_comercial: payload.nombreComercial,
      p_ruc: payload.ruc ?? null,
      p_direccion: payload.direccion || null,
      p_rubro: payload.rubro || null,
      p_ciudad: payload.ciudad || null,
      p_whatsapp_telefono: payload.whatsappTelefono || null,
      p_encabezado_documento: payload.encabezadoDocumento || null,
      p_pie_pagina_documento: payload.piePaginaDocumento || null,
      p_logo_ruta: payload.logoRuta || null,
      p_icono_menu_ruta: payload.iconoMenuRuta || null,
      p_color_marca: payload.colorMarca,
      p_modelo_operacion: payload.modeloOperacion,
      p_menu_acordeon: payload.menuAcordeon,
    },
  );

  if (!rpcError) {
    return { success: true };
  }

  // Fallback directo si la migración RPC aún no ha sido corrida en Supabase Cloud
  const isMissingRpc =
    rpcError.code === "PGRST202" ||
    rpcError.code === "42883" ||
    rpcError.message.includes("actualizar_configuracion_empresa");

  if (!isMissingRpc) {
    return {
      success: false,
      error:
        rpcError.message ||
        "No se pudo guardar la configuración de la empresa.",
    };
  }

  const updateEmpresaPayload: Database["public"]["Tables"]["empresas"]["Update"] =
    {
      razon_social: payload.razonSocial,
      nombre_comercial: payload.nombreComercial,
      ruc: payload.ruc ?? null,
      direccion: payload.direccion || null,
      rubro: payload.rubro || null,
      ciudad: payload.ciudad || null,
      logo_ruta: payload.logoRuta || null,
      icono_menu_ruta: payload.iconoMenuRuta || null,
      color_marca: payload.colorMarca,
      modelo_operacion: payload.modeloOperacion,
    };

  const { error: empUpdateError } = await supabase
    .from("empresas")
    .update(updateEmpresaPayload)
    .eq("id", empresaId);

  if (empUpdateError) {
    // Si icono_menu_ruta aún no existe en BD remota, reintentar sin esa columna
    if (empUpdateError.message.includes("icono_menu_ruta")) {
      const retryPayload = { ...updateEmpresaPayload };
      delete retryPayload.icono_menu_ruta;
      const { error: retryErr } = await supabase
        .from("empresas")
        .update(retryPayload)
        .eq("id", empresaId);

      if (retryErr) {
        return {
          success: false,
          error:
            retryErr.message || "Error actualizando los datos de la empresa.",
        };
      }
    } else {
      return {
        success: false,
        error:
          empUpdateError.message ||
          "Error actualizando los datos de la empresa.",
      };
    }
  }

  const { data: currentCfg } = await supabase
    .from("empresa_configuracion")
    .select("ajustes")
    .eq("empresa_id", empresaId)
    .maybeSingle();

  const existingAjustes = extractAjustesRecord(currentCfg?.ajustes);
  delete existingAjustes.menu_acordeon;

  const mergedAjustes: Json = {
    ...(existingAjustes as Record<string, Json | undefined>),
    whatsapp_telefono: payload.whatsappTelefono || null,
    encabezado_documento: payload.encabezadoDocumento || null,
    pie_pagina_documento: payload.piePaginaDocumento || null,
  };

  const { error: cfgError } = await supabase
    .from("empresa_configuracion")
    .upsert(
      {
        empresa_id: empresaId,
        menu_acordeon: payload.menuAcordeon,
        ajustes: mergedAjustes,
      },
      { onConflict: "empresa_id" },
    );

  if (cfgError) {
    return {
      success: false,
      error:
        cfgError.message ||
        "Error actualizando las preferencias de menú y documentos.",
    };
  }

  return { success: true };
}

export async function uploadCompanyBrandAssetInDb(
  empresaId: string,
  kind: "logo" | "icono",
  file: File,
): Promise<{ success: boolean; url?: string; error?: string }> {
  const canEdit = await canUserEditCompanySettings(empresaId);
  if (!canEdit) {
    return {
      success: false,
      error: "No tienes permisos para subir archivos de marca en esta empresa.",
    };
  }

  const allowedTypes = new Set([
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/svg+xml",
  ]);
  if (!allowedTypes.has(file.type)) {
    return {
      success: false,
      error: "Formato no permitido. Usa PNG, JPG, WEBP o SVG.",
    };
  }

  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      success: false,
      error: "El archivo supera el límite máximo de 5 MB.",
    };
  }

  const extMap: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/svg+xml": "svg",
  };
  const ext = extMap[file.type] || "png";
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const storagePath = `${empresaId}/${kind}-${uniqueSuffix}.${ext}`;

  const supabase = await createServerClient();
  const { error: uploadError } = await supabase.storage
    .from(BRAND_ASSETS_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    return {
      success: false,
      error:
        uploadError.message ||
        "No se pudo subir la imagen al bucket brand-assets.",
    };
  }

  const { data: publicUrlData } = supabase.storage
    .from(BRAND_ASSETS_BUCKET)
    .getPublicUrl(storagePath);

  return {
    success: true,
    url: publicUrlData.publicUrl,
  };
}
