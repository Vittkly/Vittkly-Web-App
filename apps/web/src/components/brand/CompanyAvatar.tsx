"use client";

import React, { useState } from "react";
import { getOrganizationInitials } from "@/features/tenants/utils/initials";

export type CompanyAvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type CompanyAvatarShape = "circle" | "rounded";

export interface CompanyAvatarProps {
  name: string;
  menuIconUrl?: string | null;
  logoUrl?: string | null;
  brandColor?: string | null;
  size?: CompanyAvatarSize;
  shape?: CompanyAvatarShape;
  fallbackIcon?: React.ReactNode;
  className?: string;
  ariaHidden?: boolean;
  children?: React.ReactNode;
}

const SIZE_CLASSES: Record<CompanyAvatarSize, string> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-9 w-9 text-xs",
  lg: "h-10 w-10 text-xs",
  xl: "h-11 w-11 text-sm",
};

const SHAPE_CLASSES: Record<CompanyAvatarShape, string> = {
  circle: "rounded-full",
  rounded: "rounded-xl",
};

const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;

/**
 * Avatar reutilizable de empresa con prioridad visual:
 * 1) Ícono cuadrado del menú (`icono_menu_ruta`, ajuste `object-cover`)
 * 2) Logo principal (`logo_ruta`, ajuste `object-contain` con relleno para no recortar logos horizontales)
 * 3) Fallback seguro a `fallbackIcon` o iniciales de la empresa.
 */
export function CompanyAvatar({
  name,
  menuIconUrl,
  logoUrl,
  brandColor,
  size = "md",
  shape = "circle",
  fallbackIcon,
  className = "",
  ariaHidden = true,
  children,
}: CompanyAvatarProps) {
  const [failedUrls, setFailedUrls] = useState<string[]>([]);

  const cleanIcon = menuIconUrl?.trim() || null;
  const cleanLogo = logoUrl?.trim() || null;

  const canUseIcon = Boolean(cleanIcon && !failedUrls.includes(cleanIcon));
  const canUseLogo = Boolean(cleanLogo && !failedUrls.includes(cleanLogo));

  const activeSrc = canUseIcon ? cleanIcon : canUseLogo ? cleanLogo : null;
  const isSquareIcon = canUseIcon;

  const validBrandColor =
    brandColor && HEX_COLOR_RE.test(brandColor.trim())
      ? brandColor.trim()
      : null;

  const handleImageError = () => {
    if (!activeSrc) return;
    setFailedUrls((prev) =>
      prev.includes(activeSrc) ? prev : [...prev, activeSrc],
    );
  };

  return (
    <span
      aria-hidden={ariaHidden}
      className={`bg-surface-raised border-line text-primary-ink relative inline-flex shrink-0 items-center justify-center overflow-hidden border font-bold shadow-xs transition-colors ${SIZE_CLASSES[size]} ${SHAPE_CLASSES[shape]} ${className}`}
      style={validBrandColor ? { borderColor: validBrandColor } : undefined}
    >
      {activeSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={activeSrc}
          alt={name}
          onError={handleImageError}
          className={
            isSquareIcon
              ? "h-full w-full object-cover"
              : "h-full w-full object-contain p-0.5"
          }
        />
      ) : (
        (fallbackIcon ?? getOrganizationInitials(name))
      )}
      {children}
    </span>
  );
}

export default CompanyAvatar;
