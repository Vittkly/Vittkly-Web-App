# Regla de Arquitectura: Server Components vs Client Components

## Principio Fundamental

En Next.js App Router con React 19, **los componentes son Server Components (RSC) por defecto**.

## Directrices

1. Mantén los componentes en el servidor tanto como sea posible para reducir la carga de JavaScript en el cliente y acceder a datos de manera segura y directa con `createClient()` de servidor.
2. Agrega `'use client'` únicamente cuando el componente necesite:
   - Manejadores de eventos de usuario (`onClick`, `onChange`, `onSubmit`).
   - Hooks de estado o ciclo de vida (`useState`, `useEffect`, `useReducer`).
   - Hooks de navegación o del navegador (`useTheme`, `usePathname`, `useSearchParams`).
   - Suscripciones en tiempo real con Supabase Realtime.
3. Empuja `'use client'` hacia las hojas del árbol de componentes (hojas interactivas), envolviendo botones, toggles o modales específicos, mientras las páginas y layouts permanecen como Server Components.
