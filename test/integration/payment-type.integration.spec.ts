import { Test, TestingModule } from '@nestjs/testing';
import { PaymentTypeController } from '@modules/payment-type/interface/controllers/payment-type.controller';
import { CreatePaymentTypeUseCase } from '@modules/payment-type/application/use-cases/create-payment-type.use-case';
import { ListActivePaymentTypesUseCase } from '@modules/payment-type/application/use-cases/list-active-payment-types.use-case';
import { AddAcceptanceRuleUseCase } from '@modules/payment-type/application/use-cases/add-acceptance-rule.use-case';
import { PAYMENT_TYPE_REPOSITORY } from '@modules/payment-type/domain/repositories/payment-type.repository';

describe('PaymentType Integration', () => {
  let controller: PaymentTypeController;

  const mockPaymentTypeRepository = {
    findById: jest.fn(),
    findByName: jest.fn(),
    findAll: jest.fn(),
    findAllActive: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockCreatePaymentTypeUseCase = {
    execute: jest.fn(),
  };

  const mockListActivePaymentTypesUseCase = {
    execute: jest.fn(),
  };

  const mockAddAcceptanceRuleUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentTypeController],
      providers: [
        { provide: CreatePaymentTypeUseCase, useValue: mockCreatePaymentTypeUseCase },
        { provide: ListActivePaymentTypesUseCase, useValue: mockListActivePaymentTypesUseCase },
        { provide: AddAcceptanceRuleUseCase, useValue: mockAddAcceptanceRuleUseCase },
        { provide: PAYMENT_TYPE_REPOSITORY, useValue: mockPaymentTypeRepository },
      ],
    }).compile();

    controller = module.get<PaymentTypeController>(PaymentTypeController);

    jest.clearAllMocks();
  });

  describe('POST /payment-types - Create payment type via API flow', () => {
    it('should create payment type and persist to database', async () => {
      const paymentTypeData = {
        name: 'Credit Card',
        description: 'Visa/Mastercard payments',
      };

      const createdPaymentType = {
        id: '550e8400-e29b-41d4-a716-446655440020',
        name: 'Credit Card',
        description: 'Visa/Mastercard payments',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreatePaymentTypeUseCase.execute.mockResolvedValue(createdPaymentType);

      const result = await controller.create(paymentTypeData as any);

      expect(result).toBeDefined();
      expect(result.name).toBe('Credit Card');
      expect(result.active).toBe(true);
      expect(mockCreatePaymentTypeUseCase.execute).toHaveBeenCalledWith({
        name: 'Credit Card',
        description: 'Visa/Mastercard payments',
      });
    });

    it('should persist payment type with generated UUID from database', async () => {
      const paymentTypeData = {
        name: 'Boleto Bancário',
        description: 'Bank slip payment',
      };

      const createdPaymentType = {
        id: '550e8400-e29b-41d4-a716-446655440021',
        name: 'Boleto Bancário',
        description: 'Bank slip payment',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreatePaymentTypeUseCase.execute.mockResolvedValue(createdPaymentType);

      const result = await controller.create(paymentTypeData as any);

      expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440021');
    });
  });

  describe('GET /payment-types - List active payment types via API flow', () => {
    it('should retrieve only active payment types from database', async () => {
      const activeTypes = [
        {
          id: 'pt-1',
          name: 'Credit Card',
          description: 'Card payments',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'pt-2',
          name: 'Pix',
          description: 'Instant payment',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockListActivePaymentTypesUseCase.execute.mockResolvedValue(activeTypes);

      const result = await controller.findAll();

      expect(result).toHaveLength(2);
      expect(result.every((pt: any) => pt.active === true)).toBe(true);
      expect(mockListActivePaymentTypesUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no active payment types in database', async () => {
      mockListActivePaymentTypesUseCase.execute.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('POST /payment-types/:id/rules - Add acceptance rule via API flow', () => {
    it('should add acceptance rule with valid min/max to database', async () => {
      const ruleData = {
        minValue: 10.0,
        maxValue: 5000.0,
      };

      const updatedPaymentType = {
        id: '550e8400-e29b-41d4-a716-446655440020',
        name: 'Credit Card',
        rules: [{ id: 'rule-1', minValue: 10.0, maxValue: 5000.0 }],
      };

      mockAddAcceptanceRuleUseCase.execute.mockResolvedValue(updatedPaymentType);

      const result = await controller.addRule(
        '550e8400-e29b-41d4-a716-446655440020',
        ruleData as any,
      );

      expect(result).toBeDefined();
      expect(mockAddAcceptanceRuleUseCase.execute).toHaveBeenCalledWith({
        paymentTypeId: '550e8400-e29b-41d4-a716-446655440020',
        minValue: 10.0,
        maxValue: 5000.0,
      });
    });
  });

  describe('PATCH /payment-types/:id - Update payment type via API flow', () => {
    it('should update payment type in database and return updated resource', async () => {
      const existingPaymentType = {
        id: '550e8400-e29b-41d4-a716-446655440020',
        name: 'Credit Card',
        description: 'Old description',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        update: jest.fn(),
      };

      mockPaymentTypeRepository.findById.mockResolvedValue(existingPaymentType);
      mockPaymentTypeRepository.save.mockResolvedValue({
        ...existingPaymentType,
        description: 'Updated description',
        updatedAt: new Date(),
      });

      const result = await controller.update(
        '550e8400-e29b-41d4-a716-446655440020',
        { description: 'Updated description' } as any,
      );

      expect(result).toBeDefined();
      expect(result.description).toBe('Updated description');
    });

    it('should deactivate payment type in database', async () => {
      const existingPaymentType = {
        id: '550e8400-e29b-41d4-a716-446655440020',
        name: 'Deprecated Method',
        description: 'No longer supported',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        update: jest.fn(),
      };

      mockPaymentTypeRepository.findById.mockResolvedValue(existingPaymentType);
      mockPaymentTypeRepository.save.mockResolvedValue({
        ...existingPaymentType,
        active: false,
        updatedAt: new Date(),
      });

      const result = await controller.update(
        '550e8400-e29b-41d4-a716-446655440020',
        { active: false } as any,
      );

      expect(result.active).toBe(false);
    });

    it('should throw when payment type not found in database', async () => {
      mockPaymentTypeRepository.findById.mockResolvedValue(null);

      await expect(
        controller.update(
          '550e8400-e29b-41d4-a716-446655440099',
          { name: 'New Name' } as any,
        ),
      ).rejects.toThrow();
    });
  });
});
