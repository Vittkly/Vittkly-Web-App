import { z } from 'zod';

/**
 * Valores canónicos guardados en `public.usuarios.tipo_documento` y `public.invitaciones.tipo_documento`.
 */
export const CANONICAL_DOCUMENT_TYPES = ['DNI', 'carné de extranjería', 'pasaporte'] as const;

export type CanonicalDocumentType = (typeof CANONICAL_DOCUMENT_TYPES)[number];

export const ACCESS_LABELS = ['Solo web', 'Solo app', 'Web y app'] as const;
export type AccessLabelType = (typeof ACCESS_LABELS)[number];

export interface DocumentRuleConfig {
  label: string;
  shortLabel: string;
  minLength: number;
  maxLength: number;
  pattern: RegExp;
  counterLabel: (length: number) => string;
  invalidMessage: string;
}

export const DOCUMENT_RULES: Record<CanonicalDocumentType, DocumentRuleConfig> = {
  DNI: {
    label: 'DNI',
    shortLabel: 'DNI',
    minLength: 8,
    maxLength: 8,
    pattern: /^\d{8}$/,
    counterLabel: (length: number) => `${length}/8 dígitos`,
    invalidMessage: 'El DNI debe tener exactamente 8 dígitos numéricos.',
  },
  'carné de extranjería': {
    label: 'Carné de extranjería',
    shortLabel: 'CE',
    minLength: 9,
    maxLength: 12,
    pattern: /^[A-Z0-9]{9,12}$/,
    counterLabel: (length: number) => `${length}/12 caracteres`,
    invalidMessage: 'El carné de extranjería debe tener entre 9 y 12 caracteres alfanuméricos.',
  },
  pasaporte: {
    label: 'Pasaporte',
    shortLabel: 'Pasaporte',
    minLength: 6,
    maxLength: 16,
    pattern: /^[A-Z0-9]{6,16}$/,
    counterLabel: (length: number) => `${length}/16 caracteres`,
    invalidMessage: 'El pasaporte debe tener entre 6 y 16 caracteres alfanuméricos.',
  },
};

export const SUPPORTED_COUNTRY_DIAL_CODES = [
  { code: '+51', label: '+51 Perú', nationalLength: 9 },
  { code: '+56', label: '+56 Chile', nationalLength: 9 },
  { code: '+57', label: '+57 Col', nationalLength: 10 },
  { code: '+52', label: '+52 Méx', nationalLength: 10 },
  { code: '+593', label: '+593 Ecu', nationalLength: 9 },
  { code: '+58', label: '+58 Ven', nationalLength: 10 },
  { code: '+54', label: '+54 Arg', nationalLength: 10 },
  { code: '+34', label: '+34 Esp', nationalLength: 9 },
  { code: '+1', label: '+1 EEUU', nationalLength: 10 },
] as const;

const DOCUMENT_ALIAS_MAP: Record<string, CanonicalDocumentType> = {
  dni: 'DNI',
  ce: 'carné de extranjería',
  carne_extranjeria: 'carné de extranjería',
  'carne de extranjeria': 'carné de extranjería',
  'carne extranjeria': 'carné de extranjería',
  pasaporte: 'pasaporte',
  passport: 'pasaporte',
};

/**
 * Mapea cualquier alias aceptado (`DNI`, `CARNE_EXTRANJERIA`, `CE`, `PASAPORTE`, etc.)
 * hacia el enum canónico almacenado en PostgreSQL.
 */
export function normalizeDocumentType(raw: string): CanonicalDocumentType | null {
  const folded = raw
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');

  return DOCUMENT_ALIAS_MAP[folded] ?? null;
}

/**
 * Sanitiza en tiempo real el valor ingresado o pegado según el tipo de documento.
 */
export function sanitizeDocumentInput(docType: CanonicalDocumentType, rawValue: string): string {
  if (docType === 'DNI') {
    return rawValue.replace(/\D/g, '').slice(0, 8);
  }
  const maxLen = docType === 'carné de extranjería' ? 12 : 16;
  return rawValue
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, maxLen);
}

/**
 * Normaliza el número de documento aplicando trim + mayúsculas al número (no al tipo).
 */
export function normalizeDocumentNumber(docType: CanonicalDocumentType, rawValue: string): string {
  const trimmedUpper = rawValue.trim().toUpperCase();
  if (docType === 'DNI') {
    return trimmedUpper;
  }
  return trimmedUpper.replace(/\s+/g, '');
}

/**
 * Valida si un número de documento cumple exactamente con la longitud y formato oficial.
 */
export function isValidDocumentNumber(docType: CanonicalDocumentType, rawValue: string): boolean {
  const normalized = normalizeDocumentNumber(docType, rawValue);
  return DOCUMENT_RULES[docType].pattern.test(normalized);
}

export function normalizePersonEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Normaliza un número telefónico a formato estricto E.164 (`+<código><número>`).
 * Evita duplicar prefijo si el usuario pega un número que ya inicia con `+` o con el código país.
 */
export function normalizePhoneToE164(countryPrefix: string, rawPhone: string): string {
  const trimmed = rawPhone.trim();
  if (!trimmed) return '';

  const prefixDigits = countryPrefix.replace(/\D/g, '');
  if (trimmed.startsWith('+')) {
    const allDigits = trimmed.replace(/\D/g, '');
    return allDigits ? `+${allDigits}` : '';
  }

  let localDigits = trimmed.replace(/\D/g, '');
  if (!localDigits) return '';

  if (prefixDigits === '51' && localDigits.length === 11 && localDigits.startsWith('51')) {
    localDigits = localDigits.slice(2);
  }

  return `+${prefixDigits}${localDigits}`;
}

export function isValidE164Phone(e164: string): boolean {
  if (!/^\+[1-9]\d{7,14}$/.test(e164)) {
    return false;
  }
  if (e164.startsWith('+51')) {
    return /^\+519\d{8}$/.test(e164);
  }
  return true;
}

export function maskPersonName(
  fullName?: string | null,
  firstName?: string | null,
  lastName?: string | null,
): string {
  const joined = [firstName?.trim(), lastName?.trim()].filter(Boolean).join(' ').trim();
  const source = (joined || fullName || '').trim();
  if (!source) return 'U****';

  return source
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => (word.length <= 2 ? `${word[0]}****` : `${word.slice(0, 2)}****`))
    .join(' ');
}

export function maskEmailAddress(email?: string | null): string {
  const clean = (email ?? '').trim().toLowerCase();
  const atIndex = clean.indexOf('@');
  if (atIndex <= 0 || atIndex === clean.length - 1) return '****';

  const local = clean.slice(0, atIndex);
  const domain = clean.slice(atIndex + 1);
  const visibleCount = local.length <= 2 ? 1 : 2;
  return `${local.slice(0, visibleCount)}****@${domain}`;
}

export function maskDocumentForDisplay(docNumber?: string | null): string {
  const clean = (docNumber ?? '').trim().toUpperCase();
  const len = clean.length;
  if (len >= 9) {
    return `${clean.slice(0, 3)}****${clean.slice(-2)}`;
  }
  if (len === 8) {
    return `${clean.slice(0, 4)}**${clean.slice(-2)}`;
  }
  if (len >= 6) {
    return `${clean.slice(0, 2)}**${clean.slice(-2)}`;
  }
  if (len >= 3) {
    return `${clean.slice(0, 1)}****${clean.slice(-1)}`;
  }
  return '****';
}

export function maskPhoneLocal(phone?: string | null): string {
  const raw = (phone ?? '').trim();
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '****';

  let localDigits = digits;
  if (raw.startsWith('+')) {
    const knownDial = SUPPORTED_COUNTRY_DIAL_CODES.find((c) => raw.startsWith(c.code));
    if (knownDial) {
      localDigits = raw.slice(knownDial.code.length).replace(/\D/g, '');
    } else if (digits.length > 9) {
      localDigits = digits.slice(-9);
    }
  } else if (digits.length === 11 && digits.startsWith('51')) {
    localDigits = digits.slice(2);
  }

  if (localDigits.length >= 6) {
    return `${localDigits.slice(0, 3)}****${localDigits.slice(-2)}`;
  }
  if (localDigits.length >= 2) {
    return `${localDigits.slice(0, 1)}****${localDigits.slice(-1)}`;
  }
  return '****';
}

export const canonicalDocumentTypeSchema = z.string().transform((val, ctx) => {
  const normalized = normalizeDocumentType(val);
  if (!normalized) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Tipo de documento inválido. Usa DNI, carné de extranjería o pasaporte.',
    });
    return z.NEVER;
  }
  return normalized;
});

export const lookupDocumentInputSchema = z
  .object({
    docType: canonicalDocumentTypeSchema,
    docNumber: z.string().trim().min(1, 'Ingresa el número de documento'),
  })
  .superRefine((data, ctx) => {
    const normalizedNum = normalizeDocumentNumber(data.docType, data.docNumber);
    const rules = DOCUMENT_RULES[data.docType];
    if (!rules.pattern.test(normalizedNum)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: rules.invalidMessage,
        path: ['docNumber'],
      });
    }
  })
  .transform((data) => ({
    docType: data.docType,
    docNumber: normalizeDocumentNumber(data.docType, data.docNumber),
  }));

export type LookupDocumentInput = z.infer<typeof lookupDocumentInputSchema>;

export const newAccountPersonDetailsSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'Los nombres son obligatorios (mínimo 2 caracteres)')
    .max(80, 'Máximo 80 caracteres'),
  lastName: z
    .string()
    .trim()
    .min(2, 'Los apellidos son obligatorios (mínimo 2 caracteres)')
    .max(80, 'Máximo 80 caracteres'),
  email: z
    .string()
    .trim()
    .min(1, 'El correo electrónico es obligatorio')
    .email('Ingresa un correo electrónico válido')
    .transform((v) => v.toLowerCase()),
  countryPrefix: z.string().trim().default('+51'),
  phone: z
    .string()
    .trim()
    .min(6, 'El número de celular es obligatorio')
    .max(20, 'Número de celular inválido'),
});

export const createMemberInvitationSchema = z
  .object({
    docType: canonicalDocumentTypeSchema,
    docNumber: z.string().trim().min(1, 'Número de documento obligatorio'),
    perfilId: z.string().uuid('Selecciona un perfil válido'),
    accessLabel: z.enum(ACCESS_LABELS, {
      message: 'Selecciona un tipo de acceso válido (Solo web, Solo app o Web y app)',
    }),
    jobTitle: z
      .string()
      .trim()
      .max(80, 'El cargo no debe superar 80 caracteres')
      .optional()
      .default(''),
    firstName: z.string().optional().default(''),
    lastName: z.string().optional().default(''),
    email: z.string().optional().default(''),
    countryPrefix: z.string().optional().default('+51'),
    phone: z.string().optional().default(''),
  })
  .superRefine((data, ctx) => {
    const normalizedNum = normalizeDocumentNumber(data.docType, data.docNumber);
    const rules = DOCUMENT_RULES[data.docType];
    if (!rules.pattern.test(normalizedNum)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: rules.invalidMessage,
        path: ['docNumber'],
      });
    }
  })
  .transform((data) => ({
    ...data,
    docNumber: normalizeDocumentNumber(data.docType, data.docNumber),
    jobTitle: data.jobTitle.trim(),
  }));

export type CreateMemberInvitationInput = z.infer<typeof createMemberInvitationSchema>;
