import { z } from 'zod';

export const OPERATION_MODELS = ['visita', 'contrato', 'ambos'] as const;
export type OperationModelCode = (typeof OPERATION_MODELS)[number];

export interface OperationModelOption {
  code: OperationModelCode;
  label: 'Por visita' | 'Por contrato' | 'Ambos';
  description: string;
}

export const OPERATION_MODEL_OPTIONS: readonly OperationModelOption[] = [
  {
    code: 'visita',
    label: 'Por visita',
    description:
      'Cobras por cada trabajo puntual (fumigación única, limpieza de mudanza, mantenimiento a pedido).',
  },
  {
    code: 'contrato',
    label: 'Por contrato',
    description:
      'Cobras una mensualidad por un cronograma de visitas fijas (oficinas, condominios, plantas).',
  },
  {
    code: 'ambos',
    label: 'Ambos',
    description:
      'Tienes clientes puntuales y también clientes con contrato mensual. Muestra las dos formas en la plataforma.',
  },
] as const;

export const BRAND_COLOR_PRESETS = ['#2AA8DE', '#157AA8', '#3EC49B', '#0E2A3B', '#F2A93B'] as const;

const SUNAT_RUC_PREFIXES = new Set(['10', '15', '17', '20']);
const SUNAT_RUC_WEIGHTS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2] as const;

/**
 * Sanitiza en tiempo real la entrada de RUC permitiendo únicamente hasta 11 dígitos numéricos.
 */
export function sanitizeRucInput(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 11);
}

/**
 * Valida un número de RUC peruano de 11 dígitos bajo el algoritmo Módulo 11 de SUNAT.
 * Prefijos válidos: 10, 15, 17, 20.
 * Pesos: [5, 4, 3, 2, 7, 6, 5, 4, 3, 2].
 */
export function isValidSunatRuc(raw: string): boolean {
  const clean = raw.trim();
  if (!/^\d{11}$/.test(clean)) {
    return false;
  }

  const prefix = clean.slice(0, 2);
  if (!SUNAT_RUC_PREFIXES.has(prefix)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 10; i += 1) {
    sum += Number(clean[i]) * SUNAT_RUC_WEIGHTS[i];
  }

  const remainder = 11 - (sum % 11);
  const checkDigit = remainder === 10 ? 0 : remainder === 11 ? 1 : remainder;

  return checkDigit === Number(clean[10]);
}

/**
 * Valida el RUC de forma condicional:
 * - Si está vacío ("", null, undefined), es válido (permite guardar empresas recién creadas sin RUC).
 * - Si contiene caracteres, exige exactamente 11 dígitos numéricos y dígito verificador SUNAT Módulo 11.
 */
export function validateOptionalRuc(raw?: string | null): {
  valid: boolean;
  normalized: string | null;
  error?: string;
} {
  const trimmed = (raw ?? '').trim();
  if (trimmed.length === 0) {
    return { valid: true, normalized: null };
  }

  if (!/^\d{11}$/.test(trimmed)) {
    return {
      valid: false,
      normalized: trimmed,
      error: 'El RUC debe contener exactamente 11 dígitos numéricos.',
    };
  }

  if (!isValidSunatRuc(trimmed)) {
    return {
      valid: false,
      normalized: trimmed,
      error:
        'El RUC ingresado no es válido según SUNAT (prefijo 10, 15, 17 o 20 y dígito verificador Módulo 11).',
    };
  }

  return { valid: true, normalized: trimmed };
}

export const optionalSunatRucSchema = z
  .string()
  .trim()
  .optional()
  .nullable()
  .superRefine((val, ctx) => {
    const check = validateOptionalRuc(val);
    if (!check.valid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: check.error || 'El RUC ingresado no es válido.',
      });
    }
  })
  .transform((val) => {
    const trimmed = (val ?? '').trim();
    return trimmed.length === 0 ? null : trimmed;
  });

export const updateCompanySettingsSchema = z.object({
  razonSocial: z
    .string()
    .trim()
    .min(3, 'La razón social debe tener al menos 3 caracteres')
    .max(160, 'La razón social no puede superar los 160 caracteres'),
  nombreComercial: z
    .string()
    .trim()
    .min(2, 'El nombre de la empresa debe tener al menos 2 caracteres')
    .max(120, 'El nombre de la empresa no puede superar los 120 caracteres'),
  ruc: optionalSunatRucSchema,
  direccion: z.string().trim().max(240).optional().nullable(),
  rubro: z.string().trim().max(120).optional().nullable(),
  ciudad: z.string().trim().max(120).optional().nullable(),
  whatsappTelefono: z.string().trim().max(40).optional().nullable(),
  encabezadoDocumento: z.string().trim().max(120).optional().nullable(),
  piePaginaDocumento: z.string().trim().max(240).optional().nullable(),
  logoRuta: z.string().trim().max(500).optional().nullable(),
  iconoMenuRuta: z.string().trim().max(500).optional().nullable(),
  colorMarca: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'El color principal debe estar en formato hexadecimal (#RRGGBB)'),
  modeloOperacion: z.enum(OPERATION_MODELS, {
    message: 'Selecciona un modelo de operación válido (Por visita, Por contrato o Ambos)',
  }),
  menuAcordeon: z.boolean(),
});

export type UpdateCompanySettingsInput = z.input<typeof updateCompanySettingsSchema>;
export type UpdateCompanySettingsPayload = z.output<typeof updateCompanySettingsSchema>;
