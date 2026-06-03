import { Injectable, Inject } from '@nestjs/common';
import { ProductRepository } from '../../domain/repositories/product.repository';

export interface ProductListItem {
  id: string;
  name: string;
  description: string;
  unitPrice: number;
  category: string;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(): Promise<ProductListItem[]> {
    const products = await this.productRepository.findAll();

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      unitPrice: product.unitPrice,
      category: product.category,
      available: product.available,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));
  }
}
