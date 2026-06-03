import { ValidatePaymentForOrderUseCase } from '@modules/payment-type/application/use-cases/validate-payment-for-order.use-case';
import { AcceptanceRule } from '@modules/payment-type/domain/value-objects/acceptance-rule.vo';
import {
  NotFoundException,
  BusinessRuleException,
} from '@shared/domain/exceptions';

describe('ValidatePaymentForOrderUseCase', () => {
  let useCase: ValidatePaymentForOrderUseCase;
  let paymentTypeRepository: {
    findById: jest.Mock;
    findByName: jest.Mock;
    findAll: jest.Mock;
    findAllActive: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(() => {
    paymentTypeRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn(),
      findAllActive: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new ValidatePaymentForOrderUseCase(paymentTypeRepository as any);
  });

  const paymentTypeId = '550e8400-e29b-41d4-a716-446655440000';

  function createActivePaymentType(rules: AcceptanceRule[] = []): any {
    return {
      id: paymentTypeId,
      name: 'Credit Card',
      active: true,
      rules,
    };
  }

  describe('execute', () => {
    it('when payment type is active and value is within rule range, then returns valid', async () => {
      const rule = AcceptanceRule.create(10.0, 1000.0);
      const paymentType = createActivePaymentType([rule]);
      paymentTypeRepository.findById.mockResolvedValue(paymentType);

      const result = await useCase.execute({
        paymentTypeId,
        orderValue: 500.0,
      });

      expect(result.valid).toBe(true);
      expect(result.paymentTypeName).toBe('Credit Card');
    });

    it('when payment type is active and has no rules, then returns valid', async () => {
      const paymentType = createActivePaymentType([]);
      paymentTypeRepository.findById.mockResolvedValue(paymentType);

      const result = await useCase.execute({
        paymentTypeId,
        orderValue: 9999.0,
      });

      expect(result.valid).toBe(true);
    });

    it('when payment type does not exist, then throws NotFoundException', async () => {
      paymentTypeRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute({ paymentTypeId, orderValue: 100.0 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('when payment type is inactive, then throws BusinessRuleException', async () => {
      const paymentType = {
        id: paymentTypeId,
        name: 'Debit',
        active: false,
        rules: [],
      };
      paymentTypeRepository.findById.mockResolvedValue(paymentType);

      await expect(
        useCase.execute({ paymentTypeId, orderValue: 100.0 }),
      ).rejects.toThrow(BusinessRuleException);
    });

    it('when order value is outside all acceptance rules, then throws BusinessRuleException', async () => {
      const rule = AcceptanceRule.create(100.0, 500.0);
      const paymentType = createActivePaymentType([rule]);
      paymentTypeRepository.findById.mockResolvedValue(paymentType);

      await expect(
        useCase.execute({ paymentTypeId, orderValue: 50.0 }),
      ).rejects.toThrow(BusinessRuleException);
    });
  });
});
