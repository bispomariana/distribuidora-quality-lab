import { IsUUID, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ description: 'Customer ID (UUID)' })
  @IsUUID('4', { message: 'customerId must be a valid UUID' })
  @IsNotEmpty({ message: 'customerId is required' })
  customerId: string;

  @ApiPropertyOptional({ description: 'Payment type ID (UUID)' })
  @IsOptional()
  @IsUUID('4', { message: 'paymentTypeId must be a valid UUID' })
  paymentTypeId?: string;
}
