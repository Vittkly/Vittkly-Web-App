# Vittkly SaaS Monorepo 🚀

Plataforma integral All-in-One para empresas de servicios, mantenimiento técnico y operaciones en campo en Perú y Latinoamérica.

---

## 🏛️ Arquitectura del Workspace

El monorepo está administrado con **pnpm Workspaces** y orquestado mediante **Turborepo**:

```text
vittkly-monorepo/
├── apps/
│   ├── web/             # @vittkly/web: Central Web Administrativa (Next.js 16 App Router, React 19, Tailwind CSS v4)
│   └── mobile/          # @vittkly/mobile: App Móvil para Técnicos de Campo (Expo SDK 57, React Native 0.86)
├── packages/
│   ├── db-types/        # @vittkly/db-types: Definición tipada TypeScript de Supabase Cloud
│   ├── shared/          # @vittkly/shared: Esquemas de validación Zod, constantes y utilitarios puros
│   └── ui-tokens/       # @vittkly/ui-tokens: Fuente única de verdad de tokens y diseño oficial
├── supabase/
│   ├── migrations/      # Migraciones SQL versionadas
│   ├── seed.sql         # Datos semilla y catálogos de prueba
│   └── supabase.md      # Diccionario de base de datos
├── docs/                # Documentación técnica, arquitectura, diseño y auditoría
├── .agents/             # Reglas, skills y hooks para desarrollo asistido por IA (Antigravity)
└── AGENTS.md            # Guía maestra y guardarraíles para agentes de IA
```

---

## ⚡ Requisitos Previos

- **Node.js:** `>= 22.0.0` (recomendado v24 según `.nvmrc`)
- **Gestor de paquetes:** `pnpm@12.10.1`

```bash
# Habilitar pnpm con corepack si es necesario
corepack enable
corepack prepare pnpm@12.10.1 --activate
```

---

## 🛠️ Comandos de Desarrollo

```bash
# Instalar dependencias en todo el monorepo
pnpm install

# Iniciar todas las aplicaciones en modo desarrollo
pnpm dev

# Iniciar únicamente la Central Web (http://localhost:3000)
pnpm dev:web

# Iniciar únicamente la App Móvil (Metro Bundler de Expo)
pnpm dev:mobile

# Verificación de calidad integral (lint + typecheck + test)
pnpm check

# Compilar todas las aplicaciones y paquetes
pnpm build

# Sincronizar tipos de Supabase hacia packages/db-types
pnpm sync:db-types
```

---

## 🔒 Seguridad y Multi-Tenant

- **Supabase Cloud (sa-east-1):** Aislamiento estricto por `empresa_id` con `FORCE ROW LEVEL SECURITY`.
- **Privilegios:** `SUPABASE_SERVICE_ROLE_KEY` se ejecuta estrictamente en el servidor web bajo `server-only`.
- **Offline First:** La aplicación móvil cuenta con autenticación segura por PIN (`expo-secure-store`), biometría y sesión local en `expo-sqlite`.

---

## 📚 Documentación Técnica

- [Informe de Auditoría Integral (Fase 1)](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/docs/audit/WORKSPACE_AUDIT.md)
- [Guía para Agentes de IA](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/AGENTS.md)
- [Índice de Documentación](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/docs/README.md)
