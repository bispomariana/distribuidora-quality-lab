import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentTypeEntity } from './domain/entities/payment-type.entity';
import { AcceptanceRule } from './domain/value-objects/acceptance-rule.vo';
import { PAYMENT_TYPE_REPOSITORY } from './domain/repositories/payment-type.repository';
import { TypeOrmPaymentTypeRepository } from './infrastructure/persistence/typeorm-payment-type.repository';
import { CreatePaymentTypeUseCase } from './application/use-cases/create-payment-type.use-case';
import { ListActivePaymentTypesUseCase } from './application/use-cases/list-active-payment-types.use-case';
import { AddAcceptanceRuleUseCase } from './application/use-cases/add-acceptance-rule.use-case';
import { ValidatePaymentForOrderUseCase } from './application/use-cases/validate-payment-for-order.use-case';
import { PaymentTypeController } from './interface/controllers/payment-type.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentTypeEntity, AcceptanceRule])],
  controllers: [PaymentTypeController],
  providers: [
    {
      provide: PAYMENT_TYPE_REPOSITORY,
      useClass: TypeOrmPaymentTypeRepository,
    },
    CreatePaymentTypeUseCase,
    ListActivePaymentTypesUseCase,
    AddAcceptanceRuleUseCase,
    ValidatePaymentForOrderUseCase,
  ],
  exports: [
    PAYMENT_TYPE_REPOSITORY,
    CreatePaymentTypeUseCase,
    ListActivePaymentTypesUseCase,
    AddAcceptanceRuleUseCase,
    ValidatePaymentForOrderUseCase,
  ],
})
export class PaymentTypeModule {}
