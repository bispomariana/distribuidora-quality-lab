import { DeleteProductUseCase } from '@modules/product/application/use-cases/delete-product.use-case';
import { ProductRepository } from '@modules/product/domain/repositories/product.repository';
import { Product } from '@modules/product/domain/aggregates/product.aggregate';
import { NotFoundException } from '@shared/domain/exceptions';
import { LoggerService } from '@shared/infrastructure/logging/logger.service';

describe('DeleteProductUseCase', () => {
  let useCase: DeleteProductUseCase;
  let productRepository: jest.Mocked<ProductRepository>;
  let logger: jest.Mocked<LoggerService>;
  let deleteSpy: jest.SpyInstance;
  let findByIdSpy: jest.SpyInstance;

  const createMockProduct = () => {
    const product = Product.create({
      name: 'Produto Para Deletar',
      description: 'Será removido',
      unitPrice: 10.0,
      category: 'Limpeza',
    });
    product.assignId('delete-uuid-456');
    return product;
  };

  beforeEach(() => {
    productRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn().mockResolvedValue(createMockProduct()),
      delete: jest.fn().mockResolvedValue(undefined),
      findAll: jest.fn().mockResolvedValue([]),
    };

    logger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
      logRequest: jest.fn(),
    } as unknown as jest.Mocked<LoggerService>;

    deleteSpy = jest.spyOn(productRepository, 'delete');
    findByIdSpy = jest.spyOn(productRepository, 'findById');

    useCase = new DeleteProductUseCase(productRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should call findById with the correct ID before deleting', async () => {
      await useCase.execute('delete-uuid-456');

      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(findByIdSpy).toHaveBeenCalledWith('delete-uuid-456');
    });

    it('should call repository.delete with the correct ID', async () => {
      await useCase.execute('delete-uuid-456');

      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledWith('delete-uuid-456');
    });

    it('should call findById and delete in sequence', async () => {
      const callOrder: string[] = [];
      productRepository.findById.mockImplementation(async () => {
        callOrder.push('findById');
        return createMockProduct();
      });
      productRepository.delete.mockImplementation(async () => {
        callOrder.push('delete');
      });

      await useCase.execute('delete-uuid-456');

      expect(callOrder).toEqual(['findById', 'delete']);
      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledTimes(1);
    });

    it('should not call save during delete operation', async () => {
      await useCase.execute('delete-uuid-456');

      expect(productRepository.save).not.toHaveBeenCalled();
      expect(productRepository.findAll).not.toHaveBeenCalled();
      expect(deleteSpy).toHaveBeenCalledTimes(1);
    });

    it('should not call delete when product is not found', async () => {
      productRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );

      expect(findByIdSpy).toHaveBeenCalledWith('non-existent-id');
      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('should call delete exactly once even for valid product', async () => {
      await useCase.execute('delete-uuid-456');

      expect(productRepository.delete).toHaveBeenCalledTimes(1);
      expect(productRepository.findById).toHaveBeenCalledTimes(1);
      expect(productRepository.save).toHaveBeenCalledTimes(0);
      expect(productRepository.findAll).toHaveBeenCalledTimes(0);
    });
  });
});
