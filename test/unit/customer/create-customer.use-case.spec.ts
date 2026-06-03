import { CreateCustomerUseCase } from '@modules/customer/application/use-cases/create-customer.use-case';
import { CustomerRepository } from '@modules/customer/domain/repositories/customer.repository';
import { ValidateDocumentUseCase } from '@modules/customer/domain/validate-document.use-case';
import { CustomerEntity } from '@modules/customer/domain/entities/customer.entity';
import { LoggerService } from '@shared/infrastructure/logging/logger.service';
import { ConflictException } from '@shared/domain/exceptions';

describe('CreateCustomerUseCase', () => {
  let useCase: CreateCustomerUseCase;
  let customerRepository: jest.Mocked<CustomerRepository>;
  let validateDocumentUseCase: jest.Mocked<ValidateDocumentUseCase>;
  let logger: jest.Mocked<LoggerService>;
  let saveSpy: jest.SpyInstance;
  let findByEmailSpy: jest.SpyInstance;
  let validateSpy: jest.SpyInstance;

  const createMockCustomer = () => {
    const customer = CustomerEntity.create({
      name: 'João Silva',
      document: '52998224725',
      email: 'joao@email.com',
      phone: '71999998888',
    });
    Object.assign(customer, { _id: 'customer-uuid-789' });
    return customer;
  };

  beforeEach(() => {
    customerRepository = {
      save: jest.fn().mockResolvedValue(createMockCustomer()),
      findById: jest.fn().mockResolvedValue(null),
      findByEmail: jest.fn().mockResolvedValue(null),
      findAll: jest.fn().mockResolvedValue([]),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    validateDocumentUseCase = {
      execute: jest.fn().mockReturnValue({
        valid: true,
        type: 'CPF',
        normalized: '52998224725',
      }),
    } as unknown as jest.Mocked<ValidateDocumentUseCase>;

    logger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
      logRequest: jest.fn(),
    } as unknown as jest.Mocked<LoggerService>;

    saveSpy = jest.spyOn(customerRepository, 'save');
    findByEmailSpy = jest.spyOn(customerRepository, 'findByEmail');
    validateSpy = jest.spyOn(validateDocumentUseCase, 'execute');

    useCase = new CreateCustomerUseCase(
      customerRepository,
      validateDocumentUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should call validateDocumentUseCase.execute with the document', async () => {
      const input = {
        name: 'Maria Oliveira',
        document: '52998224725',
        email: 'maria@email.com',
        phone: '71988887777',
      };

      await useCase.execute(input);

      expect(validateSpy).toHaveBeenCalledTimes(1);
      expect(validateSpy).toHaveBeenCalledWith({
        document: '52998224725',
      });
    });

    it('should call findByEmail to check for existing customer', async () => {
      const input = {
        name: 'Carlos Souza',
        document: '52998224725',
        email: 'carlos@email.com',
        phone: '71977776666',
      };

      await useCase.execute(input);

      expect(findByEmailSpy).toHaveBeenCalledTimes(1);
      expect(findByEmailSpy).toHaveBeenCalledWith('carlos@email.com');
    });

    it('should call repository.save after validation and email check', async () => {
      const input = {
        name: 'Ana Costa',
        document: '52998224725',
        email: 'ana@email.com',
        phone: '71966665555',
      };

      await useCase.execute(input);

      expect(validateDocumentUseCase.execute).toHaveBeenCalledTimes(1);
      expect(customerRepository.findByEmail).toHaveBeenCalledTimes(1);
      expect(saveSpy).toHaveBeenCalledTimes(1);
    });

    it('should call validate before findByEmail and save in correct order', async () => {
      const callOrder: string[] = [];
      validateDocumentUseCase.execute.mockImplementation(() => {
        callOrder.push('validate');
        return { valid: true, type: 'CPF' as const, normalized: '52998224725' };
      });
      customerRepository.findByEmail.mockImplementation(async () => {
        callOrder.push('findByEmail');
        return null;
      });
      customerRepository.save.mockImplementation(async (entity) => {
        callOrder.push('save');
        return entity;
      });

      const input = {
        name: 'Pedro Lima',
        document: '52998224725',
        email: 'pedro@email.com',
        phone: '71955554444',
      };

      await useCase.execute(input);

      expect(callOrder).toEqual(['validate', 'findByEmail', 'save']);
    });

    it('should not call save when email already exists', async () => {
      customerRepository.findByEmail.mockResolvedValue(createMockCustomer());

      const input = {
        name: 'Duplicado',
        document: '52998224725',
        email: 'joao@email.com',
        phone: '71944443333',
      };

      await expect(useCase.execute(input)).rejects.toThrow(ConflictException);

      expect(validateSpy).toHaveBeenCalledTimes(1);
      expect(findByEmailSpy).toHaveBeenCalledTimes(1);
      expect(saveSpy).not.toHaveBeenCalled();
    });

    it('should not call findById or delete during creation', async () => {
      const input = {
        name: 'Fernanda Reis',
        document: '52998224725',
        email: 'fernanda@email.com',
        phone: '71933332222',
      };

      await useCase.execute(input);

      expect(customerRepository.findById).not.toHaveBeenCalled();
      expect(customerRepository.delete).not.toHaveBeenCalled();
      expect(customerRepository.findAll).not.toHaveBeenCalled();
    });
  });
});
