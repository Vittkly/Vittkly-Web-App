# Paquete Compartido (`@vittkly/shared`) 🧩

Paquete central del monorepo que contiene esquemas de validación con **Zod**, tipos de dominio, constantes y utilitarios puros compartidos entre la Central Web (`apps/web`) y la App Móvil (`apps/mobile`).

---

## 🎯 1. Regla de Oro: Pureza de Plataforma

> [!IMPORTANT]
> Este paquete es **100% agnóstico de plataforma**.
> - **Prohibido** importar dependencias como `react`, `react-native`, `next` o módulos específicos de Node.js (`fs`, `path`).
> - Todo código debe ser TypeScript puro y universal para garantizar que tanto **Metro Bundler** (móvil) como **Turbopack** (web) puedan compilarlo sin polyfills ni fricción.

---

## 📦 2. Contenido Exportado

### 🛡️ Esquemas de Validación (Zod)
- **`emailSchema`**: Valida correos electrónicos sanitizados y con formato RFC válido.
- **`passwordSchema`**: Exige mínimo 8 caracteres, al menos una mayúscula, un número y un carácter especial.
- **`pinSchema`**: Exige exactamente 4 dígitos numéricos (`^\d{4}$`) para el PIN de acceso rápido y bloqueo offline.
- **`internationalPhoneSchema`**: Valida números telefónicos en formato internacional E.164.

### 🏷️ Constantes y Tipos de Dominio
- **`VITTKLY_ROLES` / `VittklyRole`**: Roles de miembros de la plataforma (`'owner' | 'admin' | 'member'`).
- **`WORK_ORDER_STATUSES` / `WorkOrderStatusType`**: Estados estándar de ciclo de vida de órdenes de servicio en campo (`'programada' | 'en-ruta' | 'en-curso' | 'completada' | 'pagada' | 'pendiente' | 'atrasada' | 'por-vencer' | 'cancelada'`).

---

## 💻 3. Cómo Consumirlo en una Aplicación

En el `package.json` de tu aplicación o paquete:
```json
{
  "dependencies": {
    "@vittkly/shared": "workspace:*"
  }
}
```

En tus archivos de TypeScript:
```typescript
import { emailSchema, pinSchema, WORK_ORDER_STATUSES } from '@vittkly/shared';

const result = emailSchema.safeParse(userInput);
if (!result.success) {
  console.error(result.error.issues[0].message);
}
```
