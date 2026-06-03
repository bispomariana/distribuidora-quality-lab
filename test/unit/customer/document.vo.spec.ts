import { Document } from '@modules/customer/domain/value-objects/document.vo';
import { ValidationException } from '@shared/domain/exceptions/validation.exception';

describe('Document Value Object', () => {
  describe('CPF validation', () => {
    it('when valid CPF is provided, then creates Document with type CPF', () => {
      const doc = Document.create('52998224725');

      expect(doc.value).toBe('52998224725');
      expect(doc.type).toBe('CPF');
    });

    it('when valid CPF with formatting is provided, then strips non-digits', () => {
      const doc = Document.create('529.982.247-25');

      expect(doc.value).toBe('52998224725');
      expect(doc.type).toBe('CPF');
    });

    it('when CPF has invalid first check digit, then throws ValidationException', () => {
      expect(() => Document.create('52998224735')).toThrow(ValidationException);
    });

    it('when CPF has invalid second check digit, then throws ValidationException', () => {
      expect(() => Document.create('52998224726')).toThrow(ValidationException);
    });

    it('when CPF has all same digits, then throws ValidationException', () => {
      expect(() => Document.create('11111111111')).toThrow(ValidationException);
    });
  });

  describe('CNPJ validation', () => {
    it('when valid CNPJ is provided, then creates Document with type CNPJ', () => {
      const doc = Document.create('11222333000181');

      expect(doc.value).toBe('11222333000181');
      expect(doc.type).toBe('CNPJ');
    });

    it('when valid CNPJ with formatting is provided, then strips non-digits', () => {
      const doc = Document.create('11.222.333/0001-81');

      expect(doc.value).toBe('11222333000181');
      expect(doc.type).toBe('CNPJ');
    });

    it('when CNPJ has invalid first check digit, then throws ValidationException', () => {
      expect(() => Document.create('11222333000191')).toThrow(ValidationException);
    });

    it('when CNPJ has invalid second check digit, then throws ValidationException', () => {
      expect(() => Document.create('11222333000182')).toThrow(ValidationException);
    });

    it('when CNPJ has all same digits, then throws ValidationException', () => {
      expect(() => Document.create('11111111111111')).toThrow(ValidationException);
    });
  });

  describe('invalid length', () => {
    it('when document has fewer than 11 digits, then throws ValidationException', () => {
      expect(() => Document.create('1234567890')).toThrow(ValidationException);
    });

    it('when document has 12 digits (between CPF and CNPJ), then throws ValidationException', () => {
      expect(() => Document.create('123456789012')).toThrow(ValidationException);
    });

    it('when document has more than 14 digits, then throws ValidationException', () => {
      expect(() => Document.create('123456789012345')).toThrow(ValidationException);
    });
  });

  describe('equality', () => {
    it('when two Documents have same value and type, then they are equal', () => {
      const doc1 = Document.create('52998224725');
      const doc2 = Document.create('52998224725');

      expect(doc1.equals(doc2)).toBe(true);
    });

    it('when two Documents have different values, then they are not equal', () => {
      const doc1 = Document.create('52998224725');
      const doc2 = Document.create('11222333000181');

      expect(doc1.equals(doc2)).toBe(false);
    });
  });
});
