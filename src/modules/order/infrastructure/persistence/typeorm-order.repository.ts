import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepo } from 'typeorm';
import { OrderAggregate } from '../../domain/aggregates/order.aggregate';
import { OrderRepository } from '../../domain/repositories/order.repository';

@Injectable()
export class TypeOrmOrderRepository implements OrderRepository {
  constructor(
    @InjectRepository(OrderAggregate)
    private readonly ormRepository: TypeOrmRepo<OrderAggregate>,
  ) {}

  async findById(id: string): Promise<OrderAggregate | null> {
    return this.ormRepository.findOne({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: { _id: id } as any,
      relations: ['_items'],
    });
  }

  async findByCustomerId(customerId: string): Promise<OrderAggregate[]> {
    return this.ormRepository.find({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: { _customerId: customerId } as any,
      relations: ['_items'],
    });
  }

  async save(order: OrderAggregate): Promise<OrderAggregate> {
    return this.ormRepository.save(order);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }
}
