import { Injectable, Inject } from '@nestjs/common';
import { ProductAggregate, CreateProductProps } from '../../domain/aggregates/product.aggregate';
import { ProductRepository } from '../../domain/repositories/product.repository';

export interface CreateProductOutput {
  id: string;
  name: string;
  description: string;
  unitPrice: number;
  category: string;
  available: boolean;
  createdAt: Date;
}

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(props: CreateProductProps): Promise<CreateProductOutput> {
    const product = ProductAggregate.create(props);

    await this.productRepository.save(product);

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      unitPrice: product.unitPrice,
      category: product.category,
      available: product.available,
      createdAt: product.createdAt,
    };
  }
}
