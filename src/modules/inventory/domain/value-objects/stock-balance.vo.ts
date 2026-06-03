import { ValueObject } from '@shared/domain/value-object';
import { BusinessRuleException } from '@shared/domain/exceptions';

interface StockBalanceProps {
  value: number;
}

export class StockBalance extends ValueObject<StockBalanceProps> {
  private readonly _value: number;

  private constructor(value: number) {
    super();
    this._value = value;
  }

  static create(value: number): StockBalance {
    if (!Number.isInteger(value) || value < 0) {
      throw new BusinessRuleException('Stock balance must be a non-negative integer', {
        balance: value,
      });
    }

    return new StockBalance(value);
  }

  static zero(): StockBalance {
    return new StockBalance(0);
  }

  get value(): number {
    return this._value;
  }

  get isZero(): boolean {
    return this._value === 0;
  }

  add(quantity: number): StockBalance {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new BusinessRuleException('Quantity to add must be a positive integer', {
        quantity,
      });
    }

    return new StockBalance(this._value + quantity);
  }

  subtract(quantity: number): StockBalance {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new BusinessRuleException('Quantity to subtract must be a positive integer', {
        quantity,
      });
    }

    if (quantity > this._value) {
      throw new BusinessRuleException('Insufficient stock', {
        requested: quantity,
        available: this._value,
      });
    }

    return new StockBalance(this._value - quantity);
  }

  protected get props(): StockBalanceProps {
    return { value: this._value };
  }
}
