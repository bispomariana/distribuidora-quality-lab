import { UpdateProductUseCase } from '@modules/product/application/use-cases/update-product.use-case';
import { ProductRepository } from '@modules/product/domain/repositories/product.repository';
import { Product } from '@modules/product/domain/aggregates/product.aggregate';
import { NotFoundException } from '@shared/domain/exceptions';

describe('UpdateProductUseCase', () => {
  let useCase: UpdateProductUseCase;
  let productRepository: jest.Mocked<ProductRepository>;
  let saveSpy: jest.SpyInstance;
  let findByIdSpy: jest.SpyInstance;

  const createMockProduct = () => {
    const product = Product.create({
      name: 'Produto Existente',
      description: 'DescriÃ§Ã£o do produto',
      unitPrice: 15.0,
      category: 'Categoria A',
    });
    product.assignId('product-uuid-123');
    return product;
  };

  beforeEach(() => {
    productRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn().mockResolvedValue(createMockProduct()),
      delete: jest.fn().mockResolvedValue(undefined),
      findAll: jest.fn().mockResolvedValue([]),
    };

    saveSpy = jest.spyOn(productRepository, 'save');
    findByIdSpy = jest.spyOn(productRepository, 'findById');

    useCase = new UpdateProductUseCase(productRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should call findById with the correct product ID', async () => {
      const productId = 'product-uuid-123';

      await useCase.execute(productId, { name: 'Novo Nome' });

      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(findByIdSpy).toHaveBeenCalledWith('product-uuid-123');
    });

    it('should call repository.save after finding the product', async () => {
      await useCase.execute('product-uuid-123', { name: 'Produto Atualizado' });

      expect(productRepository.findById).toHaveBeenCalledTimes(1);
      expect(productRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should call save with the updated product aggregate', async () => {
      await useCase.execute('product-uuid-123', {
        name: 'Cerveja Premium',
        unitPrice: 12.99,
      });

      expect(saveSpy).toHaveBeenCalledTimes(1);
      expect(productRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          _name: 'Cerveja Premium',
          _unitPrice: 12.99,
        }),
      );
    });

    it('should not call delete during update operation', async () => {
      await useCase.execute('product-uuid-123', { category: 'Bebidas Premium' });

      expect(productRepository.delete).not.toHaveBeenCalled();
      expect(productRepository.findAll).not.toHaveBeenCalled();
      expect(saveSpy).toHaveBeenCalledTimes(1);
    });

    it('should call findById before save in correct order', async () => {
      const callOrder: string[] = [];
      productRepository.findById.mockImplementation(async () => {
        callOrder.push('findById');
        return createMockProduct();
      });
      productRepository.save.mockImplementation(async () => {
        callOrder.push('save');
      });

      await useCase.execute('product-uuid-123', { name: 'Novo' });

      expect(callOrder).toEqual(['findById', 'save']);
      expect(productRepository.findById).toHaveBeenCalledTimes(1);
      expect(productRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should not call save when product is not found', async () => {
      productRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('non-existent-id', { name: 'Teste' })).rejects.toThrow(
        NotFoundException,
      );

      expect(findByIdSpy).toHaveBeenCalledWith('non-existent-id');
      expect(saveSpy).not.toHaveBeenCalled();
    });
  });
});
