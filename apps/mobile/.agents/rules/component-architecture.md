---
description: Arquitectura de componentes Container/Presentational y Compound Components en Vittkly
globs: ["src/components/**/*.tsx", "src/features/**/*.tsx", "src/modules/**/*.tsx"]
---

# Component Architecture: Container / Presentational & Compound Pattern

En Vittkly mantenemos una estricta separación de responsabilidades para garantizar la reutilización, testeabilidad y cumplimiento del sistema de diseño.

## 1. Separación Container (Smart) vs Presentational (Dumb)
- **Presentational (`src/components/ui/**`):**
  - Componentes visuales y sin estado de servidor.
  - Reciben props y emiten eventos (`onPress`, `onChange`).
  - Cero llamadas a servicios de red, APIs o hooks de datos.
  - Usan estrictamente tokens de `@/theme`.
  - Deben incluir siempre `testID` para testing con Jest y Maestro.
- **Container / Smart (`src/features/**` o `src/modules/**`):**
  - Orquestan la lógica de negocio consumiendo Custom Hooks (`useTasks`, `useAuth`).
  - Manejan estados de carga (`isLoading`), error (`error`) y éxito.
  - Renderizan componentes presentacionales inyectando las props necesarias.

## 2. Compound Components Pattern
Para componentes complejos con sub-partes jerárquicas (p. ej. `Card`, `Modal`, `BottomSheet`, `Dropdown`):
- Usar composición mediante React Context o componentes adjuntos (`Card.Header`, `Card.Body`, `Card.Footer`).
- No sobrecargar un único componente con decenas de props booleanas.
- Favorecer la legibilidad declarativa en JSX.
