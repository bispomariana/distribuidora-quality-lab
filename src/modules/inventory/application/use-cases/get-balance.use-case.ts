import { Injectable, Inject } from '@nestjs/common';
import {
  InventoryRepository,
  INVENTORY_REPOSITORY,
} from '../../domain/repositories/inventory.repository';
import { ProductRepository } from '../../../product/domain/repositories/product.repository';
import { NotFoundException } from '@shared/domain/exceptions';

export interface GetBalanceOutput {
  productId: string;
  balance: number;
}

@Injectable()
export class GetBalanceUseCase {
  constructor(
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: InventoryRepository,
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(productId: string): Promise<GetBalanceOutput> {
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    const balance = await this.inventoryRepository.getBalance(productId);

    return {
      productId,
      balance,
    };
  }
}
