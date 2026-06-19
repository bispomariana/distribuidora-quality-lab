import { Product } from '@modules/product/domain/aggregates/product.aggregate';
import { ProductOrmEntity } from './product.orm-entity';

export class ProductMapper {
  static toDomain(orm: ProductOrmEntity): Product {
    return Product.reconstitute({
      id: orm.id,
      name: orm.name,
      description: orm.description,
      unitPrice: Number(orm.unitPrice),
      category: orm.category,
      available: orm.available,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toPersistence(domain: Product): ProductOrmEntity {
    const orm = new ProductOrmEntity();
    orm.id = domain.id;
    orm.name = domain.name;
    orm.description = domain.description;
    orm.unitPrice = domain.unitPrice;
    orm.category = domain.category;
    orm.available = domain.available;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }
}