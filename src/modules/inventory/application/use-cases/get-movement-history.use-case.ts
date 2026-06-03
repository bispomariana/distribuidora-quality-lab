import { Injectable, Inject } from '@nestjs/common';
import {
  InventoryRepository,
  INVENTORY_REPOSITORY,
} from '../../domain/repositories/inventory.repository';
import { ProductRepository } from '../../../product/domain/repositories/product.repository';
import { NotFoundException } from '@shared/domain/exceptions';

export interface MovementHistoryItem {
  id: string;
  productId: string;
  type: string;
  quantity: number;
  reason: string | null;
  createdAt: Date;
}

export interface GetMovementHistoryOutput {
  productId: string;
  movements: MovementHistoryItem[];
}

@Injectable()
export class GetMovementHistoryUseCase {
  constructor(
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: InventoryRepository,
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(productId: string): Promise<GetMovementHistoryOutput> {
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    const movements = await this.inventoryRepository.findMovementsByProductId(productId);

    return {
      productId,
      movements: movements.map((m) => ({
        id: m.id,
        productId: m.productId,
        type: m.type,
        quantity: m.quantity,
        reason: m.reason,
        createdAt: m.createdAt,
      })),
    };
  }
}
