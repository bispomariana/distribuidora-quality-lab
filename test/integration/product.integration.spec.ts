import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from '@modules/product/interface/controllers/product.controller';
import { CreateProductUseCase } from '@modules/product/application/use-cases/create-product.use-case';
import { ListProductsUseCase } from '@modules/product/application/use-cases/list-products.use-case';
import { UpdateProductUseCase } from '@modules/product/application/use-cases/update-product.use-case';
import { DeleteProductUseCase } from '@modules/product/application/use-cases/delete-product.use-case';

describe('Product Integration', () => {
  let controller: ProductController;
  let createProductUseCase: CreateProductUseCase;
  let listProductsUseCase: ListProductsUseCase;
  let updateProductUseCase: UpdateProductUseCase;
  let deleteProductUseCase: DeleteProductUseCase;

  const mockProductRepository = {
    findById: jest.fn(),
    findAll: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        CreateProductUseCase,
        ListProductsUseCase,
        UpdateProductUseCase,
        DeleteProductUseCase,
        {
          provide: 'ProductRepository',
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    createProductUseCase = module.get<CreateProductUseCase>(CreateProductUseCase);
    listProductsUseCase = module.get<ListProductsUseCase>(ListProductsUseCase);
    updateProductUseCase = module.get<UpdateProductUseCase>(UpdateProductUseCase);
    deleteProductUseCase = module.get<DeleteProductUseCase>(DeleteProductUseCase);

    jest.clearAllMocks();
  });

  describe('POST /products - Create product via API flow', () => {
    it('should create product via API flow and persist to database', async () => {
      const productData = {
        name: 'Integration Test Product',
        description: 'Created via integration test',
        unitPrice: 29.99,
        category: 'Electronics',
      };

      mockProductRepository.save.mockImplementation((product) =>
        Promise.resolve(product),
      );

      const result = await controller.create(productData as any);

      expect(result).toBeDefined();
      expect(result.name).toBe('Integration Test Product');
      expect(result.unitPrice).toBe(29.99);
      expect(result.category).toBe('Electronics');
      expect(mockProductRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should persist product and return resource with available flag set to true', async () => {
      const productData = {
        name: 'Persisted Product',
        description: 'Should be saved to database',
        unitPrice: 49.99,
        category: 'Hardware',
      };

      mockProductRepository.save.mockImplementation((product) =>
        Promise.resolve(product),
      );

      const result = await controller.create(productData as any);

      expect(result.available).toBe(true);
      expect(result.name).toBe('Persisted Product');
      expect(result.category).toBe('Hardware');
    });
  });

  describe('GET /products - List products via API flow', () => {
    it('should retrieve all products from database via API', async () => {
      const mockProducts = [
        {
          id: 'uuid-1',
          name: 'Product A',
          description: 'Desc A',
          unitPrice: 10.0,
          category: 'Cat A',
          available: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'uuid-2',
          name: 'Product B',
          description: 'Desc B',
          unitPrice: 20.0,
          category: 'Cat B',
          available: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockProductRepository.findAll.mockResolvedValue(mockProducts);

      const result = await controller.findAll();

      expect(result).toHaveLength(2);
      expect(mockProductRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no products exist in database', async () => {
      mockProductRepository.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('GET /products/:id - Get product by ID via API flow', () => {
    it('should retrieve specific product from database by UUID', async () => {
      const mockProduct = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Specific Product',
        description: 'Found by ID',
        unitPrice: 99.99,
        category: 'Premium',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProductRepository.findById.mockResolvedValue(mockProduct);

      const result = await controller.findOne(
        '550e8400-e29b-41d4-a716-446655440000',
      );

      expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(result.name).toBe('Specific Product');
    });
  });

  describe('PATCH /products/:id - Update product via API flow', () => {
    it('should update product in database and return updated resource', async () => {
      const mockProduct = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Old Name',
        description: 'Old desc',
        unitPrice: 10.0,
        category: 'Old Category',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        update: jest.fn().mockImplementation(function (this: any, props: any) {
          if (props.name) this.name = props.name;
        }),
      };

      mockProductRepository.findById.mockResolvedValue(mockProduct);
      mockProductRepository.save.mockResolvedValue(undefined);

      const result = await controller.update(
        '550e8400-e29b-41d4-a716-446655440000',
        { name: 'Updated Name' } as any,
      );

      expect(result).toBeDefined();
      expect(result.name).toBe('Updated Name');
    });
  });

  describe('DELETE /products/:id - Delete product via API flow', () => {
    it('should remove product from database permanently', async () => {
      mockProductRepository.findById.mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
      });
      mockProductRepository.delete.mockResolvedValue(undefined);

      await expect(
        controller.remove('550e8400-e29b-41d4-a716-446655440000'),
      ).resolves.not.toThrow();

      expect(mockProductRepository.delete).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
      );
    });
  });
});
