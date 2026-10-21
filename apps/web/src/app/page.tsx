import React from 'react';
import { VittklyLogo } from '@/components/brand/VittklyLogo';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="flex max-w-md flex-col items-center gap-6">
        <VittklyLogo variant="wordmark" height={44} priority />
        <div className="flex flex-col gap-2">
          <h1 className="text-ink text-xl font-bold tracking-tight">
            Plataforma Web SaaS &middot; Espacio de Trabajo
          </h1>
          <p className="text-ink-muted text-sm">
            Infraestructura base inicializada con Next.js App Router, Tailwind CSS, fuentes Manrope
            y tokens oficiales de Vittkly.
          </p>
        </div>
        <div className="rounded-pill bg-surface-sunken border-line text-ink-muted inline-flex items-center gap-2 border px-3 py-1 font-mono text-xs tabular-nums">
          <span>vittkly-web</span>
          <span>&bull;</span>
          <span>Workspace Ready</span>
        </div>
      </div>
    </main>
  );
}
