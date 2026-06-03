import * as fc from 'fast-check';
import { PaymentTypeEntity } from '@modules/payment-type/domain/entities/payment-type.entity';
import { AcceptanceRule } from '@modules/payment-type/domain/value-objects/acceptance-rule.vo';
import { ListActivePaymentTypesUseCase } from '@modules/payment-type/application/use-cases/list-active-payment-types.use-case';
import { ValidatePaymentForOrderUseCase } from '@modules/payment-type/application/use-cases/validate-payment-for-order.use-case';
import { PaymentTypeRepository } from '@modules/payment-type/domain/repositories/payment-type.repository';
import {
  ValidationException,
  BusinessRuleException,
} from '@shared/domain/exceptions';
import { v4 as uuidv4 } from 'uuid';

/**
 * In-memory repository fake for payment-type property tests.
 */
class InMemoryPaymentTypeRepository implements PaymentTypeRepository {
  private store = new Map<string, PaymentTypeEntity>();

  async findById(id: string): Promise<PaymentTypeEntity | null> {
    return this.store.get(id) ?? null;
  }

  async findByName(name: string): Promise<PaymentTypeEntity | null> {
    for (const pt of this.store.values()) {
      if (pt.name === name) return pt;
    }
    return null;
  }

  async findAll(): Promise<PaymentTypeEntity[]> {
    return Array.from(this.store.values());
  }

  async findAllActive(): Promise<PaymentTypeEntity[]> {
    return Array.from(this.store.values()).filter((pt) => pt.active);
  }

  async save(paymentType: PaymentTypeEntity): Promise<PaymentTypeEntity> {
    if (!paymentType.id) {
      Object.defineProperty(paymentType, '_id', { value: uuidv4(), writable: true });
    }
    this.store.set(paymentType.id, paymentType);
    return paymentType;
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  addWithId(paymentType: PaymentTypeEntity, id: string): void {
    Object.defineProperty(paymentType, '_id', { value: id, writable: true });
    this.store.set(id, paymentType);
  }

  clear(): void {
    this.store.clear();
  }
}

// --- Generators ---

const validNameArb = fc
  .string({ minLength: 1, maxLength: 100 })
  .filter((s) => s.trim().length > 0);

const validMinMaxArb = fc
  .tuple(
    fc.double({ min: 0.01, max: 999999999.99, noNaN: true }),
    fc.double({ min: 0.01, max: 999999999.99, noNaN: true }),
  )
  .filter(([a, b]) => a <= b)
  .map(([a, b]) => ({ min: a, max: b }));

// --- Property Tests ---

describe('Property Tests — Payment Module', () => {
  describe('Property 13: Listagem de tipos de pagamento retorna apenas ativos', () => {
    /**
     * Validates: Requirements 5.2
     *
     * For any set of payment types (mix of active/inactive),
     * listing returns only those with active=true.
     */
    it('for any mix of active/inactive payment types, listing returns only active ones', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
              active: fc.boolean(),
            }),
            { minLength: 1, maxLength: 20 },
          ),
          async (paymentTypeDefs) => {
            // Arrange — create payment types with unique names
            const repository = new InMemoryPaymentTypeRepository();
            const useCase = new ListActivePaymentTypesUseCase(repository);

            const uniqueNames = new Set<string>();
            let expectedActiveCount = 0;

            for (let i = 0; i < paymentTypeDefs.length; i++) {
              const def = paymentTypeDefs[i]!;
              const uniqueName = `${def.name}_${i}`;
              if (uniqueNames.has(uniqueName)) continue;
              uniqueNames.add(uniqueName);

              const pt = PaymentTypeEntity.create({ name: uniqueName });
              if (!def.active) {
                pt.deactivate();
              }

              const id = uuidv4();
              repository.addWithId(pt, id);

              if (def.active) {
                expectedActiveCount++;
              }
            }

            // Act
            const result = await useCase.execute();

            // Assert — only active payment types are returned
            expect(result.length).toBe(expectedActiveCount);
            result.forEach((item) => {
              expect(item.active).toBe(true);
            });
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('Property 14: Validação de pagamento na confirmação do pedido', () => {
    /**
     * Validates: Requirements 5.4, 5.5
     *
     * For any order with inactive payment type OR value outside [min,max],
     * confirmation is rejected with BusinessRuleException.
     */

    it('when payment type is inactive, validation throws BusinessRuleException', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.double({ min: 0.01, max: 999999.99, noNaN: true }),
          async (orderValue) => {
            // Arrange — create an inactive payment type
            const repository = new InMemoryPaymentTypeRepository();
            const useCase = new ValidatePaymentForOrderUseCase(repository);

            const pt = PaymentTypeEntity.create({ name: 'Inactive Type' });
            pt.deactivate();
            const id = uuidv4();
            repository.addWithId(pt, id);

            // Act & Assert
            await expect(
              useCase.execute({ paymentTypeId: id, orderValue }),
            ).rejects.toThrow(BusinessRuleException);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('when order value is outside acceptance range, validation throws BusinessRuleException', async () => {
      await fc.assert(
        fc.asyncProperty(
          validMinMaxArb,
          fc.double({ min: 0.01, max: 999999999.99, noNaN: true }),
          async ({ min, max }, rawOrderValue) => {
            // Generate order value guaranteed to be outside [min, max]
            // Either below min or above max
            const outsideBelow = min - Math.abs(rawOrderValue) - 0.01;
            const outsideAbove = max + Math.abs(rawOrderValue) + 0.01;
            const orderValue = rawOrderValue % 2 === 0 ? outsideBelow : outsideAbove;

            // Skip if orderValue would be <= 0 (not a valid order value scenario)
            if (orderValue <= 0) return;

            // Arrange — create active payment type with acceptance rule
            const repository = new InMemoryPaymentTypeRepository();
            const useCase = new ValidatePaymentForOrderUseCase(repository);

            const pt = PaymentTypeEntity.create({ name: 'Active With Rules' });
            const rule = AcceptanceRule.create(min, max);
            pt.addRule(rule);
            const id = uuidv4();
            repository.addWithId(pt, id);

            // Act & Assert — value outside range should be rejected
            await expect(
              useCase.execute({ paymentTypeId: id, orderValue }),
            ).rejects.toThrow(BusinessRuleException);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('Property 15: Invariante min ≤ max em regras de aceitação', () => {
    /**
     * Validates: Requirements 5.6
     *
     * For any pair (min, max) where min > max, rule creation is rejected
     * with ValidationException.
     */
    it('when min > max, AcceptanceRule.create() throws ValidationException', () => {
      fc.assert(
        fc.property(
          fc
            .tuple(
              fc.double({ min: 0.01, max: 999999999.99, noNaN: true }),
              fc.double({ min: 0.01, max: 999999999.99, noNaN: true }),
            )
            .filter(([a, b]) => a > b),
          ([minValue, maxValue]) => {
            // Act & Assert — min > max should be rejected
            expect(() => AcceptanceRule.create(minValue, maxValue)).toThrow(
              ValidationException,
            );
          },
        ),
        { numRuns: 100 },
      );
    });

    it('when min > max, AddAcceptanceRuleUseCase also rejects with ValidationException', async () => {
      const { AddAcceptanceRuleUseCase } = await import(
        '@modules/payment-type/application/use-cases/add-acceptance-rule.use-case'
      );

      await fc.assert(
        fc.asyncProperty(
          fc
            .tuple(
              fc.double({ min: 0.01, max: 999999999.99, noNaN: true }),
              fc.double({ min: 0.01, max: 999999999.99, noNaN: true }),
            )
            .filter(([a, b]) => a > b),
          async ([minValue, maxValue]) => {
            // Arrange — create a valid payment type first
            const repository = new InMemoryPaymentTypeRepository();
            const useCase = new AddAcceptanceRuleUseCase(repository);

            const pt = PaymentTypeEntity.create({ name: 'Test Type' });
            const id = uuidv4();
            repository.addWithId(pt, id);

            // Act & Assert — min > max at use case level should also be rejected
            await expect(
              useCase.execute({ paymentTypeId: id, minValue, maxValue }),
            ).rejects.toThrow(ValidationException);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
