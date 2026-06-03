import { OrderAggregate } from '../aggregates/order.aggregate';

export interface OrderRepository {
  findById(id: string): Promise<OrderAggregate | null>;
  findByCustomerId(customerId: string): Promise<OrderAggregate[]>;
  save(order: OrderAggregate): Promise<OrderAggregate>;
  delete(id: string): Promise<void>;
}

export const ORDER_REPOSITORY = Symbol('OrderRepository');
