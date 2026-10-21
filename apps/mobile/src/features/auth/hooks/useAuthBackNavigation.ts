import { type Href, router } from 'expo-router';
import { useCallback } from 'react';

/**
 * Hook para navegación hacia atrás segura: si existe historial navega atrás,
 * en caso contrario redirige a la ruta de fallback indicada.
 */
export function useAuthBackNavigation(defaultFallback: Href = '/(auth)/welcome') {
  const handleBack = useCallback(
    (fallback?: Href) => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace(fallback ?? defaultFallback);
      }
    },
    [defaultFallback],
  );

  return { handleBack };
}
