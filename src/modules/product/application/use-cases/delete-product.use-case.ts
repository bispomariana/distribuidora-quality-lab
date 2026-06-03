import { Injectable, Inject } from '@nestjs/common';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { NotFoundException } from '@shared/domain/exceptions';

@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found', { productId: id });
    }

    await this.productRepository.delete(id);
  }
}
