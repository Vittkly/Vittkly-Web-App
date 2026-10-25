---
description: Reglas del Sistema de Diseño Oficial de Vittkly (Tokens Inmutables y Cero Colores Sueltos)
globs: ["**/*.tsx", "**/theme/**", "**/components/**"]
---

# Strict Brand Tokens & Design System

1. **Cero Colores HEX Sueltos:**
   - Prohibido escribir strings literales `#...` o clases utilitarias arbitrarias (`bg-blue-500`, `text-black`) en componentes o estilos.
   - En Web: Usar las clases semánticas de Tailwind (`bg-surface`, `bg-surface-raised`, `bg-primary`, `text-ink`, `border-line`).
   - En Mobile: Consumir `useTheme()` (`colors.surface`, `colors.primary`, `colors.ink`).
2. **Reserva Absoluta del Verde Kleanly (`#3EC49B`):**
   - El color verde Kleanly con check está **estrictamente reservado** para tareas `completada` o `pagada` y el isotipo institucional.
   - NUNCA se utiliza como relleno de botón estándar ni como texto sobre fondo blanco (ratio de contraste 2.2:1 insuficiente).
3. **Cifras Financieras y Códigos Técnicos:**
   - Montos en soles (`S/ 150.00`), códigos (`OT-0482`), RUC y cronómetros deben utilizar la clase `.tabular-nums` y fuentes monoespaciadas.
