import { DeleteCustomerUseCase } from '@modules/customer/application/use-cases/delete-customer.use-case';
import { CustomerRepository } from '@modules/customer/domain/repositories/customer.repository';
import { CustomerEntity } from '@modules/customer/domain/entities/customer.entity';
import { NotFoundException } from '@shared/domain/exceptions';
import { LoggerService } from '@shared/infrastructure/logging/logger.service';

describe('DeleteCustomerUseCase', () => {
  let useCase: DeleteCustomerUseCase;
  let customerRepository: jest.Mocked<CustomerRepository>;
  let logger: jest.Mocked<LoggerService>;
  let deleteSpy: jest.SpyInstance;
  let findByIdSpy: jest.SpyInstance;
  let findByEmailSpy: jest.SpyInstance;

  const createMockCustomer = () => {
    const customer = CustomerEntity.create({
      name: 'Cliente Para Remover',
      document: '52998224725',
      email: 'remover@email.com',
      phone: '71999991111',
    });
    Object.assign(customer, { _id: 'customer-delete-uuid' });
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

    deleteSpy = jest.spyOn(customerRepository, 'delete');
    findByIdSpy = jest.spyOn(customerRepository, 'findById');
    findByEmailSpy = jest.spyOn(customerRepository, 'findByEmail');

    useCase = new DeleteCustomerUseCase(customerRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should call findById with the correct customer ID', async () => {
      await useCase.execute('customer-delete-uuid');

      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(findByIdSpy).toHaveBeenCalledWith('customer-delete-uuid');
    });

    it('should call repository.delete with the correct ID', async () => {
      await useCase.execute('customer-delete-uuid');

      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledWith('customer-delete-uuid');
    });

    it('should call findById and delete in correct order', async () => {
      const callOrder: string[] = [];
      customerRepository.findById.mockImplementation(async () => {
        callOrder.push('findById');
        return createMockCustomer();
      });
      customerRepository.delete.mockImplementation(async () => {
        callOrder.push('delete');
      });

      await useCase.execute('customer-delete-uuid');

      expect(callOrder).toEqual(['findById', 'delete']);
      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledTimes(1);
    });

    it('should not call save, findByEmail or findAll during delete', async () => {
      await useCase.execute('customer-delete-uuid');

      expect(customerRepository.save).not.toHaveBeenCalled();
      expect(findByEmailSpy).not.toHaveBeenCalled();
      expect(customerRepository.findAll).not.toHaveBeenCalled();
    });

    it('should not call delete when customer is not found', async () => {
      customerRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute('non-existent-customer'),
      ).rejects.toThrow(NotFoundException);

      expect(findByIdSpy).toHaveBeenCalledWith('non-existent-customer');
      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('should call delete exactly once for valid customer', async () => {
      await useCase.execute('customer-delete-uuid');

      expect(customerRepository.delete).toHaveBeenCalledTimes(1);
      expect(customerRepository.findById).toHaveBeenCalledTimes(1);
      expect(customerRepository.save).toHaveBeenCalledTimes(0);
      expect(customerRepository.findByEmail).toHaveBeenCalledTimes(0);
      expect(customerRepository.findAll).toHaveBeenCalledTimes(0);
    });
  });
});
