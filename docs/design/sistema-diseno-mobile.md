# Documentación Técnica del Sistema de Diseño y UI Kit Nativo

**Aplicación Móvil del Técnico y Supervisor — Vittkly (React Native + Expo SDK 57)**

---

## 1. Control Documental

- **Proyecto:** VittklyApp (Aplicación móvil de operaciones en campo para técnicos y supervisores)
- **Stack Tecnológico:** React Native `0.86.3`, Expo SDK `~57.0.28`, Expo Router `~57.0.26`, TypeScript `~6.0.3`, `lucide-react-native`, `react-native-svg`
- **Fuentes de Diseño Oficiales:**
  - `Vittkly-Brand/` (Manual de Marca, tipografías TTF `Manrope`, íconos de tiendas, logos SVG/PNG y paleta oficial)
  - `Vittkly-UI-Kit/vittkly-ui-kit/` (`tokens/tokens.json`, `components/COMPONENTES.md`, `components/index.d.ts`, `guidelines/`)
- **Estado:** Implementado y validado con TypeScript (`npx tsc --noEmit` sin errores)

---

## 2. Reglas de Oro del Sistema de Diseño (Innegociables)

1. **Fuente Única de Verdad (`tokens.json`):**
   Ningún componente ni pantalla define colores HEX, espaciados, alturas táctiles o radios de borde de forma arbitraria. Todos los valores provienen de `src/theme/tokens.ts` y se consumen mediante el hook reactivo `useTheme()`.
2. **Ergonomía de Calle (`control-lg` y `body-lg`):**
   La aplicación del técnico se opera en exteriores, bajo luz solar directa, con una sola mano o con guantes:
   - Altura táctil mínima obligatoria en controles interactivos (botones, casillas, pestañas): **48 px** (`control.lg`).
   - Teclas del `PinPad`: **72 × 64 px** (`radius.lg` = 14 px).
   - Tamaño de texto base para lectura en campo: **17 px** con interlineado de **26 px** (`typography.bodyLg`).
3. **Semántica Estricta del Verde Kleanly (`#3EC49B`):**
   El verde Kleanly con check está **exclusivamente reservado** para tareas terminadas (`completada` con ícono `Check`) o cobradas (`pagada` con ícono `Banknote`) y el isotipo de la marca. **Nunca** se utiliza como relleno de botón principal ni como texto sobre fondo blanco (contraste 2.2:1 insuficiente).
4. **Jerarquía de Acción (`primary` único):**
   Cada pantalla presenta **una sola acción `primary`** (`#157AA8` en claro / `#5BC0EA` en oscuro) en ancho completo (`block={true}`) y tamaño `lg` (48 px) al alcance del pulgar.

---

## 3. Arquitectura y Estructura de Archivos Implementados

```text
Vittkly-App/
├── app.json                                  # Configuración nativa: icon, adaptiveIcon y splash (#F3F8FA)
├── assets/
│   ├── fonts/                                # 5 pesos TrueType de Manrope
│   │   ├── Manrope-Regular.ttf               # 400
│   │   ├── Manrope-Medium.ttf                # 500
│   │   ├── Manrope-SemiBold.ttf              # 600
│   │   ├── Manrope-Bold.ttf                  # 700
│   │   └── Manrope-ExtraBold.ttf             # 800
│   ├── images/
│   │   ├── icon.png                          # Ícono universal iOS/App Store (1024×1024)
│   │   ├── adaptive-icon.png                 # Ícono adaptativo Android/Google Play (512×512)
│   │   ├── favicon.png                       # Favicon web (48×48)
│   │   └── logos-png/                        # Logos y monogramas rasterizados (256px, 512px, 600px, 1024px, 1200px)
│   └── logos/                                # Vectores oficiales limpios en SVG
│       ├── vittkly-wordmark.svg
│       ├── vittkly-wordmark-white.svg
│       ├── vittkly-wordmark-tinta.svg
│       ├── vittkly-monograma.svg
│       └── vittkly-monograma-white.svg
└── src/
    ├── app/
    │   ├── _layout.tsx                       # Carga de fuentes con expo-font + SplashScreen.preventAutoHideAsync()
    │   └── index.tsx                         # Pantalla principal del técnico con catálogo interactivo
    ├── assets/
    │   └── index.ts                          # Índice centralizado y tipado de fuentes, íconos y logos
    ├── theme/
    │   ├── tokens.ts                         # Tokens literales de color (light/dark), tipografía, espacio, radio y control
    │   └── useTheme.ts                       # Hook reactivo con useColorScheme()
    └── components/
        ├── index.ts                          # Barril de exportación de componentes nativos
        ├── Button.tsx                        # Botón nativo (primary, secondary, ghost, danger, tenant, option)
        ├── StatusBadge.tsx                   # Etiqueta de estado con palabra + ícono Lucide obligatorio
        ├── WorkOrderCard.tsx                 # Tarjeta de orden de trabajo (OT)
        ├── ConnectionBanner.tsx              # Franja ámbar offline y chip de sincronización
        ├── MobileTabBar.tsx                  # Barra inferior de 48px mín. con íconos de 24px (Hoy, Agenda, Órdenes, Perfil)
        ├── OtpInput.tsx                      # Entrada OTP de 6 casillas con auto-avance y autocompletado SMS
        ├── PinPad.tsx                        # Teclado PIN numérico offline con teclas de 72×64px
        └── Logo.tsx                          # Componente vectorial SVG nativo (wordmark y monograma)
```

---

## 4. Configuración de Fuentes y Splash Screen Nativo

### 4.1. Carga de Fuentes en `src/app/_layout.tsx`

Android no sintetiza pesos tipográficos (`fontWeight`) sobre fuentes personalizadas si no se registra cada archivo TTF con su nombre explícito. Por ello:

1. Se invoca `SplashScreen.preventAutoHideAsync()` en el ámbito global del módulo.
2. Se cargan los 5 archivos TrueType mediante `useFonts(fontAssets)` desde `src/assets/index.ts`.
3. Una vez que `loaded || error` se cumple, un `useEffect` ejecuta `SplashScreen.hideAsync()`.

### 4.2. Configuración en `app.json`

El Splash Screen y los íconos adaptativos usan el color oficial de superficie clara (`#F3F8FA` — Niebla):

```json
{
  "expo": {
    "icon": "./assets/images/icon.png",
    "splash": {
      "image": "./assets/images/icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#F3F8FA"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#F3F8FA"
      }
    }
  }
}
```

---

## 5. Sistema de Tokens (`src/theme/tokens.ts`)

### 5.1. Paleta de Colores (`colors.light` y `colors.dark`)

| Token           | Modo Claro (`light`) | Modo Oscuro (`dark`) | Uso en el Sistema                                                                 |
| :-------------- | :------------------- | :------------------- | :-------------------------------------------------------------------------------- |
| `surface`       | `#F3F8FA`            | `#0A1C27`            | Fondo general de pantalla (Niebla en claro, Tinta profunda en oscuro)             |
| `surfaceRaised` | `#FFFFFF`            | `#10283A`            | Tarjetas (`WorkOrderCard`), modales, hojas inferiores y campos de formulario      |
| `surfaceSunken` | `#EAF2F6`            | `#081620`            | Zonas hundidas, teclas del `PinPad`, badges neutros                               |
| `line`          | `#DDE7EC`            | `#1F3B4E`            | Bordes decorativos de tarjetas y divisores                                        |
| `lineStrong`    | `#778B97`            | `#6A8CA1`            | Bordes de inputs, casillas `OtpInput` y botones secundarios (contraste $\ge$ 3:1) |
| `ink`           | `#0E2A3B`            | `#E7F1F6`            | Texto principal (Tinta)                                                           |
| `inkMuted`      | `#52626D`            | `#9DB2BE`            | Texto secundario, metadatos, íconos en reposo (Pizarra)                           |
| `vitta`         | `#2AA8DE`            | `#2AA8DE`            | Azul Vitta de marca (exclusivo logo y borde `option`)                             |
| `kleanly`       | `#3EC49B`            | `#3EC49B`            | Verde Kleanly de marca (exclusivo logo y check completado)                        |
| `primary`       | `#157AA8`            | `#5BC0EA`            | Fondo del botón `primary`, controles activos                                      |
| `primaryHover`  | `#0F6A93`            | `#7FCFF0`            | Estado presionado (`pressed`) del botón `primary`                                 |
| `onPrimary`     | `#FFFFFF`            | `#0A1C27`            | Texto e íconos sobre fondo `primary`                                              |
| `primaryInk`    | `#106C97`            | `#5BC0EA`            | Enlaces, pestaña activa en `MobileTabBar`, texto sobre `primarySoft`              |
| `primarySoft`   | `#E3F4FB`            | `#0F3347`            | Fondo de `StatusBadge` informativo (`programada`, `en-ruta`, `en-curso`)          |
| `success`       | `#3EC49B`            | `#3EC49B`            | Relleno de indicador de tarea completada                                          |
| `onSuccess`     | `#0E2A3B`            | `#0A1C27`            | Ícono sobre relleno `success`                                                     |
| `successInk`    | `#146F55`            | `#4FD1A9`            | Texto e ícono de éxito (`Completada`, `Pagada`)                                   |
| `successSoft`   | `#E2F6EF`            | `#0E3A2E`            | Fondo de etiqueta `completada` y `pagada`                                         |
| `warning`       | `#F2A93B`            | `#F2A93B`            | Relleno ámbar de advertencia                                                      |
| `onWarning`     | `#0E2A3B`            | `#0A1C27`            | Texto sobre relleno `warning`                                                     |
| `warningInk`    | `#8A5A0B`            | `#F2B45A`            | Texto e ícono sobre `warningSoft` (`ConnectionBanner`, `atrasada`, `por-vencer`)  |
| `warningSoft`   | `#FDF1DC`            | `#3D2A0B`            | Fondo ámbar de `ConnectionBanner` y etiquetas de alerta                           |
| `danger`        | `#B3322C`            | `#F08A84`            | Fondo de botón destructivo (`danger`)                                             |
| `onDanger`      | `#FFFFFF`            | `#0A1C27`            | Texto sobre botón `danger`                                                        |
| `dangerInk`     | `#B3322C`            | `#F08A84`            | Texto/borde de error en formularios (`OtpInput`, `PinPad`, `cancelada`)           |
| `dangerSoft`    | `#FDE8E7`            | `#3F1614`            | Fondo de error en casillas `OtpInput` y etiqueta `cancelada`                      |
| `focus`         | `#157AA8`            | `#5BC0EA`            | Contorno de foco activo (2 px)                                                    |

### 5.2. Escalas de Espaciado, Radios y Alturas de Control

- **`spacing`**:
  - `space1`: `4` (separación ícono-texto dentro de badges)
  - `space2`: `8` (separación entre elementos contiguos)
  - `space3`: `12` (espaciado interno compacto)
  - `space4`: `16` (padding de tarjetas y margen lateral mínimo en móvil)
  - `space6`: `24` (separación entre bloques de pantalla y padding horizontal de botón `lg`)
  - `space8`: `32` (separación entre secciones)
  - `space12`: `48` (aire alrededor de cabeceras y estados vacíos)
- **`radius`**:
  - `sm`: `6`, `md`: `10` (botones, inputs, casillas OTP), `lg`: `14` (tarjetas, teclas `PinPad`), `xl`: `24` (hojas inferiores), `pill`: `999` (`StatusBadge`, puntos de PIN).
- **`control`**:
  - `sm`: `32`, `md`: `40`, `lg`: `48` (altura táctil mínima en la app móvil).

### 5.3. Escala Tipográfica (`typography`)

| Estilo       | Fuente (`fontFamily`) | Tamaño (`fontSize`) | Interlineado (`lineHeight`) | Peso (`fontWeight`) | Uso Principal                                         |
| :----------- | :-------------------- | :------------------ | :-------------------------- | :------------------ | :---------------------------------------------------- |
| `display`    | `Manrope-ExtraBold`   | `32`                | `40`                        | `800`               | Saludo principal del dashboard (una vez por pantalla) |
| `title1`     | `Manrope-ExtraBold`   | `24`                | `32`                        | `800`               | Título de pantalla                                    |
| `title2`     | `Manrope-Bold`        | `20`                | `28`                        | `700`               | Título de sección o modal                             |
| `title3`     | `Manrope-Bold`        | `16`                | `24`                        | `700`               | Título de `WorkOrderCard`                             |
| `body`       | `Manrope-Regular`     | `15`                | `24`                        | `400`               | Texto corrido general                                 |
| `bodyLg`     | `Manrope-Regular`     | `17`                | `26`                        | `400`               | **Texto base de la app móvil del técnico**            |
| `bodyStrong` | `Manrope-SemiBold`    | `15`                | `24`                        | `600`               | Énfasis dentro de texto                               |
| `small`      | `Manrope-Regular`     | `13`                | `20`                        | `400`               | Metadatos (`address`, `time`, `technician`) y ayudas  |
| `label`      | `Manrope-SemiBold`    | `12`                | `16`                        | `600`               | Rótulos en mayúsculas (`letterSpacing: 0.72`)         |
| `button`     | `Manrope-Bold`        | `15`                | `20`                        | `700`               | Etiquetas de botones                                  |
| `code`       | `Menlo` / `monospace` | `13`                | `20`                        | `400`               | Códigos de orden (`OT-0482`)                          |

---

## 6. Hook de Tema (`src/theme/useTheme.ts`)

Detecta automáticamente la preferencia del sistema operativo del dispositivo (`light` o `dark`) mediante `useColorScheme()` de `react-native`:

```tsx
import { useTheme } from '@/theme/useTheme';

function MiComponente() {
  const { colors, spacing, radius, control, typography, isDark } = useTheme();
  // ...
}
```

---

## 7. Catálogo de Componentes Nativos (`src/components/`)

### 7.1. `Button` (`src/components/Button.tsx`)

Botón de acción con altura táctil por defecto `size="lg"` (**48 px**).

- **Props principales:**
  - `variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'tenant' | 'option'` (por defecto `'primary'`)
  - `accent?: 'vitta' | 'kleanly' | 'tinta'` (solo cuando `variant="option"`)
  - `size?: 'sm' | 'md' | 'lg'` (por defecto `'lg'` = 48 px)
  - `block?: boolean` (ancho 100%)
  - `icon?: 'plus' | 'check' | 'calendar' | 'pin' | 'user' | 'list' | 'x' | 'grid' | 'forward' | 'back' | 'mail' | 'users'`
  - `disabled?: boolean`
  - `onPress?: () => void`
- **Ejemplo:**
  ```tsx
  <Button variant="primary" size="lg" block icon="forward" onPress={handleStart}>
    Iniciar visita en ruta
  </Button>
  ```

### 7.2. `StatusBadge` (`src/components/StatusBadge.tsx`)

Etiqueta semántica de estado. Incluye **obligatoriamente palabra + ícono Lucide** (`strokeWidth={2}`, 14 px).

- **Estados soportados (`WorkOrderStatus`):**
  - `programada` $\rightarrow$ Texto `"Programada"`, ícono `Clock`, tono `info` (`primarySoft` / `primaryInk`)
  - `en-ruta` $\rightarrow$ Texto `"En ruta"`, ícono `MapPin`, tono `info`
  - `en-curso` $\rightarrow$ Texto `"En curso"`, ícono `Clock`, tono `info`
  - `completada` $\rightarrow$ Texto `"Completada"`, ícono `Check` (exclusivo), tono `success` (`successSoft` / `successInk`)
  - `pagada` $\rightarrow$ Texto `"Pagada"`, ícono `Banknote` (billete), tono `success`
  - `pendiente` $\rightarrow$ Texto `"Pendiente"`, ícono `Clock`, tono `neutral` (`surfaceSunken` / `inkMuted`)
  - `atrasada` $\rightarrow$ Texto `"Atrasada"`, ícono `TriangleAlert`, tono `warning` (`warningSoft` / `warningInk`)
  - `por-vencer` $\rightarrow$ Texto `"Por vencer"`, ícono `TriangleAlert`, tono `warning`
  - `cancelada` $\rightarrow$ Texto `"Cancelada"`, ícono `X`, tono `danger` (`dangerSoft` / `dangerInk`)

### 7.3. `WorkOrderCard` (`src/components/WorkOrderCard.tsx`)

Tarjeta de orden de trabajo a ancho completo (`100%`), borde `line` de 1 px y radio `lg` (14 px).

- **Props:** `code`, `title`, `status`, `address?`, `time?`, `technician?`, `amount?`, `onPress?`.
- Renderiza `code` en fuente monoespaciada, `StatusBadge` en la esquina superior derecha, metadatos con íconos Lucide de 16 px (`MapPin`, `Clock`, `User`) y `amount` con números tabulares (`fontVariant: ['tabular-nums']`).

### 7.4. `ConnectionBanner` (`src/components/ConnectionBanner.tsx`)

Aviso de estado de red en campo (nunca usa color rojo, ya que trabajar sin señal es parte normal de la operación en calle):

- `status="offline"`: Franja ámbar (`warningSoft` / `warningInk`) a todo el ancho con ícono `WifiOff` y texto `"Sin conexión · tus cambios se guardan en el teléfono"`.
- `status="syncing"`: Chip en píldora (`radius.pill`) con ícono `RefreshCw` indicando `"${pending} cambios por enviar"`.

### 7.5. `MobileTabBar` (`src/components/MobileTabBar.tsx`)

Barra de navegación inferior adaptada a `SafeAreaInsets`:

- Cada pestaña garantiza `minHeight: 48` (`control.lg`).
- Íconos Lucide de **24 px** con etiqueta siempre visible (`12 px` `Manrope-SemiBold`).
- Pestañas por defecto (`DEFAULT_TECHNICIAN_TABS`): **Hoy** (`Home`), **Agenda** (`Calendar`), **Órdenes** (`ClipboardList`), **Perfil** (`User`).

### 7.6. `OtpInput` (`src/components/OtpInput.tsx`)

Entrada de código de verificación de 6 dígitos (WhatsApp / SMS):

- 6 casillas de `46 × 56 px` (`radius.md` = 10 px).
- Autocompletado del sistema habilitado en la primera casilla (`textContentType="oneTimeCode"`, `autoComplete="sms-otp"`), soporte para pegado de código completo, avance automático de foco al digitar y retroceso con `Backspace`.
- Estado `error={true}` pinta bordes en `dangerInk` y fondo en `dangerSoft`.

### 7.7. `PinPad` (`src/components/PinPad.tsx`)

Teclado numérico propio para ingreso rápido con PIN de 4 dígitos sin conexión:

- 4 puntos indicadores superiores (`16 × 16 px`) que se rellenan en `ink` al digitar y vibran/cambian a `dangerInk` si `error={true}`.
- Grilla 3×4 con teclas de **72 × 64 px** (`radius.lg` = 14 px, fondo `surfaceSunken`) diseñadas para uso con el pulgar y con guantes.

### 7.8. `Logo` (`src/components/Logo.tsx`)

Renderizador vectorial nativo con `react-native-svg` del wordmark oficial y del monograma `v!k`:

- **Props:** `variant?: 'wordmark' | 'monogram'`, `tone?: 'color' | 'white' | 'tinta'`, `height?: number`.
- Respeta las alturas mínimas del manual (`24 px` para wordmark, `16 px` para monograma) y aplica máscara de recorte en el check cuando el tono es monocromo (`white` o `tinta`).

---

## 8. Comandos de Validación

```bash
# Verificar tipos de TypeScript en todo el proyecto
npx tsc --noEmit

# Iniciar el servidor de desarrollo de Expo
npx expo start

# Instalar nuevas dependencias compatibles con el SDK 57 de Expo
npx expo install <paquete>
```
