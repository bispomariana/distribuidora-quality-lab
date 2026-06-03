import { UpdateCustomerUseCase } from '@modules/customer/application/use-cases/update-customer.use-case';
import { CustomerRepository } from '@modules/customer/domain/repositories/customer.repository';
import { CustomerEntity } from '@modules/customer/domain/entities/customer.entity';
import { NotFoundException, ConflictException } from '@shared/domain/exceptions';
import { LoggerService } from '@shared/infrastructure/logging/logger.service';

describe('UpdateCustomerUseCase', () => {
  let useCase: UpdateCustomerUseCase;
  let customerRepository: jest.Mocked<CustomerRepository>;
  let logger: jest.Mocked<LoggerService>;
  let saveSpy: jest.SpyInstance;
  let findByIdSpy: jest.SpyInstance;
  let findByEmailSpy: jest.SpyInstance;

  const createMockCustomer = (overrides: Partial<Record<string, unknown>> = {}) => {
    const customer = CustomerEntity.create({
      name: 'Cliente Existente',
      document: '52998224725',
      email: 'existente@email.com',
      phone: '71999998888',
    });
    Object.assign(customer, { _id: 'customer-uuid-001', ...overrides });
    return customer;
  };

  beforeEach(() => {
    customerRepository = {
      save: jest.fn().mockResolvedValue(createMockCustomer()),
      findById: jest.fn().mockResolvedValue(createMockCustomer()),
      findByEmail: jest.fn().mockResolvedValue(null),
      findAll: jest.fn().mockResolvedValue([]),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    logger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
      logRequest: jest.fn(),
    } as unknown as jest.Mocked<LoggerService>;

    saveSpy = jest.spyOn(customerRepository, 'save');
    findByIdSpy = jest.spyOn(customerRepository, 'findById');
    findByEmailSpy = jest.spyOn(customerRepository, 'findByEmail');

    useCase = new UpdateCustomerUseCase(customerRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should call findById with the correct customer ID', async () => {
      await useCase.execute('customer-uuid-001', { name: 'Novo Nome' });

      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(findByIdSpy).toHaveBeenCalledWith('customer-uuid-001');
    });

    it('should call findByEmail when email is being changed', async () => {
      await useCase.execute('customer-uuid-001', {
        email: 'novo@email.com',
      });

      expect(findByEmailSpy).toHaveBeenCalledTimes(1);
      expect(findByEmailSpy).toHaveBeenCalledWith('novo@email.com');
    });

    it('should not call findByEmail when email is not being changed', async () => {
      await useCase.execute('customer-uuid-001', { name: 'Apenas Nome' });

      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(findByEmailSpy).not.toHaveBeenCalled();
      expect(saveSpy).toHaveBeenCalledTimes(1);
    });

    it('should call save after findById and email validation', async () => {
      const callOrder: string[] = [];
      customerRepository.findById.mockImplementation(async () => {
        callOrder.push('findById');
        return createMockCustomer();
      });
      customerRepository.findByEmail.mockImplementation(async () => {
        callOrder.push('findByEmail');
        return null;
      });
      customerRepository.save.mockImplementation(async (entity) => {
        callOrder.push('save');
        return entity;
      });

      await useCase.execute('customer-uuid-001', { email: 'novo@email.com' });

      expect(callOrder).toEqual(['findById', 'findByEmail', 'save']);
    });

    it('should not call save when customer is not found', async () => {
      customerRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute('non-existent', { name: 'Teste' }),
      ).rejects.toThrow(NotFoundException);

      expect(findByIdSpy).toHaveBeenCalledWith('non-existent');
      expect(saveSpy).not.toHaveBeenCalled();
      expect(findByEmailSpy).not.toHaveBeenCalled();
    });

    it('should not call save when email conflicts', async () => {
      customerRepository.findByEmail.mockResolvedValue(createMockCustomer({
        _id: 'other-customer',
        _email: 'conflito@email.com',
      }));

      await expect(
        useCase.execute('customer-uuid-001', { email: 'conflito@email.com' }),
      ).rejects.toThrow(ConflictException);

      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(findByEmailSpy).toHaveBeenCalledTimes(1);
      expect(saveSpy).not.toHaveBeenCalled();
    });

    it('should not call delete or findAll during update', async () => {
      await useCase.execute('customer-uuid-001', { name: 'Atualizado' });

      expect(customerRepository.delete).not.toHaveBeenCalled();
      expect(customerRepository.findAll).not.toHaveBeenCalled();
    });
  });
});
