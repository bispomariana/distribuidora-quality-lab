import { InventoryMovement } from '@modules/inventory/domain/entities/inventory-movement.entity';
import { ValidationException } from '@shared/domain/exceptions/validation.exception';

describe('InventoryMovement', () => {
  const validEntryProps = {
    productId: '550e8400-e29b-41d4-a716-446655440000',
    type: 'entry' as const,
    quantity: 10,
  };

  const validWithdrawalProps = {
    productId: '550e8400-e29b-41d4-a716-446655440000',
    type: 'withdrawal' as const,
    quantity: 5,
    reason: 'Venda para cliente',
  };

  describe('create', () => {
    it('when valid entry props are provided, then creates movement', () => {
      const movement = InventoryMovement.create(validEntryProps);

      expect(movement.productId).toBe(validEntryProps.productId);
      expect(movement.type).toBe('entry');
      expect(movement.quantity).toBe(10);
      expect(movement.reason).toBeNull();
    });

    it('when valid withdrawal props with reason, then creates movement', () => {
      const movement = InventoryMovement.create(validWithdrawalProps);

      expect(movement.productId).toBe(validWithdrawalProps.productId);
      expect(movement.type).toBe('withdrawal');
      expect(movement.quantity).toBe(5);
      expect(movement.reason).toBe('Venda para cliente');
    });

    it('when entry has optional reason, then stores it', () => {
      const movement = InventoryMovement.create({
        ...validEntryProps,
        reason: 'Compra de fornecedor',
      });

      expect(movement.reason).toBe('Compra de fornecedor');
    });
  });

  describe('productId validation', () => {
    it('when productId is empty, then throws ValidationException', () => {
      expect(() =>
        InventoryMovement.create({ ...validEntryProps, productId: '' }),
      ).toThrow(ValidationException);
    });

    it('when productId is whitespace, then throws ValidationException', () => {
      expect(() =>
        InventoryMovement.create({ ...validEntryProps, productId: '   ' }),
      ).toThrow(ValidationException);
    });
  });

  describe('type validation', () => {
    it('when type is invalid, then throws ValidationException', () => {
      expect(() =>
        InventoryMovement.create({
          ...validEntryProps,
          type: 'invalid' as any,
        }),
      ).toThrow(ValidationException);
    });
  });

  describe('quantity validation', () => {
    it('when quantity is 0, then throws ValidationException', () => {
      expect(() =>
        InventoryMovement.create({ ...validEntryProps, quantity: 0 }),
      ).toThrow(ValidationException);
    });

    it('when quantity is negative, then throws ValidationException', () => {
      expect(() =>
        InventoryMovement.create({ ...validEntryProps, quantity: -5 }),
      ).toThrow(ValidationException);
    });

    it('when quantity is not integer, then throws ValidationException', () => {
      expect(() =>
        InventoryMovement.create({ ...validEntryProps, quantity: 2.5 }),
      ).toThrow(ValidationException);
    });

    it('when quantity is exactly 1, then creates successfully', () => {
      const movement = InventoryMovement.create({
        ...validEntryProps,
        quantity: 1,
      });

      expect(movement.quantity).toBe(1);
    });
  });

  describe('reason validation', () => {
    it('when withdrawal has no reason, then throws ValidationException', () => {
      expect(() =>
        InventoryMovement.create({
          productId: validWithdrawalProps.productId,
          type: 'withdrawal',
          quantity: 5,
        }),
      ).toThrow(ValidationException);
    });

    it('when withdrawal has empty reason, then throws ValidationException', () => {
      expect(() =>
        InventoryMovement.create({
          ...validWithdrawalProps,
          reason: '',
        }),
      ).toThrow(ValidationException);
    });

    it('when withdrawal has whitespace-only reason, then throws ValidationException', () => {
      expect(() =>
        InventoryMovement.create({
          ...validWithdrawalProps,
          reason: '   ',
        }),
      ).toThrow(ValidationException);
    });

    it('when entry has no reason, then creates with null reason', () => {
      const movement = InventoryMovement.create(validEntryProps);

      expect(movement.reason).toBeNull();
    });
  });
});
