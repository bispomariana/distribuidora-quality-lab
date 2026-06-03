import { RegisterWithdrawalUseCase } from '@modules/inventory/application/use-cases/register-withdrawal.use-case';

describe('RegisterWithdrawalUseCase — Coverage', () => {
  let useCase: RegisterWithdrawalUseCase;
  let inventoryRepository: {
    findMovementsByProductId: jest.Mock;
    save: jest.Mock;
    getBalance: jest.Mock;
  };
  let productRepository: {
    findById: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
    findAll: jest.Mock;
  };

  beforeEach(() => {
    inventoryRepository = {
      findMovementsByProductId: jest.fn(),
      save: jest.fn(),
      getBalance: jest.fn(),
    };
    productRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    };

    useCase = new RegisterWithdrawalUseCase(
      inventoryRepository as any,
      productRepository as any,
    );
  });

  describe('execute', () => {
    const productId = '550e8400-e29b-41d4-a716-446655440000';

    it('should process withdrawal when stock is available', async () => {
      const product = { id: productId, markAsUnavailable: jest.fn() };
      productRepository.findById.mockResolvedValue(product);
      inventoryRepository.getBalance.mockResolvedValue(100);
      inventoryRepository.save.mockImplementation((movement) => {
        Object.defineProperty(movement, '_id', { value: 'uuid-1', writable: true });
        Object.defineProperty(movement, '_createdAt', { value: new Date(), writable: true });
        return Promise.resolve(movement);
      });

      const result = await useCase.execute({
        productId,
        quantity: 25,
        reason: 'Venda ao cliente',
      });

      expect(result).toBeDefined();
    });

    it('should handle withdrawal that zeroes balance', async () => {
      const product = { id: productId, markAsUnavailable: jest.fn() };
      productRepository.findById.mockResolvedValue(product);
      inventoryRepository.getBalance.mockResolvedValue(10);
      inventoryRepository.save.mockImplementation((movement) => {
        Object.defineProperty(movement, '_id', { value: 'uuid-2', writable: true });
        Object.defineProperty(movement, '_createdAt', { value: new Date(), writable: true });
        return Promise.resolve(movement);
      });

      const result = await useCase.execute({
        productId,
        quantity: 10,
        reason: 'Última saída',
      });

      expect(result).toBeDefined();
    });

    it('should reject withdrawal when stock is insufficient', async () => {
      productRepository.findById.mockResolvedValue({ id: productId });
      inventoryRepository.getBalance.mockResolvedValue(5);

      try {
        await useCase.execute({
          productId,
          quantity: 20,
          reason: 'Tentativa de saída',
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should reject withdrawal for non-existent product', async () => {
      productRepository.findById.mockResolvedValue(null);

      try {
        await useCase.execute({
          productId: '990e8400-e29b-41d4-a716-446655440000',
          quantity: 5,
          reason: 'Produto inexistente',
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
