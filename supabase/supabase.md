## Table `planes`

Planes que vende Vittkly. Los precios se llenan cuando se definan.

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `codigo` | `text` |  Unique |
| `nombre` | `text` |  |
| `precio_mensual_centimos` | `int8` |  Nullable |
| `precio_anual_centimos` | `int8` |  Nullable |
| `moneda` | `text` |  |
| `usuarios_incluidos` | `int4` |  |
| `orden` | `int4` |  |
| `activo` | `bool` |  |
| `creado_en` | `timestamptz` |  |
| `creado_por` | `uuid` |  Nullable |
| `actualizado_en` | `timestamptz` |  |
| `actualizado_por` | `uuid` |  Nullable |

## Table `modulos`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `codigo` | `text` | Primary |
| `nombre` | `text` |  |
| `grupo` | `text` |  |
| `modelo` | `text` |  |
| `etapa` | `int4` |  |
| `disponible` | `bool` |  |
| `orden` | `int4` |  |
| `creado_en` | `timestamptz` |  |
| `creado_por` | `uuid` |  Nullable |
| `actualizado_en` | `timestamptz` |  |
| `actualizado_por` | `uuid` |  Nullable |

## Table `plan_modulos`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `plan_id` | `uuid` | Primary |
| `modulo_codigo` | `text` | Primary |
| `creado_en` | `timestamptz` |  |
| `creado_por` | `uuid` |  Nullable |

## Table `permisos`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `codigo` | `text` | Primary |
| `modulo_codigo` | `text` |  |
| `descripcion` | `text` |  |
| `con_alcance` | `bool` |  |
| `creado_en` | `timestamptz` |  |
| `creado_por` | `uuid` |  Nullable |
| `actualizado_en` | `timestamptz` |  |
| `actualizado_por` | `uuid` |  Nullable |

## Table `usuarios`

Una fila por persona, aunque trabaje en varias empresas. El id es el mismo de auth.users.

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `nombre` | `text` |  |
| `correo` | `text` |  Nullable |
| `celular` | `text` |  Nullable |
| `avatar_ruta` | `text` |  Nullable |
| `ultima_empresa_id` | `uuid` |  Nullable |
| `ultimo_ingreso_en` | `timestamptz` |  Nullable |
| `creado_en` | `timestamptz` |  |
| `actualizado_en` | `timestamptz` |  |
| `actualizado_por` | `uuid` |  Nullable |

## Table `cuentas`

Quien paga. Una cuenta tiene una suscripción y una o varias empresas.

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `nombre` | `text` |  |
| `propietario_id` | `uuid` |  |
| `correo_facturacion` | `text` |  Nullable |
| `creado_en` | `timestamptz` |  |
| `creado_por` | `uuid` |  Nullable |
| `actualizado_en` | `timestamptz` |  |
| `actualizado_por` | `uuid` |  Nullable |
| `eliminado_en` | `timestamptz` |  Nullable |

## Table `suscripciones`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `cuenta_id` | `uuid` |  Unique |
| `plan_id` | `uuid` |  |
| `estado` | `text` |  |
| `periodo` | `text` |  |
| `prueba_hasta` | `timestamptz` |  Nullable |
| `inicio_en` | `timestamptz` |  |
| `renueva_en` | `timestamptz` |  Nullable |
| `cancelada_en` | `timestamptz` |  Nullable |
| `creado_en` | `timestamptz` |  |
| `creado_por` | `uuid` |  Nullable |
| `actualizado_en` | `timestamptz` |  |
| `actualizado_por` | `uuid` |  Nullable |

## Table `empresas`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `cuenta_id` | `uuid` |  |
| `razon_social` | `text` |  |
| `nombre_comercial` | `text` |  Nullable |
| `ruc` | `text` |  Nullable |
| `direccion` | `text` |  Nullable |
| `logo_ruta` | `text` |  Nullable |
| `color_marca` | `text` |  Nullable |
| `modelo_operacion` | `text` |  |
| `zona_horaria` | `text` |  |
| `pais` | `text` |  |
| `moneda` | `text` |  |
| `activa` | `bool` |  |
| `creado_en` | `timestamptz` |  |
| `creado_por` | `uuid` |  Nullable |
| `actualizado_en` | `timestamptz` |  |
| `actualizado_por` | `uuid` |  Nullable |
| `eliminado_en` | `timestamptz` |  Nullable |

## Table `empresa_configuracion`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `empresa_id` | `uuid` | Primary |
| `menu_acordeon` | `bool` |  |
| `ajustes` | `jsonb` |  |
| `version` | `int4` |  |
| `creado_en` | `timestamptz` |  |
| `creado_por` | `uuid` |  Nullable |
| `actualizado_en` | `timestamptz` |  |
| `actualizado_por` | `uuid` |  Nullable |

## Table `perfiles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `empresa_id` | `uuid` |  Nullable |
| `codigo` | `text` |  Nullable |
| `nombre` | `text` |  |
| `descripcion` | `text` |  Nullable |
| `es_base` | `bool` |  |
| `creado_en` | `timestamptz` |  |
| `creado_por` | `uuid` |  Nullable |
| `actualizado_en` | `timestamptz` |  |
| `actualizado_por` | `uuid` |  Nullable |

## Table `perfil_permisos`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `perfil_id` | `uuid` | Primary |
| `permiso_codigo` | `text` | Primary |
| `alcance` | `text` |  Nullable |
| `creado_en` | `timestamptz` |  |
| `creado_por` | `uuid` |  Nullable |

## Table `membresias`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `empresa_id` | `uuid` |  |
| `usuario_id` | `uuid` |  |
| `perfil_id` | `uuid` |  |
| `es_propietario` | `bool` |  |
| `acceso_web` | `bool` |  |
| `activo` | `bool` |  |
| `invitado_por` | `uuid` |  Nullable |
| `creado_en` | `timestamptz` |  |
| `creado_por` | `uuid` |  Nullable |
| `actualizado_en` | `timestamptz` |  |
| `actualizado_por` | `uuid` |  Nullable |

