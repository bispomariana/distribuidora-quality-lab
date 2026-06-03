import { PaymentTypeEntity } from '../entities/payment-type.entity';

export interface PaymentTypeRepository {
  findById(id: string): Promise<PaymentTypeEntity | null>;
  findByName(name: string): Promise<PaymentTypeEntity | null>;
  findAll(): Promise<PaymentTypeEntity[]>;
  findAllActive(): Promise<PaymentTypeEntity[]>;
  save(paymentType: PaymentTypeEntity): Promise<PaymentTypeEntity>;
  delete(id: string): Promise<void>;
}

export const PAYMENT_TYPE_REPOSITORY = Symbol('PaymentTypeRepository');
