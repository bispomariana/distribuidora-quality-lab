import { Repository } from '@shared/domain/repository.interface';
import { Product } from '../aggregates/product.aggregate';

export interface ProductRepository extends Repository<Product> {
  findAll(): Promise<Product[]>;
}
