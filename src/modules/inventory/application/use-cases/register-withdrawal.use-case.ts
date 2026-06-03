import { Injectable, Inject } from '@nestjs/common';
import { InventoryMovement } from '../../domain/entities/inventory-movement.entity';
import {
  InventoryRepository,
  INVENTORY_REPOSITORY,
} from '../../domain/repositories/inventory.repository';
import { ProductRepository } from '../../../product/domain/repositories/product.repository';
import { StockBalance } from '../../domain/value-objects/stock-balance.vo';
import { NotFoundException } from '@shared/domain/exceptions';

export interface RegisterWithdrawalInput {
  productId: string;
  quantity: number;
  reason: string;
}

export interface RegisterWithdrawalOutput {
  id: string;
  productId: string;
  type: string;
  quantity: number;
  reason: string;
  createdAt: Date;
}

@Injectable()
export class RegisterWithdrawalUseCase {
  constructor(
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: InventoryRepository,
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(input: RegisterWithdrawalInput): Promise<RegisterWithdrawalOutput> {
    const product = await this.productRepository.findById(input.productId);

    if (!product) {
      throw new NotFoundException(`Product with id ${input.productId} not found`);
    }

    const currentBalance = await this.inventoryRepository.getBalance(input.productId);
    const balance = StockBalance.create(currentBalance);

    // Domain rule: reject withdrawal if insufficient stock
    // This throws BusinessRuleException with details if quantity > available
    const newBalance = balance.subtract(input.quantity);

    const movement = InventoryMovement.create({
      productId: input.productId,
      type: 'withdrawal',
      quantity: input.quantity,
      reason: input.reason,
    });

    const saved = await this.inventoryRepository.save(movement);

    // Req 3.6: If balance reaches zero after withdrawal, mark product as unavailable
    if (newBalance.isZero) {
      product.markAsUnavailable();
      await this.productRepository.save(product);
    }

    return {
      id: saved.id,
      productId: saved.productId,
      type: saved.type,
      quantity: saved.quantity,
      reason: saved.reason!,
      createdAt: saved.createdAt,
    };
  }
}
