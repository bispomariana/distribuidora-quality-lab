import { Injectable, Inject } from '@nestjs/common';
import { UpdateProductProps } from '../../domain/aggregates/product.aggregate';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { NotFoundException } from '@shared/domain/exceptions';

export interface UpdateProductOutput {
  id: string;
  name: string;
  description: string;
  unitPrice: number;
  category: string;
  available: boolean;
  updatedAt: Date;
}

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(id: string, props: UpdateProductProps): Promise<UpdateProductOutput> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found', { productId: id });
    }

    product.update(props);
    await this.productRepository.save(product);

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      unitPrice: product.unitPrice,
      category: product.category,
      available: product.available,
      updatedAt: product.updatedAt,
    };
  }
}
