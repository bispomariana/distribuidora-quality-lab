import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateCustomerUseCase } from '../../application/use-cases/create-customer.use-case';
import { ListCustomersUseCase } from '../../application/use-cases/list-customers.use-case';
import { GetCustomerUseCase } from '../../application/use-cases/get-customer.use-case';
import { UpdateCustomerUseCase } from '../../application/use-cases/update-customer.use-case';
import { DeleteCustomerUseCase } from '../../application/use-cases/delete-customer.use-case';
import { CreateCustomerDto } from '../dtos/create-customer.dto';
import { UpdateCustomerDto } from '../dtos/update-customer.dto';

@ApiTags('customers')
@Controller('customers')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class CustomerController {
  constructor(
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly listCustomersUseCase: ListCustomersUseCase,
    private readonly getCustomerUseCase: GetCustomerUseCase,
    private readonly updateCustomerUseCase: UpdateCustomerUseCase,
    private readonly deleteCustomerUseCase: DeleteCustomerUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Validation error (invalid CPF/CNPJ, name, email, or phone)',
  })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async create(@Body() dto: CreateCustomerDto) {
    return this.createCustomerUseCase.execute({
      name: dto.name,
      document: dto.document,
      email: dto.email,
      phone: dto.phone,
    });
  }

  @Get()
  @ApiOperation({ summary: 'List all customers' })
  @ApiResponse({ status: 200, description: 'Customers listed successfully' })
  async findAll() {
    return this.listCustomersUseCase.execute();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiResponse({ status: 200, description: 'Customer found' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.getCustomerUseCase.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a customer' })
  @ApiResponse({ status: 200, description: 'Customer updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateCustomerDto) {
    return this.updateCustomerUseCase.execute(id, {
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a customer' })
  @ApiResponse({ status: 204, description: 'Customer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.deleteCustomerUseCase.execute(id);
  }
}
