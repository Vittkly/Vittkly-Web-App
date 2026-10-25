---
name: supabase-repository-hook
description: Procedimiento para implementar flujos de datos completos con Tipos DB -> Repository/Service -> Custom Hook en Supabase.
---

# Supabase Repository & Custom Hook Skill

Esta skill define el estándar para agregar nuevas entidades, operaciones CRUD o consultas en Vittkly-App utilizando Supabase.

## Reglas Clave
1. **Separación de Capas:**
   - La base de datos se refleja en `src/types/database.types.ts`.
   - Las operaciones de red y consultas a tablas residen en `src/services/<entity>.service.ts` o `src/repositories/<entity>.repository.ts`.
   - La UI consume estos servicios a través de Custom Hooks (`src/hooks/use<Entity>.ts`).
2. **Prohibición de acceso directo:** Nunca importar `supabase` dentro de `src/app/**` o `src/components/**`.

## Flujo de Trabajo

### Paso 1: Tipos de Dominio
Extraer o definir las interfaces a partir de los tipos generados de Supabase:
```typescript
import { Database } from '@/types/database.types';

export type TaskRow = Database['public']['Tables']['tasks']['Row'];
export type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'];
```

### Paso 2: Repositorio / Servicio
Crear el archivo en `src/services/<entity>.service.ts`:
```typescript
import { supabase } from './supabase';
import { TaskRow, TaskInsert } from '@/types/task.types';

export const taskService = {
  async getAll(): Promise<TaskRow[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching tasks: ${error.message}`);
    }
    return data ?? [];
  },

  async create(task: TaskInsert): Promise<TaskRow> {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating task: ${error.message}`);
    }
    return data;
  },
};
```

### Paso 3: Custom Hook
Crear el hook en `src/hooks/use<Entity>.ts`:
```typescript
import { useState, useEffect, useCallback } from 'react';
import { taskService } from '@/services/task.service';
import { TaskRow } from '@/types/task.types';

export function useTasks() {
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskService.getAll();
      setTasks(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, loading, error, refetch: fetchTasks };
}
```

### Paso 4: Consumo en la Pantalla (`src/app/`)
```tsx
import { useTasks } from '@/hooks/useTasks';
// Renderizar lógica delegada sin tocar Supabase directamente
```
