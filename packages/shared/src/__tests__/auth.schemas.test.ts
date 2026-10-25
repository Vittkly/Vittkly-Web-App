import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  passwordSchema,
  pinSchema,
  internationalPhoneSchema,
  loginSchema,
} from '../index';

describe('Shared Auth & Validation Schemas', () => {
  describe('emailSchema', () => {
    it('valida correos electrónicos válidos', () => {
      expect(emailSchema.safeParse('usuario@vittkly.com').success).toBe(true);
      expect(emailSchema.safeParse('test.soporte@empresa.com.pe').success).toBe(true);
    });

    it('rechaza correos vacíos o mal formateados', () => {
      expect(emailSchema.safeParse('').success).toBe(false);
      expect(emailSchema.safeParse('usuario-invalido').success).toBe(false);
      expect(emailSchema.safeParse('@vittkly.com').success).toBe(false);
    });
  });

  describe('passwordSchema', () => {
    it('valida contraseñas que cumplen todos los criterios de seguridad', () => {
      // Mínimo 8 caracteres, al menos 1 mayúscula, 1 número y 1 carácter especial
      expect(passwordSchema.safeParse('Vittkly2026!').success).toBe(true);
      expect(passwordSchema.safeParse('SuperSec#99').success).toBe(true);
    });

    it('rechaza contraseñas con longitud insuficiente (< 8)', () => {
      expect(passwordSchema.safeParse('Vit1!').success).toBe(false);
    });

    it('rechaza contraseñas sin mayúsculas', () => {
      expect(passwordSchema.safeParse('vittkly2026!').success).toBe(false);
    });

    it('rechaza contraseñas sin números', () => {
      expect(passwordSchema.safeParse('VittklyGlobal!').success).toBe(false);
    });

    it('rechaza contraseñas sin caracteres especiales', () => {
      expect(passwordSchema.safeParse('Vittkly2026Secure').success).toBe(false);
    });
  });

  describe('pinSchema', () => {
    it('valida PINs de exactamente 4 dígitos numéricos', () => {
      expect(pinSchema.safeParse('1234').success).toBe(true);
      expect(pinSchema.safeParse('0000').success).toBe(true);
      expect(pinSchema.safeParse('9876').success).toBe(true);
    });

    it('rechaza PINs con menos o más de 4 dígitos', () => {
      expect(pinSchema.safeParse('123').success).toBe(false);
      expect(pinSchema.safeParse('12345').success).toBe(false);
    });

    it('rechaza PINs con letras o caracteres especiales', () => {
      expect(pinSchema.safeParse('12a4').success).toBe(false);
      expect(pinSchema.safeParse('12-4').success).toBe(false);
    });
  });

  describe('internationalPhoneSchema', () => {
    it('valida formatos telefónicos internacionales válidos', () => {
      expect(internationalPhoneSchema.safeParse('+51987654321').success).toBe(true);
      expect(internationalPhoneSchema.safeParse('51987654321').success).toBe(true);
    });

    it('rechaza números con menos de 8 dígitos', () => {
      expect(internationalPhoneSchema.safeParse('12345').success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('valida payload completo de inicio de sesión', () => {
      const result = loginSchema.safeParse({
        email: 'admin@vittkly.com',
        password: 'Password123!',
      });
      expect(result.success).toBe(true);
    });

    it('falla si falta la contraseña o el email', () => {
      expect(loginSchema.safeParse({ email: 'admin@vittkly.com' }).success).toBe(false);
      expect(loginSchema.safeParse({ password: 'Password123!' }).success).toBe(false);
    });
  });
});
