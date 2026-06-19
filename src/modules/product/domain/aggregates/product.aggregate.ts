import { AggregateRoot } from '@shared/domain/aggregate-root';
import { ValidationException } from '@shared/domain/exceptions';
import { ProductPrice } from '../value-objects/product-price.vo';

export interface CreateProductProps {
  name: string;
  description?: string;
  unitPrice: number;
  category: string;
}

export interface UpdateProductProps {
  name?: string;
  description?: string;
  unitPrice?: number;
  category?: string;
}

export interface ReconstituteProductProps {
  id: string;
  name: string;
  description: string;
  unitPrice: number;
  category: string;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Product extends AggregateRoot {
  private _id: string;
  private _name: string;
  private _description: string;
  private _unitPrice: number;
  private _category: string;
  private _available: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get unitPrice(): number {
    return this._unitPrice;
  }

  get category(): string {
    return this._category;
  }

  get available(): boolean {
    return this._available;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  static create(props: CreateProductProps): Product {
    Product.validateName(props.name);
    Product.validateCategory(props.category);
    const price = ProductPrice.create(props.unitPrice);

    const product = new Product();
    product._name = props.name;
    product._description = props.description ?? '';
    product._unitPrice = price.value;
    product._category = props.category;
    product._available = true;

    return product;
  }

  static reconstitute(props: ReconstituteProductProps): Product {
    const product = new Product();
    product._id = props.id;
    product._name = props.name;
    product._description = props.description;
    product._unitPrice = props.unitPrice;
    product._category = props.category;
    product._available = props.available;
    product._createdAt = props.createdAt;
    product._updatedAt = props.updatedAt;
    return product;
  }

  assignId(id: string): void {
    if (this._id) {
      throw new ValidationException('Product already has an id assigned', {
        id: ['cannot reassign id of an existing product'],
      });
    }
    this._id = id;
  }

  update(props: UpdateProductProps): void {
    if (props.name !== undefined) {
      Product.validateName(props.name);
      this._name = props.name;
    }

    if (props.description !== undefined) {
      this._description = props.description;
    }

    if (props.unitPrice !== undefined) {
      const price = ProductPrice.create(props.unitPrice);
      this._unitPrice = price.value;
    }

    if (props.category !== undefined) {
      Product.validateCategory(props.category);
      this._category = props.category;
    }
  }

  markAsUnavailable(): void {
    this._available = false;
  }

  markAsAvailable(): void {
    this._available = true;
  }

  private static validateName(name: string): void {
    if (!name || name.trim().length === 0 || name.length > 150) {
      throw new ValidationException('Invalid product name', {
        name: ['name must be between 1 and 150 characters'],
      });
    }
  }

  private static validateCategory(category: string): void {
    if (!category || category.trim().length === 0 || category.length > 100) {
      throw new ValidationException('Invalid product category', {
        category: ['category must be between 1 and 100 characters'],
      });
    }
  }
}
