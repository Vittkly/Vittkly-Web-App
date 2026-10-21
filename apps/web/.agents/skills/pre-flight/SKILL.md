---
name: pre-flight
description: Protocolo de verificación obligatoria antes de confirmar cualquier tarea en la plataforma web de Vittkly (TypeScript, ESLint, Vitest, Build).
---

# Pre-Flight Checklist

Ejecutar siempre el comando consolidado:

```bash
npm run pre-flight
```

Equivalente a:

1. `npm run typecheck` (`tsc --noEmit`): 0 errores de TypeScript.
2. `npm run lint` (`eslint .`): 0 errores de linteo o importaciones prohibidas.
3. `npm run test` (`vitest run`): 100% de tests unitarios aprobados.
4. `npm run build`: Compilación exitosa en producción.
