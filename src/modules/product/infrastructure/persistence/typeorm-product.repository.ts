import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepo } from 'typeorm';
import { ProductAggregate } from '../../domain/aggregates/product.aggregate';
import { ProductRepository } from '../../domain/repositories/product.repository';

@Injectable()
export class TypeOrmProductRepository implements ProductRepository {
  constructor(
    @InjectRepository(ProductAggregate)
    private readonly ormRepository: TypeOrmRepo<ProductAggregate>,
  ) {}

  async findById(id: string): Promise<ProductAggregate | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.ormRepository.findOneBy({ _id: id } as any);
  }

  async findAll(): Promise<ProductAggregate[]> {
    return this.ormRepository.find();
  }

  async save(entity: ProductAggregate): Promise<void> {
    await this.ormRepository.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }
}
