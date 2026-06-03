import { ValueObject } from '@shared/domain/value-object';
import { ValidationException } from '@shared/domain/exceptions/validation.exception';

export type DocumentType = 'CPF' | 'CNPJ';

interface DocumentProps {
  value: string;
  type: DocumentType;
}

export class Document extends ValueObject<DocumentProps> {
  private readonly _value: string;
  private readonly _type: DocumentType;

  private constructor(value: string, type: DocumentType) {
    super();
    this._value = value;
    this._type = type;
  }

  protected get props(): DocumentProps {
    return { value: this._value, type: this._type };
  }

  get value(): string {
    return this._value;
  }

  get type(): DocumentType {
    return this._type;
  }

  static create(raw: string): Document {
    const digits = raw.replace(/\D/g, '');

    if (digits.length === 11) {
      if (!Document.isValidCpf(digits)) {
        throw new ValidationException('Invalid CPF: check digits do not match', {
          field: 'document',
          value: raw,
        });
      }
      return new Document(digits, 'CPF');
    }

    if (digits.length === 14) {
      if (!Document.isValidCnpj(digits)) {
        throw new ValidationException('Invalid CNPJ: check digits do not match', {
          field: 'document',
          value: raw,
        });
      }
      return new Document(digits, 'CNPJ');
    }

    throw new ValidationException('Document must be a CPF (11 digits) or CNPJ (14 digits)', {
      field: 'document',
      value: raw,
    });
  }

  private static isValidCpf(digits: string): boolean {
    if (/^(\d)\1{10}$/.test(digits)) return false;

    const numbers = digits.split('').map(Number);

    const firstMultipliers = [10, 9, 8, 7, 6, 5, 4, 3, 2];
    const firstSum = firstMultipliers.reduce((sum, mult, i) => sum + numbers[i]! * mult, 0);
    const firstRemainder = firstSum % 11;
    const firstDigit = firstRemainder < 2 ? 0 : 11 - firstRemainder;

    if (numbers[9] !== firstDigit) return false;

    const secondMultipliers = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
    const secondSum = secondMultipliers.reduce((sum, mult, i) => sum + numbers[i]! * mult, 0);
    const secondRemainder = secondSum % 11;
    const secondDigit = secondRemainder < 2 ? 0 : 11 - secondRemainder;

    return numbers[10] === secondDigit;
  }

  private static isValidCnpj(digits: string): boolean {
    if (/^(\d)\1{13}$/.test(digits)) return false;

    const numbers = digits.split('').map(Number);

    const firstMultipliers = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const firstSum = firstMultipliers.reduce((sum, mult, i) => sum + numbers[i]! * mult, 0);
    const firstRemainder = firstSum % 11;
    const firstDigit = firstRemainder < 2 ? 0 : 11 - firstRemainder;

    if (numbers[12] !== firstDigit) return false;

    const secondMultipliers = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const secondSum = secondMultipliers.reduce((sum, mult, i) => sum + numbers[i]! * mult, 0);
    const secondRemainder = secondSum % 11;
    const secondDigit = secondRemainder < 2 ? 0 : 11 - secondRemainder;

    return numbers[13] === secondDigit;
  }
}
