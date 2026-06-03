import { Injectable, Inject } from '@nestjs/common';
import {
  PaymentTypeRepository,
  PAYMENT_TYPE_REPOSITORY,
} from '../../domain/repositories/payment-type.repository';

export interface PaymentTypeListItem {
  id: string;
  name: string;
  description: string;
  active: boolean;
  createdAt: Date;
}

@Injectable()
export class ListActivePaymentTypesUseCase {
  constructor(
    @Inject(PAYMENT_TYPE_REPOSITORY)
    private readonly paymentTypeRepository: PaymentTypeRepository,
  ) {}

  async execute(): Promise<PaymentTypeListItem[]> {
    const paymentTypes = await this.paymentTypeRepository.findAllActive();

    return paymentTypes.map((pt) => ({
      id: pt.id,
      name: pt.name,
      description: pt.description,
      active: pt.active,
      createdAt: pt.createdAt,
    }));
  }
}
