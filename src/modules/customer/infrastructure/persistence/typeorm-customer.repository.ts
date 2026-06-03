import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepo } from 'typeorm';
import { CustomerEntity } from '../../domain/entities/customer.entity';
import { CustomerRepository } from '../../domain/repositories/customer.repository';

@Injectable()
export class TypeOrmCustomerRepository implements CustomerRepository {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly ormRepository: TypeOrmRepo<CustomerEntity>,
  ) {}

  async findById(id: string): Promise<CustomerEntity | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.ormRepository.findOneBy({ _id: id } as any);
  }

  async findByEmail(email: string): Promise<CustomerEntity | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.ormRepository.findOneBy({ _email: email } as any);
  }

  async findAll(): Promise<CustomerEntity[]> {
    return this.ormRepository.find();
  }

  async save(customer: CustomerEntity): Promise<CustomerEntity> {
    return this.ormRepository.save(customer);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }
}
