import { z } from 'zod';

/**
 * Expresión regular oficial para validación de contraseña fuerte en Vittkly:
 * - Mínimo 8 caracteres
 * - Al menos una letra mayúscula ([A-Z])
 * - Al menos un dígito ([0-9])
 * - Al menos un carácter especial o símbolo ([^A-Za-z0-9])
 */
export const passwordValidationRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;

export interface PasswordStrength {
  minLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  isValid: boolean;
  validCount: number;
}

/**
 * Evalúa las reglas individuales de seguridad para feedback en tiempo real en la UI.
 */
export function evaluatePasswordStrength(password: string): PasswordStrength {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  const validCount = [minLength, hasUppercase, hasNumber, hasSpecialChar].filter(Boolean).length;
  const isValid = validCount === 4;

  return {
    minLength,
    hasUppercase,
    hasNumber,
    hasSpecialChar,
    isValid,
    validCount,
  };
}

/**
 * Esquema de validación para inicio de sesión con correo y contraseña.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'El correo electrónico es requerido')
    .email('Ingresa un correo electrónico válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Esquema de validación para solicitud de recuperación de contraseña.
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'El correo electrónico es requerido')
    .email('Ingresa un correo electrónico válido'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/**
 * Esquema de validación para restablecimiento definitivo de contraseña.
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe incluir al menos una letra mayúscula')
      .regex(/[0-9]/, 'Debe incluir al menos un número')
      .regex(/[^A-Za-z0-9]/, 'Debe incluir al menos un carácter especial o símbolo'),
    confirmPassword: z.string().min(1, 'Confirma tu nueva contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * Esquema de validación para registro de nueva cuenta y organización inicial.
 */
export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Ingresa tu nombre completo'),
    companyName: z.string().trim().min(2, 'Ingresa el nombre o razón social de tu empresa'),
    ruc: z
      .string()
      .trim()
      .optional()
      .refine(
        (val) => !val || /^(10|20)\d{9}$/.test(val),
        'El RUC debe tener 11 dígitos e iniciar con 10 o 20'
      ),
    planCode: z.enum(['inicia', 'crece', 'empresa']).default('empresa'),
    email: z
      .string()
      .trim()
      .min(1, 'El correo electrónico es requerido')
      .email('Ingresa un correo electrónico válido'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe incluir al menos una letra mayúscula')
      .regex(/[0-9]/, 'Debe incluir al menos un número')
      .regex(/[^A-Za-z0-9]/, 'Debe incluir al menos un carácter especial o símbolo'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
