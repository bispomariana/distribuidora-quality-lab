import { Injectable, Inject } from '@nestjs/common';
import {
  PaymentTypeRepository,
  PAYMENT_TYPE_REPOSITORY,
} from '../../domain/repositories/payment-type.repository';
import { AcceptanceRule } from '../../domain/value-objects/acceptance-rule.vo';
import { NotFoundException } from '@shared/domain/exceptions';
import { ValidationException } from '@shared/domain/exceptions';

export interface AddAcceptanceRuleInput {
  paymentTypeId: string;
  minValue: number;
  maxValue: number;
}

export interface AddAcceptanceRuleOutput {
  id: string;
  paymentTypeId: string;
  minValue: number;
  maxValue: number;
  createdAt: Date;
}

@Injectable()
export class AddAcceptanceRuleUseCase {
  constructor(
    @Inject(PAYMENT_TYPE_REPOSITORY)
    private readonly paymentTypeRepository: PaymentTypeRepository,
  ) {}

  async execute(input: AddAcceptanceRuleInput): Promise<AddAcceptanceRuleOutput> {
    const paymentType = await this.paymentTypeRepository.findById(input.paymentTypeId);

    if (!paymentType) {
      throw new NotFoundException('Payment type not found', {
        paymentTypeId: input.paymentTypeId,
      });
    }

    if (input.minValue > input.maxValue) {
      throw new ValidationException('Invalid acceptance rule range', {
        minValue: ['minValue must be less than or equal to maxValue'],
      });
    }

    const rule = AcceptanceRule.create(input.minValue, input.maxValue);
    paymentType.addRule(rule);

    await this.paymentTypeRepository.save(paymentType);

    return {
      id: rule.id,
      paymentTypeId: paymentType.id,
      minValue: rule.minValue,
      maxValue: rule.maxValue,
      createdAt: rule.createdAt,
    };
  }
}
