import { ValueObject } from '@shared/domain/value-object';
import { ValidationException } from '@shared/domain/exceptions';

interface ProductPriceProps {
  value: number;
}

export class ProductPrice extends ValueObject<ProductPriceProps> {
  private static readonly MIN_PRICE = 0.01;
  private static readonly MAX_PRICE = 999999.99;

  private readonly _value: number;

  private constructor(value: number) {
    super();
    this._value = value;
  }

  static create(value: number): ProductPrice {
    if (value < ProductPrice.MIN_PRICE || value > ProductPrice.MAX_PRICE) {
      throw new ValidationException('Invalid product price', {
        unitPrice: [
          `unitPrice must be between ${ProductPrice.MIN_PRICE} and ${ProductPrice.MAX_PRICE}`,
        ],
      });
    }

    return new ProductPrice(value);
  }

  get value(): number {
    return this._value;
  }

  protected get props(): ProductPriceProps {
    return { value: this._value };
  }
}
