'use client';

import React, { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * Micro-componente cliente para renderizar el año actual sin bloquear
 * el prerenderizado estático de Server Components / Layouts en Next.js.
 * Utiliza `useSyncExternalStore` para proveer un snapshot estable en el servidor
 * y el año exacto en el cliente sin disparar alertas de setState en efectos.
 */
export function CurrentYear() {
  const year = useSyncExternalStore(
    emptySubscribe,
    () => new Date().getFullYear(),
    () => 2026
  );

  return <>{year}</>;
}

export default CurrentYear;
