import { ValueObject } from '@shared/domain';

interface MoneyProps {
  amount: number;
  currency: string;
}

class Money extends ValueObject<MoneyProps> {
  constructor(
    private readonly amount: number,
    private readonly currency: string,
  ) {
    super();
  }

  protected get props(): MoneyProps {
    return { amount: this.amount, currency: this.currency };
  }
}

describe('ValueObject', () => {
  describe('equals', () => {
    it('when same values, then returns true', () => {
      const moneyA = new Money(100, 'BRL');
      const moneyB = new Money(100, 'BRL');

      const result = moneyA.equals(moneyB);

      expect(result).toBe(true);
    });

    it('when same instance, then returns true', () => {
      const money = new Money(100, 'BRL');

      const result = money.equals(money);

      expect(result).toBe(true);
    });

    it('when different amount, then returns false', () => {
      const moneyA = new Money(100, 'BRL');
      const moneyB = new Money(200, 'BRL');

      const result = moneyA.equals(moneyB);

      expect(result).toBe(false);
    });

    it('when different currency, then returns false', () => {
      const moneyA = new Money(100, 'BRL');
      const moneyB = new Money(100, 'USD');

      const result = moneyA.equals(moneyB);

      expect(result).toBe(false);
    });
  });
});
