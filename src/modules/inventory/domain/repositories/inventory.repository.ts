import { InventoryMovement } from '../entities/inventory-movement.entity';

export interface InventoryRepository {
  findMovementsByProductId(productId: string): Promise<InventoryMovement[]>;
  save(movement: InventoryMovement): Promise<InventoryMovement>;
  getBalance(productId: string): Promise<number>;
}

export const INVENTORY_REPOSITORY = Symbol('InventoryRepository');
