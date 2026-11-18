"use client";

import React, { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeftRight,
  Building2,
  CheckCircle2,
  Info,
  Loader2,
  Lock,
  Save,
  Upload,
} from "lucide-react";
import {
  BRAND_COLOR_PRESETS,
  OPERATION_MODEL_OPTIONS,
  sanitizeRucInput,
  validateOptionalRuc,
  type OperationModelCode,
} from "@vittkly/shared";
import {
  updateCompanySettingsAction,
  uploadCompanyBrandAssetAction,
} from "../actions/company-settings.actions";
import type { CompanySettingsBundle } from "../types/settings.types";

export interface CompanySettingsFormProps {
  initialData: CompanySettingsBundle;
}

export function CompanySettingsForm({ initialData }: CompanySettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [baseline, setBaseline] = useState<CompanySettingsBundle>(initialData);

  const [nombreComercial, setNombreComercial] = useState(
    initialData.nombreComercial,
  );
  const [rubro, setRubro] = useState(initialData.rubro);
  const [ciudad, setCiudad] = useState(initialData.ciudad);
  const [whatsappTelefono, setWhatsappTelefono] = useState(
    initialData.whatsappTelefono,
  );
  const [direccion, setDireccion] = useState(initialData.direccion);
  const [razonSocial, setRazonSocial] = useState(initialData.razonSocial);
  const [ruc, setRuc] = useState(initialData.ruc);
  const [encabezadoDocumento, setEncabezadoDocumento] = useState(
    initialData.encabezadoDocumento,
  );
  const [piePaginaDocumento, setPiePaginaDocumento] = useState(
    initialData.piePaginaDocumento,
  );
  const [logoRuta, setLogoRuta] = useState<string | null>(initialData.logoRuta);
  const [iconoMenuRuta, setIconoMenuRuta] = useState<string | null>(
    initialData.iconoMenuRuta,
  );
  const [colorMarca, setColorMarca] = useState(initialData.colorMarca);
  const [modeloOperacion, setModeloOperacion] = useState<OperationModelCode>(
    initialData.modeloOperacion,
  );
  const [menuAcordeon, setMenuAcordeon] = useState<boolean>(
    initialData.menuAcordeon,
  );

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingIcono, setIsUploadingIcono] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const iconoInputRef = useRef<HTMLInputElement | null>(null);

  const canEdit = initialData.canEdit;

  const rucValidation = useMemo(() => validateOptionalRuc(ruc), [ruc]);

  const isDirty = useMemo(() => {
    return (
      nombreComercial.trim() !== baseline.nombreComercial.trim() ||
      rubro.trim() !== baseline.rubro.trim() ||
      ciudad.trim() !== baseline.ciudad.trim() ||
      whatsappTelefono.trim() !== baseline.whatsappTelefono.trim() ||
      direccion.trim() !== baseline.direccion.trim() ||
      razonSocial.trim() !== baseline.razonSocial.trim() ||
      ruc.trim() !== baseline.ruc.trim() ||
      encabezadoDocumento.trim() !== baseline.encabezadoDocumento.trim() ||
      piePaginaDocumento.trim() !== baseline.piePaginaDocumento.trim() ||
      (logoRuta || null) !== (baseline.logoRuta || null) ||
      (iconoMenuRuta || null) !== (baseline.iconoMenuRuta || null) ||
      colorMarca.trim().toUpperCase() !==
        baseline.colorMarca.trim().toUpperCase() ||
      modeloOperacion !== baseline.modeloOperacion ||
      menuAcordeon !== baseline.menuAcordeon
    );
  }, [
    baseline,
    ciudad,
    colorMarca,
    direccion,
    encabezadoDocumento,
    iconoMenuRuta,
    logoRuta,
    menuAcordeon,
    modeloOperacion,
    nombreComercial,
    piePaginaDocumento,
    razonSocial,
    rubro,
    ruc,
    whatsappTelefono,
  ]);

  const displayCompanyName =
    nombreComercial.trim() || razonSocial.trim() || "Mi Empresa";
  const companyInitials = displayCompanyName.slice(0, 2).toUpperCase();

  const handleRucChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = sanitizeRucInput(e.target.value);
    setRuc(clean);
    setSuccessMsg(null);
    if (fieldErrors.ruc) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.ruc;
        return next;
      });
    }
  };

  const handleColorHexInput = (raw: string) => {
    const formatted = raw.startsWith("#") ? raw : `#${raw}`;
    setColorMarca(formatted.slice(0, 7).toUpperCase());
    setSuccessMsg(null);
  };

  const handleUploadAsset = async (
    kind: "logo" | "icono",
    file: File | undefined,
  ) => {
    if (!file || !canEdit) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    if (kind === "logo") {
      setIsUploadingLogo(true);
    } else {
      setIsUploadingIcono(true);
    }

    try {
      const formData = new FormData();
      formData.set("kind", kind);
      formData.set("file", file);

      const response = await uploadCompanyBrandAssetAction(formData);
      if (!response.success || !response.url) {
        setErrorMsg(
          response.error || "No se pudo subir la imagen seleccionada.",
        );
        return;
      }

      if (kind === "logo") {
        setLogoRuta(response.url);
      } else {
        setIconoMenuRuta(response.url);
      }
    } finally {
      if (kind === "logo") {
        setIsUploadingLogo(false);
        if (logoInputRef.current) logoInputRef.current.value = "";
      } else {
        setIsUploadingIcono(false);
        if (iconoInputRef.current) iconoInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canEdit || !isDirty || isPending) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setFieldErrors({});

    if (!rucValidation.valid) {
      setFieldErrors({
        ruc: rucValidation.error || "El RUC ingresado no es válido.",
      });
      setErrorMsg(rucValidation.error || "El RUC ingresado no es válido.");
      return;
    }

    startTransition(async () => {
      const res = await updateCompanySettingsAction({
        razonSocial,
        nombreComercial,
        ruc,
        direccion,
        rubro,
        ciudad,
        whatsappTelefono,
        encabezadoDocumento,
        piePaginaDocumento,
        logoRuta,
        iconoMenuRuta,
        colorMarca,
        modeloOperacion,
        menuAcordeon,
      });

      if (!res.success) {
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
        setErrorMsg(res.error || "No se pudieron guardar los cambios.");
        return;
      }

      setBaseline({
        ...baseline,
        razonSocial: razonSocial.trim(),
        nombreComercial: nombreComercial.trim(),
        ruc: ruc.trim(),
        direccion: direccion.trim(),
        rubro: rubro.trim(),
        ciudad: ciudad.trim(),
        whatsappTelefono: whatsappTelefono.trim(),
        encabezadoDocumento: encabezadoDocumento.trim(),
        piePaginaDocumento: piePaginaDocumento.trim(),
        logoRuta,
        iconoMenuRuta,
        colorMarca: colorMarca.trim().toUpperCase(),
        modeloOperacion,
        menuAcordeon,
      });
      setSuccessMsg("Cambios guardados correctamente en la empresa activa.");
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-12"
      noValidate
    >
      {/* Banner informativo en modo Solo Lectura */}
      {!canEdit && (
        <div
          role="status"
          data-testid="company-readonly-banner"
          className="border-line bg-surface-raised text-ink flex items-start gap-3 rounded-2xl border p-4 shadow-2xs"
        >
          <Lock className="text-primary-ink mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex flex-col gap-0.5 text-xs">
            <span className="font-bold">Modo solo lectura</span>
            <span className="text-ink-muted">
              Tu perfil actual permite consultar los datos de la empresa, pero
              solo el Propietario, un Administrador o un perfil con permiso de
              edición de configuración puede modificar y guardar cambios.
            </span>
          </div>
        </div>
      )}

      {/* Feedback de Error o Éxito */}
      {errorMsg && (
        <div
          role="alert"
          className="border-danger/40 bg-danger/10 text-danger flex items-center gap-2.5 rounded-xl border px-4 py-3 text-xs font-semibold"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div
          role="status"
          data-testid="company-save-success"
          className="border-primary/30 bg-primary-soft/50 text-primary-ink flex items-center gap-2.5 rounded-xl border px-4 py-3 text-xs font-semibold"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* TARJETA 1: EMPRESA (Datos, Marca y Documentos)                      */}
      {/* =================================================================== */}
      <section
        aria-labelledby="card-empresa-heading"
        className="bg-surface-raised border-line flex flex-col gap-6 rounded-2xl border p-6 shadow-xs"
      >
        {/* Cabecera de Tarjeta 1 */}
        <div className="border-line flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <div className="bg-primary-soft text-primary-ink flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
              <Building2 className="h-5 w-5" strokeWidth={1.9} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1
                  id="card-empresa-heading"
                  className="text-ink text-lg font-extrabold tracking-tight"
                >
                  Empresa
                </h1>
                <span className="border-line bg-surface-sunken text-ink-muted rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums">
                  CFG-EMP
                </span>
              </div>
              <p className="text-ink-muted text-xs">
                Datos generales y documentos de esta empresa
              </p>
            </div>
          </div>

          <Link
            href="/accesos"
            className="border-line bg-surface hover:bg-surface-sunken text-ink inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl border px-3.5 text-xs font-bold shadow-2xs transition-colors"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            <span>Cambiar de empresa</span>
          </Link>
        </div>

        {/* Subsección: MARCA */}
        <div className="border-line flex flex-col gap-3 border-b pb-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-ink-muted text-[11px] font-extrabold tracking-wider uppercase">
              MARCA
            </h2>
            {((logoRuta || null) !== (baseline.logoRuta || null) ||
              (iconoMenuRuta || null) !== (baseline.iconoMenuRuta || null)) && (
              <span className="bg-primary-soft text-primary-ink rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
                Imagen lista · Pulsa &quot;Guardar cambios&quot; al final para
                aplicarla
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Bloque 1: LOGO DE LA EMPRESA (DOCUMENTOS) */}
            <div className="border-line bg-surface flex flex-col justify-between gap-3 rounded-xl border p-4">
              <span className="text-ink-muted text-[11px] font-bold tracking-wider uppercase">
                LOGO DE LA EMPRESA (DOCUMENTOS)
              </span>

              <div className="flex items-center gap-3.5">
                <div className="border-line bg-surface-sunken flex h-14 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border px-2">
                  {logoRuta ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoRuta}
                      alt={`Logo de ${displayCompanyName}`}
                      className="max-h-12 max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-ink truncate text-xs font-extrabold">
                      {displayCompanyName}
                    </span>
                  )}
                </div>

                <div className="flex min-w-0 flex-col gap-1.5">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    disabled={!canEdit || isUploadingLogo}
                    onChange={(e) =>
                      handleUploadAsset("logo", e.target.files?.[0])
                    }
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={!canEdit || isUploadingLogo}
                    onClick={() => logoInputRef.current?.click()}
                    className="border-line bg-surface-raised hover:bg-surface-sunken text-ink inline-flex h-8 w-fit cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-extrabold tracking-wide uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isUploadingLogo ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    <span>SUBIR LOGO</span>
                  </button>
                  <span className="text-ink-muted text-[11px] leading-snug">
                    Aparece en tus cotizaciones y órdenes
                  </span>
                </div>
              </div>
            </div>

            {/* Bloque 2: ÍCONO DEL MENÚ (CUADRADO) */}
            <div className="border-line bg-surface flex flex-col justify-between gap-3 rounded-xl border p-4">
              <span className="text-ink-muted text-[11px] font-bold tracking-wider uppercase">
                ÍCONO DEL MENÚ (CUADRADO)
              </span>

              <div className="flex items-center gap-3.5">
                <div className="border-line bg-surface-sunken text-primary-ink flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border text-sm font-extrabold">
                  {iconoMenuRuta ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={iconoMenuRuta}
                      alt={`Ícono de ${displayCompanyName}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{companyInitials}</span>
                  )}
                </div>

                <div className="flex min-w-0 flex-col gap-1.5">
                  <input
                    ref={iconoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    disabled={!canEdit || isUploadingIcono}
                    onChange={(e) =>
                      handleUploadAsset("icono", e.target.files?.[0])
                    }
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={!canEdit || isUploadingIcono}
                    onClick={() => iconoInputRef.current?.click()}
                    className="border-line bg-surface-raised hover:bg-surface-sunken text-ink inline-flex h-8 w-fit cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-extrabold tracking-wide uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isUploadingIcono ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    <span>SUBIR ÍCONO</span>
                  </button>
                  <span className="text-ink-muted text-[11px] leading-snug">
                    Círculo arriba a la izquierda
                  </span>
                </div>
              </div>
            </div>

            {/* Bloque 3: COLOR PRINCIPAL */}
            <div className="border-line bg-surface flex flex-col justify-between gap-3 rounded-xl border p-4">
              <span className="text-ink-muted text-[11px] font-bold tracking-wider uppercase">
                COLOR PRINCIPAL
              </span>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2.5">
                  <label className="border-line relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border shadow-2xs">
                    <input
                      type="color"
                      aria-label="Selector de color principal"
                      disabled={!canEdit}
                      value={
                        /^#[0-9A-Fa-f]{6}$/.test(colorMarca)
                          ? colorMarca
                          : "#2AA8DE"
                      }
                      onChange={(e) => handleColorHexInput(e.target.value)}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                    />
                    <span
                      aria-hidden="true"
                      className="h-full w-full"
                      style={{
                        backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(colorMarca)
                          ? colorMarca
                          : "#2AA8DE",
                      }}
                    />
                  </label>

                  <input
                    type="text"
                    aria-label="Código hexadecimal del color principal"
                    disabled={!canEdit}
                    value={colorMarca}
                    maxLength={7}
                    onChange={(e) => handleColorHexInput(e.target.value)}
                    className="border-line bg-surface-raised text-ink focus:border-primary h-9 w-28 rounded-lg border px-2.5 font-mono text-xs font-bold uppercase tabular-nums outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <div className="flex items-center gap-1">
                    {BRAND_COLOR_PRESETS.map((preset) => {
                      const isSelected =
                        colorMarca.toUpperCase() === preset.toUpperCase();
                      return (
                        <button
                          key={preset}
                          type="button"
                          disabled={!canEdit}
                          onClick={() => handleColorHexInput(preset)}
                          title={`Usar color ${preset}`}
                          aria-label={`Usar color ${preset}`}
                          className={`h-5 w-5 cursor-pointer rounded-full border transition-transform disabled:cursor-not-allowed disabled:opacity-50 ${
                            isSelected
                              ? "border-ink scale-110 ring-2 ring-offset-1"
                              : "border-line hover:scale-105"
                          }`}
                          style={{ backgroundColor: preset }}
                        />
                      );
                    })}
                  </div>
                </div>

                <span className="text-ink-muted text-[11px] leading-snug">
                  Botones y acentos de tus documentos
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Subsección: Datos Generales (Grid 2 columnas) */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="emp-nombre-comercial"
              className="text-ink-muted text-[11px] font-extrabold tracking-wider uppercase"
            >
              NOMBRE DE LA EMPRESA
            </label>
            <input
              id="emp-nombre-comercial"
              type="text"
              disabled={!canEdit}
              value={nombreComercial}
              onChange={(e) => {
                setNombreComercial(e.target.value);
                setSuccessMsg(null);
              }}
              placeholder="Ej. Vitta Kleanly"
              className="border-line bg-surface text-ink focus:border-primary h-10 rounded-xl border px-3.5 text-sm font-medium transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
            {fieldErrors.nombreComercial && (
              <span className="text-danger text-[11px] font-semibold">
                {fieldErrors.nombreComercial}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="emp-rubro"
              className="text-ink-muted text-[11px] font-extrabold tracking-wider uppercase"
            >
              A QUÉ SE DEDICA
            </label>
            <input
              id="emp-rubro"
              type="text"
              disabled={!canEdit}
              value={rubro}
              onChange={(e) => {
                setRubro(e.target.value);
                setSuccessMsg(null);
              }}
              placeholder="Ej. Saneamiento ambiental y limpieza industrial"
              className="border-line bg-surface text-ink focus:border-primary h-10 rounded-xl border px-3.5 text-sm font-medium transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="emp-ciudad"
              className="text-ink-muted text-[11px] font-extrabold tracking-wider uppercase"
            >
              CIUDAD
            </label>
            <input
              id="emp-ciudad"
              type="text"
              disabled={!canEdit}
              value={ciudad}
              onChange={(e) => {
                setCiudad(e.target.value);
                setSuccessMsg(null);
              }}
              placeholder="Ej. Lima"
              className="border-line bg-surface text-ink focus:border-primary h-10 rounded-xl border px-3.5 text-sm font-medium transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="emp-whatsapp"
              className="text-ink-muted text-[11px] font-extrabold tracking-wider uppercase"
            >
              WHATSAPP / TELÉFONO
            </label>
            <input
              id="emp-whatsapp"
              type="tel"
              disabled={!canEdit}
              value={whatsappTelefono}
              onChange={(e) => {
                setWhatsappTelefono(e.target.value);
                setSuccessMsg(null);
              }}
              placeholder="Ej. +51 987 654 321"
              className="border-line bg-surface text-ink focus:border-primary h-10 rounded-xl border px-3.5 text-sm font-medium transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label
              htmlFor="emp-direccion"
              className="text-ink-muted text-[11px] font-extrabold tracking-wider uppercase"
            >
              DIRECCIÓN FISCAL / OPERATIVA
            </label>
            <input
              id="emp-direccion"
              type="text"
              disabled={!canEdit}
              value={direccion}
              onChange={(e) => {
                setDireccion(e.target.value);
                setSuccessMsg(null);
              }}
              placeholder="Ej. Av. Javier Prado Este 4200, Surco, Lima"
              className="border-line bg-surface text-ink focus:border-primary h-10 rounded-xl border px-3.5 text-sm font-medium transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>

        {/* Subsección: DATOS PARA LOS DOCUMENTOS */}
        <div className="border-line flex flex-col gap-4 border-t pt-6">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-ink-muted text-[11px] font-extrabold tracking-wider uppercase">
              DATOS PARA LOS DOCUMENTOS
            </h2>
            <p className="text-ink-muted text-xs">
              Salen en tus cotizaciones, órdenes de servicio y comprobantes.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="emp-razon-social"
                className="text-ink-muted text-[11px] font-extrabold tracking-wider uppercase"
              >
                RAZÓN SOCIAL
              </label>
              <input
                id="emp-razon-social"
                type="text"
                disabled={!canEdit}
                value={razonSocial}
                onChange={(e) => {
                  setRazonSocial(e.target.value);
                  setSuccessMsg(null);
                }}
                placeholder="Ej. Vitta Kleanly S.A.C."
                className="border-line bg-surface text-ink focus:border-primary h-10 rounded-xl border px-3.5 text-sm font-medium transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
              {fieldErrors.razonSocial && (
                <span className="text-danger text-[11px] font-semibold">
                  {fieldErrors.razonSocial}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="emp-ruc"
                className="text-ink-muted text-[11px] font-extrabold tracking-wider uppercase"
              >
                RUC
              </label>
              <input
                id="emp-ruc"
                type="text"
                inputMode="numeric"
                maxLength={11}
                disabled={!canEdit}
                value={ruc}
                onChange={handleRucChange}
                placeholder="Ej. 20609000008"
                className={`bg-surface text-ink h-10 rounded-xl border px-3.5 font-mono text-sm font-semibold tabular-nums transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
                  !rucValidation.valid
                    ? "border-danger focus:border-danger"
                    : "border-line focus:border-primary"
                }`}
              />
              {!rucValidation.valid ? (
                <span
                  data-testid="ruc-validation-error"
                  className="text-danger text-[11px] font-semibold"
                >
                  {rucValidation.error}
                </span>
              ) : (
                <span className="text-ink-muted text-[11px]">
                  11 dígitos numéricos (SUNAT). Puedes dejarlo en blanco si aún
                  está en trámite.
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="emp-encabezado-doc"
                className="text-ink-muted text-[11px] font-extrabold tracking-wider uppercase"
              >
                NOMBRE EN EL ENCABEZADO DEL DOCUMENTO
              </label>
              <input
                id="emp-encabezado-doc"
                type="text"
                disabled={!canEdit}
                value={encabezadoDocumento}
                onChange={(e) => {
                  setEncabezadoDocumento(e.target.value);
                  setSuccessMsg(null);
                }}
                placeholder="Ej. Vitta Kleanly"
                className="border-line bg-surface text-ink focus:border-primary h-10 rounded-xl border px-3.5 text-sm font-medium transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
              <span className="text-ink-muted text-[11px]">
                Cómo aparece tu empresa arriba de la cotización.
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="emp-pie-doc"
                className="text-ink-muted text-[11px] font-extrabold tracking-wider uppercase"
              >
                FRASE DEL PIE DE PÁGINA
              </label>
              <input
                id="emp-pie-doc"
                type="text"
                disabled={!canEdit}
                value={piePaginaDocumento}
                onChange={(e) => {
                  setPiePaginaDocumento(e.target.value);
                  setSuccessMsg(null);
                }}
                placeholder="Ej. Gracias por confiar en nosotros • Garantía 30 días"
                className="border-line bg-surface text-ink focus:border-primary h-10 rounded-xl border px-3.5 text-sm font-medium transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
              <span className="text-ink-muted text-[11px]">
                Sale al final de tus cotizaciones y órdenes.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* TARJETA 2: MENÚ Y MODELO DE OPERACIÓN                               */}
      {/* =================================================================== */}
      <section
        aria-labelledby="card-modelo-heading"
        className="bg-surface-raised border-line flex flex-col gap-6 rounded-2xl border p-6 shadow-xs"
      >
        {/* Cabecera de Tarjeta 2 */}
        <div className="border-line flex flex-col gap-1 border-b pb-4">
          <h2
            id="card-modelo-heading"
            className="text-ink text-base font-extrabold tracking-tight"
          >
            Menú y modelo de operación
          </h2>
          <p className="text-ink-muted text-xs">
            Aplica a la empresa activa ({displayCompanyName}).
          </p>
        </div>

        {/* Subsección: MODELO DE OPERACIÓN */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-ink-muted text-[11px] font-extrabold tracking-wider uppercase">
              MODELO DE OPERACIÓN
            </span>
            <p className="text-ink-muted text-xs">
              Define qué herramientas se muestran en el menú lateral según cómo
              cobras a tus clientes.
            </p>
          </div>

          <div
            role="radiogroup"
            aria-label="Modelo de operación"
            className="grid grid-cols-1 gap-3.5 md:grid-cols-3"
          >
            {OPERATION_MODEL_OPTIONS.map((option) => {
              const isSelected = modeloOperacion === option.code;
              return (
                <label
                  key={option.code}
                  data-testid={`operation-model-${option.code}`}
                  className={`relative flex flex-col justify-between gap-2.5 rounded-xl border p-4 transition-all ${
                    !canEdit
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer"
                  } ${
                    isSelected
                      ? "border-primary bg-primary-soft/25 ring-primary ring-1"
                      : "border-line bg-surface hover:bg-surface-sunken/60"
                  }`}
                >
                  <input
                    type="radio"
                    name="modeloOperacion"
                    value={option.code}
                    checked={isSelected}
                    disabled={!canEdit}
                    onChange={() => {
                      setModeloOperacion(option.code);
                      setSuccessMsg(null);
                    }}
                    className="sr-only"
                  />

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-line-strong bg-surface"
                        }`}
                      >
                        {isSelected && (
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </span>
                      <span className="text-ink text-sm font-bold">
                        {option.label}
                      </span>
                    </div>

                    <Info
                      className="text-ink-muted h-3.5 w-3.5 shrink-0"
                      aria-hidden="true"
                    />
                  </div>

                  <p className="text-ink-muted text-xs leading-relaxed">
                    {option.description}
                  </p>
                </label>
              );
            })}
          </div>
        </div>

        {/* Subsección: MENÚ EN ACORDEÓN */}
        <div className="border-line flex flex-col gap-3 border-t pt-6">
          <span className="text-ink-muted text-[11px] font-extrabold tracking-wider uppercase">
            MENÚ EN ACORDEÓN
          </span>

          <label
            className={`border-line bg-surface flex items-start gap-3 rounded-xl border p-4 transition-colors ${
              !canEdit
                ? "cursor-not-allowed opacity-60"
                : "hover:bg-surface-sunken/50 cursor-pointer"
            }`}
          >
            <input
              type="checkbox"
              disabled={!canEdit}
              checked={menuAcordeon}
              onChange={(e) => {
                setMenuAcordeon(e.target.checked);
                setSuccessMsg(null);
              }}
              className="accent-primary mt-0.5 h-4 w-4 shrink-0 rounded"
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-ink text-sm font-bold">
                Abrir un solo grupo del menú a la vez
              </span>
              <span
                data-testid="accordion-status-helper"
                className="text-ink-muted text-xs"
              >
                {menuAcordeon
                  ? "Activado: al abrir un grupo del menú lateral se cierran los demás."
                  : "Desactivado: puedes abrir varios grupos a la vez."}
              </span>
            </div>
          </label>
        </div>
      </section>

      {/* =================================================================== */}
      {/* BARRA DE GUARDADO                                                   */}
      {/* =================================================================== */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <button
          type="submit"
          data-testid="company-save-btn"
          disabled={!canEdit || !isDirty || isPending || !rucValidation.valid}
          className="bg-primary text-on-primary hover:bg-primary-hover inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl px-5 text-xs font-extrabold shadow-xs transition-all disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{isPending ? "Guardando..." : "Guardar cambios"}</span>
        </button>

        {isDirty && canEdit && (
          <span className="text-ink-muted text-xs font-medium">
            Tienes cambios sin guardar
          </span>
        )}
      </div>
    </form>
  );
}

export default CompanySettingsForm;
