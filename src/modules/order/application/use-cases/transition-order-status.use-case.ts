import { Injectable, Inject } from '@nestjs/common';
import { OrderRepository, ORDER_REPOSITORY } from '../../domain/repositories/order.repository';
import { OrderStatusValue } from '../../domain/value-objects/order-status.vo';
import { NotFoundException } from '@shared/domain/exceptions';

export interface TransitionOrderStatusInput {
  orderId: string;
  targetStatus: OrderStatusValue;
}

export interface TransitionOrderStatusOutput {
  id: string;
  previousStatus: string;
  currentStatus: string;
  updatedAt: Date;
}

@Injectable()
export class TransitionOrderStatusUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(input: TransitionOrderStatusInput): Promise<TransitionOrderStatusOutput> {
    const order = await this.orderRepository.findById(input.orderId);

    if (!order) {
      throw new NotFoundException(`Order with id ${input.orderId} not found`);
    }

    const previousStatus = order.status;

    // Req 4.9: Invalid transition throws BusinessRuleException
    // with currentState and allowedTransitions
    order.transitionTo(input.targetStatus);

    await this.orderRepository.save(order);

    return {
      id: order.id,
      previousStatus,
      currentStatus: order.status,
      updatedAt: order.updatedAt,
    };
  }
}
