import { CreateProductUseCase } from '@modules/product/application/use-cases/create-product.use-case';
import { ProductRepository } from '@modules/product/domain/repositories/product.repository';
import { LoggerService } from '@shared/infrastructure/logging/logger.service';

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;
  let productRepository: jest.Mocked<ProductRepository>;
  let logger: jest.Mocked<LoggerService>;
  let saveSpy: jest.SpyInstance;
  let findByIdSpy: jest.SpyInstance;

  beforeEach(() => {
    productRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn().mockResolvedValue(null),
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

    saveSpy = jest.spyOn(productRepository, 'save');
    findByIdSpy = jest.spyOn(productRepository, 'findById');

    useCase = new CreateProductUseCase(productRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should call repository.save exactly once with the product aggregate', async () => {
      const input = {
        name: 'Cerveja Pilsen 600ml',
        description: 'Cerveja tipo pilsen garrafa',
        unitPrice: 8.99,
        category: 'Bebidas',
      };

      await useCase.execute(input);

      expect(saveSpy).toHaveBeenCalledTimes(1);
      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          _name: 'Cerveja Pilsen 600ml',
          _category: 'Bebidas',
        }),
      );
    });

    it('should call repository.save with correct unit price', async () => {
      const input = {
        name: 'Refrigerante Cola 2L',
        description: 'Refrigerante sabor cola',
        unitPrice: 7.5,
        category: 'Bebidas',
      };

      await useCase.execute(input);

      expect(saveSpy).toHaveBeenCalledTimes(1);
      expect(productRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          _unitPrice: 7.5,
        }),
      );
    });

    it('should call repository.save with available set to true', async () => {
      const input = {
        name: 'Arroz Tipo 1 5kg',
        unitPrice: 24.9,
        category: 'Grãos',
      };

      await useCase.execute(input);

      expect(productRepository.save).toHaveBeenCalledTimes(1);
      expect(productRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          _available: true,
        }),
      );
    });

    it('should not call findById during product creation', async () => {
      const input = {
        name: 'Feijão Preto 1kg',
        unitPrice: 9.99,
        category: 'Grãos',
      };

      await useCase.execute(input);

      expect(findByIdSpy).not.toHaveBeenCalled();
      expect(productRepository.findById).toHaveBeenCalledTimes(0);
    });

    it('should not call delete during product creation', async () => {
      const input = {
        name: 'Óleo de Soja 900ml',
        unitPrice: 6.49,
        category: 'Óleos',
      };

      await useCase.execute(input);

      expect(productRepository.delete).not.toHaveBeenCalled();
      expect(productRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should call save with empty description when not provided', async () => {
      const input = {
        name: 'Sal Refinado 1kg',
        unitPrice: 3.29,
        category: 'Temperos',
      };

      await useCase.execute(input);

      expect(productRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          _description: '',
        }),
      );
      expect(saveSpy).toHaveBeenCalledTimes(1);
    });
  });
});
