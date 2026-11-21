"use client";

import React, { useCallback, useEffect, useId, useRef } from "react";
import { AlertCircle, Building2, Smartphone } from "lucide-react";

export interface MobileOnlyAccessCompany {
  nombre: string;
  perfilNombre: string;
  accesoWeb: boolean;
  accesoApp: boolean;
}

export interface MobileOnlyAccessModalProps {
  isOpen: boolean;
  mode: "login" | "accesos";
  company?: MobileOnlyAccessCompany | null;
  onClose: () => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

const APP_STORE_ENV_URL = process.env.NEXT_PUBLIC_APP_STORE_URL?.trim() ?? "";
const PLAY_STORE_ENV_URL = process.env.NEXT_PUBLIC_PLAY_STORE_URL?.trim() ?? "";

function resolveSafeHttpsUrl(raw: string): string | null {
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    return parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

const APP_STORE_URL = resolveSafeHttpsUrl(APP_STORE_ENV_URL);
const PLAY_STORE_URL = resolveSafeHttpsUrl(PLAY_STORE_ENV_URL);

function StoreButton({
  storeName,
  href,
  icon,
}: {
  storeName: "App Store" | "Google Play";
  href: string | null;
  icon: React.ReactNode;
}) {
  const sharedClass =
    "border-line bg-surface-sunken text-ink flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border px-3 py-2 shadow-2xs transition-colors";

  const content = (
    <>
      {icon}
      <span className="flex flex-col text-left leading-none">
        <span className="text-ink-muted text-[10px] font-medium">
          {href ? "Disponible en" : "Próximamente en"}
        </span>
        <span className="mt-0.5 text-xs font-extrabold">{storeName}</span>
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${sharedClass} hover:border-primary hover:bg-primary-soft/50 focus-visible:outline-focus focus-visible:outline-2`}
      >
        {content}
      </a>
    );
  }

  return (
    <div
      className={sharedClass}
      aria-label={`${storeName}: Próximamente disponible`}
    >
      {content}
    </div>
  );
}

export function MobileOnlyAccessModal({
  isOpen,
  mode,
  company,
  onClose,
  returnFocusRef,
}: MobileOnlyAccessModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const capturedTriggerRef = useRef<HTMLElement | null>(null);

  const handleClose = useCallback(() => {
    const targetToRestore =
      returnFocusRef?.current ?? capturedTriggerRef.current;
    onClose();
    requestAnimationFrame(() => {
      targetToRestore?.focus();
    });
  }, [onClose, returnFocusRef]);

  useEffect(() => {
    if (!isOpen) return;

    capturedTriggerRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    closeButtonRef.current?.focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const hasCompanyContext = mode === "accesos" && Boolean(company);
  const isZeroAccess =
    hasCompanyContext &&
    company != null &&
    !company.accesoWeb &&
    !company.accesoApp;

  const titleText = isZeroAccess
    ? "Sin canales de acceso habilitados"
    : "Acceso exclusivo desde la app móvil";

  let descriptionNode: React.ReactNode;
  if (hasCompanyContext && company) {
    if (isZeroAccess) {
      descriptionNode = (
        <>
          Tu usuario no tiene canales de acceso habilitados en{" "}
          <strong className="text-ink font-semibold">{company.nombre}</strong>.
          Contacta al administrador de la empresa.
        </>
      );
    } else {
      descriptionNode = (
        <>
          Tu usuario en{" "}
          <strong className="text-ink font-semibold">{company.nombre}</strong>{" "}
          (perfil:{" "}
          <strong className="text-ink font-semibold">
            {company.perfilNombre}
          </strong>
          ) fue asignado únicamente para operar desde la app móvil de Vittkly y
          no tiene acceso al panel web.
        </>
      );
    }
  } else {
    descriptionNode =
      "Las cuentas asignadas con acceso exclusivo móvil operan sus servicios y tareas directamente desde la app de Vittkly en su celular.";
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="animate-sc-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="bg-surface-raised border-line text-ink shadow-2 relative flex max-h-[calc(100dvh-2rem)] w-full max-w-[440px] flex-col gap-4 overflow-y-auto overscroll-contain rounded-3xl border p-5 text-left sm:p-7"
      >
        {/* Ícono superior */}
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${
            isZeroAccess
              ? "border-danger/30 bg-danger-soft text-danger-ink"
              : "border-primary/20 bg-primary-soft text-primary-ink"
          }`}
        >
          {isZeroAccess ? (
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Smartphone className="h-6 w-6" aria-hidden="true" />
          )}
        </div>

        {/* Título y descripción dinámica */}
        <div className="flex flex-col gap-1.5">
          <h2
            id={titleId}
            className="text-ink text-lg font-bold tracking-tight sm:text-xl"
          >
            {titleText}
          </h2>
          <p
            id={descriptionId}
            className="text-ink-muted text-xs leading-relaxed sm:text-[0.82rem]"
          >
            {descriptionNode}
          </p>
        </div>

        {/* Pasos e información de descarga (oculto si tiene 0 canales habilitados) */}
        {!isZeroAccess && (
          <>
            <div className="bg-surface-sunken/70 border-line my-0.5 flex flex-col gap-3 rounded-2xl border p-4">
              <div className="flex items-start gap-3">
                <span className="bg-primary-soft text-primary-ink flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold tabular-nums">
                  1
                </span>
                <div className="flex flex-col text-xs leading-snug">
                  <b className="text-ink font-bold">
                    Descarga la app de Vittkly en tu celular
                  </b>
                  <span className="text-ink-muted">
                    Disponible para App Store y Google Play.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-primary-soft text-primary-ink flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold tabular-nums">
                  2
                </span>
                <div className="flex flex-col text-xs leading-snug">
                  <b className="text-ink font-bold">Inicia sesión</b>
                  <span className="text-ink-muted">
                    Usa tu{" "}
                    <strong className="text-ink">correo y contraseña</strong> de
                    Vittkly, o ingresa con tu{" "}
                    <strong className="text-ink">celular registrado</strong>{" "}
                    mediante código de verificación.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-primary-soft text-primary-ink flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold tabular-nums">
                  3
                </span>
                <div className="flex flex-col text-xs leading-snug">
                  <b className="text-ink flex items-center gap-1 font-bold">
                    <span>
                      {hasCompanyContext && company
                        ? `Selecciona ${company.nombre}`
                        : "Selecciona tu empresa"}
                    </span>
                  </b>
                  <span className="text-ink-muted">
                    Si perteneces a más de una empresa, elígela para comenzar a
                    operar.
                  </span>
                </div>
              </div>
            </div>

            {/* Tiendas App Store y Google Play */}
            <div className="grid grid-cols-1 gap-2.5 min-[360px]:grid-cols-2">
              <StoreButton
                storeName="App Store"
                href={APP_STORE_URL}
                icon={
                  <svg
                    className="h-4 w-4 shrink-0 fill-current"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.8 6.55c.55-.68.92-1.63.82-2.58-.81.03-1.79.54-2.37 1.22-.52.6-.98 1.56-.85 2.49.91.07 1.84-.48 2.4-1.13z" />
                  </svg>
                }
              />

              <StoreButton
                storeName="Google Play"
                href={PLAY_STORE_URL}
                icon={
                  <svg
                    className="h-4 w-4 shrink-0"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fill="#EA4335"
                      d="M3.609 1.814L13.792 12 3.61 22.186a1.458 1.458 0 0 1-.21-.81V2.624c0-.315.075-.589.21-.81z"
                    />
                    <path
                      fill="#FBBC04"
                      d="M17.33 11.286l-3.538-2.044L13.792 12l3.538 2.758 2.935-1.696c.717-.414.717-1.09 0-1.504l-2.935-1.696z"
                    />
                    <path
                      fill="#4285F4"
                      d="M3.61 22.186l11.6-10.772 2.122 2.122-11.45 6.612a1.45 1.45 0 0 1-.772.282c-.2 0-.38-.052-.5-.144z"
                    />
                    <path
                      fill="#34A853"
                      d="M3.609 1.814c.12-.092.3-.144.5-.144a1.45 1.45 0 0 1 .772.282l11.45 6.612-2.122 2.122L3.61 1.814z"
                    />
                  </svg>
                }
              />
            </div>

            {/* Aviso inferior para habilitar acceso web */}
            <p className="border-line text-ink-muted flex items-start gap-2 border-t pt-3 text-[0.76rem] leading-relaxed">
              <Building2
                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                aria-hidden="true"
              />
              <span>
                ¿Necesitas entrar desde una computadora? Pide a tu administrador
                que active tu{" "}
                <strong className="text-ink font-semibold">Acceso web</strong>{" "}
                en Configuraciones → Usuarios y perfiles.
              </span>
            </p>
          </>
        )}

        {/* Botón de cierre adaptado al contexto */}
        {mode === "accesos" ? (
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleClose}
            className="bg-primary text-on-primary hover:bg-primary-hover focus-visible:outline-focus mt-1 flex min-h-[44px] w-full cursor-pointer items-center justify-center rounded-xl px-4 text-xs font-bold transition-colors focus-visible:outline-2"
          >
            Entendido
          </button>
        ) : (
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleClose}
            className="border-line bg-surface-sunken text-ink hover:bg-surface focus-visible:outline-focus mt-1 flex min-h-[44px] w-full cursor-pointer items-center justify-center rounded-xl border px-4 text-xs font-bold transition-colors focus-visible:outline-2"
          >
            ← Volver a iniciar sesión
          </button>
        )}
      </div>
    </div>
  );
}

export default MobileOnlyAccessModal;
