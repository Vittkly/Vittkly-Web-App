/**
 * Validador de correo electrónico según RFC estándar simple.
 */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/**
 * Validador estricto de contraseña:
 * - Mínimo 8 caracteres
 * - Al menos una letra mayúscula
 * - Al menos un dígito numérico
 * - Al menos un carácter especial
 */
export function isValidPassword(value: string): boolean {
  return (
    value.length >= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value) && /[^A-Za-z0-9]/.test(value)
  );
}

export interface PasswordRulesValidation {
  hasMinLength: boolean;
  hasUpper: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  isValid: boolean;
}

/**
 * Evalúa las reglas individuales de complejidad para contraseñas.
 */
export function getPasswordRules(value: string): PasswordRulesValidation {
  const hasMinLength = value.length >= 8;
  const hasUpper = /[A-Z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSpecial = /[^A-Za-z0-9]/.test(value);

  return {
    hasMinLength,
    hasUpper,
    hasNumber,
    hasSpecial,
    isValid: hasMinLength && hasUpper && hasNumber && hasSpecial,
  };
}

/**
 * Validador básico de número telefónico (mínimo 6 dígitos).
 */
export function isValidPhone(value: string): boolean {
  const digitsOnly = value.replace(/\D/g, '');
  return digitsOnly.length >= 6 && digitsOnly.length <= 15;
}
