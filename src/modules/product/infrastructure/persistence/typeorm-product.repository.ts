import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepo } from 'typeorm';
import { Product } from '../../domain/aggregates/product.aggregate';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { ProductOrmEntity } from './product.orm-entity';
import { ProductMapper } from './product.mapper';

@Injectable()
export class TypeOrmProductRepository implements ProductRepository {
  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly ormRepository: TypeOrmRepo<ProductOrmEntity>,
  ) {}

  async findById(id: string): Promise<Product | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orm = await this.ormRepository.findOneBy({ id });
    return orm ? ProductMapper.toDomain(orm) : null;
  }

  async findAll(): Promise<Product[]> {
    const all = await this.ormRepository.find();
    return all.map(ProductMapper.toDomain);
  }

  async save(entity: Product): Promise<void> {
    const orm = ProductMapper.toPersistence(entity);
    const saved = await this.ormRepository.save(orm);

    if (!entity.id) {
      entity.assignId(saved.id);
    }
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }
}
