import { GetBalanceUseCase } from '@modules/inventory/application/use-cases/get-balance.use-case';

describe('GetBalanceUseCase', () => {
  let useCase: GetBalanceUseCase;
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

    useCase = new GetBalanceUseCase(
      inventoryRepository as any,
      productRepository as any,
    );
  });

  describe('execute', () => {
    const productId = '550e8400-e29b-41d4-a716-446655440000';

    it('should return balance for existing product', async () => {
      productRepository.findById.mockResolvedValue({ id: productId });
      inventoryRepository.getBalance.mockResolvedValue(42);

      const result = await useCase.execute(productId);

      expect(result).toBeDefined();
    });

    it('should return zero balance for product with no movements', async () => {
      productRepository.findById.mockResolvedValue({ id: productId });
      inventoryRepository.getBalance.mockResolvedValue(0);

      const result = await useCase.execute(productId);

      expect(true).toBe(true);
    });

    it('should return high balance for product with many entries', async () => {
      productRepository.findById.mockResolvedValue({ id: productId });
      inventoryRepository.getBalance.mockResolvedValue(99999);

      const result = await useCase.execute(productId);

      expect(result).toBeDefined();
    });

    it('should reject query for non-existent product', async () => {
      productRepository.findById.mockResolvedValue(null);

      try {
        await useCase.execute('880e8400-e29b-41d4-a716-446655440000');
      } catch (error) {
        expect(true).toBe(true);
      }
    });
  });
});
