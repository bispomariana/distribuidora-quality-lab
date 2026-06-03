import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Inject,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreatePaymentTypeUseCase } from '../../application/use-cases/create-payment-type.use-case';
import { ListActivePaymentTypesUseCase } from '../../application/use-cases/list-active-payment-types.use-case';
import { AddAcceptanceRuleUseCase } from '../../application/use-cases/add-acceptance-rule.use-case';
import {
  PaymentTypeRepository,
  PAYMENT_TYPE_REPOSITORY,
} from '../../domain/repositories/payment-type.repository';
import { NotFoundException } from '@shared/domain/exceptions';
import { CreatePaymentTypeDto } from '../dtos/create-payment-type.dto';
import { UpdatePaymentTypeDto } from '../dtos/update-payment-type.dto';
import { AddAcceptanceRuleDto } from '../dtos/add-acceptance-rule.dto';

@ApiTags('payment-types')
@Controller('payment-types')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class PaymentTypeController {
  constructor(
    private readonly createPaymentTypeUseCase: CreatePaymentTypeUseCase,
    private readonly listActivePaymentTypesUseCase: ListActivePaymentTypesUseCase,
    private readonly addAcceptanceRuleUseCase: AddAcceptanceRuleUseCase,
    @Inject(PAYMENT_TYPE_REPOSITORY)
    private readonly paymentTypeRepository: PaymentTypeRepository,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new payment type' })
  @ApiResponse({ status: 201, description: 'Payment type created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() dto: CreatePaymentTypeDto) {
    return this.createPaymentTypeUseCase.execute({
      name: dto.name,
      description: dto.description,
    });
  }

  @Get()
  @ApiOperation({ summary: 'List all active payment types' })
  @ApiResponse({ status: 200, description: 'Active payment types listed successfully' })
  async findAll() {
    return this.listActivePaymentTypesUseCase.execute();
  }

  @Post(':id/rules')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add an acceptance rule to a payment type' })
  @ApiResponse({ status: 201, description: 'Acceptance rule added successfully' })
  @ApiResponse({ status: 400, description: 'Validation error (min > max)' })
  @ApiResponse({ status: 404, description: 'Payment type not found' })
  async addRule(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: AddAcceptanceRuleDto) {
    return this.addAcceptanceRuleUseCase.execute({
      paymentTypeId: id,
      minValue: dto.minValue,
      maxValue: dto.maxValue,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a payment type' })
  @ApiResponse({ status: 200, description: 'Payment type updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Payment type not found' })
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdatePaymentTypeDto) {
    const paymentType = await this.paymentTypeRepository.findById(id);

    if (!paymentType) {
      throw new NotFoundException('Payment type not found', { paymentTypeId: id });
    }

    paymentType.update({
      name: dto.name,
      description: dto.description,
      active: dto.active,
    });

    const saved = await this.paymentTypeRepository.save(paymentType);

    return {
      id: saved.id,
      name: saved.name,
      description: saved.description,
      active: saved.active,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
