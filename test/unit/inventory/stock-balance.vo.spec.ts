import { StockBalance } from '@modules/inventory/domain/value-objects/stock-balance.vo';
import { BusinessRuleException } from '@shared/domain/exceptions/business-rule.exception';

describe('StockBalance', () => {
  describe('create', () => {
    it('when value is 0, then creates balance with zero', () => {
      const balance = StockBalance.create(0);

      expect(balance.value).toBe(0);
      expect(balance.isZero).toBe(true);
    });

    it('when value is positive integer, then creates balance', () => {
      const balance = StockBalance.create(100);

      expect(balance.value).toBe(100);
      expect(balance.isZero).toBe(false);
    });

    it('when value is negative, then throws BusinessRuleException', () => {
      expect(() => StockBalance.create(-1)).toThrow(BusinessRuleException);
    });

    it('when value is not integer, then throws BusinessRuleException', () => {
      expect(() => StockBalance.create(5.5)).toThrow(BusinessRuleException);
    });
  });

  describe('zero', () => {
    it('when called, then returns balance with value 0', () => {
      const balance = StockBalance.zero();

      expect(balance.value).toBe(0);
      expect(balance.isZero).toBe(true);
    });
  });

  describe('add', () => {
    it('when adding positive quantity, then returns new balance with sum', () => {
      const balance = StockBalance.create(10);
      const newBalance = balance.add(5);

      expect(newBalance.value).toBe(15);
      expect(balance.value).toBe(10);
    });

    it('when adding to zero balance, then returns quantity as new balance', () => {
      const balance = StockBalance.zero();
      const newBalance = balance.add(20);

      expect(newBalance.value).toBe(20);
    });

    it('when adding 0, then throws BusinessRuleException', () => {
      const balance = StockBalance.create(10);

      expect(() => balance.add(0)).toThrow(BusinessRuleException);
    });

    it('when adding negative number, then throws BusinessRuleException', () => {
      const balance = StockBalance.create(10);

      expect(() => balance.add(-5)).toThrow(BusinessRuleException);
    });

    it('when adding non-integer, then throws BusinessRuleException', () => {
      const balance = StockBalance.create(10);

      expect(() => balance.add(2.5)).toThrow(BusinessRuleException);
    });
  });

  describe('subtract', () => {
    it('when subtracting less than balance, then returns new balance', () => {
      const balance = StockBalance.create(10);
      const newBalance = balance.subtract(3);

      expect(newBalance.value).toBe(7);
      expect(balance.value).toBe(10);
    });

    it('when subtracting exactly balance, then returns zero balance', () => {
      const balance = StockBalance.create(10);
      const newBalance = balance.subtract(10);

      expect(newBalance.value).toBe(0);
      expect(newBalance.isZero).toBe(true);
    });

    it('when subtracting more than balance, then throws BusinessRuleException', () => {
      const balance = StockBalance.create(5);

      expect(() => balance.subtract(10)).toThrow(BusinessRuleException);
    });

    it('when subtracting 0, then throws BusinessRuleException', () => {
      const balance = StockBalance.create(10);

      expect(() => balance.subtract(0)).toThrow(BusinessRuleException);
    });

    it('when subtracting negative number, then throws BusinessRuleException', () => {
      const balance = StockBalance.create(10);

      expect(() => balance.subtract(-3)).toThrow(BusinessRuleException);
    });

    it('when subtracting non-integer, then throws BusinessRuleException', () => {
      const balance = StockBalance.create(10);

      expect(() => balance.subtract(2.5)).toThrow(BusinessRuleException);
    });
  });

  describe('immutability', () => {
    it('when add is called, then original balance is unchanged', () => {
      const original = StockBalance.create(10);
      original.add(5);

      expect(original.value).toBe(10);
    });

    it('when subtract is called, then original balance is unchanged', () => {
      const original = StockBalance.create(10);
      original.subtract(3);

      expect(original.value).toBe(10);
    });
  });

  describe('equals', () => {
    it('when two balances have same value, then they are equal', () => {
      const a = StockBalance.create(10);
      const b = StockBalance.create(10);

      expect(a.equals(b)).toBe(true);
    });

    it('when two balances have different values, then they are not equal', () => {
      const a = StockBalance.create(10);
      const b = StockBalance.create(20);

      expect(a.equals(b)).toBe(false);
    });
  });
});
