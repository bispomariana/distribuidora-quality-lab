import * as fc from 'fast-check';
import {
  Product,
  CreateProductProps,
} from '@modules/product/domain/aggregates/product.aggregate';
import { CreateProductUseCase } from '@modules/product/application/use-cases/create-product.use-case';
import { UpdateProductUseCase } from '@modules/product/application/use-cases/update-product.use-case';
import { DeleteProductUseCase } from '@modules/product/application/use-cases/delete-product.use-case';
import { ProductRepository } from '@modules/product/domain/repositories/product.repository';
import { ValidationException, NotFoundException } from '@shared/domain/exceptions';
import { v4 as uuidv4 } from 'uuid';

/**
 * In-memory repository fake for use-case level property tests.
 * No mocks — a functional in-memory implementation.
 */
class InMemoryProductRepository implements ProductRepository {
  private store = new Map<string, Product>();

  async findById(id: string): Promise<Product | null> {
    return this.store.get(id) ?? null;
  }

  async save(entity: Product): Promise<void> {
  if (!entity.id) {
    entity.assignId(uuidv4());
  }
  this.store.set(entity.id, entity);
}

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  async findAll(): Promise<Product[]> {
    return Array.from(this.store.values());
  }

  clear(): void {
    this.store.clear();
  }
}

// --- Generators ---

const validNameArb = fc.string({ minLength: 1, maxLength: 150 }).filter((s) => s.trim().length > 0);
const validCategoryArb = fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0);
const validPriceArb = fc.double({ min: 0.01, max: 999999.99, noNaN: true });
const validDescriptionArb = fc.string({ minLength: 0, maxLength: 500 });

const validProductPropsArb: fc.Arbitrary<CreateProductProps> = fc.record({
  name: validNameArb,
  description: validDescriptionArb,
  unitPrice: validPriceArb,
  category: validCategoryArb,
});

// --- Property Tests ---

describe('Property Tests — Product Module', () => {
  describe('Property 1: Round-trip de criação de Produto', () => {
    /**
     * Validates: Requirements 1.1, 1.7
     *
     * For any valid product data (name 1-150 chars, price 0.01-999999.99,
     * category 1-100 chars), creating the product and reading it back via
     * the use case returns exactly the same data.
     */
    it('for any valid product data, create then query by ID returns same data', async () => {
      await fc.assert(
        fc.asyncProperty(validProductPropsArb, async (props) => {
          // Arrange
          const repository = new InMemoryProductRepository();
          const createUseCase = new CreateProductUseCase(repository);

          // Act — create and then retrieve
          const output = await createUseCase.execute(props);
          const stored = await repository.findById(output.id);

          // Assert — round-trip preserves data
          expect(stored).not.toBeNull();
          expect(stored!.name).toBe(props.name);
          expect(stored!.unitPrice).toBe(props.unitPrice);
          expect(stored!.category).toBe(props.category);
          expect(stored!.description).toBe(props.description ?? '');
          expect(stored!.available).toBe(true);

          // Output also matches
          expect(output.name).toBe(props.name);
          expect(output.unitPrice).toBe(props.unitPrice);
          expect(output.category).toBe(props.category);
        }),
        { numRuns: 100 },
      );
    });
  });

  describe('Property 2: Rejeição de dados inválidos de Produto', () => {
    /**
     * Validates: Requirements 1.5
     *
     * For any invalid data that violates constraints (empty name, name > 150,
     * price < 0.01, price > 999999.99, empty category, category > 100),
     * creation should throw a ValidationException.
     */

    const invalidNameArb = fc.oneof(
      fc.constant(''),
      fc.constant('   '),
      fc.string({ minLength: 151, maxLength: 200 }),
    );

    const invalidPriceArb = fc.oneof(
      fc.double({ min: -1000, max: 0.009, noNaN: true }),
      fc.double({ min: 1000000, max: 9999999, noNaN: true }),
    );

    const invalidCategoryArb = fc.oneof(
      fc.constant(''),
      fc.constant('   '),
      fc.string({ minLength: 101, maxLength: 200 }),
    );

    it('when name is invalid, creation throws ValidationException', () => {
      fc.assert(
        fc.property(
          invalidNameArb,
          validPriceArb,
          validCategoryArb,
          (name, price, category) => {
            expect(() =>
              Product.create({
                name,
                unitPrice: price,
                category,
              }),
            ).toThrow(ValidationException);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('when price is invalid, creation throws ValidationException', () => {
      fc.assert(
        fc.property(
          validNameArb,
          invalidPriceArb,
          validCategoryArb,
          (name, price, category) => {
            expect(() =>
              Product.create({
                name,
                unitPrice: price,
                category,
              }),
            ).toThrow(ValidationException);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('when category is invalid, creation throws ValidationException', () => {
      fc.assert(
        fc.property(
          validNameArb,
          validPriceArb,
          invalidCategoryArb,
          (name, price, category) => {
            expect(() =>
              Product.create({
                name,
                unitPrice: price,
                category,
              }),
            ).toThrow(ValidationException);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('Property 3: Recurso inexistente retorna 404 (módulo Produto)', () => {
    /**
     * Validates: Requirements 1.6
     *
     * For any random UUID that does not correspond to an existing resource,
     * update and delete operations throw NotFoundException.
     */
    const randomUuidArb = fc.uuid();

    it('when product does not exist, update throws NotFoundException', () => {
      fc.assert(
        fc.asyncProperty(randomUuidArb, async (id) => {
          // Arrange — empty repository (no products exist)
          const repository = new InMemoryProductRepository();
          const updateUseCase = new UpdateProductUseCase(repository);

          // Act & Assert
          await expect(
            updateUseCase.execute(id, { name: 'Any Name' }),
          ).rejects.toThrow(NotFoundException);
        }),
        { numRuns: 100 },
      );
    });

    it('when product does not exist, delete throws NotFoundException', () => {
      fc.assert(
        fc.asyncProperty(randomUuidArb, async (id) => {
          // Arrange — empty repository (no products exist)
          const repository = new InMemoryProductRepository();
          const deleteUseCase = new DeleteProductUseCase(repository);

          // Act & Assert
          await expect(deleteUseCase.execute(id)).rejects.toThrow(
            NotFoundException,
          );
        }),
        { numRuns: 100 },
      );
    });
  });
});
