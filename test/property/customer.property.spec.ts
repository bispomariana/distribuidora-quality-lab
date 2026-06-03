import * as fc from 'fast-check';
import { Document } from '@modules/customer/domain/value-objects/document.vo';
import { ValidationException } from '@shared/domain/exceptions/validation.exception';
import { ConflictException } from '@shared/domain/exceptions/conflict.exception';
import { CreateCustomerUseCase } from '@modules/customer/application/use-cases/create-customer.use-case';
import { ValidateDocumentUseCase } from '@modules/customer/domain/validate-document.use-case';
import { CustomerRepository } from '@modules/customer/domain/repositories/customer.repository';
import { CustomerEntity } from '@modules/customer/domain/entities/customer.entity';

// ---------------------------------------------------------------------------
// Helpers: CPF/CNPJ generators (invalid — corrupted check digits)
// ---------------------------------------------------------------------------

/**
 * Computes the CPF check digits for the first 9 base digits.
 * Returns [d1, d2].
 */
function computeCpfCheckDigits(base9: number[]): [number, number] {
  const firstMultipliers = [10, 9, 8, 7, 6, 5, 4, 3, 2];
  const firstSum = firstMultipliers.reduce((s, m, i) => s + base9[i]! * m, 0);
  const firstRem = firstSum % 11;
  const d1 = firstRem < 2 ? 0 : 11 - firstRem;

  const tenDigits = [...base9, d1];
  const secondMultipliers = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
  const secondSum = secondMultipliers.reduce(
    (s, m, i) => s + tenDigits[i]! * m,
    0,
  );
  const secondRem = secondSum % 11;
  const d2 = secondRem < 2 ? 0 : 11 - secondRem;

  return [d1, d2];
}

/**
 * Computes the CNPJ check digits for the first 12 base digits.
 * Returns [d1, d2].
 */
function computeCnpjCheckDigits(base12: number[]): [number, number] {
  const firstMultipliers = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const firstSum = firstMultipliers.reduce(
    (s, m, i) => s + base12[i]! * m,
    0,
  );
  const firstRem = firstSum % 11;
  const d1 = firstRem < 2 ? 0 : 11 - firstRem;

  const thirteenDigits = [...base12, d1];
  const secondMultipliers = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const secondSum = secondMultipliers.reduce(
    (s, m, i) => s + thirteenDigits[i]! * m,
    0,
  );
  const secondRem = secondSum % 11;
  const d2 = secondRem < 2 ? 0 : 11 - secondRem;

  return [d1, d2];
}

/**
 * Builds an invalid CPF string: computes correct check digits then corrupts
 * at least one of them.
 */
function buildInvalidCpf(base9: number[], corruptD1: boolean, delta: number): string {
  const [d1, d2] = computeCpfCheckDigits(base9);
  const newD1 = corruptD1 ? ((d1 + 1 + (delta % 9)) % 10) : d1;
  const newD2 = corruptD1 ? d2 : ((d2 + 1 + (delta % 9)) % 10);
  return [...base9, newD1, newD2].join('');
}

/**
 * Builds an invalid CNPJ string: computes correct check digits then corrupts
 * at least one of them.
 */
function buildInvalidCnpj(base12: number[], corruptD1: boolean, delta: number): string {
  const [d1, d2] = computeCnpjCheckDigits(base12);
  const newD1 = corruptD1 ? ((d1 + 1 + (delta % 9)) % 10) : d1;
  const newD2 = corruptD1 ? d2 : ((d2 + 1 + (delta % 9)) % 10);
  return [...base12, newD1, newD2].join('');
}

// ---------------------------------------------------------------------------
// Property 4 — CPF/CNPJ validation
// ---------------------------------------------------------------------------

describe('Property Tests — Customer', () => {
  describe('Property 4: Validação de CPF/CNPJ', () => {
    /**
     * **Validates: Requirements 2.5**
     *
     * For any 11-digit string that does NOT satisfy the CPF check digit algorithm,
     * Document.create() must throw ValidationException (HTTP 400).
     */
    it('Property 4a: rejects any 11-digit string with wrong CPF check digits', () => {
      // Arrange
      const base9Arb = fc.array(fc.integer({ min: 0, max: 9 }), {
        minLength: 9,
        maxLength: 9,
      });
      const corruptFlagArb = fc.boolean();
      const deltaArb = fc.integer({ min: 1, max: 9 });

      fc.assert(
        fc.property(base9Arb, corruptFlagArb, deltaArb, (base9, corruptD1, delta) => {
          // Filter out all-same-digit sequences (rejected before check digit check)
          const allSame = base9.every((d) => d === base9[0]);
          if (allSame) return true; // fc will skip but we can also just skip

          const invalidCpf = buildInvalidCpf(base9, corruptD1, delta);

          // Act + Assert
          expect(() => Document.create(invalidCpf)).toThrow(ValidationException);
        }),
        { numRuns: 100 },
      );
    });

    /**
     * **Validates: Requirements 2.5**
     *
     * For any 14-digit string that does NOT satisfy the CNPJ check digit algorithm,
     * Document.create() must throw ValidationException (HTTP 400).
     */
    it('Property 4b: rejects any 14-digit string with wrong CNPJ check digits', () => {
      // Arrange
      const base12Arb = fc.array(fc.integer({ min: 0, max: 9 }), {
        minLength: 12,
        maxLength: 12,
      });
      const corruptFlagArb = fc.boolean();
      const deltaArb = fc.integer({ min: 1, max: 9 });

      fc.assert(
        fc.property(base12Arb, corruptFlagArb, deltaArb, (base12, corruptD1, delta) => {
          // Filter out all-same-digit sequences (rejected before check digit check)
          const allSame = base12.every((d) => d === base12[0]);
          if (allSame) return true;

          const invalidCnpj = buildInvalidCnpj(base12, corruptD1, delta);

          // Act + Assert
          expect(() => Document.create(invalidCnpj)).toThrow(ValidationException);
        }),
        { numRuns: 100 },
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Property 5 — Email uniqueness
  // ---------------------------------------------------------------------------

  describe('Property 5: Unicidade de email de Cliente', () => {
    /**
     * **Validates: Requirements 2.6**
     *
     * For any customer already registered with email E, trying to create another
     * customer with the same email E must throw ConflictException, regardless of
     * other data (name, document, phone).
     */
    it('Property 5: throws ConflictException when email already exists', async () => {
      // Arrange
      const emailArb = fc
        .tuple(
          fc.stringMatching(/^[a-z]{3,10}$/),
          fc.stringMatching(/^[a-z]{2,8}$/),
          fc.constantFrom('com', 'org', 'net', 'io'),
        )
        .map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

      const nameArb = fc.string({ minLength: 1, maxLength: 50 }).filter(
        (s) => s.trim().length > 0,
      );

      await fc.assert(
        fc.asyncProperty(emailArb, nameArb, async (email, name) => {
          // Arrange: mock repository that returns a truthy object for findByEmail
          // The use case only checks `if (existingCustomer)` — any truthy value suffices
          const existingCustomer = { id: 'existing-uuid', email } as unknown as CustomerEntity;

          const mockRepository: CustomerRepository = {
            findByEmail: jest.fn().mockResolvedValue(existingCustomer),
            findById: jest.fn().mockResolvedValue(null),
            findAll: jest.fn().mockResolvedValue([]),
            save: jest.fn(),
            delete: jest.fn(),
          };

          const validateDocumentUseCase = new ValidateDocumentUseCase();

          const useCase = new CreateCustomerUseCase(
            mockRepository,
            validateDocumentUseCase,
          );

          // Act + Assert
          await expect(
            useCase.execute({
              name,
              document: '529.982.247-25', // valid CPF for structural purposes
              email,
              phone: '11987654321',
            }),
          ).rejects.toThrow(ConflictException);
        }),
        { numRuns: 100 },
      );
    });
  });
});
