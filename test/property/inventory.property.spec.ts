import * as fc from 'fast-check';
import { StockBalance } from '@modules/inventory/domain/value-objects/stock-balance.vo';
import { InventoryMovement, MovementType } from '@modules/inventory/domain/entities/inventory-movement.entity';
import { RegisterWithdrawalUseCase, RegisterWithdrawalInput } from '@modules/inventory/application/use-cases/register-withdrawal.use-case';
import { RegisterEntryUseCase, RegisterEntryInput } from '@modules/inventory/application/use-cases/register-entry.use-case';
import { InventoryRepository } from '@modules/inventory/domain/repositories/inventory.repository';
import { ProductRepository } from '@modules/product/domain/repositories/product.repository';
import { Product } from '@modules/product/domain/aggregates/product.aggregate';
import { BusinessRuleException } from '@shared/domain/exceptions';
import { v4 as uuidv4 } from 'uuid';

// --- In-Memory Fakes ---

class InMemoryInventoryRepository implements InventoryRepository {
  private movements: InventoryMovement[] = [];

  async findMovementsByProductId(productId: string): Promise<InventoryMovement[]> {
    return this.movements.filter((m) => m.productId === productId);
  }

  async save(movement: InventoryMovement): Promise<InventoryMovement> {
    // Simulate ID assignment
    if (!movement.id) {
      Object.defineProperty(movement, '_id', { value: uuidv4(), writable: true });
      Object.defineProperty(movement, '_createdAt', { value: new Date(), writable: true });
    }
    this.movements.push(movement);
    return movement;
  }

  async getBalance(productId: string): Promise<number> {
    const productMovements = this.movements.filter((m) => m.productId === productId);
    let balance = 0;
    for (const m of productMovements) {
      if (m.type === 'entry') {
        balance += m.quantity;
      } else {
        balance -= m.quantity;
      }
    }
    return balance;
  }

  getMovements(): InventoryMovement[] {
    return [...this.movements];
  }

  clear(): void {
    this.movements = [];
  }
}

class InMemoryProductRepository implements ProductRepository {
  private store = new Map<string, Product>();

  addProduct(product: Product): void {
    this.store.set(product.id, product);
  }

  async findById(id: string): Promise<Product | null> {
    return this.store.get(id) ?? null;
  }

  async save(entity: Product): Promise<void> {
    this.store.set(entity.id, entity);
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  async findAll(): Promise<Product[]> {
    return Array.from(this.store.values());
  }
}

// --- Helpers ---

function createTestProduct(): Product {
  const product = Product.create({
    name: 'Test Product',
    unitPrice: 10.0,
    category: 'Test',
  });
  // Assign an ID to simulate persisted product
  Object.defineProperty(product, '_id', { value: uuidv4(), writable: true });
  return product;
}

// --- Generators ---

const positiveIntArb = fc.integer({ min: 1, max: 500 });
const reasonArb = fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0);

/**
 * Generates a sequence of entries and valid withdrawals such that
 * withdrawals never exceed the cumulative balance at any point.
 * Returns { entries: number[], withdrawals: number[] }
 */
const validMovementSequenceArb = fc.integer({ min: 1, max: 20 }).chain((numEntries) =>
  fc.array(fc.integer({ min: 1, max: 100 }), { minLength: numEntries, maxLength: numEntries }).chain(
    (entries) => {
      const totalBalance = entries.reduce((sum, e) => sum + e, 0);
      if (totalBalance === 0) {
        return fc.constant({ entries, withdrawals: [] as number[] });
      }
      // Generate withdrawals that don't exceed cumulative available
      return fc
        .array(fc.integer({ min: 1, max: Math.max(1, Math.floor(totalBalance / 2)) }), {
          minLength: 0,
          maxLength: Math.min(10, totalBalance),
        })
        .map((rawWithdrawals) => {
          // Filter withdrawals to ensure they never exceed remaining balance
          const validWithdrawals: number[] = [];
          let remaining = totalBalance;
          for (const w of rawWithdrawals) {
            const qty = Math.min(w, remaining);
            if (qty > 0) {
              validWithdrawals.push(qty);
              remaining -= qty;
            }
            if (remaining === 0) break;
          }
          return { entries, withdrawals: validWithdrawals };
        });
    },
  ),
);

// --- Property Tests ---

describe('Property Tests — Inventory Module', () => {
  describe('Property 6: Invariante de saldo de estoque', () => {
    /**
     * Validates: Requirements 3.1, 3.2, 3.3, 3.5
     *
     * For any sequence of N entries and M valid withdrawals on the same product,
     * the reported balance must equal sum of entries minus sum of withdrawals.
     * Balance can never be negative.
     */
    it('for any sequence of entries and valid withdrawals, balance equals sum(entries) - sum(withdrawals) and is never negative', () => {
      fc.assert(
        fc.property(validMovementSequenceArb, ({ entries, withdrawals }) => {
          // Arrange — start with zero balance
          let balance = StockBalance.zero();

          // Act — apply entries
          for (const qty of entries) {
            balance = balance.add(qty);
          }

          // Act — apply withdrawals
          for (const qty of withdrawals) {
            balance = balance.subtract(qty);
          }

          // Assert — invariant: balance = sum(entries) - sum(withdrawals)
          const expectedBalance =
            entries.reduce((sum, e) => sum + e, 0) -
            withdrawals.reduce((sum, w) => sum + w, 0);

          expect(balance.value).toBe(expectedBalance);
          expect(balance.value).toBeGreaterThanOrEqual(0);
        }),
        { numRuns: 100 },
      );
    });

    it('withdrawal exceeding balance throws BusinessRuleException', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 1, max: 100 }),
          (initialBalance, excess) => {
            // Arrange
            const balance = StockBalance.create(initialBalance);
            const withdrawalQty = initialBalance + excess;

            // Act & Assert
            expect(() => balance.subtract(withdrawalQty)).toThrow(BusinessRuleException);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('Property 7: Histórico completo de movimentações', () => {
    /**
     * Validates: Requirements 3.4
     *
     * For any sequence of entry/withdrawal operations, the movement history
     * must contain exactly the same number of records with correct type,
     * quantity, and order.
     */
    it('for any sequence of operations, repository records all movements with correct type, quantity, and order', async () => {
      await fc.assert(
        fc.asyncProperty(validMovementSequenceArb, reasonArb, async ({ entries, withdrawals }, reason) => {
          // Arrange
          const inventoryRepo = new InMemoryInventoryRepository();
          const productRepo = new InMemoryProductRepository();
          const product = createTestProduct();
          productRepo.addProduct(product);

          const entryUseCase = new RegisterEntryUseCase(inventoryRepo as any, productRepo);
          const withdrawalUseCase = new RegisterWithdrawalUseCase(inventoryRepo as any, productRepo);

          // Build expected sequence: all entries first, then withdrawals
          const expectedMovements: Array<{ type: MovementType; quantity: number }> = [];

          // Act — register entries
          for (const qty of entries) {
            await entryUseCase.execute({ productId: product.id, quantity: qty });
            expectedMovements.push({ type: 'entry', quantity: qty });
          }

          // Act — register withdrawals
          for (const qty of withdrawals) {
            await withdrawalUseCase.execute({
              productId: product.id,
              quantity: qty,
              reason,
            });
            expectedMovements.push({ type: 'withdrawal', quantity: qty });
          }

          // Assert — history matches expected
          const history = await inventoryRepo.findMovementsByProductId(product.id);
          expect(history.length).toBe(expectedMovements.length);

          for (let i = 0; i < expectedMovements.length; i++) {
            const recorded = history[i]!;
            const expected = expectedMovements[i]!;
            expect(recorded.type).toBe(expected.type);
            expect(recorded.quantity).toBe(expected.quantity);
            expect(recorded.productId).toBe(product.id);
          }
        }),
        { numRuns: 100 },
      );
    });
  });

  describe('Property 8: Baixa que zera estoque torna produto indisponível', () => {
    /**
     * Validates: Requirements 3.6
     *
     * For any product with balance S > 0, withdrawing exactly S units
     * must result in product.available = false.
     */
    it('for any product with balance S > 0, withdrawing exactly S makes product unavailable', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 500 }),
          reasonArb,
          async (initialStock, reason) => {
            // Arrange
            const inventoryRepo = new InMemoryInventoryRepository();
            const productRepo = new InMemoryProductRepository();
            const product = createTestProduct();
            productRepo.addProduct(product);

            const entryUseCase = new RegisterEntryUseCase(inventoryRepo as any, productRepo);
            const withdrawalUseCase = new RegisterWithdrawalUseCase(inventoryRepo as any, productRepo);

            // Act — register entry to set initial stock
            await entryUseCase.execute({ productId: product.id, quantity: initialStock });

            // Verify product is available before withdrawal
            expect(product.available).toBe(true);

            // Act — withdraw exactly the full balance
            await withdrawalUseCase.execute({
              productId: product.id,
              quantity: initialStock,
              reason,
            });

            // Assert — product must be unavailable
            const updatedProduct = await productRepo.findById(product.id);
            expect(updatedProduct!.available).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('for any product with balance S > 0, partial withdrawal (< S) keeps product available', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 2, max: 500 }),
          reasonArb,
          async (initialStock, reason) => {
            // Arrange
            const inventoryRepo = new InMemoryInventoryRepository();
            const productRepo = new InMemoryProductRepository();
            const product = createTestProduct();
            productRepo.addProduct(product);

            const entryUseCase = new RegisterEntryUseCase(inventoryRepo as any, productRepo);
            const withdrawalUseCase = new RegisterWithdrawalUseCase(inventoryRepo as any, productRepo);

            // Act — register entry
            await entryUseCase.execute({ productId: product.id, quantity: initialStock });

            // Act — partial withdrawal (always less than full balance)
            const partialQty = Math.max(1, Math.floor(initialStock / 2));
            await withdrawalUseCase.execute({
              productId: product.id,
              quantity: partialQty,
              reason,
            });

            // Assert — product must remain available
            const updatedProduct = await productRepo.findById(product.id);
            expect(updatedProduct!.available).toBe(true);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
