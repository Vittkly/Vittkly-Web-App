# Regla de Diseño: Tokens Estrictos e Inmutables de Vittkly

## Principio Fundamental

Todos los colores, espaciados, alturas táctiles, radios y tipografías deben apegarse al sistema de diseño oficial de Vittkly extraído de `tokens.json`.

## Reglas Innegociables

1. **Reserva del Verde Kleanly (`#3EC49B`):**
   - El color verde Kleanly con check está **exclusivamente reservado** para tareas completadas o cobradas y para el isotipo de la marca.
   - **NUNCA** usar `#3EC49B` como color de botón general ni como texto sobre blanco (contraste 2.2:1 insuficiente).
2. **Cero colores hexadecimales sueltos:**
   - Prohibido escribir `color: '#123456'` o usar clases arbitrarias como `bg-blue-500` o `bg-zinc-800`.
   - Utilizar las variables semánticas: `bg-surface`, `bg-surface-raised`, `bg-surface-sunken`, `bg-primary`, `text-ink`, `text-ink-muted`, `border-line`, `border-line-strong`.
3. **Números Tabulares en Cifras Financieras:**
   - Montos en soles (`S/ 150.00`), códigos (`OT-0482`), RUC y cronómetros deben usar la clase `.tabular-nums` y la fuente `font-mono` (JetBrains Mono).
