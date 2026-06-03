import { ValueObject } from '@shared/domain/value-object';
import { BusinessRuleException } from '@shared/domain/exceptions';

export type OrderStatusValue =
  | 'draft'
  | 'confirmed'
  | 'in_separation'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

interface OrderStatusProps {
  value: OrderStatusValue;
}

const VALID_TRANSITIONS: Record<OrderStatusValue, OrderStatusValue[]> = {
  draft: ['confirmed', 'cancelled'],
  confirmed: ['in_separation', 'cancelled'],
  in_separation: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

export class OrderStatus extends ValueObject<OrderStatusProps> {
  private readonly _value: OrderStatusValue;

  private constructor(value: OrderStatusValue) {
    super();
    this._value = value;
  }

  protected get props(): OrderStatusProps {
    return { value: this._value };
  }

  get value(): OrderStatusValue {
    return this._value;
  }

  static create(value: OrderStatusValue): OrderStatus {
    const validValues: OrderStatusValue[] = [
      'draft',
      'confirmed',
      'in_separation',
      'shipped',
      'delivered',
      'cancelled',
    ];

    if (!validValues.includes(value)) {
      throw new BusinessRuleException('Invalid order status', {
        status: value,
        allowedValues: validValues,
      });
    }

    return new OrderStatus(value);
  }

  static draft(): OrderStatus {
    return new OrderStatus('draft');
  }

  canTransitionTo(target: OrderStatusValue): boolean {
    return VALID_TRANSITIONS[this._value].includes(target);
  }

  transitionTo(target: OrderStatusValue): OrderStatus {
    if (!this.canTransitionTo(target)) {
      throw new BusinessRuleException('Invalid state transition', {
        currentState: this._value,
        requestedState: target,
        allowedTransitions: VALID_TRANSITIONS[this._value],
      });
    }

    return new OrderStatus(target);
  }

  getAllowedTransitions(): OrderStatusValue[] {
    return [...VALID_TRANSITIONS[this._value]];
  }

  isDraft(): boolean {
    return this._value === 'draft';
  }

  isConfirmed(): boolean {
    return this._value === 'confirmed';
  }

  isCancelled(): boolean {
    return this._value === 'cancelled';
  }

  isDelivered(): boolean {
    return this._value === 'delivered';
  }
}
