import { CustomerEntity } from '../entities/customer.entity';

export interface CustomerRepository {
  findById(id: string): Promise<CustomerEntity | null>;
  findByEmail(email: string): Promise<CustomerEntity | null>;
  findAll(): Promise<CustomerEntity[]>;
  save(customer: CustomerEntity): Promise<CustomerEntity>;
  delete(id: string): Promise<void>;
}

export const CUSTOMER_REPOSITORY = Symbol('CustomerRepository');
