---
description: Reglas de arquitectura y fronteras de paquetes en el monorepo Turborepo + pnpm
globs: ["**/*"]
---

# Monorepo Boundaries & Package Management

1. **Gestor de Paquetes Exclusivo:** Se utiliza estrictamente `pnpm@12.10.1`. Prohibido correr comandos con `npm` o `yarn`.
2. **Aislamiento de Aplicaciones:** `apps/web` y `apps/mobile` jamás deben importarse entre sí ni referenciar sus directorios de forma relativa cruzada.
3. **Código Compartido:** Todo tipo, función, constante o esquema que se utilice en más de un workspace debe ubicarse en `packages/*` (`@vittkly/shared`, `@vittkly/db-types`, `@vittkly/ui-tokens`).
4. **Dependencias Internas:** Los paquetes internos se declaran siempre usando el protocolo de workspace: `"@vittkly/shared": "workspace:*"`.
5. **Verificación Previa a Commit:** Ejecutar siempre `pnpm check` (`lint`, `typecheck`, `test`) desde la raíz del monorepo antes de entregar cambios.
