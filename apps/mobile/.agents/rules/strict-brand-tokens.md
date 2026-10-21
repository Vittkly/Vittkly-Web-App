# Rule: Strict Brand Tokens (Cero Magic Numbers / Colors)

## Principio
Todos los estilos de la aplicación deben originarse obligatoria y exclusivamente en el sistema de diseño oficial de Vittkly, documentado en `docs/design-system/documentacion_sistema_diseno_vittkly.md` y formalizado en `@/theme` (`src/theme/tokens.ts`).

## Reglas Innegociables
1. **Cero Colores Hexadecimales Arbitrarios:**
   - Prohibido escribir strings literales `#...` o `rgb(...)` en hojas de estilo o componentes.
   - Usar `const { colors } = useTheme()` o `tokens.colors[theme]`.
2. **Ergonomía de Calle (Mínimo 48 px):**
   - Todo control interactivo (botones, inputs, pestañas, selects) debe tener una altura táctil mínima de **48 px** (`control.lg`).
   - Las teclas del `PinPad` deben medir exactamente **72 × 64 px**.
3. **Texto Base Móvil:**
   - En la app del técnico, el texto corrido base debe ser `typography.bodyLg` (**17 px** con interlineado de **26 px**).
4. **Verde Kleanly (`#3EC49B`):**
   - El verde Kleanly con check está **estrictamente reservado** para tareas terminadas (`completada`) o pagadas (`pagada`) y el logo.
   - NUNCA se usa como fondo de botón principal ni para texto sobre fondo blanco.
5. **Jerarquía de Acción:**
   - Una sola acción `primary` (`#157AA8` en claro / `#5BC0EA` en oscuro) por pantalla, en ancho completo (`block={true}`).
