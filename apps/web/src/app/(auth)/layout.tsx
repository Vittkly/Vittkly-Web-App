import React from 'react';
import Link from 'next/link';
import { VittklyLogo } from '@/components/brand/VittklyLogo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--tint)] flex min-h-dvh flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-[440px]">
        {/* Encabezado con logotipo oficial */}
        <div className="mb-6 flex flex-col items-center justify-center text-center">
          <Link
            href="/"
            className="inline-flex transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus)]"
          >
            <VittklyLogo variant="wordmark" height={38} priority />
          </Link>
          <span className="text-soft mt-2 text-xs font-semibold tracking-wider uppercase">
            Central de Servicios Web
          </span>
        </div>

        {/* Tarjeta de autenticación principal */}
        <div className="bg-surface-raised border-[var(--line)] shadow-1 sm:rounded-xl rounded-lg border p-6 sm:p-8">
          {children}
        </div>

        {/* Pie de página accesible */}
        <footer className="text-soft mt-8 text-center text-xs">
          <p>&copy; {new Date().getFullYear()} Vittkly. Todos los derechos reservados.</p>
          <p className="mt-1">
            Plataforma segura con encriptación TLS y RLS estricto.
          </p>
        </footer>
      </div>
    </div>
  );
}
