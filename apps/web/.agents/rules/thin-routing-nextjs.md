# Regla de Arquitectura: Thin Routing en Next.js App Router

## Principio Fundamental

Las carpetas y archivos dentro de `src/app/` deben ser **delgados (thin)**. Su única responsabilidad es:

1. Orquestar el layout general y anidado.
2. Definir los metadatos de la página (`generateMetadata` o `export const metadata`).
3. Invocar Server Components o componentes de página provenientes de `src/features/`.
4. Capturar parámetros de ruta (`params`, `searchParams`) y pasarlos tipados a la feature correspondiente.

## Prohibiciones Estrictas

- **PROHIBIDO** escribir consultas directas a Supabase (`createClient().from(...)`) dentro de `src/app/**/page.tsx` o `layout.tsx`. Todo acceso debe pasar por `src/features/[feature]/services/`.
- **PROHIBIDO** incluir lógica de estado compleja, formularios extensos o mutaciones directas en `src/app/**`.
- **PROHIBIDO** declarar estilos o constantes de negocio hardcodeadas en las rutas.
