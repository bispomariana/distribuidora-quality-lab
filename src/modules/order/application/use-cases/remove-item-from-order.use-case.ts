import { Injectable, Inject } from '@nestjs/common';
import { OrderRepository, ORDER_REPOSITORY } from '../../domain/repositories/order.repository';
import { NotFoundException } from '@shared/domain/exceptions';

export interface RemoveItemFromOrderInput {
  orderId: string;
  itemId: string;
}

export interface RemoveItemFromOrderOutput {
  orderId: string;
  removedItemId: string;
  totalAmount: number;
  itemCount: number;
}

@Injectable()
export class RemoveItemFromOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(input: RemoveItemFromOrderInput): Promise<RemoveItemFromOrderOutput> {
    const order = await this.orderRepository.findById(input.orderId);

    if (!order) {
      throw new NotFoundException(`Order with id ${input.orderId} not found`);
    }

    order.removeItem(input.itemId);

    await this.orderRepository.save(order);

    return {
      orderId: input.orderId,
      removedItemId: input.itemId,
      totalAmount: order.totalAmount,
      itemCount: order.items.length,
    };
  }
}
