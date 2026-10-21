# Documentación del Ecosistema Vittkly

Este directorio centraliza la documentación arquitectónica, ADRs y especificaciones técnicas del monorepo Vittkly.

## Estructura del Monorepo

- **`apps/web`**: Central Web (Next.js 16 + React 19 + Tailwind CSS v4 + Supabase SSR).
- **`apps/mobile`**: Aplicación móvil para técnicos de campo (Expo SDK 57 + React Native 0.86 + Expo Router + SQLite/SecureStore).
- **`packages/shared`**: Paquete compartido de esquemas de validación Zod, constantes y utilitarios agnósticos.
- **`packages/db-types`**: Tipos TypeScript generados desde Supabase Cloud (`database.types.ts`).
- **`supabase/`**: Directorio de control de versiones y migraciones de Supabase Cloud (sa-east-1).

## Documentación por Dominio

- [ADRs Web](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/web/docs/adr/)
- [ADRs Mobile](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/mobile/docs/adr/)
- [Base de Datos & Propuesta 010](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/web/docs/database/propuesta_010_operaciones_campo.md)
- [Sistema de Diseño Vittkly](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/web/docs/design-system/documentacion_sistema_diseno_vittkly.md)
- [Auditoría RLS y Seguridad](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/web/docs/security/auditoria_bd_supabase_rls.md)
