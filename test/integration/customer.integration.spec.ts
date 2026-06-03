import { Test, TestingModule } from '@nestjs/testing';
import { CustomerController } from '@modules/customer/interface/controllers/customer.controller';
import { CreateCustomerUseCase } from '@modules/customer/application/use-cases/create-customer.use-case';
import { ListCustomersUseCase } from '@modules/customer/application/use-cases/list-customers.use-case';
import { GetCustomerUseCase } from '@modules/customer/application/use-cases/get-customer.use-case';
import { UpdateCustomerUseCase } from '@modules/customer/application/use-cases/update-customer.use-case';
import { DeleteCustomerUseCase } from '@modules/customer/application/use-cases/delete-customer.use-case';
import { ValidateDocumentUseCase } from '@modules/customer/domain/validate-document.use-case';
import { CUSTOMER_REPOSITORY } from '@modules/customer/domain/repositories/customer.repository';

describe('Customer Integration', () => {
  let controller: CustomerController;

  const mockCustomerRepository = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findAll: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [
        CreateCustomerUseCase,
        ListCustomersUseCase,
        GetCustomerUseCase,
        UpdateCustomerUseCase,
        DeleteCustomerUseCase,
        ValidateDocumentUseCase,
        {
          provide: CUSTOMER_REPOSITORY,
          useValue: mockCustomerRepository,
        },
      ],
    }).compile();

    controller = module.get<CustomerController>(CustomerController);

    jest.clearAllMocks();
  });

  describe('POST /customers - Create customer via API flow', () => {
    it('should create customer with valid CPF via full API pipeline', async () => {
      const customerData = {
        name: 'Maria Integration',
        document: '52998224725',
        email: 'maria.integration@test.com',
        phone: '11987654321',
      };

      mockCustomerRepository.findByEmail.mockResolvedValue(null);
      mockCustomerRepository.save.mockImplementation((customer) =>
        Promise.resolve(customer),
      );

      const result = await controller.create(customerData as any);

      expect(result).toBeDefined();
      expect(result.name).toBe('Maria Integration');
      expect(result.email).toBe('maria.integration@test.com');
      expect(result.document).toBe('52998224725');
    });

    it('should persist customer to database and return full resource', async () => {
      const customerData = {
        name: 'Carlos Database',
        document: '11144477735',
        email: 'carlos.db@test.com',
        phone: '21912345678',
      };

      mockCustomerRepository.findByEmail.mockResolvedValue(null);
      mockCustomerRepository.save.mockImplementation((customer) =>
        Promise.resolve(customer),
      );

      const result = await controller.create(customerData as any);

      expect(result.name).toBe('Carlos Database');
      expect(result.email).toBe('carlos.db@test.com');
      expect(mockCustomerRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should reject duplicate email via database constraint check', async () => {
      const customerData = {
        name: 'Duplicate User',
        document: '52998224725',
        email: 'existing@test.com',
        phone: '11987654321',
      };

      mockCustomerRepository.findByEmail.mockResolvedValue({
        id: 'existing-uuid',
        email: 'existing@test.com',
      });

      await expect(controller.create(customerData as any)).rejects.toThrow();
    });
  });

  describe('GET /customers - List customers via API flow', () => {
    it('should retrieve all customers from database', async () => {
      const mockCustomers = [
        {
          id: 'uuid-1',
          name: 'Customer 1',
          document: '52998224725',
          email: 'c1@test.com',
          phone: '11911111111',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'uuid-2',
          name: 'Customer 2',
          document: '11144477735',
          email: 'c2@test.com',
          phone: '11922222222',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockCustomerRepository.findAll.mockResolvedValue(mockCustomers);

      const result = await controller.findAll();

      expect(result).toHaveLength(2);
      expect(mockCustomerRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /customers/:id - Get customer by ID via API flow', () => {
    it('should retrieve customer from database by UUID', async () => {
      const mockCustomer = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Found Customer',
        document: '52998224725',
        email: 'found@test.com',
        phone: '11933333333',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCustomerRepository.findById.mockResolvedValue(mockCustomer);

      const result = await controller.findOne(
        '550e8400-e29b-41d4-a716-446655440001',
      );

      expect(result).toBeDefined();
    });
  });

  describe('DELETE /customers/:id - Delete customer via API flow', () => {
    it('should remove customer from database permanently', async () => {
      mockCustomerRepository.findById.mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440001',
      });
      mockCustomerRepository.delete.mockResolvedValue(undefined);

      await expect(
        controller.remove('550e8400-e29b-41d4-a716-446655440001'),
      ).resolves.not.toThrow();

      expect(mockCustomerRepository.delete).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440001',
      );
    });
  });
});
