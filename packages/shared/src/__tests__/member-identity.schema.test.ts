import { describe, expect, it } from 'vitest';
import {
  createMemberInvitationSchema,
  isValidDocumentNumber,
  isValidE164Phone,
  lookupDocumentInputSchema,
  maskDocumentForDisplay,
  maskEmailAddress,
  maskPersonName,
  maskPhoneLocal,
  newAccountPersonDetailsSchema,
  normalizeDocumentNumber,
  normalizeDocumentType,
  normalizePersonEmail,
  normalizePhoneToE164,
  sanitizeDocumentInput,
} from '../settings/member-identity.schema';

describe('member-identity.schema', () => {
  describe('normalizeDocumentType', () => {
    it('maps aliases to canonical Spanish database enum values', () => {
      expect(normalizeDocumentType('DNI')).toBe('DNI');
      expect(normalizeDocumentType(' dni ')).toBe('DNI');
      expect(normalizeDocumentType('CARNE_EXTRANJERIA')).toBe('carné de extranjería');
      expect(normalizeDocumentType('CE')).toBe('carné de extranjería');
      expect(normalizeDocumentType('carne de extranjeria')).toBe('carné de extranjería');
      expect(normalizeDocumentType('carné de extranjería')).toBe('carné de extranjería');
      expect(normalizeDocumentType('PASAPORTE')).toBe('pasaporte');
      expect(normalizeDocumentType('passport')).toBe('pasaporte');
      expect(normalizeDocumentType('RUC')).toBeNull();
    });
  });

  describe('sanitizeDocumentInput & isValidDocumentNumber', () => {
    it('blocks letters, spaces, symbols and truncates DNI at 8 digits', () => {
      expect(sanitizeDocumentInput('DNI', '12ab 34-56.7890')).toBe('12345678');
      expect(sanitizeDocumentInput('DNI', 'abcdef')).toBe('');
      expect(isValidDocumentNumber('DNI', '10203040')).toBe(true);
      expect(isValidDocumentNumber('DNI', '1020304')).toBe(false);
      expect(isValidDocumentNumber('DNI', '102030401')).toBe(false);
    });

    it('sanitizes Carné de extranjería (9-12 alphanumeric uppercase) and Pasaporte (6-16)', () => {
      expect(sanitizeDocumentInput('carné de extranjería', ' ce-001234ab!999 ')).toBe(
        'CE001234AB99',
      );
      expect(isValidDocumentNumber('carné de extranjería', 'ce001234a')).toBe(true);
      expect(isValidDocumentNumber('carné de extranjería', 'ce00123')).toBe(false);

      expect(sanitizeDocumentInput('pasaporte', 'pe-1234 56ab')).toBe('PE123456AB');
      expect(normalizeDocumentNumber('pasaporte', ' pe1234 ')).toBe('PE1234');
      expect(isValidDocumentNumber('pasaporte', 'pe1234')).toBe(true);
      expect(isValidDocumentNumber('pasaporte', 'pe123')).toBe(false);
    });
  });

  describe('normalizePhoneToE164 & isValidE164Phone', () => {
    it('normalizes local and double-prefixed Peruvian mobile numbers', () => {
      expect(normalizePhoneToE164('+51', '999 888 743')).toBe('+51999888743');
      expect(normalizePhoneToE164('+51', '51999888743')).toBe('+51999888743');
      expect(normalizePhoneToE164('+51', '+51 999-888-743')).toBe('+51999888743');
      expect(isValidE164Phone('+51999888743')).toBe(true);
      expect(isValidE164Phone('+51899888743')).toBe(false);
      expect(isValidE164Phone('+5199988874')).toBe(false);
    });

    it('validates international E.164 numbers', () => {
      expect(normalizePhoneToE164('+56', '912345678')).toBe('+56912345678');
      expect(isValidE164Phone('+56912345678')).toBe(true);
      expect(isValidE164Phone('+56123')).toBe(false);
    });
  });

  describe('masking functions edge cases', () => {
    it('masks multi-word and single-word/short names without leaking PII', () => {
      expect(maskPersonName(null, 'Carlos', 'Mateo')).toBe('Ca**** Ma****');
      expect(maskPersonName('Juan')).toBe('Ju****');
      expect(maskPersonName('Al Li')).toBe('A**** L****');
      expect(maskPersonName('')).toBe('U****');
    });

    it('masks emails including short local parts', () => {
      expect(maskEmailAddress('COORDINADOR@GMAIL.COM')).toBe('co****@gmail.com');
      expect(maskEmailAddress('ab@vittkly.com')).toBe('a****@vittkly.com');
      expect(maskEmailAddress('invalid')).toBe('****');
      expect(normalizePersonEmail(' User@Example.COM ')).toBe('user@example.com');
    });

    it('masks documents across 6, 8 and >=9 character lengths', () => {
      expect(maskDocumentForDisplay('10203040')).toBe('1020**40');
      expect(maskDocumentForDisplay('AB1289')).toBe('AB**89');
      expect(maskDocumentForDisplay('CE00123456')).toBe('CE0****56');
      expect(maskDocumentForDisplay('1234')).toBe('1****4');
      expect(maskDocumentForDisplay('')).toBe('****');
    });

    it('masks phone numbers keeping 3 first and 2 last national digits', () => {
      expect(maskPhoneLocal('+51999111243')).toBe('999****43');
      expect(maskPhoneLocal('999111243')).toBe('999****43');
      expect(maskPhoneLocal('+573001234567')).toBe('300****67');
      expect(maskPhoneLocal('')).toBe('****');
    });
  });

  describe('Zod schemas', () => {
    it('validates lookupDocumentInputSchema and normalizes number & alias', () => {
      const parsed = lookupDocumentInputSchema.parse({
        docType: 'CARNE_EXTRANJERIA',
        docNumber: ' ce0012345 ',
      });
      expect(parsed).toEqual({
        docType: 'carné de extranjería',
        docNumber: 'CE0012345',
      });

      const badDni = lookupDocumentInputSchema.safeParse({
        docType: 'DNI',
        docNumber: '1234A678',
      });
      expect(badDni.success).toBe(false);
    });

    it('validates newAccountPersonDetailsSchema and createMemberInvitationSchema', () => {
      const details = newAccountPersonDetailsSchema.parse({
        firstName: 'María',
        lastName: 'Fernández',
        email: ' MARIA@VITTKLY.COM ',
        countryPrefix: '+51',
        phone: '999888777',
      });
      expect(details.email).toBe('maria@vittkly.com');

      const inv = createMemberInvitationSchema.parse({
        docType: 'DNI',
        docNumber: '10203040',
        perfilId: '11111111-1111-4111-8111-111111111111',
        accessLabel: 'Solo web',
        jobTitle: '  Supervisor  ',
      });
      expect(inv.jobTitle).toBe('Supervisor');
      expect(inv.accessLabel).toBe('Solo web');
    });
  });
});
