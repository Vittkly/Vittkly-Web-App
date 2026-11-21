# Documentación del Ecosistema Vittkly

Este directorio centraliza la documentación arquitectónica, ADRs, especificaciones técnicas y guías de diseño del monorepo Vittkly.

## Estructura del Monorepo

- **`apps/web`**: Central Web (Next.js 16 + React 19 + Tailwind CSS v4 + Supabase SSR).
- **`apps/mobile`**: Aplicación móvil para técnicos de campo (Expo SDK 57 + React Native 0.86 + Expo Router + SQLite/SecureStore).
- **`packages/shared`**: Paquete compartido de esquemas de validación Zod, constantes y utilitarios agnósticos.
- **`packages/db-types`**: Tipos TypeScript generados desde Supabase Cloud (`database.types.ts`).
- **`packages/ui-tokens`**: Tokens de diseño inmutables (colores, fuentes, espaciados y logos oficiales).
- **`supabase/`**: Directorio de control de versiones y migraciones de Supabase Cloud (sa-east-1).

## Documentación por Dominio

- [Registro de Decisiones de Arquitectura (ADRs)](./architecture/adr/)
- [Ingeniería Inversa y Mapa de la Demo](./architecture/ingenieria-inversa-demo.md)
- [Base de Datos & Propuesta 010](./database/propuesta_010_operaciones_campo.md)
- [Diccionario de Datos Supabase](../supabase/supabase.md)
- [Sistema de Diseño Web](./design/sistema-diseno-web.md)
- [Sistema de Diseño Móvil](./design/sistema-diseno-mobile.md)
- [Auditoría de Seguridad RLS y Multi-Tenant](./security/auditoria_bd_supabase_rls.md)
- [Auditoría del Workspace (Fase 1)](./audit/WORKSPACE_AUDIT.md)
