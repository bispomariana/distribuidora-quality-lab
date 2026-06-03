import { AcceptanceRule } from '@modules/payment-type/domain/value-objects/acceptance-rule.vo';
import { ValidationException } from '@shared/domain/exceptions';

describe('AcceptanceRule', () => {
  describe('create', () => {
    it('when min and max are valid and min <= max, then creates rule successfully', () => {
      const rule = AcceptanceRule.create(10.0, 100.0);

      expect(rule.minValue).toBe(10.0);
      expect(rule.maxValue).toBe(100.0);
    });

    it('when min equals max, then creates rule successfully', () => {
      const rule = AcceptanceRule.create(50.0, 50.0);

      expect(rule.minValue).toBe(50.0);
      expect(rule.maxValue).toBe(50.0);
    });

    it('when min > max, then throws ValidationException', () => {
      expect(() => AcceptanceRule.create(100.0, 10.0)).toThrow(
        ValidationException,
      );
    });

    it('when minValue is below minimum allowed, then throws ValidationException', () => {
      expect(() => AcceptanceRule.create(0, 100.0)).toThrow(
        ValidationException,
      );
    });

    it('when maxValue exceeds maximum allowed, then throws ValidationException', () => {
      expect(() =>
        AcceptanceRule.create(10.0, 1000000000.0),
      ).toThrow(ValidationException);
    });
  });

  describe('isValueAccepted', () => {
    it('when value is within range, then returns true', () => {
      const rule = AcceptanceRule.create(10.0, 100.0);

      expect(rule.isValueAccepted(50.0)).toBe(true);
    });

    it('when value equals min boundary, then returns true', () => {
      const rule = AcceptanceRule.create(10.0, 100.0);

      expect(rule.isValueAccepted(10.0)).toBe(true);
    });

    it('when value equals max boundary, then returns true', () => {
      const rule = AcceptanceRule.create(10.0, 100.0);

      expect(rule.isValueAccepted(100.0)).toBe(true);
    });

    it('when value is below min, then returns false', () => {
      const rule = AcceptanceRule.create(10.0, 100.0);

      expect(rule.isValueAccepted(9.99)).toBe(false);
    });

    it('when value is above max, then returns false', () => {
      const rule = AcceptanceRule.create(10.0, 100.0);

      expect(rule.isValueAccepted(100.01)).toBe(false);
    });
  });

  describe('equals', () => {
    it('when two rules have same min and max, then they are equal', () => {
      const rule1 = AcceptanceRule.create(10.0, 100.0);
      const rule2 = AcceptanceRule.create(10.0, 100.0);

      expect(rule1.equals(rule2)).toBe(true);
    });

    it('when two rules have different values, then they are not equal', () => {
      const rule1 = AcceptanceRule.create(10.0, 100.0);
      const rule2 = AcceptanceRule.create(20.0, 200.0);

      expect(rule1.equals(rule2)).toBe(false);
    });
  });
});
