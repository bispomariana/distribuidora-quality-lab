import { Injectable, Inject } from '@nestjs/common';
import {
  PaymentTypeRepository,
  PAYMENT_TYPE_REPOSITORY,
} from '../../domain/repositories/payment-type.repository';
import { NotFoundException, BusinessRuleException } from '@shared/domain/exceptions';

export interface ValidatePaymentInput {
  paymentTypeId: string;
  orderValue: number;
}

export interface ValidatePaymentOutput {
  valid: boolean;
  paymentTypeId: string;
  paymentTypeName: string;
}

@Injectable()
export class ValidatePaymentForOrderUseCase {
  constructor(
    @Inject(PAYMENT_TYPE_REPOSITORY)
    private readonly paymentTypeRepository: PaymentTypeRepository,
  ) {}

  async execute(input: ValidatePaymentInput): Promise<ValidatePaymentOutput> {
    const paymentType = await this.paymentTypeRepository.findById(input.paymentTypeId);

    if (!paymentType) {
      throw new NotFoundException('Payment type not found', {
        paymentTypeId: input.paymentTypeId,
      });
    }

    if (!paymentType.active) {
      throw new BusinessRuleException('Payment type is inactive', {
        paymentTypeId: input.paymentTypeId,
        paymentTypeName: paymentType.name,
        reason: 'Payment type is not active and cannot be used for orders',
      });
    }

    const rules = paymentType.rules;

    if (rules.length > 0) {
      const accepted = rules.some((rule) => rule.isValueAccepted(input.orderValue));

      if (!accepted) {
        const applicableRule = rules[0];
        throw new BusinessRuleException('Order value outside acceptance range', {
          paymentTypeId: input.paymentTypeId,
          paymentTypeName: paymentType.name,
          orderValue: input.orderValue,
          minValue: applicableRule ? applicableRule.minValue : null,
          maxValue: applicableRule ? applicableRule.maxValue : null,
          reason: `Order value ${input.orderValue} is outside the accepted range`,
        });
      }
    }

    return {
      valid: true,
      paymentTypeId: paymentType.id,
      paymentTypeName: paymentType.name,
    };
  }
}
