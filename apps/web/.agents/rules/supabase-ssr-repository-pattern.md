# Regla de Arquitectura: Patrón Repositorio en Supabase SSR

## Principio Fundamental

Todo acceso a la base de datos de Supabase debe residir en clases o módulos de repositorio dentro de `src/features/[feature]/services/`.

## Prohibiciones Estrictas

- **PROHIBIDO** importar `@/lib/supabase/*` dentro de `src/app/**` (a excepción de callbacks de auth OAuth) o en `src/components/**`.
- **PROHIBIDO** ejecutar consultas SQL crudas o llamar a `.from()` directamente en componentes de React.
- **PROHIBIDO** realizar mutaciones en la base de datos sin antes validar los datos con esquemas Zod en un Server Action o servicio tipado.

## Estructura Mandatoria

```typescript
// ✅ CORRECTO: En src/features/work-orders/services/workOrderRepository.ts
import { createClient } from '@/lib/supabase/server';

export class WorkOrderRepository {
  static async listByOrg(orgId: string) {
    const supabase = await createClient();
    return supabase.from('work_orders').select('*').eq('org_id', orgId);
  }
}
```
