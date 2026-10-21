# Rule: Thin Routing en Expo Router (`src/app/`)

## Principio
Las pantallas dentro de `src/app/` deben ser "Thin Routes" (rutas delgadas). Su única responsabilidad es:
1. Orquestar la navegación y los parámetros de ruta (`useLocalSearchParams`).
2. Configurar la cabecera / layout de la pantalla (`Stack.Screen`, títulos, opciones).
3. Montar el contenedor o feature correspondiente (`src/features/*` o componentes principales).

## Prohibiciones Estrictas
- **PROHIBIDO** realizar llamadas directas a APIs o al cliente `@/services/supabase` en archivos de `src/app/`.
- **PROHIBIDO** escribir lógica de negocio compleja, validaciones pesadas o cálculos de transformación en rutas de `src/app/`.
- **PROHIBIDO** manejar estado de servidor (fetching, caching, mutations) directamente en las rutas sin pasar por un Custom Hook o Repositorio.

## Ejemplo de Ruta Correcta
```tsx
import { useLocalSearchParams } from 'expo-router';
import { WorkOrderDetailContainer } from '@/features/work-orders/containers/WorkOrderDetailContainer';

export default function WorkOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <WorkOrderDetailContainer orderId={id} />;
}
```
