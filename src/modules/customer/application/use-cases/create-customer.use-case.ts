import { Injectable, Inject } from '@nestjs/common';
import { CustomerEntity } from '../../domain/entities/customer.entity';
import {
  CustomerRepository,
  CUSTOMER_REPOSITORY,
} from '../../domain/repositories/customer.repository';
import { ValidateDocumentUseCase } from '../../domain/validate-document.use-case';
import { ConflictException } from '@shared/domain/exceptions';

export interface CreateCustomerInput {
  name: string;
  document: string;
  email: string;
  phone: string;
}

export interface CreateCustomerOutput {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  createdAt: Date;
}

@Injectable()
export class CreateCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
    private readonly validateDocumentUseCase: ValidateDocumentUseCase,
  ) {}

  async execute(input: CreateCustomerInput): Promise<CreateCustomerOutput> {
    this.validateDocumentUseCase.execute({ document: input.document });

    const existingCustomer = await this.customerRepository.findByEmail(input.email);

    if (existingCustomer) {
      throw new ConflictException('Email already in use', {
        email: input.email,
      });
    }

    const customer = CustomerEntity.create({
      name: input.name,
      document: input.document,
      email: input.email,
      phone: input.phone,
    });

    const saved = await this.customerRepository.save(customer);

    return {
      id: saved.id,
      name: saved.name,
      document: saved.document,
      email: saved.email,
      phone: saved.phone,
      createdAt: saved.createdAt,
    };
  }
}
