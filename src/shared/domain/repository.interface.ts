import { AggregateRoot } from './aggregate-root';

export interface Repository<T extends AggregateRoot> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<void>;
  delete(id: string): Promise<void>;
}
