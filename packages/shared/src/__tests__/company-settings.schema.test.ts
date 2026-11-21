import { describe, expect, it } from 'vitest';
import {
  isValidSunatRuc,
  OPERATION_MODEL_OPTIONS,
  sanitizeRucInput,
  updateCompanySettingsSchema,
  validateOptionalRuc,
} from '../settings/company-settings.schema';

describe('company-settings.schema (VIT-65)', () => {
  it('sanitizes RUC input in real time to at most 11 numeric digits', () => {
    expect(sanitizeRucInput('20601234561')).toBe('20601234561');
    expect(sanitizeRucInput('20-60123-4561-999')).toBe('20601234561');
    expect(sanitizeRucInput('ABC 10456789012 XYZ')).toBe('10456789012');
  });

  it('validates SUNAT Module-11 RUCs accurately', () => {
    // RUC 20609000008: 2*5 + 0*4 + 6*3 + 0*2 + 9*7 + 0*6 + 0*5 + 0*4 + 0*3 + 0*2 = 10 + 18 + 63 = 91 -> 91 % 11 = 3 -> 11 - 3 = 8
    expect(isValidSunatRuc('20609000008')).toBe(true);
    // Invalid check digit
    expect(isValidSunatRuc('20609000009')).toBe(false);
    // RUC 10100000007: 1*5 + 0*4 + 1*3 = 8 -> 8 % 11 = 8 -> 11 - 8 = 3
    expect(isValidSunatRuc('10100000003')).toBe(true);
    // Invalid prefix (30)
    expect(isValidSunatRuc('30609000008')).toBe(false);
    // Less than 11 digits
    expect(isValidSunatRuc('2060900000')).toBe(false);
  });

  it('allows empty/null RUC conditionally so newly created companies can save brand/operation settings', () => {
    expect(validateOptionalRuc('')).toEqual({ valid: true, normalized: null });
    expect(validateOptionalRuc(null)).toEqual({ valid: true, normalized: null });
    expect(validateOptionalRuc('   ')).toEqual({ valid: true, normalized: null });

    const parsedEmpty = updateCompanySettingsSchema.safeParse({
      razonSocial: 'Vitta Kleanly S.A.C.',
      nombreComercial: 'Vitta Kleanly',
      ruc: '',
      colorMarca: '#2AA8DE',
      modeloOperacion: 'ambos',
      menuAcordeon: false,
    });
    expect(parsedEmpty.success).toBe(true);
    if (parsedEmpty.success) {
      expect(parsedEmpty.data.ruc).toBeNull();
    }
  });

  it('rejects partial or invalid check-digit RUCs when non-empty', () => {
    const partial = updateCompanySettingsSchema.safeParse({
      razonSocial: 'Vitta Kleanly S.A.C.',
      nombreComercial: 'Vitta Kleanly',
      ruc: '206090',
      colorMarca: '#2AA8DE',
      modeloOperacion: 'visita',
      menuAcordeon: true,
    });
    expect(partial.success).toBe(false);

    const badCheckDigit = updateCompanySettingsSchema.safeParse({
      razonSocial: 'Vitta Kleanly S.A.C.',
      nombreComercial: 'Vitta Kleanly',
      ruc: '20609000001',
      colorMarca: '#2AA8DE',
      modeloOperacion: 'contrato',
      menuAcordeon: false,
    });
    expect(badCheckDigit.success).toBe(false);
  });

  it('exposes the 3 canonical operation models mapped to UI labels', () => {
    expect(OPERATION_MODEL_OPTIONS.map((o) => [o.code, o.label])).toEqual([
      ['visita', 'Por visita'],
      ['contrato', 'Por contrato'],
      ['ambos', 'Ambos'],
    ]);
  });
});
