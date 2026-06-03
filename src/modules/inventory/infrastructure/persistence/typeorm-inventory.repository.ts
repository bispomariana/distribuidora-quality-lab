import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepo } from 'typeorm';
import { InventoryMovement } from '../../domain/entities/inventory-movement.entity';
import { InventoryRepository } from '../../domain/repositories/inventory.repository';

@Injectable()
export class TypeOrmInventoryRepository implements InventoryRepository {
  constructor(
    @InjectRepository(InventoryMovement)
    private readonly ormRepository: TypeOrmRepo<InventoryMovement>,
  ) {}

  async findMovementsByProductId(productId: string): Promise<InventoryMovement[]> {
    return this.ormRepository.find({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: { _productId: productId } as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      order: { _createdAt: 'ASC' } as any,
    });
  }

  async save(movement: InventoryMovement): Promise<InventoryMovement> {
    return this.ormRepository.save(movement);
  }

  async getBalance(productId: string): Promise<number> {
    const movements = await this.findMovementsByProductId(productId);

    let balance = 0;
    for (const movement of movements) {
      if (movement.type === 'entry') {
        balance += movement.quantity;
      } else {
        balance -= movement.quantity;
      }
    }

    return balance;
  }
}
