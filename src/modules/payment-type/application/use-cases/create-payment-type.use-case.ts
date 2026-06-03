import { Injectable, Inject } from '@nestjs/common';
import { PaymentTypeEntity } from '../../domain/entities/payment-type.entity';
import {
  PaymentTypeRepository,
  PAYMENT_TYPE_REPOSITORY,
} from '../../domain/repositories/payment-type.repository';

export interface CreatePaymentTypeInput {
  name: string;
  description?: string;
}

export interface CreatePaymentTypeOutput {
  id: string;
  name: string;
  description: string;
  active: boolean;
  createdAt: Date;
}

@Injectable()
export class CreatePaymentTypeUseCase {
  constructor(
    @Inject(PAYMENT_TYPE_REPOSITORY)
    private readonly paymentTypeRepository: PaymentTypeRepository,
  ) {}

  async execute(input: CreatePaymentTypeInput): Promise<CreatePaymentTypeOutput> {
    const paymentType = PaymentTypeEntity.create({
      name: input.name,
      description: input.description,
    });

    const saved = await this.paymentTypeRepository.save(paymentType);

    return {
      id: saved.id,
      name: saved.name,
      description: saved.description,
      active: saved.active,
      createdAt: saved.createdAt,
    };
  }
}
