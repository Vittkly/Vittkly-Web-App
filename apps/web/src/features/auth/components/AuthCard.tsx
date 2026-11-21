import React from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { VittklyLogo } from "@/components/brand/VittklyLogo";

interface AuthCardProps {
  children: React.ReactNode;
  showLogo?: boolean;
  className?: string;
}

/**
 * Contenedor estándar responsive de las tarjetas de autenticación (`/invitado`, `/olvide-contrasena`, etc.).
 */
export function AuthCard({
  children,
  showLogo = false,
  className = "",
}: AuthCardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          "bg-surface-raised border-line shadow-2 relative z-10 flex w-full max-w-[400px] flex-col gap-5 rounded-[18px] border p-4 transition-colors sm:p-7",
          className,
        ),
      )}
    >
      {showLogo && (
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="focus-visible:outline-focus inline-flex items-center transition-opacity hover:opacity-90 focus-visible:outline-2"
          >
            <VittklyLogo variant="wordmark" height={34} priority />
          </Link>
        </div>
      )}
      {children}
    </div>
  );
}
