---
name: vittkly-web-ui-builder
description: Guía paso a paso para construir interfaces web accesibles y responsivas en Vittkly SaaS Web usando los tokens oficiales, iconos y Tailwind CSS.
---

# Vittkly Web UI Builder

Esta habilidad guía la creación de interfaces web respetando estrictamente el sistema de diseño de Vittkly.

## Procedimiento

1. **Tokens:** Importar variables semánticas desde `globals.css` mediante las clases de Tailwind configuradas (`bg-surface`, `bg-surface-raised`, `text-ink`, `border-line`, etc.).
2. **Componentes Base:** Reutilizar componentes de `@/components/ui/` (`Button`, `StatusBadge`, `Card`, `TextField`, `ThemeToggle`).
3. **Iconografía:** Usar `VittklyIcon` de `@/components/icons/` para los 46 íconos oficiales o `lucide-react` para iconos de apoyo.
4. **Accesibilidad:** Mantener contraste WCAG AA (4.5:1), soporte para modo oscuro vía `data-theme="dark"` / `.dark`, y atributos `aria-label` en controles interactivos.
5. **Cifras:** Aplicar clase `.tabular-nums` y fuente `font-mono` en números y montos (`S/ 150.00`).
