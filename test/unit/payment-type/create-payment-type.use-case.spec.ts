import { CreatePaymentTypeUseCase } from '@modules/payment-type/application/use-cases/create-payment-type.use-case';
import { ValidationException } from '@shared/domain/exceptions';

describe('CreatePaymentTypeUseCase', () => {
  let useCase: CreatePaymentTypeUseCase;
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

    useCase = new CreatePaymentTypeUseCase(paymentTypeRepository as any);
  });

  describe('execute', () => {
    it('when valid name is provided, then creates payment type as active', async () => {
      paymentTypeRepository.save.mockImplementation((entity) => {
        Object.defineProperty(entity, '_id', { value: 'pt-uuid', writable: true });
        Object.defineProperty(entity, '_createdAt', { value: new Date('2024-01-15'), writable: true });
        return Promise.resolve(entity);
      });

      const result = await useCase.execute({
        name: 'Credit Card',
        description: 'Visa/Mastercard payments',
      });

      expect(result.name).toBe('Credit Card');
      expect(result.description).toBe('Visa/Mastercard payments');
      expect(result.active).toBe(true);
    });

    it('when name is empty, then throws ValidationException', async () => {
      await expect(
        useCase.execute({ name: '' }),
      ).rejects.toThrow(ValidationException);
    });

    it('when name exceeds 100 characters, then throws ValidationException', async () => {
      const longName = 'A'.repeat(101);

      await expect(
        useCase.execute({ name: longName }),
      ).rejects.toThrow(ValidationException);
    });

    it('when description exceeds 500 characters, then throws ValidationException', async () => {
      const longDescription = 'B'.repeat(501);

      await expect(
        useCase.execute({ name: 'Valid Name', description: longDescription }),
      ).rejects.toThrow(ValidationException);
    });

    it('when no description is provided, then creates with empty description', async () => {
      paymentTypeRepository.save.mockImplementation((entity) => {
        Object.defineProperty(entity, '_id', { value: 'pt-uuid', writable: true });
        Object.defineProperty(entity, '_createdAt', { value: new Date('2024-01-15'), writable: true });
        return Promise.resolve(entity);
      });

      const result = await useCase.execute({ name: 'PIX' });

      expect(result.name).toBe('PIX');
      expect(result.description).toBe('');
    });
  });
});
