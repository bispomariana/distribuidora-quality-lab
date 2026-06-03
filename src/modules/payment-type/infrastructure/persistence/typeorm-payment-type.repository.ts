import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepo } from 'typeorm';
import { PaymentTypeEntity } from '../../domain/entities/payment-type.entity';
import { PaymentTypeRepository } from '../../domain/repositories/payment-type.repository';
import { ConflictException } from '@shared/domain/exceptions';

@Injectable()
export class TypeOrmPaymentTypeRepository implements PaymentTypeRepository {
  constructor(
    @InjectRepository(PaymentTypeEntity)
    private readonly ormRepository: TypeOrmRepo<PaymentTypeEntity>,
  ) {}

  async findById(id: string): Promise<PaymentTypeEntity | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.ormRepository.findOneBy({ _id: id } as any);
  }

  async findByName(name: string): Promise<PaymentTypeEntity | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.ormRepository.findOneBy({ _name: name } as any);
  }

  async findAll(): Promise<PaymentTypeEntity[]> {
    return this.ormRepository.find();
  }

  async findAllActive(): Promise<PaymentTypeEntity[]> {
    return this.ormRepository.find({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: { _active: true } as any,
    });
  }

  async save(paymentType: PaymentTypeEntity): Promise<PaymentTypeEntity> {
    const existing = await this.ormRepository.findOneBy(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { _name: paymentType.name } as any,
    );

    if (existing && existing.id !== paymentType.id) {
      throw new ConflictException('Payment type name already exists', {
        name: paymentType.name,
        existingId: existing.id,
      });
    }

    return this.ormRepository.save(paymentType);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }
}
