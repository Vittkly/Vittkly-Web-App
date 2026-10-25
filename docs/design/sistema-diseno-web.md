# Documentación del Sistema de Diseño Vittkly (Plataforma Web SaaS)

Este documento detalla la implementación web del sistema de diseño de **Vittkly**, sus principios rectores, tokens inmutables y reglas de accesibilidad.

---

## 1. Reglas Inmutables de Marca

1. **Uso estricto del Verde Kleanly (`#3EC49B`):**
   - El verde Kleanly con check queda estrictamente reservado para tareas terminadas (`completada`) o pagadas (`pagada`) y el isotipo de la marca.
   - NUNCA se utiliza como relleno de botón estándar ni como texto sobre fondo blanco (ratio 2.2:1 insuficiente).
2. **Una sola acción `primary` por pantalla:**
   - Para guiar al despachador o administrador hacia el objetivo central de la pantalla.
3. **Tipografía oficial:**
   - `Manrope` (pesos 400 a 800) para toda la interfaz.
   - `JetBrains Mono` con `tabular-nums` para montos, códigos `OT-XXXX` y cronómetros.

---

## 2. Tokens de Color Semánticos

| Token Semántico | Modo Claro (`light`)       | Modo Oscuro (`dark`) | Uso Canónico                               |
| :-------------- | :------------------------- | :------------------- | :----------------------------------------- |
| `surface`       | `#F3F8FA` (Niebla)         | `#0A1C27`            | Fondo principal de la página               |
| `surfaceRaised` | `#FFFFFF`                  | `#10283A`            | Tarjetas, tablas, modales y campos         |
| `surfaceSunken` | `#EAF2F6`                  | `#081620`            | Fondos de filtros y barras laterales       |
| `line`          | `#DDE7EC`                  | `#1F3B4E`            | Separadores decorativos                    |
| `lineStrong`    | `#778B97`                  | `#6A8CA1`            | Bordes de inputs y controles (ratio ≥ 3:1) |
| `ink`           | `#0E2A3B` (Tinta)          | `#E7F1F6`            | Texto principal de alto contraste          |
| `inkMuted`      | `#52626D` (Pizarra)        | `#9DB2BE`            | Texto secundario y metadatos               |
| `primary`       | `#157AA8` (Vitta Profundo) | `#5BC0EA`            | Botón de acción principal                  |
| `success`       | `#3EC49B` (Verde Kleanly)  | `#3EC49B`            | Estado completado/pagado con check         |
| `warning`       | `#F2A93B` (Ámbar)          | `#F2A93B`            | Alertas, órdenes por vencer o atrasadas    |
| `danger`        | `#B3322C`                  | `#F08A84`            | Botón destructivo y errores de validación  |
