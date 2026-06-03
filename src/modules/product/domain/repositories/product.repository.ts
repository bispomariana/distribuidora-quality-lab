import { Repository } from '@shared/domain/repository.interface';
import { ProductAggregate } from '../aggregates/product.aggregate';

export interface ProductRepository extends Repository<ProductAggregate> {
  findAll(): Promise<ProductAggregate[]>;
}
