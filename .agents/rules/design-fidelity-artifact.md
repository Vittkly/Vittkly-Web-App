---
description: Fidelidad estricta al artefacto del cliente. Prohíbe inventar pantallas, copys, métricas, datos o navegación que no existan en el diseño.
globs: ['apps/web/src/**/*.tsx', 'apps/mobile/**/*.tsx']
---

# Fidelidad al Artefacto del Cliente (Regla Maestra de Diseño)

## 1. Fuente de verdad (en orden de prioridad)

1. `Central de Servicios Vitta Kleanly/index.html` (artefacto web del cliente; `~/Descargas/`). Es la referencia de **navegación, copys, layout y comportamiento** de Web.
2. `vittkly-campo-app.html` (artefacto de la app de campo; `~/Documentos/`). Referencia de Mobile.
3. UI Kit (`Vittkly-UI-Kit/tokens`) → ya volcado en `apps/web/src/app/globals.css` y `packages/ui-tokens`. Referencia de **colores, tipografías, radios, sombras**.

Si algo no está en 1, 2 o 3: **no se dibuja**. Se pregunta al usuario.

## 2. Antes de tocar UI (obligatorio)

- Abrir el artefacto y localizar el elemento (`grep` del copy literal en el HTML). Citar el texto exacto, no parafrasear.
- Copiar copys, orden, íconos (Lucide equivalente) y jerarquía tal cual. Sin sinónimos, sin "mejorar" textos.
- Aplicar la skill `ui-ux-pro-max` solo para **accesibilidad, contraste, responsive y pulido** del elemento existente; **nunca** para añadir secciones nuevas.

## 3. Inventario cerrado de pantallas Web

| Zona            | Rutas permitidas                                                                                                                   |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Acceso          | `/login` (Iniciar sesión / Crear cuenta), `/register`, `/olvide-contrasena`, `/restablecer-contrasena`, `/invitado`, `/select-org` |
| Shell           | Sidebar + header + `WebMobileTabBar` (< lg)                                                                                        |
| Módulos         | Los del menú del artefacto (ver §4)                                                                                                |
| Configuraciones | Subnavegación del artefacto; solo **Usuarios y perfiles** tiene contenido                                                          |

Cualquier ruta nueva requiere que exista en el artefacto.

## 4. Navegación (sidebar) — cerrada

Inicio · Calendario · **Ventas** (Clientes, Cotizaciones, Contratos*) · **Operación** (Inventario, Trabajos, Ocurrencias*, Tiempo, Calidad*, Post venta) · **Finanzas** (Cobranzas, Comprobantes, Liquidaciones, Valorizaciones*, Caja y bancos, Rentabilidad) · **Equipo** (Personal*, Pagos al personal, Biblioteca y Academia) · **Crecimiento** (Marketing, Sitio web y reservas) · Reportes · Configuraciones. (*) = badge "Pronto" tal como en el artefacto.

Header: saludo + fecha, Ayuda, Avisos (campana), Comunidad, Configuraciones, **+ Nueva cotización**. Footer del sidebar: Empresa activa ⇄, "Con tecnología Vittkly".

## 5. Páginas "cascarón" (módulos sin implementar)

- Solo: breadcrumb + (título/código en `DashboardHeader`) + **una** tarjeta `bg-surface-raised border-line` con _"Módulo en preparación • Próximamente disponible"_.
- El título y el código se muestran **una sola vez** (en el header). Usar `ModulePlaceholderCanvas` con `hideTitle`.

## 6. Prohibiciones (causas reales de divagación)

NO hacer, bajo ninguna circunstancia, salvo que el artefacto lo muestre:

1. **Datos inventados**: avisos, notificaciones, contadores (`3`, `5`), montos, códigos `OT-/COT-`, nombres de clientes/distritos, métricas ("99.4%", "39 módulos", "TLS 1.3", "Zero-Trust", "Uptime"), testimonios o claims de seguridad.
2. **Copys inventados**: títulos como "Panel Principal", "Todo en orden", "Cascarón completado", descripciones de módulos, banners de "fase siguiente". Un contador/badge se oculta si no hay dato real.
3. **Elementos decorativos nuevos**: hero alternativos, bentos, gradientes, orbs, íconos o tarjetas extra en login/registro. El login es el del artefacto (tarjeta de 400 px + showcase "Así trabaja Vittkly").
4. **Acciones simuladas**: `alert()`, toasts de "se activará en la fase…", botones que no navegan ni ejecutan lógica real. Un botón sin función se elimina o enlaza a su ruta real.
5. **Estado local que finge persistencia** (suspender, reenviar invitación, etc.) sin Server Action + repositorio real.
6. **Verde Kleanly** como éxito genérico/decoración (solo `completada`/`pagada` + isotipo).
7. **Hex, `bg-blue-500`, `px` arbitrarios** en componentes. Excepciones sancionadas: logos de marca de terceros (Google/Microsoft/WhatsApp) y la ilustración ficticia del showcase de login (ventana mock del artefacto).
8. **Duplicar** título/código/breadcrumb en una misma pantalla.
9. Cambiar tipografías: solo **Manrope** (UI) y **JetBrains Mono** (códigos, cifras, `.tabular-nums`).
10. Añadir módulos, pestañas o filtros que no estén en el artefacto "por completitud".

## 7. Definición de terminado para cambios de UI

- [ ] Cada texto visible existe literalmente en el artefacto o es estado real (error/vacío/carga).
- [ ] Ningún dato mostrado es mock; sin dato real → estado vacío sobrio.
- [ ] 0 hex nuevos; tokens semánticos.
- [ ] Verificado en ≥1280 px y < 768 px (sidebar oculto + `WebMobileTabBar`).
- [ ] `pnpm check` en verde.
- [ ] Ante duda: **preguntar**, no inventar.
