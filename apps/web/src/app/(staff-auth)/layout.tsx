import React from "react";
import Link from "next/link";
import { VittklyLogo } from "@/components/brand/VittklyLogo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { CurrentYear } from "@/components/ui/CurrentYear";
import { AuthVisualShowcase } from "@/features/auth/components/AuthVisualShowcase";

export default function StaffAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface flex min-h-dvh flex-col justify-between p-4 transition-colors sm:p-6 lg:p-8">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between pb-4">
        <Link
          href="/"
          className="focus-visible:outline-focus inline-flex items-center gap-2 transition-opacity hover:opacity-90 focus-visible:outline-2"
        >
          <VittklyLogo variant="wordmark" height={32} priority />
        </Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto my-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="hidden lg:col-span-6 lg:block xl:col-span-7">
          <AuthVisualShowcase portal="staff" />
        </div>

        <div className="w-full lg:col-span-6 xl:col-span-5">
          <div className="bg-surface-raised border-line shadow-1 mx-auto w-full max-w-md rounded-2xl border p-6 sm:p-8">
            {children}
          </div>
        </div>
      </main>

      <footer className="text-ink-muted mx-auto w-full max-w-7xl pt-6 text-center text-xs">
        <p>
          &copy; <CurrentYear /> Vittkly Inc. &bull; Consola Interna de
          Plataforma &bull; Acceso restringido con auditoría
        </p>
      </footer>
    </div>
  );
}
