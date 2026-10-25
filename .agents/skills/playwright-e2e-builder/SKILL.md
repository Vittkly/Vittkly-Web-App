---
name: playwright-e2e-builder
description: Guía para escribir y ejecutar pruebas E2E en Playwright para flujos críticos de la plataforma web de Vittkly (Login, Canje VK-XXXX, Creación de OTs).
---

# Playwright E2E Builder

## Estructura de Tests

Los tests E2E deben ubicarse en `e2e/` o `tests/` y validar:

1. Flujo de inicio de sesión con correo y contraseña.
2. Flujo de canje de código de invitación `VK-XXXX-XXXX`.
3. Navegación en el panel administrativo y despacho de órdenes de trabajo.

## Comandos

```bash
npm run test:e2e
```
